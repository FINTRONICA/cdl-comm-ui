import React from 'react'
import { useFormContext } from 'react-hook-form'
import DocumentUpload from './DocumentUpload'
import { createBuildPartnerDocumentConfig } from './configs/buildPartnerConfig'
import { createProjectDocumentConfig } from './configs/projectConfig'
import { createInvestorDocumentConfig } from './configs/investorConfig'
import { createPaymentDocumentConfig } from './configs/paymentConfig'
import { createSuretyBondDocumentConfig } from './configs/suretyBondConfig'
import { DocumentItem } from '../DeveloperStepper/developerTypes'
import { createPartyDocumentConfig } from './configs/masterConfigs/partyConfig'
import {  createBeneficiaryDocumentConfig } from './configs/masterConfigs/beneficiaryConfig' 
import { createEscrowAccountDocumentConfig } from './configs/masterConfigs/escrowAccountConfig'
import { createAgreementDocumentConfig } from './configs/masterConfigs/agreementConfig'
import { createAgreementSignatoryDocumentConfig } from './configs/masterConfigs/agreementSignatoryConfig'
import { createAccountDocumentConfig } from './configs/masterConfigs/accountConfig'
import { createAgreementParameterDocumentConfig } from './configs/masterConfigs/agreementParameterConfig'
import { createAgreementFeeScheduleDocumentConfig } from './configs/masterConfigs/agreementFeeScheduleConfig'
import { createPaymentInstructionDocumentConfig } from './configs/masterConfigs/paymentInstructionConfig'
import { createPaymentBeneficiaryDocumentConfig } from './configs/masterConfigs/paymentBeneficiaryConfig'

export type DocumentUploadType =
  | 'BUILD_PARTNER'
  | 'BUILD_PARTNER_ASSET'
  | 'CAPITAL_PARTNER'
  | 'INVESTOR'
  | 'PROJECT'
  | 'NAV_MENU'
  | 'PAYMENTS'
  | 'TRANSACTIONS'
  | 'FEE_REPUSH'
  | 'DISCARDED_TRANSACTION'
  | 'PROCESSED_TRANSACTION'
  | 'PENDING_TRANSACTION'
  | 'STAKEHOLDER'
  | 'ROLES'
  | 'PERMISSIONS'
  | 'SURETY_BOND'
  | 'PARTY'
  | 'BENEFICIARY'
  | 'ESCROW_ACCOUNT'
  | 'AGREEMENT'
  | 'AGREEMENT_SIGNATORY'
  | 'ACCOUNT'
  | 'AGREEMENT_PARAMETER'
  | 'AGREEMENT_FEE_SCHEDULE'
  |'PAYMENT_INSTRUCTION'
  |'PAYMENT_BENEFICIARY'

interface DocumentUploadFactoryProps {
  type: DocumentUploadType
  entityId: string
  isOptional?: boolean
  isReadOnly?: boolean
  onDocumentsChange?: (documents: DocumentItem[]) => void
  formFieldName?: string
}

const DocumentUploadFactory: React.FC<DocumentUploadFactoryProps> = ({
  type,
  entityId,
  isOptional = true,
  isReadOnly = false,
  onDocumentsChange,
  formFieldName = 'documents',
}) => {
  const { setValue, watch } = useFormContext()

  const handleDelete = (document: DocumentItem) => {
    const currentDocuments = watch(formFieldName) || []
    const updatedDocuments = currentDocuments.filter(
      (doc: DocumentItem) => doc.id !== document.id
    )
    setValue(formFieldName, updatedDocuments)
    if (onDocumentsChange) {
      onDocumentsChange(updatedDocuments)
    }
  }

  const createConfig = () => {
    const baseOptions = {
      isOptional,
      isReadOnly,
      onDelete: handleDelete,
      ...(onDocumentsChange && { onDocumentsChange }),
    }

    switch (type) {
      case 'BUILD_PARTNER':
        return createBuildPartnerDocumentConfig(entityId, baseOptions)

      case 'BUILD_PARTNER_ASSET':
        return createProjectDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Build Partner Asset Documents',
          description: 'Upload build partner asset-related documents.',
        })

      case 'CAPITAL_PARTNER':
        return createInvestorDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Capital Partner Documents',
          description: 'Upload capital partner-related documents.',
        })

      case 'INVESTOR':
        return createInvestorDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Investor Documents',
          description:
            'This step is optional. You can upload investor-related documents or skip to continue.',
        })

      case 'NAV_MENU':
        return createBuildPartnerDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Navigation Menu Documents',
          description: 'Upload navigation menu-related documents.',
        })

      case 'PAYMENTS':
        return createPaymentDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Payment Documents',
          description:
            'This step is optional. You can upload payment-related documents or skip to continue.',
        })

      case 'SURETY_BOND':
        return createSuretyBondDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Surety Bond Documents',
          description: 'Upload surety bond-related documents.',
        })

      case 'TRANSACTIONS':
        return createBuildPartnerDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Transaction Documents',
          description: 'Upload transaction-related documents.',
        })

      case 'FEE_REPUSH':
        return createBuildPartnerDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Fee Repush Documents',
          description: 'Upload fee repush-related documents.',
        })

      case 'DISCARDED_TRANSACTION':
        return createBuildPartnerDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Discarded Transaction Documents',
          description: 'Upload discarded transaction-related documents.',
        })

      case 'PROCESSED_TRANSACTION':
        return createBuildPartnerDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Processed Transaction Documents',
          description: 'Upload processed transaction-related documents.',
        })

      case 'PENDING_TRANSACTION':
        return createBuildPartnerDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Pending Transaction Documents',
          description: 'Upload pending transaction-related documents.',
        })

      case 'STAKEHOLDER':
        return createBuildPartnerDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Stakeholder Documents',
          description: 'Upload stakeholder-related documents.',
        })

      case 'ROLES':
        return createBuildPartnerDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Role Documents',
          description: 'Upload role-related documents.',
        })

      case 'PERMISSIONS':
        return createBuildPartnerDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Permission Documents',
          description: 'Upload permission-related documents.',
        })

      case 'PROJECT':
        return createProjectDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Build Partner Assest Documents',
          description:
            'This step is optional. You can upload project-related documents or skip to continue.',
        })
      case 'PARTY':
        return createPartyDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Party Documents',
          description: 'Upload party-related documents.',
        })
      case 'BENEFICIARY':
        return createBeneficiaryDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Beneficiary Documents',
          description: 'Upload beneficiary-related documents.',
        })
      case 'ESCROW_ACCOUNT':
        return createEscrowAccountDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Escrow Account Documents',
          description: 'Upload escrow account-related documents.',
        })
      case 'AGREEMENT':
        return createAgreementDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Agreement Documents',
          description: 'Upload agreement-related documents.',
        })
      case 'AGREEMENT_SIGNATORY':
        return createAgreementSignatoryDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Agreement Signatory Documents',
          description: 'Upload agreement signatory-related documents.',
        })
      case 'ACCOUNT':
        return createAccountDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Account Documents',
          description: 'Upload account-related documents.',
        })
      case 'AGREEMENT_PARAMETER':
        return createAgreementParameterDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Agreement Parameter Documents',
          description: 'Upload agreement parameter-related documents.',
        })
      case 'AGREEMENT_FEE_SCHEDULE':
        return createAgreementFeeScheduleDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Agreement Fee Schedule Documents',
          description: 'Upload agreement fee schedule-related documents.',
        })
      case 'PAYMENT_INSTRUCTION':
        return createPaymentInstructionDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Payment Instruction Documents',
          description: 'Upload payment instruction-related documents.',
        })
      case 'PAYMENT_BENEFICIARY':
        return createPaymentBeneficiaryDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Payment Beneficiary Documents',
          description: 'Upload payment beneficiary-related documents.',
        })
      default:
        throw new Error(`Unsupported document upload type: ${type}`)
    }
  }

  const config = createConfig()

  return <DocumentUpload config={config} formFieldName={formFieldName} />
}

export default DocumentUploadFactory
