import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { useStudentIdentity } from '@/hooks/useStudentIdentity'
import { LoginPage } from '@/pages/Login'
import { StudentHome } from '@/pages/StudentHome'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { ProgressGrid } from '@/components/student/ProgressGrid'
import { PlacementReady } from '@/pages/PlacementReady'
import { PlacementActive } from '@/pages/PlacementActive'
import { PracticeReady } from '@/pages/PracticeReady'
import { PracticeActive } from '@/pages/PracticeActive'
import { SessionResults } from '@/pages/SessionResults'
import { PracticeGuard } from '@/components/guards/PracticeGuard'
import { Loader2 } from 'lucide-react'

function StudentRoutes() {
  const { identity, loading, clearIdentity } = useStudentIdentity()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Multiplication Wizard...</p>
        </div>
      </div>
    )
  }

  if (!identity) {
    return <LoginPage onLogin={() => navigate('/')} />
  }

  const handleLogout = () => {
    clearIdentity()
    navigate('/')
  }

  return (
    <Routes>
      {/* Dashboard (Home) */}
      <Route path="/" element={<StudentHome onLogout={handleLogout} />} />

      {/* Placement Routes */}
      <Route path="/placement/ready" element={<PlacementReady onLogout={handleLogout} />} />
      <Route path="/placement/active/:sessionId" element={<PlacementActive onLogout={handleLogout} />} />
      <Route path="/placement/results/:sessionId" element={<SessionResults onLogout={handleLogout} sessionType="placement" />} />

      {/* Practice Routes (Protected - requires placement completion) */}
      <Route
        path="/practice/ready"
        element={
          <PracticeGuard>
            <PracticeReady onLogout={handleLogout} />
          </PracticeGuard>
        }
      />
      <Route
        path="/practice/active/:sessionId"
        element={
          <PracticeGuard>
            <PracticeActive onLogout={handleLogout} />
          </PracticeGuard>
        }
      />
      <Route
        path="/practice/results/:sessionId"
        element={
          <PracticeGuard>
            <SessionResults onLogout={handleLogout} sessionType="practice" />
          </PracticeGuard>
        }
      />

      {/* Progress Grid (Full Page View) */}
      <Route
        path="/progress"
        element={
          <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 p-4">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  ← Back to Home
                </button>
              </div>
              <ProgressGrid
                email={identity.email}
                gradeLevel={identity.metadata?.grade_level || '3'}
              />
            </div>
          </div>
        }
      />
    </Routes>
  )
}

function AdminRoutes() {
  const navigate = useNavigate()

  const handleAdminLogout = () => {
    navigate('/')
  }

  return <AdminDashboard onLogout={handleAdminLogout} />
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Admin Route - No Authentication Required */}
        <Route path="/admin" element={<AdminRoutes />} />

        {/* Student Routes - Require Email Login */}
        <Route path="/*" element={<StudentRoutes />} />
      </Routes>
    </Router>
  )
}

export default App
