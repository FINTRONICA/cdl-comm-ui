'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import dayjs from 'dayjs'
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  useTheme,
  alpha,
} from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  manualPaymentStep1Schema,
  manualPaymentRootSchema,
} from '@/lib/validation'
import { GlobalLoading } from '@/components/atoms'

import Step1 from './steps/Step1'
import Step2 from './steps/Step2'
import DocumentUploadFactory from '../DocumentUpload/DocumentUploadFactory'
import { DocumentItem } from '../DeveloperStepper/developerTypes'

import { ProjectData } from './manualPaymentTypes'
import { mapFormDataToFundEgressSimplified } from '@/utils/formDataMapper'
import { useFundEgress } from '@/hooks/useFundEgress'
import { fundEgressService } from '@/services/api/fundEgressService'
import {
  ManualPaymentDataProvider,
  useManualPaymentData,
} from './ManualPaymentDataProvider'
import { toast } from 'react-hot-toast'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { useCreateDeveloperWorkflowRequest } from '@/hooks/workflow'
// import type { Step1Data } from '@/services/api/workflowApi/workflowRequestService'

// const steps = ['Details', 'Documents', 'Review'] // Removed as we now use dynamic steps
import { useManualPaymentLabelsWithCache } from '@/hooks/useManualPaymentLabelsWithCache'
import { MANUAL_PAYMENT_LABELS } from '@/constants/mappings/manualPaymentLabels'
import { backButtonSx } from '../ProjectStepper/styles'

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

interface ManualPaymentStepperWrapperProps {
  isReadOnly?: boolean
}

function ManualPaymentStepperContent({
  isReadOnly = false,
}: ManualPaymentStepperWrapperProps = {}) {
  const [activeStep, setActiveStep] = useState(0)
  const [isEditMode, setIsEditMode] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const { submitPayment } = useFundEgress()
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()

  // Get dynamic labels
  const { getLabel } = useManualPaymentLabelsWithCache('EN')

  // Memoize dynamic steps array to prevent recreation on every render
  const steps = useMemo(
    () => [
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
    ],
    [getLabel]
  )

  // Get shared data from provider
  const sharedData = useManualPaymentData()
  const isDarkMode = useIsDarkMode()
  const theme = useTheme()
  useEffect(() => {
    const paymentId = params.id as string
    const step = searchParams.get('step')

    if (paymentId) {
      setSavedId(paymentId)
      setIsEditMode(true)
    } else {
      // No ID in URL means this is a new payment, start fresh
      setSavedId(null)
      setIsEditMode(false)
    }

    if (step) {
      const stepNumber = parseInt(step)
      if (stepNumber >= 0 && stepNumber < steps.length) {
        setActiveStep(stepNumber)
      }
    }
  }, [params, searchParams])

  // Callback to handle when step data is loaded (for compatibility)
  const handleDataLoaded = useCallback(() => {
    // This callback is kept for compatibility with Step1 component
    // but no longer manages loading state
  }, [])

  // Workflow request hook for submitting payment data
  const createProjectWorkflowRequest = useCreateDeveloperWorkflowRequest()

  const methods = useForm<ProjectData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'firstError',
    // Cast is safe here: Step 1 schema validates only a subset of ProjectData fields present on this step
    resolver: zodResolver(manualPaymentStep1Schema) as unknown as any,
    defaultValues: {
      sectionId: '',
      developerId: '',
      developerName: '',
      masterDeveloperName: '',
      projectName: '',
      projectLocation: '',
      projectAccountCif: '',
      projectStatus: '',
      projectAccountStatusDate: null,
      projectRegistrationDate: null,
      projectStartDate: null,
      projectCompletionDate: null,
      retention: '5.00',
      additionalRetention: '8.00',
      totalRetention: '13.00',
      retentionEffectiveStartDate: dayjs('2022-03-31'),
      projectManagementExpenses: '5.00',
      marketingExpenses: '10.00',
      realEstateBrokerExpense: '',
      advertisingExpense: '',
      landOwnerName: '',
      projectCompletionPercentage: '',
      currency: 'AED',
      actualConstructionCost: '',
      noOfUnits: '12',
      remarks: '',
      specialApproval: '',
      paymentType: '',
      managedBy: 'erm_checker1,erm_checker1,erm_checker1',
      backupRef: 'Master ENBD_robust_maker1',
      relationshipManager: '',
      assistantRelationshipManager: '',
      mpteamLeaderName: '',

      accounts: [
        {
          trustAccountNumber: '',
          ibanNumber: '',
          dateOpened: null,
          accountTitle: '',
          currency: 'AED',
        },
      ],

      fees: [
        {
          feeType: '',
          frequency: '',
          debitAmount: '',
          feeToBeCollected: '',
          nextRecoveryDate: null,
          feePercentage: '',
          amount: '',
          vatPercentage: '',
        },
      ],

      beneficiaries: [
        {
          id: '',
          expenseType: '',
          transferType: '',
          name: '',
          bankName: '',
          swiftCode: '',
          routingCode: '',
          account: '',
        },
      ],

      paymentPlan: [
        {
          installmentNumber: 1,
          installmentPercentage: '',
          projectCompletionPercentage: '',
        },
      ],

      financialData: {
        projectEstimatedCost: '',
        actualCost: '',
        projectBudget: '',
      },
    },
  })

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      const nextStep = activeStep + 1
      setActiveStep(nextStep)

      const paymentId = params.id as string
      const mode = searchParams.get('mode')
      const modeParam = mode ? `&mode=${mode}` : ''

      if (paymentId) {
        router.push(
          `/transactions/manual/new/${paymentId}?step=${nextStep}${modeParam}`
        )
      } else {
        router.push(`/transactions/manual/new?step=${nextStep}${modeParam}`)
      }

      toast.success(`Moved to ${steps[nextStep]} step.`)
    } else {
      router.push('/transactions/manual')
      toast.success('Payment completed! Redirecting to payments page.')
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      const prevStep = activeStep - 1
      setActiveStep(prevStep)
      const paymentId = params.id as string
      const mode = searchParams.get('mode')
      const modeParam = mode ? `&mode=${mode}` : ''

      if (paymentId) {
        router.push(
          `/transactions/manual/new/${paymentId}?step=${prevStep}${modeParam}`
        )
      } else {
        router.push(`/transactions/manual/new?step=${prevStep}${modeParam}`)
      }

      toast.success(`Moved back to ${steps[prevStep]} step.`)
    }
  }

  const handleReset = () => {
    setActiveStep(0)
    methods.reset()
    toast.success('Form reset successfully. All data cleared.')

    router.push('/transactions/manual')
  }

  // Memoize mapping options to prevent recreation on every save
  const mappingOptions = useMemo(
    () => ({
      paymentTypes: sharedData.paymentTypes.data || [],
      paymentSubTypes: sharedData.paymentSubTypes.data || [],
      currencies: sharedData.currencies.data || [],
      depositModes: sharedData.depositModes.data || [],
      paymentModes: sharedData.paymentModes.data || [],
      transferTypes: sharedData.transferTypes.data || [],
      realEstateAssets: sharedData.realEstateAssets.data || [],
      buildPartners: sharedData.buildPartners.data || [],
      // pass fetched balances so mapper can use numeric values instead of UI strings
      balances: sharedData.accountBalances.balances,
    }),
    [
      sharedData.paymentTypes.data,
      sharedData.paymentSubTypes.data,
      sharedData.currencies.data,
      sharedData.depositModes.data,
      sharedData.paymentModes.data,
      sharedData.transferTypes.data,
      sharedData.realEstateAssets.data,
      sharedData.buildPartners.data,
      sharedData.accountBalances.balances,
    ]
  )

  const handleSaveAndNext = async () => {
    try {
      const formData = methods.getValues()
      const apiPayload = mapFormDataToFundEgressSimplified(
        formData,
        mappingOptions
      )

      const result = await submitPayment(apiPayload)

      setSavedId(result.id.toString())

      router.push(`/transactions/manual/new/${result.id.toString()}?step=1`)

      toast.success(
        'Payment saved successfully! Moving to document upload step.'
      )
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : 'Failed to save payment'}`
      )
    }
  }

  const handleUpdate = async () => {
    try {
      if (!savedId) {
        toast.error('No saved ID found for update')
        return
      }

      const formData = methods.getValues()
      const apiPayload = mapFormDataToFundEgressSimplified(
        formData,
        mappingOptions
      )

      apiPayload.id = parseInt(savedId)

      await fundEgressService.updateFundEgress(savedId, apiPayload)

      router.push(`/transactions/manual/new/${savedId}?step=1`)
      toast.success(
        'Payment updated successfully! Moving to document upload step.'
      )
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : 'Failed to update payment'}`
      )
    }
  }

  const handleEdit = async () => {
    try {
      const paymentId = params.id as string
      if (paymentId) {
        setSavedId(paymentId)
        setIsEditMode(true)
        router.push(`/transactions/manual/new/${paymentId}?step=0`)
        toast.success('Entered edit mode successfully.')
      } else {
        toast.error('No payment ID found in URL.')
      }
    } catch (error) {
      toast.error('Failed to enter edit mode. Please try again.')
    }
  }

  const handleEditDocuments = async () => {
    try {
      const paymentId = params.id as string
      if (paymentId) {
        setSavedId(paymentId)
        setIsEditMode(true)
        const mode = searchParams.get('mode')
        const modeParam = mode ? `&mode=${mode}` : ''
        router.push(`/transactions/manual/new/${paymentId}?step=1${modeParam}`)
        toast.success('Navigating to documents step.')
      } else {
        toast.error('No payment ID found in URL.')
      }
    } catch (error) {
      toast.error('Failed to navigate to documents step. Please try again.')
    }
  }

  const onSubmit = async () => {
    try {
      // Submit-time validation with root schema (as requested)
      const values = methods.getValues()
      const result = manualPaymentRootSchema.safeParse(values)
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const path = (issue.path || []).join('.') as any
          methods.setError(path, { message: issue.message })
        })
        toast.error('Please resolve the highlighted issues.')
        return
      }
      // Get the payment ID from saved state
      const projectIdFromStatus = savedId

      if (!projectIdFromStatus) {
        toast.error('Payment ID not found. Please save the payment first.')
        return
      }

      // Get form data for workflow request (like DeveloperStepper)
      const step1Data = methods.getValues()

      if (!step1Data) {
        toast.error('Payment data not found. Please complete the form first.')
        return
      }

      // Create workflow request directly (like DeveloperStepper)
      await createProjectWorkflowRequest.mutateAsync({
        referenceId: projectIdFromStatus,
        payloadData: step1Data as unknown as Record<string, unknown>,
        referenceType: 'PAYMENTS',
        moduleName: 'PAYMENTS',
        actionKey: 'CREATE',
      })
      toast.success(
        'Payment submitted successfully! Workflow request created. Redirecting to payments page...'
      )
      setTimeout(() => {
        router.push('/transactions/manual')
      }, 1500) // Small delay to show the toast
    } catch (error) {
      const errorData = error as {
        response?: { data?: { message?: string } }
        message?: string
      }
      const errorMessage =
        errorData?.response?.data?.message ||
        errorData?.message ||
        'Failed to submit payment. Please try again.'
      toast.error(errorMessage)
    }
  }

  const onError = (errors: Record<string, unknown>) => {
    // Focus the first errored field and toast a brief message
    const keys = Object.keys(errors)
    if (keys[0]) {
      // @ts-ignore
      methods.setFocus(keys[0] as any)
    }
    const count = keys.length
    if (count > 0) {
      toast.error(
        `Please fix ${count} validation error${count > 1 ? 's' : ''} before proceeding.`
      )
    }
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Step1
            key={`${savedId || 'new'}-${activeStep}`}
            savedId={savedId}
            isEditMode={isEditMode}
            onDataLoaded={handleDataLoaded}
            isReadOnly={isReadOnly}
            refreshKey={activeStep}
          />
        )
      case 1:
        if (!savedId) {
          toast.error(
            'No payment ID available for document upload. Please save the payment first.'
          )
          return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="error">
                No payment ID available for document upload
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please go back to Step 1 and save the payment first.
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
        return (
          <Step2
            onEdit={handleEdit}
            onEditDocuments={handleEditDocuments}
            isReadOnly={isReadOnly}
          />
        )
      default:
        return null
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit, onError)}>
        <Box
          sx={{
            width: '100%',
            backgroundColor: isDarkMode
              ? '#101828'
              : 'rgba(255, 255, 255, 0.75)',
            borderRadius: '16px',
            paddingTop: '16px',
            border: isDarkMode
              ? '1px solid rgba(51, 65, 85, 1)'
              : '1px solid #FFFFFF',
            position: 'relative',
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
              position: 'relative',
            }}
          >
            {sharedData.isInitialLoading ? (
              <GlobalLoading fullHeight className="min-h-[400px]" />
            ) : (
              getStepContent(activeStep)
            )}

            {/* Button Section - Separate layouts for View Mode and Edit Mode */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                backgroundColor: isDarkMode
                  ? '#101828'
                  : 'rgba(255, 255, 255, 0.75)',
                mt: 3,
                mx: 6,
                mb: 2,
                p: 2,
                borderRadius: '12px',
                border: isDarkMode ? '1px solid #334155' : '1px solid #E5E7EB',
              }}
            >
              {/* VIEW MODE BUTTONS */}
              {isReadOnly && (
                <>
                  {/* Left side - Close button */}
                  <Button
                    onClick={() => router.push('/transactions/manual')}
                    variant="outlined"
                    sx={{
                      minWidth: '120px',
                      height: '40px',
                      borderRadius: '8px',
                      border: isDarkMode
                        ? '1px solid #334155'
                        : '1px solid #E5E7EB',
                      color: isDarkMode ? '#CBD5E1' : '#6B7280',
                      backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: isDarkMode ? '#273248' : '#F9FAFB',
                        borderColor: isDarkMode ? '#475569' : '#D1D5DB',
                      },
                    }}
                  >
                    Close
                  </Button>

                  {/* Right side - Navigation buttons */}
                  <Box display="flex" gap={2}>
                    {activeStep > 0 && (
                      <Button
                        onClick={handleBack}
                        variant="outlined"
                        sx={{
                          minWidth: '100px',
                          height: '40px',
                          borderRadius: '8px',
                          border: `1px solid ${isDarkMode ? '#3B82F6' : '#2563EB'}`,
                          color: isDarkMode ? '#93C5FD' : '#2563EB',
                          backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: isDarkMode ? '#273248' : '#EFF6FF',
                            borderColor: isDarkMode ? '#60A5FA' : '#1D4ED8',
                          },
                        }}
                      >
                        Previous
                      </Button>
                    )}

                    {activeStep < steps.length - 1 && (
                      <Button
                        onClick={() => {
                          const nextStep = activeStep + 1
                          setActiveStep(nextStep)
                          const paymentId = params.id as string
                          const mode = searchParams.get('mode')
                          const modeParam = mode ? `&mode=${mode}` : ''

                          if (paymentId) {
                            router.push(
                              `/transactions/manual/new/${paymentId}?step=${nextStep}${modeParam}`
                            )
                          } else {
                            router.push(
                              `/transactions/manual/new?step=${nextStep}${modeParam}`
                            )
                          }
                        }}
                        variant="contained"
                        sx={{
                          minWidth: '100px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          textTransform: 'none',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          '&:hover': {
                            backgroundColor: '#1D4ED8',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          },
                        }}
                      >
                        Next Step
                      </Button>
                    )}
                  </Box>
                </>
              )}

              {/* EDIT MODE BUTTONS */}
              {!isReadOnly && (
                <>
                  {/* Left side - Cancel button */}
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

                  {/* Right side - Action buttons */}
                  <Box display="flex" gap={2}>
                    {activeStep > 0 && (
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
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 500,
                          fontStyle: 'normal',
                          fontSize: '14px',
                          lineHeight: '20px',
                          letterSpacing: 0,
                          backgroundColor:
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.primary.main, 0.2)
                              : '#DBEAFE',
                          color:
                            theme.palette.mode === 'dark'
                              ? theme.palette.primary.light
                              : '#155DFC',
                          border: 'none',
                          '&:hover': {
                            backgroundColor:
                              theme.palette.mode === 'dark'
                                ? alpha(theme.palette.primary.main, 0.3)
                                : alpha('#DBEAFE', 0.8),
                          },
                        }}
                      >
                        Back
                      </Button>
                    )}

                    {/* Primary action button */}
                    {activeStep === 0 ? (
                      <Button
                        onClick={() => {
                          methods.handleSubmit(async () => {
                            if (isEditMode) {
                              await handleUpdate()
                            } else {
                              await handleSaveAndNext()
                            }
                          }, onError)()
                        }}
                        variant="contained"
                        disabled={createProjectWorkflowRequest.isPending}
                        sx={{
                          minWidth: '120px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          textTransform: 'none',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          '&:hover': {
                            backgroundColor: '#1D4ED8',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          },
                          '&:disabled': {
                            backgroundColor: '#9CA3AF',
                            color: '#FFFFFF',
                          },
                        }}
                      >
                        {createProjectWorkflowRequest.isPending
                          ? getLabel(
                              MANUAL_PAYMENT_LABELS.BUTTONS.SAVING,
                              'EN',
                              MANUAL_PAYMENT_LABELS.FALLBACKS.BUTTONS.SAVING
                            )
                          : isEditMode
                            ? getLabel(
                                MANUAL_PAYMENT_LABELS.BUTTONS.SAVE_NEXT,
                                'EN',
                                MANUAL_PAYMENT_LABELS.FALLBACKS.BUTTONS
                                  .SAVE_NEXT
                              )
                            : getLabel(
                                MANUAL_PAYMENT_LABELS.BUTTONS.SAVE_CONTINUE,
                                'EN',
                                MANUAL_PAYMENT_LABELS.FALLBACKS.BUTTONS
                                  .SAVE_CONTINUE
                              )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          if (activeStep === steps.length - 1) {
                            methods.handleSubmit(onSubmit, onError)()
                          } else {
                            handleNext()
                          }
                        }}
                        variant="contained"
                        disabled={createProjectWorkflowRequest.isPending}
                        sx={{
                          minWidth: '120px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          textTransform: 'none',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          '&:hover': {
                            backgroundColor: '#1D4ED8',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          },
                          '&:disabled': {
                            backgroundColor: '#9CA3AF',
                            color: '#FFFFFF',
                          },
                        }}
                      >
                        {createProjectWorkflowRequest.isPending
                          ? activeStep === steps.length - 1
                            ? 'Submitting...'
                            : 'Saving...'
                          : activeStep === steps.length - 1
                            ? 'Submit Payment'
                            : 'Continue'}
                      </Button>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </form>
    </FormProvider>
  )
}

// Main wrapper component with provider
export default function ManualPaymentStepperWrapper({
  isReadOnly = false,
}: ManualPaymentStepperWrapperProps = {}) {
  return (
    <ManualPaymentDataProvider>
      <ManualPaymentStepperContent isReadOnly={isReadOnly} />
    </ManualPaymentDataProvider>
  )
}
