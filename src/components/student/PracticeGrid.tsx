import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SessionNavigationHeader } from './SessionNavigationHeader'
import { useMathSession } from '@/hooks/useMathSession'
import { useGridProgress } from '@/hooks/useGridProgress'
import { useAudioFeedback } from '@/hooks/useAudioFeedback'
import { UnifiedMathQuestion } from './UnifiedMathQuestion'
import { PRACTICE_CONFIG } from '@/lib/config'
import { supabase } from '@/integrations/supabase/client'
import { capitalizeName } from '@/lib/utils'
import { Target, Trophy } from 'lucide-react'
import type { MathProblem as MathProblemType } from '@/types'

interface PracticeGridProps {
  email: string
  gradeLevel: string
  onComplete: () => void
}

export function PracticeGrid({ email, gradeLevel, onComplete }: PracticeGridProps) {
  const navigate = useNavigate()
  const { playSuccess, playError } = useAudioFeedback()
  const { startPracticeSession, submitAnswer, getNextProblem, advanceToNextProblem, completeSession, sessionState, loading } = useMathSession()
  const { getGuardrailMasteryPercentage } = useGridProgress()
  const [currentProblem, setCurrentProblem] = useState<MathProblemType | null>(null)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [problemIndex, setProblemIndex] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackResult, setFeedbackResult] = useState<{ correct: boolean; correctAnswer: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const displayName = capitalizeName(email.split('@')[0])

  const SESSION_DURATION = PRACTICE_CONFIG.sessionDuration

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleExitSession = async () => {
    await completeSession()
    navigate('/')
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
        const problemKey = nextProblem.id || `${nextProblem.multiplicand}×${nextProblem.multiplier}`
        const currentProblemKey = currentProblem?.id || (currentProblem ? `${currentProblem.multiplicand}×${currentProblem.multiplier}` : null)
        
        if (problemKey !== currentProblemKey) {
          setCurrentProblem(nextProblem)
          setProblemIndex(sessionState.currentProblemIndex)
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
    onComplete()
  }

  const handleSubmitAnswer = async (answer: number, timeSpent: number) => {
    if (isSubmitting || !currentProblem) return

    setIsSubmitting(true)

    try {
      const result = await submitAnswer(answer, timeSpent)

      if (result.correct) {
        playSuccess()
      } else {
        playError()
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

  const masteryPercentage = getGuardrailMasteryPercentage()

  return (
    <div className="min-h-screen bg-background">
      <SessionNavigationHeader
        userName={displayName}
        onLogout={handleLogout}
        onExitSession={handleExitSession}
      />
      
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              Problem {problemIndex + 1} of {sessionState?.problemQueue.length || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium">
              Mastery: {masteryPercentage}%
            </span>
          </div>
        </div>

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
