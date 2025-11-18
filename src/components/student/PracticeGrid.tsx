import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { SessionNavigationHeader } from './SessionNavigationHeader'
import { SessionTimer } from './SessionTimer'
import { MasteryBadge } from './MasteryBadge'
import { useMathSession } from '@/hooks/useMathSession'
import { useAudioFeedback } from '@/hooks/useAudioFeedback'
import { UnifiedMathQuestion } from './UnifiedMathQuestion'
import { PRACTICE_CONFIG } from '@/lib/config'
import type { MathProblem as MathProblemType } from '@/types'

interface PracticeGridProps {
  email: string
  gradeLevel: string
  onComplete: (results: any) => void
  onDashboardClick?: () => void
}

export function PracticeGrid({ email, gradeLevel, onComplete, onDashboardClick }: PracticeGridProps) {
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

  const SESSION_DURATION = PRACTICE_CONFIG.sessionDuration

  // Removed navigation logic - handled by parent ActiveSessionScreen

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
    
    // Calculate comprehensive results
    const totalProblems = sessionState?.gridUpdates.length || 0
    const correctAnswers = sessionState?.gridUpdates.filter(u => u.lastAttemptCorrect).length || 0
    const accuracy = totalProblems > 0 ? Math.round((correctAnswers / totalProblems) * 100) : 0
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
    
    // Count newly mastered facts (those with consecutiveCorrect >= 3)
    const masteredFacts = sessionState?.gridUpdates.filter(u => u.consecutiveCorrect >= 3).length || 0
    
    const results = {
      totalProblems,
      correctAnswers,
      accuracy,
      timeSpent,
      starsEarned: correctAnswers, // Simple: 1 star per correct answer
      masteredFacts,
      sessionId: sessionState?.sessionId
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

  // Auto-start when component mounts (confirmation screen already shown in ReadyToPracticeScreen)
  useEffect(() => {
    if (!sessionStarted) {
      setSessionStarted(true)
      setStartTime(Date.now())
    }
  }, [])

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
      {onDashboardClick && (
        <SessionNavigationHeader onExitSession={onDashboardClick} />
      )}
      
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
