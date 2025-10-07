import { Dayjs } from 'dayjs'

export interface ProjectDetailsData {
  sectionId: string
  developerId: string
  developerName: string
  masterDeveloperName: string
  projectName: string
  projectLocation: string
  projectAccountCif: string
  projectStatus: string
  projectAccountStatusDate: Dayjs | null
  projectRegistrationDate: Dayjs | null
  projectStartDate: Dayjs | null
  projectCompletionDate: Dayjs | null
  retention: string
  additionalRetention: string
  totalRetention: string
  retentionEffectiveStartDate: Dayjs | null
  projectManagementExpenses: string
  marketingExpenses: string
  realEstateBrokerExpense: string
  advertisingExpense: string
  landOwnerName: string
  projectCompletionPercentage: string
  currency: string
  actualConstructionCost: string
  noOfUnits: string
  remarks: string
  specialApproval: string
  paymentType: string
  managedBy: string
  backupRef: string
  relationshipManager: string
  assistantRelationshipManager: string
  teamLeaderName: string
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
}

// Import DocumentItem type
import { DocumentItem } from '../DeveloperStepper/developerTypes'
