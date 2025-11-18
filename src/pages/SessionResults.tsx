import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppHeader } from '@/components/ui/AppHeader'
import { useStudentIdentity } from '@/hooks/useStudentIdentity'
import { useStudentJourney } from '@/hooks/useStudentJourney'
import { useGridProgress } from '@/hooks/useGridProgress'
import { capitalizeName } from '@/lib/utils'
import { Trophy, Target, Clock, ArrowLeft } from 'lucide-react'
import { buildRoute } from '@/lib/routes'

interface SessionResultsProps {
  onLogout: () => void
  sessionType: 'placement' | 'practice'
}

interface SessionData {
  id: string
  totalProblems: number
  correctAnswers: number
  accuracy: number
  completedAt: string
}

export function SessionResults({ onLogout, sessionType }: SessionResultsProps) {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const { identity } = useStudentIdentity()
  const { canStartPractice, refreshJourneyState } = useStudentJourney()
  const { fetchProgress } = useGridProgress()
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  const rawDisplayName = identity?.metadata?.display_name || identity?.email || 'Student'
  const displayName = capitalizeName(rawDisplayName)
  const firstName = displayName.split(' ')[0]

  // Fetch session results from database
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId || !identity?.id) {
        navigate(buildRoute.home())
        return
      }

      try {
        const { supabase } = await import('@/integrations/supabase/client')
        const { data, error } = await supabase
          .from('multiplications_app_learning_sessions')
          .select('id, completed_items, correct_answers, accuracy, completed_at')
          .eq('id', sessionId)
          .eq('student_id', identity.id)
          .single()

        if (error || !data) {
          console.error('Failed to fetch session results:', error)
          navigate(buildRoute.home())
          return
        }

        setSessionData({
          id: data.id,
          totalProblems: data.completed_items || 0,
          correctAnswers: data.correct_answers || 0,
          accuracy: data.accuracy || 0,
          completedAt: data.completed_at || new Date().toISOString(),
        })
      } catch (error) {
        console.error('Error fetching session data:', error)
        navigate(buildRoute.home())
      } finally {
        setLoading(false)
      }
    }

    fetchSessionData()

    // Refresh journey state and progress
    const refreshData = async () => {
      await refreshJourneyState()
      if (identity?.email) {
        await fetchProgress(identity.email, identity.metadata?.grade_level || '3')
      }
    }
    refreshData()
  }, [sessionId, identity, navigate, refreshJourneyState, fetchProgress])

  const handleStartPractice = () => {
    navigate(buildRoute.practiceReady())
  }

  const handleBackToDashboard = () => {
    navigate(buildRoute.home())
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!sessionData) {
    return null
  }

  const isPlacement = sessionType === 'placement'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 p-4">
      <div className="max-w-4xl mx-auto">
        <AppHeader onLogout={onLogout} showLogout={true} userName={firstName} />

        <div className="flex items-center justify-center pt-12">
          <Card className="w-full max-w-2xl backdrop-blur-sm bg-white/80 border-white/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-20 h-20 rounded-full flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-primary">
                {isPlacement ? 'Placement Test Complete!' : 'Practice Session Complete!'}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {isPlacement
                  ? 'Great job! Your placement test is complete. You can now start practicing multiplication problems.'
                  : 'Awesome work! Keep practicing to master more multiplication facts.'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">Problems Attempted</p>
                  <p className="text-4xl font-bold text-primary">{sessionData.totalProblems}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">Correct Answers</p>
                  <p className="text-4xl font-bold text-primary">{sessionData.correctAnswers}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">Accuracy</p>
                  <p className="text-4xl font-bold text-primary">{Math.round(sessionData.accuracy)}%</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                {isPlacement && canStartPractice && (
                  <Button
                    onClick={handleStartPractice}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    size="lg"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Start Practice Session
                  </Button>
                )}
                {!isPlacement && (
                  <Button
                    onClick={handleStartPractice}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    size="lg"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Practice Again
                  </Button>
                )}
                <Button onClick={handleBackToDashboard} variant="outline" size="lg">
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
