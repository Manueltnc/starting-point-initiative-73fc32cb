import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SessionNavigationHeader } from './SessionNavigationHeader'
import { SessionTimer } from './SessionTimer'
import { MasteryBadge } from './MasteryBadge'
import { useMathSession } from '@/hooks/useMathSession'
import { useAudioFeedback } from '@/hooks/useAudioFeedback'
import { UnifiedMathQuestion } from './UnifiedMathQuestion'
import { PRACTICE_CONFIG } from '@/lib/config'
import { supabase } from '@/integrations/supabase/client'
import { capitalizeName } from '@/lib/utils'
import type { MathProblem as MathProblemType } from '@/types'

interface PracticeGridProps {
  email: string
  gradeLevel: string
  onComplete: (results?: any) => void
}

export function PracticeGrid({ email, gradeLevel, onComplete }: PracticeGridProps) {
  const navigate = useNavigate()
  const { playSuccess, playError } = useAudioFeedback()
  const { startPracticeSession, submitAnswer, getNextProblem, advanceToNextProblem, completeSession, sessionState, loading } = useMathSession()
  const [currentProblem, setCurrentProblem] = useState<MathProblemType | null>(null)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackResult, setFeedbackResult] = useState<{ correct: boolean; correctAnswer: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
  const [showMasteryBadge, setShowMasteryBadge] = useState(false)
  const [masteredProblem, setMasteredProblem] = useState<{ multiplicand: number; multiplier: number } | null>(null)
  const displayName = capitalizeName(email.split('@')[0])

  const SESSION_DURATION = PRACTICE_CONFIG.sessionDuration

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const handleExitSession = async () => {
    await completeSession()
    navigate('/')
  }

  // Auto-start practice session when component mounts
  useEffect(() => {
    if (!sessionStarted && !sessionState && !loading) {
      setSessionStarted(true)
      setStartTime(Date.now())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Empty deps intentional - only start once on mount

  useEffect(() => {
    if (sessionStarted && !sessionState) {
      startPracticeSession(email, gradeLevel)
    }
  }, [sessionStarted, sessionState, startPracticeSession, email, gradeLevel])

  useEffect(() => {
    if (sessionState && sessionState.problemQueue.length > 0) {
      const nextProblem = getNextProblem()
      if (nextProblem) {
        const problemKey = nextProblem.id || `${nextProblem.multiplicand}×${nextProblem.multiplier}`
        const currentProblemKey = currentProblem?.id || (currentProblem ? `${currentProblem.multiplicand}×${currentProblem.multiplier}` : null)
        
        if (problemKey !== currentProblemKey) {
          setCurrentProblem(nextProblem)
          setShowFeedback(false)
          setFeedbackResult(null)
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

    // Calculate session metrics for results display
    const { calculateSessionMetrics } = await import('@/lib/session-analytics')
    const metrics = sessionState ? calculateSessionMetrics(sessionState) : {
      itemsAttempted: 0,
      itemsCorrect: 0,
      accuracy: 0
    }

    const results = {
      sessionId: sessionState?.sessionId,
      totalProblems: metrics.itemsAttempted,
      correctAnswers: metrics.itemsCorrect,
      accuracy: metrics.accuracy,
      timestamp: new Date().toISOString()
    }

    onComplete(results)
  }

  const handleSubmitAnswer = async (answer: number, timeSpent: number) => {
    if (isSubmitting || !currentProblem) return

    setIsSubmitting(true)

    try {
      const result = await submitAnswer(answer, timeSpent)

      if (result.correct) {
        playSuccess()
        const newConsecutive = consecutiveCorrect + 1
        setConsecutiveCorrect(newConsecutive)
        
        // Check if this problem was just mastered (3 consecutive correct)
        const gridUpdate = sessionState?.gridUpdates.find(
          u => u.multiplicand === currentProblem.multiplicand && u.multiplier === currentProblem.multiplier
        )
        if (gridUpdate && gridUpdate.consecutiveCorrect === 3) {
          setMasteredProblem({ multiplicand: currentProblem.multiplicand, multiplier: currentProblem.multiplier })
          setShowMasteryBadge(true)
        }
        
        // Trigger confetti on 5 consecutive correct answers
        if (newConsecutive === 5) {
          const { default: confetti } = await import('canvas-confetti')
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
          setConsecutiveCorrect(0)
        }
      } else {
        playError()
        setConsecutiveCorrect(0)
      }

      setFeedbackResult({
        correct: result.correct,
        correctAnswer: currentProblem.answer
      })
      setShowFeedback(true)
      setIsSubmitting(false)

      setTimeout(() => {
        if (sessionState && sessionState.currentProblemIndex >= sessionState.problemQueue.length - 1) {
          handleSessionComplete()
        } else {
          advanceToNextProblem()
        }
      }, 2000)
    } catch (error) {
      console.error('Failed to submit answer:', error)
      setIsSubmitting(false)
    }
  }

  if (loading && !sessionState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading Practice Session...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-background">
        <SessionNavigationHeader
          userName={displayName}
          onLogout={handleLogout}
          onExitSession={handleExitSession}
        />
        <div className="flex items-center justify-center pt-20">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Ready to Practice?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                You'll practice multiplication problems to improve your skills.
              </p>
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
    )
  }

  if (!currentProblem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading next problem...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 p-4">
      <SessionNavigationHeader
        userName={displayName}
        onLogout={handleLogout}
        onExitSession={handleExitSession}
      />
      
      {/* Mastery Achievement Badge */}
      {masteredProblem && (
        <MasteryBadge 
          show={showMasteryBadge}
          multiplicand={masteredProblem.multiplicand}
          multiplier={masteredProblem.multiplier}
          onComplete={() => setShowMasteryBadge(false)}
        />
      )}
      
      <div className="container mx-auto px-4 py-6 max-w-4xl pt-20">
        {/* Session Timer */}
        {startTime && sessionState && (
          <div className="mb-6">
            <SessionTimer 
              startTime={startTime}
              duration={SESSION_DURATION}
              currentProblemIndex={sessionState.currentProblemIndex}
              totalProblems={sessionState.problemQueue.length}
            />
          </div>
        )}
        
        <UnifiedMathQuestion
          problem={currentProblem}
          onSubmitAnswer={handleSubmitAnswer}
          showFeedback={showFeedback}
          feedbackResult={feedbackResult}
          disabled={isSubmitting}
        />
      </div>
    </div>
  )
}
