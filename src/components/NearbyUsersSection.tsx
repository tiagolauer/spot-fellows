import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserCard, type User } from "@/components/UserCard"

interface NearbyUser {
  id: string
  name: string
  avatar_url?: string
  last_location_update: string
}

interface NearbyUsersSectionProps {
  nearbyUsers: NearbyUser[]
  usersLoading: boolean
  showUsers: boolean
  onToggleUsers: () => void
  onUnlockContact: (user: User) => void
}

export function NearbyUsersSection({ 
  nearbyUsers, 
  usersLoading, 
  showUsers, 
  onToggleUsers, 
  onUnlockContact 
}: NearbyUsersSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Users className="h-5 w-5 mr-2 text-primary" />
          Quem está aqui?
          <Badge variant="secondary" className="ml-2">
            {nearbyUsers.length}
          </Badge>
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleUsers}
          disabled={nearbyUsers.length === 0}
        >
          {showUsers ? "Ocultar" : "Ver todos"}
        </Button>
      </div>

      {usersLoading ? (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6 text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              Procurando pessoas por perto...
            </p>
          </CardContent>
        </Card>
      ) : showUsers && nearbyUsers.length > 0 ? (
        <div className="space-y-3">
          {nearbyUsers.map(user => {
            const userForCard: User = {
              id: parseInt(user.id),
              name: user.name,
              avatar: user.avatar_url || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
              checkedInAt: new Date(user.last_location_update),
              instagram: '',
              whatsapp: '',
              contactUnlocked: false
            };
            
            return (
              <UserCard
                key={user.id}
                user={userForCard}
                onUnlockContact={onUnlockContact}
                isCurrentUser={false}
              />
            );
          })}
        </div>
      ) : !showUsers ? (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {nearbyUsers.length > 0 ? (
                <>
                  <div className="flex -space-x-2">
                    {nearbyUsers.slice(0, 3).map((user, index) => (
                      <Avatar
                        key={index}
                        className="h-8 w-8 border-2 border-background"
                      >
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-bold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    {nearbyUsers.length}
                  </Badge>
                </>
              ) : (
                <Users className="h-12 w-12 text-muted-foreground/50" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {nearbyUsers.length === 0
                ? "Nenhuma pessoa por perto no momento"
                : nearbyUsers.length === 1
                ? "pessoa está aqui agora"
                : "pessoas estão aqui agora"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma pessoa encontrada por perto
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}