import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppHeader } from '@/components/ui/AppHeader'
import { useStudentIdentity } from '@/hooks/useStudentIdentity'
import { capitalizeName } from '@/lib/utils'
import { Play, ArrowLeft } from 'lucide-react'
import { buildRoute } from '@/lib/routes'

interface PracticeReadyProps {
  onLogout: () => void
}

export function PracticeReady({ onLogout }: PracticeReadyProps) {
  const navigate = useNavigate()
  const { identity } = useStudentIdentity()

  const rawDisplayName = identity?.metadata?.display_name || identity?.email || 'Student'
  const displayName = capitalizeName(rawDisplayName)
  const firstName = displayName.split(' ')[0]

  const handleStartPractice = () => {
    // Navigation will happen in PracticeActive component after session creation
    navigate(buildRoute.practiceActive('new'))
  }

  const handleBack = () => {
    navigate(buildRoute.home())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 p-4">
      <div className="max-w-4xl mx-auto">
        <AppHeader onLogout={onLogout} showLogout={true} userName={firstName} />

        <div className="flex items-center justify-center pt-20">
          <Card className="w-full max-w-lg backdrop-blur-sm bg-white/80 border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">Ready to Practice?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Practice Session Details:</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>10-minute timed practice session</li>
                  <li>Focus on multiplication facts you haven't mastered</li>
                  <li>Adaptive difficulty based on your progress</li>
                  <li>Track your improvements in real-time</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleStartPractice}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  size="lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Practice
                </Button>
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
