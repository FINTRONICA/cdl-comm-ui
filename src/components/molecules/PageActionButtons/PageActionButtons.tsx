import React, { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PermissionButton } from '@/components/atoms/PermissionButton'
import { Tooltip } from '@mui/material'
import { Loader } from 'lucide-react'
import { UploadDialog } from '@/components/molecules/UploadDialog'

export type EntityType =
  | 'project'
  | 'investor'
  | 'developer'
  | 'manualPayment'
  | 'feeRepush'
  | 'userManagement'
  | 'roleManagement'
  | 'workflowAction'
  | 'workflowAmountRule'
  | 'workflowStageTemplate'
  | 'workflowDefinition'
  | 'workflowAmountStageOverride'
  | 'groupManagement'
  | 'suretyBond'
  | 'developerBeneficiary'
  | 'pendingPayment'
  | 'party'
  | 'accountPurpose'
  | 'investmentType'
  | 'businessSegment'
  | 'businessSubSegment'
  | 'agreementType'
  | 'agreementSubType'
  | 'productProgram'
  | 'beneficiary'
  | 'agreementSegment'
  | 'generalLedgerAccount'
  | 'country'
  | 'currency'
  | 'agreement'
  | 'agreementParameter'
  | 'agreementFeeSchedule'
  | 'agreementAccount' 
  | 'escrowAgreementSignatory'
  | 'paymentBeneficiary'
  | 'paymentInstruction'





interface ActionButton {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  icon?: string
  iconAlt?: string
}

interface PageActionButtonsProps {
  entityType: EntityType
  onDownloadTemplate?: () => void
  onUploadDetails?: () => void
  onAddNew?: () => void
  className?: string
  showButtons?: {
    downloadTemplate?: boolean
    uploadDetails?: boolean
    addNew?: boolean
  }
  customActionButtons?: ActionButton[]
  isDownloading?: boolean

  downloadPermission?: string[]
  uploadPermission?: string[]

  additionalDownloads?: Array<{
    label: string
    onClick: () => void
    isLoading?: boolean
    icon?: string
  }>

  uploadConfig?: {
    title?: string
    titleConfigId?: string
    acceptedFileTypes?: string
    maxFileSize?: number
    uploadEndpoint?: string
    entityId?: string
  }
}

const PageActionButtonsComponent: React.FC<PageActionButtonsProps> = ({
  entityType,
  onDownloadTemplate,
  onUploadDetails,
  onAddNew,
  className = '',
  showButtons = {
    downloadTemplate: true,
    uploadDetails: true,
    addNew: true,
  },
  customActionButtons = [],
  isDownloading = false,
  additionalDownloads = [],
  uploadConfig,
  downloadPermission = ['*'], // Default to wildcard for backward compatibility
  uploadPermission = ['*'], // Default to wildcard for backward compatibility
}) => {
  const router = useRouter()
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // Entity-specific configurations with permissions
  const entityConfig = {
    project: {
      label: 'Add New Build Partner Assest',
      route: '/build-partner-assets/new',
      permissions: ['bpa_create'], // Only users with bpa_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    investor: {
      label: 'Add New Capital Partner',
      route: '/capital-partner/new',
      permissions: ['cp_create'], // Only users with cp_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    developer: {
      label: 'Add New Build Partner',
      route: '/build-partner/new',
      permissions: ['bp_create'], // Only users with bp_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    manualPayment: {
      label: 'Add New Payment',
      route: '/transactions/manual/new',
      permissions: ['manual_payment_create'], // Only users with manual_payment_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    feeRepush: {
      label: 'Add New',
      route: '/fee-reconciliation/new',
      permissions: ['fee_repush_create'], // Only users with fee_repush_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    userManagement: {
      label: 'Add New User',
      route: '/admin/stakeholder/new',
      permissions: ['user_create'], // Only users with user_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    roleManagement: {
      label: 'Add New Entitlement',
      route: '/admin/entitlement/new',
      permissions: ['role_create'], // Only users with role_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    groupManagement: {
      label: 'Add New Group',
      route: '/admin/access-grant/new',
      permissions: ['group_create'], // Only users with group_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    suretyBond: {
      label: 'Add New Surety Bond',
      route: '/surety_bond/new',
      permissions: ['surety_bond_create'],
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    workflowAction: {
      label: 'Add New Action',
      route: '/admin/workflow/action/new',
      permissions: ['workflow_action_create'], // Only users with workflow_action_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    workflowAmountRule: {
      label: 'Add New Amount Rule',
      route: '/admin/workflow/amount-rule/new',
      permissions: ['workflow_amount_rule_create'], // Only users with workflow_amount_rule_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    workflowStageTemplate: {
      label: 'Add New Stage Template',
      route: '/admin/workflow/stage-template/new',
      permissions: ['workflow_stage_template_create'], // Only users with workflow_stage_template_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    workflowDefinition: {
      label: 'Add New  Definition',
      route: '/admin/workflow/definition/new',
      permissions: ['workflow_definition_create'], // Only users with workflow_definition_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    workflowAmountStageOverride: {
      label: 'Add New Amount Stage Override',
      route: '/admin/workflow/amount-stage-override/new',
      // permissions: ['workflow_amount_stage_override_create'], // Only users with workflow_amount_stage_override_create permission
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    developerBeneficiary: {
      label: 'Add New Beneficiary',
      route: '/developer-beneficiary/new',
      permissions: ['developer_beneficiary_create'], // Only users with developer_beneficiary_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    pendingPayment: {
      label: 'Add New Pending Payment',
      route: '/pending-payment/new',
      permissions: ['pending_tran_create'], // Only users with pending_payment_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    party: {
      label: 'Add New Party',
      route: '/master/party/new',
      permissions: ['*'], // Only users with party_create permission
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    accountPurpose: {
      label: 'Add New Account Purpose',
      route: '/master/account-purpose/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    investmentType: {
      label: 'Add New Investment Type',
      route: '/master/investment/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    businessSegment: {
      label: 'Add New Business Segment',
      route: '/master/business-segment/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    businessSubSegment: {
      label: 'Add New Business Sub Segment',
      route: '/master/business-sub-segment/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    agreementType: {
      label: 'Add New Agreement Type',
      route: '/master/agreement-Type/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    agreementSubType: {
      label: 'Add New Agreement Sub Type',
      route: '/master/agreement-Sub-Type/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    productProgram: {
      label: 'Add New Product Program',
      route: '/master/product/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    beneficiary: {
      label: 'Add New Beneficiary',
      route: '/master/beneficiary/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    agreementSegment: {
      label: 'Add New Agreement Segment',
      route: '/master/agreement-segment/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },  
   
    generalLedgerAccount: {
      label: 'Add New General Ledger Account',
      route: '/master/general-ledger-account/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    country: {
      label: 'Add New Country',
      route: '/master/country/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    currency: {
      label: 'Add New Currency',
      route: '/master/currency/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    agreement: {  
      label: 'Add New Agreement',
      route: '/agreement/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    'agreementParameter': {
      label: 'Add New Agreement Parameter',
      route: '/agreement-parameter/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    'agreementFeeSchedule': {
      label: 'Add New Agreement Fee Schedule',
      route: '/agreement-fee-schedule/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    agreementAccount: {
      label: 'Add New Agreement Account',
      route: '/escrow-account/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    'agreement-signatory': {
      label: 'Add New Agreement Signatory',
      route: '/agreement-signatory/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    escrowAgreementSignatory: {
      label: 'Add New Escrow Agreement Signatory',
      route: '/agreement-signatory/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    'standing-instruction': {
      label: 'Add New Payment Instruction',
      route: '/payment/payment-instruction/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    'payment-beneficiary': {
      label: 'Add New Payment Beneficiary',
      route: '/payment-beneficiary/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    'paymentBeneficiary': {
      label: 'Add New Payment Beneficiary',
      route: '/payment-beneficiary/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    'payment-instruction': {
      label: 'Add New Payment Instruction',
      route: '/payment-instruction/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    },
    'paymentInstruction': {
      label: 'Add New Payment Instruction',
      route: '/payment-instruction/new',
      permissions: ['*'], // Temporarily set to allow all users
      downloadPermission: ['data_export'], // Unified download permission
      uploadPermission: ['bulk_upload'], // Unified upload permission
    }


    
  }

  const config = entityConfig[entityType]

  // Safety check: if config is undefined, log error and use defaults
  if (!config && process.env.NODE_ENV === 'development') {
    console.error(`[PageActionButtons] No config found for entityType: ${entityType}. Available types:`, Object.keys(entityConfig))
  }

  // Use centralized permissions from entityConfig, but allow override via props
  // Provide safe defaults if config is missing
  const safeConfig = config || {
    label: 'Add New',
    route: '/',
    permissions: ['*'],
    downloadPermission: ['*'],
    uploadPermission: ['*'],
  }

  const effectiveDownloadPermission =
    downloadPermission.length > 0 && !downloadPermission.includes('*')
      ? downloadPermission
      : (safeConfig.downloadPermission || ['*'])

  const effectiveUploadPermission =
    uploadPermission.length > 0 && !uploadPermission.includes('*')
      ? uploadPermission
      : (safeConfig.uploadPermission || ['*'])
  const handleAddNew = useCallback(() => {
    if (onAddNew) {
      onAddNew()
    } else {
      router.push(safeConfig.route)
    }
  }, [onAddNew, router, safeConfig.route])

  const handleDownloadTemplate = useCallback(() => {
    if (onDownloadTemplate) {
      onDownloadTemplate()
    } else {
    }
  }, [onDownloadTemplate, entityType])

  const handleUploadDetails = useCallback(() => {
    if (onUploadDetails) {
      onUploadDetails()
    } else {
      setIsUploadDialogOpen(true)
    }
  }, [onUploadDetails])

  const handleUploadSuccess = useCallback(() => {
    // Upload success handler - can be customized per entity if needed
  }, [])

  const handleUploadError = useCallback((error: string) => {
    // Handle upload error - can be customized per entity if needed
    if (process.env.NODE_ENV === 'development') {
      console.error('Upload error:', error)
    }
  }, [])

  // Get default upload endpoint based on entity type
  const getDefaultUploadEndpoint = (entityType: EntityType): string => {
    switch (entityType) {
      case 'investor':
        return '/capital-partner/upload'
      case 'developer':
        return '/build-partner-beneficiary/upload'
      case 'project':
        return '/real-estate-assest/upload'
      case 'suretyBond':
        return '/surety-bond/upload'
      case 'manualPayment':
        return '/real-estate-document/upload'
      case 'developerBeneficiary':
        return '/build-partner-beneficiary/upload'
      case 'pendingPayment':
        return '/pending-fund-ingress/upload'
      case 'party':
        return '/party/upload'
      default:
        return '/real-estate-document/upload'
    }
  }

  return (
    <div className={`flex justify-end gap-2 py-3.5 px-4 ${className}`}>
      {showButtons.downloadTemplate && (
        <PermissionButton
          requiredPermissions={effectiveDownloadPermission}
          onClick={handleDownloadTemplate}
          disabled={isDownloading}
          className={`flex items-center h-8 py-1.5 px-2.5 gap-1.5 font-sans font-medium text-sm rounded-md transition-colors ${
            isDownloading
              ? 'cursor-not-allowed text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800'
              : 'cursor-pointer text-[#155DFC] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
          }`}
        >
          <Tooltip
            title={isDownloading ? 'Downloading...' : 'Download Template'}
            arrow
            placement="bottom"
          >
            <span className="inline-flex items-center">
              {!isDownloading && (
                <img src="/download icon.svg" alt="download icon" />
              )}
              {isDownloading && (
                <span className="text-xs animate-spin">
                  <Loader />
                </span>
              )}
            </span>
          </Tooltip>
        </PermissionButton>
      )}

      {/* Additional download buttons */}
      {additionalDownloads.map((download, index) => (
        <PermissionButton
          key={index}
          requiredPermissions={effectiveDownloadPermission}
          onClick={download.onClick}
          disabled={download.isLoading || false}
          className={`flex items-center h-8 py-1.5 px-2.5 gap-1.5 font-sans font-medium text-sm rounded-md transition-colors ${
            download.isLoading
              ? 'cursor-not-allowed text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800'
              : 'cursor-pointer text-[#155DFC] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
          }`}
        >
          <Tooltip
            title={download.isLoading ? 'Downloading...' : download.label}
            arrow
            placement="bottom"
          >
            <>
              <img
                src={download.icon || '/download icon.svg'}
                alt="download icon"
              />
              {download.isLoading && (
                <span className="text-xs animate-spin">
                  <Loader />
                </span>
              )}
            </>
          </Tooltip>
        </PermissionButton>
      ))}
      {showButtons.uploadDetails && (
        <PermissionButton
          requiredPermissions={effectiveUploadPermission}
          onClick={handleUploadDetails}
          className="flex items-center cursor-pointer h-8 py-1.5 bg-[#DBEAFE] dark:bg-blue-900/30 rounded-md px-2.5 gap-1.5 text-[#155DFC] dark:text-blue-400 font-sans font-medium text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        >
          <Tooltip title="Upload Details" arrow placement="bottom">
            <img src="/upload.svg" alt="upload icon" />
          </Tooltip>
        </PermissionButton>
      )}
      {/* Render custom action buttons if provided, otherwise render default add new button */}
      {customActionButtons.length > 0
        ? customActionButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              disabled={button.disabled}
              className={`flex items-center cursor-pointer h-8 py-1.5 rounded-md px-2.5 gap-1.5 font-sans font-medium text-sm transition-colors ${
                button.variant === 'primary' || !button.variant
                  ? 'bg-[#155DFC] dark:bg-blue-600 text-[#FAFAF9] dark:text-white hover:bg-blue-700 dark:hover:bg-blue-700'
                  : 'bg-[#DBEAFE] dark:bg-blue-900/30 text-[#155DFC] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
              }`}
            >
              <img src="/circle-plus.svg" alt="plus icon" />
              {button.label}
            </button>
          ))
        : showButtons.addNew && (
            <PermissionButton
              requiredPermissions={safeConfig.permissions}
              onClick={handleAddNew}
              className="flex items-center cursor-pointer
 h-8 py-1.5 bg-[#155DFC] dark:bg-blue-600 rounded-md px-2.5 gap-1.5 text-[#FAFAF9] dark:text-white font-sans font-medium text-sm hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
            >
              <img src="/circle-plus.svg" alt="plus icon" />
              {safeConfig.label}
            </PermissionButton>
          )}

      {/* Upload Dialog */}
      <UploadDialog
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        titleConfigId={uploadConfig?.titleConfigId || entityType}
        acceptedFileTypes={
          uploadConfig?.acceptedFileTypes || '.xlsx,.xls,.csv,.pdf,.doc,.docx'
        }
        maxFileSize={uploadConfig?.maxFileSize || 25}
        uploadEndpoint={
          uploadConfig?.uploadEndpoint || getDefaultUploadEndpoint(entityType)
        }
        entityType={entityType}
        {...(uploadConfig?.entityId && { entityId: uploadConfig.entityId })}
      />
    </div>
  )
}
export const PageActionButtons = React.memo(PageActionButtonsComponent)
