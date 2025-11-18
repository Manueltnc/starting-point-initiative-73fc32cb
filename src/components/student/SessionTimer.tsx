import { useEffect, useState } from 'react'
import { Clock, Zap, AlertCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface SessionTimerProps {
  startTime: number
  duration: number
  currentProblemIndex: number
  totalProblems: number
}

export function SessionTimer({ startTime, duration, currentProblemIndex, totalProblems }: SessionTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const remaining = Math.max(0, duration - elapsed)
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const percentComplete = Math.min(100, (currentProblemIndex / totalProblems) * 100)
  const percentTimeUsed = (elapsed / duration) * 100
  
  const isLowTime = remaining <= 60 && remaining > 0
  const isVeryLowTime = remaining <= 30 && remaining > 0

  return (
    <div className="w-full space-y-3">
      {/* Time Display */}
      <div className={`flex items-center justify-between p-4 rounded-lg transition-all ${
        isVeryLowTime ? 'bg-destructive/20 animate-pulse' : 
        isLowTime ? 'bg-warning/20' : 
        'bg-secondary/10'
      }`}>
        <div className="flex items-center gap-2">
          {isVeryLowTime ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : isLowTime ? (
            <Zap className="h-5 w-5 text-warning" />
          ) : (
            <Clock className="h-5 w-5 text-primary" />
          )}
          <span className="text-sm font-medium text-foreground">Time Remaining</span>
        </div>
        <div className={`text-2xl font-bold tabular-nums ${
          isVeryLowTime ? 'text-destructive' :
          isLowTime ? 'text-warning' :
          'text-primary'
        }`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">
            {currentProblemIndex} / {totalProblems} problems
          </span>
        </div>
        <Progress value={percentComplete} className="h-2" />
      </div>

      {/* Time Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Time Used</span>
          <span className="font-medium text-foreground">
            {Math.round(percentTimeUsed)}%
          </span>
        </div>
        <Progress 
          value={percentTimeUsed} 
          className={`h-1 transition-colors ${
            isVeryLowTime ? '[&>div]:bg-destructive' :
            isLowTime ? '[&>div]:bg-warning' :
            ''
          }`}
        />
      </div>
    </div>
  )
}
