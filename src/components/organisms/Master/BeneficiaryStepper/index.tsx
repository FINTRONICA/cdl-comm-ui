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
import {
  FormProvider,
  useForm,
} from 'react-hook-form'
import Step1, { type Step1Ref } from './steps/Step1'
import Step3 from './steps/Step3'
import DocumentUploadFactory from '../../DocumentUpload/DocumentUploadFactory'
import { DocumentItem } from '../../DeveloperStepper/developerTypes'
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
      getLabel(config.configId, lang, fallbackSteps[index])
    )
  }, [getLabel, currentLanguage])

  const isEditMode = Boolean(currentBeneficiaryId)
  const step1Ref = useRef<Step1Ref>(null)

  const updateURL = (step: number, id?: string | null) => {
    if (id && step >= 0) {
      const queryParam = isViewMode ? '?mode=view' : '?editing=true'
      router.push(`/master/beneficiary/${id}/step/${step + 1}${queryParam}`)
    } else if (step === 0) {
      router.push('/master/beneficiary/new')
    }
  }

  useEffect(() => {
    const stepFromUrl = searchParams.get('step')
    if (stepFromUrl) {
      const stepNumber = parseInt(stepFromUrl) - 1
      if (
        stepNumber !== activeStep &&
        stepNumber >= 0 &&
        stepNumber < steps.length
      ) {
        setActiveStep(stepNumber)
      }
    }
  }, [searchParams, activeStep, steps.length])

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

  const handleAsyncStep = async (stepRef: {
    handleSaveAndNext: () => Promise<void>
  }) => {
    try {
      setIsSaving(true)
      await stepRef.handleSaveAndNext()
    } catch {
      return false
    } finally {
      setIsSaving(false)
    }
    return true
  }

  const navigateToNextStep = () => {
    const nextStep = activeStep + 1
    if (nextStep < steps.length) {
      setActiveStep(nextStep)
      updateURL(nextStep, currentBeneficiaryId)
    }
  }

  const handleNext = async () => {
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
  }

  const handleBack = () => {
    const prevStep = activeStep - 1
    if (prevStep >= 0) {
      setActiveStep(prevStep)
      updateURL(prevStep, currentBeneficiaryId)
    }
  }

  const handleReset = () => {
    setActiveStep(0)
    setCurrentBeneficiaryId(null)
    setIsSaving(false)
    setErrorMessage(null)
    setSuccessMessage(null)
    methods.reset()
    router.push('/master/beneficiary')
  }

  const handleSubmit = async () => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)
      setIsSaving(true)

      if (!currentBeneficiaryId) {
        setErrorMessage(
          'Beneficiary ID not found. Please complete Step 1 first.'
        )
        setIsSaving(false)
        return
      }

      setSuccessMessage('Beneficiary details submitted successfully!')
      router.push('/master/beneficiary')
    } catch (error) {
      const errorData = error as {
        response?: { data?: { message?: string } }
        message?: string
      }
      const errorMessage =
        errorData?.response?.data?.message ||
        errorData?.message ||
        'Failed to submit. Please try again.'
      setErrorMessage(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleStep1SaveAndNext = (data: { id: number | string }) => {
    if (data && data.id) {
      const nextStep = activeStep + 1
      const idString = String(data.id)
      setCurrentBeneficiaryId(idString)
      setActiveStep(nextStep)
      updateURL(nextStep, idString)
    }
  }

  const handleDocumentsChange = useCallback(
    (documents: DocumentItem[]) => {
      methods.setValue('documents', documents)
    },
    [methods]
  )

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Step1
            ref={step1Ref}
            onSaveAndNext={handleStep1SaveAndNext}
            isEditMode={isEditMode}
            beneficiaryId={currentBeneficiaryId}
            isViewMode={isViewMode}
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
            entityId={currentBeneficiaryId || ''}
            isOptional={true}
            onDocumentsChange={handleDocumentsChange}
            formFieldName="documents"
            isReadOnly={isViewMode}
          />
        )
      case 2:
        return (
          <Step3
            beneficiaryId={currentBeneficiaryId ?? undefined}
            isReadOnly={isViewMode}
          />
        )
      default:
        return null
    }
  }

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

          <Box
            display="flex"
            justifyContent="space-between"
            sx={buttonContainerSx}
          >
            <Button
              onClick={handleReset}
              variant="outlined"
              sx={cancelButtonSx}
            >
              Cancel
            </Button>
            <Box>
              {activeStep !== 0 && (
                <Button
                  onClick={handleBack}
                  sx={(theme) => ({
                    ...(
                      backButtonSx as (
                        theme: Theme
                      ) => Record<string, unknown>
                    )(theme),
                    mr: 2,
                  })}
                  variant="outlined"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={
                  activeStep === steps.length - 1
                    ? isViewMode
                      ? () => router.push('/master/beneficiary')
                      : handleSubmit
                    : handleNext
                }
                variant="contained"
                disabled={
                  (activeStep === steps.length - 1 && isSaving) ||
                  isSaving
                }
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
