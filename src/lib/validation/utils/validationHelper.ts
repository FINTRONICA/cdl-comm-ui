import { z } from 'zod';
import { SanitizationUtils } from './sanitizationUtils';

// Validation helper class
export class ValidationHelper {
  // Validate and sanitize input
  static async validateAndSanitize<T>(
    schema: z.ZodSchema<T>,
    data: any,
    sanitize: boolean = true
  ): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
    try {
      // Sanitize if requested
      const sanitizedData = sanitize ? SanitizationUtils.sanitizeObject(data) : data;
      
      // Validate
      const validatedData = schema.parse(sanitizedData);
      
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.issues.map((e: any) => e.message)
        };
      }
      console.error('Validation error:', error);
      return {
        success: false,
        errors: ['Validation failed']
      };
    }
  }

  // Validate query parameters
  static validateQueryParams<T>(
    schema: z.ZodSchema<T>,
    query: Record<string, string | string[]>
  ): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      // Convert query params to proper types
      const processedQuery: any = {};
      
      for (const [key, value] of Object.entries(query)) {
        if (Array.isArray(value)) {
          processedQuery[key] = value[0]; // Take first value if array
        } else {
          processedQuery[key] = value;
        }
      }
      
      const validatedData = schema.parse(processedQuery);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.issues.map((e: any) => e.message)
        };
      }
      console.error('Query validation error:', error);
      return {
        success: false,
        errors: ['Query parameter validation failed']
      };
    }
  }

  // Validate file upload
  static validateFileUpload(
    file: File,
    allowedTypes: string[],
    maxSize: number
  ): { success: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    if (file.size > maxSize) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
    }
    
    return {
      success: errors.length === 0,
      errors
    };
  }
}
