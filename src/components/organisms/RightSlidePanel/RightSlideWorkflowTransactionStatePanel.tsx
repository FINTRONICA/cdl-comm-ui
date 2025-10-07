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
} from '@mui/material'
import { CommentModal } from '@/components/molecules'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import type { WorkflowRequest } from '@/services/api/workflowApi/workflowRequestService'
import type { WorkflowRequestLogContent } from '@/services/api/workflowApi/workflowRequestLogService'
import { useCreateWorkflowExecution } from '@/hooks/workflow'
import { useAuthStore } from '@/store/authStore'
import { JWTParser } from '@/utils/jwtParser'

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
  const renderDisplayField = (
    label: string,
    value: string | number | boolean | null | undefined
  ) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography
        sx={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#1e293b',
          fontFamily: 'var(--font-outfit), system-ui, sans-serif',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: '#64748b',
          fontFamily: 'var(--font-outfit), system-ui, sans-serif',
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
          color: '#1e293b',
          fontFamily: 'var(--font-outfit), system-ui, sans-serif',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: '#64748b',
          fontFamily: 'var(--font-outfit), system-ui, sans-serif',
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
  workflowRequestData?: WorkflowRequest // API response from WORKFLOW_REQUEST.GET_BY_ID
  workflowRequestLogsData?: { content: WorkflowRequestLogContent[] } // API response from WORKFLOW_REQUEST_LOG.GET_ALL
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
  const [permissionDeniedModalOpen, setPermissionDeniedModalOpen] =
    useState(false)
  const [permissionDeniedMessage, setPermissionDeniedMessage] = useState('')
  const [activeStep, setActiveStep] = useState(Math.max(1, initialStep))
  const [modalOpen, setModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(
    null
  )

  const createWorkflowExecutionMutation = useCreateWorkflowExecution()
  const router = useRouter()
  const { token } = useAuthStore()

  React.useEffect(() => {
    if (workflowRequestData?.currentStageOrder) {
      const newActiveStep = Math.max(
        1,
        workflowRequestData.currentStageOrder - 1
      )
      setActiveStep(newActiveStep)
    }
  }, [workflowRequestData?.currentStageOrder])

  const showPermissionDeniedModal = useCallback((message: string) => {
    setPermissionDeniedMessage(message)
    setPermissionDeniedModalOpen(true)
  }, [])

  const handlePermissionDeniedModalClose = useCallback(() => {
    setPermissionDeniedModalOpen(false)
    setPermissionDeniedMessage('')
    router.push('/dashboard')
  }, [router])

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
    } catch (error) {
      console.log(error)
      return []
    }
  }, [token])

  const hasRole = useCallback(
    (role: string) => {
      const userRoles = getCurrentUserRoles()
      const hasSpecificRole = userRoles.includes(role)
      return hasSpecificRole
    },
    [getCurrentUserRoles]
  )

  const dynamicSteps = useMemo(() => {
    const userRoles = getCurrentUserRoles()
    const isMaker = hasRole('ROLE_MAKER')
    const isChecker = hasRole('ROLE_CHECKER')
    const isAdmin = hasRole('ROLE_ADMIN')

    if (
      workflowRequestData?.workflowRequestStageDTOS &&
      workflowRequestData.workflowRequestStageDTOS.length > 0
    ) {
      const sortedStages = [...workflowRequestData.workflowRequestStageDTOS]
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
    workflowRequestData?.workflowRequestStageDTOS,
    stepsProp,
    getCurrentUserRoles,
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
    } catch (error) {
      console.log(error)
      return { userId: null, userName: null }
    }
  }, [token])

  const resolveUserName = useCallback(
    (userId: string | null | undefined) => {
      const { userId: currentUserId, userName: currentUserName } =
        getCurrentUserInfo()
      if (userId === currentUserId && currentUserName) {
        return currentUserName
      }
      return userId
    },
    [getCurrentUserInfo]
  )

  // Function to validate role permissions for workflow actions
  const validateRolePermission = useCallback(
    (action: 'approve' | 'reject', currentStage: string) => {
      const userRoles = getCurrentUserRoles()

      const isMaker = hasRole('ROLE_MAKER')
      const isChecker = hasRole('ROLE_CHECKER')
      const isAdmin = hasRole('ROLE_ADMIN')

      if (isAdmin) {
        return { allowed: true, message: '' }
      }

      const isMakerStage =
        currentStage.toLowerCase().includes('maker') ||
        currentStage.toLowerCase().includes('initiation') ||
        currentStage === 'Stage 1' ||
        currentStage === '1' ||
        currentStage.toLowerCase().includes('stage 1')

      if (isMakerStage) {
        if (isMaker) {
          return { allowed: true, message: '' }
        } else {
          return {
            allowed: false,
            message: `Your role does not match. Your current role is "${userRoles.find((r) => r.startsWith('ROLE_'))}" but you need ROLE_MAKER for this action.`,
          }
        }
      }
      const isCheckerStage =
        currentStage.toLowerCase().includes('checker') ||
        currentStage.toLowerCase().includes('approval') ||
        currentStage === 'Stage 2' ||
        currentStage === 'Stage 3' ||
        currentStage === '2' ||
        currentStage === '3' ||
        currentStage.toLowerCase().includes('stage 2') ||
        currentStage.toLowerCase().includes('stage 3')
      if (isCheckerStage) {
        if (isChecker) {
          return { allowed: true, message: '' }
        } else {
          return {
            allowed: false,
            message: `Your role does not match. Your current role is "${userRoles.find((r) => r.startsWith('ROLE_'))}" but you need ROLE_CHECKER for this action.`,
          }
        }
      }

      return {
        allowed: false,
        message: `Your role does not match. Your current role is "${userRoles.find((r) => r.startsWith('ROLE_'))}" and you don't have permission for this action. Stage "${currentStage}" is not recognized.`,
      }
    },
    [getCurrentUserRoles, hasRole, workflowRequestData]
  )

  const currentLogEntry = useMemo(() => {
    if (!workflowRequestLogsData?.content || !transactionId) return null

    const logs = workflowRequestLogsData.content
    if (logs.length === 0) return null

    const sortedLogs = [...logs].sort((a, b) => {
      const dateA = new Date(a.eventAt).getTime()
      const dateB = new Date(b.eventAt).getTime()
      return dateB - dateA
    })

    return sortedLogs[0]
  }, [workflowRequestLogsData, transactionId])

  const currentWorkflowData =
    workflowRequestData || currentLogEntry?.workflowRequestDTO

  const transactionDetails = useMemo(() => {
    if (!currentWorkflowData && !currentLogEntry) {
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

    const workflowData =
      currentWorkflowData || currentLogEntry?.workflowRequestDTO
    const detailsJson =
      workflowData?.payloadJson || currentLogEntry?.detailsJson

    const baseDetails = [
      {
        gridSize: 4,
        label: 'ID',
        value: workflowData?.id ? workflowData.id : '-',
      },
      {
        gridSize: 4,
        label: 'Reference ID',
        value: workflowData?.referenceId
          ? workflowData.referenceId
          : transactionId
            ? String(transactionId)
            : '-',
      },
      {
        gridSize: 4,
        label: 'Reference Type',
        value: workflowData?.referenceType ? workflowData.referenceType : '-',
      },
      {
        gridSize: 4,
        label: 'Action Key',
        value: workflowData?.actionKey ? workflowData.actionKey : '-',
      },
      {
        gridSize: 4,
        label: 'Amount',
        value: workflowData?.amount ? workflowData.amount : '-',
      },
      {
        gridSize: 4,
        label: 'Currency',
        value: workflowData?.currency ? workflowData.currency : '-',
      },
      // { gridSize: 12, label: 'Created By', value: workflowData?.createdBy ? workflowData.createdBy : '-' },
    ]

    const dynamicDetails = []
    const currentModuleName =
      TAB_TO_MODULE_MAP[activeTab as keyof typeof TAB_TO_MODULE_MAP] ||
      workflowData?.moduleName

    if (
      activeTab === 'buildPartner' ||
      currentModuleName === 'BUILD_PARTNER' ||
      workflowData?.referenceType === 'BUILD_PARTNER'
    ) {
      dynamicDetails.push({
        gridSize: 4,
        label: 'CIFRERA',
        value: detailsJson?.bpCifrera ? detailsJson.bpCifrera : '-',
      })

      dynamicDetails.push({
        gridSize: 4,
        label: 'License No',
        value: detailsJson?.bpLicenseNo ? detailsJson.bpLicenseNo : '-',
      })

      dynamicDetails.push({
        gridSize: 4,
        label: 'Local Name',
        value: detailsJson?.bpNameLocal ? detailsJson.bpNameLocal : '-',
      })

      dynamicDetails.push({
        gridSize: 4,
        label: 'Current Stage',
        value: workflowData?.currentStageOrder
          ? `Stage ${workflowData.currentStageOrder}`
          : '-',
      })

      dynamicDetails.push({
        gridSize: 4,
        label: 'Created At',
        value: workflowData?.createdAt
          ? new Date(workflowData.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-',
      })

      dynamicDetails.push({
        gridSize: 4,
        label: 'Last Updated At',
        value: workflowData?.lastUpdatedAt
          ? new Date(workflowData.lastUpdatedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-',
      })

      dynamicDetails.push({
        gridSize: 6,
        label: 'Build Partner Name',
        value: detailsJson?.bpName ? detailsJson.bpName : '-',
      })

      dynamicDetails.push({
        gridSize: 6,
        label: 'Developer ID',
        value: detailsJson?.bpDeveloperId ? detailsJson.bpDeveloperId : '-',
      })
    }

    if (detailsJson) {
      // Capital Partner specific fields
      if (
        activeTab === 'capitalPartner' ||
        currentModuleName === 'CAPITAL_PARTNER'
      ) {
        if ((detailsJson as any).cpName)
          dynamicDetails.push({
            gridSize: 6,
            label: 'CP Name',
            value: (detailsJson as any).cpName,
          })
        if ((detailsJson as any).cpId)
          dynamicDetails.push({
            gridSize: 3,
            label: 'CP ID',
            value: (detailsJson as any).cpId,
          })
        if ((detailsJson as any).cpCode)
          dynamicDetails.push({
            gridSize: 3,
            label: 'CP Code',
            value: (detailsJson as any).cpCode,
          })
        if ((detailsJson as any).cpType)
          dynamicDetails.push({
            gridSize: 3,
            label: 'CP Type',
            value: (detailsJson as any).cpType,
          })
        if ((detailsJson as any).cpContactPerson)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Contact Person',
            value: (detailsJson as any).cpContactPerson,
          })
        if ((detailsJson as any).cpEmail)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Email',
            value: (detailsJson as any).cpEmail,
          })
        if ((detailsJson as any).cpPhone)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Phone',
            value: (detailsJson as any).cpPhone,
          })
        if ((detailsJson as any).cpAddress)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Address',
            value: (detailsJson as any).cpAddress,
          })
        if ((detailsJson as any).cpLicenseNumber)
          dynamicDetails.push({
            gridSize: 3,
            label: 'License Number',
            value: (detailsJson as any).cpLicenseNumber,
          })
        if ((detailsJson as any).cpRegistrationDate)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Registration Date',
            value: (detailsJson as any).cpRegistrationDate,
          })
      }

      // Payments specific fields
      if (activeTab === 'payments' || currentModuleName === 'PAYMENTS') {
        if ((detailsJson as any).paymentId)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Payment ID',
            value: (detailsJson as any).paymentId,
          })
        if ((detailsJson as any).recipientName)
          dynamicDetails.push({
            gridSize: 6,
            label: 'Recipient Name',
            value: (detailsJson as any).recipientName,
          })
        if ((detailsJson as any).paymentAmount)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Payment Amount',
            value: (detailsJson as any).paymentAmount,
          })
        if ((detailsJson as any).paymentCurrency)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Currency',
            value: (detailsJson as any).paymentCurrency,
          })
        if ((detailsJson as any).paymentMethod)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Payment Method',
            value: (detailsJson as any).paymentMethod,
          })
        if ((detailsJson as any).bankAccount)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Bank Account',
            value: (detailsJson as any).bankAccount,
          })
        if ((detailsJson as any).routingNumber)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Routing Number',
            value: (detailsJson as any).routingNumber,
          })
        if ((detailsJson as any).paymentDate)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Payment Date',
            value: (detailsJson as any).paymentDate,
          })
        if ((detailsJson as any).paymentStatus)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Payment Status',
            value: (detailsJson as any).paymentStatus,
          })
        if ((detailsJson as any).transactionReference)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Transaction Reference',
            value: (detailsJson as any).transactionReference,
          })
      }

      // Surety Bond specific fields
      if (activeTab === 'suretyBond' || currentModuleName === 'SURETY_BOND') {
        if ((detailsJson as any).bondId)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Bond ID',
            value: (detailsJson as any).bondId,
          })
        if ((detailsJson as any).bondName)
          dynamicDetails.push({
            gridSize: 6,
            label: 'Bond Name',
            value: (detailsJson as any).bondName,
          })
        if ((detailsJson as any).bondType)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Bond Type',
            value: (detailsJson as any).bondType,
          })
        if ((detailsJson as any).bondAmount)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Bond Amount',
            value: (detailsJson as any).bondAmount,
          })
        if ((detailsJson as any).bondCurrency)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Currency',
            value: (detailsJson as any).bondCurrency,
          })
        if ((detailsJson as any).bondStartDate)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Start Date',
            value: (detailsJson as any).bondStartDate,
          })
        if ((detailsJson as any).bondEndDate)
          dynamicDetails.push({
            gridSize: 3,
            label: 'End Date',
            value: (detailsJson as any).bondEndDate,
          })
        if ((detailsJson as any).bondStatus)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Bond Status',
            value: (detailsJson as any).bondStatus,
          })
        if ((detailsJson as any).issuerName)
          dynamicDetails.push({
            gridSize: 6,
            label: 'Issuer Name',
            value: (detailsJson as any).issuerName,
          })
        if ((detailsJson as any).beneficiaryName)
          dynamicDetails.push({
            gridSize: 6,
            label: 'Beneficiary Name',
            value: (detailsJson as any).beneficiaryName,
          })
      }

      // Build Partner Asset specific fields
      if (
        activeTab === 'buildPartnerAsset' ||
        currentModuleName === 'BUILD_PARTNER_ASSET'
      ) {
        if ((detailsJson as any).assetId)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Asset ID',
            value: (detailsJson as any).assetId,
          })
        if ((detailsJson as any).assetName)
          dynamicDetails.push({
            gridSize: 6,
            label: 'Asset Name',
            value: (detailsJson as any).assetName,
          })
        if ((detailsJson as any).assetType)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Asset Type',
            value: (detailsJson as any).assetType,
          })
        if ((detailsJson as any).assetValue)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Asset Value',
            value: (detailsJson as any).assetValue,
          })
        if ((detailsJson as any).assetLocation)
          dynamicDetails.push({
            gridSize: 4,
            label: 'Asset Location',
            value: (detailsJson as any).assetLocation,
          })
        if ((detailsJson as any).assetStatus)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Asset Status',
            value: (detailsJson as any).assetStatus,
          })
        if ((detailsJson as any).ownerName)
          dynamicDetails.push({
            gridSize: 6,
            label: 'Owner Name',
            value: (detailsJson as any).ownerName,
          })
        if ((detailsJson as any).registrationDate)
          dynamicDetails.push({
            gridSize: 3,
            label: 'Registration Date',
            value: (detailsJson as any).registrationDate,
          })
      }
    }

    return [...baseDetails, ...dynamicDetails]
  }, [
    currentWorkflowData,
    currentLogEntry,
    transactionId,
    activeTab,
    TAB_TO_MODULE_MAP,
  ])

  const auditTrail = useMemo(() => {
    if (!workflowRequestLogsData?.content && !currentWorkflowData) {
      return [
        {
          action: 'Loading...',
          user: 'Loading...',
          timestamp: 'Loading...',
        },
      ]
    }

    if (
      workflowRequestLogsData?.content &&
      workflowRequestLogsData.content.length > 0
    ) {
      return workflowRequestLogsData.content
        .sort(
          (a, b) =>
            new Date(a.eventAt).getTime() - new Date(b.eventAt).getTime()
        )
        .map((log) => {
          const displayUser =
            resolveUserName(log.eventByUser) || log.eventByGroup || 'System'

          const isApprovalAction =
            log.eventType?.toLowerCase().includes('approve') ||
            log.eventType?.toLowerCase().includes('approved') ||
            log.eventType?.toLowerCase().includes('approval')

          let userRole = 'Unknown'
          if (log.eventByGroup) {
            userRole = log.eventByGroup
          } else if (log.eventType?.toLowerCase().includes('maker')) {
            userRole = 'ROLE_MAKER'
          } else if (
            log.eventType?.toLowerCase().includes('checker') ||
            log.eventType?.toLowerCase().includes('approval')
          ) {
            userRole = 'ROLE_CHECKER'
          }

          return {
            id: log.id,
            action: log.eventType || 'Unknown Event',
            user: displayUser,
            group: log.eventByGroup,
            role: userRole,
            isApproval: isApprovalAction,
            timestamp: log.eventAt
              ? new Date(log.eventAt).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              : 'N/A',
            rawTimestamp: log.eventAt,
            details: log.detailsJson || {},
            workflowRequestId: log.workflowRequestDTO?.id,
            referenceId: log.workflowRequestDTO?.referenceId,
            moduleName: log.workflowRequestDTO?.moduleName,
            actionKey: log.workflowRequestDTO?.actionKey,
          }
        })
    }

    if (currentWorkflowData) {
      return [
        {
          action: 'Request Created',
          user: currentWorkflowData.createdBy || 'System',
          timestamp: currentWorkflowData.createdAt
            ? new Date(currentWorkflowData.createdAt).toLocaleString()
            : '-',
        },
        {
          action: 'Current Stage',
          user: `Stage ${currentWorkflowData.currentStageOrder || 1}`,
          timestamp: currentWorkflowData.lastUpdatedAt
            ? new Date(currentWorkflowData.lastUpdatedAt).toLocaleString()
            : 'Pending',
        },
      ]
    }

    return []
  }, [workflowRequestLogsData, currentWorkflowData, resolveUserName])

  const handleApprove = () => {
    const currentStage = workflowRequestData?.currentStageOrder
      ? `Stage ${workflowRequestData.currentStageOrder}`
      : 'Unknown'

    const currentStep = dynamicSteps[activeStep]
    const currentStepLabel =
      typeof currentStep === 'string' ? currentStep : currentStep?.label

    const userRoles = getCurrentUserRoles()
    const isMaker = hasRole('ROLE_MAKER')
    const isChecker = hasRole('ROLE_CHECKER')

    const isCheckerStage =
      currentStage === 'Stage 2' ||
      currentStage === 'Stage 3' ||
      currentStage === '2' ||
      currentStage === '3' ||
      currentStepLabel.toLowerCase().includes('checker') ||
      currentStepLabel.toLowerCase().includes('approval')

    if (isMaker && isCheckerStage) {
      showPermissionDeniedModal(
        `Permission Denied! Your role is ROLE_MAKER but you're trying to approve at ${currentStepLabel} (CHECKER stage). Only ROLE_CHECKER can approve CHECKER stages.`
      )
      return
    }

    const isMakerStage =
      currentStage === 'Stage 1' ||
      currentStage === '1' ||
      currentStepLabel.toLowerCase().includes('maker') ||
      currentStepLabel.toLowerCase().includes('initiation')

    if (isChecker && isMakerStage) {
      showPermissionDeniedModal(
        `Permission Denied! Your role is ROLE_CHECKER but you're trying to approve at ${currentStepLabel} (MAKER stage). Only ROLE_MAKER can approve MAKER stages.`
      )
      return
    }

    const permission = validateRolePermission('approve', currentStage)

    if (!permission.allowed) {
      alert(permission.message)
      return
    }

    setActionType('approve')
    setModalOpen(true)
  }

  const handleReject = () => {
    const currentStage = workflowRequestData?.currentStageOrder
      ? `Stage ${workflowRequestData.currentStageOrder}`
      : 'Unknown'

    // Get the current active step from the stepper
    const currentStep = dynamicSteps[activeStep]
    const currentStepLabel =
      typeof currentStep === 'string' ? currentStep : currentStep?.label

    const userRoles = getCurrentUserRoles()
    const isMaker = hasRole('ROLE_MAKER')
    const isChecker = hasRole('ROLE_CHECKER')

    const isCheckerStage =
      currentStage === 'Stage 2' ||
      currentStage === 'Stage 3' ||
      currentStage === '2' ||
      currentStage === '3' ||
      currentStepLabel.toLowerCase().includes('checker') ||
      currentStepLabel.toLowerCase().includes('approval')

    if (isMaker && isCheckerStage) {
      showPermissionDeniedModal(
        `Permission Denied! Your role is ROLE_MAKER but you're trying to reject at ${currentStepLabel} (CHECKER stage). Only ROLE_CHECKER can reject CHECKER stages.`
      )
      return
    }

    const isMakerStage =
      currentStage === 'Stage 1' ||
      currentStage === '1' ||
      currentStepLabel.toLowerCase().includes('maker') ||
      currentStepLabel.toLowerCase().includes('initiation')

    if (isChecker && isMakerStage) {
      showPermissionDeniedModal(
        `Permission Denied! Your role is ROLE_CHECKER but you're trying to reject at ${currentStepLabel} (MAKER stage). Only ROLE_MAKER can reject MAKER stages.`
      )
      return
    }

    const permission = validateRolePermission('reject', currentStage)

    if (!permission.allowed) {
      alert(permission.message)
      return
    }

    setActionType('reject')
    setModalOpen(true)
  }

  const getCurrentWorkflowStageId = useMemo(() => {
    if (
      !workflowRequestData?.workflowRequestStageDTOS ||
      !workflowRequestData?.currentStageOrder
    ) {
      return null
    }

    const currentStage = workflowRequestData.workflowRequestStageDTOS.find(
      (stage) => stage.stageOrder === workflowRequestData.currentStageOrder
    )

    return currentStage?.id || null
  }, [workflowRequestData])

  const isAllStepsCompleted = useMemo(() => {
    if (
      !workflowRequestData?.workflowRequestStageDTOS ||
      !workflowRequestData?.currentStageOrder
    ) {
      return false
    }

    const totalStages = workflowRequestData.workflowRequestStageDTOS.length
    const currentStageOrder = workflowRequestData.currentStageOrder

    return currentStageOrder >= totalStages
  }, [workflowRequestData])

  const canPerformAction = useMemo(() => {
    if (isAllStepsCompleted) {
      return false
    }

    const currentStage = workflowRequestData?.currentStageOrder
      ? `Stage ${workflowRequestData.currentStageOrder}`
      : 'Unknown'

    const currentStep = dynamicSteps[activeStep]
    const currentStepLabel =
      typeof currentStep === 'string' ? currentStep : currentStep?.label

    const userRoles = getCurrentUserRoles()
    const isMaker = hasRole('ROLE_MAKER')
    const isChecker = hasRole('ROLE_CHECKER')
    const isAdmin = hasRole('ROLE_ADMIN')

    if (isAdmin) {
      return true
    }

    const isCheckerStage =
      currentStage === 'Stage 2' ||
      currentStage === 'Stage 3' ||
      currentStage === '2' ||
      currentStage === '3' ||
      currentStepLabel.toLowerCase().includes('checker') ||
      currentStepLabel.toLowerCase().includes('approval')

    if (isMaker && isCheckerStage) {
      return false
    }

    const isMakerStage =
      currentStage === 'Stage 1' ||
      currentStage === '1' ||
      currentStepLabel.toLowerCase().includes('maker') ||
      currentStepLabel.toLowerCase().includes('initiation')

    if (isChecker && isMakerStage) {
      return false
    }

    if (isMakerStage) {
      return isMaker
    }

    if (isCheckerStage) {
      return isChecker
    }

    return false
  }, [
    isAllStepsCompleted,
    workflowRequestData,
    getCurrentUserRoles,
    hasRole,
    dynamicSteps,
    activeStep,
  ])

  const getCurrentActiveStep = useMemo(() => {
    if (!workflowRequestData?.currentStageOrder) {
      return 0
    }

    return workflowRequestData.currentStageOrder - 1
  }, [workflowRequestData])

  const handleCommentSubmit = async (
    comment: string,
    type: 'approve' | 'reject'
  ) => {
    try {
      const workflowStageId = getCurrentWorkflowStageId

      if (!workflowStageId) {
        return
      }

      const { userId: currentUserId, userName: currentUserName } =
        getCurrentUserInfo()

      if (!currentUserId) {
        return
      }

      const userRoles = getCurrentUserRoles()
      const currentRole = userRoles.find((r) => r.startsWith('ROLE_'))

      const payload = {
        userId: String(currentUserId),
        remarks: comment.trim() || (type === 'approve' ? 'APPROVE' : 'REJECT'),
        decision: (type === 'approve' ? 'APPROVE' : 'REJECT') as
          | 'APPROVE'
          | 'REJECT',
        userRole: currentRole,
      }

      const response = await createWorkflowExecutionMutation.mutateAsync({
        workflowId: String(workflowStageId),
        data: payload,
      })

      if (type === 'approve') {
        const newStep = Math.min(activeStep + 1, dynamicSteps.length - 1)

        setActiveStep(newStep)
      }

      if (type === 'approve') {
        onApprove?.(transactionId, comment)
      } else {
        onReject?.(transactionId, comment)
      }

      setModalOpen(false)
      setComment('')
    } catch (error) {
      console.log(error)
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
            background: '#FFFFFFE5',
            boxShadow: '-8px 0px 8px 0px #62748E14',
            backdropFilter: 'blur(10px)',
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
          sx={{ display: 'flex', alignItems: 'flex-start', gap: 0, px: 0 }}
        >
          <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 600,
                color: '#1e293b',
                fontFamily: 'var(--font-outfit), system-ui, sans-serif',
              }}
            >
              {currentWorkflowData?.referenceType && (
                <h2 title="Transaction Details">
                  {formatReferenceType(currentWorkflowData.referenceType)}{' '}
                  Details :
                </h2>
              )}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 500,
                color: '#64748b',
                pt: 2,
                fontFamily: 'var(--font-outfit), system-ui, sans-serif',
              }}
            >
              {String()
              // (activeTab === 'buildPartner' && (currentWorkflowData?.payloadJson?.bpName || currentLogEntry?.detailsJson?.bpName)) ||
              // (activeTab === 'capitalPartner' && ((currentWorkflowData?.payloadJson as any)?.cpName || (currentLogEntry?.detailsJson as any)?.cpName)) ||
              // (activeTab === 'payments' && ((currentWorkflowData?.payloadJson as any)?.recipientName || (currentLogEntry?.detailsJson as any)?.recipientName)) ||
              // (activeTab === 'suretyBond' && ((currentWorkflowData?.payloadJson as any)?.bondName || (currentLogEntry?.detailsJson as any)?.bondName)) ||
              // (activeTab === 'buildPartnerAsset' && ((currentWorkflowData?.payloadJson as any)?.assetName || (currentLogEntry?.detailsJson as any)?.assetName))
              }
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CancelOutlinedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, pt: '16px', overflowY: 'auto' }}>
          {children ?? (
            <>
              <Section title="" fields={transactionDetails} />

              {currentLogEntry && (
                <Box sx={{ mt: 0 }}>
                  <span>{currentLogEntry.eventType}</span>
                </Box>
              )}

              <Box className="w-full h-px mt-3 bg-gray-800" />

              {/* Dynamic Stepper */}
              <Box sx={{ mt: 3 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {dynamicSteps.map((step, index) => {
                    const stepLabel =
                      typeof step === 'string' ? step : step.label
                    const stepOrder =
                      typeof step === 'string' ? 0 : step.stageOrder

                    const isInitiationStage = stepLabel
                      .toLowerCase()
                      .includes('initiation')
                    const isActive = index === activeStep
                    const isCompleted = isInitiationStage || index < activeStep

                    return (
                      <Step
                        key={`${typeof step === 'string' ? step : step.id}-${typeof step === 'string' ? 0 : step.stageOrder}`}
                        completed={isCompleted}
                        active={isActive}
                      >
                        <StepLabel>
                          <div>
                            <div
                              style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: isActive
                                  ? '#3b82f6'
                                  : isCompleted
                                    ? '#3b82f6'
                                    : '#1e293b',
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
                        color: '#1e293b',
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
                            new Date(b.eventAt).getTime() -
                            new Date(a.eventAt).getTime()
                        )
                        .map((log) => {
                          const displayUser =
                            resolveUserName(log.eventByUser) || 'N/A'

                          return (
                            <Box
                              key={log.id}
                              sx={{
                                p: 3,
                                mb: 2,
                                backgroundColor: '#ffffff',
                                borderRadius: 2,
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                              }}
                            >
                              <Box sx={{ mb: 1.5 }}>
                                <Typography
                                  sx={{
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#1e293b',
                                    fontFamily:
                                      'var(--font-outfit), system-ui, sans-serif',
                                  }}
                                >
                                  {log.eventType || 'Unknown Event'}
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
                                      color: '#64748b',
                                      fontFamily:
                                        'var(--font-outfit), system-ui, sans-serif',
                                      mb: 0.5,
                                    }}
                                  >
                                    Event By User
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: '14px',
                                      fontWeight: 600,
                                      color: '#1e293b',
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
                                      color: '#64748b',
                                      fontFamily:
                                        'var(--font-outfit), system-ui, sans-serif',
                                      mb: 0.5,
                                    }}
                                  >
                                    Event By Group
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: '14px',
                                      fontWeight: 600,
                                      color: '#1e293b',
                                      fontFamily:
                                        'var(--font-outfit), system-ui, sans-serif',
                                    }}
                                  >
                                    {log.eventByGroup || 'N/A'}
                                  </Typography>
                                </Box>

                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: '12px',
                                      fontWeight: 500,
                                      color: '#64748b',
                                      fontFamily:
                                        'var(--font-outfit), system-ui, sans-serif',
                                      mb: 0.5,
                                    }}
                                  >
                                    Event Date & Time
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: '14px',
                                      fontWeight: 600,
                                      color: '#1e293b',
                                      fontFamily:
                                        'var(--font-outfit), system-ui, sans-serif',
                                    }}
                                  >
                                    {log.eventAt
                                      ? new Date(log.eventAt).toLocaleString(
                                          'en-GB',
                                          {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                          }
                                        )
                                      : 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          )
                        })}
                    </Box>
                  </Box>
                )}
              {/* Audit trail */}
              <Box sx={{ mt: 2 }}>
                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: '#1e293b',
                    mb: 2,
                    fontFamily: 'var(--font-outfit), system-ui, sans-serif',
                  }}
                >
                  Audit Trail
                </Typography>
                <Box>
                  {auditTrail.map((item, index) => (
                    <Box
                      key={(item as any).id || index}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        backgroundColor: '#ffffff',
                        borderRadius: 2,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: (item as any).isApproval
                              ? '#3b82f6'
                              : '#9ca3af',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {(item as any).isApproval ? (
                            <Box
                              sx={{
                                width: 12,
                                height: 8,
                                border: '2px solid white',
                                borderTop: 'none',
                                borderRight: 'none',
                                transform: 'rotate(-45deg)',
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: 'white',
                              }}
                            />
                          )}
                        </Box>

                        {/* Action with Role */}
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography
                            sx={{
                              fontSize: '18px',
                              fontWeight: 600,
                              color: '#1e293b',
                              fontFamily:
                                'var(--font-outfit), system-ui, sans-serif',
                            }}
                          >
                            {item.action}
                          </Typography>
                          {(item as any).role &&
                            (item as any).role !== 'Unknown' && (
                              <Typography
                                sx={{
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: '#64748b',
                                  fontFamily:
                                    'var(--font-outfit), system-ui, sans-serif',
                                }}
                              >
                                Role: {(item as any).role}
                              </Typography>
                            )}
                        </Box>
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
                              color: '#64748b',
                              fontFamily:
                                'var(--font-outfit), system-ui, sans-serif',
                              mb: 0.5,
                            }}
                          >
                            User
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#1e293b',
                              fontFamily:
                                'var(--font-outfit), system-ui, sans-serif',
                            }}
                          >
                            {item.user || 'N/A'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#64748b',
                              fontFamily:
                                'var(--font-outfit), system-ui, sans-serif',
                              mb: 0.5,
                            }}
                          >
                            Group
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#1e293b',
                              fontFamily:
                                'var(--font-outfit), system-ui, sans-serif',
                            }}
                          >
                            {(item as any).group || 'N/A'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#64748b',
                              fontFamily:
                                'var(--font-outfit), system-ui, sans-serif',
                              mb: 0.5,
                            }}
                          >
                            Timestamp
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#1e293b',
                              fontFamily:
                                'var(--font-outfit), system-ui, sans-serif',
                            }}
                          >
                            {item.timestamp || 'Pending'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </>
          )}
        </DialogContent>

        <Box sx={{ mt: 'auto', pt: 1, display: 'flex', gap: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleApprove}
            disabled={!canPerformAction}
            sx={{
              backgroundColor: !canPerformAction ? '#9ca3af' : '#3b82f6',
              color: 'white',
              fontFamily: 'var(--font-outfit), system-ui, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: !canPerformAction ? '#9ca3af' : '#2563eb',
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                color: 'white',
              },
            }}
          >
            {isAllStepsCompleted ? 'Completed' : 'Approve'}
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleReject}
            disabled={!canPerformAction}
            sx={{
              backgroundColor: !canPerformAction ? '#9ca3af' : '#ef4444',
              color: 'white',
              fontFamily: 'var(--font-outfit), system-ui, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: !canPerformAction ? '#9ca3af' : '#dc2626',
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                color: 'white',
              },
            }}
          >
            {isAllStepsCompleted ? 'Completed' : 'Reject'}
          </Button>
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
              disabled:
                createWorkflowExecutionMutation.isPending || !comment.trim(),
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

        <CommentModal
          open={permissionDeniedModalOpen}
          onClose={handlePermissionDeniedModalClose}
          title="Permission Denied"
          subtitle="Access Restricted"
          actions={[
            {
              label: 'Go to Dashboard',
              color: 'primary',
              onClick: handlePermissionDeniedModalClose,
            },
          ]}
        >
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 500,
                color: '#ef4444',
                fontFamily: 'var(--font-outfit), system-ui, sans-serif',
                mb: 2,
              }}
            >
              {permissionDeniedMessage}
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                color: '#64748b',
                fontFamily: 'var(--font-outfit), system-ui, sans-serif',
              }}
            >
              You will be redirected to the dashboard.
            </Typography>
          </Box>
        </CommentModal>
      </Drawer>
    </>
  )
}
