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
  | 'customer'

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
  // Additional template downloads
  additionalDownloads?: Array<{
    label: string
    onClick: () => void
    isLoading?: boolean
    icon?: string
  }>
  // Upload dialog configuration
  uploadConfig?: {
    title?: string
    titleConfigId?: string // Label config ID for dynamic title
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
}) => {
  const router = useRouter()
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // Entity-specific configurations with permissions
  const entityConfig = {
    project: {
      label: 'Add New Build Partner Assest',
      route: '/entities/projects/new',
      permissions: ['bpa_create'], // Only users with bpa_create permission
    },
    investor: {
      label: 'Add New Capital Partner',
      route: '/investors/new',
      permissions: ['cp_create'], // Only users with cp_create permission
    },
    developer: {
      label: 'Add New Build Partner',
      route: '/entities/developers/new',
      permissions: ['bp_create'], // Only users with bp_create permission
    },
    manualPayment: {
      label: 'Add New Payment',
      route: '/transactions/manual/new',
      permissions: ['manual_payment_create'], // Only users with manual_payment_create permission
    },
    feeRepush: {
      label: 'Add New',
      route: '/fee-reconciliation/new',
      permissions: ['fee_repush_create'], // Only users with fee_repush_create permission
    },
    userManagement: {
      label: 'Add New User',
      route: '/admin/user-management/new',
      permissions: ['user_create'], // Only users with user_create permission
    },
    roleManagement: {
      label: 'Add New Role',
      route: '/admin/role-management/new',
      permissions: ['role_create'], // Only users with role_create permission
    },
    groupManagement: {
      label: 'Add New Group',
      route: '/admin/fee-types/new',
      permissions: ['group_create'], // Only users with group_create permission
    },
    suretyBond: {
      label: 'Add New Surety Bond',
      route: '/guarantee/surety-bond/new',
      permissions: ['surety_bond_create'],
    },
    workflowAction: {
      label: 'Add New Action',
      route: '/admin/workflow/action/new',
      permissions: ['workflow_action_create'], // Only users with workflow_action_create permission
    },
    workflowAmountRule: {
      label: 'Add New Amount Rule',
      route: '/admin/workflow/amount-rule/new',
      permissions: ['workflow_amount_rule_create'], // Only users with workflow_amount_rule_create permission
    },
    workflowStageTemplate: {
      label: 'Add New Stage Template',
      route: '/admin/workflow/stage-template/new',
      permissions: ['workflow_stage_template_create'], // Only users with workflow_stage_template_create permission
    },
    workflowDefinition: {
      label: 'Add New  Definition',
      route: '/admin/workflow/definition/new',
      permissions: ['workflow_definition_create'], // Only users with workflow_definition_create permission
    },
    workflowAmountStageOverride: {
      label: 'Add New Amount Stage Override',
      route: '/admin/workflow/amount-stage-override/new',
      permissions: ['workflow_amount_stage_override_create'], // Only users with workflow_amount_stage_override_create permission
    },
    developerBeneficiary: {
      label: 'Add New Beneficiary',
      route: '/developer-beneficiary/new',
      permissions: ['developer_beneficiary_create'], // Only users with developer_beneficiary_create permission
    },
    pendingPayment: {
      label: 'Add New Pending Payment',
      route: '/pending-payment/new',
      permissions: ['pending_tran_create'], // Only users with pending_payment_create permission
    },

    customer: {
      label: 'Add New Customer',
      route: '/master-customers/customers/new',
      permissions: ['bp_create'], // Only users with bp_create permission
    },
  }

  const config = entityConfig[entityType]
  const handleAddNew = useCallback(() => {
    if (onAddNew) {
      onAddNew()
    } else {
      router.push(config.route)
    }
  }, [onAddNew, router, config.route])

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

  const handleUploadSuccess = useCallback(
    (response: {
      id: string
      fileName: string
      fileSize: number
      uploadedAt: string
      [key: string]: unknown
    }) => {},
    []
  )

  const handleUploadError = useCallback((error: string) => {}, [])

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
      default:
        return '/real-estate-document/upload'
    }
  }

  return (
    <div className={`flex justify-end gap-2 py-3.5 px-4 ${className}`}>
      {showButtons.downloadTemplate && (
        <Tooltip
          title={isDownloading ? 'Downloading...' : 'Download Template'}
          arrow
          placement="bottom"
        >
          <button
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
            className={`flex items-center h-8 py-1.5 px-2.5 gap-1.5 font-sans font-medium text-sm rounded-md transition-colors ${
              isDownloading
                ? 'cursor-not-allowed text-gray-400 bg-gray-100'
                : 'cursor-pointer text-[#155DFC] hover:bg-blue-50'
            }`}
          >
            {!isDownloading && (
              <img src="/download icon.svg" alt="download icon" />
            )}
            {isDownloading && (
              <span className="text-xs animate-spin">
                <Loader />
              </span>
            )}
          </button>
        </Tooltip>
      )}

      {/* Additional download buttons */}
      {additionalDownloads.map((download, index) => (
        <Tooltip
          key={index}
          title={download.isLoading ? 'Downloading...' : download.label}
          arrow
          placement="bottom"
        >
          <button
            onClick={download.onClick}
            disabled={download.isLoading}
            className={`flex items-center h-8 py-1.5 px-2.5 gap-1.5 font-sans font-medium text-sm rounded-md transition-colors ${
              download.isLoading
                ? 'cursor-not-allowed text-gray-400 bg-gray-100'
                : 'cursor-pointer text-[#155DFC] hover:bg-blue-50'
            }`}
          >
            <img
              src={download.icon || '/download icon.svg'}
              alt="download icon"
            />
            {download.isLoading && (
              <span className="text-xs animate-spin">
                <Loader />
              </span>
            )}
          </button>
        </Tooltip>
      ))}
      {showButtons.uploadDetails && (
        <Tooltip title="Upload Details" arrow placement="bottom">
          <button
            onClick={handleUploadDetails}
            className="flex items-center cursor-pointer h-8 py-1.5 bg-[#DBEAFE] rounded-md px-2.5 gap-1.5 text-[#155DFC] font-sans font-medium text-sm hover:bg-blue-100 transition-colors"
          >
            <img src="/upload.svg" alt="upload icon" />
          </button>
        </Tooltip>
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
                  ? 'bg-[#155DFC] text-[#FAFAF9] hover:bg-blue-700'
                  : 'bg-[#DBEAFE] text-[#155DFC] hover:bg-blue-100'
              }`}
            >
              <img src="/circle-plus.svg" alt="plus icon" />
              {button.label}
            </button>
          ))
        : showButtons.addNew && (
            <PermissionButton
              requiredPermissions={config.permissions}
              onClick={handleAddNew}
              className="flex items-center cursor-pointer
 h-8 py-1.5 bg-[#155DFC] rounded-md px-2.5 gap-1.5 text-[#FAFAF9] font-sans font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              <img src="/circle-plus.svg" alt="plus icon" />
              {config.label}
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
        maxFileSize={uploadConfig?.maxFileSize || 10}
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
