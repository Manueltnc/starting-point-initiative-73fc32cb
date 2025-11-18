// Grid utility functions for managing math grid state
import type { MathGridCell } from '@/types'
import { validateGridCell } from './grid-validation'

/**
 * Creates an empty 12x12 grid with initial cell values
 */
export function createEmptyGrid(): MathGridCell[][] {
  return Array.from({ length: 12 }, (_, row) =>
    Array.from({ length: 12 }, (_, col) => ({
      multiplicand: row + 1,
      multiplier: col + 1,
      consecutiveCorrect: 0,
      lastAttemptCorrect: false,
      attempts: 0,
      isLocked: false,
      averageTimeSeconds: 0,
      totalTimeSpent: 0
    }))
  )
}

/**
 * Updates a specific cell in the grid, handling commutativity
 * Returns a new grid (immutable update)
 */
export function updateGridCell(
  grid: MathGridCell[][],
  multiplicand: number,
  multiplier: number,
  update: Partial<MathGridCell>
): MathGridCell[][] {
  // Validate inputs
  if (multiplicand < 1 || multiplicand > 12) {
    throw new Error(`Invalid multiplicand: ${multiplicand} (must be 1-12)`)
  }
  if (multiplier < 1 || multiplier > 12) {
    throw new Error(`Invalid multiplier: ${multiplier} (must be 1-12)`)
  }

  // Create a deep copy of the grid
  const newGrid = grid.map(row => [...row])
  const row = multiplicand - 1
  const col = multiplier - 1

  // Apply update to primary cell
  const updatedCell = {
    ...newGrid[row][col],
    ...update
  }

  // Validate the updated cell
  try {
    validateGridCell(updatedCell)
  } catch (error) {
    console.error('Invalid grid cell update:', error)
    throw error
  }

  newGrid[row][col] = updatedCell

  // Apply to commutative cell (unless it's the same cell, e.g., 5×5)
  if (multiplicand !== multiplier) {
    const commutativeCell = {
      ...newGrid[col][row],
      ...update,
      // Swap multiplicand and multiplier for commutative cell
      multiplicand: multiplier,
      multiplier: multiplicand
    }
    newGrid[col][row] = commutativeCell
  }

  return newGrid
}

/**
 * Updates multiple cells in the grid
 * Returns a new grid (immutable update)
 */
export function updateGridCells(
  grid: MathGridCell[][],
  updates: MathGridCell[]
): MathGridCell[][] {
  let newGrid = grid

  updates.forEach(update => {
    try {
      newGrid = updateGridCell(
        newGrid,
        update.multiplicand,
        update.multiplier,
        update
      )
    } catch (error) {
      console.error('Invalid grid update, skipping:', update, error)
    }
  })

  return newGrid
}

/**
 * Gets a specific cell from the grid
 */
export function getGridCell(
  grid: MathGridCell[][],
  multiplicand: number,
  multiplier: number
): MathGridCell {
  if (multiplicand < 1 || multiplicand > 12) {
    throw new Error(`Invalid multiplicand: ${multiplicand}`)
  }
  if (multiplier < 1 || multiplier > 12) {
    throw new Error(`Invalid multiplier: ${multiplier}`)
  }

  return grid[multiplicand - 1][multiplier - 1]
}

/**
 * Calculates appropriate guardrail based on grid mastery
 */
export function calculateGuardrail(grid: MathGridCell[][]): '1-5' | '1-9' | '1-12' {
  // Count mastered facts by range (mastery = 3+ consecutive correct)
  const masteryByRange = {
    '1-5': 0,
    '6-9': 0,
    '10-12': 0
  }

  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 12; j++) {
      const cell = grid[i][j]
      if (cell.consecutiveCorrect >= 3) {
        const max = Math.max(cell.multiplicand, cell.multiplier)
        if (max <= 5) {
          masteryByRange['1-5']++
        } else if (max <= 9) {
          masteryByRange['6-9']++
        } else {
          masteryByRange['10-12']++
        }
      }
    }
  }

  // 80% mastery threshold
  const threshold = 0.8
  const range5Total = 5 * 5 // 25 cells
  const range9Total = 9 * 9 - range5Total // 81 - 25 = 56 cells (6-9 range)
  const range12Total = 12 * 12 - (9 * 9) // 144 - 81 = 63 cells (10-12 range)

  // Check if mastered advanced (10-12)
  if (masteryByRange['10-12'] >= range12Total * threshold) {
    return '1-12'
  }

  // Check if mastered intermediate (6-9)
  if (masteryByRange['6-9'] >= range9Total * threshold) {
    return '1-12' // Move to advanced
  }

  // Check if mastered basics (1-5)
  if (masteryByRange['1-5'] >= range5Total * threshold) {
    return '1-9' // Move to intermediate
  }

  // Default: stay in basics
  return '1-5'
}

/**
 * Migrates old { cells: {...} } format to nested array format
 */
export function migrateFromCellsFormat(cells: Record<string, any>): MathGridCell[][] {
  const grid = createEmptyGrid()

  for (const [key, cell] of Object.entries(cells)) {
    // Parse key like "4x8" into multiplicand and multiplier
    const [m, n] = key.split('x').map(Number)

    if (m >= 1 && m <= 12 && n >= 1 && n <= 12) {
      grid[m - 1][n - 1] = {
        multiplicand: m,
        multiplier: n,
        consecutiveCorrect: cell.consecutiveCorrect || 0,
        lastAttemptCorrect: cell.lastAttemptCorrect || false,
        attempts: cell.attempts || 0,
        isLocked: cell.isLocked || false,
        averageTimeSeconds: cell.averageTimeSeconds || 0,
        totalTimeSpent: cell.totalTimeSpent || 0,
        lastAttemptTimeClassification: cell.lastAttemptTimeClassification,
        masteryAchievedAt: cell.masteryAchievedAt ? new Date(cell.masteryAchievedAt) : undefined
      }
    }
  }

  return grid
}

/**
 * Calculates total mastered cells in grid
 */
export function getMasteredCount(grid: MathGridCell[][]): number {
  let count = 0
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 12; j++) {
      if (grid[i][j].consecutiveCorrect >= 3) {
        count++
      }
    }
  }
  return count
}

/**
 * Calculates mastery percentage
 */
export function getMasteryPercentage(grid: MathGridCell[][]): number {
  const masteredCount = getMasteredCount(grid)
  return Math.round((masteredCount / 144) * 100) // 144 = 12x12
}
