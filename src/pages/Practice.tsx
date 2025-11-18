import { useState, useEffect } from 'react'
import { useStudentIdentity } from '@/hooks/useStudentIdentity'
import { useStudentJourney } from '@/hooks/useStudentJourney'
import { PlacementTest } from '@/components/student/PlacementTest'
import { PracticeGrid } from '@/components/student/PracticeGrid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/ui/AppHeader'
import { Trophy, Target, Clock, ArrowLeft } from 'lucide-react'

interface PracticePageProps {
  onBack: () => void
  autoStart?: boolean
  desiredMode?: 'practice' | 'placement'
}

export function PracticePage({ onBack, autoStart = false, desiredMode }: PracticePageProps) {
  const { identity, clearIdentity } = useStudentIdentity()
  const { refreshJourneyState, needsPlacement, canStartPractice, loading: journeyLoading } = useStudentJourney()
  const [mode, setMode] = useState<'placement' | 'practice' | 'results' | null>(null)
  const [placementResults, setPlacementResults] = useState<any>(null)
  const [practiceResults, setPracticeResults] = useState<any>(null)

  const handleLogout = () => {
    clearIdentity()
    window.location.href = '/'
  }

  // Deterministic mode resolution based on desiredMode and journey state
  useEffect(() => {
    if (autoStart && identity?.email && !mode && !journeyLoading) {
      if (desiredMode === 'practice') {
        if (canStartPractice) {
          setMode('practice')
        } else if (needsPlacement) {
          // Don't set mode yet - will show gate screen
        }
      } else if (desiredMode === 'placement') {
        setMode('placement')
      } else {
        // Legacy auto-resolution when no desiredMode specified
        if (needsPlacement) {
          setMode('placement')
        } else if (canStartPractice) {
          setMode('practice')
        }
      }
    }
  }, [autoStart, identity?.email, mode, needsPlacement, canStartPractice, desiredMode, journeyLoading])

  const handlePlacementComplete = async (results: any) => {
    setPlacementResults(results)
    setMode('results')
    // Refresh journey state so the system knows placement is completed
    await refreshJourneyState()
  }

  const handlePracticeComplete = async (results: any) => {
    setPracticeResults(results)
    setMode('results')
    // Refresh journey state in case practice affected any stats
    await refreshJourneyState()
  }

  const handleStartPractice = () => {
    // Clear previous results before starting new session
    setPlacementResults(null)
    setPracticeResults(null)
    // Simply set mode to practice - let useEffect handle state synchronization
    setMode('practice')
  }

  const handleStartPlacement = () => {
    // Clear previous results before starting new session
    setPlacementResults(null)
    setPracticeResults(null)
    setMode('placement')
  }

  if (!identity?.email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 border-white/20">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please log in to access practice mode</p>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading screen while journey state is being fetched
  if (journeyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Gate screen: user wants practice but needs placement first
  if (desiredMode === 'practice' && needsPlacement && !mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 p-4">
        <div className="max-w-4xl mx-auto">
          <AppHeader onLogout={handleLogout} />
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 hover:shadow-lg transition-all">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-primary">Complete Placement First</CardTitle>
                <p className="text-muted-foreground">
                  You need to complete a placement test before starting practice sessions.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleStartPlacement} 
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105" 
                  size="lg"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Start Placement Test
                </Button>
                <Button onClick={onBack} variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'placement') {
    return (
      <PlacementTest
        email={identity.email}
        gradeLevel={identity.metadata?.grade_level || '3'}
        onComplete={handlePlacementComplete}
        onJourneyStateChange={async () => {
          // Refresh the parent's journey state when placement completes
          await refreshJourneyState()
        }}
      />
    )
  }

  if (mode === 'practice') {
    return (
      <PracticeGrid
        email={identity.email}
        gradeLevel={identity.metadata?.grade_level || '3'}
        onComplete={handlePracticeComplete}
      />
    )
  }

  // Results screen for both placement and practice sessions
  if (mode === 'results' && (placementResults || practiceResults)) {
    const results = placementResults || practiceResults
    const isPlacement = !!placementResults

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 p-4">
        <div className="max-w-4xl mx-auto">
          <AppHeader onLogout={handleLogout} />

          <Card className="backdrop-blur-sm bg-white/80 border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">
                {isPlacement ? 'Placement Test Complete!' : 'Practice Session Complete!'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-muted-foreground">Problems Attempted</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">{results.totalProblems}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-muted-foreground">Correct Answers</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">{results.correctAnswers}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-medium text-muted-foreground">Accuracy</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">{results.accuracy}%</p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  {isPlacement
                    ? 'Great job! Your placement test is complete. You can now start practicing multiplication problems.'
                    : 'Awesome work! Keep practicing to master more multiplication facts.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {isPlacement && (
                    <Button onClick={handleStartPractice} size="lg">
                      <Target className="h-4 w-4 mr-2" />
                      Start Practice Session
                    </Button>
                  )}
                  {!isPlacement && (
                    <Button onClick={handleStartPractice} size="lg">
                      <Target className="h-4 w-4 mr-2" />
                      Practice Again
                    </Button>
                  )}
                  <Button onClick={onBack} variant="outline" size="lg">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If we reach here, no mode is set and we should redirect to dashboard
  // This happens when accessing /practice directly without a desiredMode
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 p-4">
      <div className="max-w-4xl mx-auto">
        <AppHeader onLogout={handleLogout} />

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 border-white/20">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Please start your practice session from the dashboard.
              </p>
              <Button onClick={onBack} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
