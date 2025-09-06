/**
 * Security headers and CSP configuration
 */

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN', // Allow iframes from same origin for Lovable preview
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()'
};

export const contentSecurityPolicy = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline' 'unsafe-eval'", // Required for React dev
  'style-src': "'self' 'unsafe-inline'", // Required for Tailwind
  'img-src': "'self' data: https:",
  'connect-src': "'self' https://uptxtdgzxlberkzqwlnn.supabase.co https://nominatim.openstreetmap.org",
  'font-src': "'self' data:",
  'object-src': "'none'",
  'media-src': "'self'",
  'frame-src': "'self'"
};

/**
 * Rate limiting for authentication attempts
 */
export class AuthRateLimit {
  private static attempts = new Map<string, { count: number; resetTime: number }>();

  static checkLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  static reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  static getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return 0;
    
    const now = Date.now();
    return Math.max(0, record.resetTime - now);
  }
}