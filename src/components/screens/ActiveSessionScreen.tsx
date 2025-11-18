import { useState } from 'react'
import { PlacementTest } from '@/components/student/PlacementTest'
import { PracticeGrid } from '@/components/student/PracticeGrid'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

interface ActiveSessionScreenProps {
  sessionType: 'placement' | 'practice'
  email: string
  gradeLevel: string
  onComplete: (results: any) => void
  onAbandon: () => void
}

export function ActiveSessionScreen({
  sessionType,
  email,
  gradeLevel,
  onComplete,
  onAbandon
}: ActiveSessionScreenProps) {
  const [showAbandonDialog, setShowAbandonDialog] = useState(false)

  const handleDashboardClick = () => {
    setShowAbandonDialog(true)
  }

  const handleConfirmAbandon = () => {
    setShowAbandonDialog(false)
    onAbandon()
  }

  return (
    <>
      {sessionType === 'placement' ? (
        <PlacementTest
          email={email}
          gradeLevel={gradeLevel}
          onComplete={onComplete}
          onDashboardClick={handleDashboardClick}
        />
      ) : (
        <PracticeGrid
          email={email}
          gradeLevel={gradeLevel}
          onComplete={onComplete}
          onDashboardClick={handleDashboardClick}
        />
      )}

      <Dialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Exit to Dashboard?
            </DialogTitle>
            <DialogDescription className="pt-2">
              Your progress will be saved, but this session will be marked as incomplete.
              You can always come back and start a new session later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowAbandonDialog(false)}
            >
              Continue Session
            </Button>
            <Button
              onClick={handleConfirmAbandon}
            >
              Exit to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
