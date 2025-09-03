import { useState, useEffect } from "react"
import { UserIcon, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { PaymentModal, type User } from "@/components/UserCard"
import { supabase } from "@/integrations/supabase/client"
import { Session, User as SupabaseUser } from "@supabase/supabase-js"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useNearbyUsers } from "@/hooks/useNearbyUsers"
import { useCheckIns } from "@/hooks/useCheckIns"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LocationCard } from "@/components/LocationCard"
import { CheckInButton } from "@/components/CheckInButton"
import { NearbyUsersSection } from "@/components/NearbyUsersSection"

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
              <ThemeToggle />
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
        <LocationCard 
          location={geoLocation}
          locationError={locationError}
          locationLoading={locationLoading}
          onRefresh={refreshLocation}
        />

        {/* Check-in Button */}
        <CheckInButton
          hasCheckedIn={hasCheckedIn}
          canCheckIn={canCheckIn}
          geoLocation={geoLocation}
          nextCheckInTime={nextCheckInTime}
          onCheckIn={handleCheckIn}
        />

        {/* Who's Here Section */}
        <NearbyUsersSection
          nearbyUsers={nearbyUsers}
          usersLoading={usersLoading}
          showUsers={showUsers}
          onToggleUsers={() => setShowUsers(!showUsers)}
          onUnlockContact={handleUnlockContact}
        />

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
