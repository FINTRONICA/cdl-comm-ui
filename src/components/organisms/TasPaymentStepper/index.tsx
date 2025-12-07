'use client'

import { useState, useEffect } from 'react'
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
} from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'

import TasStep1 from './steps/TasStep1'
import TasStep2 from './steps/TasStep2'
import DocumentUploadFactory from '../DocumentUpload/DocumentUploadFactory'
import { DocumentItem } from '../DeveloperStepper/developerTypes'
import { ManualPaymentDataProvider } from '../ManualPaymentStepper/ManualPaymentDataProvider'

import { ProjectData } from './tasPaymentTypes'
import { fundEgressService } from '@/services/api/fundEgressService'
import { toast } from 'react-hot-toast'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { useManualPaymentLabelsWithCache } from '@/hooks/useManualPaymentLabelsWithCache'
import { MANUAL_PAYMENT_LABELS } from '@/constants/mappings/manualPaymentLabels'
import { GlobalLoading } from '@/components/atoms'

const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  return isDark
}

export default function TasPaymentStepperWrapper() {
  const [activeStep, setActiveStep] = useState(0)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [fundEgressData, setFundEgressData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const isDarkMode = useIsDarkMode()

  // Use translation hook for TAS payment labels (same as manual payment)
  const { getLabel } = useManualPaymentLabelsWithCache('EN')

  // Create dynamic step labels using translations
  const steps = [
    getLabel(
      MANUAL_PAYMENT_LABELS.STEPS.DETAILS,
      'EN',
      MANUAL_PAYMENT_LABELS.FALLBACKS.STEPS.DETAILS
    ),
    getLabel(
      MANUAL_PAYMENT_LABELS.STEPS.DOCUMENTS,
      'EN',
      MANUAL_PAYMENT_LABELS.FALLBACKS.STEPS.DOCUMENTS
    ),
    getLabel(
      MANUAL_PAYMENT_LABELS.STEPS.REVIEW,
      'EN',
      MANUAL_PAYMENT_LABELS.FALLBACKS.STEPS.REVIEW
    ),
  ]

  // Fetch existing payment data and handle step routing
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true)
        const paymentId = params.id as string
        const step = searchParams.get('step')

        if (paymentId) {
          if (!paymentId.startsWith('temp_')) {
            const data = await fundEgressService.getFundEgressById(paymentId)

            setFundEgressData(data)
            setSavedId(paymentId)
          } else {
            // Handle temporary ID for new payments
            setSavedId(paymentId)
          }
        }

        // Handle step routing
        if (step) {
          const stepNumber = parseInt(step)
          if (stepNumber >= 0 && stepNumber < steps.length) {
            setActiveStep(stepNumber)
          }
        }
      } catch (error) {
        console.error('Failed to fetch payment data:', error)
        toast.error('Failed to load payment data')
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentData()
  }, [params, searchParams])

  // Initialize form with default values
  const methods = useForm<ProjectData>({
    defaultValues: {
      // Set default values here
      documents: [],
    },
  })

  // Update form when data is loaded
  useEffect(() => {
    if (fundEgressData && methods) {
      // Pre-populate form with existing data
      // The TasStep1 component will handle the detailed field mapping
      // This ensures proper data type handling for date fields
    }
  }, [fundEgressData, methods])

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      const nextStep = activeStep + 1
      const paymentId = params.id as string
      router.push(`/transactions/tas/new/${paymentId}?step=${nextStep}`)
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      const prevStep = activeStep - 1
      const paymentId = params.id as string
      router.push(`/transactions/tas/new/${paymentId}?step=${prevStep}`)
    }
  }

  const handleFinish = () => {
    // Navigate back to TAS payments list
    router.push('/transactions/tas')
  }

  const handleReset = () => {
    setActiveStep(0)
    methods.reset()
    toast.success('Form reset successfully. All data cleared.')
    router.push('/transactions/tas')
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <TasStep1
            savedId={savedId}
            fundEgressData={fundEgressData}
            loading={loading}
            isEditMode={!!fundEgressData}
          />
        )
      case 1:
        if (!savedId) {
          toast.error(
            'No payment ID available for document upload. Please go back to Step 1.'
          )
          return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="error">
                No payment ID available for document upload
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please go back to Step 1.
              </Typography>
            </Box>
          )
        }

        return (
          <DocumentUploadFactory
            type="PAYMENTS"
            entityId={savedId}
            isOptional={true}
            onDocumentsChange={(documents: DocumentItem[]) => {
              methods.setValue('documents', documents)
            }}
            formFieldName="documents"
          />
        )
      case 2:
        return <TasStep2 />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          backgroundColor: isDarkMode ? '#101828' : '#FFFFFFBF',
          borderRadius: '16px',
          margin: '0 auto',
          width: '100%',
          height: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GlobalLoading fullHeight className="min-h-[500px]" />
      </Box>
    )
  }

  // Handle case where no payment data is available (new payment)
  if (!fundEgressData && !savedId?.startsWith('temp_')) {
    return (
      <Box sx={{ p: 0, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          No payment data found
        </Typography>
        <Typography variant="body2" sx={{ mt: 0 }}>
          Please go back to the TAS payments list and try again.
        </Typography>
      </Box>
    )
  }

  return (
    <ManualPaymentDataProvider>
      <FormProvider {...methods}>
        <Box
          className="border-gray-200 rounded-t-2xl"
          sx={{
            width: '100%',
            height: 'calc(100vh - 200px)', // Adjust for header height
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: isDarkMode ? '#101828' : '#FFFFFFBF',
            border: isDarkMode ? '1px solid rgba(51, 65, 85, 1)' : 'none',
            paddingTop: '16px',
          }}
        >
          {/* Stepper Header - Fixed */}
          <Box sx={{ flexShrink: 0 }}>
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
          </Box>

          {/* Content Area - Scrollable */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              backgroundColor: isDarkMode ? '#101828' : '#FFFFFFBF',
              boxShadow: 'none',
              p: 1,
            }}
          >
            {getStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons - Sticky Bottom */}
          <Box
            sx={{
              flexShrink: 0,
              backgroundColor: isDarkMode ? '#101828' : '#FFFFFFBF',
              borderTop: isDarkMode ? '1px solid #334155' : '1px solid #E5E7EB',
              px: 6,
              py: 2,
              position: 'sticky',
              bottom: 0,
              zIndex: 10,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                width: '100%',
                minHeight: '100%',
              }}
            >
              <Button
                onClick={handleReset}
                variant="outlined"
                sx={{
                  minWidth: '120px',
                  height: '40px',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: 0,
                }}
              >
                Cancel
              </Button>
              <Box>
                {activeStep !== 0 && (
                  <Button
                    onClick={handleBack}
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
                      backgroundColor: isDarkMode ? '#1E293B' : '#DBEAFE',
                      color: isDarkMode ? '#60A5FA' : '#155DFC',
                      border: 'none',
                      mr: 2,
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 500,
                      fontStyle: 'normal',
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: 0,
                      '&:hover': {
                        backgroundColor: isDarkMode ? '#334155' : '#BFDBFE',
                      },
                    }}
                    variant="outlined"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={
                    activeStep === steps.length - 1 ? handleFinish : handleNext
                  }
                  variant="contained"
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
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    boxShadow: 'none',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: 0,
                    '&:hover': {
                      backgroundColor: isDarkMode ? '#1E40AF' : '#1E3A8A',
                    },
                  }}
                >
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </FormProvider>
    </ManualPaymentDataProvider>
  )
}
