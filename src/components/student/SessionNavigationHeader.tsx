import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, Home } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SessionNavigationHeaderProps {
  onLogout?: () => void
  onExitSession?: () => void
  userName?: string
}

export function SessionNavigationHeader({ 
  onLogout, 
  onExitSession,
  userName 
}: SessionNavigationHeaderProps) {
  const [showExitDialog, setShowExitDialog] = useState(false)

  const handleExitClick = () => {
    setShowExitDialog(true)
  }

  const handleConfirmExit = async () => {
    setShowExitDialog(false)
    if (onExitSession) {
      await onExitSession()
    }
  }

  const handleContinue = () => {
    setShowExitDialog(false)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <img
            src="https://gckzqfnwfveskxkhbrrl.supabase.co/storage/v1/object/public/learning_boltz/4.svg"
            alt="Learning Boltz Logo"
            className="h-12 w-12 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-primary">Multiplication Wizard</h1>
            <p className="text-muted-foreground italic">A Learning Boltz Experience</p>
            {userName && <p className="text-sm text-muted-foreground">Welcome back, {userName}!</p>}
          </div>
        </div>
        
        <div className="flex gap-2">
          {onExitSession && (
            <Button onClick={handleExitClick} variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          )}
          {onLogout && (
            <Button onClick={onLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave this practice session?</DialogTitle>
            <DialogDescription>
              Your current progress will be saved, but this session will be marked as incomplete. 
              You can start a new session from the dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleContinue}>
              Continue Practicing
            </Button>
            <Button onClick={handleConfirmExit}>
              Leave Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
