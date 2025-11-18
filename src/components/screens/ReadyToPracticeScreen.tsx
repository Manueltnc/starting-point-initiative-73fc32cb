import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppHeader } from '@/components/ui/AppHeader'
import { Sparkles, Trophy, CheckCircle2 } from 'lucide-react'

interface ReadyToPracticeScreenProps {
  sessionType: 'placement' | 'practice'
  onStartSession: () => void
  userName?: string
}

export function ReadyToPracticeScreen({ sessionType, onStartSession, userName }: ReadyToPracticeScreenProps) {
  const isPlacement = sessionType === 'placement'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 p-4">
      <div className="max-w-4xl mx-auto">
        <AppHeader showLogout={false} userName={userName} />

        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                {isPlacement ? (
                  <Sparkles className="h-10 w-10 text-white" />
                ) : (
                  <Trophy className="h-10 w-10 text-white" />
                )}
              </div>
              <CardTitle className="text-3xl font-bold">
                {isPlacement ? 'Placement Test' : 'Practice Session'}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {isPlacement 
                  ? "Let's find the perfect starting point for your math journey!"
                  : "Time to practice and master your multiplication facts!"}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                {isPlacement ? (
                  <>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">You'll solve 81 multiplication problems (9×9 grid)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Take your time - there's no time limit</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">We'll use your results to create your personalized learning path</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Don't worry about getting them all right - just do your best!</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Practice for up to 10 minutes</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Focus on problems you haven't mastered yet</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Get 3 in a row correct to master a fact!</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">You can exit anytime - your progress is automatically saved</p>
                    </div>
                  </>
                )}
              </div>

              <Button 
                onClick={onStartSession}
                size="lg"
                className="w-full text-lg"
              >
                {isPlacement ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Placement Test
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 h-5 w-5" />
                    Start Practice
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {isPlacement 
                  ? "Ready when you are! Take a deep breath and let's begin."
                  : "Let's make some progress today! 🎯"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
