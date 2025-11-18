import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentJourney } from '@/hooks/useStudentJourney'
import { buildRoute } from '@/lib/routes'

interface PracticeGuardProps {
  children: ReactNode
}

/**
 * Route guard that ensures students complete placement test before accessing practice
 */
export function PracticeGuard({ children }: PracticeGuardProps) {
  const navigate = useNavigate()
  const { loading, canStartPractice } = useStudentJourney()

  useEffect(() => {
    // Wait for journey state to load
    if (loading) return

    // If student hasn't completed placement, redirect to placement ready
    if (!canStartPractice) {
      navigate(buildRoute.placementReady(), { replace: true })
    }
  }, [loading, canStartPractice, navigate])

  // Show loading while checking journey state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Only render children if student can start practice
  if (!canStartPractice) {
    return null
  }

  return <>{children}</>
}
