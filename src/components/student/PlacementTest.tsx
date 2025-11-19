import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { SessionNavigationHeader } from './SessionNavigationHeader'
import { SessionProgressHeader } from './SessionProgressHeader'
import { PauseModal } from './PauseModal'
import { useMathSession } from '@/hooks/useMathSession'
import { useAudioFeedback } from '@/hooks/useAudioFeedback'
import { UnifiedMathQuestion } from './UnifiedMathQuestion'
import { supabase } from '@/integrations/supabase/client'
import { capitalizeName } from '@/lib/utils'
import type { MathProblem } from '@/types'

interface PlacementTestProps {
  email: string
  gradeLevel: string
  onComplete: (results: any) => void
  onJourneyStateChange?: () => void
  onSessionStart?: () => void
}

export function PlacementTest({
  email,
  gradeLevel,
  onComplete,
  onJourneyStateChange,
  onSessionStart,
}: PlacementTestProps) {
  const navigate = useNavigate()
  const { playSuccess, playError } = useAudioFeedback()
  const mathSession = useMathSession()
  const { 
    startPlacementTest, 
    submitAnswer, 
    getCurrentProblem, 
    advanceToNextProblem, 
    completeSession, 
    sessionState, 
    loading 
  } = mathSession
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackResult, setFeedbackResult] = useState<{ correct: boolean; correctAnswer: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionStartTime] = useState(Date.now())
  const [timeElapsed, setTimeElapsed] = useState(0)
  const displayName = capitalizeName(email.split('@')[0])

  // Track time elapsed
  useEffect(() => {
    if (!sessionState || isPaused) return

    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - sessionStartTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionState, isPaused, sessionStartTime])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const handleExitSession = async () => {
    // Don't mark as complete if test isn't finished
    // Just navigate away - session will be marked as abandoned by background job
    navigate('/')
  }

  // Auto-start placement test when component mounts
  useEffect(() => {
    if (!sessionState && !loading) {
      startPlacementTest(email, gradeLevel).then(() => {
        if (onSessionStart) {
          onSessionStart()
        }
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Empty deps intentional - only start once on mount

  useEffect(() => {
    if (sessionState && sessionState.problemQueue.length > 0 && !showFeedback) {
      const problem = getCurrentProblem()
      if (problem) {
        const problemKey = problem.id || `${problem.multiplicand}×${problem.multiplier}`
        const currentProblemKey = currentProblem?.id || (currentProblem ? `${currentProblem.multiplicand}×${currentProblem.multiplier}` : null)
        
        if (problemKey !== currentProblemKey) {
          setCurrentProblem(problem)
        }
      }
    }
  }, [sessionState?.currentProblemIndex, showFeedback, getCurrentProblem, currentProblem])

  const handleSessionComplete = async () => {
    try {
      await completeSession()

      // Grid is now updated during placement test via updateMathGrid()
      // No need for separate analyzeAndApplyPlacementResults call

      if (onJourneyStateChange) {
        onJourneyStateChange()
      }

      // Calculate session metrics for results display
      const { calculateSessionMetrics } = await import('@/lib/session-analytics')
      const metrics = sessionState ? calculateSessionMetrics(sessionState) : {
        itemsAttempted: 0,
        itemsCorrect: 0,
        accuracy: 0
      }

      const results = {
        sessionId: sessionState?.sessionId,
        totalProblems: sessionState?.problemQueue.length || 0,
        correctAnswers: metrics.itemsCorrect,
        accuracy: metrics.accuracy,
        timestamp: new Date().toISOString()
      }

      onComplete(results)
    } catch (error) {
      console.error('Failed to complete placement test:', error)
    }
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
        
        // Trigger confetti on 5 consecutive correct answers
        if (newConsecutive === 5) {
          const { default: confetti } = await import('canvas-confetti')
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
          // Reset counter after celebration
          setConsecutiveCorrect(0)
        }
      } else {
        playError()
        setConsecutiveCorrect(0) // Reset on incorrect answer
      }

      setFeedbackResult({
        correct: result.correct,
        correctAnswer: currentProblem.answer
      })
      setShowFeedback(true)
      setIsSubmitting(false)

      setTimeout(() => {
        setShowFeedback(false)
        setFeedbackResult(null)

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
            <CardTitle>Loading Placement Test...</CardTitle>
          </CardHeader>
        </Card>
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

  const correctAnswers = sessionState?.gridUpdates.filter(g => g.lastAttemptCorrect).length || 0

  return (
    <div className="min-h-screen bg-background">
      <SessionNavigationHeader
        userName={displayName}
        onLogout={handleLogout}
        onExitSession={handleExitSession}
      />

      {/* Progress Header */}
      {sessionState && (
        <SessionProgressHeader
          currentProblem={sessionState.currentProblemIndex}
          totalProblems={sessionState.problemQueue.length}
          correctAnswers={correctAnswers}
          currentStreak={consecutiveCorrect}
          timeElapsed={timeElapsed}
          onPause={() => setIsPaused(true)}
        />
      )}

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <UnifiedMathQuestion
          problem={currentProblem}
          onSubmitAnswer={handleSubmitAnswer}
          showFeedback={showFeedback}
          feedbackResult={feedbackResult}
          disabled={isSubmitting}
          feedbackContext={{
            streak: consecutiveCorrect,
            difficulty: currentProblem.difficulty,
            problemsCompleted: sessionState?.currentProblemIndex || 0,
            attempts: 1, // Could track this per problem in the future
            timeSpent: timeElapsed,
            multiplicand: currentProblem.multiplicand,
            multiplier: currentProblem.multiplier
          }}
        />
      </div>

      {/* Pause Modal */}
      {isPaused && sessionState && (
        <PauseModal
          currentProblem={sessionState.currentProblemIndex}
          totalProblems={sessionState.problemQueue.length}
          timeElapsed={timeElapsed}
          correctAnswers={correctAnswers}
          onResume={() => setIsPaused(false)}
          onExit={handleExitSession}
        />
      )}
    </div>
  )
}
