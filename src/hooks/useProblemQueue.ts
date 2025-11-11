import { useCallback } from 'react'
import type { MathProblem, MathSessionState } from '@/types'

interface UseProblemQueueOptions {
  sessionState: MathSessionState | null
  setSessionState: React.Dispatch<React.SetStateAction<MathSessionState | null>>
}

/**
 * Hook for problem queue management
 */
export function useProblemQueue({ sessionState, setSessionState }: UseProblemQueueOptions) {
  const getCurrentProblem = useCallback(() => {
    if (!sessionState) return null

    // For both practice and placement sessions: get the current problem from the queue
    if (sessionState.currentProblemIndex < sessionState.problemQueue.length) {
      return sessionState.problemQueue[sessionState.currentProblemIndex]
    }

    return null
  }, [sessionState])

  const getNextProblem = useCallback(() => {
    if (!sessionState) return null

    // For practice sessions: use sequential progression (don't prioritize incorrect problems)
    // This ensures we advance after any answer, including wrong ones
    if (sessionState.sessionType === 'practice') {
      const nextIndex = sessionState.currentProblemIndex
      if (nextIndex < sessionState.problemQueue.length) {
        return sessionState.problemQueue[nextIndex]
      }
      return null
    }

    // For placement tests: use sequential progression
    const nextIndex = sessionState.currentProblemIndex
    if (nextIndex < sessionState.problemQueue.length) {
      return sessionState.problemQueue[nextIndex]
    }

    return null
  }, [sessionState])

  const advanceToNextProblem = useCallback(() => {
    if (!sessionState) return

    // For both practice and placement sessions: advance the index
    // This ensures sequential progression through the problem queue
    setSessionState(prev => prev ? {
      ...prev,
      currentProblemIndex: prev.currentProblemIndex + 1
    } : null)
  }, [sessionState, setSessionState])

  const removeIncorrectProblem = useCallback((problem: MathProblem) => {
    if (!sessionState) return

    setSessionState(prev => {
      if (!prev) return null
      
      return {
        ...prev,
        incorrectProblems: prev.incorrectProblems.filter(p => 
          !(p.multiplicand === problem.multiplicand && p.multiplier === problem.multiplier)
        )
      }
    })
  }, [sessionState, setSessionState])

  return {
    getCurrentProblem,
    getNextProblem,
    advanceToNextProblem,
    removeIncorrectProblem
  }
}

