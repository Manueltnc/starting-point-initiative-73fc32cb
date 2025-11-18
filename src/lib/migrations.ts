// Data migrations for grid state format
import { supabase } from '@/integrations/supabase/client'
import { validateGridState, isOldCellsFormat } from './grid-validation'
import { createEmptyGrid, migrateFromCellsFormat } from './grid-utils'

const sb = supabase as any

/**
 * Migrates all grid states from old { cells: {...} } format to new nested array format
 */
export async function migrateAllGridFormats(): Promise<void> {
  console.log('Starting grid format migration...')

  try {
    // Fetch all grid progress records
    const { data: records, error } = await sb
      .from('multiplications_app_math_grid_progress')
      .select('student_id, grid_state')

    if (error) {
      console.error('Failed to fetch grid records:', error)
      throw error
    }

    if (!records || records.length === 0) {
      console.log('No grid records found to migrate')
      return
    }

    let migratedCount = 0
    let alreadyCorrectCount = 0
    let resetCount = 0

    for (const record of records) {
      try {
        // Try to validate existing grid
        validateGridState(record.grid_state)
        alreadyCorrectCount++
        // Already correct format, skip
      } catch {
        // Wrong format, attempt migration
        let migratedGrid

        if (isOldCellsFormat(record.grid_state)) {
          // Old { cells: {...} } format
          console.log(`Migrating grid for student ${record.student_id} from old cells format`)
          migratedGrid = migrateFromCellsFormat(record.grid_state.cells)
          migratedCount++
        } else {
          // Unknown format, reset to empty
          console.warn(`Unknown grid format for student ${record.student_id}, resetting to empty grid`)
          migratedGrid = createEmptyGrid()
          resetCount++
        }

        // Save migrated version
        const { error: updateError } = await sb
          .from('multiplications_app_math_grid_progress')
          .update({ grid_state: migratedGrid })
          .eq('student_id', record.student_id)

        if (updateError) {
          console.error(`Failed to update grid for student ${record.student_id}:`, updateError)
        }
      }
    }

    console.log('Grid format migration complete:')
    console.log(`- Already correct: ${alreadyCorrectCount}`)
    console.log(`- Migrated: ${migratedCount}`)
    console.log(`- Reset: ${resetCount}`)
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

/**
 * Checks if migrations need to run and runs them if needed
 */
export async function checkAndRunMigrations(): Promise<void> {
  try {
    // Check if migration has already been run
    const migrationKey = 'grid_format_migration_v1'
    const { data: configData } = await sb
      .from('multiplications_app_app_config')
      .select('value')
      .eq('key', migrationKey)
      .maybeSingle()

    if (configData?.value === true) {
      console.log('Grid format migration already completed')
      return
    }

    // Run migration
    await migrateAllGridFormats()

    // Mark migration as complete
    await sb
      .from('multiplications_app_app_config')
      .upsert({
        key: migrationKey,
        value: true,
        updated_at: new Date().toISOString()
      })

    console.log('Migration marked as complete')
  } catch (error) {
    console.error('Failed to check and run migrations:', error)
    // Don't throw - we don't want to block app startup if migration fails
  }
}
