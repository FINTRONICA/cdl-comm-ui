import { getPartyLabel } from '@/constants/mappings/master/partyMapping'
import { PartyDetailsData } from './partyTypes'


export const STEP_LABELS = [
  getPartyLabel('CDL_PARTY_DETAILS'),
  'Documents (Optional)',
  getPartyLabel('CDL_AUTHORIZED_SIGNATORY_DETAILS'),

  'Review',
] as const


export const DEFAULT_FORM_VALUES: PartyDetailsData = {
  partyCifNumber: null,
  partyFullName: null,
  addressLine1: null,
  addressLine2: null,
  addressLine3: null,
  telephoneNumber: '',
  mobileNumber: null,
  emailAddress: null,
  bankIdentifier: '',
  passportIdentificationDetails: null,
  backupProjectAccountOwnerName: null,
  projectAccountOwnerName: null,
  assistantRelationshipManagerName: null,
  teamLeaderName: null,
  additionalRemarks: null,
  relationshipManagerName: null,
  active: true,
  partyConstituentDTO: null,
  roleDTO: null,
  taskStatusDTO: null,
}


export const DATE_FIELDS = [
  'partyOnboardingDate',
  'partyLicenseExpDate', 
  'partyStartDate',
  'partyEndDate'
] as const


export const BOOLEAN_FIELDS = [
  'partyWorldCheckFlag', 
  'partyMigratedData'
] as const


export const SKIP_VALIDATION_STEPS = [1, 2, 3, 4] as const

// Steps that reset form when developerId changes
export const RESET_FORM_STEPS = [1, 2, 3] as const
