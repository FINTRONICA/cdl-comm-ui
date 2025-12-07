import { MasterEscrowAccountData } from '@/services/api/masterApi/Customer/escrowAccountService'

export const DEFAULT_FORM_VALUES: Partial<MasterEscrowAccountData> = {
  escrowAccountFullName: '',
  escrowAccountAddressLine1: '',
  telephoneNumber: '',
  mobileNumber: '',
  escrowAccountNumber: '',
  bankIfscCode: '',
  escrowBankName: '',
  bankRoutingCode: '',
  additionalRemarks: '',
  active: true,
  enabled: true,
  deleted: false,
  accountTypeDTO: null,
  transferTypeDTO: null,
  roleDTO: null,
  taskStatusDTO: null,
}

export const RESET_FORM_STEPS = [1, 2, 3] as const

export const SKIP_VALIDATION_STEPS = [2] as const // Document step is optional
