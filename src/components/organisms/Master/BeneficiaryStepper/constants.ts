import { MasterBeneficiaryData } from '@/services/api/masterApi/Customer/beneficiaryService'

export const DEFAULT_FORM_VALUES: Partial<MasterBeneficiaryData> = {
  beneficiaryFullName: '',
  beneficiaryAddressLine1: '',
  telephoneNumber: '',
  mobileNumber: '',
  beneficiaryAccountNumber: '',
  bankIfscCode: '',
  beneficiaryBankName: '',
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
