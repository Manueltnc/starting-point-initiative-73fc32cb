import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AppHeaderProps {
  onLogout?: () => void;
  showLogout?: boolean;
  userName?: string;
}

export function AppHeader({ onLogout, showLogout = true, userName }: AppHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <img
          src="https://gckzqfnwfveskxkhbrrl.supabase.co/storage/v1/object/public/learning_boltz/file.svg"
          alt="Learning Boltz Logo"
          className="h-12 w-12 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold text-primary">Multiplication Wizard</h1>
          <p className="text-muted-foreground italic">A Learning Boltz Experience</p>
          {userName && <p className="text-sm text-muted-foreground">Welcome back, {userName}!</p>}
        </div>
      </div>
      {showLogout && onLogout && (
        <Button onClick={onLogout} variant="outline" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      )}
    </div>
  );
}
