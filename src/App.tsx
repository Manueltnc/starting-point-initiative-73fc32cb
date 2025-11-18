import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useStudentIdentity } from '@/hooks/useStudentIdentity'
import { LoginPage } from '@/pages/Login'
import { StudentHome } from '@/pages/StudentHome'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { ProgressGrid } from '@/components/student/ProgressGrid'
import { Loader2 } from 'lucide-react'

function StudentRoutes() {
  const { identity, loading, clearIdentity } = useStudentIdentity()
  const navigate = useNavigate()
  const location = useLocation()

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
    window.location.reload()
  }

  const currentPath = location.pathname

  // Progress Grid route (separate full-page view)
  if (currentPath === '/progress') {
    return (
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
    )
  }

  // Main dashboard - handles all student navigation via state
  return <StudentHome onLogout={handleLogout} />
}

function App() {
  const handleAdminLogout = () => {
    window.location.href = '/'
  }

  return (
    <Router>
      <Routes>
        {/* Public Admin Route - No Authentication Required */}
        <Route path="/admin" element={<AdminDashboard onLogout={handleAdminLogout} />} />

        {/* Student Routes - Require Email Login */}
        <Route path="/*" element={<StudentRoutes />} />
      </Routes>
    </Router>
  )
}

export default App
