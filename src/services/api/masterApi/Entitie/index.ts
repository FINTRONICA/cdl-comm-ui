// Account Services
import { accountService } from './accountService'
import AccountLabelsService from './accountLabelsService'

// Agreement Services
import { agreementService } from './agreementService'
import AgreementLabelsService from './agreementLabelsService'

// Agreement Fee Schedule Services
import { agreementFeeScheduleService } from './agreementFeeScheduleService'
import AgreementFeeScheduleLabelsService from './agreementFeeScheduleLabelsService'

// Agreement Parameter Services
import { agreementParameterService } from './agreementParameterService'
import AgreementParameterLabelsService from './agreementParameterLabelsService'

// Agreement Signatory Services
import { agreementSignatoryService } from './agreementSignatoryService'
import { AgreementSignatoryLabelsService } from './agreementSignatoryLabelsService'

export const EntitieServices = {
  // Account
  account: accountService,
  accountLabels: AccountLabelsService,
  
  // Agreement
  agreement: agreementService,
  agreementLabels: AgreementLabelsService,
  
  // Agreement Fee Schedule
  agreementFeeSchedule: agreementFeeScheduleService,
  agreementFeeScheduleLabels: AgreementFeeScheduleLabelsService,
  
  // Agreement Parameter
  agreementParameter: agreementParameterService,
  agreementParameterLabels: AgreementParameterLabelsService,
  
  // Agreement Signatory
  agreementSignatory: agreementSignatoryService,
  agreementSignatoryLabels: AgreementSignatoryLabelsService,
}