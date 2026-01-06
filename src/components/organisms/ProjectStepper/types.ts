// import { Dayjs } from 'dayjs'

// export interface ProjectDetailsData {
//   // API fields matching the JSON payload exactly
//   reaId: string
//   reaCif: string
//   reaName: string
//   reaLocation: string
//   reaReraNumber: string
//   reaAccoutStatusDate: Dayjs | null
//   reaRegistrationDate: Dayjs | null
//   reaStartDate: Dayjs | null
//   reaCompletionDate: Dayjs | null
//   reaRetentionPercent: string
//   reaPercentComplete: string
//   reaConstructionCost: number
//   reaAccStatusDate: Dayjs | null
//   reaNoOfUnits: number
//   reaRemarks: string
//   reaSpecialApproval: string
//   reaManagedBy: string
//   reaBackupUser: string
//   reaAdditionalRetentionPercent: string
//   reaTotalRetentionPercent: string
//   reaRetentionEffectiveDate: Dayjs | null
//   reaManagementExpenses: string
//   reaMarketingExpenses: string
//   reaTeamLeadName: string
//   reamprelationshipManagerName: string
//   reaAssestRelshipManagerName: string
//   reaRealEstateBrokerExp: number
//   reaAdvertisementExp: number
//   reaLandOwnerName: string

//   // New fields from table specifications
//   unitReferenceNumber?: string
//   unitNumber?: string
//   unitStatus?: string
//   towerBuildingName?: string
//   unitPlotSize?: string
//   propertyId?: string
//   unitIban?: string
//   unitRegistrationFee?: string
//   nameOfAgent?: string
//   agentNationalId?: string
//   grossSalePrice?: string
//   salePrice?: string
//   vatApplicable?: boolean
//   deedNumber?: string
//   agreementNumber?: string
//   agreementDate?: Dayjs | null
//   salePurchaseAgreement?: boolean
//   projectPaymentPlan?: boolean
//   paymentPlanSelection?: string
//   worldCheck?: string
//   amountPaidToDeveloperWithinEscrow?: string
//   amountPaidToDeveloperOutOfEscrow?: string
//   totalAmountPaid?: string
//   reservationBookingForm?: boolean
//   unitAreaSize?: string
//   forfeitAmount?: string
//   refundAmount?: string
//   transferredAmount?: string
//   mpadditionalRemarks?: string

//   // DTO objects matching API structure exactly
//   buildPartnerDTO: {
//     id: number
//     bpCifrera?: string
//     bpName?: string
//     bpMasterName?: string
//   }
//   reaStatusDTO: {
//     id: number
//   }
//   reaTypeDTO: {
//     id: number
//   }
//   reaAccountStatusDTO: {
//     id: number
//   }
//   reaConstructionCostCurrencyDTO: {
//     id: number
//   }
//   reaBlockPaymentTypeDTO: {
//     id: number
//   }

//   // Additional fields
//   status: string | null
// }

// export interface AccountData {
//   id?: number | null
//   trustAccountNumber: string
//   ibanNumber: string
//   dateOpened: Dayjs | null
//   accountTitle: string
//   currency: string
// }

// export interface FeeData {
//   feeType: string
//   frequency: string
//   debitAmount: string
//   feeToBeCollected: string
//   nextRecoveryDate: Dayjs | null
//   feePercentage: string
//   amount: string
//   vatPercentage: string
//   currency: string
//   debitAccount: string
// }

// export interface BeneficiaryData {
//   id: string
//   expenseType: string
//   transferType: string
//   name: string
//   bankName: string
//   swiftCode: string
//   routingCode: string
//   account: string
// }

// export interface PaymentPlanData {
//   id?: number // Add ID for existing payment plans
//   installmentNumber: number
//   installmentPercentage: string
//   projectCompletionPercentage: string
// }

// export interface FinancialData {
//   projectEstimatedCost: string
//   actualCost: string
//   projectBudget: string
// }

// export interface ProjectData extends ProjectDetailsData {
//   // Step 2: Documents (NEW)
//   documents?: DocumentItem[]

//   // Step 3: Account Details
//   accounts: AccountData[]

//   // Step 4: Fee Details
//   fees: FeeData[]

//   // Step 5: Beneficiary Details
//   beneficiaries: BeneficiaryData[]

//   // Step 6: Payment Plan
//   paymentPlan: PaymentPlanData[]

//   // Step 7: Financial (extensive financial data)
//   financialData: FinancialData

//   // Step 8: Project Closure
//   closureData: {
//     totalIncomeFund: string
//     totalPayment: string
//   }
// }

// // Import DocumentItem type
// import { DocumentItem } from '../DeveloperStepper/developerTypes'
