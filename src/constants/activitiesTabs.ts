import { Tab } from '@/types/activities'

/**
 * Shared tab configuration for activities pages (pending and involved)
 * This ensures tabs remain synchronized across all activities pages
 * Tabs are organized by category: Entities first, then Master data
 */
export const ACTIVITIES_TABS: Tab[] = [
  // Entity tabs
  // { id: 'buildPartner', label: 'Build Partner' },
  // { id: 'buildPartnerAsset', label: 'Build Partner Asset' },
  // { id: 'capitalPartner', label: 'Capital Partner' },
  // { id: 'payments', label: 'Payments' },
  // { id: 'suretyBond', label: 'Surety Bond' },
  // Master data tabs (from master pages)
  { id: 'accountPurpose', label: 'Account Purpose' },
  { id: 'agreementSegment', label: 'Agreement Segment' },
  { id: 'agreementType', label: 'Agreement Type' },
  { id: 'agreementSubType', label: 'Agreement Sub Type' },
  { id: 'businessSegment', label: 'Business Segment' },
  { id: 'businessSubSegment', label: 'Business Sub Segment' },
  { id: 'currency', label: 'Currency' },
  { id: 'country', label: 'Country' },
  { id: 'investment', label: 'Investment' },
  { id: 'productProgram', label: 'Product Program' },
  { id: 'generalLedgerAccount', label: 'General Ledger Account' },
  // Stepper-based tabs (from stepper components)
  { id: 'account', label: 'Account' },
  { id: 'party', label: 'Party' },
  { id: 'agreement', label: 'Agreement' },
  { id: 'agreementSignatory', label: 'Agreement Signatory' },
  { id: 'agreementParameter', label: 'Agreement Parameter' },
  { id: 'agreementFeeSchedule', label: 'Agreement Fee Schedule' },
  { id: 'paymentBeneficiary', label: 'Payment Beneficiary' },
  { id: 'standingInstruction', label: 'Standing Instruction' },
]

/**
 * Mapping from tab ID to module name for API filtering
 * Used to convert tab selection to workflow request filters
 */
export const TAB_TO_MODULE_MAP: Record<string, string> = {
  // Entity mappings
  // buildPartner: 'BUILD_PARTNER',
  // buildPartnerAsset: 'BUILD_PARTNER_ASSET',
  // capitalPartner: 'CAPITAL_PARTNER',
  // payments: 'PAYMENTS',
  // suretyBond: 'SURETY_BOND',
  // Master data mappings (from master pages)
  accountPurpose: 'ACCOUNT_PURPOSE',
  agreementSegment: 'AGREEMENT_SEGMENT',
  agreementType: 'AGREEMENT_TYPE',
  agreementSubType: 'AGREEMENT_SUB_TYPE',
  businessSegment: 'BUSINESS_SEGMENT',
  businessSubSegment: 'BUSINESS_SUB_SEGMENT',
  currency: 'CURRENCY',
  country: 'COUNTRY',
  investment: 'INVESTMENT',
  productProgram: 'PRODUCT_PROGRAM',
  generalLedgerAccount: 'GENERAL_LEDGER_ACCOUNT',
  // Stepper-based mappings (from stepper components)
  account: 'ACCOUNT',
  party: 'PARTY',
  agreement: 'AGREEMENT',
  agreementSignatory: 'AGREEMENT_SIGNATORY',
  agreementParameter: 'AGREEMENT_PARAMETER',
  agreementFeeSchedule: 'AGREEMENT_FEE_SCHEDULE',
  paymentBeneficiary: 'PAYMENT_BENEFICIARY',
  standingInstruction: 'STANDING_INSTRUCTION',
}

