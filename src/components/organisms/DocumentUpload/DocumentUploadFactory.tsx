import React from 'react'
import { useFormContext } from 'react-hook-form'
import DocumentUpload from './DocumentUpload'
import { createBuildPartnerDocumentConfig } from './configs/buildPartnerConfig'
import { createProjectDocumentConfig } from './configs/projectConfig'
import { createInvestorDocumentConfig } from './configs/investorConfig'
import { createPaymentDocumentConfig } from './configs/paymentConfig'
import { DocumentItem } from '../DeveloperStepper/developerTypes'

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

interface DocumentUploadFactoryProps {
  type: DocumentUploadType
  entityId: string
  isOptional?: boolean
  onDocumentsChange?: (documents: DocumentItem[]) => void
  formFieldName?: string
}

const DocumentUploadFactory: React.FC<DocumentUploadFactoryProps> = ({
  type,
  entityId,
  isOptional = true,
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
      onDelete: handleDelete,
      ...(onDocumentsChange && { onDocumentsChange }),
    }

    switch (type) {
      case 'BUILD_PARTNER':
        return createBuildPartnerDocumentConfig(entityId, baseOptions)

      case 'BUILD_PARTNER_ASSET':
        return createBuildPartnerDocumentConfig(entityId, {
          ...baseOptions,
          title: 'Build Partner Asset Documents',
          description: 'Upload build partner asset-related documents.',
        })

      case 'CAPITAL_PARTNER':
        return createBuildPartnerDocumentConfig(entityId, {
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

      default:
        throw new Error(`Unsupported document upload type: ${type}`)
    }
  }

  const config = createConfig()

  return <DocumentUpload config={config} formFieldName={formFieldName} />
}

export default DocumentUploadFactory
