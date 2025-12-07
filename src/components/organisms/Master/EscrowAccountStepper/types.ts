import { MasterEscrowAccountData } from '@/services/api/masterApi/Customer/escrowAccountService'

export interface StepperProps {
  escrowAccountId?: string
  initialStep?: number
  isViewMode?: boolean
  isEditingMode?: boolean
}

export interface FormState {
  shouldResetForm: boolean
}

export type EscrowAccountFormData = MasterEscrowAccountData & {
  documents?: unknown[]
}

export interface StepContentProps {
  escrowAccountId?: string
  activeStep?: number
  methods: any
  onEditStep?: (stepNumber: number) => void
}
