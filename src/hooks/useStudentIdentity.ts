import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

const USER_ID_STORAGE_KEY = 'user_id'
const USER_EMAIL_STORAGE_KEY = 'user_email'
const USER_METADATA_STORAGE_KEY = 'user_metadata'

export interface StudentIdentity {
  id: string
  email: string
  metadata: {
    display_name?: string
    grade_level?: string
  }
}

export function useStudentIdentity() {
  const [identity, setIdentityState] = useState<StudentIdentity | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Read from localStorage on mount
    const storedId = localStorage.getItem(USER_ID_STORAGE_KEY)
    const storedEmail = localStorage.getItem(USER_EMAIL_STORAGE_KEY)
    const storedMetadata = localStorage.getItem(USER_METADATA_STORAGE_KEY)

    if (storedId && storedEmail) {
      setIdentityState({
        id: storedId,
        email: storedEmail,
        metadata: storedMetadata ? JSON.parse(storedMetadata) : {}
      })
    }
    setLoading(false)
  }, [])

  const setIdentity = async ({
    email,
    display_name,
    grade_level = '3'
  }: {
    email: string
    display_name?: string
    grade_level?: string
  }) => {
    try {
      // Generate a UUID for new students
      const tempId = crypto.randomUUID()
      
      // Call ensure_user_exists to get canonical ID
      const { data: canonicalId, error } = await supabase.rpc('ensure_user_exists', {
        _id: tempId,
        _email: email,
        _display_name: display_name || email.split('@')[0],
        _grade_level: grade_level
      })

      if (error) {
        console.error('Failed to ensure user exists:', error)
        throw error
      }

      const finalId = canonicalId || tempId
      const metadata = {
        display_name: display_name || email.split('@')[0],
        grade_level
      }

      // Store in localStorage
      localStorage.setItem(USER_ID_STORAGE_KEY, finalId)
      localStorage.setItem(USER_EMAIL_STORAGE_KEY, email)
      localStorage.setItem(USER_METADATA_STORAGE_KEY, JSON.stringify(metadata))

      // Update state
      setIdentityState({
        id: finalId,
        email,
        metadata
      })

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const clearIdentity = () => {
    localStorage.removeItem(USER_ID_STORAGE_KEY)
    localStorage.removeItem(USER_EMAIL_STORAGE_KEY)
    localStorage.removeItem(USER_METADATA_STORAGE_KEY)
    setIdentityState(null)
  }

  return {
    identity,
    loading,
    setIdentity,
    clearIdentity
  }
}
