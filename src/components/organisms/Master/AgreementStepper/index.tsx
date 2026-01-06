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
import { useAgreementStepStatus, useAgreementStepManager } from '@/hooks'
import { useCreateWorkflowRequest } from '@/hooks/workflow'
import { useAgreementLabelsWithCache } from '@/hooks'
import { getAgreementLabel } from '@/constants/mappings/master/Entity/agreementMapping'
import { useAppStore } from '@/store'
import type { AgreementDetailsData, Agreement, StepSaveResponse } from '@/services/api/masterApi/Entitie/agreementService'

// import { STEP_LABELS } from './constants' // replaced by dynamic labels
interface StepperProps {
  agreementId?: string
  initialStep?: number
  isViewMode?: boolean
}
import {
  useStepNotifications,
  useStepDataProcessing,
  useStepForm,
} from '../PartyStepper/hooks'
import { useStepValidation } from './hooks/useStepValidation'
import { Step1, Step3 } from './steps'
import DocumentUploadFactory from '../../DocumentUpload/DocumentUploadFactory'
import { DocumentItem } from '../PartyStepper/partyTypes'

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

export default function AgreementStepperWrapper({
  agreementId: propAgreementId,
  initialStep = 0,
  isViewMode: propIsViewMode,
}: StepperProps = {}) {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDarkMode = useIsDarkMode()
  
  // Get agreementId from props, URL params, or state
  const agreementId = propAgreementId || (params.id as string) || ''
  
  const [activeStep, setActiveStep] = useState(initialStep)
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Check if we're in view mode (read-only)
  // Use prop if provided, otherwise read from URL params (backward compatibility)
  const mode = searchParams.get('mode')
  const isViewMode =
    propIsViewMode !== undefined ? propIsViewMode : mode === 'view'

  const notifications = useStepNotifications()
  const dataProcessing = useStepDataProcessing()
  const { methods, formState, setShouldResetForm } = useStepForm(
    agreementId,
    activeStep
  )
  const stepManager = useAgreementStepManager()
  const validation = useStepValidation()
  const createWorkflowRequest = useCreateWorkflowRequest()

  // Dynamic step labels (API-driven with fallback to static mapping)
  const { data: agreementLabels, getLabel } =
    useAgreementLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getAgreementLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAgreementLabel(configId)
      if (agreementLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [agreementLabels, currentLanguage, getLabel]
  )

  // Define steps array (direct mapping for clarity)
  const steps = useMemo(
    () => [
      getAgreementLabelDynamic('CDL_AGREEMENT_DETAILS'),
      'Documents (Optional)',
      'Review',
    ],
    [getAgreementLabelDynamic]
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

  // Only fetch step status if we have a valid agreementId (not for new agreements on Step 1)
  const { data: stepStatus } = useAgreementStepStatus(
    agreementId && agreementId.trim() !== '' ? agreementId : ''
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
          return <Step1 isReadOnly={isViewMode} agreementId={agreementId} />
        case 1:
          // Documents step - use DocumentUploadFactory
          return (
            <DocumentUploadFactory
              type="AGREEMENT"
              entityId={agreementId || ''}
              isOptional={true}
              onDocumentsChange={handleDocumentsChange}
              formFieldName="documents"
              isReadOnly={isViewMode}
            />
          )
        case 2:
          // Review step - show agreement details and documents
          // Ensure agreementId is passed correctly
          return (
            <Step3
              key={`review-${agreementId}-${activeStep}`}
              agreementId={agreementId}
              onEditStep={handleEditStep}
              isReadOnly={isViewMode}
            />
          )
        default:
          return null
      }
    },
    [agreementId, isViewMode, handleEditStep, handleDocumentsChange, activeStep]
  )

  // Set editing mode based on URL parameter or developerId
  useEffect(() => {
    const editing = searchParams.get('editing')
    // If editing=true in URL, set editing mode
    if (editing === 'true') {
      setIsEditingMode(true)
    }
    // If there's an agreementId but no view mode, it's also editing mode
    else if (agreementId && !isViewMode) {
      setIsEditingMode(true)
    }
    // If no agreementId and no editing param, it's create mode
    else if (!agreementId) {
      setIsEditingMode(false)
    }
  }, [searchParams, agreementId, isViewMode])

  // Helper function to build mode parameter for navigation (matching capital partner pattern)
  const getModeParam = useCallback(() => {
    if (isViewMode) return '?mode=view'
    if (isEditingMode) return '?editing=true'
    return ''
  }, [isViewMode, isEditingMode])

  useEffect(() => {
    // Only process step data if we have agreementId and stepStatus
    // Skip processing for Review step (Step 3) as it loads its own data
    if (
      activeStep !== 2 && // Don't process data for Review step
      agreementId &&
      agreementId.trim() !== '' &&
      dataProcessing.shouldProcessStepData(
        stepStatus,
        agreementId,
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
        // Don't throw - allow component to continue rendering
      }
    }
  }, [activeStep, stepStatus, agreementId, setShouldResetForm, dataProcessing, formState.shouldResetForm, methods])

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
            `/agreement/${agreementId}/step/${nextUrlStep}?mode=view`
          )
        } else {
          router.push('/agreement')
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
          
          // Ensure we have agreementId before navigating
          if (!agreementId) {
            notifications.showError('Agreement ID is required to proceed to Review step.')
            setIsSaving(false)
            return
          }
          
          const nextUrl = `/agreement/${agreementId}/step/${nextUrlStep}${modeParam}`
          router.push(nextUrl)
          // Update local state to match navigation
          setActiveStep(nextStep)
        } else {
          router.push('/agreement')
        }
        setIsSaving(false)
        return
      }

      // Review step (step 3) - complete the process and submit workflow request
      // This should ONLY run when clicking "Save and Next" ON the Review step itself
      if (activeStep === 2) {
        // Check if we're in view mode - if so, just navigate away
        if (isViewMode) {
          router.push('/agreement')
          setIsSaving(false)
          return
        }

        try {
          // Get the agreement ID - prefer from URL/state, fallback to step status
          const agreementIdFromStatus =
            stepStatus?.stepData?.step1?.id?.toString()
          const finalAgreementId = agreementId || agreementIdFromStatus

          if (!finalAgreementId) {
            notifications.showError(
              'Agreement ID not found. Please complete Step 1 first.'
            )
            setIsSaving(false)
            return
          }

          // Get step1 form data for workflow request
          const step1Data = stepStatus?.stepData?.step1

          if (!step1Data) {
            notifications.showError(
                'Agreement data not found. Please complete Step 1 first.'
            )
            setIsSaving(false)
            return
          }

          // Submit workflow request with only step1 data
          await createWorkflowRequest.mutateAsync({
            referenceId: finalAgreementId,
            referenceType: 'AGREEMENT',
            moduleName: 'AGREEMENT',
            actionKey: 'APPROVE',
            payloadJson: step1Data as unknown as Record<string, unknown>,
          })

          notifications.showSuccess(
            'Agreement registration submitted successfully! Workflow request created.'
          )
          setIsSaving(false)
          // Small delay before redirect to ensure success message is visible
          setTimeout(() => {
          router.push('/agreement')
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

      // Trigger form validation
      const isFormValid = await methods.trigger()

      if (!isFormValid) {
        // Get all form errors for better error messaging
        const formErrors = methods.formState.errors
        const errorFields = Object.keys(formErrors)
        const errorMessages = errorFields.map(field => {
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
      const currentFormData = methods.getValues() as unknown as Record<string, unknown>
      
      // For agreement, we use form data directly (no transformation needed)
      let stepSpecificData: unknown = currentFormData

      // For step 1, extract only the relevant fields
      if (activeStep === 0) {
        const step1Data: AgreementDetailsData = {
          primaryEscrowCifNumber: currentFormData.primaryEscrowCifNumber as string,
          productManagerName: currentFormData.productManagerName as string,
          clientName: currentFormData.clientName as string,
          relationshipManagerName: currentFormData.relationshipManagerName as string,
          operatingLocationCode: currentFormData.operatingLocationCode as string,
          customField1: currentFormData.customField1 as string | undefined,
          customField2: currentFormData.customField2 as string | undefined,
          customField3: currentFormData.customField3 as string | undefined,
          customField4: currentFormData.customField4 as string | undefined,
          active: currentFormData.active !== undefined 
            ? (typeof currentFormData.active === 'boolean' 
                ? currentFormData.active 
                : currentFormData.active === 'true' || currentFormData.active === true)
            : true, // Default to true if not provided
          agreementParametersDTO: currentFormData.agreementParametersDTO as { id: number } | number | null | undefined,
          agreementFeeDTO: currentFormData.agreementFeeDTO as { id: number } | number | null | undefined,
          clientNameDTO: currentFormData.clientNameDTO as { id: number } | number | null | undefined,
          businessSegmentDTO: currentFormData.businessSegmentDTO as { id: number } | number | null | undefined,
          businessSubSegmentDTO: currentFormData.businessSubSegmentDTO as { id: number } | number | null | undefined,
          dealStatusDTO: currentFormData.dealStatusDTO as { id: number } | number | null | undefined,
          feesDTO: currentFormData.feesDTO as { id: number } | number | null | undefined,
          dealTypeDTO: currentFormData.dealTypeDTO as { id: number } | number | null | undefined,
          dealSubTypeDTO: currentFormData.dealSubTypeDTO as { id: number } | number | null | undefined,
          productProgramDTO: currentFormData.productProgramDTO as { id: number } | number | null | undefined,
          dealPriorityDTO: currentFormData.dealPriorityDTO as { id: number } | number | null | undefined,
        }
        
        // Always include enabled and deleted fields
        // For new agreements: enabled=true, deleted=false
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
        agreementId
      )

      notifications.showSuccess('Step saved successfully!')

      // Navigate to next step
      if (activeStep < steps.length - 1) {
        // For Step 1, we need to get the Agreement ID from the API response and navigate to dynamic route
        if (activeStep === 0) {
          // Step 1 just saved, get the Agreement ID from the API response
          // The API returns Agreement object directly with id property (based on service update)
          const saveResponseData = saveResponse as Agreement | StepSaveResponse
          
          let savedAgreementId: string | number | undefined
          
          // Check if response is Agreement object (has id directly) - this is the expected format
          if ('id' in saveResponseData && saveResponseData.id !== undefined && saveResponseData.id !== null) {
            savedAgreementId = String(saveResponseData.id)
          } 
          // Fallback: Check if response is StepSaveResponse (has data property)
          else if ('data' in saveResponseData && saveResponseData.data) {
            const data = saveResponseData.data
            if (typeof data === 'object' && data !== null && 'id' in data) {
              const idValue = (data as Agreement).id
              if (idValue !== undefined && idValue !== null) {
                savedAgreementId = String(idValue)
              }
            }
          }

          if (savedAgreementId) {
            // Navigate to Step 2 using the dynamic route with the Agreement ID from backend
            const nextUrl = `/agreement/${savedAgreementId}/step/2${getModeParam()}`
            router.push(nextUrl)
            // Also update local state to ensure UI is in sync
            setActiveStep(1)
          } else {
            // Fallback: try to use existing agreementId if available
            if (agreementId) {
              const nextUrl = `/agreement/${agreementId}/step/2${getModeParam()}`
              router.push(nextUrl)
              setActiveStep(1)
            } else {
              // Last resort: update local state only
              setActiveStep((prev: number) => prev + 1)
            }
          }
        } else if (agreementId) {
            // For other steps, use the existing Agreement ID
          const nextStep = activeStep + 1
          const nextUrl = `/agreement/${agreementId}/step/${nextStep + 1}${getModeParam()}`
          router.push(nextUrl)
          // Also update local state
          setActiveStep(nextStep)
        } else {
          // Fallback to local state if no Agreement ID
          setActiveStep((prev) => prev + 1)
        }
      } else {
        // If this is the last step, redirect to agreement list
        router.push('/agreement')
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
    if (activeStep > 0 && agreementId) {
      const previousStep = activeStep - 1
      setActiveStep(previousStep)
      // Navigate to the previous step URL with mode parameter
      router.push(
        `/agreement/${agreementId}/step/${previousStep + 1}${getModeParam()}`
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
              onClick={() => router.push('/agreement')}
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
