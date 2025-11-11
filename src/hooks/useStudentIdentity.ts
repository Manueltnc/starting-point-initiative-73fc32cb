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
    const readFromStorage = () => {
      const storedId = localStorage.getItem(USER_ID_STORAGE_KEY)
      const storedEmail = localStorage.getItem(USER_EMAIL_STORAGE_KEY)
      const storedMetadata = localStorage.getItem(USER_METADATA_STORAGE_KEY)

      if (storedId && storedEmail) {
        setIdentityState({
          id: storedId,
          email: storedEmail,
          metadata: storedMetadata ? JSON.parse(storedMetadata) : {}
        })
      } else {
        setIdentityState(null)
      }
    }

    // Initial read
    readFromStorage()
    setLoading(false)

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || [USER_ID_STORAGE_KEY, USER_EMAIL_STORAGE_KEY, USER_METADATA_STORAGE_KEY].includes(e.key)) {
        readFromStorage()
      }
    }

    const ID_CHANGED_EVENT = 'student-identity-changed'
    const handleCustom = () => readFromStorage()

    window.addEventListener('storage', handleStorage)
    window.addEventListener(ID_CHANGED_EVENT, handleCustom)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(ID_CHANGED_EVENT, handleCustom)
    }
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

      // Notify other hook instances
      window.dispatchEvent(new Event('student-identity-changed'))

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
    window.dispatchEvent(new Event('student-identity-changed'))
  }

  return {
    identity,
    loading,
    setIdentity,
    clearIdentity
  }
}
