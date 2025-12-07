import { agreementService } from './agreementService'
import { AgreementLabelsService } from './agreementLabelsService'                                   
import { AgreementService } from './agreementService'   

export const EntitieServices = {
    agreement: agreementService,
    agreementLabels: AgreementLabelsService,
    agreementService: AgreementService,
}