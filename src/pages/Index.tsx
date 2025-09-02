import { useState, useEffect } from "react"
import { MapPin, Users, Clock, UserIcon, LogIn, RefreshCw, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { UserCard, PaymentModal, type User } from "@/components/UserCard"
import { supabase } from "@/integrations/supabase/client"
import { Session, User as SupabaseUser } from "@supabase/supabase-js"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useNearbyUsers } from "@/hooks/useNearbyUsers"
import { useCheckIns } from "@/hooks/useCheckIns"

const Index = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [showUsers, setShowUsers] = useState(false)
  const [currentUser, setCurrentUser] = useState({ id: 0, name: "Você", avatar: "VC" })
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    user: User | null
  }>({
    isOpen: false,
    user: null
  })
  const { toast } = useToast()
  const navigate = useNavigate()
  
  // Usar os novos hooks
  const { location: geoLocation, loading: locationLoading, error: locationError, refreshLocation } = useGeolocation()
  const { users: nearbyUsers, loading: usersLoading, refreshUsers } = useNearbyUsers()
  const { canCheckIn, nextCheckInTime, saveCheckIn } = useCheckIns()

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Update current user info when authenticated
        if (session?.user) {
          const firstName = session.user.user_metadata?.first_name || ""
          const lastName = session.user.user_metadata?.last_name || ""
          const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "VC"
          
          setCurrentUser({
            id: 0,
            name: `${firstName} ${lastName}`.trim() || "Você",
            avatar: initials
          })
        }
      }
    )

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      if (session?.user) {
        const firstName = session.user.user_metadata?.first_name || ""
        const lastName = session.user.user_metadata?.last_name || ""
        const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "VC"
        
        setCurrentUser({
          id: 0,
          name: `${firstName} ${lastName}`.trim() || "Você",
          avatar: initials
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Atualizar usuários próximos quando a localização mudar
  useEffect(() => {
    if (geoLocation && session) {
      refreshUsers(geoLocation.latitude, geoLocation.longitude, 1000); // 1km de raio
    }
  }, [geoLocation, session])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Logout realizado com sucesso!",
        description: "Até logo!"
      })
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente",
        variant: "destructive"
      })
    }
  }

  const handleCheckIn = async () => {
    if (geoLocation) {
      const success = await saveCheckIn(geoLocation)
      if (success) {
        setHasCheckedIn(true)
        // Refresh nearby users after check-in
        refreshUsers(geoLocation.latitude, geoLocation.longitude, 1000)
      }
    } else {
      toast({
        title: "Erro",
        description: "Localização não disponível para check-in",
        variant: "destructive"
      })
    }
  }

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    return `${minutes} min atrás`
  }

  const handleUnlockContact = (user: User) => {
    setPaymentModal({ isOpen: true, user })
  }

  const handlePaymentSuccess = (userId: number) => {
    // Atualizar o status de contato desbloqueado no estado local
    // Em uma implementação real, isso seria feito no backend
  }

  if (loading || locationLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm shadow-card">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                I've Been Here
              </h1>
              <p className="text-muted-foreground">
                Conecte-se com pessoas que estiveram nos mesmos lugares que você
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate("/auth")} 
                className="w-full bg-gradient-hero hover:shadow-glow"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Entrar ou Cadastrar-se
              </Button>
              <p className="text-xs text-muted-foreground">
                Faça login para descobrir quem esteve nos mesmos lugares que você
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              I've Been Here
            </h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
              >
                <UserIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Location Card */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">
                {locationError ? (
                  <span className="text-destructive">{locationError}</span>
                ) : geoLocation?.formattedAddress ? (
                  geoLocation.formattedAddress
                ) : (
                  "Detectando localização..."
                )}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshLocation}
                disabled={locationLoading}
                className="ml-2"
              >
                <RefreshCw className={`h-4 w-4 ${locationLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-muted-foreground">Localização atual detectada</p>
          </CardContent>
        </Card>

        {/* Check-in Button */}
        <div className="flex flex-col items-center space-y-2">
          <Button
            variant={hasCheckedIn ? "secondary" : "default"}
            size="lg"
            onClick={handleCheckIn}
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

        {/* Who's Here Section */}
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
              onClick={() => setShowUsers(!showUsers)}
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
                // Converter para o formato esperado pelo UserCard
                const userForCard: User = {
                  id: parseInt(user.id), // Converter UUID para number temporariamente
                  name: user.name,
                  avatar: user.avatar_url || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
                  checkedInAt: new Date(user.last_location_update),
                  instagram: '', // Seria vindo do banco
                  whatsapp: '', // Seria vindo do banco
                  contactUnlocked: false
                };
                
                return (
                  <UserCard
                    key={user.id}
                    user={userForCard}
                    onUnlockContact={handleUnlockContact}
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

        {/* Payment Modal */}
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false, user: null })}
          user={paymentModal.user}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </main>
    </div>
  )
}

export default Index
