import { useCallback } from 'react'
import { useStudentIdentity } from '@/hooks/useStudentIdentity'
import { supabase } from '@/integrations/supabase/client'

/**
 * Hook for session recovery and active session checking
 */
export function useSessionRecovery() {
  const { identity } = useStudentIdentity()

  const checkForActiveSessions = useCallback(async () => {
    try {
      if (!identity) return null

      const { data: activeSessions, error } = await supabase
        .rpc('get_active_sessions_for_student', { student_uuid: identity.id })

      if (error) throw error
      return activeSessions
    } catch (err) {
      console.error('Failed to check for active sessions:', err)
      return null
    }
  }, [identity])

  return {
    checkForActiveSessions
  }
}

