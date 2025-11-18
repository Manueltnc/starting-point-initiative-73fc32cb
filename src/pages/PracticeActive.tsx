import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStudentIdentity } from '@/hooks/useStudentIdentity'
import { PracticeGrid } from '@/components/student/PracticeGrid'
import { buildRoute } from '@/lib/routes'

interface PracticeActiveProps {
  onLogout: () => void
}

export function PracticeActive({ onLogout }: PracticeActiveProps) {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const { identity } = useStudentIdentity()

  // Redirect if no identity
  useEffect(() => {
    if (!identity?.email) {
      navigate(buildRoute.home())
    }
  }, [identity, navigate])

  const handleSessionComplete = async (results: any) => {
    // Navigate to results page with session info
    if (sessionId && sessionId !== 'new') {
      navigate(buildRoute.practiceResults(sessionId))
    } else {
      // Fallback to dashboard if session ID not available
      navigate(buildRoute.home())
    }
  }

  if (!identity?.email) {
    return null
  }

  return (
    <PracticeGrid
      email={identity.email}
      gradeLevel={identity.metadata?.grade_level || '3'}
      onComplete={handleSessionComplete}
    />
  )
}
