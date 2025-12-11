import { getPartyLabel } from '@/constants/mappings/master/partyMapping'
import { PartyDetailsData } from './partyTypes'


export const STEP_LABELS = [
  getPartyLabel('CDL_PARTY_DETAILS'),
  'Documents (Optional)',
  getPartyLabel('CDL_AUTHORIZED_SIGNATORY_DETAILS'),

  'Review',
] as const


export const DEFAULT_FORM_VALUES: PartyDetailsData & { id: string } = {
  id: '',
  partyCifNumber: '',
  partyFullName: '',
  addressLine1: '',
  addressLine2: '',
  addressLine3: '',
  telephoneNumber: '',
  mobileNumber: '',
  emailAddress: '',
  bankIdentifier: '',
  passportIdentificationDetails: '',
  backupProjectAccountOwnerName: '',
  projectAccountOwnerName: '',
  assistantRelationshipManagerName: '',
  teamLeaderName: '',
  additionalRemarks: '',
  relationshipManagerName: '',
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
