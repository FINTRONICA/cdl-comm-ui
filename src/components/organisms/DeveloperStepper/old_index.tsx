'use client'

// SIMPLIFIED: No backend APIs implemented yet
// This component works with pure local state - no persistence
// TODO: Add API integration when backend is ready

import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { useBuildPartnerStepManager, useBuildPartnerStepStatus } from '@/hooks'
import { useRouter } from 'next/navigation'
import { ValidationHelper } from '@/lib/validation/utils/validationHelper'
import {
  DeveloperStepperSchemas,
  getStepValidationKey,
} from '@/lib/validation/developerSchemas'
import { convertDatePickerToZonedDateTime, formatDate } from '@/utils'

import Step1 from './steps/Step1'
import Step2 from './steps/Step2'
import Step3 from './steps/Step3'
import Step4 from './steps/Step4'
import Step5 from './steps/Step5'
import DocumentUploadStep from './steps/DocumentUploadStep'

import { ProjectData } from './developerTypes'
import { getBuildPartnerLabel } from '../../../constants/mappings/buildPartnerMapping'

const steps = [
  getBuildPartnerLabel('CDL_BP_DETAILS'),
  'Documents (Optional)',
  getBuildPartnerLabel('CDL_BP_CONTACT'),
  getBuildPartnerLabel('CDL_BP_FEES'),
  getBuildPartnerLabel('CDL_BP_BENE_INFO'),
  'Reviewxcxc',
]

export default function DeveloperStepperWrapper({
  developerId,
  initialStep = 0,
}: {
  developerId?: string
  initialStep?: number
} = {}) {
  const [activeStep, setActiveStep] = useState(initialStep)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [shouldResetForm, setShouldResetForm] = useState(true)

  const router = useRouter()

  // Use our step management hooks - ENABLED for API integration
  const stepManager = useBuildPartnerStepManager()

  // Get step status and data for the developer
  const {
    data: stepStatus,
    isLoading: isLoadingStepStatus,
    error: stepStatusError,
  } = useBuildPartnerStepStatus(developerId || '')

  const methods = useForm<ProjectData>({
    defaultValues: {
      // Step 1: Build Partner Details
      bpDeveloperId: '',
      bpCifrera: '',
      bpDeveloperRegNo: '',
      bpName: '',
      bpMasterName: '',
      bpNameLocal: '',
      bpOnboardingDate: null,
      bpContactAddress: '',
      bpContactTel: '',
      bpPoBox: '',
      bpMobile: '',
      bpFax: '',
      bpEmail: '',
      bpLicenseNo: '',
      bpLicenseExpDate: null,
      bpWorldCheckFlag: false,
      bpWorldCheckRemarks: '',
      bpMigratedData: false,
      bpremark: '',
      bpRegulatorDTO: {
        id: 0,
      },
      // Legacy fields (keeping for compatibility)
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
      teamLeaderName: '',

      accounts: [
        {
          trustAccountNumber: '',
          ibanNumber: '',
          dateOpened: null,
          accountTitle: '',
          currency: 'AED',
        },
      ],

      contactData: [
        {
          name: '',
          address: '',
          email: '',
          pobox: '',
          countrycode: '',
          mobileno: '',
          telephoneno: '',
          fax: '',
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
    mode: 'onChange',
  })

  // Load saved data when component mounts or step changes
  useEffect(() => {
    if (stepStatus && developerId && shouldResetForm) {
      console.log('*************Step Status*************', stepStatus)

      // Populate form wsgith saved data based on current step
      const currentStepData =
        stepStatus.stepData[
          `step${activeStep + 1}` as keyof typeof stepStatus.stepData
        ]

      if (currentStepData) {
        try {
          // Convert date strings to dayjs objects for form compatibility
          let processedData

          // For Step 2, 3, 4 - don't spread currentStepData as it contains array data
          if (activeStep === 1 || activeStep === 2 || activeStep === 3) {
            processedData = {} // Start with clean object
          } else {
            processedData = { ...currentStepData } // For Step 1, use form data
          }

          // Convert date fields to dayjs objects (only for Step 1)
          if (activeStep === 0) {
            if (
              currentStepData.bpOnboardingDate &&
              typeof currentStepData.bpOnboardingDate === 'string'
            ) {
              processedData.bpOnboardingDate = dayjs(
                currentStepData.bpOnboardingDate
              )
            }
            if (
              currentStepData.bpLicenseExpDate &&
              typeof currentStepData.bpLicenseExpDate === 'string'
            ) {
              processedData.bpLicenseExpDate = dayjs(
                currentStepData.bpLicenseExpDate
              )
            }
            if (
              currentStepData.projectStartDate &&
              typeof currentStepData.projectStartDate === 'string'
            ) {
              processedData.projectStartDate = dayjs(
                currentStepData.projectStartDate
              )
            }
            if (
              currentStepData.projectEndDate &&
              typeof currentStepData.projectEndDate === 'string'
            ) {
              processedData.projectEndDate = dayjs(
                currentStepData.projectEndDate
              )
            }

            // Convert string booleans to actual booleans (only for Step 1)
            if (typeof currentStepData.bpWorldCheckFlag === 'string') {
              processedData.bpWorldCheckFlag =
                currentStepData.bpWorldCheckFlag === 'true'
            } else if (typeof currentStepData.bpWorldCheckFlag === 'boolean') {
              processedData.bpWorldCheckFlag = currentStepData.bpWorldCheckFlag
            } else {
              processedData.bpWorldCheckFlag = false
            }

            if (typeof currentStepData.bpMigratedData === 'string') {
              processedData.bpMigratedData =
                currentStepData.bpMigratedData === 'true'
              d
            } else if (typeof currentStepData.bpMigratedData === 'boolean') {
              processedData.bpMigratedData = currentStepData.bpMigratedData
            } else {
              processedData.bpMigratedData = false
            }

            // Copy other Step 1 form fields
            Object.keys(currentStepData).forEach((key) => {
              if (!processedData[key]) {
                processedData[key] = currentStepData[key]
              }
            })
          }

          // Always load contact data from step2, regardless of current step
          const contactStepData = stepStatus.stepData.step2
          console.log('🔍 Contact Step Data:', contactStepData)

          if (contactStepData && Array.isArray(contactStepData)) {
            console.log(
              '🔍 First contact object keys:',
              Object.keys(contactStepData[0] || {})
            )
            console.log('🔍 First contact object:', contactStepData[0])
            processedData.contactData = contactStepData.map((contact) => ({
              ...contact,
              // Map API fields to expected table fields (using CORRECT bpc prefix)
              name:
                `${contact.bpcFirstName || ''} ${contact.bpcLastName || ''}`.trim() ||
                'N/A',
              address:
                `${contact.bpcContactAddressLine1 || ''} ${contact.bpcContactAddressLine2 || ''}`.trim() ||
                'N/A',
              email: contact.bpcContactEmail || 'N/A',
              pobox: contact.bpcContactPoBox || 'N/A',
              countrycode: contact.bpcCountryMobCode || 'N/A',
              mobileno: contact.bpcContactMobNo || 'N/A',
              telephoneno: contact.bpcContactTelNo || 'N/A',
              fax: contact.bpcContactFaxNo || 'N/A',
              ...(typeof contact.isActive === 'string' && {
                isActive: contact.isActive === 'true',
              }),
            }))
          } else if (contactStepData && typeof contactStepData === 'object') {
            // Map single contact object (using CORRECT bpc prefix)
            const mappedContact = {
              ...contactStepData,
              name:
                `${contactStepData.bpcFirstName || ''} ${contactStepData.bpcLastName || ''}`.trim() ||
                'N/A',
              address:
                `${contactStepData.bpcContactAddressLine1 || ''} ${contactStepData.bpcContactAddressLine2 || ''}`.trim() ||
                'N/A',
              email: contactStepData.bpcContactEmail || 'N/A',
              pobox: contactStepData.bpcContactPoBox || 'N/A',
              countrycode: contactStepData.bpcCountryMobCode || 'N/A',
              mobileno: contactStepData.bpcContactMobNo || 'N/A',
              telephoneno: contactStepData.bpcContactTelNo || 'N/A',
              fax: contactStepData.bpcContactFaxNo || 'N/A',
            }
            processedData.contactData = [mappedContact]
          } else {
            processedData.contactData = []
          }

          // Handle data based on current step for other steps
          if (activeStep === 0) {
            // Step 1 (Developer Details)
            // Contact data already processed above
          } else if (activeStep === 1) {
            // Contact data already processed above
          } else {
            // For other steps, ensure contactData exists
            if (!processedData.contactData) {
              processedData.contactData = []
            }
          }

          // Always load fees data from step3, regardless of current step
          const feesStepData = stepStatus.stepData.step3
          console.log('🔍 Fees Step Data:', feesStepData)

          if (feesStepData && Array.isArray(feesStepData)) {
            console.log(
              '🔍 First fee object keys:',
              Object.keys(feesStepData[0] || {})
            )
            console.log('🔍 First fee object:', feesStepData[0])
            processedData.fees = feesStepData.map((fee) => ({
              ...fee,
              // Map API fields to expected table fields (based on actual API response structure)
              FeeType:
                fee.bpFeeCategoryDTO?.languageTranslationId?.configValue ||
                'N/A',
              Frequency:
                fee.bpFeeFrequencyDTO?.languageTranslationId?.configValue ||
                'N/A',
              DebitAmount: fee.debitAmount?.toString() || 'N/A',
              Feetobecollected: fee.feeCollectionDate
                ? formatDate(fee.feeCollectionDate, 'MMM DD, YYYY')
                : 'N/A',
              NextRecoveryDate: fee.feeNextRecoveryDate
                ? formatDate(fee.feeNextRecoveryDate, 'MMM DD, YYYY')
                : 'N/A',
              FeePercentage: fee.feePercentage?.toString() || 'N/A',
              Amount: fee.totalAmount?.toString() || 'N/A',
              VATPercentage: fee.vatPercentage?.toString() || 'N/A',
              ...(typeof fee.enabled === 'string' && {
                isActive: fee.enabled === 'true',
              }),
            }))
          } else if (feesStepData && typeof feesStepData === 'object') {
            // Handle single fee object (using same mapping as above)
            const mappedFee = {
              ...feesStepData,
              FeeType:
                feesStepData.bpFeeCategoryDTO?.languageTranslationId
                  ?.configValue || 'N/A',
              Frequency:
                feesStepData.bpFeeFrequencyDTO?.languageTranslationId
                  ?.configValue || 'N/A',
              DebitAmount: feesStepData.debitAmount?.toString() || 'N/A',
              Feetobecollected: feesStepData.feeCollectionDate
                ? formatDate(feesStepData.feeCollectionDate, 'MMM DD, YYYY')
                : 'N/A',
              NextRecoveryDate: feesStepData.feeNextRecoveryDate
                ? formatDate(feesStepData.feeNextRecoveryDate, 'MMM DD, YYYY')
                : 'N/A',
              FeePercentage: feesStepData.feePercentage?.toString() || 'N/A',
              Amount: feesStepData.totalAmount?.toString() || 'N/A',
              VATPercentage: feesStepData.vatPercentage?.toString() || 'N/A',
            }
            processedData.fees = [mappedFee]
          } else {
            processedData.fees = []
          }

          // Handle data based on current step for other steps
          if (activeStep === 2) {
            // Step 3 (Fees Information)
            // Fees data already processed above
          } else {
            // For other steps, ensure fees exists
            if (!processedData.fees) {
              processedData.fees = []
            }
          }

          // Always load beneficiary data from step4, regardless of current step
          const beneficiaryStepData = stepStatus.stepData.step4
          console.log('🔍 Beneficiary Step Data:', beneficiaryStepData)

          if (beneficiaryStepData && Array.isArray(beneficiaryStepData)) {
            processedData.beneficiaryData = beneficiaryStepData.map(
              (beneficiary) => ({
                ...beneficiary,
                // Convert any string booleans in beneficiary data
                ...(typeof beneficiary.isActive === 'string' && {
                  isActive: beneficiary.isActive === 'true',
                }),
              })
            )
          } else if (
            beneficiaryStepData &&
            typeof beneficiaryStepData === 'object'
          ) {
            processedData.beneficiaryData = [beneficiaryStepData]
          } else {
            processedData.beneficiaryData = []
          }

          // Handle data based on current step for other steps
          if (activeStep === 4) {
            // Step 5 (Beneficiary Information)
            // Beneficiary data already processed above
          } else {
            // For other steps, ensure beneficiaryData exists
            if (!processedData.beneficiaryData) {
              processedData.beneficiaryData = []
            }
          }

          console.log(
            '+++++++++++++++ processedData+++++++++++++++',
            processedData
          )

          methods.reset(processedData)
          setShouldResetForm(false) // Prevent further resets until step changes
        } catch (error) {
          console.error('❌ Error populating form:', error)
        }
      }
      setIsDataLoaded(true)
    }
  }, [stepStatus, shouldResetForm]) // Removed isAddingContact to prevent form reset when adding contacts

  // Reset form when step changes
  useEffect(() => {
    setShouldResetForm(true)
  }, [activeStep])

  // Refresh contact data when navigating to Step 2 (Contact Details)
  useEffect(() => {
    if (activeStep === 1 && developerId) {
      // Force refresh of step status to get latest contact data
      console.log('🔄 Refreshing contact data for step 2')
      setShouldResetForm(true)
    }
  }, [activeStep, developerId])

  // Refresh fees data when navigating to Step 3 (Fees Information)
  useEffect(() => {
    if (activeStep === 2 && developerId) {
      // Force refresh of step status to get latest fees data
      console.log('🔄 Refreshing fees data for step 3')
      setShouldResetForm(true)
    }
  }, [activeStep, developerId])

  // Refresh beneficiary data when navigating to Step 4 (Beneficiary Information)
  useEffect(() => {
    if (activeStep === 3 && developerId) {
      // Force refresh of step status to get latest beneficiary data
      console.log('🔄 Refreshing beneficiary data for step 4')
      setShouldResetForm(true)
    }
  }, [activeStep, developerId])

  // DISABLED: Load saved data when step changes (until backend APIs are ready)
  // useEffect(() => {
  //   if (stepData.data && !stepData.isLoading) {
  //     // Pre-populate form with saved data
  //     Object.entries(stepData.data).forEach(([key, value]) => {
  //       if (value !== undefined && value !== null) {
  //         try {
  //           methods.setValue(key as keyof ProjectData, value as any);
  //         } catch (error) {
  //           console.warn(`Could not set value for ${key}:`, error);
  //         }
  //       }
  //     });
  //   }
  // }, [stepData.data, stepData.isLoading, methods]);

  // Data transformation functions for each step
  const transformDetailsData = (formData: ProjectData) => {
    const transformed = {
      bpDeveloperId: formData.bpDeveloperId,
      bpCifrera: formData.bpCifrera,
      bpDeveloperRegNo: formData.bpDeveloperRegNo,
      bpName: formData.bpName,
      bpMasterName: formData.bpMasterName,
      bpNameLocal: formData.bpNameLocal,
      bpOnboardingDate: formData.bpOnboardingDate
        ? typeof formData.bpOnboardingDate === 'string'
          ? formData.bpOnboardingDate
          : convertDatePickerToZonedDateTime(
              formData.bpOnboardingDate.format('YYYY-MM-DD')
            )
        : null,
      bpContactAddress: formData.bpContactAddress,
      bpContactTel: formData.bpContactTel,
      bpPoBox: formData.bpPoBox,
      bpMobile: formData.bpMobile,
      bpFax: formData.bpFax,
      bpEmail: formData.bpEmail,
      bpLicenseNo: formData.bpLicenseNo,
      bpLicenseExpDate: formData.bpLicenseExpDate
        ? typeof formData.bpLicenseExpDate === 'string'
          ? formData.bpLicenseExpDate
          : convertDatePickerToZonedDateTime(
              formData.bpLicenseExpDate.format('YYYY-MM-DD')
            )
        : null,
      bpWorldCheckFlag: formData.bpWorldCheckFlag,
      bpWorldCheckRemarks: formData.bpWorldCheckRemarks,
      bpMigratedData: formData.bpMigratedData,
      bpremark: formData.bpremark,
      bpRegulatorDTO: {
        id: parseInt(formData.bpRegulatorDTO?.id?.toString() || '0') || 0,
      },
    }

    return transformed
  }

  const transformContactData = (formData: ProjectData) => ({
    contactPerson: formData.contactData?.[0]?.name || '',
    email: formData.contactData?.[0]?.email || '',
    phone: formData.contactData?.[0]?.mobileno || '',
    address: formData.contactData?.[0]?.address || '',
    city: formData.projectLocation || '',
    country: formData.contactData?.[0]?.countrycode || '',
  })

  const transformFeesData = (formData: ProjectData) => ({
    feeStructure: {
      setupFee: parseFloat(formData.fees?.[0]?.amount || '0'),
      transactionFee: parseFloat(formData.fees?.[0]?.feePercentage || '0'),
      monthlyFee: parseFloat(formData.fees?.[0]?.debitAmount || '0'),
    },
    collectionMethod: formData.paymentType || 'manual',
    paymentTerms: formData.fees?.[0]?.frequency || '',
  })

  const transformBeneficiaryData = (formData: ProjectData) => ({
    beneficiaryInfo: {
      name: formData.beneficiaries?.[0]?.name || '',
      accountNumber: formData.beneficiaries?.[0]?.account || '',
      bankName: formData.beneficiaries?.[0]?.bankName || '',
      swiftCode: formData.beneficiaries?.[0]?.swiftCode || '',
    },
    beneficiaryType: formData.beneficiaries?.[0]?.transferType || 'individual',
  })

  const transformReviewData = (formData: ProjectData) => ({
    reviewData: formData,
    termsAccepted: true, // Assuming terms are accepted if user reaches review step
  })

  // Main data transformation function
  const transformStepData = (step: number, formData: ProjectData) => {
    switch (step) {
      case 0:
        return transformDetailsData(formData)
      case 1:
        return transformContactData(formData)
      case 2:
        return transformFeesData(formData)
      case 3:
        return transformBeneficiaryData(formData)
      case 4:
        return transformReviewData(formData)
      default:
        throw new Error(`Invalid step: ${step}`)
    }
  }

  // Client-side validation only (server validation disabled)
  const validateStepData = async (step: number, data: unknown) => {
    try {
      // Skip validation for Step 4 (Beneficiary step)
      if (step === 4) {
        console.log('Skipping validation for Step 4 (Beneficiary step)')
        return {
          isValid: true,
          errors: [],
          source: 'skipped',
        }
      }

      // Client-side validation only
      const stepKey = getStepValidationKey(step)
      const schema = DeveloperStepperSchemas[stepKey]

      const clientValidation = await ValidationHelper.validateAndSanitize(
        schema as any,
        data
      )

      if (!clientValidation.success) {
        return {
          isValid: false,
          errors: clientValidation.errors,
          source: 'client',
        }
      }

      // Server-side validation disabled for now
      // const serverValidation = await stepManager.validateStep.mutateAsync({
      //   step: step + 1,
      //   data: clientValidation.data
      // });

      return {
        isValid: true, // Client validation passed
        errors: [],
        source: 'client',
      }
    } catch (error: unknown) {
      console.error('Validation error:', error)
      return {
        isValid: false,
        errors: ['Validation failed'],
        source: 'client',
      }
    }
  }

  // Handle save and next logic
  const handleSaveAndNext = async () => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

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
          router.push('/developers')
        }
        return
      }

      // Review step (step 5) - complete the process
      if (activeStep === 5) {
        router.push('/developers')
        setSuccessMessage('Developer registration completed successfully!')
        return
      }

      // All other steps make API calls
      const currentFormData = methods.getValues()
      const stepSpecificData = transformStepData(activeStep, currentFormData)

      // Enhanced validation with client-side and server-side validation
      const validation = await validateStepData(activeStep, stepSpecificData)

      if (!validation.isValid) {
        const errorPrefix =
          validation.source === 'client'
            ? 'Form validation failed'
            : 'Server validation failed'
        setErrorMessage(`${errorPrefix}: ${validation.errors?.join(', ')}`)
        return
      }

      // Call the API to save the current step
      const saveResponse = await stepManager.saveStep(
        activeStep + 1,
        stepSpecificData
      )

      setSuccessMessage('Step saved successfully!')

      // Navigate to next step
      if (activeStep < steps.length - 1) {
        // For Step 1, we need to get the developer ID from the API response and navigate to dynamic route
        if (activeStep === 0) {
          // Step 1 just saved, get the developer ID from the API response
          const savedDeveloperId = saveResponse?.data?.id || saveResponse?.id

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
        setSuccessMessage('All steps completed successfully!')
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
      setErrorMessage(errorMessage)
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      const previousStep = activeStep - 1
      setActiveStep(previousStep)
      // Navigate to the previous step URL
      router.push(`/developers/${developerId}/step/${previousStep + 1}`)
    }
  }

  const handleReset = () => {
    setActiveStep(0)
    methods.reset()
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const onSubmit = (data: ProjectData) => {
    console.log('Form data:', data)
    // Handle form submission
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <Step1 />
      case 1:
        return (
          <DocumentUploadStep
            buildPartnerId={developerId || ''}
            onDocumentsChange={(documents) =>
              methods.setValue('documents', documents)
            }
            isOptional={true}
          />
        )
      case 2:
        const watchedContactData = methods.watch('contactData')
        console.log(
          '📋 DeveloperStepper - methods.watch(contactData):',
          watchedContactData
        )
        console.log(
          '📋 DeveloperStepper - watchedContactData type:',
          typeof watchedContactData
        )
        console.log(
          '📋 DeveloperStepper - watchedContactData isArray:',
          Array.isArray(watchedContactData)
        )

        return (
          <Step2
            contactData={watchedContactData}
            onFeesChange={(contactData) => {
              setIsAddingContact(true)
              methods.setValue('contactData', contactData)
              setTimeout(() => setIsAddingContact(false), 100)
            }}
            buildPartnerId={developerId || ''}
          />
        )
      case 3:
        const watchedFees = methods.watch('fees')
        console.log('📋 DeveloperStepper - methods.watch(fees):', watchedFees)
        console.log(
          '📋 DeveloperStepper - watchedFees type:',
          typeof watchedFees
        )
        console.log(
          '📋 DeveloperStepper - watchedFees isArray:',
          Array.isArray(watchedFees)
        )

        return (
          <Step3
            fees={watchedFees}
            onFeesChange={(fees) => {
              setIsAddingContact(true) // Reuse the same flag for fees
              methods.setValue('fees', fees)
              setTimeout(() => setIsAddingContact(false), 100)
            }}
            buildPartnerId={developerId || ''}
          />
        )
      case 4:
        return (
          <Step4
            beneficiaries={methods.watch('beneficiaries')}
            onBeneficiariesChange={(beneficiaries) =>
              methods.setValue('beneficiaries', beneficiaries)
            }
            buildPartnerId={developerId || ''}
          />
        )
      case 5:
        return <Step5 />
      default:
        return null
    }
  }

  // Show loading state while fetching step status
  if (isLoadingStepStatus && developerId) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <Typography>Loading saved data...</Typography>
      </Box>
    )
  }

  try {
    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
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

            <Box
              sx={{ my: 4, backgroundColor: '#FFFFFFBF', boxShadow: 'none' }}
            >
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
                        backgroundColor: '#DBEAFE',
                        color: '#155DFC',
                        border: 'none',
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
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={handleSaveAndNext}
                    variant="contained"
                    disabled={stepManager.isLoading}
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
                    }}
                  >
                    {stepManager.isLoading
                      ? 'Saving...'
                      : activeStep === steps.length - 1
                        ? 'Submit'
                        : activeStep === 1
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
        </form>
      </FormProvider>
    )
  } catch (error) {
    console.error('❌ Component rendering error:', error)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <Typography color="error">
          Error rendering form:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </Typography>
      </Box>
    )
  }
}
