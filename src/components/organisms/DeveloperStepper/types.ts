import { Dayjs } from 'dayjs'

// Component props
export interface StepperProps {
  developerId?: string
  initialStep?: number
}

// Notification state
export interface NotificationState {
  error: string | null
  success: string | null
}

// Validation result
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  source: 'client' | 'server' | 'skipped'
}

// Step navigation options
export interface NavigationOptions {
  currentStep: number
  developerId: string
  savedDeveloperId?: string
}

// Data processing options
export interface ProcessingOptions {
  activeStep: number
  stepStatus: any
}

// Form state
export interface FormState {
  shouldResetForm: boolean
  isAddingContact: boolean
}

// Step content props
export interface StepContentProps {
  activeStep?: number
  developerId?: string
  methods: any
  onEditStep?: (stepNumber: number) => void
}

// API response types
export interface StepSaveResponse {
  data?: {
    id: string | number
  }
  id?: string | number
}

// Error types
export interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

// Step data transformers
export type StepTransformer = (formData: any) => any

// Step data processors
export type StepProcessor = (data: any) => any[]

// Utility function types
export type DateConverter = (data: any) => Dayjs | null
export type BooleanConverter = (data: any) => boolean
export type SafeParser = (value: string | number | undefined, fallback?: number) => number
