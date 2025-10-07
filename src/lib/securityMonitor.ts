import { env } from '../config/environment';
import { AuditLogger, AuditEventType, AuditSeverity } from './auditLogger';

export interface SecurityAlert {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: SecurityAlertCategory;
  title: string;
  description: string;
  source: string;
  ipAddress?: string;
  userId?: string;
  userAgent?: string;
  details: Record<string, unknown>;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  notes?: string[];
}

export enum SecurityAlertCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_BREACH = 'data_breach',
  MALWARE = 'malware',
  NETWORK_ATTACK = 'network_attack',
  APPLICATION_ATTACK = 'application_attack',
  CONFIGURATION = 'configuration',
  COMPLIANCE = 'compliance'
}

export interface SecurityMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
}

export interface SecurityDashboard {
  alerts: SecurityAlert[];
  metrics: SecurityMetric[];
  summary: {
    totalAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
    mediumAlerts: number;
    lowAlerts: number;
    openAlerts: number;
    resolvedAlerts: number;
  };
}

export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private alerts: SecurityAlert[] = [];
  private metrics: SecurityMetric[] = [];
  private alertRules: AlertRule[] = [];
  private isMonitoring = false;

  private constructor() {
    this.initializeDefaultRules();
  }

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  // Start monitoring
  static startMonitoring(): void {
    const monitor = this.getInstance();
    if (monitor.isMonitoring) return;

    monitor.isMonitoring = true;
    
    // Start monitoring intervals
    setInterval(() => {
      this.monitorSystemHealth();
    }, 60 * 1000); // Every minute

    setInterval(() => {
      this.cleanupOldAlerts();
    }, 24 * 60 * 60 * 1000); // Daily

    console.log('[SECURITY] Monitoring started');
  }

  // Stop monitoring
  static stopMonitoring(): void {
    const monitor = this.getInstance();
    monitor.isMonitoring = false;
    console.log('[SECURITY] Monitoring stopped');
  }

  // Process security event
  static processSecurityEvent(event: {
    type: string;
    severity: AuditSeverity;
    userId?: string;
    userEmail?: string;
    userRole?: string;
    ipAddress: string;
    userAgent: string;
    details: Record<string, unknown>;
    timestamp: Date;
  }): void {
    const monitor = this.getInstance();
    
    // Check against alert rules
    for (const rule of monitor.alertRules) {
      if (this.evaluateAlertRule(rule, event)) {
        this.createAlert(rule, event);
      }
    }

    // Update metrics
    this.updateMetrics(event);
  }

  // Create security alert
  static createAlert(
    rule: AlertRule,
    event: unknown
  ): SecurityAlert {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      severity: rule.severity,
      category: rule.category,
      title: rule.name,
      description: rule.description,
      source: (event as any).type,
      ipAddress: (event as any).ipAddress,
      userId: (event as any).userId,
      userAgent: (event as any).userAgent,
      details: {
        ruleId: rule.id,
        eventDetails: (event as any).details,
        threshold: rule.threshold,
        currentValue: (event as any).details?.value || 1
      },
      status: 'new'
    };

    this.getInstance().alerts.push(alert);

    // Log the alert
    AuditLogger.log({
      eventType: AuditEventType.SECURITY_EVENT,
      severity: this.mapSeverityToAudit(rule.severity),
      userId: (event as any).userId || 'system',
      userEmail: (event as any).userEmail,
      userRole: (event as any).userRole,
      ipAddress: (event as any).ipAddress,
      userAgent: (event as any).userAgent,
      action: 'security_alert_created',
      details: {
        alertId: alert.id,
        ruleId: rule.id,
        category: rule.category
      },
      outcome: 'success'
    });

    // Send alert notifications
    this.sendAlertNotifications(alert);

    return alert;
  }

  // Get security dashboard
  static getSecurityDashboard(): SecurityDashboard {
    const monitor = this.getInstance();
    const alerts = monitor.alerts;
    
    const summary = {
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      highAlerts: alerts.filter(a => a.severity === 'high').length,
      mediumAlerts: alerts.filter(a => a.severity === 'medium').length,
      lowAlerts: alerts.filter(a => a.severity === 'low').length,
      openAlerts: alerts.filter(a => a.status === 'new' || a.status === 'investigating').length,
      resolvedAlerts: alerts.filter(a => a.status === 'resolved').length
    };

    return {
      alerts: alerts.slice(-100), // Last 100 alerts
      metrics: monitor.metrics.slice(-50), // Last 50 metrics
      summary
    };
  }

  // Update alert status
  static updateAlertStatus(
    alertId: string,
    status: SecurityAlert['status'],
    assignedTo?: string,
    notes?: string
  ): boolean {
    const monitor = this.getInstance();
    const alert = monitor.alerts.find(a => a.id === alertId);
    
    if (!alert) return false;

    alert.status = status;
    if (assignedTo) alert.assignedTo = assignedTo;
    if (notes) alert.notes = alert.notes ? [...alert.notes, notes] : [notes];

    return true;
  }

  // Add custom alert rule
  static addAlertRule(rule: AlertRule): void {
    this.getInstance().alertRules.push(rule);
  }

  // Get alert statistics
  static getAlertStatistics(): {
    totalAlerts: number;
    alertsBySeverity: Record<string, number>;
    alertsByCategory: Record<string, number>;
    alertsByStatus: Record<string, number>;
    averageResponseTime: number;
  } {
    const alerts = this.getInstance().alerts;
    
    const alertsBySeverity: Record<string, number> = {};
    const alertsByCategory: Record<string, number> = {};
    const alertsByStatus: Record<string, number> = {};

    alerts.forEach(alert => {
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
      alertsByCategory[alert.category] = (alertsByCategory[alert.category] || 0) + 1;
      alertsByStatus[alert.status] = (alertsByStatus[alert.status] || 0) + 1;
    });

    return {
      totalAlerts: alerts.length,
      alertsBySeverity,
      alertsByCategory,
      alertsByStatus,
      averageResponseTime: this.calculateAverageResponseTime(alerts)
    };
  }

  // Monitor system health
  private static monitorSystemHealth(): void {
    // Check for unusual activity patterns
    this.detectAnomalies();
    
    // Monitor resource usage
    this.monitorResourceUsage();
    
    // Check for configuration drift
    this.checkConfigurationCompliance();
  }

  // Detect anomalies
  private static detectAnomalies(): void {
    const recentEvents = this.getRecentEvents(); // Last 5 minutes
    
    // Check for unusual login patterns
    const loginEvents = recentEvents.filter((e: any) => e.type === 'login_failure');
    if (loginEvents.length > 10) {
      this.processSecurityEvent({
        type: 'brute_force_attempt',
        severity: AuditSeverity.HIGH,
        ipAddress: (loginEvents[0] as any).ipAddress,
        userAgent: (loginEvents[0] as any).userAgent,
        details: { failedAttempts: loginEvents.length },
        timestamp: new Date()
      });
    }

    // Check for unusual API usage
    const apiEvents = recentEvents.filter((e: any) => e.type === 'api_access');
    if (apiEvents.length > 100) {
      this.processSecurityEvent({
        type: 'api_abuse',
        severity: AuditSeverity.MEDIUM,
        ipAddress: (apiEvents[0] as any).ipAddress,
        userAgent: (apiEvents[0] as any).userAgent,
        details: { apiCalls: apiEvents.length },
        timestamp: new Date()
      });
    }
  }

  // Monitor resource usage
  private static monitorResourceUsage(): void {
    // In a real implementation, this would check system resources
    const cpuUsage = Math.random() * 100; // Placeholder
    const memoryUsage = Math.random() * 100; // Placeholder
    
    if (cpuUsage > 90) {
      this.processSecurityEvent({
        type: 'high_cpu_usage',
        severity: AuditSeverity.MEDIUM,
        ipAddress: 'system',
        userAgent: 'system',
        details: { cpuUsage },
        timestamp: new Date()
      });
    }

    if (memoryUsage > 90) {
      this.processSecurityEvent({
        type: 'high_memory_usage',
        severity: AuditSeverity.MEDIUM,
        ipAddress: 'system',
        userAgent: 'system',
        details: { memoryUsage },
        timestamp: new Date()
      });
    }
  }

  // Check configuration compliance
  private static checkConfigurationCompliance(): void {
    const complianceIssues = [];

    if (!env.complianceConfig.auditLogEnabled) {
      complianceIssues.push('Audit logging is disabled');
    }

    if (!env.complianceConfig.gdprEnabled) {
      complianceIssues.push('GDPR compliance is disabled');
    }

    if (complianceIssues.length > 0) {
      this.processSecurityEvent({
        type: 'configuration_compliance',
        severity: AuditSeverity.HIGH,
        ipAddress: 'system',
        userAgent: 'system',
        details: { issues: complianceIssues },
        timestamp: new Date()
      });
    }
  }

  // Evaluate alert rule
  private static evaluateAlertRule(rule: AlertRule, event: unknown): boolean {
    switch (rule.condition) {
      case 'event_count':
        const recentEvents = this.getRecentEvents();
        const matchingEvents = recentEvents.filter((e: any) => e.type === rule.eventType);
        return matchingEvents.length >= rule.threshold;

      case 'event_pattern':
        return this.matchEventPattern(rule.pattern, event);

      case 'threshold_exceeded':
        return (event as any).details?.value > rule.threshold;

      default:
        return false;
    }
  }

  // Match event pattern
  private static matchEventPattern(pattern: unknown, event: unknown): boolean {
    // Simple pattern matching - in a real implementation, this would be more sophisticated
    if ((pattern as any).ipAddress && (event as any).ipAddress !== (pattern as any).ipAddress) {
      return false;
    }
    
    if ((pattern as any).userAgent && !(event as any).userAgent?.includes((pattern as any).userAgent)) {
      return false;
    }
    
    return true;
  }

  // Update metrics
  private static updateMetrics(event: unknown): void {
    const monitor = this.getInstance();
    const timestamp = new Date();
    
    // Update event count metric
    monitor.metrics.push({
      name: 'security_events_total',
      value: 1,
      unit: 'count',
      timestamp,
      tags: {
        eventType: (event as any).type,
        severity: (event as any).severity,
        source: (event as any).source || 'unknown'
      }
    });

    // Update rate metrics
    const recentMetrics = monitor.metrics.filter(
      m => m.name === 'security_events_total' && 
           timestamp.getTime() - m.timestamp.getTime() < 60 * 1000
    );
    
    monitor.metrics.push({
      name: 'security_events_rate',
      value: recentMetrics.length,
      unit: 'events_per_minute',
      timestamp,
      tags: { period: '1m' }
    });
  }

  // Send alert notifications
  private static sendAlertNotifications(alert: SecurityAlert): void {
    // In a real implementation, this would send notifications via:
    // - Email
    // - SMS
    // - Slack/Discord
    // - PagerDuty
    // - Custom webhooks

    if (alert.severity === 'critical') {
      console.log(`[CRITICAL ALERT] ${alert.title}: ${alert.description}`);
      // Send immediate notification
    } else if (alert.severity === 'high') {
      console.log(`[HIGH ALERT] ${alert.title}: ${alert.description}`);
      // Send high priority notification
    } else {
      console.log(`[ALERT] ${alert.title}: ${alert.description}`);
      // Send regular notification
    }
  }

  // Get recent events (placeholder)
  private static getRecentEvents(): unknown[] {
    // In a real implementation, this would query the audit log
    return [];
  }

  // Calculate average response time
  private static calculateAverageResponseTime(alerts: SecurityAlert[]): number {
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved');
    if (resolvedAlerts.length === 0) return 0;

    const totalTime = resolvedAlerts.reduce((sum, alert) => {
      // Calculate time from creation to resolution
      return sum + (alert.timestamp.getTime() - alert.timestamp.getTime());
    }, 0);

    return totalTime / resolvedAlerts.length;
  }

  // Cleanup old alerts
  private static cleanupOldAlerts(): void {
    const monitor = this.getInstance();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep 90 days

    monitor.alerts = monitor.alerts.filter(alert => alert.timestamp >= cutoffDate);
    monitor.metrics = monitor.metrics.filter(metric => metric.timestamp >= cutoffDate);
  }

  // Map severity to audit severity
  private static mapSeverityToAudit(severity: string): AuditSeverity {
    switch (severity) {
      case 'critical': return AuditSeverity.CRITICAL;
      case 'high': return AuditSeverity.HIGH;
      case 'medium': return AuditSeverity.MEDIUM;
      case 'low': return AuditSeverity.LOW;
      default: return AuditSeverity.MEDIUM;
    }
  }

  // Initialize default alert rules
  private initializeDefaultRules(): void {
    this.alertRules = [
      {
        id: 'brute_force_detection',
        name: 'Brute Force Detection',
        description: 'Multiple failed login attempts detected',
        category: SecurityAlertCategory.AUTHENTICATION,
        severity: 'high',
        condition: 'event_count',
        eventType: 'login_failure',
        threshold: 5,
        timeWindow: 5 * 60 * 1000, // 5 minutes
        enabled: true
      },
      {
        id: 'unusual_api_usage',
        name: 'Unusual API Usage',
        description: 'Abnormal API call patterns detected',
        category: SecurityAlertCategory.APPLICATION_ATTACK,
        severity: 'medium',
        condition: 'event_count',
        eventType: 'api_access',
        threshold: 100,
        timeWindow: 60 * 1000, // 1 minute
        enabled: true
      },
      {
        id: 'data_access_anomaly',
        name: 'Data Access Anomaly',
        description: 'Unusual data access patterns detected',
        category: SecurityAlertCategory.DATA_BREACH,
        severity: 'high',
        condition: 'event_pattern',
        pattern: { dataAccess: true },
        threshold: 1,
        timeWindow: 60 * 1000,
        enabled: true
      },
      {
        id: 'configuration_change',
        name: 'Configuration Change',
        description: 'Security configuration has been modified',
        category: SecurityAlertCategory.CONFIGURATION,
        severity: 'medium',
        condition: 'event_pattern',
        pattern: { configChange: true },
        threshold: 1,
        timeWindow: 24 * 60 * 60 * 1000, // 24 hours
        enabled: true
      }
    ];
  }
}

// Alert rule interface
interface AlertRule {
  id: string;
  name: string;
  description: string;
  category: SecurityAlertCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  condition: 'event_count' | 'event_pattern' | 'threshold_exceeded';
  eventType?: string;
  pattern?: unknown;
  threshold: number;
  timeWindow: number;
  enabled: boolean;
} 