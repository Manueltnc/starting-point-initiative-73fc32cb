import { useState, useCallback } from 'react'
import type { UnifiedApiClient } from '@/lib/api-client'
import type { MathProblem, MathSessionState } from '@/types'
import { calculateSessionMetrics } from '@/lib/session-analytics'
import { getPlacementQuestionCount, PLACEMENT_CONFIG } from '@/lib/config'
import { generateMathProblems, getDifficultyBand } from '@/lib/problem-generator'

interface UseSessionStateOptions {
  apiClient: UnifiedApiClient
  identity: { id: string } | null
}

/**
 * Hook for core session state management and CRUD operations
 */
export function useSessionState({ apiClient, identity }: UseSessionStateOptions) {
  const [sessionState, setSessionState] = useState<MathSessionState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateSessionState = useCallback((updater: (prev: MathSessionState | null) => MathSessionState | null) => {
    setSessionState(updater)
  }, [])

  const startPlacementTest = useCallback(async (email: string, gradeLevel: string) => {
    setLoading(true)
    setError(null)

    try {
      // Get question count from config
      const totalQuestions = getPlacementQuestionCount(gradeLevel)
      const basicCount = Math.floor(totalQuestions * PLACEMENT_CONFIG.distribution.basic)
      const advancedCount = totalQuestions - basicCount
      
      // Generate placement test problems (90% from 1-9, 10% from 9-12)
      const problems1to9 = generateMathProblems([1, 9], [1, 9], basicCount)
      const problems9to12 = generateMathProblems([9, 12], [9, 12], advancedCount)
      const allProblems = [...problems1to9, ...problems9to12]
      
      // Deduplicate problems (ranges overlap at 9, so duplicates are possible)
      const seenProblems = new Set<string>()
      const uniqueProblems: MathProblem[] = []
      for (const problem of allProblems) {
        const problemKey = `${problem.multiplicand}×${problem.multiplier}`
        if (!seenProblems.has(problemKey)) {
          seenProblems.add(problemKey)
          uniqueProblems.push(problem)
        }
      }
      
      // If we lost problems due to deduplication, we need to generate more
      // But first, shuffle what we have
      const shuffledProblems = uniqueProblems.sort(() => Math.random() - 0.5)
      
      // If we don't have enough unique problems, generate more from the full range
      if (shuffledProblems.length < totalQuestions) {
        const additionalNeeded = totalQuestions - shuffledProblems.length
        const additionalProblems = generateMathProblems([1, 12], [1, 12], additionalNeeded)
        
        // Deduplicate additional problems against what we already have
        for (const problem of additionalProblems) {
          if (shuffledProblems.length >= totalQuestions) break
          const problemKey = `${problem.multiplicand}×${problem.multiplier}`
          if (!seenProblems.has(problemKey)) {
            seenProblems.add(problemKey)
            shuffledProblems.push(problem)
          }
        }
        
        // Final shuffle to mix in the additional problems
        shuffledProblems.sort(() => Math.random() - 0.5)
      }
      
      // Trim to exact count needed
      const finalProblems = shuffledProblems.slice(0, totalQuestions)

      const { sessionId } = await apiClient.createSession(
        'math',
        email,
        gradeLevel,
        { sessionType: 'placement', problems: finalProblems }
      )

      setSessionState({
        sessionId,
        sessionType: 'placement',
        currentProblemIndex: 0,
        problemQueue: finalProblems,
        incorrectProblems: [],
        gridUpdates: []
      })

      return { sessionId, problems: finalProblems }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start placement test')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiClient, setSessionState, setLoading, setError])

  const startPracticeSession = useCallback(async (email: string, gradeLevel: string) => {
    setLoading(true)
    setError(null)

    try {
      // Get student's math progress to determine which problems to practice
      const mathProgress = await apiClient.getMathProgress(email, gradeLevel)
      
      // Group unmastered problems by difficulty band
      const problemsByDifficulty: {
        basic: MathProblem[]
        intermediate: MathProblem[]
        advanced: MathProblem[]
      } = {
        basic: [],
        intermediate: [],
        advanced: []
      }

      for (let row = 0; row < mathProgress.gridState.length; row++) {
        for (let col = 0; col < mathProgress.gridState[row].length; col++) {
          const cell = mathProgress.gridState[row][col]
          if (!cell.isLocked && cell.consecutiveCorrect < 3) {
            const problem: MathProblem = {
              id: `problem-${cell.multiplicand}-${cell.multiplier}`,
              multiplicand: cell.multiplicand,
              multiplier: cell.multiplier,
              answer: cell.multiplicand * cell.multiplier,
              difficulty: getDifficultyBand(cell.multiplicand, cell.multiplier)
            }

            // Add to appropriate difficulty band
            problemsByDifficulty[problem.difficulty].push(problem)
          }
        }
      }

      // Create adaptive problem queue
      // Start with easier problems (basic), include some intermediate, fewer advanced
      const adaptiveProblemQueue: MathProblem[] = []

      // Shuffle each difficulty band to ensure variety
      const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
      }

      const shuffledBasic = shuffleArray(problemsByDifficulty.basic)
      const shuffledIntermediate = shuffleArray(problemsByDifficulty.intermediate)
      const shuffledAdvanced = shuffleArray(problemsByDifficulty.advanced)

      // Adaptive distribution: 50% basic, 35% intermediate, 15% advanced (or based on availability)
      const totalProblems = Math.min(30, shuffledBasic.length + shuffledIntermediate.length + shuffledAdvanced.length)
      const basicCount = Math.min(Math.floor(totalProblems * 0.5), shuffledBasic.length)
      const intermediateCount = Math.min(Math.floor(totalProblems * 0.35), shuffledIntermediate.length)
      const advancedCount = Math.min(Math.floor(totalProblems * 0.15), shuffledAdvanced.length)

      // Add problems to queue
      adaptiveProblemQueue.push(...shuffledBasic.slice(0, basicCount))
      adaptiveProblemQueue.push(...shuffledIntermediate.slice(0, intermediateCount))
      adaptiveProblemQueue.push(...shuffledAdvanced.slice(0, advancedCount))

      // Deduplicate problems (shouldn't happen, but safety check)
      const seenProblems = new Set<string>()
      const uniqueProblems: MathProblem[] = []
      for (const problem of adaptiveProblemQueue) {
        const problemKey = `${problem.multiplicand}×${problem.multiplier}`
        if (!seenProblems.has(problemKey)) {
          seenProblems.add(problemKey)
          uniqueProblems.push(problem)
        }
      }

      // Final shuffle to mix difficulty levels during practice
      const finalProblemQueue = shuffleArray(uniqueProblems)

      const { sessionId } = await apiClient.createSession(
        'math',
        email,
        gradeLevel,
        { sessionType: 'practice', problems: finalProblemQueue }
      )

      setSessionState({
        sessionId,
        sessionType: 'practice',
        currentProblemIndex: 0,
        problemQueue: finalProblemQueue,
        incorrectProblems: [],
        gridUpdates: []
      })

      return { sessionId, problems: finalProblemQueue }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start practice session')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiClient, setSessionState, setLoading, setError])

  const completeSession = useCallback(async () => {
    if (!sessionState) return

    try {
      // Update final session state
      const metrics = calculateSessionMetrics(sessionState)
      await apiClient.updateSession(sessionState.sessionId, {
        ...metrics,
        duration: 0 // This would be calculated from the actual session duration
      })

      // Mark session as completed
      await apiClient.completeSession(sessionState.sessionId)

      // Only update math grid progress for practice sessions, NOT placement tests
      if (sessionState.sessionType === 'practice' && sessionState.gridUpdates.length > 0) {
        // Get current identity for correct studentId
        if (identity) {
          await apiClient.updateMathGrid(
            identity.id, // Use correct studentId, not sessionId
            sessionState.gridUpdates
          )
        }
      }
    } catch (err) {
      console.error('Failed to complete session:', err)
    }

    setSessionState(null)
  }, [sessionState, apiClient, identity, setSessionState])

  return {
    sessionState,
    setSessionState,
    updateSessionState,
    loading,
    setLoading,
    error,
    setError,
    startPlacementTest,
    startPracticeSession,
    completeSession
  }
}

