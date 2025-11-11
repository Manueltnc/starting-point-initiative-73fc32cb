import { useMemo } from 'react'
import { calculateSessionMetrics, updateGridCell, calculateAccuracy } from '@/lib/session-analytics'
import type { MathGridCell, MathProblem, MathSessionState } from '@/types'

/**
 * Hook for session analytics calculations
 */
export function useSessionAnalytics() {
  const calculateMetrics = useMemo(
    () => (sessionState: MathSessionState | null) => {
      if (!sessionState) {
        return {
          itemsAttempted: 0,
          itemsCorrect: 0,
          accuracy: 0,
          averageTimePerQuestion: 0,
          fastAnswersCount: 0,
          mediumAnswersCount: 0,
          slowAnswersCount: 0
        }
      }
      return calculateSessionMetrics(sessionState)
    },
    []
  )

  const updateCell = useMemo(
    () => (
      existingUpdate: MathGridCell | undefined,
      problem: MathProblem,
      answer: number,
      timeSpent: number,
      isCorrect: boolean
    ) => {
      return updateGridCell(existingUpdate, problem, answer, timeSpent, isCorrect)
    },
    []
  )

  return {
    calculateSessionMetrics: calculateMetrics,
    updateGridCell: updateCell,
    calculateAccuracy
  }
}

