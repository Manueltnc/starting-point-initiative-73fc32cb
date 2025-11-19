import { useState, useCallback } from 'react'
import type { UnifiedApiClient } from '@/lib/api-client'
import type { MathProblem, MathSessionState } from '@/types'
import { calculateSessionMetrics } from '@/lib/session-analytics'
import { getPlacementQuestionCount } from '@/lib/config'
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
      
      // Generate placement test problems - ONLY 2-9 times tables (no 1x, 0x, 10+)
      // This prevents issues like "4 x 1" appearing in placement tests
      const problems = generateMathProblems([2, 9], [2, 9], totalQuestions * 2) // Generate extra for deduplication
      
      // Deduplicate problems to ensure no repeats
      const seenProblems = new Set<string>()
      const uniqueProblems: MathProblem[] = []
      
      for (const problem of problems) {
        const problemKey = `${problem.multiplicand}×${problem.multiplier}`
        // Also check the commutative version (e.g., 4×8 is same as 8×4)
        const commutativeKey = `${problem.multiplier}×${problem.multiplicand}`
        
        if (!seenProblems.has(problemKey) && !seenProblems.has(commutativeKey)) {
          seenProblems.add(problemKey)
          seenProblems.add(commutativeKey)
          uniqueProblems.push(problem)
        }
        
        // Stop when we have enough unique problems
        if (uniqueProblems.length >= totalQuestions) break
      }
      
      // Shuffle the unique problems
      const finalProblems = uniqueProblems.sort(() => Math.random() - 0.5).slice(0, totalQuestions)

      const { sessionId } = await apiClient.createSession(
        'math',
        email,
        gradeLevel,
        { sessionType: 'placement', problems: finalProblems }
      )

      const newSession = {
        sessionId,
        sessionType: 'placement' as const,
        currentProblemIndex: 0,
        problemQueue: finalProblems,
        incorrectProblems: [],
        gridUpdates: []
      }

      setSessionState(newSession)

      // Persist new session to localStorage for recovery
      const { saveSession } = await import('@/lib/session-storage')
      saveSession({
        ...newSession,
        startTime: Date.now(),
        lastActivity: Date.now(),
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

      if (finalProblemQueue.length === 0) {
        throw new Error('No problems available for practice. Please complete the placement test first.')
      }

      const { sessionId } = await apiClient.createSession(
        'math',
        email,
        gradeLevel,
        { sessionType: 'practice', problems: finalProblemQueue }
      )

      const newSession = {
        sessionId,
        sessionType: 'practice' as const,
        currentProblemIndex: 0,
        problemQueue: finalProblemQueue,
        incorrectProblems: [],
        gridUpdates: []
      }

      setSessionState(newSession)

      // Persist new session to localStorage for recovery
      const { saveSession } = await import('@/lib/session-storage')
      saveSession({
        ...newSession,
        startTime: Date.now(),
        lastActivity: Date.now(),
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
      // Update final session state with completed items and total items
      const metrics = calculateSessionMetrics(sessionState)
      await apiClient.updateSession(sessionState.sessionId, {
        ...metrics,
        duration: 0, // This would be calculated from the actual session duration
        completed_items: sessionState.problemQueue.length, // All problems completed
        total_items: sessionState.problemQueue.length // Total problems in the session
      })

      // Mark session as completed
      await apiClient.completeSession(sessionState.sessionId)

      // Always update math grid progress with gridUpdates
      if (sessionState.gridUpdates.length > 0 && identity) {
        await apiClient.updateMathGrid(
          identity.id,
          sessionState.gridUpdates
        )
      }

      // Clear persisted session from localStorage
      const { clearSession } = await import('@/lib/session-storage')
      clearSession()
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

