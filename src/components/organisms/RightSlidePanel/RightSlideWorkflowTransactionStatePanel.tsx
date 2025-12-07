'use client'

import React, { useState, useMemo, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Drawer,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextareaAutosize,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from './panelTheme'
import { CommentModal } from '@/components/molecules'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import type { WorkflowRequest } from '@/services/api/workflowApi/workflowRequestService'
import { useCreateWorkflowExecution } from '@/hooks/workflow'
import {
  useQueueRequestDetail,
  useQueueRequestStatus,
  useQueueRequestLogs,
} from '@/hooks/workflow/useWorkflowRequest'
import { useAuthStore } from '@/store/authStore'
import { JWTParser } from '@/utils/jwtParser'
import { formatDateOnly, truncateWords } from '@/utils'

interface FieldItem {
  gridSize: number
  label: string
  value: string | number | boolean | null | undefined
}

interface SectionProps {
  title: string
  fields: FieldItem[]
}

const Section = ({ title, fields }: SectionProps) => {
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])

  const renderDisplayField = (
    label: string,
    value: string | number | boolean | null | undefined
  ) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography
        sx={{
          fontSize: '14px',
          fontWeight: 600,
          ...tokens.label,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          ...tokens.value,
          wordBreak: 'break-word',
        }}
      >
        {String(value || '-')}
      </Typography>
    </Box>
  )

  const renderCheckboxField = (label: string, value: boolean) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography
        sx={{
          fontSize: '14px',
          fontWeight: 600,
          ...tokens.label,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          ...tokens.value,
        }}
      >
        {value ? 'Yes' : 'No'}
      </Typography>
    </Box>
  )

  return (
    <Box mb={4}>
      <Typography
        variant="h6"
        fontWeight={600}
        gutterBottom
        sx={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 500,
          fontStyle: 'normal',
          fontSize: '18px',
          lineHeight: '28px',
          letterSpacing: '0.15px',
          verticalAlign: 'middle',
        }}
      >
        {title}
      </Typography>

      <Grid container spacing={3} mt={3}>
        {fields.map((field, idx) => (
          <Grid
            size={{ xs: 12, md: field.gridSize || 6 }}
            key={`field-${title}-${idx}`}
          >
            {typeof field.value === 'boolean'
              ? renderCheckboxField(field.label, field.value)
              : renderDisplayField(field.label, field.value)}
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

interface RightSlideWorkflowTransactionStatePanelProps {
  isOpen: boolean
  onClose: () => void
  transactionId?: string | number
  steps?: string[]
  initialStep?: number
  onApprove?: (transactionId?: string | number, comment?: string) => void
  onReject?: (transactionId?: string | number, comment?: string) => void
  children?: ReactNode
  workflowRequestData?: WorkflowRequest // Legacy - API response from WORKFLOW_REQUEST.GET_BY_ID
  workflowRequestLogsData?: { content: Record<string, unknown>[] } // Legacy - API response from WORKFLOW_REQUEST_LOG.GET_ALL
  activeTab?: string // Current active tab (buildPartner, capitalPartner, payments, etc.)
}

export const RightSlideWorkflowTransactionStatePanel: React.FC<
  RightSlideWorkflowTransactionStatePanelProps
> = ({
  isOpen,
  onClose,
  transactionId,
  steps: stepsProp,
  initialStep = 0,
  onApprove,
  onReject,
  children,
  workflowRequestData,
  workflowRequestLogsData,
  activeTab = 'buildPartner',
}) => {
  const TAB_TO_MODULE_MAP = useMemo(
    () => ({
      buildPartner: 'BUILD_PARTNER',
      buildPartnerAsset: 'BUILD_PARTNER_ASSET',
      capitalPartner: 'CAPITAL_PARTNER',
      payments: 'PAYMENTS',
      suretyBond: 'SURETY_BOND',
    }),
    []
  )
  const [comment, setComment] = useState('')
  const [activeStep, setActiveStep] = useState(Math.max(1, initialStep))
  const [modalOpen, setModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(
    null
  )

  // MUI Snackbar state - single state for messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const createWorkflowExecutionMutation = useCreateWorkflowExecution()
  const router = useRouter()
  const { token } = useAuthStore()
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])

  // Queue API hooks with fresh data fetching
  const {
    data: queueDetailData,
    isLoading: queueDetailLoading,
    refetch: refetchQueueDetail,
  } = useQueueRequestDetail(transactionId?.toString() || '')

  const { data: queueStatusData, refetch: refetchQueueStatus } =
    useQueueRequestStatus(transactionId?.toString() || '')

  const {
    data: queueLogsData,
    isLoading: queueLogsLoading,
    refetch: refetchQueueLogs,
  } = useQueueRequestLogs(transactionId?.toString() || '')

  // Refetch data when panel opens to ensure fresh data
  React.useEffect(() => {
    if (isOpen && transactionId) {
      refetchQueueDetail()
      refetchQueueStatus()
      refetchQueueLogs()
    }
  }, [
    isOpen,
    transactionId,
    refetchQueueDetail,
    refetchQueueStatus,
    refetchQueueLogs,
  ])

  React.useEffect(() => {
    // Use queue status data if available, otherwise fallback to old data
    const currentStageOrder =
      queueStatusData?.completedStages ||
      queueDetailData?.currentStageOrder ||
      workflowRequestData?.currentStageOrder

    if (currentStageOrder) {
      const newActiveStep = Math.max(1, currentStageOrder - 1)
      setActiveStep(newActiveStep)
    }
  }, [
    queueStatusData?.completedStages,
    queueDetailData?.currentStageOrder,
    workflowRequestData?.currentStageOrder,
  ])

  const getCurrentUserRoles = useCallback(() => {
    if (!token) {
      return []
    }
    try {
      const parsedToken = JWTParser.parseToken(token)
      if (!parsedToken?.payload?.realm_access?.roles) {
        return []
      }
      const roles = parsedToken.payload.realm_access.roles
      return roles
    } catch {
      return []
    }
  }, [token])

  const hasRole = useCallback(
    (role: string) => {
      const _userRoles = getCurrentUserRoles()
      const hasSpecificRole = _userRoles.includes(role)
      return hasSpecificRole
    },
    [getCurrentUserRoles]
  )

  const dynamicSteps = useMemo(() => {
    const isMaker = hasRole('ROLE_MAKER')
    const isChecker = hasRole('ROLE_CHECKER')

    // Use queue status data if available, otherwise fallback to old data
    const stageData =
      queueStatusData?.stageHistory ||
      workflowRequestData?.workflowRequestStageDTOS

    if (stageData && stageData.length > 0) {
      const sortedStages = [...stageData]
        .sort((a, b) => a.stageOrder - b.stageOrder)
        .map((stage) => ({
          id: stage.id,
          stageOrder: stage.stageOrder,
          label:
            stage.stageKey ||
            stage.keycloakGroup ||
            `Stage ${stage.stageOrder}`,
          stageKey: stage.stageKey,
          keycloakGroup: stage.keycloakGroup,
          status: 'status' in stage ? stage.status : undefined,
          requiredApprovals: stage.requiredApprovals,
          approvalsObtained: stage.approvalsObtained,
        }))

      if (!sortedStages.some((stage) => stage.stageKey === 'INITIATION')) {
        return [
          {
            id: 0,
            stageOrder: 0,
            label: 'Initiation',
            stageKey: 'INITIATION',
            keycloakGroup: 'INITIATION',
          },
          ...sortedStages,
        ]
      }

      return sortedStages
    }

    const defaultSteps = ['Initiation', 'Maker', 'Approval'].map(
      (label, index) => {
        let displayLabel = label

        if (label === 'Maker' && isMaker) {
          displayLabel = `${label} (Your Role)`
        } else if (label === 'Approval' && isChecker) {
          displayLabel = `${label} (Your Role)`
        }

        return {
          id: index,
          stageOrder: index,
          label: displayLabel,
          stageKey: label.toUpperCase(),
          keycloakGroup: label.toUpperCase(),
        }
      }
    )

    return stepsProp ?? defaultSteps
  }, [
    queueStatusData?.stageHistory,
    workflowRequestData?.workflowRequestStageDTOS,
    stepsProp,
    hasRole,
  ])

  const getCurrentUserInfo = useCallback(() => {
    if (!token) {
      return { userId: null, userName: null }
    }
    try {
      const userInfo = JWTParser.extractUserInfo(token)
      if (!userInfo) {
        return { userId: null, userName: null }
      }
      const result = {
        userId: userInfo.userId,
        userName: userInfo.name,
      }
      return result
    } catch {
      return { userId: null, userName: null }
    }
  }, [token])

  const resolveUserName = useCallback(
    (userId: string | null | undefined) => {
      const { userId: currentUserId, userName: _currentUserName } =
        getCurrentUserInfo()
      if (userId === currentUserId && _currentUserName) {
        return _currentUserName
      }

      // Try to find username from stages data
      if (userId && queueDetailData?.stages) {
        for (const stage of queueDetailData.stages) {
          if ((stage as any).approvals) {
            for (const approval of (stage as any).approvals) {
              if (
                approval.approverUserId === userId &&
                approval.approverUsername
              ) {
                return approval.approverUsername
              }
            }
          }
        }
      }

      // Try to find username from workflow data stages
      if (userId && workflowRequestData?.workflowRequestStageDTOS) {
        for (const stage of workflowRequestData.workflowRequestStageDTOS) {
          if ((stage as any).approvals) {
            for (const approval of (stage as any).approvals) {
              if (
                approval.approverUserId === userId &&
                approval.approverUsername
              ) {
                return approval.approverUsername
              }
            }
          }
        }
      }

      return userId
    },
    [getCurrentUserInfo, queueDetailData, workflowRequestData]
  )

  const currentLogEntry = useMemo(() => {
    if (!workflowRequestLogsData?.content || !transactionId) return null

    const logs = workflowRequestLogsData.content
    if (logs.length === 0) return null

    const sortedLogs = [...logs].sort((a, b) => {
      const dateA = new Date(a.eventAt as string).getTime()
      const dateB = new Date(b.eventAt as string).getTime()
      return dateB - dateA
    })

    return sortedLogs[0]
  }, [workflowRequestLogsData, transactionId])

  const currentWorkflowData =
    workflowRequestData || currentLogEntry?.workflowRequestDTO

  const transactionDetails = useMemo(() => {
    // Use queue detail data if available, otherwise fallback to old data
    const workflowData =
      queueDetailData ||
      currentWorkflowData ||
      currentLogEntry?.workflowRequestDTO
    const detailsJson =
      queueDetailData?.payloadJson ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (workflowData as any)?.payloadJson ||
      currentLogEntry?.detailsJson

    if (!workflowData && !currentLogEntry && queueDetailLoading) {
      return [
        { gridSize: 3, label: 'Reference ID', value: 'Loading...' },
        { gridSize: 3, label: 'Reference Type', value: 'Loading...' },
        { gridSize: 3, label: 'Action Key', value: 'Loading...' },
        { gridSize: 3, label: 'Current Stage', value: 'Loading...' },
        { gridSize: 6, label: 'Created By', value: 'Loading...' },
        { gridSize: 6, label: 'Created At', value: 'Loading...' },
        { gridSize: 6, label: 'Last Updated At', value: 'Loading...' },
      ]
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workflowDataAny = workflowData as any

    const baseDetails = [
      {
        gridSize: 4,
        label: 'ID',
        value: workflowDataAny?.id ? workflowDataAny.id : '-',
      },
      {
        gridSize: 4,
        label: 'Reference ID',
        value: workflowDataAny?.referenceId
          ? workflowDataAny.referenceId
          : transactionId
            ? String(transactionId)
            : '-',
      },
      {
        gridSize: 4,
        label: 'Reference Type',
        value: workflowDataAny?.referenceType
          ? workflowDataAny.referenceType
          : '-',
      },
      {
        gridSize: 4,
        label: 'Action Key',
        value: workflowDataAny?.actionKey ? workflowDataAny.actionKey : '-',
      },
      {
        gridSize: 4,
        label: 'Amount',
        value: workflowDataAny?.amount ? workflowDataAny.amount : '0',
      },
      {
        gridSize: 4,
        label: 'Currency',
        value: workflowDataAny?.currency || '-',
      },
    ]

    const dynamicDetails = []
    const currentModuleName =
      TAB_TO_MODULE_MAP[activeTab as keyof typeof TAB_TO_MODULE_MAP] ||
      workflowDataAny?.moduleName

    if (
      activeTab === 'buildPartner' ||
      currentModuleName === 'BUILD_PARTNER' ||
      workflowDataAny?.referenceType === 'BUILD_PARTNER'
    ) {
      dynamicDetails.push({
        gridSize: 4,
        label: 'CIFRERA',
        value: detailsJson?.bpCifrera || '-',
      })

      dynamicDetails.push({
        gridSize: 4,
        label: 'License No',
        value: detailsJson?.bpLicenseNo || '-',
      })

      dynamicDetails.push({
        gridSize: 4,
        label: 'Local Name',
        value: detailsJson?.bpNameLocal || '-',
      })

      dynamicDetails.push({
        gridSize: 4,
        label: 'Current Stage',
        value: workflowDataAny?.currentStageOrder
          ? `Stage ${workflowDataAny.currentStageOrder}`
          : '-',
      })

      dynamicDetails.push({
        gridSize: 4,
        label: 'Created At',
        value: workflowDataAny?.createdAt
          ? formatDateOnly(workflowDataAny.createdAt)
          : '-',
      })

      dynamicDetails.push({
        gridSize: 4,
        label: 'Last Updated At',
        value: workflowDataAny?.lastUpdatedAt
          ? formatDateOnly(workflowDataAny.lastUpdatedAt)
          : '-',
      })

      dynamicDetails.push({
        gridSize: 4,
        label: 'Build Partner Name',
        value: truncateWords(detailsJson?.bpName, 15) || '-',
      })

      dynamicDetails.push({
        gridSize: 4,
        label: 'Developer ID',
        value: detailsJson?.bpDeveloperId || '-',
      })
      dynamicDetails.push({
        gridSize: 4,
        label: 'Status',
        value: workflowDataAny?.status ? workflowDataAny.status : '-',
      })
    }

    if (detailsJson) {
      // Capital Partner specific fields
      if (
        activeTab === 'capitalPartner' ||
        currentModuleName === 'CAPITAL_PARTNER'
      ) {
        if ((detailsJson as Record<string, unknown>).cpName)
          dynamicDetails.push({
            gridSize: 6,
            label: 'CP Name',
            value: (detailsJson as Record<string, unknown>).cpName,
          })
        if ((detailsJson as Record<string, unknown>).cpId)
          dynamicDetails.push({
            gridSize: 3,
            label: 'CP ID',
            value: (detailsJson as Record<string, unknown>).cpId,
          })
        if ((detailsJson as Record<string, unknown>).cpCode)
          dynamicDetails.push({
            gridSize: 3,
            label: 'CP Code',
            value: (detailsJson as Record<string, unknown>).cpCode,
          })
        if ((detailsJson as Record<string, unknown>).cpType)
          dynamicDetails.push({
            gridSize: 3,
            label: 'CP Type',
            value: (detailsJson as Record<string, unknown>).cpType,
          })
        if ((detailsJson as Record<string, unknown>).cpContactPerson)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Contact Person',
            value: (detailsJson as Record<string, unknown>).cpContactPerson,
          })
        if ((detailsJson as Record<string, unknown>).cpEmail)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Email',
            value: (detailsJson as Record<string, unknown>).cpEmail,
          })
        if ((detailsJson as Record<string, unknown>).cpPhone)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Phone',
            value: (detailsJson as Record<string, unknown>).cpPhone,
          })
        if ((detailsJson as Record<string, unknown>).cpAddress)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Address',
            value: (detailsJson as Record<string, unknown>).cpAddress,
          })
        if ((detailsJson as Record<string, unknown>).cpLicenseNumber)
          dynamicDetails.push({
            gridSize: 3,
            label: 'License Number',
            value: (detailsJson as Record<string, unknown>).cpLicenseNumber,
          })
        if ((detailsJson as Record<string, unknown>).cpRegistrationDate)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Registration Date',
            value: (detailsJson as Record<string, unknown>).cpRegistrationDate,
          })
      }

      // Payments specific fields
      if (activeTab === 'payments' || currentModuleName === 'PAYMENTS') {
        if ((detailsJson as Record<string, unknown>).paymentId)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Payment ID',
            value: (detailsJson as Record<string, unknown>).paymentId,
          })
        if ((detailsJson as Record<string, unknown>).recipientName)
          dynamicDetails.push({
            gridSize: 6,
            label: 'Recipient Name',
            value: (detailsJson as Record<string, unknown>).recipientName,
          })
        if ((detailsJson as Record<string, unknown>).paymentAmount)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Payment Amount',
            value: (detailsJson as Record<string, unknown>).paymentAmount,
          })
        if ((detailsJson as Record<string, unknown>).paymentCurrency)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Currency',
            value: (detailsJson as Record<string, unknown>).paymentCurrency,
          })
        if ((detailsJson as Record<string, unknown>).paymentMethod)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Payment Method',
            value: (detailsJson as Record<string, unknown>).paymentMethod,
          })
        if ((detailsJson as Record<string, unknown>).bankAccount)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Bank Account',
            value: (detailsJson as Record<string, unknown>).bankAccount,
          })
        if ((detailsJson as Record<string, unknown>).routingNumber)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Routing Number',
            value: (detailsJson as Record<string, unknown>).routingNumber,
          })
        if ((detailsJson as Record<string, unknown>).paymentDate)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Payment Date',
            value: (detailsJson as Record<string, unknown>).paymentDate,
          })
        if ((detailsJson as Record<string, unknown>).paymentStatus)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Payment Status',
            value: (detailsJson as Record<string, unknown>).paymentStatus,
          })
        if ((detailsJson as Record<string, unknown>).transactionReference)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Transaction Reference',
            value: (detailsJson as Record<string, unknown>)
              .transactionReference,
          })
      }

      // Surety Bond specific fields
      if (activeTab === 'suretyBond' || currentModuleName === 'SURETY_BOND') {
        if ((detailsJson as Record<string, unknown>).bondId)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Bond ID',
            value: (detailsJson as Record<string, unknown>).bondId,
          })
        if ((detailsJson as Record<string, unknown>).bondName)
          dynamicDetails.push({
            gridSize: 6,
            label: 'Bond Name',
            value: (detailsJson as Record<string, unknown>).bondName,
          })
        if ((detailsJson as Record<string, unknown>).bondType)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Bond Type',
            value: (detailsJson as Record<string, unknown>).bondType,
          })
        if ((detailsJson as Record<string, unknown>).bondAmount)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Bond Amount',
            value: (detailsJson as Record<string, unknown>).bondAmount,
          })
        if ((detailsJson as Record<string, unknown>).bondCurrency)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Currency',
            value: (detailsJson as Record<string, unknown>).bondCurrency,
          })
        if ((detailsJson as Record<string, unknown>).bondStartDate)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Start Date',
            value: (detailsJson as Record<string, unknown>).bondStartDate,
          })
        if ((detailsJson as Record<string, unknown>).bondEndDate)
          dynamicDetails.push({
            gridSize: 3,
            label: 'End Date',
            value: (detailsJson as Record<string, unknown>).bondEndDate,
          })
        if ((detailsJson as Record<string, unknown>).bondStatus)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Bond Status',
            value: (detailsJson as Record<string, unknown>).bondStatus,
          })
        if ((detailsJson as Record<string, unknown>).issuerName)
          dynamicDetails.push({
            gridSize: 6,
            label: 'Issuer Name',
            value: (detailsJson as Record<string, unknown>).issuerName,
          })
        if ((detailsJson as Record<string, unknown>).beneficiaryName)
          dynamicDetails.push({
            gridSize: 6,
            label: 'Beneficiary Name',
            value: (detailsJson as Record<string, unknown>).beneficiaryName,
          })
      }

      // Build Partner Asset specific fields
      if (
        activeTab === 'buildPartnerAsset' ||
        currentModuleName === 'BUILD_PARTNER_ASSET'
      ) {
        if ((detailsJson as Record<string, unknown>).assetId)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Asset ID',
            value: (detailsJson as Record<string, unknown>).assetId,
          })
        if ((detailsJson as Record<string, unknown>).assetName)
          dynamicDetails.push({
            gridSize: 6,
            label: 'Asset Name',
            value: (detailsJson as Record<string, unknown>).assetName,
          })
        if ((detailsJson as Record<string, unknown>).assetType)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Asset Type',
            value: (detailsJson as Record<string, unknown>).assetType,
          })
        if ((detailsJson as Record<string, unknown>).assetValue)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Asset Value',
            value: (detailsJson as Record<string, unknown>).assetValue,
          })
        if ((detailsJson as Record<string, unknown>).assetLocation)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Asset Location',
            value: (detailsJson as Record<string, unknown>).assetLocation,
          })
        if ((detailsJson as Record<string, unknown>).assetStatus)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Asset Status',
            value: (detailsJson as Record<string, unknown>).assetStatus,
          })
        if ((detailsJson as Record<string, unknown>).ownerName)
          dynamicDetails.push({
            gridSize: 6,
            label: 'Owner Name',
            value: (detailsJson as Record<string, unknown>).ownerName,
          })
        if ((detailsJson as Record<string, unknown>).registrationDate)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Registration Date',
            value: (detailsJson as Record<string, unknown>).registrationDate,
          })
      }
    }

    return [...baseDetails, ...dynamicDetails]
  }, [
    queueDetailData,
    queueDetailLoading,
    currentWorkflowData,
    currentLogEntry,
    transactionId,
    activeTab,
    TAB_TO_MODULE_MAP,
  ])

  const auditTrail = useMemo(() => {
    // Use queue logs data if available, otherwise fallback to old data
    const logsData = queueLogsData?.content || workflowRequestLogsData?.content
    const workflowData = queueDetailData || currentWorkflowData

    // Event types to filter out from audit trail
    const filteredEventTypes = [
      'WORKFLOW_COMPLETED',
      'STAGE_STARTED',
      'REQUEST_CREATED',
    ]

    if (!logsData && !workflowData && queueLogsLoading) {
      return [
        {
          action: 'Loading...',
          user: 'Loading...',
          timestamp: 'Loading...',
        },
      ]
    }

    if (logsData && logsData.length > 0) {
      return logsData
        .filter((log) => {
          const eventType = (log.eventType as string)?.toUpperCase()
          return !filteredEventTypes.includes(eventType)
        })
        .sort(
          (a, b) =>
            new Date(a.eventAt as string).getTime() -
            new Date(b.eventAt as string).getTime()
        )
        .map((log) => {
          const resolvedUserName = resolveUserName(log.eventByUser as string)
          const displayUser =
            resolvedUserName !== log.eventByUser
              ? resolvedUserName
              : (log.eventByGroup as string) || 'System'

          const eventTypeLower = (log.eventType as string)?.toLowerCase() || ''
          const isApprovalAction =
            eventTypeLower.includes('approve') ||
            eventTypeLower.includes('approved') ||
            eventTypeLower.includes('approval') ||
            (eventTypeLower === 'decision' &&
              (log.detailsJson as any)?.decision === 'APPROVE')

          let userRole = 'Unknown'
          if (log.eventByGroup) {
            userRole = log.eventByGroup as string
          } else if (
            (log.eventType as string)?.toLowerCase().includes('maker')
          ) {
            userRole = 'ROLE_MAKER'
          } else if (
            (log.eventType as string)?.toLowerCase().includes('checker') ||
            (log.eventType as string)?.toLowerCase().includes('approval')
          ) {
            userRole = 'ROLE_CHECKER'
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const logAny = log as any

          // Format action text for better display
          let actionText = log.eventType || 'Unknown Event'
          if (eventTypeLower === 'decision') {
            const decision = (log.detailsJson as any)?.decision
            if (decision === 'APPROVE') {
              actionText = 'APPROVED'
            } else if (decision === 'REJECT') {
              actionText = 'REJECTED'
            } else {
              actionText = `DECISION: ${decision || 'UNKNOWN'}`
            }
          }

          return {
            id: log.id,
            action: actionText,
            user: displayUser,
            group: log.eventByGroup,
            role: userRole,
            isApproval: isApprovalAction,
            timestamp: log.eventAt
              ? formatDateOnly(log.eventAt as string)
              : '-',
            rawTimestamp: log.eventAt,
            details: log.detailsJson || {},
            remarks: (log.detailsJson as any)?.remarks || '',
            workflowRequestId: logAny.workflowRequestDTO?.id,
            referenceId: logAny.workflowRequestDTO?.referenceId,
            moduleName: logAny.workflowRequestDTO?.moduleName,
            actionKey: logAny.workflowRequestDTO?.actionKey,
          }
        })
    }

    if (currentWorkflowData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentWorkflowDataAny = currentWorkflowData as any
      return [
        {
          action: 'Request Created',
          user: currentWorkflowDataAny.createdBy || 'System',
          timestamp: currentWorkflowDataAny.createdAt
            ? formatDateOnly(currentWorkflowDataAny.createdAt)
            : '-',
        },
        {
          action: 'Current Stage',
          user: `Stage ${currentWorkflowDataAny.currentStageOrder || 1}`,
          timestamp: currentWorkflowDataAny.lastUpdatedAt
            ? formatDateOnly(currentWorkflowDataAny.lastUpdatedAt)
            : 'Pending',
        },
      ]
    }

    return []
  }, [
    queueLogsData,
    queueDetailData,
    workflowRequestLogsData,
    currentWorkflowData,
    resolveUserName,
    queueLogsLoading,
  ])

  // Check if user can perform action - if not, silently return (button should be disabled)
  const handleApprove = () => {
    if (!canPerformAction) {
      return
    }
    setActionType('approve')
    setModalOpen(true)
  }

  // Check if user can perform action - if not, silently return (button should be disabled)
  const handleReject = () => {
    if (!canPerformAction) {
      return
    }

    setActionType('reject')
    setModalOpen(true)
  }

  // Use queue data if available, otherwise fallback to legacy data
  const getCurrentWorkflowStageId = useMemo(() => {
    if (queueDetailData?.stages && queueDetailData?.currentStageOrder) {
      const currentStage = queueDetailData.stages.find(
        (stage) => stage.stageOrder === queueDetailData.currentStageOrder
      )
      return currentStage?.id?.toString() || null
    }

    // Fallback to legacy data
    if (
      !workflowRequestData?.workflowRequestStageDTOS ||
      !workflowRequestData?.currentStageOrder
    ) {
      return null
    }

    const currentStage = workflowRequestData.workflowRequestStageDTOS.find(
      (stage) => stage.stageOrder === workflowRequestData.currentStageOrder
    )

    return currentStage?.id?.toString() || null
  }, [queueDetailData, workflowRequestData])

  // Get current stage order from any available source
  const isAllStepsCompleted = useMemo(() => {
    const currentStageOrder =
      queueDetailData?.currentStageOrder ||
      workflowRequestData?.currentStageOrder ||
      queueStatusData?.completedStages

    if (!currentStageOrder) {
      return false
    }

    // Get total stages from queue data or workflow data
    const totalStages =
      queueDetailData?.stages?.length ||
      workflowRequestData?.workflowRequestStageDTOS?.length ||
      dynamicSteps.length

    // Check if checker has actually approved by looking at audit trail
    const logsData = queueLogsData?.content || workflowRequestLogsData?.content
    let checkerHasApproved = false

    if (logsData && logsData.length > 0) {
      checkerHasApproved = logsData.some((log) => {
        const eventType = (log.eventType as string)?.toLowerCase() || ''
        const eventByGroup = (log.eventByGroup as string)?.toLowerCase() || ''
        const isApprovalEvent =
          eventType.includes('approve') ||
          eventType.includes('approved') ||
          eventType.includes('approval')
        const isCheckerEvent =
          eventByGroup.includes('checker') ||
          eventByGroup.includes('role_checker')
        return isApprovalEvent && isCheckerEvent
      })
    }

    // All steps are completed when:
    // 1. Current stage order is greater than total stages, OR
    // 2. We're at stage 3 or higher (checker has completed approval), OR
    // 3. Checker has actually approved (based on audit trail)
    const result =
      currentStageOrder > totalStages ||
      currentStageOrder >= 3 ||
      checkerHasApproved

    return result
  }, [
    queueDetailData?.currentStageOrder,
    queueDetailData?.stages?.length,
    workflowRequestData?.currentStageOrder,
    workflowRequestData?.workflowRequestStageDTOS?.length,
    queueStatusData?.completedStages,
    dynamicSteps.length,
    queueLogsData?.content,
    workflowRequestLogsData?.content,
  ])

  // Use queue data if available, otherwise fallback to old data
  const canPerformAction = useMemo(() => {
    if (isAllStepsCompleted) {
      return false
    }

    const currentStageOrder =
      queueDetailData?.currentStageOrder ||
      workflowRequestData?.currentStageOrder ||
      queueStatusData?.completedStages

    const isMaker = hasRole('ROLE_MAKER')
    const isChecker = hasRole('ROLE_CHECKER')
    const isAdmin = hasRole('ROLE_ADMIN')

    if (isAdmin) {
      return true
    }

    // Check if checker has actually approved by looking at audit trail
    const logsData = queueLogsData?.content || workflowRequestLogsData?.content
    let checkerHasApproved = false

    if (logsData && logsData.length > 0) {
      checkerHasApproved = logsData.some((log) => {
        const eventType = (log.eventType as string)?.toLowerCase() || ''
        const eventByGroup = (log.eventByGroup as string)?.toLowerCase() || ''
        const isApprovalEvent =
          eventType.includes('approve') ||
          eventType.includes('approved') ||
          eventType.includes('approval')
        const isCheckerEvent =
          eventByGroup.includes('checker') ||
          eventByGroup.includes('role_checker')
        return isApprovalEvent && isCheckerEvent
      })
    }

    // If stage order is 3 or higher OR checker has actually approved, all approvals are complete - disable buttons
    if ((currentStageOrder || 0) >= 3 || checkerHasApproved) {
      return false
    }

    // Simplified logic based on current stage order
    if (isMaker) {
      // Maker can only approve when at stage 1 (Maker stage)
      return (currentStageOrder || 0) === 1
    }

    if (isChecker) {
      // Checker can only approve when at stage 2 (Checker stage) AND checker hasn't already approved
      // If currentStageOrder is 2, it means checker stage is active and can be approved
      // If currentStageOrder is 3 or higher OR checker has already approved, disable buttons
      const stage = currentStageOrder || 0
      return stage === 2 && !checkerHasApproved
    }

    return false
  }, [
    isAllStepsCompleted,
    queueDetailData?.currentStageOrder,
    workflowRequestData?.currentStageOrder,
    queueStatusData?.completedStages,
    hasRole,
    queueLogsData?.content,
    workflowRequestLogsData?.content,
  ])

  const handleCommentSubmit = async (
    comment: string,
    type: 'approve' | 'reject'
  ) => {
    try {
      const workflowStageId = getCurrentWorkflowStageId
      if (!workflowStageId) return
      const { userId: currentUserId } = getCurrentUserInfo()
      if (!currentUserId) return
      const _userRoles = getCurrentUserRoles()
      const currentRole = _userRoles.find((r: string) => r.startsWith('ROLE_'))
      const payload = {
        userId: String(currentUserId),
        remarks: comment.trim() || (type === 'approve' ? 'APPROVE' : 'REJECT'),
        decision: (type === 'approve' ? 'APPROVE' : 'REJECT') as
          | 'APPROVE'
          | 'REJECT',
        userRole: currentRole,
      }

      await createWorkflowExecutionMutation.mutateAsync({
        workflowId: String(workflowStageId),
        data: payload,
      })

      // Refetch data after successful action to get updated state
      await Promise.all([
        refetchQueueDetail(),
        refetchQueueStatus(),
        refetchQueueLogs(),
      ])

      // Show success toast based on user role and action type
      const isMaker = hasRole('ROLE_MAKER')
      const isChecker = hasRole('ROLE_CHECKER')

      if (type === 'approve') {
        if (isMaker) {
          setSuccessMessage('Maker approved successfully!')
        } else if (isChecker) {
          setSuccessMessage('Checker approved successfully!')
        } else {
          setSuccessMessage('Approved successfully!')
        }

        const newStep = Math.min(activeStep + 1, dynamicSteps.length - 1)
        setActiveStep(newStep)

        // Redirect to involved activities for both maker and checker approvals
        onApprove?.(transactionId, comment)
        setSuccessMessage('Redirecting to involved activities...')
        router.push('/activities/involved')
      } else {
        if (isMaker) {
          setErrorMessage('Maker rejected the request')
        } else if (isChecker) {
          setErrorMessage('Checker rejected the request')
        } else {
          setErrorMessage('Request rejected')
        }
        onReject?.(transactionId, comment)
        setSuccessMessage('Redirecting to involved activities...')
        router.push('/activities/involved')
      }

      setModalOpen(false)
      setComment('')
    } catch (error) {
      // Show error toast with API message if available
      let errorMessage = 'Failed to process request'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        // Try to extract message from API response
        const errorObj = error as any
        if (errorObj.message) {
          errorMessage = errorObj.message
        } else if (errorObj.response?.data?.message) {
          errorMessage = errorObj.response.data.message
        } else if (errorObj.data?.message) {
          errorMessage = errorObj.data.message
        }
      }

      setErrorMessage(`Error: ${errorMessage}`)
    }
  }
  const formatReferenceType = (text = '') => {
    return text
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <>
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 520, md: 600 },
            height: 'calc(100vh - 48px)',
            maxHeight: 'calc(100vh - 48px)',
            borderRadius: '12px',
            ...tokens.paper,
            p: '24px',
            mt: '24px',
            mb: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 0,
            px: 0,
            ...tokens.header,
          }}
        >
          <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontFamily: 'var(--font-outfit), system-ui, sans-serif',
              }}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(currentWorkflowData as any)?.referenceType && (
                <h2 title="Transaction Details">
                  {formatReferenceType(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (currentWorkflowData as any).referenceType
                  )}{' '}
                  Details :
                </h2>
              )}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 500,
                ...tokens.label,
                pt: 2,
                fontFamily: 'var(--font-outfit), system-ui, sans-serif',
              }}
            >
              {
                String()
                // (activeTab === 'buildPartner' && (currentWorkflowData?.payloadJson?.bpName || currentLogEntry?.detailsJson?.bpName)) ||
                // (activeTab === 'capitalPartner' && ((currentWorkflowData?.payloadJson as any)?.cpName || (currentLogEntry?.detailsJson as any)?.cpName)) ||
                // (activeTab === 'payments' && ((currentWorkflowData?.payloadJson as any)?.recipientName || (currentLogEntry?.detailsJson as any)?.recipientName)) ||
                // (activeTab === 'suretyBond' && ((currentWorkflowData?.payloadJson as any)?.bondName || (currentLogEntry?.detailsJson as any)?.bondName)) ||
                // (activeTab === 'buildPartnerAsset' && ((currentWorkflowData?.payloadJson as any)?.assetName || (currentLogEntry?.detailsJson as any)?.assetName))
              }
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
                backgroundColor: alpha(theme.palette.action.hover, 0.1),
              },
            }}
          >
            <CancelOutlinedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            pt: '16px',
            overflowY: 'auto',
            borderColor: tokens.dividerColor,
            backgroundColor: tokens.paper.backgroundColor as string,
          }}
        >
          {children ?? (
            <>
              <Section title="" fields={transactionDetails} />

              {currentLogEntry && (
                <Box sx={{ mt: 0 }}>
                  <span>{String(currentLogEntry.eventType)}</span>
                </Box>
              )}

              <Box
                className="w-full h-px mt-3"
                sx={{
                  backgroundColor: tokens.dividerColor,
                }}
              />

              {/* Dynamic Stepper */}
              <Box sx={{ mt: 3 }}>
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  sx={{
                    '& .MuiStepConnector-line': {
                      borderColor: alpha(theme.palette.divider, 0.5),
                    },
                    '& .MuiStepConnector-root': {
                      '&.Mui-active .MuiStepConnector-line': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-completed .MuiStepConnector-line': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  {dynamicSteps.map((step, index) => {
                    const stepLabel =
                      typeof step === 'string' ? step : step.label

                    // Get current stage order for proper completion logic
                    const currentStageOrder =
                      queueDetailData?.currentStageOrder ||
                      workflowRequestData?.currentStageOrder ||
                      queueStatusData?.completedStages ||
                      0

                    const stepStageOrder =
                      typeof step === 'object' ? step.stageOrder : index

                    const isInitiationStage = stepLabel
                      .toLowerCase()
                      .includes('initiation')
                    const isMakerStage = stepLabel
                      .toLowerCase()
                      .includes('maker')
                    const isCheckerStage = stepLabel
                      .toLowerCase()
                      .includes('checker')

                    const isActive = index === activeStep

                    // Fixed completion logic - stages should only be completed when they're actually done
                    let isCompleted = false

                    // Check audit trail for actual completion status
                    const logsData =
                      queueLogsData?.content || workflowRequestLogsData?.content

                    if (isInitiationStage) {
                      // Initiation is completed if we're at stage 1 or higher
                      isCompleted = currentStageOrder >= 1
                    } else if (isMakerStage) {
                      // Maker stage is completed if we're at stage 2 or higher (after maker approves)
                      isCompleted = currentStageOrder >= 2
                    } else if (isCheckerStage) {
                      // Check if checker has actually approved by looking at audit trail
                      let checkerHasApproved = false
                      if (logsData && logsData.length > 0) {
                        checkerHasApproved = logsData.some((log) => {
                          const eventType =
                            (log.eventType as string)?.toLowerCase() || ''
                          const eventByGroup =
                            (log.eventByGroup as string)?.toLowerCase() || ''
                          const isApprovalEvent =
                            eventType.includes('approve') ||
                            eventType.includes('approved') ||
                            eventType.includes('approval')
                          const isCheckerEvent =
                            eventByGroup.includes('checker') ||
                            eventByGroup.includes('role_checker')
                          return isApprovalEvent && isCheckerEvent
                        })
                      }
                      // Checker stage is completed if stage 3+ OR checker has actually approved
                      isCompleted = currentStageOrder >= 3 || checkerHasApproved
                    } else {
                      // Fallback to original logic
                      isCompleted = stepStageOrder < currentStageOrder
                    }

                    // Debug logging for stepper
                    if (isCheckerStage) {
                      const logsData =
                        queueLogsData?.content ||
                        workflowRequestLogsData?.content
                      let checkerHasApproved = false
                      if (logsData && logsData.length > 0) {
                        checkerHasApproved = logsData.some((log) => {
                          const eventType =
                            (log.eventType as string)?.toLowerCase() || ''
                          const eventByGroup =
                            (log.eventByGroup as string)?.toLowerCase() || ''
                          const isApprovalEvent =
                            eventType.includes('approve') ||
                            eventType.includes('approved') ||
                            eventType.includes('approval')
                          const isCheckerEvent =
                            eventByGroup.includes('checker') ||
                            eventByGroup.includes('role_checker')
                          return isApprovalEvent && isCheckerEvent
                        })
                      }

                      console.log('Checker Stage Debug:', {
                        checkerHasApproved,
                      })
                    }

                    return (
                      <Step
                        key={`${typeof step === 'string' ? step : step.id}-${typeof step === 'string' ? 0 : step.stageOrder}`}
                        completed={isCompleted}
                        active={isActive}
                      >
                        <StepLabel
                          StepIconComponent={({ completed, active }) => {
                            const isDark = theme.palette.mode === 'dark'
                            if (completed) {
                              return (
                                <div
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    backgroundColor: theme.palette.primary.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: theme.palette.primary.contrastText,
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    border: `2px solid ${theme.palette.primary.main}`,
                                    boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.3)}`,
                                  }}
                                >
                                  ✓
                                </div>
                              )
                            }
                            if (active) {
                              return (
                                <div
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    backgroundColor: theme.palette.primary.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: theme.palette.primary.contrastText,
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    border: `2px solid ${theme.palette.primary.main}`,
                                    boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.3)}`,
                                  }}
                                >
                                  {index + 1}
                                </div>
                              )
                            }
                            return (
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  backgroundColor: isDark
                                    ? theme.palette.grey[700]
                                    : theme.palette.grey[200],
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: isDark
                                    ? theme.palette.grey[300]
                                    : theme.palette.grey[600],
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  border: `2px solid ${
                                    isDark
                                      ? theme.palette.grey[600]
                                      : theme.palette.grey[300]
                                  }`,
                                }}
                              >
                                {index + 1}
                              </div>
                            )
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color:
                                  isActive || isCompleted
                                    ? theme.palette.primary.main
                                    : theme.palette.text.secondary,
                                fontFamily:
                                  'var(--font-outfit), system-ui, sans-serif',
                              }}
                            >
                              {stepLabel}
                              {isActive && ' (Current)'}
                              {isCompleted && ' ✓'}
                            </div>
                          </div>
                        </StepLabel>
                      </Step>
                    )
                  })}
                </Stepper>
              </Box>
              {workflowRequestLogsData?.content &&
                workflowRequestLogsData.content.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      sx={{
                        fontSize: 24,
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        mb: 2,
                        fontFamily: 'var(--font-outfit), system-ui, sans-serif',
                      }}
                    >
                      Workflow Request Logs
                    </Typography>
                    <Box>
                      {workflowRequestLogsData.content
                        .sort(
                          (a, b) =>
                            new Date(b.eventAt as string).getTime() -
                            new Date(a.eventAt as string).getTime()
                        )
                        .map((log) => {
                          const displayUser =
                            resolveUserName(log.eventByUser as string) || '-'

                          return (
                            <Box
                              key={String(log.id)}
                              sx={{
                                p: 3,
                                mb: 2,
                                backgroundColor: theme.palette.background.paper,
                                borderRadius: 2,
                                border: `1px solid ${tokens.dividerColor}`,
                                boxShadow:
                                  theme.palette.mode === 'dark'
                                    ? '0 1px 3px rgba(0, 0, 0, 0.3)'
                                    : '0 1px 3px rgba(0, 0, 0, 0.1)',
                              }}
                            >
                              <Box sx={{ mb: 1.5 }}>
                                <Typography
                                  sx={{
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                    fontFamily:
                                      'var(--font-outfit), system-ui, sans-serif',
                                  }}
                                >
                                  {String(log.eventType || 'Unknown Event')}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr 1fr',
                                  gap: 2,
                                }}
                              >
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: '12px',
                                      fontWeight: 500,
                                      ...tokens.label,
                                      mb: 0.5,
                                      fontFamily:
                                        'var(--font-outfit), system-ui, sans-serif',
                                    }}
                                  >
                                    Event By User
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: '14px',
                                      fontWeight: 600,
                                      ...tokens.value,
                                      fontFamily:
                                        'var(--font-outfit), system-ui, sans-serif',
                                    }}
                                  >
                                    {displayUser}
                                  </Typography>
                                </Box>

                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: '12px',
                                      fontWeight: 500,
                                      ...tokens.label,
                                      mb: 0.5,
                                      fontFamily:
                                        'var(--font-outfit), system-ui, sans-serif',
                                    }}
                                  >
                                    Event By Group
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: '14px',
                                      fontWeight: 600,
                                      ...tokens.value,
                                      fontFamily:
                                        'var(--font-outfit), system-ui, sans-serif',
                                    }}
                                  >
                                    {String(log.eventByGroup || '-')}
                                  </Typography>
                                </Box>

                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: '12px',
                                      fontWeight: 500,
                                      ...tokens.label,
                                      mb: 0.5,
                                      fontFamily:
                                        'var(--font-outfit), system-ui, sans-serif',
                                    }}
                                  >
                                    Event Date & Time
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: '14px',
                                      fontWeight: 600,
                                      ...tokens.value,
                                      fontFamily:
                                        'var(--font-outfit), system-ui, sans-serif',
                                    }}
                                  >
                                    {log.eventAt
                                      ? formatDateOnly(log.eventAt as string)
                                      : '-'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          )
                        })}
                    </Box>
                  </Box>
                )}
              {/* Audit Trail - Tracker Style */}
              <Box sx={{ mt: 3 }}>
                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 3,
                    fontFamily: 'var(--font-outfit), system-ui, sans-serif',
                  }}
                >
                  Audit Trail
                </Typography>

                {/* Timeline Container */}
                <Box
                  sx={{
                    position: 'relative',
                    pl: 3,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 12,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      backgroundColor: theme.palette.primary.main,
                    },
                  }}
                >
                  {auditTrail.map((item, index) => {
                    const isLast = index === auditTrail.length - 1
                    const isApproval = (item as Record<string, unknown>)
                      .isApproval
                    const isCompleted =
                      item.timestamp &&
                      item.timestamp !== 'Pending' &&
                      item.timestamp !== '-'

                    return (
                      <Box
                        key={
                          String((item as Record<string, unknown>).id) || index
                        }
                        sx={{
                          position: 'relative',
                          mb: isLast ? 0 : 3,
                        }}
                      >
                        {/* Timeline Node */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: -21,
                            top: 8,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: isCompleted
                              ? isApproval
                                ? theme.palette.success.main
                                : theme.palette.primary.main
                              : theme.palette.grey[400],
                            border: `3px solid ${theme.palette.background.paper}`,
                            boxShadow:
                              theme.palette.mode === 'dark'
                                ? '0 2px 4px rgba(0, 0, 0, 0.3)'
                                : '0 2px 4px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                          }}
                        >
                          {isCompleted && isApproval ? (
                            <Box
                              sx={{
                                width: 8,
                                height: 6,
                                border: `2px solid ${theme.palette.primary.main}`,
                                borderTop: 'none',
                                borderRight: 'none',
                                display: 'inline-block',
                                transform: 'rotate(-45deg)',
                              }}
                            />
                          ) : null}
                          {isCompleted && !isApproval ? (
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: theme.palette.primary.main,
                              }}
                            />
                          ) : null}
                          {!isCompleted ? (
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                backgroundColor: theme.palette.primary.main,
                              }}
                            />
                          ) : null}
                        </Box>

                        {/* Content Card */}
                        <Box
                          sx={{
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 3,
                            border: `1px solid ${tokens.dividerColor}`,
                            boxShadow:
                              theme.palette.mode === 'dark'
                                ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                                : '0 2px 8px rgba(0, 0, 0, 0.08)',
                            p: 3,
                            ml: 1,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow:
                                theme.palette.mode === 'dark'
                                  ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                                  : '0 4px 12px rgba(0, 0, 0, 0.12)',
                              transform: 'translateY(-1px)',
                            },
                          }}
                        >
                          {/* Header */}
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              sx={{
                                fontSize: '18px',
                                fontWeight: 700,
                                color: isCompleted
                                  ? isApproval
                                    ? theme.palette.success.main
                                    : theme.palette.primary.main
                                  : theme.palette.text.secondary,
                                fontFamily:
                                  'var(--font-outfit), system-ui, sans-serif',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                mb: 0.5,
                              }}
                            >
                              {String(item.action)}
                            </Typography>

                            {Boolean((item as Record<string, unknown>).role) &&
                              String((item as Record<string, unknown>).role) !==
                                'Unknown' && (
                                <Typography
                                  sx={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    ...tokens.label,
                                    fontFamily:
                                      'var(--font-outfit), system-ui, sans-serif',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px',
                                  }}
                                >
                                  Role:{' '}
                                  {String(
                                    (item as Record<string, unknown>).role || ''
                                  )}
                                </Typography>
                              )}
                          </Box>

                          {/* Details Grid */}
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: {
                                xs: '1fr',
                                sm: '1fr 1fr 1fr',
                              },
                              gap: 2,
                            }}
                          >
                            {/* User */}
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: theme.palette.text.disabled,
                                  fontFamily:
                                    'var(--font-outfit), system-ui, sans-serif',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  mb: 1,
                                }}
                              >
                                User
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  ...tokens.value,
                                  fontFamily:
                                    'var(--font-outfit), system-ui, sans-serif',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {item.user || 'System'}
                              </Typography>
                            </Box>

                            {/* Group */}
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: theme.palette.text.disabled,
                                  fontFamily:
                                    'var(--font-outfit), system-ui, sans-serif',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  mb: 1,
                                }}
                              >
                                Group
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  ...tokens.value,
                                  fontFamily:
                                    'var(--font-outfit), system-ui, sans-serif',
                                }}
                              >
                                {String(
                                  (item as Record<string, unknown>).group
                                ) || '-'}
                              </Typography>
                            </Box>

                            {/* Timestamp */}
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: theme.palette.text.disabled,
                                  fontFamily:
                                    'var(--font-outfit), system-ui, sans-serif',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  mb: 1,
                                }}
                              >
                                Timestamp
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  ...tokens.value,
                                  fontFamily:
                                    'var(--font-outfit), system-ui, sans-serif',
                                }}
                              >
                                {item.timestamp || 'Pending'}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Remarks Section */}
                          {(item as Record<string, unknown>).remarks &&
                            String(
                              (item as Record<string, unknown>).remarks
                            ).trim() !== '' && (
                              <Box sx={{ mt: 2 }}>
                                <Typography
                                  sx={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: theme.palette.text.disabled,
                                    fontFamily:
                                      'var(--font-outfit), system-ui, sans-serif',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    mb: 1,
                                  }}
                                >
                                  Remarks
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: theme.palette.text.secondary,
                                    fontFamily:
                                      'var(--font-outfit), system-ui, sans-serif',
                                    backgroundColor:
                                      theme.palette.mode === 'dark'
                                        ? alpha(
                                            theme.palette.background.default,
                                            0.5
                                          )
                                        : alpha(theme.palette.grey[50], 0.8),
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: `1px solid ${tokens.dividerColor}`,
                                    wordBreak: 'break-word',
                                    lineHeight: '1.4',
                                  }}
                                >
                                  {String(
                                    (item as Record<string, unknown>).remarks ||
                                      ''
                                  )}
                                </Typography>
                              </Box>
                            )}
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            </>
          )}
        </DialogContent>

        <Box
          sx={{
            mt: 'auto',
            pt: 1,
            display: 'flex',
            gap: 1.5,
            borderTop: `1px solid ${tokens.dividerColor}`,
            backgroundColor: alpha(
              tokens.paper.backgroundColor as string,
              0.95
            ),
            backdropFilter: 'blur(10px)',
            p: 2,
            mx: -3,
            mb: -3,
          }}
        >
          {canPerformAction ? (
            <>
              <Button
                fullWidth
                variant="contained"
                onClick={handleApprove}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontFamily: 'var(--font-outfit), system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'none',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.primary.main
                      : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    borderColor:
                      theme.palette.mode === 'dark'
                        ? theme.palette.primary.main
                        : 'transparent',
                  },
                }}
              >
                {(() => {
                  const isMaker = hasRole('ROLE_MAKER')
                  const isChecker = hasRole('ROLE_CHECKER')

                  if (isMaker) return 'Approve (Maker)'
                  if (isChecker) return 'Approve (Checker)'

                  return 'Approve'
                })()}
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleReject}
                sx={{
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.error.contrastText,
                  fontFamily: 'var(--font-outfit), system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'none',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.error.main
                      : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.error.dark,
                    borderColor:
                      theme.palette.mode === 'dark'
                        ? theme.palette.error.main
                        : 'transparent',
                  },
                }}
              >
                {(() => {
                  const isMaker = hasRole('ROLE_MAKER')
                  const isChecker = hasRole('ROLE_CHECKER')

                  if (isMaker) return 'Reject (Maker)'
                  if (isChecker) return 'Reject (Checker)'

                  return 'Reject'
                })()}
              </Button>
            </>
          ) : (
            <Button
              fullWidth
              variant="contained"
              disabled
              sx={{
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
                fontFamily: 'var(--font-outfit), system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                textTransform: 'none',
                '&:disabled': {
                  backgroundColor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                },
              }}
            >
              {(() => {
                const currentStageOrder =
                  queueDetailData?.currentStageOrder ||
                  workflowRequestData?.currentStageOrder ||
                  queueStatusData?.completedStages ||
                  0

                if (isAllStepsCompleted || currentStageOrder >= 3)
                  return 'All Stages Completed'

                const isMaker = hasRole('ROLE_MAKER')
                const isChecker = hasRole('ROLE_CHECKER')

                if (isMaker && currentStageOrder > 1)
                  return 'Maker Stage Completed'
                if (isChecker && currentStageOrder > 2)
                  return 'Checker Stage Completed'

                return 'All Stages Completed'
              })()}
            </Button>
          )}
        </Box>

        <CommentModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setComment('')
            setActionType(null)
          }}
          title={
            actionType === 'approve' ? 'Approval Comment' : 'Rejection Comment'
          }
          subtitle={`Transaction ID • ${transactionId ?? 'TXN12345'}`}
          actions={[
            {
              label: 'Cancel',
              color: 'secondary',
              onClick: () => {
                setModalOpen(false)
                setComment('')
                setActionType(null)
              },
            },
            {
              label: actionType === 'approve' ? 'Approve' : 'Reject',
              color: actionType === 'approve' ? 'primary' : 'error',
              onClick: () => {
                if (actionType) {
                  handleCommentSubmit(comment, actionType)
                }
              },
              disabled: createWorkflowExecutionMutation.isPending,
            },
          ]}
        >
          <TextareaAutosize
            minRows={4}
            placeholder="Write your comment here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 font-sans text-sm border rounded-lg outline-none resize-y mt-7 border-slate-300 focus:ring-2 focus:ring-blue-500"
          />
        </CommentModal>
      </Drawer>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setErrorMessage(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
