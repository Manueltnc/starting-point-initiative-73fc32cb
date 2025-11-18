/**
 * Session Progress Header
 *
 * Shows progress indicators during active sessions:
 * - Progress bar
 * - Current question / total
 * - Accuracy percentage
 * - Current streak (if applicable)
 * - Time elapsed
 * - Pause button (optional)
 */

import { Target, Flame, Clock, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatTime } from '@/lib/feedback-messages'

interface SessionProgressHeaderProps {
  currentProblem: number
  totalProblems: number
  correctAnswers: number
  currentStreak: number
  timeElapsed: number
  onPause?: () => void
}

export function SessionProgressHeader({
  currentProblem,
  totalProblems,
  correctAnswers,
  currentStreak,
  timeElapsed,
  onPause
}: SessionProgressHeaderProps) {
  const progress = (currentProblem / totalProblems) * 100
  const accuracy = currentProblem > 0 ? (correctAnswers / currentProblem) * 100 : 0

  return (
    <div className="sticky top-0 z-10 bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">
              Question {currentProblem} of {totalProblems}
            </span>
            <span className="text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            {/* Accuracy */}
            {currentProblem > 0 && (
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-green-500" />
                <span className="font-medium">{Math.round(accuracy)}%</span>
                <span className="text-muted-foreground">accuracy</span>
              </div>
            )}

            {/* Streak */}
            {currentStreak > 0 && (
              <div className="flex items-center gap-1 animate-pulse">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-bold text-orange-600">
                  {currentStreak} in a row!
                </span>
              </div>
            )}

            {/* Time */}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">
                {formatTime(timeElapsed)}
              </span>
            </div>
          </div>

          {/* Pause Button */}
          {onPause && (
            <Button variant="outline" size="sm" onClick={onPause}>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
