import { z } from 'zod';
import { BaseSchemas } from './baseSchemas';

// User validation schemas
export const UserSchemas = {
  createUser: z.object({
    username: z.string().min(1, 'Username is required').max(50),
    password: BaseSchemas.password,
  }),
  
  login: z.object({
    username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters'),
    password: z.string().min(1, 'Password is required')
  }),

};
