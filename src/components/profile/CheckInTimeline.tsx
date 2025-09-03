import { MapPin, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CheckIn {
  id: string
  formatted_address: string
  checked_in_at: string
}

interface CheckInTimelineProps {
  checkIns: CheckIn[]
}

export function CheckInTimeline({ checkIns }: CheckInTimelineProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm shadow-card border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          Timeline de Check-ins
        </CardTitle>
      </CardHeader>
      <CardContent>
        {checkIns.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {checkIns.map((checkIn) => (
              <div key={checkIn.id} className="flex items-start space-x-3 p-3 bg-secondary/30 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {checkIn.formatted_address}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(checkIn.checked_in_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Nenhum check-in realizado ainda
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}