import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStudentIdentity } from '@/hooks/useStudentIdentity'
import { PracticeGrid } from '@/components/student/PracticeGrid'
import { buildRoute } from '@/lib/routes'

export function PracticeActive() {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const { identity } = useStudentIdentity()
  const [sessionStarted, setSessionStarted] = useState(false)

  // Redirect if no identity (but not if session already started)
  useEffect(() => {
    if (!identity?.email && !sessionStarted) {
      navigate(buildRoute.home())
    }
  }, [identity?.email, navigate, sessionStarted])

  const handleSessionComplete = async (_results: any) => {
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
      onSessionStart={() => setSessionStarted(true)}
    />
  )
}
