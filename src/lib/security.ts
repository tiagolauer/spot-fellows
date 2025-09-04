/**
 * Funções de segurança para sanitização e validação de dados
 */

// Lista de caracteres perigosos para XSS
const DANGEROUS_CHARS = /[<>'"&]/g;

// Lista de caracteres permitidos para diferentes tipos de input
const ALPHANUMERIC_REGEX = /^[a-zA-ZÀ-ÿ0-9\s\-_@.]*$/;
const PHONE_REGEX = /^[\d\s\(\)\-\+]*$/;
const URL_REGEX = /^https?:\/\//;

/**
 * Sanitiza input removendo caracteres perigosos
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(DANGEROUS_CHARS, '') // Remove caracteres XSS
    .trim() // Remove espaços extras
    .substring(0, 1000); // Limita tamanho máximo
}

/**
 * Valida se o input contém apenas caracteres alfanuméricos seguros
 */
export function isAlphanumericSafe(input: string): boolean {
  return ALPHANUMERIC_REGEX.test(input);
}

/**
 * Valida formato de telefone
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Valida se a URL é segura (HTTPS)
 */
export function isSecureUrl(url: string): boolean {
  return URL_REGEX.test(url);
}

/**
 * Valida coordenadas geográficas
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180 &&
    !isNaN(lat) &&
    !isNaN(lon)
  );
}

/**
 * Rate limiting - simples controle de tentativas
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  checkLimit(key: string, maxAttempts: number = 5, windowMs: number = 300000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Valida dados de perfil do usuário
 */
export function validateProfileData(data: {
  name?: string;
  bio?: string;
  instagram?: string;
  whatsapp?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.name) {
    if (data.name.length < 2) errors.push('Nome deve ter pelo menos 2 caracteres');
    if (data.name.length > 100) errors.push('Nome muito longo');
    if (!isAlphanumericSafe(data.name)) errors.push('Nome contém caracteres inválidos');
  }

  if (data.bio && data.bio.length > 500) {
    errors.push('Bio muito longa');
  }

  if (data.instagram) {
    if (data.instagram.length > 30) errors.push('Instagram muito longo');
    if (!data.instagram.startsWith('@') && data.instagram.length > 0) {
      errors.push('Instagram deve começar com @');
    }
  }

  if (data.whatsapp && !isValidPhone(data.whatsapp)) {
    errors.push('Formato de telefone inválido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}