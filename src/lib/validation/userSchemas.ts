import { z } from 'zod';
import { BaseSchemas } from './baseSchemas';

// User validation schemas
export const UserSchemas = {
  createUser: z.object({
    email: BaseSchemas.email,
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    password: BaseSchemas.password,
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    phone: BaseSchemas.phone.optional(),
    role: z.enum(['admin', 'manager', 'user', 'viewer']).default('user'),
    isActive: z.boolean().default(true)
  }),
  
  updateUser: z.object({
    email: BaseSchemas.email.optional(),
    username: z.string().min(3).max(50).optional(),
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phone: BaseSchemas.phone.optional(),
    role: z.enum(['admin', 'manager', 'user', 'viewer']).optional(),
    isActive: z.boolean().optional()
  }),
  
  login: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
    password: z.string().min(1, 'Password is required')
  }),
  
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: BaseSchemas.password,
    confirmPassword: z.string().min(1, 'Password confirmation is required')
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),
  
  resetPassword: z.object({
    email: BaseSchemas.email,
    token: z.string().min(1, 'Reset token is required'),
    newPassword: BaseSchemas.password,
    confirmPassword: z.string().min(1, 'Password confirmation is required')
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  })
};
