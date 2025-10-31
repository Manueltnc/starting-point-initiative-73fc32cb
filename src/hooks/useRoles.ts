import { useState, useEffect } from 'react'

const USER_METADATA_STORAGE_KEY = 'user_metadata'

export function useRoles() {
  const [roles, setRoles] = useState<string[]>([])
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserRoles()
  }, [])

  const fetchUserRoles = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user metadata from localStorage
      const metadataStr = localStorage.getItem(USER_METADATA_STORAGE_KEY)

      if (!metadataStr) {
        setRoles(['student']) // Default role
        setIsSuperAdmin(false)
        setLoading(false)
        return
      }

      const metadata = JSON.parse(metadataStr)
      const role = metadata.role || 'student'

      setRoles([role])
      setIsSuperAdmin(role === 'super_admin' || role === 'admin')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user roles')
      setRoles(['student'])
      setIsSuperAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const hasRole = (role: string): boolean => {
    return roles.includes(role)
  }

  const hasAnyRole = (roleList: string[]): boolean => {
    return roleList.some(role => roles.includes(role))
  }

  return {
    roles,
    isSuperAdmin,
    loading,
    error,
    hasRole,
    hasAnyRole,
    refetch: fetchUserRoles
  }
}
