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
  onExitSession
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
      <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            <img
              src="https://gckzqfnwfveskxkhbrrl.supabase.co/storage/v1/object/public/learning_boltz/4.svg"
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
            <h1 className="text-lg font-bold text-primary">Multiplication Wizard</h1>
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
