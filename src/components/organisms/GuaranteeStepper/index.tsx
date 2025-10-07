'use client'

import React, { useState } from 'react'
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
} from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'

import { Step1, Step2 } from './steps'
import DocumentUploadFactory from '../DocumentUpload/DocumentUploadFactory'
import { DocumentItem } from '../DeveloperStepper/developerTypes'
import { useCreateDeveloperWorkflowRequest } from '../../../hooks/workflow'

import { GuaranteeData } from './guaranteeTypes'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import {
  useCreateSuretyBond,
  useUpdateSuretyBond,
} from '../../../hooks/useSuretyBonds'
import { BuildPartnerService } from '../../../services/api/buildPartnerService'
import { useSuretyBondTranslationsByPattern } from '../../../hooks/useSuretyBondTranslations'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'

interface GuaranteeStepperWrapperProps {
  isViewMode?: boolean
}

export default function GuaranteeStepperWrapper({
  isViewMode = false,
}: GuaranteeStepperWrapperProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [isEditMode, setIsEditMode] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [buildPartners, setBuildPartners] = useState<
    Array<{ id: number; bpName: string | null }>
  >([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()

  // Use surety bond translations for labels
  const { translations: sbTranslations, loading: sbTranslationsLoading } =
    useSuretyBondTranslationsByPattern('CDL_SB_')

  // Use create and update surety bond hooks
  const { createSuretyBond, loading: createLoading } = useCreateSuretyBond()
  const { updateSuretyBond, loading: updateLoading } = useUpdateSuretyBond()
  const createWorkflowRequest = useCreateDeveloperWorkflowRequest()
  // Helper function to get translated label
  const getTranslatedLabel = (configId: string, fallback: string): string => {
    if (sbTranslationsLoading || !sbTranslations.length) {
      return fallback
    }

    const translation = sbTranslations.find((t) => t.configId === configId)
    return translation?.configValue || fallback
  }

  // Dynamic step labels
  const steps = [
    getTranslatedLabel('CDL_SB_STEP_DETAILS', 'Details'),
    getTranslatedLabel('CDL_SB_STEP_DOCUMENTS', 'Documents'),
    getTranslatedLabel('CDL_SB_STEP_REVIEW', 'Review'),
  ]

  // Fetch build partners for mapping developer names to IDs
  React.useEffect(() => {
    const fetchBuildPartners = async () => {
      try {
        const service = new BuildPartnerService()
        const res = await service.getBuildPartners(0, 100)
        const partners = res?.content || []
        setBuildPartners(partners)
      } catch (error) {
        setBuildPartners([])
      }
    }
    fetchBuildPartners()
  }, [])

  // Handle URL parameters for ID and step
  React.useEffect(() => {
    const guaranteeId = params.id as string
    const step = searchParams.get('step')

    if (guaranteeId) {
      if (!guaranteeId.startsWith('temp_')) {
        setSavedId(guaranteeId)
        setIsEditMode(true)
      }
    }

    if (step) {
      const stepNumber = parseInt(step)
      if (stepNumber >= 0 && stepNumber < steps.length) {
        setActiveStep(stepNumber)
      }
    }
  }, [params, searchParams])

  const methods = useForm<GuaranteeData>({
    defaultValues: {
      guaranteeRefNo: '',
      guaranteeType: '',
      guaranteeDate: null,
      projectCif: '',
      projectName: '',
      developerName: '',
      openEndedGuarantee: false,
      projectCompletionDate: null,
      noOfAmendments: '',
      guaranteeExpirationDate: null,
      guaranteeAmount: '',
      suretyBondNewReadingAmendment: '',
      issuerBank: '',
      status: '',
      documents: [],
    },
  })

  const handleNext = async () => {
    // if (activeStep < steps.length - 1) {
    //   const nextStep = activeStep + 1
    //   setActiveStep(nextStep)

    //   const guaranteeId = params.id as string
    //   router.push(`/guarantee/new/${guaranteeId}?step=${nextStep}`)

    //   const stepNames = ['Details', 'Documents', 'Review']
    //   toast.success(`Moved to ${stepNames[nextStep]} step.`)
    // } else {
    //   router.push('/guarantee')
    //   toast.success('Guarantee completed! Redirecting to guarantee page.')
    // }

    if (activeStep < steps.length - 1) {
      const nextStep = activeStep + 1
      setActiveStep(nextStep)

      const guaranteeId = params.id as string
      const modeParam = isViewMode ? '&mode=view' : ''
      router.push(`/guarantee/new/${guaranteeId}?step=${nextStep}${modeParam}`)

      toast.success(`Moved to step ${nextStep + 1}.`)
    } else {
      if (isViewMode) {
        // In view mode, just go back to the guarantee list
        router.push('/guarantee')
        toast.success('View completed! Redirecting to guarantee page.')
        return
      }
      // Final step - Submit and create workflow request
      try {
        if (!savedId) {
          toast.error('No saved guarantee ID found for submission')
          return
        }

        // Get form values for workflow request
        const formValues = methods.getValues()

        // Prepare the payload for workflow request
        const workflowPayload = {
          suretyBondReferenceNumber: formValues.guaranteeRefNo || null,
          suretyBondDate: formValues.guaranteeDate
            ? dayjs(formValues.guaranteeDate).toISOString()
            : null,
          suretyBondTypeDTO: formValues.guaranteeType
            ? { id: parseInt(formValues.guaranteeType) }
            : null,
          realEstateAssestDTO: formValues.projectName
            ? { id: parseInt(formValues.projectName) }
            : null,
          buildPartnerDTO: formValues.developerName
            ? {
                id:
                  buildPartners.find(
                    (bp) => bp.bpName === formValues.developerName
                  )?.id || 0,
              }
            : null,
          suretyBondOpenEnded: formValues.openEndedGuarantee || false,
          suretyBondNoOfAmendment: formValues.noOfAmendments || null,
          suretyBondExpirationDate: formValues.guaranteeExpirationDate
            ? dayjs(formValues.guaranteeExpirationDate).toISOString()
            : null,
          suretyBondAmount: formValues.guaranteeAmount
            ? parseFloat(formValues.guaranteeAmount)
            : null,
          issuerBankDTO: formValues.issuerBank
            ? { id: parseInt(formValues.issuerBank) }
            : null,
          suretyBondNewReadingAmendment:
            formValues.suretyBondNewReadingAmendment || null,
        }

        await createWorkflowRequest.mutateAsync({
          referenceId: savedId,
          payloadData: workflowPayload as Record<string, unknown>,
          referenceType: 'SURETY_BOND',
          moduleName: 'SURETY_BOND',
          actionKey: 'CREATE',
        })

        toast.success(
          'Guarantee submitted successfully! Workflow request created.'
        )
        router.push('/guarantee')
      } catch (error) {
        toast.error('Error submitting guarantee. Please try again.')
      }
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      const prevStep = activeStep - 1
      setActiveStep(prevStep)
      const guaranteeId = params.id as string
      const modeParam = isViewMode ? '&mode=view' : ''
      router.push(`/guarantee/new/${guaranteeId}?step=${prevStep}${modeParam}`)
      toast.success(
        `${getTranslatedLabel('CDL_SB_MOVED_BACK_TO', 'Moved back to')} ${steps[prevStep]} ${getTranslatedLabel('CDL_SB_STEP', 'step')}.`
      )
    }
  }

  const handleReset = () => {
    if (isViewMode) {
      // In view mode, just go back to the guarantee list
      router.push('/guarantee')
      return
    }

    setActiveStep(0)
    methods.reset()
    setSavedId(null)
    setIsEditMode(false)
    toast.success(
      `${getTranslatedLabel('CDL_SB_FORM_RESET', 'Form reset successfully. All data cleared.')}`
    )
    router.push('/guarantee')
  }

  const handleSaveAndNext = async () => {
    try {
      // Get all form values
      const formValues = methods.getValues()

      // Prepare the API payload
      const suretyBondData = {
        suretyBondReferenceNumber: formValues.guaranteeRefNo || null,
        suretyBondDate: formValues.guaranteeDate
          ? dayjs(formValues.guaranteeDate).toISOString()
          : null,
        suretyBondTypeDTO: formValues.guaranteeType
          ? { id: parseInt(formValues.guaranteeType) }
          : null,
        realEstateAssestDTO: formValues.projectName
          ? { id: parseInt(formValues.projectName) }
          : null,
        buildPartnerDTO: formValues.developerName
          ? {
              id:
                buildPartners.find(
                  (bp) => bp.bpName === formValues.developerName
                )?.id || 0,
            }
          : null,
        suretyBondOpenEnded: formValues.openEndedGuarantee || false,
        suretyBondNoOfAmendment: formValues.noOfAmendments || null,
        suretyBondExpirationDate: formValues.guaranteeExpirationDate
          ? dayjs(formValues.guaranteeExpirationDate).toISOString()
          : null,
        suretyBondAmount: formValues.guaranteeAmount
          ? parseFloat(formValues.guaranteeAmount)
          : null,
        issuerBankDTO: formValues.issuerBank
          ? { id: parseInt(formValues.issuerBank) }
          : null,
        suretyBondNewReadingAmendment:
          formValues.suretyBondNewReadingAmendment || null,
      }

      const result = await createSuretyBond(suretyBondData)

      if (result) {
        toast.success(
          `${getTranslatedLabel('CDL_SB_CREATED_SUCCESS', 'Surety bond created successfully! Moving to document upload step.')}`
        )
        setSavedId(result.id.toString())

        router.push(`/guarantee/new/${result.id.toString()}?step=1`)
      } else {
        toast.error(
          `${getTranslatedLabel('CDL_SB_CREATE_FAILED', 'Failed to create surety bond')}`
        )
      }
    } catch (error) {
      toast.error(
        `${getTranslatedLabel('CDL_SB_CREATE_ERROR', 'Error creating surety bond')}`
      )
    }
  }

  const handleUpdate = async () => {
    try {
      if (!savedId) {
        toast.error(
          `${getTranslatedLabel('CDL_SB_NO_ID_ERROR', 'No saved ID found for update')}`
        )
        return
      }
      // Get form values
      const formValues = methods.getValues()

      // Find developer ID from build partners
      const selectedDeveloper = buildPartners.find(
        (bp) => bp.bpName === formValues.developerName
      )
      const developerId = selectedDeveloper?.id || null

      // Prepare update payload
      const updatePayload = {
        id: parseInt(savedId), // Add the ID to the payload
        suretyBondReferenceNumber: formValues.guaranteeRefNo || null,
        suretyBondDate: formValues.guaranteeDate
          ? dayjs(formValues.guaranteeDate).toISOString()
          : null,
        suretyBondName: formValues.guaranteeRefNo || null, // Using reference number as name
        suretyBondTypeDTO: formValues.guaranteeType
          ? { id: parseInt(formValues.guaranteeType) }
          : null,
        realEstateAssestDTO: formValues.projectName
          ? { id: parseInt(formValues.projectName) }
          : null,
        buildPartnerDTO: developerId ? { id: developerId } : null,
        suretyBondOpenEnded: formValues.openEndedGuarantee || false,
        suretyBondNoOfAmendment: formValues.noOfAmendments || null,
        suretyBondExpirationDate: formValues.guaranteeExpirationDate
          ? dayjs(formValues.guaranteeExpirationDate).toISOString()
          : null,
        suretyBondAmount: formValues.guaranteeAmount
          ? parseFloat(formValues.guaranteeAmount)
          : null,
        issuerBankDTO: formValues.issuerBank
          ? { id: parseInt(formValues.issuerBank) }
          : null,
        suretyBondNewReadingAmendment:
          formValues.suretyBondNewReadingAmendment || null,
      }

      // Call update API
      await updateSuretyBond(savedId, updatePayload)

      toast.success(
        `${getTranslatedLabel('CDL_SB_UPDATED_SUCCESS', 'Surety bond updated successfully!')}`
      )
      // Navigate to next step
      setActiveStep(1)
    } catch (error) {
      toast.error(
        `${getTranslatedLabel('CDL_SB_UPDATE_ERROR', 'Error updating surety bond')}`
      )
    }
  }

  const handleEdit = async () => {
    try {
      setIsEditMode(true)
      setActiveStep(0)
    } catch (error) {}
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
          <Step1
            savedId={savedId}
            isEditMode={isEditMode}
            isViewMode={isViewMode}
          />
        )
      case 1:
        if (!savedId) {
          return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="error">
                {getTranslatedLabel(
                  'CDL_SB_NO_ID_ERROR',
                  'No guarantee ID available for document upload'
                )}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {getTranslatedLabel(
                  'CDL_SB_GO_BACK_MESSAGE',
                  'Please go back to Step 1 and save the guarantee first.'
                )}
              </Typography>
            </Box>
          )
        }

        return (
          <DocumentUploadFactory
            type="BUILD_PARTNER"
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
            suretyBondId={savedId}
            isViewMode={isViewMode}
          />
        )
      default:
        return null
    }
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(
          () => onSubmit(),
          () => onError()
        )}
      >
        <Box
          sx={{
            width: '100%',
            backgroundColor: '#FFFFFFBF',
            borderRadius: '16px',
            paddingTop: '16px',
            border: '1px solid #FFFFFF',
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

          <Box sx={{ my: 4, backgroundColor: '#FFFFFFBF', boxShadow: 'none' }}>
            {getStepContent(activeStep)}

            <Box
              display="flex"
              justifyContent="space-between"
              sx={{ backgroundColor: '#FFFFFFBF', mt: 3, mx: 6, mb: 2 }}
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
                }}
              >
                {getTranslatedLabel('CDL_SB_CANCEL', 'Cancel')}
              </Button>
              <Box>
                {activeStep !== 0 && (
                  <Button
                    onClick={handleBack}
                    sx={{
                      mr: 2,
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 500,
                      fontStyle: 'normal',
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: 0,
                    }}
                    variant="outlined"
                  >
                    {getTranslatedLabel('CDL_SB_BACK', 'Back')}
                  </Button>
                )}
                {activeStep === 0 && !isViewMode && (
                  <Button
                    onClick={() => {
                      if (isEditMode) {
                        handleUpdate()
                      } else {
                        handleSaveAndNext()
                      }
                    }}
                    disabled={createLoading || updateLoading}
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
                    {createLoading || updateLoading
                      ? isEditMode
                        ? getTranslatedLabel('CDL_SB_UPDATING', 'Updating...')
                        : getTranslatedLabel('CDL_SB_CREATING', 'Creating...')
                      : isEditMode
                        ? getTranslatedLabel('CDL_SB_UPDATE', 'Update')
                        : getTranslatedLabel('CDL_SB_SAVE_NEXT', 'Save/Next')}
                  </Button>
                )}
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
                    {getTranslatedLabel('CDL_SB_NEXT', 'Next')}
                  </Button>
                )}
                {activeStep !== 0 && (
                  <Button
                    onClick={handleNext}
                    disabled={
                      activeStep === steps.length - 1
                        ? createWorkflowRequest.isPending
                        : false
                    }
                    variant="contained"
                    // sx={{
                    //   fontFamily: 'Outfit, sans-serif',
                    //   fontWeight: 500,
                    //   fontStyle: 'normal',
                    //   fontSize: '14px',
                    //   lineHeight: '20px',
                    //   letterSpacing: 0,
                    // }}
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
                    {activeStep === steps.length - 1
                      ? getTranslatedLabel('CDL_SB_SUBMIT', 'Submit')
                      : getTranslatedLabel('CDL_SB_NEXT', 'Next')}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </form>
    </FormProvider>
  )
}
