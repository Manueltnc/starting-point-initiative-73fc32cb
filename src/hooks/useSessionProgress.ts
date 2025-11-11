import { useCallback, useEffect } from 'react'
import type { UnifiedApiClient } from '@/lib/api-client'
import type { MathSessionState } from '@/types'
import { calculateSessionMetrics } from '@/lib/session-analytics'

interface UseSessionProgressOptions {
  sessionState: MathSessionState | null
  apiClient: UnifiedApiClient
}

/**
 * Hook for session progress tracking and auto-save functionality
 */
export function useSessionProgress({ sessionState, apiClient }: UseSessionProgressOptions) {
  const saveSessionProgress = useCallback(async () => {
    if (!sessionState) return

    try {
      const metrics = calculateSessionMetrics(sessionState)
      await apiClient.updateSession(sessionState.sessionId, {
        ...metrics,
        duration: 0 // Will be calculated from actual session time
      })
    } catch (err) {
      console.error('Failed to save session progress:', err)
    }
  }, [sessionState, apiClient])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!sessionState) return

    const interval = setInterval(() => {
      saveSessionProgress()
    }, 30000) // Save every 30 seconds

    return () => clearInterval(interval)
  }, [sessionState, saveSessionProgress])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionState) {
        // Mark session as abandoned
        const metrics = calculateSessionMetrics(sessionState)
        apiClient.updateSession(sessionState.sessionId, {
          ...metrics,
          duration: 0,
          averageTimePerQuestion: 0,
          fastAnswersCount: 0,
          mediumAnswersCount: 0,
          slowAnswersCount: 0
        }).catch(console.error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [sessionState, apiClient])

  return {
    saveSessionProgress
  }
}

