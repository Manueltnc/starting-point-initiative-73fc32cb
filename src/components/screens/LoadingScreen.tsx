import { Loader2 } from 'lucide-react'
import { AppHeader } from '@/components/ui/AppHeader'

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 p-4">
      <div className="max-w-4xl mx-auto">
        <AppHeader showLogout={false} />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-primary mb-2">Getting your practice ready...</h2>
            <p className="text-muted-foreground">Loading your math journey</p>
          </div>
        </div>
      </div>
    </div>
  )
}
