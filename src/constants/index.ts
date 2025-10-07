// Application constants

export const APP_CONFIG = {
  name: 'Escrow Central',
  version: '1.0.0',
  description: 'Financial escrow management system',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  defaultLocale: 'en',
  supportedLocales: ['en', 'es'],
} as const

export const ROUTES = {
  dashboard: '/dashboard',
  projects: '/projects',
  transactions: '/transactions',
  activities: '/activities',
  reports: '/reports',
  admin: '/admin',
  investors: '/investors',
  developers: '/developers',
  payments: '/transactions',
  workflowAction: '/admin/workflow/action',
  workfloDifinition: '/admin/workflow/definition',
  workfloStageTemplate: '/admin/workflow/stage-template',
  workflowAmountRule: '/admin/workflow/amount-rule',
  workflowAmountStage: '/admin/workflow/amount-rule',
  workflowRequest: '/admin/workflow/request',
  // payments: '/payments',

} as const

// Import the new API endpoints
export { API_ENDPOINTS, API_CONFIG, buildApiUrl, buildApiUrlWithParams, buildFilterParams, buildPaginationParams, API_QUERY_PARAMS, FILTER_OPERATORS } from './apiEndpoints'

// Legacy API endpoints for backward compatibility
export const LEGACY_API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
  },
  users: {
    list: '/users',
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },
  projects: {
    list: '/projects',
    create: '/projects',
    update: (id: string) => `/projects/${id}`,
    delete: (id: string) => `/projects/${id}`,
    details: (id: string) => `/projects/${id}`,
  },
  transactions: {
    list: '/transactions',
    create: '/transactions',
    update: (id: string) => `/transactions/${id}`,
    delete: (id: string) => `/transactions/${id}`,
  },
  activities: {
    list: '/activities',
    create: '/activities',
  },
  reports: {
    list: '/reports',
    generate: '/reports/generate',
    download: (id: string) => `/reports/${id}/download`,
  },
} as const

export const STATUS_OPTIONS = {
  project: [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  transaction: [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ],
  user: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ],
} as const

export const USER_ROLES = {
  admin: 'admin',
  user: 'user',
  investor: 'investor',
} as const

export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar' },
  { value: 'EUR', label: 'Euro' },
  { value: 'GBP', label: 'British Pound' },
  { value: 'AED', label: 'UAE Dirham' },
] as const

export const TRANSACTION_TYPES = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'fee', label: 'Fee' },
] as const

export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
} as const

export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  input: 'yyyy-MM-dd',
  datetime: 'MMM dd, yyyy HH:mm',
  time: 'HH:mm',
} as const

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const

export const ERROR_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  invalidFormat: 'Invalid format',
  networkError: 'Network error. Please try again.',
  serverError: 'Server error. Please try again later.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
} as const

export const SUCCESS_MESSAGES = {
  created: 'Successfully created',
  updated: 'Successfully updated',
  deleted: 'Successfully deleted',
  saved: 'Changes saved successfully',
} as const

export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    message: 'Please enter a valid phone number',
  },
} as const

export const THEME_COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
} as const

// Template file names for document downloads
export const TEMPLATE_FILES = {
  BUILD_PARTNER: 'BuildPartnerTemplate.xlsx',
  BUILD_PARTNER_ASSET: 'BuildPartnerAssestTemplate.xlsx',
  BUILD_PARTNER_BENEFICIARY: 'BuildPartnerBeneficiaryTemplate.xlsx',
  BUILD_PARTNER_ASSET_BENEFICIARY: 'BuildPartnerAssestBeneficiaryTemplate.xlsx',
  INVESTOR: 'InvesterUpload.xlsx',
  UNIT_PLAN: 'OffUnitPlanTemplate.xlsx',
  SPLIT: 'SplitUploadTemplate.xlsx',
  STAFF: 'STAFF_FILE_TEMPLATE.xlsx',
  GUARANTEE: 'SuretyBondTemplate copy.xlsx',
} as const 