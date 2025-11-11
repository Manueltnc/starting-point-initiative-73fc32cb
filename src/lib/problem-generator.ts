import type { MathProblem } from '@/types'

/**
 * Calculate difficulty band based on multiplicand and multiplier
 */
export function getDifficultyBand(multiplicand: number, multiplier: number): 'basic' | 'intermediate' | 'advanced' {
  // Calculate difficulty based on the range of factors
  // Basic: 1-5 × 1-5 (25 facts)
  // Intermediate: 6-9 × any, or any × 6-9 (but not both in advanced range) 
  // Advanced: 10-12 × any, or any × 10-12
  
  const maxFactor = Math.max(multiplicand, multiplier)
  
  if (maxFactor <= 5) {
    return 'basic'
  } else if (maxFactor <= 9) {
    return 'intermediate'
  } else {
    return 'advanced'
  }
}

/**
 * Generate math problems within specified ranges
 */
export function generateMathProblems(
  multiplicandRange: [number, number],
  multiplierRange: [number, number],
  count: number
): MathProblem[] {
  const problems: MathProblem[] = []
  const usedProblems = new Set<string>()
  
  // Generate all possible problems in the range
  const allPossibleProblems: MathProblem[] = []
  for (let m = multiplicandRange[0]; m <= multiplicandRange[1]; m++) {
    for (let n = multiplierRange[0]; n <= multiplierRange[1]; n++) {
      allPossibleProblems.push({
        id: `problem-${m}-${n}`,
        multiplicand: m,
        multiplier: n,
        answer: m * n,
        difficulty: getDifficultyBand(m, n)
      })
    }
  }
  
  // Shuffle all possible problems
  const shuffledProblems = allPossibleProblems.sort(() => Math.random() - 0.5)
  
  // Select unique problems up to the requested count
  for (const problem of shuffledProblems) {
    if (problems.length >= count) break
    
    const problemKey = `${problem.multiplicand}×${problem.multiplier}`
    if (!usedProblems.has(problemKey)) {
      usedProblems.add(problemKey)
      problems.push({
        ...problem,
        id: `problem-${problems.length}` // Re-index for consistency
      })
    }
  }
  
  // If we don't have enough unique problems, fill with random ones
  while (problems.length < count) {
    const multiplicand = Math.floor(Math.random() * (multiplicandRange[1] - multiplicandRange[0] + 1)) + multiplicandRange[0]
    const multiplier = Math.floor(Math.random() * (multiplierRange[1] - multiplierRange[0] + 1)) + multiplierRange[0]
    const problemKey = `${multiplicand}×${multiplier}`
    
    if (!usedProblems.has(problemKey)) {
      usedProblems.add(problemKey)
      problems.push({
        id: `problem-${problems.length}`,
        multiplicand,
        multiplier,
        answer: multiplicand * multiplier,
        difficulty: getDifficultyBand(multiplicand, multiplier)
      })
    }
  }
  
  return problems
}

