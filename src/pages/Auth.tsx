import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Session, User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/auth/LoginForm"
import { SignUpForm } from "@/components/auth/SignUpForm"
import { Loader2, Shield } from "lucide-react"

export default function Auth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </div>
    )
  }

  if (session && user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            I've Been Here
          </h1>
        </div>
        <p className="text-center text-muted-foreground">
          Conecte-se com pessoas que estiveram nos mesmos lugares que você
        </p>
      </header>

      {/* Auth Form */}
      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-card/80 backdrop-blur-sm shadow-card border-border/50">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl">Bem-vindo</CardTitle>
              <CardDescription>
                Entre na sua conta ou crie uma nova para começar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="signup">
                  <SignUpForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}