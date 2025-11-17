import { classifyTime } from '@/lib/config'
import type { MathGridCell, MathProblem, MathSessionState } from '@/types'

/**
 * Calculate accuracy percentage from correct and total counts
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

/**
 * Calculate all session metrics from session state
 */
export function calculateSessionMetrics(sessionState: MathSessionState) {
  const gridUpdates = sessionState.gridUpdates
  const itemsCorrect = gridUpdates.filter(g => g.lastAttemptCorrect).length
  const itemsAttempted = sessionState.currentProblemIndex
  
  const accuracy = calculateAccuracy(itemsCorrect, itemsAttempted)
  
  const averageTimePerQuestion = gridUpdates.length > 0
    ? gridUpdates.reduce((sum, g) => sum + g.averageTimeSeconds, 0) / gridUpdates.length
    : 0
  
  const fastAnswersCount = gridUpdates.filter(g => g.lastAttemptTimeClassification === 'fast').length
  const mediumAnswersCount = gridUpdates.filter(g => g.lastAttemptTimeClassification === 'medium').length
  const slowAnswersCount = gridUpdates.filter(g => g.lastAttemptTimeClassification === 'slow').length
  
  return {
    itemsAttempted,
    itemsCorrect,
    accuracy,
    averageTimePerQuestion,
    fastAnswersCount,
    mediumAnswersCount,
    slowAnswersCount
  }
}

/**
 * Update a grid cell with new attempt data
 */
export function updateGridCell(
  existingUpdate: MathGridCell | undefined,
  problem: MathProblem,
  _answer: number,
  timeSpent: number,
  isCorrect: boolean
): MathGridCell {
  const newConsecutiveCorrect = isCorrect
    ? (existingUpdate?.consecutiveCorrect || 0) + 1
    : 0
  
  const timeClassification = classifyTime(timeSpent)
  
  return {
    multiplicand: problem.multiplicand,
    multiplier: problem.multiplier,
    consecutiveCorrect: newConsecutiveCorrect,
    lastAttemptCorrect: isCorrect,
    attempts: (existingUpdate?.attempts || 0) + 1,
    isLocked: false,
    averageTimeSeconds: existingUpdate
      ? (existingUpdate.averageTimeSeconds * existingUpdate.attempts + timeSpent) / (existingUpdate.attempts + 1)
      : timeSpent,
    totalTimeSpent: (existingUpdate?.totalTimeSpent || 0) + timeSpent,
    lastAttemptTimeClassification: timeClassification,
    masteryAchievedAt: newConsecutiveCorrect === 3 ? new Date() : existingUpdate?.masteryAchievedAt
  }
}

