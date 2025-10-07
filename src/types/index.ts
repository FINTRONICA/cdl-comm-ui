// Global type definitions for the Escrow Central application

// Export bank types
export * from './bank'
export * from './labelConfig'

// Export label configuration types
export * from './labelConfig'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'investor'
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  amount: number
  currency: string
  investorId: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  projectId: string
  type: 'deposit' | 'withdrawal' | 'fee' | 'transfer'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  description: string
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionRequest {
  projectId: string
  type: 'deposit' | 'withdrawal' | 'fee' | 'transfer'
  amount: number
  currency: string
  description: string
  recipientAccountId?: string
  senderAccountId?: string
  metadata?: Record<string, unknown>
}

export interface Activity {
  id: string
  type: 'transaction' | 'project' | 'user' | 'system'
  action: string
  description: string
  userId?: string
  projectId?: string
  transactionId?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface FeeType {
  id: string
  name: string
  type: 'percentage' | 'fixed'
  value: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Report {
  id: string
  type: 'transaction' | 'project' | 'user' | 'financial'
  title: string
  description: string
  data: Record<string, unknown>
  generatedAt: string
  period: {
    start: string
    end: string
  }
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

// Form types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date'
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search'
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  error?: string
  required?: boolean
  icon?: React.ReactNode
}

export interface SelectProps extends BaseComponentProps {
  options: Array<{ value: string; label: string }>
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  required?: boolean
}

// Table types
export interface TableColumn<T> {
  key: keyof T
  header: string
  sortable?: boolean
  width?: string
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
  }
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void
  sortBy?: keyof T
  sortDirection?: 'asc' | 'desc'
}

// Chart types
export interface ChartData {
  label: string
  value: number
  color?: string
}

export interface ChartProps {
  data: ChartData[]
  type: 'line' | 'bar' | 'pie' | 'doughnut'
  title?: string
  height?: number
  width?: number
}

// Navigation types
export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: React.ReactNode
  children?: NavigationItem[]
  badge?: string | number
}

// Filter types
export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'date-range' | 'search' | 'checkbox'
  options?: FilterOption[]
  placeholder?: string
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
