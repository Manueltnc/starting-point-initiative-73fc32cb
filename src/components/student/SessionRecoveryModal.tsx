import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { loadSession, clearSession, isSessionStale, getSessionSummary } from '@/lib/session-storage'
import { buildRoute } from '@/lib/routes'
import { AlertCircle, Play, X } from 'lucide-react'

/**
 * Modal that checks for interrupted sessions and offers to resume
 * Shows on dashboard mount if an active session exists in localStorage
 */
export function SessionRecoveryModal() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<ReturnType<typeof getSessionSummary> | null>(null)
  const [sessionType, setSessionType] = useState<'placement' | 'practice' | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const checkForActiveSession = () => {
      const session = loadSession()

      if (!session) {
        return
      }

      // Check if session is stale (>30 minutes old)
      if (isSessionStale(session)) {
        console.log('Session is stale, clearing...')
        clearSession()
        return
      }

      // Valid active session found - show recovery modal
      setSessionInfo(getSessionSummary(session))
      setSessionType(session.sessionType)
      setSessionId(session.sessionId)
      setShowModal(true)
    }

    checkForActiveSession()
  }, [])

  const handleResume = () => {
    if (!sessionType || !sessionId) return

    // Clear modal and navigate to active session
    setShowModal(false)

    if (sessionType === 'placement') {
      navigate(buildRoute.placementActive(sessionId))
    } else {
      navigate(buildRoute.practiceActive(sessionId))
    }
  }

  const handleStartNew = () => {
    // Clear persisted session and close modal
    clearSession()
    setShowModal(false)
  }

  if (!showModal || !sessionInfo) {
    return null
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">Resume Your Session?</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            We found an interrupted {sessionInfo.type.toLowerCase()} from {sessionInfo.age}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Session Type</span>
              <span className="text-sm font-semibold text-primary">{sessionInfo.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <span className="text-sm font-semibold text-primary">{sessionInfo.progress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Last Active</span>
              <span className="text-sm font-semibold text-primary">{sessionInfo.age}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            You can continue where you left off, or start a new session.
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleResume}
            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            <Play className="h-4 w-4 mr-2" />
            Resume Session
          </Button>
          <Button onClick={handleStartNew} variant="outline" className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Start New Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
