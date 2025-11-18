import { useEffect } from 'react'
import { Trophy, Star, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

interface MasteryBadgeProps {
  show: boolean
  multiplicand: number
  multiplier: number
  onComplete: () => void
}

export function MasteryBadge({ show, multiplicand, multiplier, onComplete }: MasteryBadgeProps) {
  useEffect(() => {
    if (show) {
      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB']
      })

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        onComplete()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-primary via-secondary to-accent p-8 rounded-2xl shadow-2xl animate-in zoom-in duration-500 max-w-md mx-4">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-yellow-300 to-yellow-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="h-14 w-14 text-yellow-900" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-300 animate-spin" />
            <Star className="absolute -bottom-2 -left-2 h-6 w-6 text-yellow-400 animate-pulse" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">
              🎉 Mastery Achieved! 🎉
            </h2>
            <p className="text-xl text-white/90">
              You've mastered <span className="font-bold text-yellow-300">{multiplicand} × {multiplier}</span>!
            </p>
          </div>

          {/* Badge */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30">
            <p className="text-white text-sm font-medium mb-2">
              Three correct answers in a row!
            </p>
            <div className="flex justify-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
            </div>
          </div>

          <p className="text-white/80 text-sm">
            Keep up the amazing work! 🌟
          </p>
        </div>
      </div>
    </div>
  )
}
