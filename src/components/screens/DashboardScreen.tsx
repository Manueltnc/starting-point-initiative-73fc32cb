import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppHeader } from '@/components/ui/AppHeader'
import { useStudentIdentity } from '@/hooks/useStudentIdentity'
import { useGridProgress } from '@/hooks/useGridProgress'
import { capitalizeName } from '@/lib/utils'
import { Target, Trophy, BarChart3, Play, Star, Sparkles, Award, Grid3x3 } from 'lucide-react'
import { ProgressGridModal } from '@/components/student/ProgressGridModal'
import { supabase } from '@/integrations/supabase/client'

interface DashboardScreenProps {
  onStartSession: (type: 'placement' | 'practice') => void
  onLogout: () => void
  shouldShowPlacement: boolean
  canStartPractice: boolean
}

export function DashboardScreen({ onStartSession, onLogout, shouldShowPlacement, canStartPractice }: DashboardScreenProps) {
  const { identity } = useStudentIdentity()
  const { progress, loading: progressLoading, fetchProgress, getMasteryPercentage } = useGridProgress()
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [totalSessions, setTotalSessions] = useState(0)

  // Check for stale sessions on mount
  useEffect(() => {
    const checkForActiveSessions = async () => {
      if (!identity?.id) return

      const { data: sessions } = await supabase
        .rpc('get_active_sessions_for_student', { student_uuid: identity.id })

      if (sessions && sessions.length > 0) {
        const session = sessions[0]
        const lastActivity = new Date(session.last_activity_at)
        const now = new Date()
        const minutesSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60)

        if (minutesSinceActivity > 30) {
          await supabase
            .from('multiplications_app_learning_sessions')
            .update({ status: 'abandoned' })
            .eq('id', session.id)
        }
      }
    }

    checkForActiveSessions()
  }, [identity])

  // Fetch progress and session count
  useEffect(() => {
    if (identity?.email && canStartPractice) {
      fetchProgress(identity.email, identity.metadata?.grade_level || '3')
      
      // Fetch total sessions
      supabase
        .from('multiplications_app_learning_sessions')
        .select('id', { count: 'exact' })
        .eq('student_id', identity.id)
        .eq('status', 'completed')
        .then(({ count }) => setTotalSessions(count || 0))
    }
  }, [identity, fetchProgress, canStartPractice])

  if (progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const rawDisplayName = identity?.metadata?.display_name || identity?.email || 'Student'
  const displayName = capitalizeName(rawDisplayName)
  const firstName = displayName.split(' ')[0]

  const masteryPercentage = getMasteryPercentage()
  const totalAttempts = progress?.totalAttempts || 0
  const totalCorrect = progress?.totalCorrectAnswers || 0
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 p-4">
      <div className="max-w-4xl mx-auto">
        <AppHeader onLogout={onLogout} showLogout={true} userName={firstName} />

        {/* Quick Stats */}
        {progress && (
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground">
              ⭐ {totalCorrect} Problems Solved | 🎯 {masteryPercentage}% Mastery
            </p>
          </div>
        )}

        {/* Stats Grid */}
        {progress && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 hover:shadow-lg transition-all">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">Overall Mastery</p>
                </div>
                <p className="text-3xl font-bold text-center text-primary">{masteryPercentage}%</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30 hover:shadow-lg transition-all">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Target className="h-5 w-5 text-green-600" />
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
                <p className="text-3xl font-bold text-center text-green-600">{overallAccuracy}%</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/30 hover:shadow-lg transition-all">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
                <p className="text-3xl font-bold text-center text-amber-600">{totalSessions}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 hover:shadow-lg transition-all">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <p className="text-xs text-muted-foreground">Problems</p>
                </div>
                <p className="text-3xl font-bold text-center text-yellow-600">{totalCorrect}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Call-to-Action */}
        <Card className="mb-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/30 max-w-2xl mx-auto">
          <CardContent className="pt-6 pb-6">
            {shouldShowPlacement ? (
              <Button
                onClick={() => onStartSession('placement')}
                size="lg"
                className="w-full text-lg h-16"
              >
                <Sparkles className="mr-2 h-6 w-6" />
                Take Placement Test
              </Button>
            ) : (
              <Button
                onClick={() => onStartSession('practice')}
                size="lg"
                className="w-full text-lg h-16"
              >
                <Play className="mr-2 h-6 w-6" />
                Start Practice Session
              </Button>
            )}
            <p className="text-center text-sm text-muted-foreground mt-3">
              {shouldShowPlacement 
                ? "Let's find your perfect starting point!"
                : "Ready to practice and improve your skills?"}
            </p>
          </CardContent>
        </Card>

        {/* Progress Grid Card */}
        {progress && (
          <Card className="mb-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => setShowProgressModal(true)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Grid3x3 className="h-5 w-5 text-primary" />
                View Your Progress Grid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                See your mastery progress across all multiplication facts (1-12)
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Facts: 144</span>
                <span className="text-primary font-semibold">
                  {Math.round((masteryPercentage / 100) * 144)} Mastered
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Badges/Achievements placeholder */}
        {masteryPercentage >= 50 && (
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-purple-600" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Halfway Hero</p>
                  <p className="text-xs text-muted-foreground">Mastered 50% of multiplication facts!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Progress Grid Modal */}
      {showProgressModal && identity && (
        <ProgressGridModal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          email={identity.email}
          gradeLevel={identity.metadata?.grade_level || '3'}
        />
      )}
    </div>
  )
}
