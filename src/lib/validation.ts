import { z } from "zod"

// Função para escapar caracteres HTML potencialmente perigosos
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .trim()
}

// Função para sanitizar entrada de texto
export const sanitizeInput = (input: string): string => {
  // Remove caracteres de controle e espaços extras
  const cleaned = input
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove caracteres de controle
    .trim()
    .replace(/\s+/g, " ") // Normaliza espaços

  return escapeHtml(cleaned)
}

// Validação para nome e sobrenome
const nameSchema = z
  .string()
  .min(2, "Deve ter pelo menos 2 caracteres")
  .max(50, "Deve ter no máximo 50 caracteres")
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Apenas letras e espaços são permitidos")
  .transform(sanitizeInput)

// Validação para email
const emailSchema = z
  .string()
  .email("Email inválido")
  .min(1, "Email é obrigatório")
  .max(254, "Email muito longo")
  .transform(input => sanitizeInput(input.toLowerCase()))

// Validação para senha
const passwordSchema = z
  .string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .max(128, "Senha muito longa")
  .regex(/^(?=.*[a-z])/, "Deve conter pelo menos uma letra minúscula")
  .regex(/^(?=.*[A-Z])/, "Deve conter pelo menos uma letra maiúscula")
  .regex(/^(?=.*\d)/, "Deve conter pelo menos um número")
  .regex(/^(?=.*[@$!%*?&])/, "Deve conter pelo menos um caractere especial (@$!%*?&)")

// Schema para login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória")
})

// Schema para cadastro
export const signUpSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar os termos de uso e política de privacidade"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"]
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>