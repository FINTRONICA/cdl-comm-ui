import { env } from '../config/environment';
import { EncryptionService } from './encryption';

export enum DataCategory {
  PERSONAL = 'personal',
  FINANCIAL = 'financial',
  TRANSACTIONAL = 'transactional',
  TECHNICAL = 'technical',
  SENSITIVE = 'sensitive'
}

export enum DataRetentionPolicy {
  IMMEDIATE = 'immediate',
  SHORT_TERM = 'short_term', // 30 days
  MEDIUM_TERM = 'medium_term', // 1 year
  LONG_TERM = 'long_term', // 7 years
  PERMANENT = 'permanent'
}

export interface PrivacySettings {
  dataRetentionDays: number;
  allowDataExport: boolean;
  allowDataDeletion: boolean;
  anonymizeData: boolean;
  encryptSensitiveData: boolean;
  logDataAccess: boolean;
}

export interface DataSubject {
  id: string;
  email: string;
  consentGiven: boolean;
  consentDate?: Date;
  dataRights: DataRights;
  preferences: PrivacyPreferences;
}

export interface DataRights {
  rightToAccess: boolean;
  rightToRectification: boolean;
  rightToErasure: boolean;
  rightToPortability: boolean;
  rightToRestriction: boolean;
  rightToObject: boolean;
}

export interface PrivacyPreferences {
  marketingEmails: boolean;
  transactionNotifications: boolean;
  securityAlerts: boolean;
  dataSharing: boolean;
  analytics: boolean;
}

export class PrivacyService {
  // private static readonly DEFAULT_RETENTION_DAYS = 2555; // 7 years
  private static readonly SENSITIVE_FIELDS = [
    'password', 'ssn', 'creditCard', 'bankAccount', 'taxId',
    'passport', 'driversLicense', 'medicalInfo', 'biometricData'
  ];

  // Check if GDPR is enabled
  static isGDPREnabled(): boolean {
    return env.complianceConfig.gdprEnabled;
  }

  // Get data retention policy
  static getDataRetentionPolicy(category: DataCategory): DataRetentionPolicy {
    const policies: Record<DataCategory, DataRetentionPolicy> = {
      [DataCategory.PERSONAL]: DataRetentionPolicy.MEDIUM_TERM,
      [DataCategory.FINANCIAL]: DataRetentionPolicy.LONG_TERM,
      [DataCategory.TRANSACTIONAL]: DataRetentionPolicy.LONG_TERM,
      [DataCategory.TECHNICAL]: DataRetentionPolicy.SHORT_TERM,
      [DataCategory.SENSITIVE]: DataRetentionPolicy.IMMEDIATE
    };

    return policies[category];
  }

  // Get retention days for data category
  static getRetentionDays(category: DataCategory): number {
    const policy = this.getDataRetentionPolicy(category);
    
    const retentionDays: Record<DataRetentionPolicy, number> = {
      [DataRetentionPolicy.IMMEDIATE]: 0,
      [DataRetentionPolicy.SHORT_TERM]: 30,
      [DataRetentionPolicy.MEDIUM_TERM]: 365,
      [DataRetentionPolicy.LONG_TERM]: 2555,
      [DataRetentionPolicy.PERMANENT]: -1
    };

    return retentionDays[policy];
  }

  // Check if data should be retained
  static shouldRetainData(createdDate: Date, category: DataCategory): boolean {
    const retentionDays = this.getRetentionDays(category);
    
    if (retentionDays === -1) return true; // Permanent retention
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    return createdDate >= cutoffDate;
  }

  // Anonymize personal data
  static anonymizeData<T extends Record<string, unknown>>(data: T, fields: string[]): T {
    const anonymized = { ...data };
    
    fields.forEach(field => {
      if (field in anonymized) {
        (anonymized as any)[field] = this.generateAnonymizedValue(field, (anonymized as any)[field]);
      }
    });
    
    return anonymized;
  }

  // Generate anonymized value
  private static generateAnonymizedValue(field: string, value: unknown): string {
    if (typeof value !== 'string') return '[ANONYMIZED]';
    
    switch (field.toLowerCase()) {
      case 'email':
        const [local, domain] = value.split('@');
        return `${local?.charAt(0) || 'x'}***@${domain || 'example.com'}`;
      
      case 'phone':
        return value.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2');
      
      case 'name':
        return value.charAt(0) + '*'.repeat(value.length - 1);
      
      case 'address':
        return '[ADDRESS ANONYMIZED]';
      
      default:
        return value.length > 2 
          ? `${value.charAt(0)}${'*'.repeat(value.length - 2)}${value.charAt(value.length - 1)}`
          : '***';
    }
  }

  // Encrypt sensitive data
  static encryptSensitiveData<T extends Record<string, unknown>>(data: T): T {
    const encrypted = { ...data };
    
    this.SENSITIVE_FIELDS.forEach(field => {
      if (field in encrypted && typeof (encrypted as any)[field] === 'string') {
        const result = EncryptionService.encrypt((encrypted as any)[field]);
        if (result.success && result.data) {
          (encrypted as any)[field] = JSON.stringify(result.data);
        }
      }
    });
    
    return encrypted;
  }

  // Decrypt sensitive data
  static decryptSensitiveData<T extends Record<string, unknown>>(data: T): T {
    const decrypted = { ...data };
    
    this.SENSITIVE_FIELDS.forEach(field => {
      if (field in decrypted && typeof (decrypted as any)[field] === 'string') {
        try {
          const encryptedData = JSON.parse((decrypted as any)[field]);
          const result = EncryptionService.decrypt(encryptedData);
          if (result.success && result.data) {
            (decrypted as any)[field] = result.data.encrypted;
          }
        } catch {
          // If parsing fails, keep original value
        }
      }
    });
    
    return decrypted;
  }

  // Remove sensitive data
  static removeSensitiveData<T extends Record<string, unknown>>(data: T): T {
    const cleaned = { ...data };
    
    this.SENSITIVE_FIELDS.forEach(field => {
      if (field in cleaned) {
        delete (cleaned as any)[field];
      }
    });
    
    return cleaned;
  }

  // Check data access permissions
  static canAccessData(
    userId: string,
    dataOwnerId: string,
    userRole: string,
    dataCategory: DataCategory
  ): boolean {
    // Admin can access all data
    if (userRole === 'admin') return true;
    
    // Users can access their own data
    if (userId === dataOwnerId) return true;
    
    // Managers can access non-sensitive data
    if (userRole === 'manager' && dataCategory !== DataCategory.SENSITIVE) {
      return true;
    }
    
    return false;
  }

  // Log data access for audit
  static logDataAccess(
    userId: string,
    dataOwnerId: string,
    dataCategory: DataCategory,
    action: 'read' | 'write' | 'delete' | 'export',
    details: Record<string, unknown> = {}
  ): void {
    if (!env.complianceConfig.auditLogEnabled) return;
    
 
  }

  // Generate data export for GDPR
  static generateDataExport(userId: string, dataOwnerId: string): {
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
  } {
    if (!this.canAccessData(userId, dataOwnerId, 'admin', DataCategory.PERSONAL)) {
      return {
        success: false,
        error: 'Insufficient permissions to export data'
      };
    }

    try {
      // In a real implementation, this would fetch data from database
      const exportData = {
        personalData: {
          // Personal information
        },
        financialData: {
          // Financial information (anonymized)
        },
        transactionHistory: {
          // Transaction history
        },
        preferences: {
          // User preferences
        },
        metadata: {
          exportDate: new Date().toISOString(),
          exportedBy: userId,
          dataOwnerId
        }
      };

      // Log the export
      this.logDataAccess(userId, dataOwnerId, DataCategory.PERSONAL, 'export', {
        exportSize: JSON.stringify(exportData).length
      });

      return {
        success: true,
        data: exportData
      };
    } catch {
      return {
        success: false,
        error: 'Failed to generate data export'
      };
    }
  }

  // Process data deletion request (GDPR Right to Erasure)
  static processDataDeletion(
    userId: string,
    dataOwnerId: string,
    reason: string
  ): {
    success: boolean;
    message?: string;
    error?: string;
  } {
    if (!this.canAccessData(userId, dataOwnerId, 'admin', DataCategory.PERSONAL)) {
      return {
        success: false,
        error: 'Insufficient permissions to delete data'
      };
    }

    try {
      // In a real implementation, this would:
      // 1. Anonymize personal data
      // 2. Delete sensitive data
      // 3. Keep financial records for legal compliance
      // 4. Log the deletion

      this.logDataAccess(userId, dataOwnerId, DataCategory.PERSONAL, 'delete', {
        reason
      });

      return {
        success: true,
        message: 'Data deletion request processed successfully'
      };
    } catch {
      return {
        success: false,
        error: 'Failed to process data deletion request'
      };
    }
  }

  // Check consent status
  static checkConsent(): boolean {
    // In a real implementation, this would check the user's consent status
    // from the database
    return true; // Placeholder
  }

  // Update consent
  static updateConsent(
    userId: string,
    consentType: string,
    granted: boolean
  ): void {
    // In a real implementation, this would update the user's consent
    // in the database and log the change
    this.logDataAccess(userId, userId, DataCategory.PERSONAL, 'write', {
      consentType,
      granted
    });
  }

  // Get privacy settings
  static getPrivacySettings(): PrivacySettings {
    return {
      dataRetentionDays: env.complianceConfig.dataRetentionDays,
      allowDataExport: true,
      allowDataDeletion: true,
      anonymizeData: true,
      encryptSensitiveData: true,
      logDataAccess: env.complianceConfig.auditLogEnabled
    };
  }

  // Validate privacy compliance
  static validatePrivacyCompliance(): {
    compliant: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    if (!this.isGDPREnabled()) {
      issues.push('GDPR compliance is disabled');
    }
    
    if (!env.complianceConfig.auditLogEnabled) {
      issues.push('Audit logging is disabled');
    }
    
    if (env.complianceConfig.dataRetentionDays < 30) {
      issues.push('Data retention period is too short for compliance');
    }
    
    return {
      compliant: issues.length === 0,
      issues
    };
  }
} 