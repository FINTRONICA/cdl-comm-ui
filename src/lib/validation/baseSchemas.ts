import { z } from 'zod';

// Base validation schemas
export const BaseSchemas = {
  // Common field schemas
  id: z.string().uuid('Invalid ID format'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
  
  // Financial schemas
  amount: z.number()
    .positive('Amount must be positive')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']),
  
  // Date schemas
  date: z.string().datetime('Invalid date format'),
  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime()
  }).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
    message: "Start date must be before end date"
  }),
  
  // Pagination schema
  pagination: z.object({
    page: z.number().int().min(0).default(0),
    size: z.number().int().min(1).max(100).default(10),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc')
  }),
  
  // File upload schema
  file: z.object({
    name: z.string().min(1),
    size: z.number().positive(),
    type: z.string().min(1),
    lastModified: z.number().optional()
  })
};
