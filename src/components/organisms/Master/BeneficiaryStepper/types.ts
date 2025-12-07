import { MasterBeneficiaryData } from '@/services/api/masterApi/Customer/beneficiaryService'

export interface StepperProps {
  beneficiaryId?: string
  initialStep?: number
  isViewMode?: boolean
  isEditingMode?: boolean
}

export interface FormState {
  shouldResetForm: boolean
}

export type BeneficiaryFormData = MasterBeneficiaryData & {
  termsAccepted?: boolean
  documents?: unknown[]
}

export interface StepContentProps {
  beneficiaryId?: string
  activeStep?: number
  methods: any
  onEditStep?: (stepNumber: number) => void
}


