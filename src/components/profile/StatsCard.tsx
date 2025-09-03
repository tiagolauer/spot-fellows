import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardProps {
  totalCheckins: number
  placesVisited: number
  joinedDate: string
}

export function StatsCard({ totalCheckins, placesVisited, joinedDate }: StatsCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm shadow-card border">
      <CardHeader>
        <CardTitle>Estatísticas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary">{totalCheckins}</p>
            <p className="text-sm text-muted-foreground">Check-ins</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary">{placesVisited}</p>
            <p className="text-sm text-muted-foreground">Lugares</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary">4.8</p>
            <p className="text-sm text-muted-foreground">Avaliação</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Membro desde {joinedDate}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}