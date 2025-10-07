// Simple environment configuration without Zod for now
export interface Environment {
  // Application
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_API_URL: string;
  
  // Security
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  ENCRYPTION_KEY: string;
  SESSION_SECRET: string;
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // Database
  DATABASE_URL?: string | undefined;
  DATABASE_SSL: boolean;
  
  // Redis
  REDIS_URL?: string | undefined;
  REDIS_PASSWORD?: string | undefined;
  
  // Email
  SMTP_HOST?: string | undefined;
  SMTP_PORT?: number | undefined;
  SMTP_USER?: string | undefined;
  SMTP_PASS?: string | undefined;
  EMAIL_FROM?: string | undefined;
  
  // File Upload
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string;
  UPLOAD_DIR: string;
  
  // Monitoring
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  SENTRY_DSN?: string | undefined;
  DATADOG_API_KEY?: string | undefined;
  
  // Third-party Services
  STRIPE_SECRET_KEY?: string | undefined;
  STRIPE_PUBLISHABLE_KEY?: string | undefined;
  PAYPAL_CLIENT_ID?: string | undefined;
  PAYPAL_CLIENT_SECRET?: string | undefined;
  
  // Compliance
  AUDIT_LOG_ENABLED: boolean;
  AUDIT_LOG_RETENTION_DAYS: number;
  GDPR_ENABLED: boolean;
  DATA_RETENTION_DAYS: number;
  
  // Security Headers
  CSP_NONCE_ENABLED: boolean;
  HSTS_MAX_AGE: number;
  HSTS_INCLUDE_SUBDOMAINS: boolean;
  HSTS_PRELOAD: boolean;
  
  // API Configuration
  API_TIMEOUT: number;
  API_MAX_RETRIES: number;
  API_RETRY_DELAY: number;
  
  // Feature Flags
  FEATURE_FLAG_ENABLED: boolean;
  FEATURE_FLAG_REDIS_URL?: string | undefined;
  
  // Development
  NEXT_PUBLIC_ENABLE_DEBUG: boolean;
  NEXT_PUBLIC_ENABLE_MOCK_DATA: boolean;
  NEXT_PUBLIC_ENABLE_ANALYTICS: boolean;
}

// Environment configuration class with lazy loading
export class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private _config: Environment | null = null;
  private _isValidated = false;

  private constructor() {}

  static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private validateEnvironment(): Environment {
    if (this._config && this._isValidated) {
      return this._config;
    }

    try {
      // Debug: Log available environment variables (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('Available environment variables:', Object.keys(process.env).filter(key => key.startsWith('NODE_ENV') || key.startsWith('NEXT_PUBLIC') || key.startsWith('JWT') || key.startsWith('ENCRYPTION')));
      }
      
      // Create a copy of process.env with NODE_ENV ensured
      const envVars = { ...process.env };
      if (!envVars.NODE_ENV) {
        envVars.NODE_ENV = 'development';
      }

      // Validate required environment variables
      const requiredVars = [
        'NEXT_PUBLIC_API_URL',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'ENCRYPTION_KEY',
        'SESSION_SECRET'
      ];

      const missingVars = requiredVars.filter(varName => !envVars[varName]);
      if (missingVars.length > 0) {
        console.warn('Missing required environment variables:', missingVars);
      }

      // Build configuration object with defaults
      const config: Environment = {
        // Application
        NODE_ENV: (envVars.NODE_ENV as 'development' | 'production' | 'test') || 'development',
        NEXT_PUBLIC_API_URL: envVars.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
        
        // Security
        JWT_SECRET: envVars.JWT_SECRET || 'default-jwt-secret-change-in-production',
        JWT_REFRESH_SECRET: envVars.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
        ENCRYPTION_KEY: envVars.ENCRYPTION_KEY || 'default-encryption-key-change-in-production',
        SESSION_SECRET: envVars.SESSION_SECRET || 'default-session-secret-change-in-production',
        
        // Rate Limiting
        RATE_LIMIT_WINDOW_MS: parseInt(envVars.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
        RATE_LIMIT_MAX_REQUESTS: parseInt(envVars.RATE_LIMIT_MAX_REQUESTS || '100'),
        
        // Database
        DATABASE_URL: envVars.DATABASE_URL,
        DATABASE_SSL: envVars.DATABASE_SSL === 'true',
        
        // Redis
        REDIS_URL: envVars.REDIS_URL,
        REDIS_PASSWORD: envVars.REDIS_PASSWORD,
        
        // Email
        SMTP_HOST: envVars.SMTP_HOST,
        SMTP_PORT: envVars.SMTP_PORT ? parseInt(envVars.SMTP_PORT) : undefined,
        SMTP_USER: envVars.SMTP_USER,
        SMTP_PASS: envVars.SMTP_PASS,
        EMAIL_FROM: envVars.EMAIL_FROM,
        
        // File Upload
        MAX_FILE_SIZE: parseInt(envVars.MAX_FILE_SIZE || '10485760'), // 10MB
        ALLOWED_FILE_TYPES: envVars.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png',
        UPLOAD_DIR: envVars.UPLOAD_DIR || './uploads',
        
        // Monitoring
        LOG_LEVEL: (envVars.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
        SENTRY_DSN: envVars.SENTRY_DSN,
        DATADOG_API_KEY: envVars.DATADOG_API_KEY,
        
        // Third-party Services
        STRIPE_SECRET_KEY: envVars.STRIPE_SECRET_KEY,
        STRIPE_PUBLISHABLE_KEY: envVars.STRIPE_PUBLISHABLE_KEY,
        PAYPAL_CLIENT_ID: envVars.PAYPAL_CLIENT_ID,
        PAYPAL_CLIENT_SECRET: envVars.PAYPAL_CLIENT_SECRET,
        
        // Compliance
        AUDIT_LOG_ENABLED: envVars.AUDIT_LOG_ENABLED === 'true',
        AUDIT_LOG_RETENTION_DAYS: parseInt(envVars.AUDIT_LOG_RETENTION_DAYS || '365'),
        GDPR_ENABLED: envVars.GDPR_ENABLED === 'true',
        DATA_RETENTION_DAYS: parseInt(envVars.DATA_RETENTION_DAYS || '2555'), // 7 years
        
        // Security Headers
        CSP_NONCE_ENABLED: envVars.CSP_NONCE_ENABLED === 'true',
        HSTS_MAX_AGE: parseInt(envVars.HSTS_MAX_AGE || '31536000'), // 1 year
        HSTS_INCLUDE_SUBDOMAINS: envVars.HSTS_INCLUDE_SUBDOMAINS === 'true',
        HSTS_PRELOAD: envVars.HSTS_PRELOAD === 'true',
        
        // API Configuration
        API_TIMEOUT: parseInt(envVars.API_TIMEOUT || '30000'), // 30 seconds
        API_MAX_RETRIES: parseInt(envVars.API_MAX_RETRIES || '3'),
        API_RETRY_DELAY: parseInt(envVars.API_RETRY_DELAY || '1000'), // 1 second
        
        // Feature Flags
        FEATURE_FLAG_ENABLED: envVars.FEATURE_FLAG_ENABLED === 'true',
        FEATURE_FLAG_REDIS_URL: envVars.FEATURE_FLAG_REDIS_URL,
        
        // Development
        NEXT_PUBLIC_ENABLE_DEBUG: envVars.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
        NEXT_PUBLIC_ENABLE_MOCK_DATA: envVars.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true',
        NEXT_PUBLIC_ENABLE_ANALYTICS: envVars.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      };

      this._config = config;
      this._isValidated = true;

      if (process.env.NODE_ENV === 'development') {
        console.log('Environment validation successful');
      }

      return config;
    } catch (error) {
      console.error('Environment validation failed:', error);
      throw new Error('Failed to validate environment configuration');
    }
  }

  get config(): Environment {
    if (!this._config) {
      return this.validateEnvironment();
    }
    return this._config;
  }

  get isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  get isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  get isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  get apiUrl(): string {
    return this.config.NEXT_PUBLIC_API_URL;
  }

  get jwtSecret(): string {
    return this.config.JWT_SECRET;
  }

  get encryptionKey(): string {
    return this.config.ENCRYPTION_KEY;
  }

  get rateLimitConfig() {
    return {
      windowMs: this.config.RATE_LIMIT_WINDOW_MS,
      max: this.config.RATE_LIMIT_MAX_REQUESTS,
    };
  }

  get securityConfig() {
    return {
      jwtSecret: this.config.JWT_SECRET,
      jwtRefreshSecret: this.config.JWT_REFRESH_SECRET,
      encryptionKey: this.config.ENCRYPTION_KEY,
      sessionSecret: this.config.SESSION_SECRET,
    };
  }

  get complianceConfig() {
    return {
      auditLogEnabled: this.config.AUDIT_LOG_ENABLED,
      auditLogRetentionDays: this.config.AUDIT_LOG_RETENTION_DAYS,
      gdprEnabled: this.config.GDPR_ENABLED,
      dataRetentionDays: this.config.DATA_RETENTION_DAYS,
    };
  }

  get monitoringConfig() {
    return {
      logLevel: this.config.LOG_LEVEL,
      sentryDsn: this.config.SENTRY_DSN,
      datadogApiKey: this.config.DATADOG_API_KEY,
    };
  }

  get thirdPartyConfig() {
    return {
      stripe: {
        secretKey: this.config.STRIPE_SECRET_KEY,
        publishableKey: this.config.STRIPE_PUBLISHABLE_KEY,
      },
      paypal: {
        clientId: this.config.PAYPAL_CLIENT_ID,
        clientSecret: this.config.PAYPAL_CLIENT_SECRET,
      },
    };
  }

  get featureFlags() {
    return {
      enabled: this.config.FEATURE_FLAG_ENABLED,
      redisUrl: this.config.FEATURE_FLAG_REDIS_URL,
    };
  }

  get developmentFlags() {
    return {
      enableDebug: this.config.NEXT_PUBLIC_ENABLE_DEBUG,
      enableMockData: this.config.NEXT_PUBLIC_ENABLE_MOCK_DATA,
      enableAnalytics: this.config.NEXT_PUBLIC_ENABLE_ANALYTICS,
    };
  }
}

// Export singleton instance
export const env = EnvironmentConfig.getInstance(); 