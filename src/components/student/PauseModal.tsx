/**
 * Pause Modal
 *
 * Shown when student pauses their session.
 * Displays current progress and offers options to:
 * - Resume session
 * - Exit session
 */

import { Play, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatTime } from '@/lib/feedback-messages'

interface PauseModalProps {
  currentProblem: number
  totalProblems: number
  timeElapsed: number
  correctAnswers: number
  onResume: () => void
  onExit: () => void
}

export function PauseModal({
  currentProblem,
  totalProblems,
  timeElapsed,
  correctAnswers,
  onResume,
  onExit
}: PauseModalProps) {
  const progress = (currentProblem / totalProblems) * 100
  const accuracy = currentProblem > 0 ? (correctAnswers / currentProblem) * 100 : 0

  return (
    <Dialog open={true} onOpenChange={() => onResume()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Session Paused ⏸️</DialogTitle>
          <DialogDescription className="text-center">
            Take a break! Your progress is saved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4">
            <p className="text-sm font-medium text-primary mb-3">
              Your Progress:
            </p>

            <Progress value={progress} className="mb-3" />

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{currentProblem}</p>
                <p className="text-xs text-muted-foreground">answered</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{Math.round(accuracy)}%</p>
                <p className="text-xs text-muted-foreground">accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{formatTime(timeElapsed)}</p>
                <p className="text-xs text-muted-foreground">elapsed</p>
              </div>
            </div>
          </div>

          {/* Encouragement */}
          <div className="text-center py-2">
            <p className="text-muted-foreground">
              When you're ready, click <strong>Resume</strong> to continue where you left off.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onExit} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Exit Session
          </Button>
          <Button onClick={onResume} className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
            <Play className="h-4 w-4 mr-2" />
            Resume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
