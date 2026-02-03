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
import { FormProvider, type FieldErrors } from 'react-hook-form'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import {
  useAgreementFeeSchedule,
  useAgreementFeeScheduleStepStatus,
  useAgreementFeeScheduleStepManager,
} from '@/hooks'
import { useCreateWorkflowRequest } from '@/hooks/workflow'
import { useAgreementFeeScheduleLabelsWithCache } from '@/hooks'
import { getAgreementFeeScheduleLabel } from '@/constants/mappings/master/Entity/agreementFeeScheduleMapping'
import { useAppStore } from '@/store'
import type { AgreementFeeScheduleDetailsData, AgreementFeeSchedule, StepSaveResponse } from '@/services/api/masterApi/Entitie/agreementFeeScheduleService'

interface StepperProps {
  agreementFeeScheduleId?: string
  initialStep?: number
  isViewMode?: boolean
}
import { useStepNotifications, useStepForm } from "../PartyStepper/hooks";
import { useStepValidation } from './hooks/useStepValidation'
import { Step1, Step2 } from './steps'
import DocumentUploadFactory from '../../DocumentUpload/DocumentUploadFactory'
import { DocumentItem } from "../PartyStepper/partyTypes";

// Hook to detect dark mode
const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkTheme()

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return isDark
}

export default function AgreementFeeScheduleStepperWrapper({
  agreementFeeScheduleId: propAgreementFeeScheduleId,
  initialStep = 0,
  isViewMode: propIsViewMode,
}: StepperProps = {}) {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDarkMode = useIsDarkMode()
  
  // Get agreementFeeScheduleId from props, URL params, or state
  const agreementFeeScheduleId = propAgreementFeeScheduleId || (params.id as string) || ''
  
  const [activeStep, setActiveStep] = useState(initialStep)
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isStepValidating, setIsStepValidating] = useState(false)

  // Check if we're in view mode (read-only)
  // Use prop if provided, otherwise read from URL params (backward compatibility)
  const mode = searchParams.get('mode')
  const isViewMode =
    propIsViewMode !== undefined ? propIsViewMode : mode === 'view'

  const notifications = useStepNotifications()
  const { methods, formState, setShouldResetForm } = useStepForm(
    agreementFeeScheduleId,
    activeStep
  )
  const stepManager = useAgreementFeeScheduleStepManager()
  const { data: agreementFeeScheduleDetails } = useAgreementFeeSchedule(
    agreementFeeScheduleId && agreementFeeScheduleId.trim() !== '' ? agreementFeeScheduleId : ''
  )
  const validation = useStepValidation()
  const createWorkflowRequest = useCreateWorkflowRequest()

  // Dynamic step labels (API-driven with fallback to static mapping)
  const { data: agreementFeeScheduleLabels, getLabel } =
    useAgreementFeeScheduleLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getAgreementFeeScheduleLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAgreementFeeScheduleLabel(configId)
      if (agreementFeeScheduleLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [agreementFeeScheduleLabels, currentLanguage, getLabel]
  )

  // Define steps array (direct mapping for clarity)
  const steps = useMemo(
    () => [
      getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_DETAILS'),
      'Documents (Optional)',
      'Review',
    ],
    [getAgreementFeeScheduleLabelDynamic]
  )

  // Edit navigation handler
  const handleEditStep = useCallback(
    (stepNumber: number) => {
      setActiveStep(stepNumber)
      setIsEditingMode(true) // Set editing mode when coming from review
      setShouldResetForm(true)
      notifications.showSuccess(`Now editing step ${stepNumber + 1} data`)
    },
    [setShouldResetForm, notifications]
  )

  // Only fetch step status if we have a valid agreementFeeScheduleId (not for new fee schedules on Step 1)
  const { data: stepStatus } = useAgreementFeeScheduleStepStatus(
    agreementFeeScheduleId && agreementFeeScheduleId.trim() !== '' ? agreementFeeScheduleId : ''
  )

  // Handle documents change callback
  const handleDocumentsChange = useCallback(
    (documents: DocumentItem[]) => {
      methods.setValue('documents', documents)
    },
    [methods]
  )

  useEffect(() => {
    setActiveStep(initialStep)
  }, [initialStep])

  // Step content renderer
  const getStepContent = useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return <Step1 isReadOnly={isViewMode} agreementFeeScheduleId={agreementFeeScheduleId} />
        case 1:
          // Documents step - use DocumentUploadFactory
          return (
            <DocumentUploadFactory
              type="AGREEMENT_FEE_SCHEDULE"
              entityId={agreementFeeScheduleId || ''}
              isOptional={true}
              onDocumentsChange={handleDocumentsChange}
              formFieldName="documents"
              isReadOnly={isViewMode}
            />
          )
        case 2:
          // Review step - show agreement fee schedule details and documents
          // Ensure agreementFeeScheduleId is passed correctly
          return (
            <Step2
              key={`review-${agreementFeeScheduleId}-${activeStep}`}
              agreementFeeScheduleId={agreementFeeScheduleId}
              onEditStep={handleEditStep}
              isReadOnly={isViewMode}
            />
          )
        default:
          return null
      }
    },
    [agreementFeeScheduleId, isViewMode, handleEditStep, handleDocumentsChange, activeStep]
  )

  // Set editing mode based on URL parameter or agreementFeeScheduleId
  useEffect(() => {
    const editing = searchParams.get('editing')
    // If editing=true in URL, set editing mode
    if (editing === 'true') {
      setIsEditingMode(true)
    }
    // If there's an agreementFeeScheduleId but no view mode, it's also editing mode
    else if (agreementFeeScheduleId && !isViewMode) {
      setIsEditingMode(true)
    }
    // If no agreementFeeScheduleId and no editing param, it's create mode
    else if (!agreementFeeScheduleId) {
      setIsEditingMode(false)
    }
  }, [searchParams, agreementFeeScheduleId, isViewMode])

  // Helper function to build mode parameter for navigation (matching capital partner pattern)
  const getModeParam = useCallback(() => {
    if (isViewMode) return '?mode=view'
    if (isEditingMode) return '?editing=true'
    return ''
  }, [isViewMode, isEditingMode])

  const getErrorByPath = useCallback((errors: FieldErrors, path: string) => {
    return path.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[key]
      }
      return undefined
    }, errors)
  }, [])

  const findFirstErrorPath = useCallback((errors: FieldErrors, prefix = ''): string | null => {
    for (const [key, value] of Object.entries(errors)) {
      const currentPath = prefix ? `${prefix}.${key}` : key
      if (value && typeof value === 'object') {
        if ('message' in value || 'type' in value) {
          return currentPath
        }
        const nested = findFirstErrorPath(value as FieldErrors, currentPath)
        if (nested) return nested
      }
    }
    return null
  }, [])

  const scrollToFirstError = useCallback(() => {
    const errors = methods.formState.errors as FieldErrors
    const firstError = findFirstErrorPath(errors)
    if (!firstError || typeof document === 'undefined') return
    methods.setFocus(firstError as never)
    const fieldElement = document.querySelector(`[name="${firstError}"]`) as HTMLElement | null
    fieldElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [methods, findFirstErrorPath])

  const validateFormFields = useCallback(async () => {
    const isFormValid = await methods.trigger(undefined, { shouldFocus: false })
    if (!isFormValid) {
      notifications.showError(
        'Please fill in all required fields correctly before proceeding.'
      )
      scrollToFirstError()
    }
    return isFormValid
  }, [methods, notifications, scrollToFirstError])

  const stepConfigs = useMemo(
    () => ({
      0: {
        validateStep: async () => validateFormFields(),
      },
      1: {
        validateStep: async () => {
          if (!agreementFeeScheduleId) {
            notifications.showError(
              'Agreement Fee Schedule ID is required to proceed to Review step.'
            )
            return false
          }
          return true
        },
      },
      2: {
        validateStep: async () => {
          if (!stepStatus?.step1) {
            notifications.showError(
              'Please complete Agreement Fee Schedule details before continuing.'
            )
            return false
          }
          return true
        },
      },
    }),
    [validateFormFields, notifications, agreementFeeScheduleId, stepStatus?.step1]
  )

  const validateCurrentStep = useCallback(async () => {
    const stepConfig = stepConfigs[activeStep as keyof typeof stepConfigs]
    const validator = stepConfig?.validateStep
    if (!validator) return true
    setIsStepValidating(true)
    try {
      return await validator()
    } finally {
      setIsStepValidating(false)
    }
  }, [activeStep, stepConfigs])

  useEffect(() => {
    if (!agreementFeeScheduleId || !stepStatus) return
    const maxAllowedStep = stepStatus.step1 ? 2 : 0
    if (activeStep <= maxAllowedStep) return
    const querySuffix = isViewMode
      ? '?mode=view'
      : isEditingMode
        ? '?editing=true'
        : ''
    router.replace(
      `/agreement-fee-schedule/${agreementFeeScheduleId}/step/${maxAllowedStep + 1}${querySuffix}`
    )
    setActiveStep(maxAllowedStep)
    notifications.showError('Please complete previous steps before continuing.')
  }, [
    activeStep,
    agreementFeeScheduleId,
    stepStatus,
    router,
    isViewMode,
    isEditingMode,
    notifications,
  ])

  useEffect(() => {
    if (
      activeStep !== 0 ||
      !agreementFeeScheduleDetails ||
      !agreementFeeScheduleId ||
      agreementFeeScheduleId.trim() === '' ||
      !formState.shouldResetForm
    ) {
      return
    }

    try {
      methods.reset(agreementFeeScheduleDetails as unknown as Record<string, unknown>)
      setShouldResetForm(false)
    } catch {
      // Don't throw - allow component to continue rendering
    }
  }, [
    activeStep,
    agreementFeeScheduleDetails,
    agreementFeeScheduleId,
    formState.shouldResetForm,
    methods,
    setShouldResetForm,
  ])

  const handleSaveAndNext = async () => {
    try {
      notifications.clearNotifications()

      const canProceed = await validateCurrentStep()
      if (!canProceed) {
        return
      }

      setIsSaving(true)

      // In view mode, just navigate without saving
      if (isViewMode) {
        const nextStep = activeStep + 1
        if (nextStep < steps.length) {
          const nextUrlStep = nextStep + 1
          router.push(
            `/agreement-fee-schedule/${agreementFeeScheduleId}/step/${nextUrlStep}?mode=view`
          )
        } else {
          router.push('/agreement-fee-schedule')
        }
        return
      }

      // Documents (Optional) step doesn't need API call here - items are saved when "Add" is clicked
      // This step should skip ALL validation and just navigate
      if (activeStep === 1) {
        // For documents step, just navigate to next step without API call or validation
        const nextStep = activeStep + 1
        if (nextStep < steps.length) {
          // Convert 0-based activeStep to 1-based URL step
          const nextUrlStep = nextStep + 1
          // Preserve editing mode when navigating back to Review
          const modeParam = getModeParam()
          
          // Ensure we have agreementFeeScheduleId before navigating
          // Try to get ID from multiple sources: props, URL params, or state
          const finalAgreementFeeScheduleId = agreementFeeScheduleId || (params.id as string) || ''
          
          if (!finalAgreementFeeScheduleId || finalAgreementFeeScheduleId.trim() === '') {
            notifications.showError('Agreement Fee Schedule ID is required to proceed to Review step.')
            setIsSaving(false)
            return
          }
          
          const nextUrl = `/agreement-fee-schedule/${finalAgreementFeeScheduleId}/step/${nextUrlStep}${modeParam}`
          router.push(nextUrl)
          // Update local state to match navigation
          setActiveStep(nextStep)
        } else {
          router.push('/agreement-fee-schedule')
        }
        setIsSaving(false)
        return
      }

      // Review step (step 3) - complete the process and submit workflow request
      // This should ONLY run when clicking "Save & Next" ON the Review step itself
      if (activeStep === 2) {
        // Check if we're in view mode - if so, just navigate away
        if (isViewMode) {
          router.push('/agreement-fee-schedule')
          setIsSaving(false)
          return
        }

        try {
          // Get the agreement fee schedule ID - prefer from URL/state, fallback to step status
          const agreementFeeScheduleIdFromStatus =
            stepStatus?.stepData?.step1?.id?.toString()
          const finalAgreementFeeScheduleId = agreementFeeScheduleId || agreementFeeScheduleIdFromStatus

          if (!finalAgreementFeeScheduleId) {
            notifications.showError(
              'Agreement Fee Schedule ID not found. Please complete Step 1 first.'
            )
            setIsSaving(false)
            return
          }

          // Get step1 form data for workflow request
          const step1Data = stepStatus?.stepData?.step1

          if (!step1Data) {
            notifications.showError(
                'Agreement Fee Schedule data not found. Please complete Step 1 first.'
            )
            setIsSaving(false)
            return
          }

          // Submit workflow request with only step1 data
          await createWorkflowRequest.mutateAsync({
            referenceId: finalAgreementFeeScheduleId,
            referenceType: 'AGREEMENT_FEE_SCHEDULE',
            moduleName: 'AGREEMENT_FEE_SCHEDULE',
            actionKey: 'APPROVE',
            payloadJson: step1Data as unknown as Record<string, unknown>,
          })

          notifications.showSuccess(
            'Agreement Fee Schedule registration submitted successfully! Workflow request created.'
          )
          setIsSaving(false)
          // Small delay before redirect to ensure success message is visible
          setTimeout(() => {
          router.push('/agreement-fee-schedule')
          }, 500)
          return
        } catch (error) {
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

      // All other steps make API calls
      const currentFormData = methods.getValues() as unknown as Record<string, unknown>
      
      // For agreement fee schedule, we use form data directly (no transformation needed)
      let stepSpecificData: unknown = currentFormData

      // Helper function to convert dropdown string values to numbers
      const convertToDTOValue = (value: unknown): { id: number } | number | null | undefined => {
        if (!value || value === '' || value === null || value === undefined) {
          return null
        }
        // If already a number, return as is
        if (typeof value === 'number') {
          return value
        }
        // If it's a string, try to convert to number
        if (typeof value === 'string') {
          const numValue = parseInt(value, 10)
          if (!isNaN(numValue) && numValue > 0) {
            return numValue
          }
        }
        // If it's an object with id, return as is
        if (typeof value === 'object' && value !== null && 'id' in value) {
          return value as { id: number }
        }
        return null
      }

      // For step 1, extract only the relevant fields
      if (activeStep === 0) {
        const step1Data: AgreementFeeScheduleDetailsData = {
          regulatoryRefNo: currentFormData.regulatoryRefNo as string | null | undefined,
          effectiveStartDate: currentFormData.effectiveStartDate as string,
          effectiveEndDate: currentFormData.effectiveEndDate as string,
          operatingLocation: currentFormData.operatingLocation as string,
          priorityLevel: currentFormData.priorityLevel as string,
          transactionRateAmount: currentFormData.transactionRateAmount as string,
          debitAccountNumber: currentFormData.debitAccountNumber as string,
          creditAccountNumber: currentFormData.creditAccountNumber as string,
          active: currentFormData.active !== undefined 
            ? (typeof currentFormData.active === 'boolean' 
                ? currentFormData.active 
                : currentFormData.active === 'true' || currentFormData.active === true)
            : true, // Default to true if not provided
          feeDTO: convertToDTOValue(currentFormData.feeDTO),
          feeTypeDTO: convertToDTOValue(currentFormData.feeTypeDTO),
          feesFrequencyDTO: convertToDTOValue(currentFormData.feesFrequencyDTO),
          frequencyBasisDTO: convertToDTOValue(currentFormData.frequencyBasisDTO),
          agreementTypeDTO: convertToDTOValue(currentFormData.agreementTypeDTO),
          agreementSubTypeDTO: convertToDTOValue(currentFormData.agreementSubTypeDTO),
          productProgramDTO: convertToDTOValue(currentFormData.productProgramDTO),
          escrowAgreementDTO: currentFormData.escrowAgreementDTO as string | null | undefined,
        }
        
        // Always include enabled and deleted fields
        // For new agreement fee schedules: enabled=true, deleted=false
        // For editing: enabled=true, deleted=false (maintain existing state)
        stepSpecificData = {
          ...step1Data,
          enabled: true,
          deleted: false,
        }
      }

      // Enhanced validation with client-side and server-side validation
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
      const saveResponse = await stepManager.saveStep(
        activeStep + 1,
        stepSpecificData,
        isEditingMode,
        agreementFeeScheduleId
      )

      notifications.showSuccess('Step saved successfully!')

      // Navigate to next step
      if (activeStep < steps.length - 1) {
        // For Step 1, we need to get the Agreement Fee Schedule ID from the API response and navigate to dynamic route
        if (activeStep === 0) {
          // Step 1 just saved, get the Agreement Fee Schedule ID from the API response
          // The API returns AgreementFeeSchedule object directly with id property (based on service update)
          const saveResponseData = saveResponse as AgreementFeeSchedule | StepSaveResponse
          
          let savedAgreementFeeScheduleId: string | number | undefined
          
          // Check if response is AgreementFeeSchedule object (has id directly) - this is the expected format
          if ('id' in saveResponseData && saveResponseData.id !== undefined && saveResponseData.id !== null) {
            savedAgreementFeeScheduleId = String(saveResponseData.id)
          } 
          // Fallback: Check if response is StepSaveResponse (has data property)
          else if ('data' in saveResponseData && saveResponseData.data) {
            const data = saveResponseData.data
            if (typeof data === 'object' && data !== null && 'id' in data) {
              const idValue = (data as AgreementFeeSchedule).id
              if (idValue !== undefined && idValue !== null) {
                savedAgreementFeeScheduleId = String(idValue)
              }
            }
          }

          if (savedAgreementFeeScheduleId) {
            // Navigate to Step 2 using the dynamic route with the Agreement Fee Schedule ID from backend
            const nextUrl = `/agreement-fee-schedule/${savedAgreementFeeScheduleId}/step/2${getModeParam()}`
            router.push(nextUrl)
            // Also update local state to ensure UI is in sync
            setActiveStep(1)
          } else {
            // Fallback: try to use existing agreementFeeScheduleId if available
            if (agreementFeeScheduleId) {
              const nextUrl = `/agreement-fee-schedule/${agreementFeeScheduleId}/step/2${getModeParam()}`
              router.push(nextUrl)
              setActiveStep(1)
            } else {
              // Last resort: update local state only
              setActiveStep((prev: number) => prev + 1)
            }
          }
        } else if (agreementFeeScheduleId) {
            // For other steps, use the existing Agreement Fee Schedule ID
          const nextStep = activeStep + 1
          const nextUrl = `/agreement-fee-schedule/${agreementFeeScheduleId}/step/${nextStep + 1}${getModeParam()}`
          router.push(nextUrl)
          // Also update local state
          setActiveStep(nextStep)
        } else {
          // Fallback to local state if no Agreement Fee Schedule ID
          setActiveStep((prev) => prev + 1)
        }
      } else {
        // If this is the last step, redirect to agreement fee schedule list
        router.push('/agreement-fee-schedule')
        notifications.showSuccess('All steps completed successfully!')
      }
      
      // Ensure setIsSaving is called after navigation
      setIsSaving(false)
    } catch (error: unknown) {
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
    if (activeStep > 0 && agreementFeeScheduleId) {
      const previousStep = activeStep - 1
      setActiveStep(previousStep)
      // Navigate to the previous step URL with mode parameter
      router.push(
        `/agreement-fee-schedule/${agreementFeeScheduleId}/step/${previousStep + 1}${getModeParam()}`
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
            backgroundColor: isDarkMode
              ? '#101828'
              : 'rgba(255, 255, 255, 0.75)',
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
              onClick={() => router.push('/agreement-fee-schedule')}
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
                disabled={isSaving || isStepValidating}
                startIcon={
                  isSaving || isStepValidating ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
                sx={{
                  width: isSaving || isStepValidating ? '140px' : '114px',
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
                {isSaving || isStepValidating
                  ? isSaving
                    ? 'Saving...'
                    : 'Validating...'
                  : isViewMode
                    ? activeStep === steps.length - 1
                      ? 'Done'
                      : 'Next'
                    : activeStep === steps.length - 1
                      ? 'Complete'
                      : 'Save & Next'}
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
