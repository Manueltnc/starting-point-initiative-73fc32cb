/**
 * Session Storage Utility
 *
 * Manages persistence of active session state to localStorage.
 * Enables session recovery after page refresh or accidental tab close.
 */

import { z } from 'zod'
import type { MathProblem, MathGridCell } from '../types'

const STORAGE_KEY = 'active_math_session'
const VERSION = 1

// Zod schemas for validation
const MathProblemSchema = z.object({
  id: z.string(),
  multiplicand: z.number().int().min(1).max(12),
  multiplier: z.number().int().min(1).max(12),
  answer: z.number().int(),
  difficulty: z.enum(['basic', 'intermediate', 'advanced'])
})

const MathGridCellSchema = z.object({
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
})

const PersistedSessionSchema = z.object({
  sessionId: z.string().uuid(),
  sessionType: z.enum(['placement', 'practice']),
  currentProblemIndex: z.number().int().min(0),
  problemQueue: z.array(MathProblemSchema),
  incorrectProblems: z.array(MathProblemSchema),
  gridUpdates: z.array(MathGridCellSchema),
  startTime: z.number(),
  lastActivity: z.number(),
  version: z.number()
})

/**
 * Session data persisted to localStorage
 */
export interface PersistedSession {
  sessionId: string
  sessionType: 'placement' | 'practice'
  currentProblemIndex: number
  problemQueue: MathProblem[]
  incorrectProblems: MathProblem[]
  gridUpdates: MathGridCell[]
  startTime: number
  lastActivity: number
  version: number
}

/**
 * Save session state to localStorage
 * Called after every answer to ensure no progress is lost
 */
export function saveSession(session: Omit<PersistedSession, 'version'>): void {
  try {
    const data: PersistedSession = {
      ...session,
      lastActivity: Date.now(),
      version: VERSION,
    }

    // Validate data before saving
    PersistedSessionSchema.parse(data)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    // Handle quota exceeded error specifically
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, attempting to clear old data...')
      clearOldSessionData()

      // Retry save after clearing
      try {
        const data: PersistedSession = {
          ...session,
          lastActivity: Date.now(),
          version: VERSION,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (retryError) {
        console.error('Failed to save session even after clearing old data:', retryError)
      }
    } else {
      // Handle other errors (validation, localStorage disabled, etc.)
      console.error('Failed to save session to localStorage:', error)
      // Graceful degradation - session continues but won't survive refresh
    }
  }
}

/**
 * Clear old session data to free up localStorage space
 * Removes any orphaned session data or old version data
 */
function clearOldSessionData(): void {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      // Remove any old session-related keys (but keep current active session)
      if (key.startsWith('math_session_') || key.startsWith('old_')) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Failed to clear old session data:', error)
  }
}

/**
 * Load session state from localStorage
 * Returns null if no session exists or data is corrupted
 */
export function loadSession(): PersistedSession | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)

    if (!data) {
      return null
    }

    const parsed = JSON.parse(data)

    // Check version compatibility (for future migrations)
    if (parsed.version !== VERSION) {
      console.warn(`Session version mismatch (expected ${VERSION}, got ${parsed.version}), clearing old session...`)
      clearSession()
      return null
    }

    // Validate session data with Zod
    const validated = PersistedSessionSchema.parse(parsed)

    return validated
  } catch (error) {
    console.error('Failed to load session from localStorage:', error)
    // Clear corrupted data
    clearSession()
    return null
  }
}

/**
 * Clear active session from localStorage
 * Called when session completes, is abandoned, or new session starts
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear session from localStorage:', error)
  }
}

/**
 * Check if a session is stale (inactive for too long)
 * Stale sessions should be cleared and not resumed
 *
 * @param session The session to check
 * @param maxAgeMinutes Maximum age in minutes (default: 30)
 */
export function isSessionStale(
  session: PersistedSession,
  maxAgeMinutes: number = 30
): boolean {
  const ageMs = Date.now() - session.lastActivity
  const ageMinutes = ageMs / (1000 * 60)
  return ageMinutes > maxAgeMinutes
}

/**
 * Get summary info about the active session for display
 * Useful for "Resume session?" modal
 */
export function getSessionSummary(session: PersistedSession): {
  type: string
  progress: string
  age: string
} {
  const totalQuestions = session.problemQueue.length
  const answered = session.currentProblemIndex
  const remaining = totalQuestions - answered

  const ageMs = Date.now() - session.lastActivity
  const ageMinutes = Math.floor(ageMs / (1000 * 60))

  let ageStr: string
  if (ageMinutes < 1) {
    ageStr = 'just now'
  } else if (ageMinutes === 1) {
    ageStr = '1 minute ago'
  } else if (ageMinutes < 60) {
    ageStr = `${ageMinutes} minutes ago`
  } else {
    const hours = Math.floor(ageMinutes / 60)
    ageStr = hours === 1 ? '1 hour ago' : `${hours} hours ago`
  }

  return {
    type: session.sessionType === 'placement' ? 'Placement Test' : 'Practice Session',
    progress: `${answered}/${totalQuestions} questions answered (${remaining} remaining)`,
    age: ageStr,
  }
}

/**
 * Update session activity timestamp
 * Call this on user interactions to keep session fresh
 */
export function touchSession(): void {
  const session = loadSession()
  if (session) {
    saveSession(session)
  }
}
