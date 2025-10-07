import { z } from 'zod';
import { BaseSchemas } from './baseSchemas';

// Transaction validation schemas
export const TransactionSchemas = {
  createTransaction: z.object({
    amount: BaseSchemas.amount,
    currency: BaseSchemas.currency,
    description: z.string().min(1, 'Description is required').max(500),
    senderId: BaseSchemas.id,
    recipientId: BaseSchemas.id,
    escrowFee: BaseSchemas.amount.optional(),
    dueDate: BaseSchemas.date.optional(),
    metadata: z.record(z.string(), z.any()).optional()
  }),
  
  updateTransaction: z.object({
    amount: BaseSchemas.amount.optional(),
    currency: BaseSchemas.currency.optional(),
    description: z.string().min(1).max(500).optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'completed', 'cancelled']).optional(),
    escrowFee: BaseSchemas.amount.optional(),
    dueDate: BaseSchemas.date.optional(),
    metadata: z.record(z.string(), z.any()).optional()
  }),
  
  approveTransaction: z.object({
    transactionId: BaseSchemas.id,
    approverId: BaseSchemas.id,
    approvalNotes: z.string().max(1000).optional()
  }),
  
  rejectTransaction: z.object({
    transactionId: BaseSchemas.id,
    rejectorId: BaseSchemas.id,
    rejectionReason: z.string().min(1, 'Rejection reason is required').max(1000)
  })
};

// Project validation schemas
export const ProjectSchemas = {
  createProject: z.object({
    name: z.string().min(1, 'Project name is required').max(100),
    description: z.string().min(1, 'Description is required').max(1000),
    budget: BaseSchemas.amount,
    currency: BaseSchemas.currency,
    startDate: BaseSchemas.date,
    endDate: BaseSchemas.date.optional(),
    clientId: BaseSchemas.id,
    managerId: BaseSchemas.id,
    status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft'),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.any()).optional()
  }),
  
  updateProject: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().min(1).max(1000).optional(),
    budget: BaseSchemas.amount.optional(),
    currency: BaseSchemas.currency.optional(),
    startDate: BaseSchemas.date.optional(),
    endDate: BaseSchemas.date.optional(),
    status: z.enum(['draft', 'active', 'completed', 'cancelled']).optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.any()).optional()
  })
};

// Payment validation schemas
export const PaymentSchemas = {
  createPayment: z.object({
    amount: BaseSchemas.amount,
    currency: BaseSchemas.currency,
    paymentMethod: z.enum(['bank_transfer', 'credit_card', 'paypal', 'stripe']),
    transactionId: BaseSchemas.id,
    payerId: BaseSchemas.id,
    payeeId: BaseSchemas.id,
    description: z.string().min(1).max(500),
    metadata: z.record(z.string(), z.any()).optional()
  }),
  
  processPayment: z.object({
    paymentId: BaseSchemas.id,
    processorId: BaseSchemas.id,
    processorResponse: z.record(z.string(), z.any()),
    status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded']),
    errorMessage: z.string().optional()
  })
};

// Search and filter schemas
export const SearchSchemas = {
  searchQuery: z.object({
    q: z.string().min(1, 'Search query is required').max(200),
    filters: z.record(z.string(), z.any()).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    ...BaseSchemas.pagination.shape
  }),
  
  dateFilter: z.object({
    startDate: BaseSchemas.date.optional(),
    endDate: BaseSchemas.date.optional(),
    dateField: z.string().optional()
  }),
  
  statusFilter: z.object({
    status: z.enum(['active', 'inactive', 'pending', 'completed', 'cancelled']).optional(),
    includeArchived: z.boolean().default(false)
  })
};
