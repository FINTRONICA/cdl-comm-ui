import { env } from '../config/environment';

export enum AuditEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  
  // User Management Events
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ACTIVATED = 'user_activated',
  USER_DEACTIVATED = 'user_deactivated',
  
  // Transaction Events
  TRANSACTION_CREATED = 'transaction_created',
  TRANSACTION_UPDATED = 'transaction_updated',
  TRANSACTION_DELETED = 'transaction_deleted',
  TRANSACTION_APPROVED = 'transaction_approved',
  TRANSACTION_REJECTED = 'transaction_rejected',
  
  // Financial Events
  PAYMENT_CREATED = 'payment_created',
  PAYMENT_PROCESSED = 'payment_processed',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REFUNDED = 'payment_refunded',
  
  // Project Events
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_DELETED = 'project_deleted',
  
  // System Events
  CONFIGURATION_CHANGED = 'configuration_changed',
  SECURITY_EVENT = 'security_event',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  
  // Compliance Events
  GDPR_REQUEST = 'gdpr_request',
  DATA_RETENTION = 'data_retention',
  AUDIT_REPORT = 'audit_report',
  
  // API Events
  API_ACCESS = 'api_access',
  API_ERROR = 'api_error',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded'
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress: string;
  userAgent?: string;
  sessionId?: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  details: Record<string, unknown>;
  outcome: 'success' | 'failure' | 'pending';
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditQuery {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: AuditEventType[];
  severity?: AuditSeverity[];
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  outcome?: 'success' | 'failure' | 'pending';
  limit?: number;
  offset?: number;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private auditEvents: AuditEvent[] = [];

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  // Log audit event
  static log(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date()
    };

    // Store in memory (in production, save to database)
    this.getInstance().auditEvents.push(auditEvent);


    // Send to external monitoring in production
    if (env.isProduction) {
      this.sendToMonitoring(auditEvent);
    }
  }

  // Log authentication events
  static logAuthEvent(
    eventType: AuditEventType.LOGIN_SUCCESS | AuditEventType.LOGIN_FAILURE | AuditEventType.LOGOUT,
    userId: string,
    userEmail: string,
    userRole: string,
    ipAddress: string,
    userAgent: string,
    sessionId: string,
    details: Record<string, unknown> = {},
    errorMessage?: string
  ): void {
    this.log({
      eventType,
      severity: eventType === AuditEventType.LOGIN_FAILURE ? AuditSeverity.HIGH : AuditSeverity.LOW,
      userId,
      userEmail,
      userRole,
      ipAddress,
      userAgent,
      sessionId,
      action: eventType,
      details,
      outcome: eventType === AuditEventType.LOGIN_FAILURE ? 'failure' : 'success',
      ...(errorMessage && { errorMessage })
    });
  }

  // Log user management events
  static logUserEvent(
    eventType: AuditEventType.USER_CREATED | AuditEventType.USER_UPDATED | AuditEventType.USER_DELETED,
    targetUserId: string,
    targetUserEmail: string,
    actorUserId: string,
    actorUserEmail: string,
    actorUserRole: string,
    ipAddress: string,
    userAgent: string,
    details: Record<string, unknown> = {}
  ): void {
    this.log({
      eventType,
      severity: AuditSeverity.MEDIUM,
      userId: actorUserId,
      userEmail: actorUserEmail,
      userRole: actorUserRole,
      ipAddress,
      userAgent,
      resourceType: 'user',
      resourceId: targetUserId,
      action: eventType,
      details: {
        ...details,
        targetUserId,
        targetUserEmail
      },
      outcome: 'success'
    });
  }

  // Log transaction events
  static logTransactionEvent(
    eventType: AuditEventType.TRANSACTION_CREATED | AuditEventType.TRANSACTION_UPDATED | AuditEventType.TRANSACTION_DELETED | AuditEventType.TRANSACTION_APPROVED | AuditEventType.TRANSACTION_REJECTED,
    transactionId: string,
    userId: string,
    userEmail: string,
    userRole: string,
    ipAddress: string,
    userAgent: string,
    details: Record<string, unknown> = {}
  ): void {
    this.log({
      eventType,
      severity: AuditSeverity.HIGH,
      userId,
      userEmail,
      userRole,
      ipAddress,
      userAgent,
      resourceType: 'transaction',
      resourceId: transactionId,
      action: eventType,
      details,
      outcome: 'success'
    });
  }

  // Log security events
  static logSecurityEvent(
    eventType: AuditEventType.SECURITY_EVENT,
    severity: AuditSeverity,
    userId: string,
    userEmail: string,
    userRole: string,
    ipAddress: string,
    userAgent: string,
    details: Record<string, unknown> = {},
    errorMessage?: string
  ): void {
    this.log({
      eventType,
      severity,
      userId,
      userEmail,
      userRole,
      ipAddress,
      userAgent,
      action: 'security_event',
      details,
      outcome: errorMessage ? 'failure' : 'success',
      ...(errorMessage && { errorMessage })
    });
  }

  // Log API access
  static logAPIAccess(
    endpoint: string,
    method: string,
    userId: string,
    userEmail: string,
    userRole: string,
    ipAddress: string,
    userAgent: string,
    responseTime: number,
    statusCode: number,
    details: Record<string, unknown> = {}
  ): void {
    this.log({
      eventType: AuditEventType.API_ACCESS,
      severity: AuditSeverity.LOW,
      userId,
      userEmail,
      userRole,
      ipAddress,
      userAgent,
      action: `${method} ${endpoint}`,
      details: {
        ...details,
        endpoint,
        method,
        responseTime,
        statusCode
      },
      outcome: statusCode < 400 ? 'success' : 'failure'
    });
  }

  // Query audit events
  static queryEvents(query: AuditQuery): AuditEvent[] {
    let events = this.getInstance().auditEvents;

    if (query.startDate) {
      events = events.filter(event => event.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      events = events.filter(event => event.timestamp <= query.endDate!);
    }

    if (query.eventTypes) {
      events = events.filter(event => query.eventTypes!.includes(event.eventType));
    }

    if (query.severity) {
      events = events.filter(event => query.severity!.includes(event.severity));
    }

    if (query.userId) {
      events = events.filter(event => event.userId === query.userId);
    }

    if (query.resourceType) {
      events = events.filter(event => event.resourceType === query.resourceType);
    }

    if (query.resourceId) {
      events = events.filter(event => event.resourceId === query.resourceId);
    }

    if (query.outcome) {
      events = events.filter(event => event.outcome === query.outcome);
    }

    // Sort by timestamp descending
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;

    return events.slice(offset, offset + limit);
  }

  // Generate audit report
  static generateAuditReport(startDate: Date, endDate: Date): {
    totalEvents: number;
    eventsByType: Record<AuditEventType, number>;
    eventsBySeverity: Record<AuditSeverity, number>;
    eventsByOutcome: Record<string, number>;
    topUsers: Array<{ userId: string; eventCount: number }>;
    topIPs: Array<{ ipAddress: string; eventCount: number }>;
  } {
    const events = this.queryEvents({ startDate, endDate });

    const eventsByType: Record<AuditEventType, number> = {} as Record<AuditEventType, number>;
    const eventsBySeverity: Record<AuditSeverity, number> = {} as Record<AuditSeverity, number>;
    const eventsByOutcome: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};

    events.forEach(event => {
      // Count by type
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;

      // Count by severity
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;

      // Count by outcome
      eventsByOutcome[event.outcome] = (eventsByOutcome[event.outcome] || 0) + 1;

      // Count by user
      if (event.userId) {
        userCounts[event.userId] = (userCounts[event.userId] || 0) + 1;
      }

      // Count by IP
      ipCounts[event.ipAddress] = (ipCounts[event.ipAddress] || 0) + 1;
    });

    const topUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, eventCount: count }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    const topIPs = Object.entries(ipCounts)
      .map(([ipAddress, count]) => ({ ipAddress, eventCount: count }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      eventsByOutcome,
      topUsers,
      topIPs
    };
  }

  // Clean old audit events (data retention)
  static cleanOldEvents(): void {
    const retentionDays = env.complianceConfig.auditLogRetentionDays;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    this.getInstance().auditEvents = this.getInstance().auditEvents.filter(
      event => event.timestamp >= cutoffDate
    );
  }

  // Export audit events
  static exportAuditEvents(query: AuditQuery): string {
    const events = this.queryEvents(query);
    return JSON.stringify(events, null, 2);
  }

  private static generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static sendToMonitoring(event: AuditEvent): void {
   
  }
} 