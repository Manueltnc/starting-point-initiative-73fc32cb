import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { EquationProblem } from '@/components/ui/EquationDisplay'
import { MAX_TIME_PER_QUESTION_SECONDS } from '@/lib/config'
import { CheckCircle, XCircle } from 'lucide-react'
import { NumericKeypad } from './NumericKeypad'
import type { MathProblem } from '@/types'

interface UnifiedMathQuestionProps {
  problem: MathProblem
  onSubmitAnswer: (answer: number, timeSpent: number) => void
  showFeedback: boolean
  feedbackResult?: { correct: boolean; correctAnswer: number } | null
  disabled?: boolean
}

export function UnifiedMathQuestion({ 
  problem, 
  onSubmitAnswer, 
  showFeedback, 
  feedbackResult,
  disabled = false 
}: UnifiedMathQuestionProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  // Reset state when problem changes
  useEffect(() => {
    setStartTime(Date.now())
    setTimeSpent(0)
    setUserAnswer('')
  }, [problem])

  // Timer: Update time spent while answering and auto-submit at 3 minutes
  useEffect(() => {
    if (startTime && !showFeedback && !disabled) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        setTimeSpent(elapsed)
        
        // Auto-submit if 3 minutes (180 seconds) reached
        if (elapsed >= MAX_TIME_PER_QUESTION_SECONDS) {
          handleSubmit()
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [startTime, showFeedback, disabled])

  const handleSubmit = useCallback(() => {
    if (disabled || showFeedback) return

    // If no answer provided (e.g., auto-submit at 3 minutes), use 0 as answer (will be marked incorrect)
    const answer = userAnswer ? parseInt(userAnswer) : 0
    if (isNaN(answer)) return

    // Cap time spent at 3 minutes
    const cappedTimeSpent = Math.min(timeSpent, MAX_TIME_PER_QUESTION_SECONDS)

    onSubmitAnswer(answer, cappedTimeSpent)
  }, [userAnswer, timeSpent, disabled, showFeedback, onSubmitAnswer])

  const handleAnswerChange = (value: string) => {
    if (disabled || showFeedback) return
    setUserAnswer(value)
  }

  return (
    <div className="flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Question and Feedback */}
          <div className="flex items-center justify-center">
            <Card className="w-full">
              <CardHeader className="text-center py-12">
                {showFeedback && feedbackResult ? (
                  feedbackResult.correct ? (
                    <div className="flex flex-col items-center gap-6">
                      <CheckCircle className="h-24 w-24 text-green-500" />
                      <h2 className="text-5xl font-bold text-green-600">Correct!</h2>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6">
                      <XCircle className="h-24 w-24 text-red-500" />
                      <h2 className="text-5xl font-bold text-red-600">Incorrect</h2>
                      <div className="mt-4">
                        <p className="text-xl text-muted-foreground mb-3">
                          The correct answer is:
                        </p>
                        <p className="text-6xl font-bold text-primary">
                          {feedbackResult.correctAnswer}
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="py-8">
                    <EquationProblem
                      multiplicand={problem.multiplicand}
                      multiplier={problem.multiplier}
                      size="2xl"
                    />
                  </div>
                )}
              </CardHeader>
            </Card>
          </div>

          {/* Right Column: Keypad (Always Visible) */}
          <div className="flex items-center justify-center">
            <Card className="w-full">
              <CardContent className="px-6 py-8">
                <NumericKeypad
                  value={userAnswer}
                  onChange={handleAnswerChange}
                  onSubmit={handleSubmit}
                  disabled={disabled || showFeedback}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
