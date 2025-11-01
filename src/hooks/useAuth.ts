import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

const USER_ID_STORAGE_KEY = 'user_id'
const USER_EMAIL_STORAGE_KEY = 'user_email'
const USER_METADATA_STORAGE_KEY = 'user_metadata'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Defer Supabase RPC call to avoid deadlock
          setTimeout(async () => {
            try {
              const { data: canonicalId } = await supabase.rpc('ensure_user_exists', {
                _id: session.user.id,
                _email: session.user.email!,
                _display_name: session.user.user_metadata?.display_name || session.user.email!.split('@')[0],
                _grade_level: session.user.user_metadata?.grade_level || '3'
              })

              // Mirror the canonical id to localStorage for api-client compatibility
              if (canonicalId) {
                localStorage.setItem(USER_ID_STORAGE_KEY, canonicalId)
                localStorage.setItem(USER_EMAIL_STORAGE_KEY, session.user.email!)
                localStorage.setItem(USER_METADATA_STORAGE_KEY, JSON.stringify(session.user.user_metadata || {}))
              }
            } catch (e) {
              console.error('ensure_user_exists failed:', e)
            }
          }, 0)
        } else {
          // Clear localStorage when logged out
          localStorage.removeItem(USER_ID_STORAGE_KEY)
          localStorage.removeItem(USER_EMAIL_STORAGE_KEY)
          localStorage.removeItem(USER_METADATA_STORAGE_KEY)
        }
      }
    )

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const redirectUrl = `${window.location.origin}/`
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata || {}
      }
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }
}
