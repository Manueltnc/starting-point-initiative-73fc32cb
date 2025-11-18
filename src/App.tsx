import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useStudentIdentity } from '@/hooks/useStudentIdentity'
import { LoginPage } from '@/pages/Login'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { LoadingScreen } from '@/components/screens/LoadingScreen'
import { DashboardScreen } from '@/components/screens/DashboardScreen'
import { ReadyToPracticeScreen } from '@/components/screens/ReadyToPracticeScreen'
import { ActiveSessionScreen } from '@/components/screens/ActiveSessionScreen'
import { ResultsScreen } from '@/components/screens/ResultsScreen'
import { useStudentJourney } from '@/hooks/useStudentJourney'
import { capitalizeName } from '@/lib/utils'

type ScreenState = 'email' | 'loading' | 'dashboard' | 'ready-to-practice' | 'session' | 'results'
type SessionType = 'placement' | 'practice' | null

function StudentApp() {
  const { identity, loading: identityLoading, clearIdentity } = useStudentIdentity()
  const { loading: journeyLoading, shouldShowPlacement, canStartPractice, refreshJourneyState } = useStudentJourney()
  const [screen, setScreen] = useState<ScreenState>('email')
  const [sessionType, setSessionType] = useState<SessionType>(null)
  const [sessionResults, setSessionResults] = useState<any>(null)

  // Initialize screen based on identity
  useEffect(() => {
    if (identityLoading) return
    
    if (!identity) {
      setScreen('email')
    } else if (screen === 'email') {
      // User just logged in, show loading
      setScreen('loading')
    }
  }, [identity, identityLoading, screen])

  // Transition from loading to dashboard
  useEffect(() => {
    if (screen === 'loading' && !journeyLoading) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setScreen('dashboard')
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [screen, journeyLoading])

  const handleLogout = () => {
    clearIdentity()
    setScreen('email')
    setSessionType(null)
    setSessionResults(null)
    window.location.reload()
  }

  const handleStartSession = (type: 'placement' | 'practice') => {
    setSessionType(type)
    setScreen('ready-to-practice')
  }

  const handleSessionStart = () => {
    setScreen('session')
  }

  const handleSessionComplete = (results: any) => {
    setSessionResults(results)
    setScreen('results')
  }

  const handleAbandonSession = async () => {
    // Mark session as abandoned and return to dashboard
    await refreshJourneyState()
    setSessionType(null)
    setScreen('dashboard')
  }

  const handleBackToDashboard = async () => {
    await refreshJourneyState()
    setSessionType(null)
    setSessionResults(null)
    setScreen('dashboard')
  }

  const handlePracticeMore = () => {
    setSessionType('practice')
    setSessionResults(null)
    setScreen('ready-to-practice')
  }

  const rawDisplayName = identity?.metadata?.display_name || identity?.email || 'Student'
  const displayName = capitalizeName(rawDisplayName)
  const firstName = displayName.split(' ')[0]

  // Screen Rendering
  if (!identity || screen === 'email') {
    return <LoginPage onLogin={() => setScreen('loading')} />
  }

  if (screen === 'loading') {
    return <LoadingScreen />
  }

  if (screen === 'dashboard') {
    return (
      <DashboardScreen
        onStartSession={handleStartSession}
        onLogout={handleLogout}
        shouldShowPlacement={shouldShowPlacement}
        canStartPractice={canStartPractice}
      />
    )
  }

  if (screen === 'ready-to-practice' && sessionType) {
    return (
      <ReadyToPracticeScreen
        sessionType={sessionType}
        onStartSession={handleSessionStart}
        userName={firstName}
      />
    )
  }

  if (screen === 'session' && sessionType && identity) {
    return (
      <ActiveSessionScreen
        sessionType={sessionType}
        email={identity.email}
        gradeLevel={identity.metadata?.grade_level || '3'}
        onComplete={handleSessionComplete}
        onAbandon={handleAbandonSession}
      />
    )
  }

  if (screen === 'results' && sessionResults && sessionType) {
    return (
      <ResultsScreen
        sessionType={sessionType}
        results={sessionResults}
        onBackToDashboard={handleBackToDashboard}
        onPracticeMore={handlePracticeMore}
        userName={firstName}
      />
    )
  }

  // Fallback to dashboard
  return (
    <DashboardScreen
      onStartSession={handleStartSession}
      onLogout={handleLogout}
      shouldShowPlacement={shouldShowPlacement}
      canStartPractice={canStartPractice}
    />
  )
}

function App() {
  const handleAdminLogout = () => {
    window.location.href = '/'
  }

  return (
    <Router>
      <Routes>
        {/* Public Admin Route */}
        <Route path="/admin" element={<AdminDashboard onLogout={handleAdminLogout} />} />

        {/* Student Single-Page App - State-based navigation */}
        <Route path="/*" element={<StudentApp />} />
      </Routes>
    </Router>
  )
}

export default App
