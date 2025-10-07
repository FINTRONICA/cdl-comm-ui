import { SecurityMonitor } from './securityMonitor';
import { AuditLogger, AuditEventType, AuditSeverity } from './auditLogger';

export function initializeSecurityServices() {
  // Make security initialization non-blocking
  setTimeout(() => {
    try {
      // Start security monitoring
      SecurityMonitor.startMonitoring();
      
      // Log system startup
      AuditLogger.log({
        eventType: AuditEventType.SECURITY_EVENT,
        severity: AuditSeverity.LOW,
        ipAddress: 'system',
        userAgent: 'system',
        action: 'security_services_initialized',
        details: { 
          environment: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString()
        },
        outcome: 'success'
      });
      
      console.log('Security services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize security services:', error);
    }
  }, 0); // Use setTimeout to make it non-blocking
}

export function shutdownSecurityServices() {
  try {
    // Stop security monitoring
    SecurityMonitor.stopMonitoring();
    
    // Log system shutdown
    AuditLogger.log({
      eventType: AuditEventType.SECURITY_EVENT,
      severity: AuditSeverity.LOW,
      ipAddress: 'system',
      userAgent: 'system',
      action: 'security_services_shutdown',
      details: { 
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      },
      outcome: 'success'
    });
    
    console.log('Security services shutdown successfully');
  } catch (error) {
    console.error('Failed to shutdown security services:', error);
  }
} 