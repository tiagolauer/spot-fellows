import { useState, useEffect } from "react"
import { MapPin, Users, Clock, UserIcon, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { UserCard, PaymentModal, type User } from "@/components/UserCard"
import { supabase } from "@/integrations/supabase/client"
import { Session, User as SupabaseUser } from "@supabase/supabase-js"

// Mock data para demonstração
const mockUsers: User[] = [
  {
    id: 1,
    name: "Ana Silva",
    avatar: "AS",
    checkedInAt: new Date(Date.now() - 120000),
    instagram: "@ana.silva",
    whatsapp: "(11) 99999-1234",
    contactUnlocked: false
  },
  {
    id: 2,
    name: "Carlos Lima",
    avatar: "CL",
    checkedInAt: new Date(Date.now() - 240000),
    instagram: "@carlos.lima",
    whatsapp: "(11) 98888-5678",
    contactUnlocked: false
  },
  {
    id: 3,
    name: "Maria Santos",
    avatar: "MS",
    checkedInAt: new Date(Date.now() - 180000),
    whatsapp: "(11) 97777-9012",
    contactUnlocked: true // Já desbloqueado para demonstração
  }
]

const mockLocation = "Shopping Center Norte"

const Index = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [showUsers, setShowUsers] = useState(false)
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [currentUser, setCurrentUser] = useState({ id: 0, name: "Você", avatar: "VC" })
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    user: User | null
  }>({
    isOpen: false,
    user: null
  })
  const [location, setLocation] = useState<string>("Detectando localização...");
  const [coords, setCoords] = useState<{lat: number, lon: number} | null>(null);
  const { toast } = useToast()
  const navigate = useNavigate()

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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude, accuracy } = position.coords;
          setCoords({ lat: latitude, lon: longitude });
          setLocation("Buscando endereço...");
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=pt-BR`)
            .then(res => res.json())
            .then(data => {
              if (data.address) {
                const rua = data.address.road || data.address.pedestrian || data.address.footway || data.address.path;
                const numero = data.address.house_number || "";
                if (rua && numero) {
                  setLocation(`${rua}, ${numero}`);
                } else if (rua) {
                  setLocation(rua);
                } else if (data.display_name) {
                  setLocation(data.display_name.split(",")[0]);
                } else {
                  setLocation(`Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`);
                }
              } else {
                setLocation(`Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`);
              }
            })
            .catch(() => {
              setLocation(`Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`);
            });
        },
        error => {
          setLocation("Não foi possível obter a localização");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocation("Geolocalização não suportada");
    }
  }, []);

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

  const handleCheckIn = () => {
    setHasCheckedIn(true)
    toast({
      title: "Check-in realizado!",
      description: `Você fez check-in em ${mockLocation}`
    })
  }

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    return `${minutes} min atrás`
  }

  const handleUnlockContact = (user: User) => {
    setPaymentModal({ isOpen: true, user })
  }

  const handlePaymentSuccess = (userId: number) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, contactUnlocked: true } : user
      )
    )
  }

  const activeUsers = hasCheckedIn
    ? [
        { ...currentUser, checkedInAt: new Date(), contactUnlocked: true },
        ...users
      ]
      : users

  if (loading) {
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
              <h2 className="text-xl font-semibold">{location}</h2>
            </div>
            <p className="text-muted-foreground">Localização atual detectada</p>
          </CardContent>
        </Card>

        {/* Check-in Button */}
        <div className="flex justify-center">
          <Button
            variant={hasCheckedIn ? "secondary" : "default"}
            size="lg"
            onClick={handleCheckIn}
            disabled={hasCheckedIn}
            className={`
              h-24 w-64 text-xl font-bold rounded-2xl
              ${
                hasCheckedIn
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-gradient-hero hover:shadow-glow animate-pulse-glow"
              }
            `}
          >
            {hasCheckedIn ? "✓ Você está aqui!" : "Eu estive aqui"}
          </Button>
        </div>

        {/* Who's Here Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Quem está aqui?
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUsers(!showUsers)}
            >
              {showUsers ? "Ocultar" : "Ver todos"}
            </Button>
          </div>

          {showUsers && (
            <div className="space-y-3">
              {activeUsers.map(user => (
                <UserCard
                  key={user.id || "current-user"}
                  user={user}
                  onUnlockContact={handleUnlockContact}
                />
              ))}
            </div>
          )}

          {!showUsers && (
            <Card className="bg-gradient-card shadow-card border-0">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="flex -space-x-2">
                    {activeUsers.slice(0, 3).map((user, index) => (
                      <Avatar
                        key={index}
                        className="h-8 w-8 border-2 border-background"
                      >
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-bold">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    {activeUsers.length}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activeUsers.length === 1
                    ? "pessoa está aqui agora"
                    : "pessoas estão aqui agora"}
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
