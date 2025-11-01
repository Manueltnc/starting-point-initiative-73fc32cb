import { useState, useEffect } from 'react'

// Simplified user type for MVP (no Supabase Auth)
export interface SimpleUser {
  id: string
  email: string
  user_metadata?: {
    role?: string
    display_name?: string
    grade_level?: string
  }
}

const USER_STORAGE_KEY = 'user_email'
const USER_ID_STORAGE_KEY = 'user_id'
const USER_METADATA_STORAGE_KEY = 'user_metadata'

export function useAuth() {
  const [user, setUser] = useState<SimpleUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage
    const email = localStorage.getItem(USER_STORAGE_KEY)
    const userId = localStorage.getItem(USER_ID_STORAGE_KEY)
    const metadataStr = localStorage.getItem(USER_METADATA_STORAGE_KEY)

    if (email && userId) {
      // Check if the userId is a valid UUID, if not, regenerate it
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      let validUserId = userId
      
      if (!uuidRegex.test(userId)) {
        console.warn('Invalid UUID detected, generating new one')
        validUserId = crypto.randomUUID()
        localStorage.setItem(USER_ID_STORAGE_KEY, validUserId)
      }

      const metadata = metadataStr ? JSON.parse(metadataStr) : {}
      setUser({
        id: validUserId,
        email,
        user_metadata: metadata
      })
    }

    setLoading(false)
  }, [])

  const signIn = (email: string, metadata?: any) => {
    // Generate a proper UUID (or use existing one)
    const existingId = localStorage.getItem(USER_ID_STORAGE_KEY)
    const userId = existingId || crypto.randomUUID()

    localStorage.setItem(USER_STORAGE_KEY, email)
    localStorage.setItem(USER_ID_STORAGE_KEY, userId)
    if (metadata) {
      localStorage.setItem(USER_METADATA_STORAGE_KEY, JSON.stringify(metadata))
    }

    const newUser = {
      id: userId,
      email,
      user_metadata: metadata || {}
    }
    
    setUser(newUser)
    return newUser
  }

  const signOut = () => {
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(USER_ID_STORAGE_KEY)
    localStorage.removeItem(USER_METADATA_STORAGE_KEY)
    setUser(null)
  }

  return {
    user,
    loading,
    signIn,
    signOut,
  }
}
