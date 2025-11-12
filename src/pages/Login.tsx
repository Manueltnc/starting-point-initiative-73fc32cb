import { EmailContinue } from '@/components/auth/EmailContinue'
import { AppHeader } from '@/components/ui/AppHeader'
import { useStudentIdentity } from '@/hooks/useStudentIdentity'

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { setIdentity } = useStudentIdentity()

  const handleEmailSubmit = async (email: string) => {
    try {
      // Set identity and wait for it to complete
      await setIdentity({
        email,
        display_name: email.split('@')[0],
        grade_level: '3'
      })
      
      // Only navigate after identity is successfully set
      onLogin()
    } catch (error) {
      console.error('Failed to set identity:', error)
      throw error // Re-throw to let EmailContinue handle the error display
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/30 p-4">
      <div className="max-w-7xl mx-auto">
        {/* App Header */}
        <AppHeader showLogout={false} />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="w-full max-w-md">
        {/* Email Form */}
        <EmailContinue onSuccess={handleEmailSubmit} />
          </div>
        </div>
      </div>
    </div>
  )
}
