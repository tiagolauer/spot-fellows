/**
 * Security monitoring and event logging system
 */

export enum SecurityEventType {
  LOGIN_FAILED = 'login_failed',
  LOGIN_SUCCESS = 'login_success',
  SIGNUP_FAILED = 'signup_failed',
  SIGNUP_SUCCESS = 'signup_success',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_INPUT = 'invalid_input',
  LOCATION_ACCESS_DENIED = 'location_access_denied',
  XSS_ATTEMPT = 'xss_attempt',
  INJECTION_ATTEMPT = 'injection_attempt'
}

interface SecurityEvent {
  type: SecurityEventType;
  timestamp: Date;
  userAgent: string;
  ip?: string;
  userId?: string;
  email?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  log(
    type: SecurityEventType,
    details: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    userId?: string,
    email?: string
  ): void {
    const event: SecurityEvent = {
      type,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      userId,
      email,
      details,
      severity
    };

    this.events.unshift(event);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Log to console for monitoring
    const logLevel = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info';
    console[logLevel](`[SECURITY] ${type}:`, details, { userId, email });

    // In production, you would send this to your monitoring service
    this.sendToMonitoringService(event);
  }

  private sendToMonitoringService(event: SecurityEvent): void {
    // In a real application, send to your security monitoring service
    // For now, we'll just store locally and could send to Supabase edge function
    if (event.severity === 'critical' || event.severity === 'high') {
      // Send critical events immediately
      this.sendCriticalAlert(event);
    }
  }

  private sendCriticalAlert(event: SecurityEvent): void {
    // Send critical security alerts to monitoring system
    console.error('[CRITICAL SECURITY ALERT]', event);
  }

  getRecentEvents(count: number = 50): SecurityEvent[] {
    return this.events.slice(0, count);
  }

  getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.events.filter(event => event.type === type);
  }

  getEventsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): SecurityEvent[] {
    return this.events.filter(event => event.severity === severity);
  }

  clearEvents(): void {
    this.events = [];
  }
}

export const securityMonitor = SecurityMonitor.getInstance();

/**
 * Input sanitization with XSS detection
 */
export function detectAndLogXSS(input: string, context: string = ''): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      securityMonitor.log(
        SecurityEventType.XSS_ATTEMPT,
        `XSS attempt detected in ${context}: ${input.substring(0, 100)}`,
        'high'
      );
      return true;
    }
  }

  return false;
}

/**
 * SQL injection detection (even though we use Supabase client)
 */
export function detectSQLInjection(input: string, context: string = ''): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /'(\s*(or|and)\s+)?'?\d/gi,
    /--/g,
    /\/\*[\s\S]*?\*\//g
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      securityMonitor.log(
        SecurityEventType.INJECTION_ATTEMPT,
        `SQL injection attempt detected in ${context}: ${input.substring(0, 100)}`,
        'critical'
      );
      return true;
    }
  }

  return false;
}

/**
 * Enhanced input validation with security monitoring
 */
export function secureValidateInput(
  input: string,
  context: string,
  maxLength: number = 1000
): { isValid: boolean; sanitized: string } {
  if (!input || typeof input !== 'string') {
    return { isValid: false, sanitized: '' };
  }

  // Truncate input to prevent DoS
  const truncated = input.substring(0, maxLength);

  // Check for XSS
  if (detectAndLogXSS(truncated, context)) {
    return { isValid: false, sanitized: '' };
  }

  // Check for SQL injection
  if (detectSQLInjection(truncated, context)) {
    return { isValid: false, sanitized: '' };
  }

  // Basic sanitization
  const sanitized = truncated
    .replace(/[<>'\"&]/g, '') // Remove dangerous chars
    .trim();

  return { isValid: true, sanitized };
}
