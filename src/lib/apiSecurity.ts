import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

export interface SecurityConfig {
  maxRequestSize: number;
  allowedOrigins: string[];
  blockedUserAgents: string[];
  suspiciousPatterns: RegExp[];
}

export class APISecurityService {
  private static readonly DEFAULT_RATE_LIMIT: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests from this IP'
  };

  private static readonly SECURITY_CONFIG: SecurityConfig = {
    maxRequestSize: 25 * 1024 * 1024, // 25MB
    allowedOrigins: ['https://yourdomain.com', 'https://app.yourdomain.com'],
    blockedUserAgents: [
      'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python'
    ],
    suspiciousPatterns: [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload=/gi,
      /onerror=/gi,
      /onclick=/gi
    ]
  };

  // Rate limiting storage (in production, use Redis)
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  // Rate limiting check
  static checkRateLimit(
    request: NextRequest,
    config: Partial<RateLimitConfig> = {}
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const finalConfig = { ...this.DEFAULT_RATE_LIMIT, ...config };
    const clientIP = this.getClientIP(request);
    const now = Date.now();
    
    const key = `rate_limit:${clientIP}`;
    const current = this.rateLimitStore.get(key);

    if (!current || now > current.resetTime) {
      // Reset or create new rate limit entry
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + finalConfig.windowMs
      });
      
      return {
        allowed: true,
        remaining: finalConfig.maxRequests - 1,
        resetTime: now + finalConfig.windowMs
      };
    }

    if (current.count >= finalConfig.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      };
    }

    // Increment count
    current.count++;
    this.rateLimitStore.set(key, current);

    return {
      allowed: true,
      remaining: finalConfig.maxRequests - current.count,
      resetTime: current.resetTime
    };
  }

  // Validate request origin
  static validateOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    if (!origin) return true; // Allow requests without origin (same-origin)
    
    return this.SECURITY_CONFIG.allowedOrigins.includes(origin);
  }

  // Validate user agent
  static validateUserAgent(request: NextRequest): boolean {
    const userAgent = request.headers.get('user-agent') || '';
    const lowerUserAgent = userAgent.toLowerCase();
    
    return !this.SECURITY_CONFIG.blockedUserAgents.some(blocked => 
      lowerUserAgent.includes(blocked.toLowerCase())
    );
  }

  // Sanitize request body
  static sanitizeRequestBody(body: string): string {
    let sanitized = body;
    
    // Remove suspicious patterns
    this.SECURITY_CONFIG.suspiciousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized;
  }

  // Validate request size
  static validateRequestSize(request: NextRequest): boolean {
    const contentLength = request.headers.get('content-length');
    if (!contentLength) return true;
    
    const size = parseInt(contentLength, 10);
    return size <= this.SECURITY_CONFIG.maxRequestSize;
  }

  // Get client IP address
  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    return forwarded?.split(',')[0] || 
           realIP || 
           cfConnectingIP || 
           'unknown';
  }

  // Comprehensive API security check
  static async performSecurityCheck(request: NextRequest): Promise<{
    allowed: boolean;
    error?: string;
    statusCode?: number;
  }> {
    // Check rate limiting
    const rateLimit = this.checkRateLimit(request);
    if (!rateLimit.allowed) {
      return {
        allowed: false,
        error: 'Rate limit exceeded',
        statusCode: 429
      };
    }

    // Check origin
    if (!this.validateOrigin(request)) {
      return {
        allowed: false,
        error: 'Invalid origin',
        statusCode: 403
      };
    }

    // Check user agent
    if (!this.validateUserAgent(request)) {
      return {
        allowed: false,
        error: 'Blocked user agent',
        statusCode: 403
      };
    }

    // Check request size
    if (!this.validateRequestSize(request)) {
      return {
        allowed: false,
        error: 'Request too large',
        statusCode: 413
      };
    }

    return { allowed: true };
  }

  // Add security headers to response
  static addSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    
    return response;
  }

  // Log security events
  static logSecurityEvent(event: {
    type: 'rate_limit' | 'invalid_origin' | 'blocked_ua' | 'large_request' | 'suspicious_pattern';
    ip: string;
    userAgent?: string;
    path: string;
    details?: unknown;
  }): void {
  }
}

// Common validation schemas
export const CommonSchemas = {
  // Pagination schema
  pagination: z.object({
    page: z.number().min(0).default(0),
    size: z.number().min(1).max(100).default(10),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc')
  }),

  // ID schema
  id: z.string().uuid(),

  // Email schema
  email: z.string().email(),

  // Password schema
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),

  // Amount schema (for financial data)
  amount: z.number().positive().multipleOf(0.01),

  // Date range schema
  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime()
  }).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
    message: "Start date must be before end date"
  })
};

// Input validation helper
export class InputValidator {
  static async validateRequest<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>
  ): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
      const body = await request.json();
      const data = schema.parse(body);
      return { success: true, data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          error: `Validation error: ${(error as { errors?: { message?: string }[] }).errors?.map((e) => e.message).join(', ') || 'Unknown validation error'}` 
        };
      }
      return { success: false, error: 'Invalid request body' };
    }
  }

  static validateQueryParams<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>
  ): { success: true; data: T } | { success: false; error: string } {
    try {
      const params = Object.fromEntries(request.nextUrl.searchParams);
      const data = schema.parse(params);
      return { success: true, data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          error: `Validation error: ${(error as { errors?: { message?: string }[] }).errors?.map((e) => e.message).join(', ') || 'Unknown validation error'}` 
        };
      }
      return { success: false, error: 'Invalid query parameters' };
    }
  }
} 