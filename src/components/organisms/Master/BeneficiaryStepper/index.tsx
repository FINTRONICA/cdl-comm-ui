'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material'
import type { Theme } from '@mui/material/styles'
import { FormProvider, useForm } from 'react-hook-form'
import Step1, { type Step1Ref } from './steps/Step1'
import Step2 from './steps/Step2'
import Step3 from './steps/Step3'
import DocumentUploadFactory from '../../DocumentUpload/DocumentUploadFactory'
import {
  outerContainerSx,
  formSectionSx,
  buttonContainerSx,
  stepperLabelSx,
  backButtonSx,
  nextButtonSx,
  cancelButtonSx,
} from './styles'
import { useBeneficiaryLabelsWithCache } from '@/hooks/master/CustomerHook/useBeneficiaryLabelsWithCache'
import { useAppStore } from '@/store'
import { BeneficiaryFormData } from './types'
import { DEFAULT_FORM_VALUES } from './constants'

// Step configuration with config IDs for dynamic labels
const stepConfigs = [
  { key: 'details', configId: 'BENEFICIARY_DETAILS' },
  { key: 'documents', configId: 'DOCUMENTS' },
  { key: 'review', configId: 'REVIEW' },
]

// Fallback step labels
const fallbackSteps = [
  'Beneficiary Details',
  'Documents (Optional)',
  'Review',
]

interface BeneficiaryStepperWrapperProps {
  beneficiaryId?: string
  initialStep?: number
  isViewMode?: boolean
  isEditingMode?: boolean
}

export default function BeneficiaryStepperWrapper({
  beneficiaryId,
  initialStep = 0,
  isViewMode = false,
}: BeneficiaryStepperWrapperProps = {}) {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  // Get labels from API
  const { getLabel } = useBeneficiaryLabelsWithCache()
  const language = useAppStore((state) => state.language)
  const currentLanguage = String(language || 'EN')

  const [activeStep, setActiveStep] = useState(initialStep)
  const [isSaving, setIsSaving] = useState(false)
  const [currentBeneficiaryId, setCurrentBeneficiaryId] = useState<string | null>(
    beneficiaryId || null
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Create dynamic step labels
  const steps = useMemo(() => {
    const lang: string = String(currentLanguage || 'EN')
    return stepConfigs.map((config, index) =>
      getLabel(config.configId, lang, fallbackSteps[index] || 'Step')
    )
  }, [getLabel, currentLanguage])

  const isEditMode = Boolean(currentBeneficiaryId)
  const step1Ref = useRef<Step1Ref>(null)

  const updateURL = useCallback(
    (step: number, id?: string | null) => {
      if (id && step >= 0) {
        const queryParam = isViewMode ? '?mode=view' : '?editing=true'
        router.push(`/master/beneficiary/${id}/step/${step + 1}${queryParam}`)
      } else if (step === 0) {
        router.push('/master/beneficiary/new')
      }
    },
    [isViewMode, router]
  )

  // Sync step from URL params
  useEffect(() => {
    const stepFromUrl = searchParams.get('step')
    if (stepFromUrl) {
      const stepNumber = parseInt(stepFromUrl, 10) - 1
      if (
        stepNumber !== activeStep &&
        stepNumber >= 0 &&
        stepNumber < steps.length
      ) {
        setActiveStep(stepNumber)
      }
    }
  }, [searchParams, activeStep, steps.length])

  // Sync beneficiaryId from URL params
  useEffect(() => {
    if (params.id && !currentBeneficiaryId) {
      setCurrentBeneficiaryId(params.id as string)
    }
  }, [params.id, currentBeneficiaryId])

  // Sync beneficiaryId prop with state
  useEffect(() => {
    if (beneficiaryId && beneficiaryId !== currentBeneficiaryId) {
      setCurrentBeneficiaryId(beneficiaryId)
    }
  }, [beneficiaryId, currentBeneficiaryId])

  const methods = useForm<BeneficiaryFormData>({
    mode: 'onChange',
    defaultValues: DEFAULT_FORM_VALUES,
  })

  const handleAsyncStep = useCallback(
    async (stepRef: { handleSaveAndNext: () => Promise<void> }) => {
      try {
        setIsSaving(true)
        setErrorMessage(null)
        setSuccessMessage(null)
        await stepRef.handleSaveAndNext()
        return true
      } catch (error: unknown) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[BeneficiaryStepper] Error in handleAsyncStep:', error)
        }
        const errorMsg =
          error instanceof Error
            ? error.message
            : 'Failed to save beneficiary. Please try again.'
        setErrorMessage(errorMsg)
        return false
      } finally {
        setIsSaving(false)
      }
    },
    []
  )

  const navigateToNextStep = useCallback(() => {
    const nextStep = activeStep + 1
    if (nextStep < steps.length) {
      setActiveStep(nextStep)
      updateURL(nextStep, currentBeneficiaryId)
    }
  }, [activeStep, steps.length, currentBeneficiaryId, updateURL])

  const handleNext = useCallback(async () => {
    if (isViewMode) {
      navigateToNextStep()
      return
    }

    if (activeStep === 0 && step1Ref.current) {
      await handleAsyncStep(step1Ref.current)
      return
    }

    if (activeStep === 1) {
      // Documents step - just navigate
      navigateToNextStep()
      return
    }

    navigateToNextStep()
  }, [isViewMode, activeStep, handleAsyncStep, navigateToNextStep])

  const handleBack = useCallback(() => {
    const prevStep = activeStep - 1
    if (prevStep >= 0) {
      setActiveStep(prevStep)
      updateURL(prevStep, currentBeneficiaryId)
    }
  }, [activeStep, currentBeneficiaryId, updateURL])

  const handleReset = useCallback(() => {
    setActiveStep(0)
    setCurrentBeneficiaryId(null)
    setIsSaving(false)
    setErrorMessage(null)
    setSuccessMessage(null)
    methods.reset()
    router.push('/master/beneficiary')
  }, [methods, router])

  const handleStep1SaveAndNext = useCallback(
    (data: { id: number | string }) => {
      if (data && data.id) {
        const nextStep = activeStep + 1
        const idString = String(data.id)
        setCurrentBeneficiaryId(idString)
        setActiveStep(nextStep)
        updateURL(nextStep, idString)
      }
    },
    [activeStep, updateURL]
  )

  const handleEditStep = useCallback(
    (stepNumber: number) => {
      setActiveStep(stepNumber)
      if (currentBeneficiaryId) {
        const queryParam = isViewMode ? '?mode=view' : '?editing=true'
        router.push(
          `/master/beneficiary/${currentBeneficiaryId}/step/${stepNumber + 1}${queryParam}`
        )
      }
    },
    [currentBeneficiaryId, isViewMode, router]
  )

  const getStepContent = useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return (
            <Step1
              ref={step1Ref}
              onSaveAndNext={handleStep1SaveAndNext}
              isEditMode={isEditMode}
              beneficiaryId={currentBeneficiaryId || undefined}
              isViewMode={isViewMode}
              isReadOnly={isViewMode}
            />
          )
        case 1:
          if (!currentBeneficiaryId) {
            return (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                Please complete Step 1 to proceed with document upload.
              </Box>
            )
          }
          return (
            <DocumentUploadFactory
              type="BENEFICIARY"
              entityId={currentBeneficiaryId}
              isOptional={true}
              formFieldName="documents"
              isReadOnly={isViewMode}
              onDocumentsChange={(documents) => {
                methods.setValue('documents', documents)
              }}
            />
          )
        case 2:
          return (
            <Step3
              beneficiaryId={currentBeneficiaryId ?? undefined}
              isReadOnly={isViewMode}
              onEditStep={handleEditStep}
            />
          )
        default:
          return null
      }
    },
    [
      currentBeneficiaryId,
      isEditMode,
      isViewMode,
      methods,
      handleStep1SaveAndNext,
      handleEditStep,
    ]
  )

  return (
    <FormProvider {...methods}>
      <Box sx={outerContainerSx}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label: string, index: number) => (
            <Step key={`step-${index}-${label}`}>
              <StepLabel>
                <Typography variant="caption" sx={stepperLabelSx}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box
          key={`step-${activeStep}-${currentBeneficiaryId}`}
          sx={formSectionSx}
        >
          {getStepContent(activeStep)}

          <Box display="flex" justifyContent="space-between" sx={buttonContainerSx}>
            <Button onClick={handleReset} variant="outlined" sx={cancelButtonSx}>
              Cancel
            </Button>
            <Box>
              {activeStep !== 0 && (
                <Button
                  onClick={handleBack}
                  sx={(theme) =>
                    ({
                      ...(backButtonSx as (theme: Theme) => Record<string, unknown>)(theme),
                      mr: 2,
                    } as Record<string, unknown>)
                  }
                  variant="outlined"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={
                  activeStep === steps.length - 1
                    ? () => router.push('/master/beneficiary')
                    : handleNext
                }
                variant="contained"
                disabled={isSaving}
                startIcon={
                  isSaving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
                sx={nextButtonSx}
              >
                {isSaving
                  ? activeStep === steps.length - 1
                    ? 'Submitting...'
                    : 'Saving...'
                  : activeStep === steps.length - 1
                    ? isViewMode
                      ? 'Close'
                      : 'Complete'
                    : isViewMode
                      ? 'Next'
                      : 'Save and Next'}
              </Button>
            </Box>
          </Box>

          {/* Error and Success Notifications */}
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
        </Box>
      </Box>
    </FormProvider>
  )
}
