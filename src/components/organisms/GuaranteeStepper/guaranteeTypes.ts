import { Dayjs } from 'dayjs'
import { DocumentItem } from '../DeveloperStepper/developerTypes'

export interface GuaranteeDetailsData {
  guaranteeRefNo: string
  guaranteeType: string
  guaranteeDate: Dayjs | null
  projectCif: string
  projectName: string
  developerName: string
  openEndedGuarantee: boolean
  projectCompletionDate: Dayjs | null
  noOfAmendments: string
  guaranteeExpirationDate: Dayjs | null
  guaranteeAmount: string
  suretyBondNewReadingAmendment: string
  issuerBank: string
  status: string
}

export interface GuaranteeData extends GuaranteeDetailsData {
  // Step 2: Documents
  documents?: DocumentItem[]
}
