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
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { usePartyStepStatus, usePartyStepManager } from '@/hooks'
import { useCreateWorkflowRequest } from '@/hooks/workflow'
import { usePartyLabelsWithCache } from '@/hooks/master/CustomerHook/usePartyLabelsWithCache'
import { getPartyLabel } from '@/constants/mappings/master/partyMapping'
import { useAppStore } from '@/store'
import { addBasePath, stripBasePath } from '@/utils/basePath'

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

export default function PartyStepperWrapper({
  partyId,
  initialStep = 0,
  isViewMode: propIsViewMode,
  isEditingMode: propIsEditingMode,
}: StepperProps = {}) {
  const [activeStep, setActiveStep] = useState(initialStep)
  const [isEditingMode, setIsEditingMode] = useState(propIsEditingMode || false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const fullPathname = usePathname()
  const pathname = stripBasePath(fullPathname)
  const isDarkMode = useIsDarkMode()
  
  // Detect if we're on /master/party/new route
  const isNewPartyRoute = pathname === '/master/party/new' || pathname === '/party/new'

  // Check if we're in view mode (read-only)
  // Use prop if provided, otherwise read from URL params (backward compatibility)
  const mode = searchParams.get('mode')
  const isViewMode =
    propIsViewMode !== undefined ? propIsViewMode : mode === 'view'

  const notifications = useStepNotifications()
  const dataProcessing = useStepDataProcessing()
  const { methods, formState, setShouldResetForm } = useStepForm(
    partyId,
    activeStep
  )
  const stepManager = usePartyStepManager()
  const validation = useStepValidation()
  const createWorkflowRequest = useCreateWorkflowRequest()
  const transformers = useStepDataTransformers()

  // Dynamic step labels (API-driven with fallback to static mapping)
  const { data: partyLabels, getLabel } =
    usePartyLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getPartyLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getPartyLabel(configId)
      if (partyLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [partyLabels, currentLanguage, getLabel]
  )

  // Define steps array (direct mapping for clarity)
  const steps = useMemo(
    () => [
      getPartyLabelDynamic('CDL_PARTY_DETAILS'),
      'Documents (Optional)',
      getPartyLabelDynamic('CDL_AUTHORIZED_SIGNATORY_DETAILS'),
      'Review',
    ],
    [getPartyLabelDynamic]
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
    partyId: partyId || '',
    methods,
    onEditStep: handleEditStep,
    isReadOnly: isViewMode,
  })

  const { data: stepStatus } = usePartyStepStatus(partyId || '')

  // Set editing mode based on prop, URL parameter, or partyId
  useEffect(() => {
    // Use prop if provided (from page component)
    if (propIsEditingMode !== undefined) {
      setIsEditingMode(propIsEditingMode)
      return
    }
    
    const editing = searchParams.get('editing')
    // If editing=true in URL, set editing mode
    if (editing === 'true') {
      setIsEditingMode(true)
    }
    // If there's a partyId but no view mode and not on /party/new, it's editing mode
    else if (partyId && !isViewMode && typeof window !== 'undefined' && !window.location.pathname.includes('/party/new')) {
      setIsEditingMode(true)
    }
    // If no partyId or on /party/new, it's create mode
    else if (!partyId || (typeof window !== 'undefined' && window.location.pathname.includes('/party/new'))) {
      setIsEditingMode(false)
    }
  }, [searchParams, partyId, isViewMode, propIsEditingMode])

  // Note: getModeParam removed - URLs are now constructed inline to ensure correct format

  useEffect(() => {
    if (
      dataProcessing.shouldProcessStepData(
        stepStatus,
        partyId,
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
        // Silently handle processing errors - they're usually non-critical
      }
    }
  }, [activeStep, stepStatus, partyId, formState.shouldResetForm, dataProcessing, methods, setShouldResetForm])

  const handleSaveAndNext = async () => {
    try {
      setIsSaving(true)
      notifications.clearNotifications()

      // In view mode, just navigate without saving
      if (isViewMode) {
        const nextStep = activeStep + 1
        if (nextStep < steps.length) {
          const nextUrlStep = nextStep + 1
          // Only navigate if partyId exists
          if (partyId) {
          router.push(
            `/master/party/${partyId}/step/${nextUrlStep}?mode=view`
          )
          } else {
            // Fallback: just update local state
            setActiveStep(nextStep)
          }
        } else {
          router.push('/master/party')
        }
        return
      }

      // Documents (Optional) step doesn't need API call here - items are saved when uploaded
      // This step should skip ALL validation and just navigate
      if (activeStep === 1) {
        // For these steps, just navigate to next step without API call or validation
        const nextStep = activeStep + 1
        if (nextStep < steps.length) {
          // Convert 0-based activeStep to 1-based URL step
          const nextUrlStep = nextStep + 1
          // Only navigate if partyId exists
          if (partyId) {
            const docUrl = isEditingMode
              ? `/master/party/${partyId}/step/${nextUrlStep}?editing=true`
              : `/master/party/${partyId}/step/${nextUrlStep}`
            // Use hard navigation if still on /master/party/new or /party/new
            if (isNewPartyRoute || pathname === '/party/new' || pathname === '/master/party/new') {
              window.location.href = addBasePath(docUrl)
            } else {
              router.push(docUrl)
            }
          } else {
            notifications.showError('Party ID is required. Please complete Step 1 first.')
          }
          // Update local state to match navigation
          setActiveStep(nextStep)
        } else {
          router.push('/master/party')
        }
        return
      }

      // Review step (step 3) - complete the process and submit workflow request
      if (activeStep === 3) {
        try {
          // Get the Party ID from step status or use current partyId
          const partyIdFromStatus =
            stepStatus?.stepData?.step1?.id?.toString()
          const finalPartyId = partyIdFromStatus || partyId

          if (!finalPartyId) {
            notifications.showError(
              'Party ID not found. Please complete Step 1 first.'
            )
            setIsSaving(false)
            return
          }

          // Get step1 form data for workflow request
          const step1Data = stepStatus?.stepData?.step1

          if (!step1Data) {
            notifications.showError(
              'Party data not found. Please complete Step 1 first.'
            )
            setIsSaving(false)
            return
          }

          // Submit workflow request with only step1 data (cast to Step1Data type)
          // await createWorkflowRequest.mutateAsync({
          //   partyId: finalPartyId,
          //   step1Data: step1Data as any // Type assertion since the data structure matches
          // });

          await createWorkflowRequest.mutateAsync({
            referenceId: finalPartyId,
            referenceType: 'PARTY',
            moduleName: 'PARTY',
            actionKey: 'APPROVE',
            payloadJson: step1Data as unknown as Record<string, unknown>,
          })

          notifications.showSuccess(
            'Party details submitted successfully! Workflow request created.'
          )
          router.push('/master/party')
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
        } finally {
          setIsSaving(false)
        }
        return
      }

      const isFormValid = await methods.trigger()

      if (!isFormValid) {
        notifications.showError(
          'Please fill in all required fields correctly before proceeding.'
        )
        setIsSaving(false)
        return
      }

      // All other steps make API calls
      // Map activeStep to API step number:
      // activeStep 0 (Party Details UI) → API step 1
      // activeStep 1 (Documents UI) → skipped
      // activeStep 2 (Authorized Signatory UI) → API step 2
      // activeStep 3 (Review UI) → API step 3
      const apiStepNumber = activeStep === 0 ? 1 : activeStep === 2 ? 2 : activeStep === 3 ? 3 : activeStep + 1
      
      const currentFormData = methods.getValues()
      
      // For Step 2, ensure we have partyId - try to get it from stepStatus if not available
      let effectivePartyId = partyId
      if (activeStep === 2 && !effectivePartyId) {
        effectivePartyId = stepStatus?.stepData?.step1?.id?.toString()
      }
      
      // If still no partyId for Step 2, this is an error
      if (activeStep === 2 && !effectivePartyId) {
        notifications.showError('Party ID is required. Please complete Step 1 first.')
        setIsSaving(false)
        return
      }
      
      let stepSpecificData = transformStepData(
        apiStepNumber,
        currentFormData,
        transformers,
        effectivePartyId
      )

      // Add enabled and deleted fields for Step1 update
      if (activeStep === 0 && isEditingMode && stepSpecificData && typeof stepSpecificData === 'object') {
        stepSpecificData = {
          ...stepSpecificData,
          enabled: true,
          deleted: false,
        } as typeof stepSpecificData & { enabled: boolean; deleted: boolean }
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
      // For step 2 (authorized signatory), extract the ID if editing
      let authorizedSignatoryId: string | number | undefined
      if (activeStep === 2 && isEditingMode && stepStatus?.stepData?.step2) {
        const step2Data = stepStatus.stepData.step2
        if (Array.isArray(step2Data) && step2Data.length > 0) {
          authorizedSignatoryId = step2Data[0]?.id
        } else if (step2Data && typeof step2Data === 'object' && 'id' in step2Data) {
          authorizedSignatoryId = (step2Data as { id?: string | number })?.id
        }
      }

      const saveResponse = await stepManager.saveStep(
        apiStepNumber,
        stepSpecificData,
        isEditingMode,
        partyId,
        authorizedSignatoryId
      )


      notifications.showSuccess('Step saved successfully!')

      // Navigate to next step
      if (activeStep < steps.length - 1) {
        // For Step 1, we need to get the Party ID from the API response and navigate to dynamic route
        if (activeStep === 0) {
          // Step 1 just saved, get the Party ID from the API response
          // Matching DeveloperStepper pattern EXACTLY: (saveResponse as any)?.data?.id || (saveResponse as any)?.id
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const savedPartyId = (saveResponse as any)?.data?.id || (saveResponse as any)?.id

          if (savedPartyId) {
            // Convert to string and navigate to Step 2 using the dynamic route with the Party ID from backend
            const partyIdString = String(savedPartyId)
            // For new party creation, don't add ?editing=true (only add it when editing existing party)
            const nextUrl = isEditingMode 
              ? `/master/party/${partyIdString}/step/2?editing=true`
              : `/master/party/${partyIdString}/step/2`
            
            // ALWAYS use hard navigation when on /master/party/new or /party/new to ensure route change
            // This is critical - Next.js needs a full page reload to switch from static to dynamic route
            if (isNewPartyRoute || pathname === '/party/new' || pathname === '/master/party/new' || !partyId) {
              window.location.href = addBasePath(nextUrl)
              return // Exit early - page will reload
            } else {
              // Use router.push for normal navigation (matching DeveloperStepper pattern)
              router.push(nextUrl)
            }
            
            // Don't update local state here - let the new page handle it via initialStep prop
          } else {
            notifications.showError('Failed to get Party ID from server. Please try again.')
            // Fallback to local state if no Party ID
            setActiveStep((prev) => prev + 1)
          }
        } else if (partyId) {
          // For other steps, use the existing Party ID
          const nextStep = activeStep + 1
          // Ensure editing mode is preserved in URL
          const nextUrl = isEditingMode
            ? `/master/party/${partyId}/step/${nextStep + 1}?editing=true`
            : `/master/party/${partyId}/step/${nextStep + 1}`
          router.push(nextUrl)
          // Also update local state to match navigation
          setActiveStep(nextStep)
        } else {
          // If we're on /master/party/new and don't have partyId, we need to go back to Step 1
          // This shouldn't happen if Step 1 was saved correctly
          notifications.showError('Party ID is required. Please complete Step 1 first.')
          // Fallback to local state if no Party ID
          setActiveStep((prev) => prev + 1)
        }
      } else {
        // If this is the last step, redirect to party list
        router.push('/master/party')
        notifications.showSuccess('All steps completed successfully!')
      }
    } catch (error: unknown) {
      setIsSaving(false)
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
      // Only navigate if partyId exists, otherwise just update local state
      if (partyId) {
        const backUrl = isEditingMode
          ? `/master/party/${partyId}/step/${previousStep + 1}?editing=true`
          : `/master/party/${partyId}/step/${previousStep + 1}`
        router.push(backUrl)
      }
      // Always update local state regardless of navigation
      setActiveStep(previousStep)
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
              onClick={() => router.push('/master/party')}
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
