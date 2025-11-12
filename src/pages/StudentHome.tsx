import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AppHeader } from '@/components/ui/AppHeader'
import { useStudentIdentity } from '@/hooks/useStudentIdentity'
import { useGridProgress } from '@/hooks/useGridProgress'
import { useStudentJourney } from '@/hooks/useStudentJourney'
import { Target, Trophy, BarChart3, Play, BookOpen, Star, Sparkles, Clock, Award } from 'lucide-react'
import { ProgressGridModal } from '@/components/student/ProgressGridModal'

interface StudentHomeProps {
  onStartPlacement: (mode: 'placement') => void
  onStartPractice: (mode: 'practice') => void
  onViewProgress: () => void
  onLogout: () => void
}

export function StudentHome({ onStartPlacement, onStartPractice, onViewProgress, onLogout }: StudentHomeProps) {
  const { identity } = useStudentIdentity()
  const { progress, loading: progressLoading, fetchProgress, getMasteryPercentage, getGuardrailMasteryPercentage } = useGridProgress()
  const { loading: journeyLoading, shouldShowPlacement, canStartPractice } = useStudentJourney()
  const [showProgressModal, setShowProgressModal] = useState(false)

  useEffect(() => {
    if (identity?.email) {
      // Fetch progress (only if practice is ready)
      if (canStartPractice) {
        fetchProgress(identity.email, identity.metadata?.grade_level || '3')
      }
    }
  }, [identity, fetchProgress, canStartPractice])

  if (journeyLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const displayName = identity?.metadata?.display_name || identity?.email || 'Student'
  const gradeLevel = identity?.metadata?.grade_level || '3'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <AppHeader onLogout={onLogout} showLogout={true} userName={displayName} />

        {/* Concise Metrics Overview */}
        {progress && (
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Overall Mastery Card */}
              <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 hover:shadow-lg transition-all">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Trophy className="h-5 w-5 text-primary" />
                    <p className="text-xs text-muted-foreground">Overall Mastery</p>
                  </div>
                  <p className="text-2xl font-bold text-primary text-center">{getMasteryPercentage()}%</p>
                </CardContent>
              </Card>

              {/* Guardrail Mastery Card */}
              <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30 hover:shadow-lg transition-all">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Target className="h-5 w-5 text-secondary" />
                    <p className="text-xs text-muted-foreground">Guardrail Mastery</p>
                  </div>
                  <p className="text-2xl font-bold text-secondary text-center">{getGuardrailMasteryPercentage()}%</p>
                </CardContent>
              </Card>

              {/* Total Correct Card */}
              <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30 hover:shadow-lg transition-all">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <BarChart3 className="h-5 w-5 text-accent" />
                    <p className="text-xs text-muted-foreground">Total Correct</p>
                  </div>
                  <p className="text-2xl font-bold text-accent text-center">{progress.totalCorrectAnswers}</p>
                </CardContent>
              </Card>

              {/* Mastered Facts Card */}
              <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 hover:shadow-lg transition-all">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Star className="h-5 w-5 text-primary" />
                    <p className="text-xs text-muted-foreground">Mastered Facts</p>
                  </div>
                  <p className="text-2xl font-bold text-primary text-center">
                    {progress.gridState.flat().filter(cell => cell.consecutiveCorrect >= 3).length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Practice Session Card - Full width, prominent, white background */}
        {canStartPractice && (
          <div className="mb-6">
            <Card className="bg-white border-2 border-primary/20 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center">
                        <Target className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-primary">Practice Session</h2>
                        <p className="text-muted-foreground">
                          Practice multiplication problems for up to 10 minutes. Focus on problems you haven't mastered yet!
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center lg:justify-end">
                    <Button 
                      onClick={() => onStartPractice('practice')} 
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 text-lg px-8 py-6"
                      size="lg"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start Practice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Grid Card - Full width, prominent, orange/yellow gradient */}
        {canStartPractice && (
          <div className="mb-6">
            <Card className="bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 border-0 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center shadow-md">
                        <BarChart3 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-300">Progress Grid</h2>
                        <p className="text-muted-foreground">
                          View your detailed progress grid and see which multiplication facts you've mastered.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center lg:justify-end">
                    <Button 
                      onClick={onViewProgress} 
                      variant="outline" 
                      className="text-lg px-8 py-6 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      size="lg"
                    >
                      <BarChart3 className="h-5 w-5 mr-2" />
                      View Full Progress
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Placement Test Card - Full width when needed */}
        {shouldShowPlacement && (
          <div className="mb-8">
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90 transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-primary" />
                  Placement Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  <div>
                    <p className="text-lg text-muted-foreground mb-6">
                      Take a placement test to determine your starting level and create your personalized learning path. 
                      This helps us understand your current skills and provide you with the perfect challenges to help you grow!
                    </p>
                    <Button 
                      onClick={() => onStartPlacement('placement')} 
                      className="w-full lg:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105" 
                      size="lg"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start Placement Test
                    </Button>
                  </div>
                  <div className="flex justify-center lg:justify-end">
                    <div className="text-6xl">🧙‍♂️</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filler Cards - Second row when placement test is shown */}
        {shouldShowPlacement && !canStartPractice && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fun Math Facts Card */}
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Fun Math Facts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      🧮 Did you know? 7 × 8 = 56 is one of the trickiest multiplication facts!
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      ⚡ Quick tip: Any number × 10 = just add a zero at the end!
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      🎯 Practice makes perfect! The more you practice, the faster you'll get!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn Card */}
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-500" />
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Master all multiplication facts 1-12</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Build speed and accuracy</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Track your progress with fun games</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Earn achievements and rewards</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How It Works Card */}
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Take Placement Test</p>
                      <p className="text-xs text-muted-foreground">We'll find your perfect starting level</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Practice & Learn</p>
                      <p className="text-xs text-muted-foreground">Work on problems at your level</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Track Progress</p>
                      <p className="text-xs text-muted-foreground">Watch your skills improve over time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}



        {/* Bottom encouragement section for placement test only */}
        {shouldShowPlacement && !canStartPractice && (
          <div className="mt-8">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold text-primary">Ready to Begin Your Journey?</h3>
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of students who have already discovered the magic of multiplication! 
                Your adventure starts with just one click. Take the placement test to unlock your personalized learning path.
              </p>
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Personalized Learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Fun & Engaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Track Progress</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Grid Modal */}
        {identity?.email && (
          <ProgressGridModal
            email={identity.email}
            gradeLevel={identity.metadata?.grade_level || '3'}
            isOpen={showProgressModal}
            onClose={() => setShowProgressModal(false)}
          />
        )}
      </div>
    </div>
  )
}
