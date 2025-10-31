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
      const metadata = metadataStr ? JSON.parse(metadataStr) : {}
      setUser({
        id: userId,
        email,
        user_metadata: metadata
      })
    }

    setLoading(false)
  }, [])

  const signIn = (email: string, metadata?: any) => {
    // Generate a simple ID based on email (or use existing one)
    const existingId = localStorage.getItem(USER_ID_STORAGE_KEY)
    const userId = existingId || `user_${Date.now()}_${Math.random().toString(36).substring(7)}`

    localStorage.setItem(USER_STORAGE_KEY, email)
    localStorage.setItem(USER_ID_STORAGE_KEY, userId)
    if (metadata) {
      localStorage.setItem(USER_METADATA_STORAGE_KEY, JSON.stringify(metadata))
    }

    setUser({
      id: userId,
      email,
      user_metadata: metadata || {}
    })
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
