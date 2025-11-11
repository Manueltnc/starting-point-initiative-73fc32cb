import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppHeader } from '@/components/ui/AppHeader'
import { useMathSession } from '@/hooks/useMathSession'
import { useGridProgress } from '@/hooks/useGridProgress'
import { MathProblem } from './MathProblem'
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
  const { startPracticeSession, submitAnswer, getNextProblem, advanceToNextProblem, completeSession, sessionState, loading } = useMathSession()
  const { getGuardrailMasteryPercentage } = useGridProgress()
  const [currentProblem, setCurrentProblem] = useState<MathProblemType | null>(null)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [problemIndex, setProblemIndex] = useState(0)

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
        // Use problem ID or multiplicand×multiplier for comparison instead of object reference
        const problemKey = nextProblem.id || `${nextProblem.multiplicand}×${nextProblem.multiplier}`
        const currentProblemKey = currentProblem?.id || (currentProblem ? `${currentProblem.multiplicand}×${currentProblem.multiplier}` : null)
        
        if (problemKey !== currentProblemKey) {
          setCurrentProblem(nextProblem)
          // Sync problemIndex with sessionState.currentProblemIndex
          setProblemIndex(sessionState.currentProblemIndex)
        }
      }
    }
  }, [sessionState?.currentProblemIndex, sessionState?.problemQueue.length, getNextProblem, currentProblem])

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

  const handleSessionComplete = async () => {
    await completeSession()
    onComplete()
  }

  const handleAnswer = async (answer: number, timeSpent: number) => {
    const result = await submitAnswer(answer, timeSpent)
    
    // Check if this was the last problem before advancing
    if (sessionState && sessionState.currentProblemIndex >= sessionState.problemQueue.length - 1) {
      // This was the last problem, session will complete after feedback
      // The MathProblem component will call onComplete after showing feedback
      return result
    }
    
    // Advance to next problem
    advanceToNextProblem()
    
    // The useEffect will handle updating currentProblem when sessionState.currentProblemIndex changes
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
          isLastProblem={sessionState ? sessionState.currentProblemIndex >= sessionState.problemQueue.length - 1 : false}
        />
      </div>
    </div>
  )
}
