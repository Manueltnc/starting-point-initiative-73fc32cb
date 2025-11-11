import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { EquationProblem } from '@/components/ui/EquationDisplay'
import { MAX_TIME_PER_QUESTION_SECONDS } from '@/lib/config'
import { CheckCircle, XCircle } from 'lucide-react'
import { NumericKeypad } from './NumericKeypad'
import type { MathProblem } from '@/types'

interface MathProblemProps {
  problem: MathProblem
  onAnswer: (answer: number, timeSpent: number) => Promise<{ correct: boolean }>
  onComplete: () => void
  isLastProblem?: boolean
}

export function MathProblem({ problem, onAnswer, onComplete, isLastProblem = false }: MathProblemProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [lastResult, setLastResult] = useState<{ correct: boolean; answer: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [advanceTimerRef, setAdvanceTimerRef] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear any pending advance timer when problem changes
    if (advanceTimerRef) {
      clearTimeout(advanceTimerRef)
      setAdvanceTimerRef(null)
    }

    setStartTime(Date.now())
    setTimeSpent(0)
    setUserAnswer('')
    setShowResult(false)
    setLastResult(null)
    setSubmitting(false)
  }, [problem])

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (advanceTimerRef) {
        clearTimeout(advanceTimerRef)
      }
    }
  }, [advanceTimerRef])

  const handleSubmit = useCallback(async () => {
    // Prevent multiple submissions
    if (submitting || showResult) return

    // If no answer provided (e.g., auto-submit at 3 minutes), use 0 as answer (will be marked incorrect)
    const answer = userAnswer ? parseInt(userAnswer) : 0
    if (isNaN(answer)) return

    try {
      setSubmitting(true)

      // Cap time spent at 3 minutes
      const cappedTimeSpent = Math.min(timeSpent, MAX_TIME_PER_QUESTION_SECONDS)

      console.log('Submitting answer (MathProblem):', { answer, timeSpent: cappedTimeSpent, problem, autoSubmitted: !userAnswer })

      const result = await onAnswer(answer, cappedTimeSpent)

      console.log('Answer submitted successfully (MathProblem):', result)

      setLastResult({ correct: result.correct, answer: problem.answer })
      setShowResult(true)
      setSubmitting(false)

      // Auto-advance after 2 seconds - store timer reference for cleanup
      const timer = setTimeout(() => {
        console.log('Auto-advance triggered (MathProblem)')

        if (isLastProblem) {
          onComplete()
        }
        // Note: For non-last problems, the parent (PracticeGrid) will handle advancing
        // and the useEffect will reset state when the problem prop changes
        setAdvanceTimerRef(null)
      }, 2000)

      setAdvanceTimerRef(timer)
    } catch (error) {
      console.error('Failed to submit answer (MathProblem):', error)
      // Reset submission state on error so user can try again
      setSubmitting(false)
    }
  }, [userAnswer, submitting, showResult, timeSpent, problem, onAnswer, isLastProblem, onComplete])

  // Timer: Update time spent while answering and auto-submit at 3 minutes
  useEffect(() => {
    if (startTime && !showResult && !submitting) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        setTimeSpent(elapsed)
        
        // Auto-submit if 3 minutes (180 seconds) reached
        if (elapsed >= MAX_TIME_PER_QUESTION_SECONDS) {
          // Auto-submit with current answer (or 0 if no answer) - will be marked incorrect if wrong
          const answerToSubmit = userAnswer ? parseInt(userAnswer) : 0
          if (!isNaN(answerToSubmit) && !submitting && !showResult) {
            handleSubmit()
          }
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [startTime, showResult, userAnswer, submitting, handleSubmit])

  const handleAnswerChange = (value: string) => {
    setUserAnswer(value)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Problem Display */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-8">
            <EquationProblem
              multiplicand={problem.multiplicand}
              multiplier={problem.multiplier}
              size="6xl"
              variant="horizontal"
              className="text-primary font-bold"
            />
          </div>
        </CardHeader>
        <CardContent>
          {showResult ? (
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3">
                {lastResult?.correct ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-500" />
                )}
                <span className={`text-4xl font-bold ${lastResult?.correct ? 'text-green-500' : 'text-red-500'}`}>
                  {lastResult?.correct ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              {!lastResult?.correct && (
                <p className="text-xl text-muted-foreground">
                  The correct answer is <span className="font-bold text-primary">{lastResult?.answer}</span>
                </p>
              )}
              {isLastProblem && (
                <p className="text-lg text-muted-foreground">
                  Great job! Session completed.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-4">
                Use the number pad to enter your answer
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Numeric Keypad */}
      {!showResult && (
        <Card className="backdrop-blur-sm bg-white/80 border-white/20">
          <CardContent className="p-6">
            <NumericKeypad
              value={userAnswer}
              onChange={handleAnswerChange}
              onSubmit={handleSubmit}
              disabled={submitting}
              maxLength={3}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
