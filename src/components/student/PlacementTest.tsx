import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SessionNavigationHeader } from './SessionNavigationHeader'
import { useMathSession } from '@/hooks/useMathSession'
import { useAudioFeedback } from '@/hooks/useAudioFeedback'
import { UnifiedMathQuestion } from './UnifiedMathQuestion'
import type { MathProblem } from '@/types'

interface PlacementTestProps {
  email: string
  gradeLevel: string
  onComplete: (results: any) => void
  onDashboardClick?: () => void
}

export function PlacementTest({ email, gradeLevel, onComplete, onDashboardClick }: PlacementTestProps) {
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
  const [sessionStarted, setSessionStarted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackResult, setFeedbackResult] = useState<{ correct: boolean; correctAnswer: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)

  // Removed navigation logic - handled by parent ActiveSessionScreen

  useEffect(() => {
    if (sessionStarted && !sessionState) {
      startPlacementTest(email, gradeLevel)
    }
  }, [sessionStarted, sessionState, startPlacementTest, email, gradeLevel])

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
      // Calculate results from sessionState before completing
      const totalProblems = sessionState?.problemQueue.length || 0
      const correctCount = sessionState?.gridUpdates.filter(u => u.lastAttemptCorrect).length || 0
      const accuracy = totalProblems > 0 ? Math.round((correctCount / totalProblems) * 100) : 0

      await completeSession()
      
      // Analyze placement test results and set guardrails
      if (sessionState?.sessionId) {
        try {
          const { createApiClient } = await import('@/lib/api-client')
          const apiClient = createApiClient()
          await apiClient.analyzeAndApplyPlacementResults(sessionState.sessionId)
        } catch (error) {
          console.error('Failed to analyze placement results:', error)
        }
      }

      const results = {
        sessionId: sessionState?.sessionId,
        totalProblems,
        correctAnswers: correctCount,
        accuracy,
        guardrailsLevel: '1-5', // Default, will be updated based on analysis
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

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-background">
        {onDashboardClick && (
          <SessionNavigationHeader onExitSession={onDashboardClick} />
        )}
        <div className="flex items-center justify-center pt-20">\
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Placement Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">What to expect:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>You'll answer multiplication problems</li>
                  <li>Problems will adapt to your skill level</li>
                  <li>Take your time - accuracy matters most</li>
                  <li>This helps us personalize your learning</li>
                </ul>
              </div>
              <Button
                onClick={() => setSessionStarted(true)}
                className="w-full"
                size="lg"
              >
                Start Placement Test
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
    <div className="min-h-screen bg-background pt-16">
      {onDashboardClick && (
        <SessionNavigationHeader onExitSession={onDashboardClick} />
      )}
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
