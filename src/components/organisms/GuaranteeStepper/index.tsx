'use client'

import React, { useState, useEffect } from 'react'
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
} from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

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
import {
  suretyBondService,
  type SuretyBondResponse,
} from '../../../services/api/suretyBondService'
import { useSuretyBondLabelsWithCache } from '@/hooks/useSuretyBondLabelsWithCache'
import { getSuretyBondLabel } from '@/constants/mappings/suretyBondMapping'
import { useAppStore } from '@/store'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'
import { GuaranteeFormSchema } from '@/lib/validation/guaranteeSchemas'

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
  const [originalSuretyBondData, setOriginalSuretyBondData] =
    useState<SuretyBondResponse | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const isDarkMode = useIsDarkMode()

  // Standardized surety bond label resolver
  const language = useAppStore((s) => s.language) || 'EN'
  const { getLabel } = useSuretyBondLabelsWithCache(language)

  // Use create and update surety bond hooks
  const { createSuretyBond, loading: createLoading } = useCreateSuretyBond()
  const { updateSuretyBond, loading: updateLoading } = useUpdateSuretyBond()
  const createWorkflowRequest = useCreateDeveloperWorkflowRequest()
  // Helper function to get translated label with mapping fallback
  const getTranslatedLabel = (configId: string, fallback?: string): string => {
    return getLabel(
      configId,
      language,
      fallback ?? getSuretyBondLabel(configId)
    )
  }

  // Dynamic step labels
  const steps = [
    getTranslatedLabel('CDL_SB_STEP_DETAILS'),
    getTranslatedLabel('CDL_SB_STEP_DOCUMENTS'),
    getTranslatedLabel('CDL_SB_STEP_REVIEW'),
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

  // Fetch full surety bond data when in edit mode
  React.useEffect(() => {
    const fetchSuretyBondData = async () => {
      const guaranteeId = params.id as string
      if (guaranteeId && !guaranteeId.startsWith('temp_')) {
        try {
          const data = await suretyBondService.getSuretyBondById(guaranteeId)
          setOriginalSuretyBondData(data)
        } catch (error) {
          console.error('Error fetching surety bond data:', error)
        }
      }
    }
    fetchSuretyBondData()
  }, [params.id])

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
    resolver: zodResolver(GuaranteeFormSchema) as any,
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
    mode: 'onChange',
  })

  const handleNext = async () => {
    let isStepValid = false

    if (activeStep === 0) {
      isStepValid = await methods.trigger([
        'guaranteeRefNo',
        'guaranteeType',
        'guaranteeDate',
        'projectCif',
        'projectName',
        'developerName',
        'guaranteeAmount',
        'issuerBank',
      ])
    } else if (activeStep === 1) {
      isStepValid = await methods.trigger(['documents'])
    } else {
      isStepValid = true
    }

    if (!isStepValid) {
      toast.error(
        'Please fix validation errors before proceeding to the next step.'
      )
      return
    }

    if (activeStep < steps.length - 1) {
      const nextStep = activeStep + 1
      setActiveStep(nextStep)

      const guaranteeId = params.id as string
      const modeParam = isViewMode ? '&mode=view' : ''
      router.push(
        `/surety_bond/new/${guaranteeId}?step=${nextStep}${modeParam}`
      )

      toast.success(`Moved to step ${nextStep + 1}.`)
    } else {
      if (isViewMode) {
        router.push('/surety_bond')
        toast.success('View completed! Redirecting to guarantee page.')
        return
      }

      try {
        if (!savedId) {
          toast.error('No saved guarantee ID found for submission')
          return
        }

        if (!originalSuretyBondData) {
          toast.error(
            'Original surety bond data not loaded. Please refresh the page.'
          )
          return
        }

        const formValues = methods.getValues()

        // Find the selected build partner ID from the name
        const selectedDeveloper = buildPartners.find(
          (bp) => bp.bpName === formValues.developerName
        )
        const developerId = selectedDeveloper?.id || null

        // Merge original data with form changes for workflow payload
        const workflowPayload = {
          id: parseInt(savedId),
          suretyBondReferenceNumber:
            formValues.guaranteeRefNo ||
            originalSuretyBondData.suretyBondReferenceNumber,
          suretyBondDate: formValues.guaranteeDate
            ? dayjs(formValues.guaranteeDate).toISOString()
            : originalSuretyBondData.suretyBondDate,
          suretyBondName:
            formValues.guaranteeRefNo || originalSuretyBondData.suretyBondName,
          suretyBondOpenEnded:
            formValues.openEndedGuarantee ??
            originalSuretyBondData.suretyBondOpenEnded,
          suretyBondExpirationDate: formValues.guaranteeExpirationDate
            ? dayjs(formValues.guaranteeExpirationDate).toISOString()
            : originalSuretyBondData.suretyBondExpirationDate,
          suretyBondAmount: formValues.guaranteeAmount
            ? parseFloat(formValues.guaranteeAmount)
            : originalSuretyBondData.suretyBondAmount,
          suretyBondProjectCompletionDate:
            originalSuretyBondData.suretyBondProjectCompletionDate,
          suretyBondNoOfAmendment:
            formValues.noOfAmendments ||
            originalSuretyBondData.suretyBondNoOfAmendment,
          suretyBondContractor: originalSuretyBondData.suretyBondContractor,
          deleted: originalSuretyBondData.deleted,
          enabled: originalSuretyBondData.enabled,
          suretyBondNewReadingAmendment:
            formValues.suretyBondNewReadingAmendment ||
            originalSuretyBondData.suretyBondNewReadingAmendment,

          // Keep full nested objects from original data
          suretyBondTypeDTO: formValues.guaranteeType
            ? { id: parseInt(formValues.guaranteeType) }
            : originalSuretyBondData.suretyBondTypeDTO,

          realEstateAssestDTO: formValues.projectName
            ? { id: parseInt(formValues.projectName) }
            : originalSuretyBondData.realEstateAssestDTO,

          // Build Partner can be updated by the user
          buildPartnerDTO: developerId
            ? { id: developerId }
            : originalSuretyBondData.buildPartnerDTO,

          issuerBankDTO: formValues.issuerBank
            ? { id: parseInt(formValues.issuerBank) }
            : originalSuretyBondData.issuerBankDTO,

          suretyBondStatusDTO: formValues.status
            ? { id: parseInt(formValues.status) }
            : originalSuretyBondData.suretyBondStatusDTO,
          taskStatusDTO: originalSuretyBondData.taskStatusDTO,
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
        router.push('/surety_bond')
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
      router.push(
        `/surety_bond/new/${guaranteeId}?step=${prevStep}${modeParam}`
      )
      toast.success(
        `${getTranslatedLabel('CDL_SB_MOVED_BACK_TO')} ${steps[prevStep]} ${getTranslatedLabel('CDL_SB_STEP')}.`
      )
    }
  }

  const handleReset = () => {
    if (isViewMode) {
      router.push('/surety_bond')
      return
    }

    setActiveStep(0)
    methods.reset()
    setSavedId(null)
    setIsEditMode(false)
    toast.success(getTranslatedLabel('CDL_SB_FORM_RESET'))
    router.push('/surety_bond')
  }

  const handleSaveAndNext = async () => {
    try {
      let isStepValid = false

      if (activeStep === 0) {
        isStepValid = await methods.trigger([
          'guaranteeRefNo',
          'guaranteeType',
          'guaranteeDate',
          'projectCif',
          'projectName',
          'developerName',
          'guaranteeAmount',
          'issuerBank',
        ])
      } else if (activeStep === 1) {
        isStepValid = await methods.trigger(['documents'])
      }

      if (!isStepValid) {
        toast.error(
          'Please fix validation errors before saving and proceeding to the next step.'
        )
        return
      }

      const formValues = methods.getValues()

      // Find the selected build partner ID from the name
      const selectedDeveloper = buildPartners.find(
        (bp) => bp.bpName === formValues.developerName
      )
      const developerId = selectedDeveloper?.id || null

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
        suretyBondStatusDTO: formValues.status
          ? { id: parseInt(formValues.status) }
          : null,
      }

      const result = await createSuretyBond(suretyBondData)

      if (result) {
        toast.success(getTranslatedLabel('CDL_SB_CREATED_SUCCESS'))
        setSavedId(result.id.toString())

        router.push(`/surety_bond/new/${result.id.toString()}?step=1`)
      } else {
        toast.error(getTranslatedLabel('CDL_SB_CREATE_FAILED'))
      }
    } catch (error) {
      toast.error(getTranslatedLabel('CDL_SB_CREATE_ERROR'))
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

      if (!originalSuretyBondData) {
        toast.error(
          'Original surety bond data not loaded. Please refresh the page.'
        )
        return
      }

      let isStepValid = false

      if (activeStep === 0) {
        isStepValid = await methods.trigger([
          'guaranteeRefNo',
          'guaranteeType',
          'guaranteeDate',
          'projectCif',
          'projectName',
          'developerName',
          'guaranteeAmount',
          'issuerBank',
        ])
      } else if (activeStep === 1) {
        isStepValid = await methods.trigger(['documents'])
      }

      if (!isStepValid) {
        toast.error('Please fix validation errors before updating.')
        return
      }

      const formValues = methods.getValues()

      // Find the selected build partner ID from the name
      const selectedDeveloper = buildPartners.find(
        (bp) => bp.bpName === formValues.developerName
      )
      const developerId = selectedDeveloper?.id || null

      // Merge original data with form changes - keep all original nested objects
      const updatePayload = {
        id: parseInt(savedId),
        suretyBondReferenceNumber:
          formValues.guaranteeRefNo ||
          originalSuretyBondData.suretyBondReferenceNumber,
        suretyBondDate: formValues.guaranteeDate
          ? dayjs(formValues.guaranteeDate).toISOString()
          : originalSuretyBondData.suretyBondDate,
        suretyBondName:
          formValues.guaranteeRefNo || originalSuretyBondData.suretyBondName,
        suretyBondOpenEnded:
          formValues.openEndedGuarantee ??
          originalSuretyBondData.suretyBondOpenEnded,
        suretyBondExpirationDate: formValues.guaranteeExpirationDate
          ? dayjs(formValues.guaranteeExpirationDate).toISOString()
          : originalSuretyBondData.suretyBondExpirationDate,
        suretyBondAmount: formValues.guaranteeAmount
          ? parseFloat(formValues.guaranteeAmount)
          : originalSuretyBondData.suretyBondAmount,
        suretyBondProjectCompletionDate:
          originalSuretyBondData.suretyBondProjectCompletionDate,
        suretyBondNoOfAmendment:
          formValues.noOfAmendments ||
          originalSuretyBondData.suretyBondNoOfAmendment,
        suretyBondContractor: originalSuretyBondData.suretyBondContractor,
        deleted: originalSuretyBondData.deleted,
        enabled: originalSuretyBondData.enabled,
        suretyBondNewReadingAmendment:
          formValues.suretyBondNewReadingAmendment ||
          originalSuretyBondData.suretyBondNewReadingAmendment,

        // Keep full nested objects from original data, only update if changed
        suretyBondTypeDTO: formValues.guaranteeType
          ? { id: parseInt(formValues.guaranteeType) }
          : originalSuretyBondData.suretyBondTypeDTO,

        realEstateAssestDTO: formValues.projectName
          ? { id: parseInt(formValues.projectName) }
          : originalSuretyBondData.realEstateAssestDTO,

        // Build Partner can be updated by the user
        buildPartnerDTO: developerId
          ? { id: developerId }
          : originalSuretyBondData.buildPartnerDTO,

        issuerBankDTO: formValues.issuerBank
          ? { id: parseInt(formValues.issuerBank) }
          : originalSuretyBondData.issuerBankDTO,

        suretyBondStatusDTO: formValues.status
          ? { id: parseInt(formValues.status) }
          : originalSuretyBondData.suretyBondStatusDTO,
        taskStatusDTO: originalSuretyBondData.taskStatusDTO,
      }

      await updateSuretyBond(savedId, updatePayload)

      toast.success(getTranslatedLabel('CDL_SB_UPDATED_SUCCESS'))

      // Navigate to next step after update
      const nextStep = activeStep + 1
      setActiveStep(nextStep)
      const guaranteeId = params.id as string
      const modeParam = isViewMode ? '&mode=view' : ''
      router.push(
        `/surety_bond/new/${guaranteeId}?step=${nextStep}${modeParam}`
      )
    } catch (error) {
      toast.error(getTranslatedLabel('CDL_SB_UPDATE_ERROR'))
    }
  }

  const handleEdit = async () => {
    try {
      setIsEditMode(true)
      setActiveStep(0)
    } catch (error) {}
  }

  const onSubmit = () => {
    setTimeout(() => {
      handleReset()
    }, 1000)
  }

  const onError = () => {}

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
            type="SURETY_BOND"
            entityId={savedId}
            isOptional={true}
            isReadOnly={isViewMode}
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
            onEditDocuments={() => {
              setActiveStep(1)
              const guaranteeId = params.id as string
              const modeParam = isViewMode ? '&mode=view' : ''
              router.push(`/surety_bond/new/${guaranteeId}?step=1${modeParam}`)
            }}
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
            backgroundColor: isDarkMode
              ? '#101828'
              : 'rgba(255, 255, 255, 0.75)',
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
              display="flex"
              justifyContent="space-between"
              sx={{ mt: 3, mx: 6, mb: 2 }}
            >
              <Button
                variant="outlined"
                onClick={handleReset}
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
                {getTranslatedLabel('CDL_SB_CANCEL')}
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
                    {getTranslatedLabel('CDL_SB_BACK')}
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
                      width: '134px',
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
                        ? getTranslatedLabel('CDL_SB_UPDATING')
                        : getTranslatedLabel('CDL_SB_CREATING')
                      : getTranslatedLabel('CDL_SB_SAVE_NEXT')}
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
                    {getTranslatedLabel('CDL_SB_NEXT')}
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
                      ? getTranslatedLabel('CDL_SB_SUBMIT')
                      : getTranslatedLabel('CDL_SB_NEXT')}
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
