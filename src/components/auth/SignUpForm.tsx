import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Eye, EyeOff, AlertTriangle, FileText, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { signUpSchema, type SignUpFormData } from "@/lib/validation"
import { TermsModal } from "@/components/legal/TermsModal"
import { PrivacyModal } from "@/components/legal/PrivacyModal"

export function SignUpForm() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema)
  })

  const watchAcceptTerms = watch("acceptTerms")

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true)
    setError(null)

    try {
      const redirectUrl = `${window.location.origin}/`
      
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: data.firstName,
            last_name: data.lastName
          }
        }
      })

      if (signUpError) {
        switch (signUpError.message) {
          case "User already registered":
            setError("Este email já está cadastrado. Tente fazer login")
            break
          case "Password should be at least 6 characters":
            setError("A senha deve ter pelo menos 6 caracteres")
            break
          case "Signup is disabled":
            setError("Cadastro está temporariamente desabilitado")
            break
          default:
            setError(`Erro ao criar conta: ${signUpError.message}`)
        }
        return
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta"
      })
    } catch (err) {
      console.error("SignUp error:", err)
      setError("Erro inesperado. Tente novamente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="João"
              autoComplete="given-name"
              {...register("firstName")}
              className={errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Silva"
              autoComplete="family-name"
              {...register("lastName")}
              className={errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            {...register("email")}
            className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Crie uma senha forte"
              autoComplete="new-password"
              {...register("password")}
              className={errors.password ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Digite a senha novamente"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptTerms"
              checked={watchAcceptTerms}
              onCheckedChange={(checked) => setValue("acceptTerms", !!checked)}
              className={errors.acceptTerms ? "border-destructive" : ""}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="acceptTerms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Aceito os{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-primary hover:text-primary/80 underline inline-flex items-center"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Termos de Uso
                </button>
                {" "}e a{" "}
                <button
                  type="button"
                  onClick={() => setShowPrivacy(true)}
                  className="text-primary hover:text-primary/80 underline inline-flex items-center"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Política de Privacidade
                </button>
              </Label>
            </div>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-hero hover:shadow-glow"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar Conta"
          )}
        </Button>
      </form>

      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />

      <PrivacyModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />
    </>
  )
}