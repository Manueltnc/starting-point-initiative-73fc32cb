import type { MathGridCell } from '@/types'

export interface MasteryAnalytics {
  totalFacts: number
  masteredFacts: number
  strugglingFacts: Array<{ multiplicand: number; multiplier: number; attempts: number; accuracy: number }>
  recentlyMastered: Array<{ multiplicand: number; multiplier: number; masteryDate: Date }>
  improvementTrend: 'improving' | 'stable' | 'declining'
  recommendedPractice: Array<{ multiplicand: number; multiplier: number; reason: string }>
}

export function calculateMasteryAnalytics(gridState: MathGridCell[][]): MasteryAnalytics {
  const allCells = gridState.flat().filter(cell => !cell.isLocked)
  
  const totalFacts = allCells.length
  const masteredFacts = allCells.filter(cell => cell.consecutiveCorrect >= 3).length
  
  // Find struggling facts (attempted multiple times but not mastered)
  const strugglingFacts = allCells
    .filter(cell => cell.attempts >= 3 && cell.consecutiveCorrect < 3)
    .map(cell => ({
      multiplicand: cell.multiplicand,
      multiplier: cell.multiplier,
      attempts: cell.attempts,
      accuracy: cell.attempts > 0 ? Math.round(((cell.consecutiveCorrect + (cell.lastAttemptCorrect ? 1 : 0)) / cell.attempts) * 100) : 0
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5)
  
  // Find recently mastered facts (within last 7 days)
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentlyMastered = allCells
    .filter(cell => cell.masteryAchievedAt && new Date(cell.masteryAchievedAt) > sevenDaysAgo)
    .map(cell => ({
      multiplicand: cell.multiplicand,
      multiplier: cell.multiplier,
      masteryDate: new Date(cell.masteryAchievedAt!)
    }))
    .sort((a, b) => b.masteryDate.getTime() - a.masteryDate.getTime())
  
  // Simple trend calculation based on recent mastery
  const improvementTrend: 'improving' | 'stable' | 'declining' = 
    recentlyMastered.length >= 3 ? 'improving' :
    recentlyMastered.length >= 1 ? 'stable' :
    'declining'
  
  // Generate practice recommendations
  const recommendedPractice = allCells
    .filter(cell => {
      // Recommend facts that have been attempted but not mastered
      if (cell.attempts > 0 && cell.consecutiveCorrect < 3) return true
      // Recommend facts that haven't been attempted yet
      if (cell.attempts === 0 && !cell.isLocked) return true
      return false
    })
    .map(cell => ({
      multiplicand: cell.multiplicand,
      multiplier: cell.multiplier,
      reason: cell.attempts === 0 ? 'Not yet attempted' :
              cell.lastAttemptCorrect === false ? 'Recent incorrect attempt' :
              cell.consecutiveCorrect === 2 ? 'One away from mastery!' :
              'Needs more practice'
    }))
    .slice(0, 10)
  
  return {
    totalFacts,
    masteredFacts,
    strugglingFacts,
    recentlyMastered,
    improvementTrend,
    recommendedPractice
  }
}

export function getPerformanceTrends(gridState: MathGridCell[][]) {
  const allCells = gridState.flat().filter(cell => !cell.isLocked)
  
  const totalAttempts = allCells.reduce((sum, cell) => sum + cell.attempts, 0)
  const totalCorrect = allCells.filter(cell => cell.lastAttemptCorrect).length
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
  
  const avgTimePerFact = allCells.length > 0
    ? allCells.reduce((sum, cell) => sum + cell.averageTimeSeconds, 0) / allCells.length
    : 0
  
  const fastFacts = allCells.filter(cell => cell.lastAttemptTimeClassification === 'fast').length
  const mediumFacts = allCells.filter(cell => cell.lastAttemptTimeClassification === 'medium').length
  const slowFacts = allCells.filter(cell => cell.lastAttemptTimeClassification === 'slow').length
  
  return {
    overallAccuracy,
    avgTimePerFact: Math.round(avgTimePerFact),
    speedDistribution: {
      fast: fastFacts,
      medium: mediumFacts,
      slow: slowFacts
    }
  }
}
