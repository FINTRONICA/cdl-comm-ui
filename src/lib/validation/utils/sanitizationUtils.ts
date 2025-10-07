import DOMPurify from 'isomorphic-dompurify';

// Sanitization utilities
export class SanitizationUtils {
  // Sanitize HTML content
  static sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
    });
  }

  // Sanitize text content
  static sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Sanitize email
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  // Sanitize phone number
  static sanitizePhone(phone: string): string {
    return phone.replace(/[^\d\s\-\(\)\+]/g, '').trim();
  }

  // Sanitize amount
  static sanitizeAmount(amount: string): number {
    const parsed = parseFloat(amount.replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }

  // Sanitize object recursively
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized as T;
  }

  // Remove sensitive data from objects
  static removeSensitiveData<T extends Record<string, any>>(obj: T, sensitiveFields: string[]): T {
    const cleaned: any = { ...obj };
    
    sensitiveFields.forEach(field => {
      if (field in cleaned) {
        delete cleaned[field];
      }
    });
    
    return cleaned;
  }

  // Mask sensitive data
  static maskSensitiveData(data: string, type: 'email' | 'phone' | 'card' | 'ssn'): string {
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
      
      default:
        return '***';
    }
  }
}
