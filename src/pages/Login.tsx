import { EmailContinue } from '@/components/auth/EmailContinue'
import { Calculator, BookOpen } from 'lucide-react'
import { useStudentIdentity } from '@/hooks/useStudentIdentity'

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { setIdentity } = useStudentIdentity()

  const handleEmailSubmit = async () => {
    // Extract email from the form before submitting
    const emailInput = document.querySelector<HTMLInputElement>('input[type="email"]')
    const email = emailInput?.value || ''
    
    if (email) {
      await setIdentity({
        email,
        display_name: email.split('@')[0],
        grade_level: '3'
      })
      onLogin()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* App Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Multiplication Wizard</h1>
              <p className="text-muted-foreground italic">A Learning Boltz Experience</p>
              <p className="text-sm text-muted-foreground">Master multiplication with confidence</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>Educational Learning Platform</span>
          </div>
        </div>

        {/* Email Form */}
        <EmailContinue onSuccess={handleEmailSubmit} />

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>© 2024 Education Apps Unified. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
