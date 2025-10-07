'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Alert,
  Snackbar,
} from '@mui/material'
import { FormProvider } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBuildPartnerStepStatus, useBuildPartnerStepManager } from '@/hooks'
import { useCreateWorkflowRequest } from '@/hooks/workflow'

import { STEP_LABELS } from './constants'
import { StepperProps } from './types'
import {
  useStepNotifications,
  useStepDataProcessing,
  useStepForm,
  useStepValidation,
} from './hooks'
import { useStepContentRenderer } from './stepRenderer'
import { transformStepData, useStepDataTransformers } from './transformers'

export default function DeveloperStepperWrapper({
  developerId,
  initialStep = 0,
}: StepperProps = {}) {
  const [activeStep, setActiveStep] = useState(initialStep)
  const [isEditingMode, setIsEditingMode] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if we're in view mode (read-only)
  const mode = searchParams.get('mode')
  const isViewMode = mode === 'view'

  const notifications = useStepNotifications()
  const dataProcessing = useStepDataProcessing()
  const { methods, formState, setShouldResetForm } = useStepForm(
    developerId,
    activeStep
  )
  const stepManager = useBuildPartnerStepManager()
  const validation = useStepValidation()
  const createWorkflowRequest = useCreateWorkflowRequest()
  const transformers = useStepDataTransformers()

  // Define steps array
  const steps = STEP_LABELS

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

  const stepRenderer = useStepContentRenderer({
    activeStep,
    developerId: developerId || '',
    methods,
    onEditStep: handleEditStep,
    isReadOnly: isViewMode,
  })

  const { data: stepStatus } = useBuildPartnerStepStatus(developerId || '')

  // Set editing mode based on URL parameter
  useEffect(() => {
    const editing = searchParams.get('editing')
    if (editing === 'true') {
      setIsEditingMode(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (
      dataProcessing.shouldProcessStepData(
        stepStatus,
        developerId,
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
        throw error
      }
    }
  }, [activeStep, stepStatus, developerId, setShouldResetForm])

  const handleSaveAndNext = async () => {
    try {
      notifications.clearNotifications()

      // In view mode, just navigate without saving
      if (isViewMode) {
        const nextStep = activeStep + 1
        if (nextStep < steps.length) {
          const nextUrlStep = nextStep + 1
          router.push(`/developers/${developerId}/step/${nextUrlStep}?mode=view`)
        } else {
          router.push('/entities/developers')
        }
        return
      }

      // Documents (Optional), Contact, Fees, and Beneficiary steps don't need API call here - items are saved when "Add" is clicked
      if (
        activeStep === 1 ||
        activeStep === 2 ||
        activeStep === 3 ||
        activeStep === 4
      ) {
        // For these steps, just navigate to next step without API call
        const nextStep = activeStep + 1
        if (nextStep < steps.length) {
          // Convert 0-based activeStep to 1-based URL step
          const nextUrlStep = nextStep + 1
          router.push(`/developers/${developerId}/step/${nextUrlStep}`)
        } else {
          router.push('/entities/developers')
        }
        return
      }

      // Review step (step 5) - complete the process and submit workflow request
      if (activeStep === 5) {
        try {
          // Get the developer ID from step status
          const developerIdFromStatus =
            stepStatus?.stepData?.step1?.id?.toString()

          if (!developerIdFromStatus) {
            notifications.showError(
              'Developer ID not found. Please complete Step 1 first.'
            )
            return
          }

          // Get step1 form data for workflow request
          const step1Data = stepStatus?.stepData?.step1

          if (!step1Data) {
            notifications.showError(
              'Developer data not found. Please complete Step 1 first.'
            )
            return
          }

          // Submit workflow request with only step1 data (cast to Step1Data type)
          // await createWorkflowRequest.mutateAsync({
          //   developerId: developerIdFromStatus,
          //   step1Data: step1Data as any // Type assertion since the data structure matches
          // });

          await createWorkflowRequest.mutateAsync({
            referenceId: developerIdFromStatus,
            referenceType: 'BUILD_PARTNER',
            moduleName: 'BUILD_PARTNER',
            actionKey: 'CREATE',
            amount: 0,
            currency: 'USD',
            payloadJson: step1Data as unknown as Record<string, unknown>, // Developer step1 data structure
          })

          notifications.showSuccess(
            'Developer registration submitted successfully! Workflow request created.'
          )
          router.push('/entities/developers')
        } catch (error) {
          console.log(error)
          const errorData = error as {
            response?: { data?: { message?: string } }
            message?: string
          }
          const errorMessage =
            errorData?.response?.data?.message ||
            errorData?.message ||
            'Failed to submit workflow request. Please try again.'
          notifications.showError(errorMessage)
        }
        return
      }

      // All other steps make API calls
      const currentFormData = methods.getValues()
      const stepSpecificData = transformStepData(activeStep + 1, currentFormData, transformers)

      // Enhanced validation with client-side and server-side validation
      const validationResult = await validation.validateStepData(activeStep, stepSpecificData)

      if (!validationResult.isValid) {
        const errorPrefix =
          validationResult.source === 'client'
            ? 'Form validation failed'
            : 'Server validation failed'
        notifications.showError(`${errorPrefix}: ${validationResult.errors?.join(', ')}`)
        return
      }

      // Call the API to save the current step
      const saveResponse = await stepManager.saveStep(
        activeStep + 1,
        stepSpecificData,
        isEditingMode,
        developerId
      )

      notifications.showSuccess('Step saved successfully!')

      // Navigate to next step
      if (activeStep < steps.length - 1) {
        // For Step 1, we need to get the developer ID from the API response and navigate to dynamic route
        if (activeStep === 0) {
          // Step 1 just saved, get the developer ID from the API response
          const savedDeveloperId = (saveResponse as any)?.data?.id || (saveResponse as any)?.id

          if (savedDeveloperId) {
            // Navigate to Step 2 using the dynamic route with the ID from backend
            router.push(`/developers/${savedDeveloperId}/step/2`)
          } else {
            // Fallback to local state if no developer ID
            setActiveStep((prev) => prev + 1)
          }
        } else if (developerId) {
          // For other steps, use the existing developer ID
          const nextStep = activeStep + 1
          router.push(`/developers/${developerId}/step/${nextStep + 1}`)
        } else {
          // Fallback to local state
          setActiveStep((prev) => prev + 1)
        }
      } else {
        // If this is the last step, redirect to developers list
        router.push('/developers')
        notifications.showSuccess('All steps completed successfully!')
      }
    } catch (error: unknown) {
      console.error('Error saving step:', error)
      const errorData = error as {
        response?: { data?: { message?: string } }
        message?: string
      }
      const errorMessage =
        errorData?.response?.data?.message ||
        errorData?.message ||
        'Failed to save step. Please try again.'
      notifications.showError(errorMessage)
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      const previousStep = activeStep - 1
      setActiveStep(previousStep)
      // Navigate to the previous step URL with mode parameter
      const modeParam = isViewMode ? '?mode=view' : ''
      router.push(`/developers/${developerId}/step/${previousStep + 1}${modeParam}`)
    }
  }

  // Reset editing mode when starting fresh (no developerId)
  useEffect(() => {
    if (!developerId) {
      setIsEditingMode(false)
    }
  }, [developerId])

  return (
    <FormProvider {...methods}>
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEP_LABELS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>{stepRenderer.getStepContent(activeStep)}</Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep > 0 && (
              <Button
                onClick={handleBack}
                variant="outlined"
                sx={{
                  width: '114px',
                  height: '36px',
                  borderRadius: '6px',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: 0,
                }}
              >
                Back
              </Button>
            )}
            {activeStep === 0 && (
              <Button
                onClick={() => router.push('/entities/developers')}
                variant="outlined"
                sx={{
                  width: '114px',
                  height: '36px',
                  borderRadius: '6px',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: 0,
                  color: '#6B7280',
                  borderColor: '#D1D5DB',
                  '&:hover': {
                    borderColor: '#9CA3AF',
                    backgroundColor: '#F9FAFB',
                  },
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
          <Button
            onClick={handleSaveAndNext}
            variant="contained"
            sx={{
              width: '114px',
              height: '36px',
              borderRadius: '6px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: 0,
            }}
          >
            {isViewMode 
              ? (activeStep === STEP_LABELS.length - 1 ? 'Done' : 'Next')
              : (activeStep === STEP_LABELS.length - 1 ? 'Complete' : 'Save & Next')
            }
          </Button>
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
