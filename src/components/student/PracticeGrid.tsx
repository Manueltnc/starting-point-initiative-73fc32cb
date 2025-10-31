import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppHeader } from '@/components/ui/AppHeader'
import { useMathSession } from '@/hooks/useMathSession'
import { useGridProgress } from '@/hooks/useGridProgress'
import { MathProblem } from './MathProblem'
import { SessionRecoveryModal } from './SessionRecoveryModal'
import { PRACTICE_CONFIG } from '@/lib/config'
import { supabase } from '@/integrations/supabase/client'
import { Target, Trophy } from 'lucide-react'
import type { MathProblem as MathProblemType } from '@/types'

interface PracticeGridProps {
  email: string
  gradeLevel: string
  onComplete: () => void
}

export function PracticeGrid({ email, gradeLevel, onComplete }: PracticeGridProps) {
  const { startPracticeSession, submitAnswer, getNextProblem, advanceToNextProblem, completeSession, sessionState, loading, checkForActiveSessions } = useMathSession()
  const { getGuardrailMasteryPercentage } = useGridProgress()
  const [currentProblem, setCurrentProblem] = useState<MathProblemType | null>(null)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [problemIndex, setProblemIndex] = useState(0)
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [hasCheckedForSessions, setHasCheckedForSessions] = useState(false)

  const SESSION_DURATION = PRACTICE_CONFIG.sessionDuration

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  useEffect(() => {
    if (sessionStarted && !sessionState) {
      startPracticeSession(email, gradeLevel)
    }
  }, [sessionStarted, sessionState, startPracticeSession, email, gradeLevel])

  useEffect(() => {
    if (sessionState && sessionState.problemQueue.length > 0) {
      const nextProblem = getNextProblem()
      if (nextProblem) {
        setCurrentProblem(nextProblem)
      }
    }
  }, [sessionState, getNextProblem])

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        
        if (elapsed >= SESSION_DURATION) {
          handleSessionComplete()
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [startTime])

  // Check for active sessions on component mount
  useEffect(() => {
    const checkForSessions = async () => {
      if (hasCheckedForSessions) return
      
      try {
        const activeSessions = await checkForActiveSessions()
        if (activeSessions && activeSessions.length > 0) {
          setShowRecoveryModal(true)
        }
        setHasCheckedForSessions(true)
      } catch (err) {
        console.error('Failed to check for active sessions:', err)
        setHasCheckedForSessions(true)
      }
    }

    checkForSessions()
  }, [checkForActiveSessions, hasCheckedForSessions])

  const handleSessionComplete = async () => {
    await completeSession()
    onComplete()
  }

  const handleResumeSession = async (sessionId: string) => {
    try {
      // TODO: Implement session resumption logic
      // This would involve loading the session state and continuing from where it left off
      console.log('Resuming session:', sessionId)
      setShowRecoveryModal(false)
      // For now, just start a new session
      setSessionStarted(true)
      setStartTime(Date.now())
    } catch (err) {
      console.error('Failed to resume session:', err)
      // Fall back to starting a new session
      setSessionStarted(true)
      setStartTime(Date.now())
    }
  }

  const handleStartNewSession = () => {
    setShowRecoveryModal(false)
    setSessionStarted(true)
    setStartTime(Date.now())
  }

  const handleAnswer = async (answer: number, timeSpent: number) => {
    const result = await submitAnswer(answer, timeSpent)
    
    // Advance to next problem first
    advanceToNextProblem()
    
    // Then get the next problem
    const nextProblem = getNextProblem()
    if (nextProblem) {
      setCurrentProblem(nextProblem)
      setProblemIndex(prev => prev + 1)
    } else {
      // No more problems, session complete
      await handleSessionComplete()
    }
    
    return result
  }

  const handleProblemComplete = () => {
    // This will be called when the last problem is completed
    handleSessionComplete()
  }

  if (loading && !sessionState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Preparing your practice session...</p>
        </div>
      </div>
    )
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 p-4">
        <div className="max-w-4xl mx-auto">
          <AppHeader onLogout={handleLogout} />
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-primary">Practice Session</CardTitle>
                <p className="text-muted-foreground">
                  Practice multiplication problems for up to 10 minutes.
                  Focus on problems you haven't mastered yet!
                </p>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => {
                    setSessionStarted(true)
                    setStartTime(Date.now())
                  }}
                  className="w-full"
                  size="lg"
                >
                  Start Practice
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!currentProblem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading next problem...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* App Header with Branding */}
        <AppHeader onLogout={handleLogout} />

        {/* Session Info Header (Timer hidden, analytics still track in background) */}
        <div className="mb-6">
          <Card className="backdrop-blur-sm bg-white/80 border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Problem {problemIndex + 1}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {getGuardrailMasteryPercentage()}% mastered
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Problem Component */}
        <MathProblem
          problem={currentProblem}
          onAnswer={handleAnswer}
          onComplete={handleProblemComplete}
          isLastProblem={problemIndex === (sessionState?.problemQueue.length || 0) - 1}
        />
      </div>

      {/* Session Recovery Modal */}
      <SessionRecoveryModal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        onResumeSession={handleResumeSession}
        onStartNewSession={handleStartNewSession}
      />
    </div>
  )
}
