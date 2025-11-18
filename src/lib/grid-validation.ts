// Grid state validation using Zod
import { z } from 'zod'
import type { MathGridCell } from '@/types'

// Zod schema for MathGridCell
export const MathGridCellSchema = z.object({
  multiplicand: z.number().int().min(1).max(12),
  multiplier: z.number().int().min(1).max(12),
  consecutiveCorrect: z.number().int().min(0),
  lastAttemptCorrect: z.boolean(),
  attempts: z.number().int().min(0),
  isLocked: z.boolean(),
  averageTimeSeconds: z.number().min(0),
  totalTimeSpent: z.number().min(0).optional(),
  lastAttemptTimeClassification: z.enum(['fast', 'medium', 'slow']).optional(),
  masteryAchievedAt: z.date().optional()
}).refine(
  data => data.consecutiveCorrect <= data.attempts,
  { message: 'consecutiveCorrect cannot exceed attempts' }
)

// Zod schema for grid state (12x12 array)
export const GridStateSchema = z.array(z.array(MathGridCellSchema))
  .length(12)
  .refine(
    rows => rows.every(row => row.length === 12),
    { message: 'Grid must be 12x12' }
  )

/**
 * Validates grid state and throws error if invalid
 */
export function validateGridState(gridState: unknown): MathGridCell[][] {
  return GridStateSchema.parse(gridState)
}

/**
 * Type guard to check if value is a valid grid state
 */
export function isValidGridState(gridState: unknown): gridState is MathGridCell[][] {
  return GridStateSchema.safeParse(gridState).success
}

/**
 * Validates a single grid cell update
 */
export function validateGridCell(cell: unknown): MathGridCell {
  return MathGridCellSchema.parse(cell)
}

/**
 * Type guard for checking if value is the old cells format
 */
export function isOldCellsFormat(gridState: unknown): gridState is { cells: Record<string, any> } {
  return (
    typeof gridState === 'object' &&
    gridState !== null &&
    'cells' in gridState &&
    typeof (gridState as any).cells === 'object'
  )
}
