import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { EquationProblem } from '@/components/ui/EquationDisplay'
import { MAX_TIME_PER_QUESTION_SECONDS } from '@/lib/config'
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import { NumericKeypad } from './NumericKeypad'
import type { MathProblem } from '@/types'
import { generateFeedback, getHint, type FeedbackContext } from '@/lib/feedback-messages'

interface UnifiedMathQuestionProps {
  problem: MathProblem
  onSubmitAnswer: (answer: number, timeSpent: number) => void
  showFeedback: boolean
  feedbackResult?: { correct: boolean; correctAnswer: number } | null
  disabled?: boolean
  // New props for enhanced feedback
  feedbackContext?: Partial<FeedbackContext>
}

export function UnifiedMathQuestion({
  problem,
  onSubmitAnswer,
  showFeedback,
  feedbackResult,
  disabled = false,
  feedbackContext
}: UnifiedMathQuestionProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  // Generate context-aware feedback
  const feedback = feedbackResult && feedbackContext ? generateFeedback({
    isCorrect: feedbackResult.correct,
    streak: feedbackContext.streak || 0,
    timeSpent: feedbackContext.timeSpent || timeSpent,
    difficulty: feedbackContext.difficulty || problem.difficulty,
    attempts: feedbackContext.attempts || 1,
    problemsCompleted: feedbackContext.problemsCompleted || 0,
    multiplicand: problem.multiplicand,
    multiplier: problem.multiplier
  }) : null

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
    <div className="flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Question and Feedback */}
          <div className="flex flex-col">
            <Card className="w-full bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
              <CardHeader className="text-center py-16">
                {showFeedback && feedbackResult ? (
                  feedbackResult.correct ? (
                    <div className="flex flex-col items-center gap-6">
                      <CheckCircle className="h-24 w-24 text-green-500 animate-bounce" />
                      <h2 className="text-5xl font-bold text-green-600 font-fredoka">
                        {feedback?.title || 'Awesome!'}
                      </h2>
                      {feedback?.message && (
                        <p className="text-xl text-green-600/80 font-fredoka">
                          {feedback.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6">
                      <XCircle className="h-24 w-24 text-orange-500" />
                      <h2 className="text-5xl font-bold text-orange-600 font-fredoka">
                        {feedback?.title || 'Not quite!'}
                      </h2>
                      {feedback?.encouragement && (
                        <p className="text-lg text-orange-600/80 font-fredoka mb-2">
                          {feedback.encouragement}
                        </p>
                      )}
                      <div className="mt-4">
                        <p className="text-xl text-muted-foreground mb-3 font-fredoka">
                          The correct answer is:
                        </p>
                        <p className="text-6xl font-bold text-primary font-fredoka">
                          {feedbackResult.correctAnswer}
                        </p>
                      </div>
                      {feedback?.showHint && (
                        <div className="mt-6 bg-blue-50 rounded-lg p-4 max-w-md">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-left">
                              <p className="text-sm font-semibold text-blue-900 mb-1">
                                💡 Helpful Hint:
                              </p>
                              <p className="text-sm text-blue-800">
                                {getHint(problem.multiplicand, problem.multiplier)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="py-12">
                    <div className="mb-4">
                      <p className="text-2xl font-fredoka text-primary/80 mb-6">Solve this problem:</p>
                    </div>
                    <EquationProblem
                      multiplicand={problem.multiplicand}
                      multiplier={problem.multiplier}
                      size="6xl"
                    />
                  </div>
                )}
              </CardHeader>
            </Card>
          </div>

          {/* Right Column: Keypad (Always Visible) */}
          <div className="flex items-start justify-center">
            <Card className="w-full border-2 border-primary/20">
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
