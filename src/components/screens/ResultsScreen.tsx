import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Trophy, Target, CheckCircle2, Clock, Star, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

interface ResultsScreenProps {
  sessionType: 'placement' | 'practice'
  results: {
    totalProblems: number
    correctAnswers: number
    accuracy: number
    timeSpent?: number
    starsEarned?: number
    masteredFacts?: number
    guardrailsLevel?: string
  }
  onBackToDashboard: () => void
  onPracticeMore: () => void
}

export function ResultsScreen({
  sessionType,
  results,
  onBackToDashboard,
  onPracticeMore
}: ResultsScreenProps) {
  const isPlacement = sessionType === 'placement'
  const { totalProblems, correctAnswers, accuracy, timeSpent, starsEarned, masteredFacts, guardrailsLevel } = results

  // Confetti on high performance
  useEffect(() => {
    if (accuracy >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }, [accuracy])

  const getMotivationalMessage = () => {
    if (accuracy >= 90) {
      return {
        text: isPlacement 
          ? "AMAZING! You're a multiplication master! 🌟"
          : "SPECTACULAR! You're crushing it! 🌟",
        color: "text-green-600"
      }
    } else if (accuracy >= 70) {
      return {
        text: isPlacement
          ? "Great work! You're off to a strong start! ⭐"
          : "Great effort! You're getting stronger every day! ⭐",
        color: "text-primary"
      }
    } else if (accuracy >= 50) {
      return {
        text: isPlacement
          ? "Nice work! We'll build on this foundation! 💪"
          : "Nice effort! Keep practicing - you've got this! 💪",
        color: "text-amber-600"
      }
    } else {
      return {
        text: isPlacement
          ? "Every problem solved is progress! Let's keep learning! 🚀"
          : "Every problem is a step forward! Keep going! 🚀",
        color: "text-secondary"
      }
    }
  }

  const message = getMotivationalMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 p-4">
      <div className="max-w-4xl mx-auto pt-4">
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center pb-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold">
                {isPlacement ? 'Placement Test Complete!' : 'Session Complete!'}
              </h2>
            </CardHeader>

            <CardContent className="pt-8 space-y-6">
              {/* Accuracy Circle */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-primary/30">
                  <span className="text-6xl font-bold text-primary">{accuracy}%</span>
                </div>
                <p className={`text-xl font-semibold mt-4 ${message.color}`}>
                  {message.text}
                </p>
              </div>

              {/* Placement-specific message */}
              {isPlacement && guardrailsLevel && (
                <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">
                    We've created your personalized learning path!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You'll start with tables {guardrailsLevel}
                  </p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                  <CardContent className="pt-6 pb-4 text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-primary">{correctAnswers}/{totalProblems}</p>
                    <p className="text-xs text-muted-foreground mt-1">Problems Correct</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/5 to-transparent border-green-500/20">
                  <CardContent className="pt-6 pb-4 text-center">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Accuracy</p>
                  </CardContent>
                </Card>

                {!isPlacement && timeSpent && (
                  <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
                    <CardContent className="pt-6 pb-4 text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                      <p className="text-2xl font-bold text-amber-600">{Math.round(timeSpent / 60)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Minutes</p>
                    </CardContent>
                  </Card>
                )}

                {!isPlacement && starsEarned !== undefined && (
                  <Card className="bg-gradient-to-br from-yellow-500/5 to-transparent border-yellow-500/20">
                    <CardContent className="pt-6 pb-4 text-center">
                      <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <p className="text-2xl font-bold text-yellow-600">{starsEarned}</p>
                      <p className="text-xs text-muted-foreground mt-1">Stars Earned</p>
                    </CardContent>
                  </Card>
                )}

                {!isPlacement && masteredFacts !== undefined && masteredFacts > 0 && (
                  <Card className="col-span-2 bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20">
                    <CardContent className="pt-6 pb-4 text-center">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold text-purple-600">{masteredFacts}</p>
                      <p className="text-xs text-muted-foreground mt-1">Facts Mastered</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={onBackToDashboard}
                  className="flex-1"
                  size="lg"
                >
                  Back to Dashboard
                </Button>
                {!isPlacement && (
                  <Button
                    onClick={onPracticeMore}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    Practice More
                  </Button>
                )}
              </div>

              {/* Encouraging footer */}
              <p className="text-center text-sm text-muted-foreground pt-2">
                {isPlacement 
                  ? "Great job completing the placement test! Let's start practicing! 🎉"
                  : "Keep up the amazing work! Come back tomorrow for more practice. 📚"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
