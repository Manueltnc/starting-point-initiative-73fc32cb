import { useCallback } from 'react'
import { useStudentIdentity } from '@/hooks/useStudentIdentity'
import { createApiClient } from '@/lib/api-client'
import { classifyTime, MAX_TIME_PER_QUESTION_SECONDS } from '@/lib/config'
import { useSessionAnalytics } from '@/hooks/useSessionAnalytics'
import { useSessionProgress } from '@/hooks/useSessionProgress'
import { useProblemQueue } from '@/hooks/useProblemQueue'
import { useSessionRecovery } from '@/hooks/useSessionRecovery'
import { useSessionState } from '@/hooks/useSessionState'

const apiClient = createApiClient()

export function useMathSession() {
  const { identity } = useStudentIdentity()
  const { calculateSessionMetrics, updateGridCell, calculateAccuracy } = useSessionAnalytics()
  
  // Setup core session state management
  const {
    sessionState,
    setSessionState,
    updateSessionState,
    loading,
    error,
    startPlacementTest,
    startPracticeSession,
    completeSession
  } = useSessionState({ apiClient, identity })

  // Setup progress tracking and auto-save
  const { saveSessionProgress } = useSessionProgress({ sessionState, apiClient })

  // Setup problem queue management
  const { getCurrentProblem, getNextProblem, advanceToNextProblem, removeIncorrectProblem } = useProblemQueue({
    sessionState,
    setSessionState
  })

  // Setup session recovery
  const { checkForActiveSessions } = useSessionRecovery()

  const submitAnswer = useCallback(async (answer: number, timeSpent: number) => {
    if (!sessionState) return { correct: false }

    // Get the current problem
    const currentProblem = getCurrentProblem()
    
    if (!currentProblem) {
      console.error('No current problem found', {
        sessionType: sessionState.sessionType,
        currentIndex: sessionState.currentProblemIndex,
        queueLength: sessionState.problemQueue.length,
        incorrectCount: sessionState.incorrectProblems.length
      })
      return { correct: false }
    }

    const isCorrect = answer === currentProblem.answer

    // Get current identity for student ID
    if (!identity) throw new Error('User not authenticated')

    // Record detailed question attempt
    // Cap time spent at 3 minutes to prevent database overflow and unrealistic times
    const cappedTimeSpent = Math.min(timeSpent, MAX_TIME_PER_QUESTION_SECONDS)
    
    try {
      const timeClassification = classifyTime(cappedTimeSpent)
      await apiClient.recordQuestionAttempt(
        sessionState.sessionId,
        identity.id,
        currentProblem.multiplicand,
        currentProblem.multiplier,
        answer,
        currentProblem.answer,
        isCorrect,
        cappedTimeSpent,
        sessionState.currentProblemIndex + 1,
        timeClassification
      )
    } catch (err) {
      console.error('Failed to record question attempt:', err)
    }

    // Find existing grid update for this problem
    const existingUpdate = sessionState.gridUpdates.find(g => 
      g.multiplicand === currentProblem.multiplicand && 
      g.multiplier === currentProblem.multiplier
    )

    // Update grid progress with enhanced analytics
    // Use capped time for grid updates as well
    const gridUpdate = updateGridCell(
      existingUpdate,
      currentProblem,
      answer,
      cappedTimeSpent,
      isCorrect
    )

    const updatedGridUpdates = sessionState.gridUpdates.filter(g => 
      !(g.multiplicand === currentProblem.multiplicand && g.multiplier === currentProblem.multiplier)
    )
    updatedGridUpdates.push(gridUpdate)

    // Update session state
    updateSessionState(prev => {
      if (!prev) return null

      // For practice sessions: add incorrect problems to retry queue
      // For placement tests: skip incorrect problems (don't re-queue)
      const newIncorrectProblems = (!isCorrect && prev.sessionType === 'practice') ? 
        [...prev.incorrectProblems, currentProblem] : 
        prev.incorrectProblems

      return {
        ...prev,
        // Don't increment index here - let getNextProblem handle it
        gridUpdates: updatedGridUpdates,
        incorrectProblems: newIncorrectProblems
      }
    })

    // Calculate session analytics using updated grid updates
    const tempSessionState = {
      ...sessionState,
      gridUpdates: updatedGridUpdates
    }
    const metrics = calculateSessionMetrics(tempSessionState)

    // Update session in database with enhanced analytics
    // Use capped time for session duration update
    try {
      await apiClient.updateSession(sessionState.sessionId, {
        ...metrics,
        duration: cappedTimeSpent
      })
    } catch (err) {
      console.error('Failed to update session:', err)
    }

    return { correct: isCorrect }
  }, [sessionState, identity, updateGridCell, calculateSessionMetrics, getCurrentProblem, updateSessionState])


  return {
    sessionState,
    loading,
    error,
    startPlacementTest,
    startPracticeSession,
    submitAnswer,
    getNextProblem,
    advanceToNextProblem,
    getCurrentProblem,
    completeSession,
    removeIncorrectProblem,
    saveSessionProgress, // New
    checkForActiveSessions, // New
  }
}


