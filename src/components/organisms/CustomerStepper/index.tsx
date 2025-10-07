'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
} from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'

import { STEP_LABELS, SKIP_VALIDATION_STEPS, DEFAULT_FORM_VALUES } from './constants'
import { StepperProps } from './types'
import { CustomerStep1, CustomerStep2, CustomerStep3, CustomerStep4 } from './steps'
import { CustomerData } from './customerTypes'

export default function CustomerStepperWrapper({
  customerId,
  initialStep = 0,
}: StepperProps = {}) {
  const [activeStep, setActiveStep] = useState(initialStep)
  const [isEditMode, setIsEditMode] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  
  // Check if we're in view mode (read-only)
  const mode = searchParams.get('mode')
  const isViewMode = mode === 'view'

  // Use form with default values
  const methods = useForm<CustomerData>({
    defaultValues: DEFAULT_FORM_VALUES,
  })

  // Define steps array
  const steps = STEP_LABELS

  // Handle URL parameters for ID and step
  useEffect(() => {
    const customerIdParam = params.id as string
    const step = searchParams.get('step')

    if (customerIdParam) {
      if (!customerIdParam.startsWith('temp_')) {
        setSavedId(customerIdParam)
        setIsEditMode(true)
      }
    }

    if (step) {
      const stepNumber = parseInt(step)
      if (stepNumber >= 0 && stepNumber < steps.length) {
        setActiveStep(stepNumber)
      }
    }
  }, [params, searchParams, steps.length])

  // Edit navigation handler
  const handleEditStep = useCallback(
    (stepNumber: number) => {
      setActiveStep(stepNumber)
      setIsEditMode(true)
      toast.success(`Now editing step ${stepNumber + 1} data`)
    },
    []
  )

  const handleNext = async () => {
    if (activeStep < steps.length - 1) {
      const nextStep = activeStep + 1
      setActiveStep(nextStep)

      const customerIdParam = params.id as string || customerId || 'temp_customer'
      const modeParam = isViewMode ? '&mode=view' : ''
      router.push(`/master-customers/customers/${customerIdParam}?step=${nextStep}${modeParam}`)

      toast.success(`Moved to step ${nextStep + 1}.`)
    } else {
      if (isViewMode) {
          router.push('/master-customers/customers')
        toast.success('View completed! Redirecting to customers page.')
        return
      }
      // Final step - Submit and create workflow request
      try {
        if (!savedId) {
          toast.error('No saved customer ID found for submission')
          return
        }

        // Get form values for workflow request
        const formValues = methods.getValues()

        // Prepare the payload for workflow request
        const workflowPayload = {
          customerId: formValues.customerId || null,
          customerName: formValues.customerName || null,
          partyCif: formValues.partyCif || null,
          personName: formValues.personName || null,
          email: formValues.email || null,
          mobile: formValues.mobile || null,
          // Add other necessary fields
        }

        // TODO: Implement workflow request creation
        // await createWorkflowRequest.mutateAsync({
        //   referenceId: savedId,
        //   payloadData: workflowPayload as Record<string, unknown>,
        //   referenceType: 'CUSTOMER',
        //   moduleName: 'CUSTOMER_MASTER',
        //   actionKey: 'CREATE',
        // })

        toast.success('Customer submitted successfully! Workflow request created.')
        router.push('/master-customers/customers')
      } catch (error) {
        toast.error('Error submitting customer. Please try again.')
      }
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      const prevStep = activeStep - 1
      setActiveStep(prevStep)
      const customerIdParam = params.id as string || customerId || 'temp_customer'
      const modeParam = isViewMode ? '&mode=view' : ''
      router.push(`/master-customers/customers/${customerIdParam}?step=${prevStep}${modeParam}`)
      toast.success(`Moved back to ${steps[prevStep]} step.`)
    }
  }

  const handleReset = () => {
    if (isViewMode) {
      router.push('/master-customers/customers')
      return
    }

    setActiveStep(0)
    methods.reset(DEFAULT_FORM_VALUES)
    setSavedId(null)
    setIsEditMode(false)
    toast.success('Form reset successfully. All data cleared.')
    router.push('/master-customers/customers')
  }

  const handleSaveAndNext = async () => {
    try {
      // Get all form values
      const formValues = methods.getValues()

      // For now, just simulate saving and move to next step
      // In a real implementation, you would call the API here
      toast.success('Customer details saved successfully! Moving to next step.')
      setSavedId('temp_customer_id') // Set a temporary ID

      router.push(`/master-customers/customers/temp_customer_id?step=1`)
    } catch (error) {
      toast.error('Error saving customer details')
    }
  }

  const handleUpdate = async () => {
    try {
      if (!savedId) {
        toast.error('No saved ID found for update')
        return
      }

      // Get form values
      const formValues = methods.getValues()

      // TODO: Implement update API call
      toast.success('Customer updated successfully!')
      
      // Navigate to next step
      setActiveStep(1)
    } catch (error) {
      toast.error('Error updating customer')
    }
  }

  const handleEdit = async () => {
    try {
      setIsEditMode(true)
      setActiveStep(0)
    } catch (error) {
      console.error('Error setting edit mode:', error)
    }
  }

  const onSubmit = () => {
    // Reset form after successful submission
    setTimeout(() => {
      handleReset()
    }, 1000)
  }

  const onError = () => {
    // Handle validation errors if needed
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <CustomerStep1 isReadOnly={isViewMode} />
        )
      case 1:
        return (
          <CustomerStep2 isReadOnly={isViewMode} />
        )
      case 2:
        if (!savedId) {
          return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="error">
                No customer ID available for document upload
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please go back to Step 1 and save the customer first.
              </Typography>
            </Box>
          )
        }

        return (
          <CustomerStep3
            customerId={savedId}
            isReadOnly={isViewMode}
          />
        )
      case 3:
        return (
          <CustomerStep4
            customerId={savedId}
            onEditStep={handleEditStep}
            isReadOnly={isViewMode}
          />
        )
      default:
        return null
    }
  }

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: '#f8fafc',
        }}
      >
        <form
          onSubmit={methods.handleSubmit(
            () => onSubmit(),
            () => onError()
          )}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
        overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              width: '100%',
              backgroundColor: '#FFFFFFBF',
              borderRadius: '16px',
              paddingTop: '16px',
              border: '1px solid #FFFFFF',
              flexShrink: 0,
              margin: '16px',
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
                      }}
                    >
                      {label}
                    </Typography>
                  </StepLabel>
            </Step>
          ))}
        </Stepper>
          </Box>

          <Box
            sx={{
          flex: 1, 
          overflow: 'auto', 
          px: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a1a1a1',
          },
            }}
          >
            {getStepContent(activeStep)}
        </Box>

          <Box
            sx={{
              flexShrink: 0,
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e5e7eb',
              padding: '16px 24px',
          display: 'flex', 
          justifyContent: 'space-between', 
              alignItems: 'center',
              minHeight: '80px',
              boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Button
              onClick={handleReset}
              sx={{
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
              variant="outlined"
            >
              Cancel
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep !== 0 && (
                <Button
                  onClick={handleBack}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: 0,
                    width: '114px',
                    height: '36px',
                    borderRadius: '6px',
                  }}
                  variant="outlined"
                >
                  Back
                </Button>
              )}
              
              {/* Show Save/Next button on first step when not in view mode */}
              {activeStep === 0 && !isViewMode && (
                <Button
                  onClick={() => {
                    if (isEditMode) {
                      handleUpdate()
                    } else {
                      handleSaveAndNext()
                    }
                  }}
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
                  {isEditMode ? 'Update' : 'Save/Next'}
                </Button>
              )}
              
              {/* Show Next button on first step when in view mode */}
              {isViewMode && activeStep === 0 && (
                <Button
                  onClick={handleNext}
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
                  Next
                </Button>
              )}
              
              {/* Show Next/Submit button on all other steps */}
              {activeStep > 0 && (
                <Button
                  onClick={handleNext}
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
                  {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                </Button>
              )}
            </Box>
        </Box>
        </form>
      </Box>
    </FormProvider>
  )
}
