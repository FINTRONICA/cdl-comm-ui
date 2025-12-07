import crypto from 'crypto';
import { env } from '../config/environment';

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag?: string;
}

export interface EncryptionResult {
  success: boolean;
  data?: EncryptedData;
  error?: string;
}

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16; // 128 bits

  // Encrypt sensitive data
  static encrypt(data: string): EncryptionResult {
    try {
      const key = Buffer.from(env.encryptionKey, 'hex');
      const iv = crypto.randomBytes(this.IV_LENGTH);
      
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
      cipher.setAAD(Buffer.from('escrow-app', 'utf8'));
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        success: true,
        data: {
          encrypted,
          iv: iv.toString('hex'),
          tag: tag.toString('hex')
        }
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      return {
        success: false,
        error: 'Encryption failed'
      };
    }
  }

  // Decrypt sensitive data
  static decrypt(encryptedData: EncryptedData): EncryptionResult {
    try {
      const key = Buffer.from(env.encryptionKey, 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag || '', 'hex');
      
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAAD(Buffer.from('escrow-app', 'utf8'));
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return {
        success: true,
        data: { encrypted: decrypted, iv: '', tag: '' }
      };
    } catch (error) {
      console.error('Decryption failed:', error);
      return {
        success: false,
        error: 'Decryption failed'
      };
    }
  }

  // Hash sensitive data (one-way)
  static hash(data: string, salt?: string): string {
    const saltToUse = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, saltToUse, 10000, 64, 'sha512');
    return `${saltToUse}:${hash.toString('hex')}`;
  }

  // Verify hash
  static verifyHash(data: string, hash: string): boolean {
    const [salt, hashValue] = hash.split(':');
    if (!salt || !hashValue) return false;
    const computedHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512');
    return crypto.timingSafeEqual(Buffer.from(hashValue, 'hex'), computedHash);
  }

  // Generate secure random string
  static generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Encrypt object
  static encryptObject<T extends Record<string, unknown>>(obj: T): EncryptionResult {
    try {
      const jsonString = JSON.stringify(obj);
      return this.encrypt(jsonString);
    } catch {
      return {
        success: false,
        error: 'Object encryption failed'
      };
    }
  }

  // Decrypt object
  static decryptObject<T>(encryptedData: EncryptedData): { success: boolean; data?: T; error?: string } {
    try {
      const result = this.decrypt(encryptedData);
      if (!result.success || !result.data) {
        return { success: false, error: result.error || 'Decryption failed' };
      }
      
      const decrypted = JSON.parse(result.data.encrypted);
      return { success: true, data: decrypted };
    } catch {
      return {
        success: false,
        error: 'Object decryption failed'
      };
    }
  }

  // Encrypt file buffer
  static encryptBuffer(buffer: Buffer): EncryptionResult {
    try {
      const key = Buffer.from(env.encryptionKey, 'hex');
      const iv = crypto.randomBytes(this.IV_LENGTH);
      
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
      cipher.setAAD(Buffer.from('escrow-app', 'utf8'));
      
      const encrypted = Buffer.concat([
        cipher.update(buffer),
        cipher.final()
      ]);
      
      const tag = cipher.getAuthTag();
      
      return {
        success: true,
        data: {
          encrypted: encrypted.toString('base64'),
          iv: iv.toString('hex'),
          tag: tag.toString('hex')
        }
      };
    } catch (error) {
      console.error('Buffer encryption failed:', error);
      return {
        success: false,
        error: 'Buffer encryption failed'
      };
    }
  }

  // Decrypt file buffer
  static decryptBuffer(encryptedData: EncryptedData): { success: boolean; data?: Buffer; error?: string } {
    try {
      const key = Buffer.from(env.encryptionKey, 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag || '', 'hex');
      const encrypted = Buffer.from(encryptedData.encrypted, 'base64');
      
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAAD(Buffer.from('escrow-app', 'utf8'));
      decipher.setAuthTag(tag);
      
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
      
      return { success: true, data: decrypted };
    } catch (error) {
      console.error('Buffer decryption failed:', error);
      return {
        success: false,
        error: 'Buffer decryption failed'
      };
    }
  }

  // Mask sensitive data for display
  static maskSensitiveData(data: string, type: 'email' | 'phone' | 'card' | 'ssn' | 'custom'): string {
    switch (type) {
      case 'email':
        const parts = data.split('@');
        if (parts.length === 2) {
          const [local, domain] = parts;
          if (local && domain) {
            return `${local.charAt(0)}***@${domain}`;
          }
        }
        return '***';
      
      case 'phone':
        return data.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2');
      
      case 'card':
        return data.replace(/(\d{4})\d{8}(\d{4})/, '$1********$2');
      
      case 'ssn':
        return data.replace(/(\d{3})\d{2}(\d{4})/, '$1-**-$2');
      
      case 'custom':
        return data.length > 4 
          ? `${data.substring(0, 2)}${'*'.repeat(data.length - 4)}${data.substring(data.length - 2)}`
          : '***';
      
      default:
        return '***';
    }
  }

  // Generate encryption key
  static generateEncryptionKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString('hex');
  }

  // Validate encryption key
  static validateEncryptionKey(key: string): boolean {
    try {
      const keyBuffer = Buffer.from(key, 'hex');
      return keyBuffer.length === this.KEY_LENGTH;
    } catch {
      return false;
    }
  }
} 