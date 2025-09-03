import { Clock, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CheckInButtonProps {
  hasCheckedIn: boolean
  canCheckIn: boolean
  geoLocation?: { latitude: number; longitude: number }
  nextCheckInTime?: Date
  onCheckIn: () => void
}

export function CheckInButton({ 
  hasCheckedIn, 
  canCheckIn, 
  geoLocation, 
  nextCheckInTime, 
  onCheckIn 
}: CheckInButtonProps) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        variant={hasCheckedIn ? "secondary" : "default"}
        size="lg"
        onClick={onCheckIn}
        disabled={hasCheckedIn || !geoLocation || !canCheckIn}
        className={`
          h-24 w-64 text-xl font-bold rounded-2xl
          ${
            hasCheckedIn
              ? "bg-secondary text-secondary-foreground"
              : canCheckIn
              ? "bg-gradient-hero hover:shadow-glow animate-pulse-glow"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }
        `}
      >
        {hasCheckedIn ? (
          <>
            <Heart className="mr-2 h-6 w-6 text-pink-200" />
            Você está aqui!
          </>
        ) : !canCheckIn ? (
          <>
            <Clock className="mr-2 h-6 w-6" />
            Aguarde para check-in
          </>
        ) : (
          "Eu estive aqui"
        )}
      </Button>
      {!canCheckIn && nextCheckInTime && (
        <p className="text-sm text-muted-foreground">
          Próximo check-in disponível em: {Math.ceil((nextCheckInTime.getTime() - Date.now()) / 1000 / 60)} min
        </p>
      )}
    </div>
  )
}