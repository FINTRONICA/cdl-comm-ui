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
  useTheme,
  alpha,
} from '@mui/material'
import { FormProvider } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBuildPartnerStepStatus, useBuildPartnerStepManager } from '@/hooks'
import { useCreateWorkflowRequest } from '@/hooks/workflow'
import { useBuildPartnerLabelsWithCache } from '@/hooks/useBuildPartnerLabelsWithCache'
import { getBuildPartnerLabel } from '@/constants/mappings/buildPartnerMapping'
import { useAppStore } from '@/store'

// import { STEP_LABELS } from './constants' // replaced by dynamic labels
import { StepperProps } from './types'
import {
  useStepNotifications,
  useStepDataProcessing,
  useStepForm,
  useStepValidation,
} from './hooks'
import { useStepContentRenderer } from './stepRenderer'
import { transformStepData, useStepDataTransformers } from './transformers'

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

export default function DeveloperStepperWrapper({
  developerId,
  initialStep = 0,
  isViewMode: propIsViewMode,
}: StepperProps = {}) {
  const theme = useTheme()
  const [activeStep, setActiveStep] = useState(initialStep)
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDarkMode = useIsDarkMode()

  // Check if we're in view mode (read-only)
  // Use prop if provided, otherwise read from URL params (backward compatibility)
  const mode = searchParams.get('mode')
  const isViewMode =
    propIsViewMode !== undefined ? propIsViewMode : mode === 'view'

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

  // Dynamic step labels (API-driven with fallback to static mapping)
  const { data: buildPartnerLabels, getLabel } =
    useBuildPartnerLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getBuildPartnerLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getBuildPartnerLabel(configId)
      if (buildPartnerLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [buildPartnerLabels, currentLanguage, getLabel]
  )

  // Define steps array (direct mapping for clarity)
  const steps = useMemo(
    () => [
      getBuildPartnerLabelDynamic('CDL_BP_DETAILS'),
      'Documents (Optional)',
      getBuildPartnerLabelDynamic('CDL_BP_CONTACT'),
      getBuildPartnerLabelDynamic('CDL_BP_FEES'),
      getBuildPartnerLabelDynamic('CDL_BP_BENE_INFO'),
      'Review',
    ],
    [getBuildPartnerLabelDynamic]
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

  const stepRenderer = useStepContentRenderer({
    activeStep,
    developerId: developerId || '',
    methods,
    onEditStep: handleEditStep,
    isReadOnly: isViewMode,
  })

  const { data: stepStatus } = useBuildPartnerStepStatus(developerId || '')

  // Set editing mode based on URL parameter or developerId
  useEffect(() => {
    const editing = searchParams.get('editing')
    // If editing=true in URL, set editing mode
    if (editing === 'true') {
      setIsEditingMode(true)
    }
    // If there's a developerId but no view mode, it's also editing mode
    else if (developerId && !isViewMode) {
      setIsEditingMode(true)
    }
    // If no developerId and no editing param, it's create mode
    else if (!developerId) {
      setIsEditingMode(false)
    }
  }, [searchParams, developerId, isViewMode])

  // Helper function to build mode parameter for navigation (matching capital partner pattern)
  const getModeParam = useCallback(() => {
    if (isViewMode) return '?mode=view'
    if (isEditingMode) return '?editing=true'
    return ''
  }, [isViewMode, isEditingMode])

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
      setIsSaving(true)
      notifications.clearNotifications()

      // In view mode, just navigate without saving
      if (isViewMode) {
        const nextStep = activeStep + 1
        if (nextStep < steps.length) {
          const nextUrlStep = nextStep + 1
          router.push(
            `/build-partner/${developerId}/step/${nextUrlStep}?mode=view`
          )
        } else {
          router.push('/build-partner')
        }
        return
      }

      // Documents (Optional), Contact, Fees, and Beneficiary steps don't need API call here - items are saved when "Add" is clicked
      // These steps should skip ALL validation and just navigate
      if (
        activeStep === 1 ||
        activeStep === 2 ||
        activeStep === 3 ||
        activeStep === 4
      ) {
        // For these steps, just navigate to next step without API call or validation
        const nextStep = activeStep + 1
        if (nextStep < steps.length) {
          // Convert 0-based activeStep to 1-based URL step
          const nextUrlStep = nextStep + 1
          // Preserve editing mode when navigating back to Review
          const modeParam = getModeParam()
          router.push(
            `/build-partner/${developerId}/step/${nextUrlStep}${modeParam}`
          )
          // Update local state to match navigation
          setActiveStep(nextStep)
        } else {
          router.push('/build-partner')
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
              'Build Partner ID not found. Please complete Step 1 first.'
            )
            return
          }

          // Get step1 form data for workflow request
          const step1Data = stepStatus?.stepData?.step1

          if (!step1Data) {
            notifications.showError(
              'Build Partner data not found. Please complete Step 1 first.'
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
            'Build Partner registration submitted successfully! Workflow request created.'
          )
          router.push('/build-partner')
        } catch (error) {
          console.error(error)
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

      const isFormValid = await methods.trigger()

      if (!isFormValid) {
        notifications.showError(
          'Please fill in all required fields correctly before proceeding.'
        )
        return
      }

      // All other steps make API calls
      const currentFormData = methods.getValues()
      let stepSpecificData = transformStepData(
        activeStep + 1,
        currentFormData,
        transformers
      )

      // Add enabled and deleted fields for Step1 update
      if (activeStep === 0 && isEditingMode) {
        stepSpecificData = {
          ...stepSpecificData,
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
        // For Step 1, we need to get the Build Partner ID from the API response and navigate to dynamic route
        if (activeStep === 0) {
          // Step 1 just saved, get the Build Partner ID from the API response
          const savedDeveloperId =
            (saveResponse as any)?.data?.id || (saveResponse as any)?.id

          if (savedDeveloperId) {
            // Navigate to Step 2 using the dynamic route with the Build Partner ID from backend
            router.push(
              `/build-partner/${savedDeveloperId}/step/2${getModeParam()}`
            )
          } else {
            // Fallback to local state if no Build Partner ID
            setActiveStep((prev) => prev + 1)
          }
        } else if (developerId) {
          // For other steps, use the existing Build Partner ID
          const nextStep = activeStep + 1
          router.push(
            `/build-partner/${developerId}/step/${nextStep + 1}${getModeParam()}`
          )
        } else {
          // Fallback to local state if no Build Partner ID
          setActiveStep((prev) => prev + 1)
        }
      } else {
        // If this is the last step, redirect to build-partner list
        router.push('/build-partner')
        notifications.showSuccess('All steps completed successfully!')
      }
    } catch (error: unknown) {
      setIsSaving(false)
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
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      const previousStep = activeStep - 1
      setActiveStep(previousStep)
      // Navigate to the previous step URL with mode parameter
      router.push(
        `/build-partner/${developerId}/step/${previousStep + 1}${getModeParam()}`
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
          {stepRenderer.getStepContent(activeStep)}

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
              onClick={() => router.push('/build-partner')}
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
