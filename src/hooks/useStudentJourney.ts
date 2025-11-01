import { useState, useEffect } from 'react'
import { createApiClient } from '@/lib/api-client'
// (supabase auth removed for local auth flow)

const supabaseUrl = 'https://pyoyzyzhcwrqqyujjmze.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5b3l6eXpoY3dycXF5dWpqbXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODA5MTUsImV4cCI6MjA2NzY1NjkxNX0.CG1T1e4pUhipDyesjNiCD2YSDFXQi5dAhpKJZx6ytFk'
const apiClient = createApiClient(supabaseUrl, supabaseKey)

export type StudentJourneyState = 'needs_placement' | 'placement_in_progress' | 'placement_completed' | 'practice_ready'

export const useStudentJourney = () => {
  const [journeyState, setJourneyState] = useState<StudentJourneyState>('needs_placement')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJourneyState = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const state = await apiClient.getCurrentJourneyState()
      setJourneyState(state)
    } catch (err) {
      console.error('Failed to fetch journey state:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch journey state')
      setJourneyState('needs_placement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJourneyState()

    // No Supabase auth listener; rely on local auth
    return () => {}
  }, [])

  const refreshJourneyState = () => {
    fetchJourneyState()
  }

  return {
    journeyState,
    loading,
    error,
    refreshJourneyState,
    // Convenience getters
    needsPlacement: journeyState === 'needs_placement',
    placementInProgress: journeyState === 'placement_in_progress',
    placementCompleted: journeyState === 'placement_completed',
    practiceReady: journeyState === 'practice_ready' || journeyState === 'placement_completed',
    canStartPractice: journeyState === 'placement_completed' || journeyState === 'practice_ready',
    shouldShowPlacement: journeyState === 'needs_placement' || journeyState === 'placement_in_progress'
  }
}
