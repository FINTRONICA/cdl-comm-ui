'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  Typography,
} from '@mui/material'
import { FormProvider } from 'react-hook-form'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import {
  useAgreementSignatoryStepStatus,
  useAgreementSignatoryStepManager,
} from '@/hooks'
import { useCreateWorkflowRequest } from '@/hooks/workflow'
import { useAgreementSignatoryLabelsWithCache } from '@/hooks'
import { getAgreementSignatoryLabel } from '@/constants/mappings/master/Entity/agreementSignatoryMapping'
import { useAppStore } from '@/store'
import type {
  AgreementSignatoryDetailsData,
  AgreementSignatory,
  StepSaveResponse,
} from '@/services/api/masterApi/Entitie/agreementSignatoryService'

interface StepperProps {
  agreementSignatoryId?: string
  initialStep?: number
  isViewMode?: boolean
}
import {
  useStepNotifications,
  useStepDataProcessing,
  useStepForm,
} from '../../DeveloperStepper/hooks'
import { useStepValidation } from './hooks/useStepValidation'
import { Step1, Step3 } from './steps'
import DocumentUploadFactory from '../../DocumentUpload/DocumentUploadFactory'
import { DocumentItem } from '../../DeveloperStepper/developerTypes'

// Hook to detect dark mode
const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return isDark
}

export default function AgreementSignatoryStepperWrapper({
  agreementSignatoryId: propAgreementSignatoryId,
  initialStep = 0,
  isViewMode: propIsViewMode,
}: StepperProps = {}) {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDarkMode = useIsDarkMode()

  // Get agreementSignatoryId from props, URL params, or state
  const agreementSignatoryId =
    propAgreementSignatoryId || (params.id as string) || ''

  const [activeStep, setActiveStep] = useState(initialStep)
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Check if we're in view mode (read-only)
  const mode = searchParams.get('mode')
  const isViewMode =
    propIsViewMode !== undefined ? propIsViewMode : mode === 'view'

  const notifications = useStepNotifications()
  const dataProcessing = useStepDataProcessing()
  const { methods, formState, setShouldResetForm } = useStepForm(
    agreementSignatoryId,
    activeStep
  )
  const stepManager = useAgreementSignatoryStepManager()
  const validation = useStepValidation()
  const createWorkflowRequest = useCreateWorkflowRequest()

  // Dynamic step labels (API-driven with fallback to static mapping)
  const { data: agreementSignatoryLabels, getLabel } =
    useAgreementSignatoryLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getAgreementSignatoryLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAgreementSignatoryLabel(configId)
      if (agreementSignatoryLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [agreementSignatoryLabels, currentLanguage, getLabel]
  )

  // Define steps array
  const steps = useMemo(
    () => [
      getAgreementSignatoryLabelDynamic('CDL_AGREEMENT_SIGNATORY_DETAILS'),
      'Documents (Optional)',
      'Review',
    ],
    [getAgreementSignatoryLabelDynamic]
  )

  // Edit navigation handler
  const handleEditStep = useCallback(
    (stepNumber: number) => {
      setActiveStep(stepNumber)
      setIsEditingMode(true)
      setShouldResetForm(true)
      notifications.showSuccess(`Now editing step ${stepNumber + 1} data`)
    },
    [setShouldResetForm, notifications]
  )

  // Only fetch step status if we have a valid agreementSignatoryId
  const { data: stepStatus } = useAgreementSignatoryStepStatus(
    agreementSignatoryId && agreementSignatoryId.trim() !== ''
      ? agreementSignatoryId
      : ''
  )

  // Handle documents change callback
  const handleDocumentsChange = useCallback(
    (documents: DocumentItem[]) => {
      methods.setValue('documents', documents)
    },
    [methods]
  )

  // Step content renderer
  const getStepContent = useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return (
            <Step1
              isReadOnly={isViewMode}
              agreementSignatoryId={agreementSignatoryId}
            />
          )
        case 1:
          // Documents step - use DocumentUploadFactory
          return (
            <DocumentUploadFactory
              type="AGREEMENT_SIGNATORY"
              entityId={agreementSignatoryId || ''}
              isOptional={true}
              onDocumentsChange={handleDocumentsChange}
              formFieldName="documents"
              isReadOnly={isViewMode}
            />
          )
        case 2:
          // Review step
          return (
            <Step3
              key={`review-${agreementSignatoryId}-${activeStep}`}
              agreementSignatoryId={agreementSignatoryId}
              onEditStep={handleEditStep}
              isReadOnly={isViewMode}
            />
          )
        default:
          return null
      }
    },
    [
      agreementSignatoryId,
      isViewMode,
      handleEditStep,
      handleDocumentsChange,
      activeStep,
    ]
  )

  // Set editing mode based on URL parameter or agreementSignatoryId
  useEffect(() => {
    const editing = searchParams.get('editing')
    if (editing === 'true') {
      setIsEditingMode(true)
    } else if (agreementSignatoryId && !isViewMode) {
      setIsEditingMode(true)
    } else if (!agreementSignatoryId) {
      setIsEditingMode(false)
    }
  }, [searchParams, agreementSignatoryId, isViewMode])

  // Helper function to build mode parameter for navigation
  const getModeParam = useCallback(() => {
    if (isViewMode) return '?mode=view'
    if (isEditingMode) return '?editing=true'
    return ''
  }, [isViewMode, isEditingMode])

  useEffect(() => {
    // Only process step data if we have agreementSignatoryId and stepStatus
    // Skip processing for Review step (Step 3) as it loads its own data
    if (
      activeStep !== 2 &&
      agreementSignatoryId &&
      agreementSignatoryId.trim() !== '' &&
      dataProcessing.shouldProcessStepData(
        stepStatus,
        agreementSignatoryId,
        formState.shouldResetForm
      )
    ) {
      try {
        const processedData = dataProcessing.processStepDataForForm({
          activeStep,
          stepStatus,
        })
        methods.reset(processedData)
        setShouldResetForm(false)
      } catch (error) {
        console.error(
          '[AgreementSignatoryStepper] Error processing step data:',
          error
        )
      }
    }
  }, [
    activeStep,
    stepStatus,
    agreementSignatoryId,
    setShouldResetForm,
    dataProcessing,
    formState.shouldResetForm,
    methods,
  ])

  const handleSaveAndNext = async () => {
    try {
      setIsSaving(true)
      notifications.clearNotifications()

      // In view mode, just navigate without saving
      if (isViewMode) {
        const nextStep = activeStep + 1
        if (nextStep < steps.length) {
          const nextUrlStep = nextStep + 1
          router.push(
            `/agreement-signatory/${agreementSignatoryId}/step/${nextUrlStep}?mode=view`
          )
        } else {
          router.push('/agreement-signatory')
        }
        return
      }

      // Documents step - skip validation and just navigate
      if (activeStep === 1) {
        const nextStep = activeStep + 1
        if (nextStep < steps.length) {
          const nextUrlStep = nextStep + 1
          const modeParam = getModeParam()

          if (!agreementSignatoryId) {
            notifications.showError(
              'Agreement Signatory ID is required to proceed to Review step.'
            )
            setIsSaving(false)
            return
          }

          const nextUrl = `/agreement-signatory/${agreementSignatoryId}/step/${nextUrlStep}${modeParam}`
          router.push(nextUrl)
          setActiveStep(nextStep)
        } else {
          router.push('/agreement-signatory')
        }
        setIsSaving(false)
        return
      }

      // Review step - submit workflow request
      if (activeStep === 2) {
        if (isViewMode) {
          router.push('/agreement-signatory')
          setIsSaving(false)
          return
        }

        try {
          const agreementSignatoryIdFromStatus =
            stepStatus?.stepData?.step1?.id?.toString()
          const finalAgreementSignatoryId =
            agreementSignatoryId || agreementSignatoryIdFromStatus

          if (!finalAgreementSignatoryId) {
            notifications.showError(
              'Agreement Signatory ID not found. Please complete Step 1 first.'
            )
            setIsSaving(false)
            return
          }

          const step1Data = stepStatus?.stepData?.step1

          if (!step1Data) {
            notifications.showError(
              'Agreement Signatory data not found. Please complete Step 1 first.'
            )
            setIsSaving(false)
            return
          }

          await createWorkflowRequest.mutateAsync({
            referenceId: finalAgreementSignatoryId,
            referenceType: 'AGREEMENT_SIGNATORY',
            moduleName: 'AGREEMENT_SIGNATORY',
            actionKey: 'CREATE',
            amount: 0,
            currency: 'USD',
            payloadJson: step1Data as unknown as Record<string, unknown>,
          })

          notifications.showSuccess(
            'Agreement Signatory registration submitted successfully! Workflow request created.'
          )
          setIsSaving(false)
          setTimeout(() => {
            router.push('/agreement-signatory')
          }, 500)
          return
        } catch (error) {
          console.error(
            '[AgreementSignatoryStepper] Error submitting workflow:',
            error
          )
          const errorData = error as {
            response?: { data?: { message?: string } }
            message?: string
          }
          const errorMessage =
            errorData?.response?.data?.message ||
            errorData?.message ||
            'Failed to submit workflow request. Please try again.'
          notifications.showError(errorMessage)
          setIsSaving(false)
          return
        }
      }

      // Trigger form validation
      const isFormValid = await methods.trigger()

      if (!isFormValid) {
        const formErrors = methods.formState.errors
        const errorFields = Object.keys(formErrors)
        const errorMessages = errorFields.map((field) => {
          const error = formErrors[field as keyof typeof formErrors]
          return error?.message || `${field} is invalid`
        })

        notifications.showError(
          errorMessages.length > 0
            ? `Please fix the following errors: ${errorMessages.join(', ')}`
            : 'Please fill in all required fields correctly before proceeding.'
        )
        setIsSaving(false)
        return
      }

      // All other steps make API calls
      const currentFormData = methods.getValues() as unknown as Record<
        string,
        unknown
      >

      let stepSpecificData: unknown = currentFormData

      // For step 1, extract only the relevant fields
      if (activeStep === 0) {
        const step1Data: AgreementSignatoryDetailsData = {
          partyReferenceNumber: currentFormData.partyReferenceNumber as
            | string
            | undefined,
          partyCustomerReferenceNumber:
            currentFormData.partyCustomerReferenceNumber as string | undefined,
          partyFullName: currentFormData.partyFullName as string,
          addressLine1: currentFormData.addressLine1 as string,
          addressLine2: currentFormData.addressLine2 as string | undefined,
          addressLine3: currentFormData.addressLine3 as string | undefined,
          signatoryRole: currentFormData.signatoryRole as string,
          notificationContactName: currentFormData.notificationContactName as
            | string
            | undefined,
          notificationAddressLine1: currentFormData.notificationAddressLine1 as
            | string
            | undefined,
          notificationAddressLine2: currentFormData.notificationAddressLine2 as
            | string
            | undefined,
          notificationAddressLine3: currentFormData.notificationAddressLine3 as
            | string
            | undefined,
          notificationEmailAddress: currentFormData.notificationEmailAddress as
            | string
            | undefined,
          associationType: currentFormData.associationType as
            | string
            | undefined,
          isEnabled:
            currentFormData.isEnabled !== undefined
              ? typeof currentFormData.isEnabled === 'boolean'
                ? currentFormData.isEnabled
                : currentFormData.isEnabled === 'true' ||
                  currentFormData.isEnabled === true
              : true,
          authorizedSignatoryDTO: currentFormData.authorizedSignatoryDTO as
            | { id: number }
            | number
            | null
            | undefined,
          partyDTO: currentFormData.partyDTO as
            | { id: number }
            | number
            | null
            | undefined,
          escrowAgreementDTO: currentFormData.escrowAgreementDTO as
            | { id: number }
            | number
            | null
            | undefined,
        }

        stepSpecificData = {
          ...step1Data,
          enabled: true,
          deleted: false,
        }
      }

      // Enhanced validation
      const validationResult = await validation.validateStepData(
        activeStep,
        stepSpecificData
      )

      if (!validationResult.isValid) {
        const errorPrefix =
          validationResult.source === 'client'
            ? 'Validation failed'
            : 'Server validation failed'
        const errorMessage = validationResult.errors?.length
          ? `${errorPrefix}: ${validationResult.errors.join(', ')}`
          : `${errorPrefix}. Please check the form for errors.`
        notifications.showError(errorMessage)
        setIsSaving(false)
        return
      }

      // Call the API to save the current step
      console.log('[AgreementSignatoryStepper] Saving step:', {
        step: activeStep + 1,
        data: stepSpecificData,
        isEditing: isEditingMode,
        agreementSignatoryId,
      })

      const saveResponse = await stepManager.saveStep(
        activeStep + 1,
        stepSpecificData,
        isEditingMode,
        agreementSignatoryId
      )

      notifications.showSuccess('Step saved successfully!')

      // Navigate to next step
      if (activeStep < steps.length - 1) {
        if (activeStep === 0) {
          const saveResponseData =
            saveResponse as AgreementSignatory | StepSaveResponse

          let savedAgreementSignatoryId: string | number | undefined

          if (
            'id' in saveResponseData &&
            saveResponseData.id !== undefined &&
            saveResponseData.id !== null
          ) {
            savedAgreementSignatoryId = String(saveResponseData.id)
          } else if ('data' in saveResponseData && saveResponseData.data) {
            const data = saveResponseData.data
            if (typeof data === 'object' && data !== null && 'id' in data) {
              const idValue = (data as AgreementSignatory).id
              if (idValue !== undefined && idValue !== null) {
                savedAgreementSignatoryId = String(idValue)
              }
            }
          }

          if (savedAgreementSignatoryId) {
            const nextUrl = `/agreement-signatory/${savedAgreementSignatoryId}/step/2${getModeParam()}`
            router.push(nextUrl)
            setActiveStep(1)
          } else if (agreementSignatoryId) {
            const nextUrl = `/agreement-signatory/${agreementSignatoryId}/step/2${getModeParam()}`
            router.push(nextUrl)
            setActiveStep(1)
          } else {
            setActiveStep((prev: number) => prev + 1)
          }
        } else if (agreementSignatoryId) {
          const nextStep = activeStep + 1
          const nextUrl = `/agreement-signatory/${agreementSignatoryId}/step/${nextStep + 1}${getModeParam()}`
          router.push(nextUrl)
          setActiveStep(nextStep)
        } else {
          setActiveStep((prev) => prev + 1)
        }
      } else {
        router.push('/agreement-signatory')
        notifications.showSuccess('All steps completed successfully!')
      }

      setIsSaving(false)
    } catch (error: unknown) {
      console.error('[AgreementSignatoryStepper] Error saving step:', error)
      const errorData = error as {
        response?: { data?: { message?: string } }
        message?: string
      }
      const errorMessage =
        errorData?.response?.data?.message ||
        errorData?.message ||
        'Failed to save step. Please try again.'
      notifications.showError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    if (activeStep > 0 && agreementSignatoryId) {
      const previousStep = activeStep - 1
      setActiveStep(previousStep)
      router.push(
        `/agreement-signatory/${agreementSignatoryId}/step/${previousStep + 1}${getModeParam()}`
      )
    }
  }

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          width: '100%',
          backgroundColor: isDarkMode ? '#101828' : 'rgba(255, 255, 255, 0.75)',
          borderRadius: '16px',
          paddingTop: '16px',
          border: isDarkMode
            ? '1px solid rgba(51, 65, 85, 1)'
            : '1px solid #FFFFFF',
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '100%',
                    letterSpacing: '0.36px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    textTransform: 'uppercase',
                    color: isDarkMode ? '#CBD5E1' : '#4A5565',
                  }}
                >
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box
          sx={{
            my: 4,
            backgroundColor: isDarkMode ? '#101828' : 'rgba(255, 255, 255, 0.75)',
            boxShadow: 'none',
          }}
        >
          {getStepContent(activeStep)}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 3,
              mx: 6,
              mb: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => router.push('/agreement-signatory')}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: 0,
                color: isDarkMode ? '#93C5FD' : '#155DFC',
                borderColor: isDarkMode ? '#334155' : '#CAD5E2',
                '&:hover': {
                  borderColor: isDarkMode ? '#475569' : '#93C5FD',
                  backgroundColor: isDarkMode
                    ? 'rgba(51, 65, 85, 0.3)'
                    : 'rgba(219, 234, 254, 0.3)',
                },
              }}
            >
              Cancel
            </Button>
            <Box>
              {activeStep !== 0 && (
                <Button
                  onClick={handleBack}
                  variant="outlined"
                  sx={{
                    width: '114px',
                    height: '36px',
                    gap: '6px',
                    opacity: 1,
                    paddingTop: '2px',
                    paddingRight: '3px',
                    paddingBottom: '2px',
                    paddingLeft: '3px',
                    borderRadius: '6px',
                    backgroundColor: isDarkMode
                      ? 'rgba(30, 58, 138, 0.5)'
                      : '#DBEAFE',
                    color: isDarkMode ? '#93C5FD' : '#155DFC',
                    border: 'none',
                    mr: 2,
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: 0,
                    '&:hover': {
                      backgroundColor: isDarkMode
                        ? 'rgba(30, 58, 138, 0.7)'
                        : '#BFDBFE',
                    },
                  }}
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleSaveAndNext}
                variant="contained"
                disabled={isSaving}
                startIcon={
                  isSaving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
                sx={{
                  width: isSaving ? '140px' : '114px',
                  height: '36px',
                  gap: '6px',
                  opacity: 1,
                  paddingTop: '2px',
                  paddingRight: '3px',
                  paddingBottom: '2px',
                  paddingLeft: '3px',
                  borderRadius: '6px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  boxShadow: 'none',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: 0,
                  '&.Mui-disabled': {
                    backgroundColor: '#93C5FD',
                    color: '#FFFFFF',
                  },
                  '&:hover': {
                    backgroundColor: '#1E40AF',
                  },
                }}
              >
                {isSaving
                  ? 'Saving...'
                  : isViewMode
                    ? activeStep === steps.length - 1
                      ? 'Done'
                      : 'Next'
                    : activeStep === steps.length - 1
                      ? 'Complete'
                      : 'Save and Next'}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Error and Success Notifications */}
        <Snackbar
          open={!!notifications.notifications.error}
          autoHideDuration={6000}
          onClose={notifications.clearNotifications}
        >
          <Alert
            onClose={notifications.clearNotifications}
            severity="error"
            sx={{ width: '100%' }}
          >
            {notifications.notifications.error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!notifications.notifications.success}
          autoHideDuration={6000}
          onClose={notifications.clearNotifications}
        >
          <Alert
            onClose={notifications.clearNotifications}
            severity="success"
            sx={{ width: '100%' }}
          >
            {notifications.notifications.success}
          </Alert>
        </Snackbar>
      </Box>
    </FormProvider>
  )
}


