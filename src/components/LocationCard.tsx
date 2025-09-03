import { MapPin, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface LocationCardProps {
  location?: {
    formattedAddress?: string
  }
  locationError?: string
  locationLoading: boolean
  onRefresh: () => void
}

export function LocationCard({ location, locationError, locationLoading, onRefresh }: LocationCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm shadow-card border">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <MapPin className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-xl font-semibold text-card-foreground">
            {locationError ? (
              <span className="text-destructive">{locationError}</span>
            ) : location?.formattedAddress ? (
              location.formattedAddress
            ) : (
              "Detectando localização..."
            )}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={locationLoading}
            className="ml-2"
          >
            <RefreshCw className={`h-4 w-4 ${locationLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-muted-foreground">Localização atual detectada</p>
      </CardContent>
    </Card>
  )
}