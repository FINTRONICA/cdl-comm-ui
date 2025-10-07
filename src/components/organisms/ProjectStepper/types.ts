import { Dayjs } from 'dayjs'

export interface ProjectDetailsData {
  // API fields matching the JSON payload exactly
  reaId: string
  reaCif: string
  reaName: string
  reaLocation: string
  reaReraNumber: string
  reaAccoutStatusDate: Dayjs | null
  reaRegistrationDate: Dayjs | null
  reaStartDate: Dayjs | null
  reaCompletionDate: Dayjs | null
  reaRetentionPercent: string
  reaPercentComplete: string
  reaConstructionCost: number
  reaAccStatusDate: Dayjs | null
  reaNoOfUnits: number
  reaRemarks: string
  reaSpecialApproval: string
  reaManagedBy: string
  reaBackupUser: string
  reaAdditionalRetentionPercent: string
  reaTotalRetentionPercent: string
  reaRetentionEffectiveDate: Dayjs | null
  reaManagementExpenses: string
  reaMarketingExpenses: string
  reaTeamLeadName: string
  reaRelationshipManagerName: string
  reaAssestRelshipManagerName: string
  reaRealEstateBrokerExp: number
  reaAdvertisementExp: number
  reaLandOwnerName: string
  
  // DTO objects matching API structure exactly
  buildPartnerDTO: {
    id: number
  }
  reaStatusDTO: {
    id: number
  }
  reaTypeDTO: {
    id: number
  }
  reaAccountStatusDTO: {
    id: number
  }
  reaConstructionCostCurrencyDTO: {
    id: number
  }
  
  // Additional fields
  status: string | null
  reaBlockPaymentTypeDTO: unknown | null
}

export interface AccountData {
  trustAccountNumber: string
  ibanNumber: string
  dateOpened: Dayjs | null
  accountTitle: string
  currency: string
}

export interface FeeData {
  feeType: string
  frequency: string
  debitAmount: string
  feeToBeCollected: string
  nextRecoveryDate: Dayjs | null
  feePercentage: string
  amount: string
  vatPercentage: string
}

export interface BeneficiaryData {
  id: string
  expenseType: string
  transferType: string
  name: string
  bankName: string
  swiftCode: string
  routingCode: string
  account: string
}

export interface PaymentPlanData {
  installmentNumber: number
  installmentPercentage: string
  projectCompletionPercentage: string
}

export interface FinancialData {
  projectEstimatedCost: string
  actualCost: string
  projectBudget: string
}

export interface ProjectData extends ProjectDetailsData {
  // Step 2: Documents (NEW)
  documents?: DocumentItem[]

  // Step 3: Account Details
  accounts: AccountData[]

  // Step 4: Fee Details
  fees: FeeData[]

  // Step 5: Beneficiary Details
  beneficiaries: BeneficiaryData[]

  // Step 6: Payment Plan
  paymentPlan: PaymentPlanData[]

  // Step 7: Financial (extensive financial data)
  financialData: FinancialData

  // Step 8: Project Closure
  closureData: {
    totalIncomeFund: string
    totalPayment: string
  }
}

// Import DocumentItem type
import { DocumentItem } from '../DeveloperStepper/developerTypes'
