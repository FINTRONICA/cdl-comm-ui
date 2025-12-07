'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  Alert,
  Snackbar,
  useTheme,
  alpha,
} from '@mui/material'
import Stepper from '@mui/material/Stepper'
import { FormProvider, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import {
  useProjectStepManager,
  useProjectStepStatus,
  useSaveProjectFinancialSummary,
  useSaveProjectClosure,
} from '@/hooks/useProjects'
import { convertDatePickerToZonedDateTime } from '@/utils'
import { BankAccountService } from '@/services/api/bankAccountService'
import { realEstateAssetService } from '@/services/api/projectService'
import dayjs from 'dayjs'

import Step1 from './steps/Step1'
import Step2 from './steps/Step2'
import Step3 from './steps/Step3'
import Step4 from './steps/Step4'
import Step5 from './steps/Step5'
import Step6 from './steps/Step6'
import Step7 from './steps/Step7'
import Step8 from './steps/Step8'
import DocumentUploadFactory from '../DocumentUpload/DocumentUploadFactory'
import { DocumentItem } from '../DeveloperStepper/developerTypes'
import { useCreateDeveloperWorkflowRequest } from '@/hooks/workflow'

import { ProjectData } from './types'
import {
  STEPS,
  SKIP_VALIDATION_STEPS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ACCOUNT_TYPES,
} from './constants'
import {
  stepperLabelSx,
  loadingContainerSx,
  errorContainerSx,
  formSectionSx,
  buttonContainerSx,
  backButtonSx,
  nextButtonSx,
} from './styles'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GlobalLoading } from '@/components/atoms'
import {
  validateCurrentStep,
  stepRequiresValidation,
} from './utils/stepValidation'
import { getChangedAccounts } from './utils/accountDiff'

export default function StepperWrapper({
  projectId,
  initialStep = 0,
  isViewMode = false,
}: {
  projectId?: string
  initialStep?: number
  isViewMode?: boolean
} = {}) {
  const theme = useTheme()
  const [activeStep, setActiveStep] = useState(initialStep)

  // Sync activeStep with initialStep when it changes (e.g., on page reload with step in URL)
  useEffect(() => {
    if (initialStep !== undefined && initialStep !== activeStep) {
      setActiveStep(initialStep)
    }
  }, [initialStep])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [shouldResetForm, setShouldResetForm] = useState(true)
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [financialSummaryId, setFinancialSummaryId] = useState<number | null>(
    null
  )
  const [projectClosureId, setProjectClosureId] = useState<number | null>(null)

  const router = useRouter()

  const getModeParam = useCallback(() => {
    if (isViewMode) return '?mode=view'
    if (isEditingMode) return '?editing=true'
    return ''
  }, [isViewMode, isEditingMode])

  useEffect(() => {}, [isEditingMode])

  const stepManager = useProjectStepManager()
  const saveFinancialSummary = useSaveProjectFinancialSummary()
  const saveProjectClosure = useSaveProjectClosure()

  const { data: stepStatus, isLoading: isLoadingStepStatus } =
    useProjectStepStatus(projectId || '')
  const createProjectWorkflowRequest = useCreateDeveloperWorkflowRequest()

  const steps = [
    'Build Partner Assest Details',
    'Documents',
    'Account',
    'Fee Details',
    'Beneficiary Details',
    'Payment Plan',
    'Financial',
    'Project Closure',
    'Review',
  ]

  if (typeof window !== 'undefined' && !projectId) {
    try {
      localStorage.removeItem('form_projectStepper_1.0')
      localStorage.removeItem('projectStepper_draft')
    } catch (error) {}
  }

  const methods = useForm<ProjectData>({
    defaultValues: {} as ProjectData,
    mode: 'onChange',
  })

  // Removed useAutoSave/useFormPersistence: data loads directly from APIs

  useEffect(() => {
    if (projectId && (shouldResetForm || activeStep >= 0) && !isAddingContact) {
      if (stepStatus) {
        const currentStepData =
          stepStatus.stepData[
            `step${activeStep + 1}` as keyof typeof stepStatus.stepData
          ]

        if (currentStepData) {
          try {
            let processedData = { ...currentStepData }

            const stepData = currentStepData as any

            if (activeStep === 0) {
              if (
                stepData.reaStartDate &&
                typeof stepData.reaStartDate === 'string'
              ) {
                ;(processedData as any).reaStartDate = dayjs(
                  stepData.reaStartDate
                )
              }
              if (
                stepData.reaCompletionDate &&
                typeof stepData.reaCompletionDate === 'string'
              ) {
                ;(processedData as any).reaCompletionDate = dayjs(
                  stepData.reaCompletionDate
                )
              }
              if (
                stepData.reaRetentionEffectiveDate &&
                typeof stepData.reaRetentionEffectiveDate === 'string'
              ) {
                ;(processedData as any).reaRetentionEffectiveDate = dayjs(
                  stepData.reaRetentionEffectiveDate
                )
              }
              if (
                stepData.reaAccoutStatusDate &&
                typeof stepData.reaAccoutStatusDate === 'string'
              ) {
                ;(processedData as any).reaAccoutStatusDate = dayjs(
                  stepData.reaAccoutStatusDate
                )
              }
              if (
                stepData.reaRegistrationDate &&
                typeof stepData.reaRegistrationDate === 'string'
              ) {
                ;(processedData as any).reaRegistrationDate = dayjs(
                  stepData.reaRegistrationDate
                )
              }

              if (
                stepData.buildPartnerDTO &&
                typeof stepData.buildPartnerDTO === 'object'
              ) {
                // Extract only necessary fields from buildPartnerDTO
                ;(processedData as any).buildPartnerDTO = {
                  id: stepData.buildPartnerDTO.id,
                  bpCifrera: stepData.buildPartnerDTO.bpCifrera,
                  bpName: stepData.buildPartnerDTO.bpName,
                  bpMasterName: stepData.buildPartnerDTO.bpMasterName,
                }

                if (stepData.buildPartnerDTO.bpCifrera) {
                  ;(processedData as any).reaCif =
                    stepData.buildPartnerDTO.bpCifrera
                }
              }
              // Extract only the id from reaStatusDTO
              if (
                stepData.reaStatusDTO &&
                typeof stepData.reaStatusDTO === 'object'
              ) {
                ;(processedData as any).reaStatusDTO = {
                  id: stepData.reaStatusDTO.id,
                }
              }
              // Extract only the id from reaTypeDTO
              if (
                stepData.reaTypeDTO &&
                typeof stepData.reaTypeDTO === 'object'
              ) {
                ;(processedData as any).reaTypeDTO = {
                  id: stepData.reaTypeDTO.id,
                }
              }
              // Extract only the id from reaAccountStatusDTO
              if (
                stepData.reaAccountStatusDTO &&
                typeof stepData.reaAccountStatusDTO === 'object'
              ) {
                ;(processedData as any).reaAccountStatusDTO = {
                  id: stepData.reaAccountStatusDTO.id,
                }
              }
              // Extract only the id from reaConstructionCostCurrencyDTO
              if (
                stepData.reaConstructionCostCurrencyDTO &&
                typeof stepData.reaConstructionCostCurrencyDTO === 'object'
              ) {
                ;(processedData as any).reaConstructionCostCurrencyDTO = {
                  id: stepData.reaConstructionCostCurrencyDTO.id,
                }
              }
              // Extract only the id from reaBlockPaymentTypeDTO (Restricted Payment Type)
              if (
                stepData.reaBlockPaymentTypeDTO &&
                typeof stepData.reaBlockPaymentTypeDTO === 'object'
              ) {
                ;(processedData as any).reaBlockPaymentTypeDTO = {
                  id: stepData.reaBlockPaymentTypeDTO.id,
                }
              }
            }

            if (activeStep === 2) {
              if (
                (stepData as any).accounts &&
                Array.isArray((stepData as any).accounts)
              ) {
                const normalizeAccountType = (
                  type: string | null | undefined
                ) => {
                  if (!type) {
                    return ''
                  }

                  const formatted = String(type).trim().toUpperCase()

                  switch (formatted) {
                    case 'TRUST':
                    case 'TRUST ACCOUNT':
                      return 'TRUST'
                    case 'RETENTION':
                    case 'RETENTION ACCOUNT':
                      return 'RETENTION'
                    case 'SUBCONSTRUCTION':
                    case 'SUB CONSTRUCTION':
                    case 'SUB-CONSTRUCTION':
                    case 'SUB CONSTRUCTION ACCOUNT':
                    case 'SUB-CONSTRUCTION ACCOUNT':
                      return 'SUBCONSTRUCTION'
                    case 'CORPORATE':
                    case 'CORPORATE ACCOUNT':
                      return 'CORPORATE'
                    default:
                      return formatted
                  }
                }

                const accountsByType = (stepData as any).accounts.reduce(
                  (acc: Record<string, any>, account: any) => {
                    const key = normalizeAccountType(account?.accountType)

                    if (key) {
                      acc[key] = account
                    }

                    return acc
                  },
                  {}
                )

                ;(processedData as any).accounts = ACCOUNT_TYPES.map((type) => {
                  const account = accountsByType[type] || {}

                  return {
                    ...account,
                    id: account.id ?? null,
                    trustAccountNumber:
                      account.accountNumber ||
                      account.trustAccountNumber ||
                      '',
                    currency: account.currencyCode || account.currency || '',
                    accountType: type,
                    dateOpened: account.dateOpened
                      ? dayjs(account.dateOpened)
                      : null,
                  }
                })
              }
            }

            if (activeStep === 3) {
              if (
                (stepData as any).fees &&
                Array.isArray((stepData as any).fees)
              ) {
                const processedFees = (stepData as any).fees.map(
                  (fee: any) => ({
                    id: fee.id?.toString() || '',
                    FeeType:
                      fee.reafCategoryDTO?.languageTranslationId?.configValue ||
                      fee.reafCategoryDTO?.settingValue ||
                      fee.feeType ||
                      fee.FeeType ||
                      '',
                    Frequency:
                      fee.reafFrequencyDTO?.languageTranslationId
                        ?.configValue ||
                      fee.reafFrequencyDTO?.settingValue ||
                      fee.frequency ||
                      fee.Frequency ||
                      'N/A',
                    DebitAmount:
                      fee.reafDebitAmount?.toString() ||
                      fee.debitAmount ||
                      fee.DebitAmount ||
                      '',
                    Feetobecollected:
                      fee.reafCollectionDate ||
                      fee.feeToBeCollected ||
                      fee.Feetobecollected ||
                      '',
                    NextRecoveryDate: fee.reafNextRecoveryDate
                      ? dayjs(fee.reafNextRecoveryDate).format('YYYY-MM-DD')
                      : fee.nextRecoveryDate
                        ? dayjs(fee.nextRecoveryDate).format('YYYY-MM-DD')
                        : fee.NextRecoveryDate || '',
                    FeePercentage:
                      fee.reafFeePercentage?.toString() ||
                      fee.feePercentage ||
                      fee.FeePercentage ||
                      '',
                    Amount:
                      fee.reafTotalAmount?.toString() ||
                      fee.amount ||
                      fee.Amount ||
                      '',
                    VATPercentage:
                      fee.reafVatPercentage?.toString() ||
                      fee.vatPercentage ||
                      fee.VATPercentage ||
                      '',

                    feeType:
                      fee.reafCategoryDTO?.languageTranslationId?.configValue ||
                      fee.reafCategoryDTO?.settingValue ||
                      fee.feeType ||
                      '',
                    frequency:
                      fee.reafFrequencyDTO?.languageTranslationId
                        ?.configValue ||
                      fee.reafFrequencyDTO?.settingValue ||
                      fee.frequency ||
                      'N/A',
                    debitAmount:
                      fee.reafDebitAmount?.toString() || fee.debitAmount || '',
                    feeToBeCollected:
                      fee.reafCollectionDate || fee.feeToBeCollected || '',
                    nextRecoveryDate: fee.reafNextRecoveryDate
                      ? dayjs(fee.reafNextRecoveryDate)
                      : fee.nextRecoveryDate
                        ? dayjs(fee.nextRecoveryDate)
                        : null,
                    feePercentage:
                      fee.reafFeePercentage?.toString() ||
                      fee.feePercentage ||
                      '',
                    amount: fee.reafTotalAmount?.toString() || fee.amount || '',
                    vatPercentage:
                      fee.reafVatPercentage?.toString() ||
                      fee.vatPercentage ||
                      '',
                    currency:
                      fee.reafCurrencyDTO?.languageTranslationId?.configValue ||
                      fee.reafCurrencyDTO?.settingValue ||
                      fee.currency ||
                      '',
                  })
                )

                ;(processedData as any).fees = processedFees
              }
            }

            if (activeStep === 4) {
              if (
                (stepData as any).beneficiaries &&
                Array.isArray((stepData as any).beneficiaries)
              ) {
                const processedBeneficiaries = (
                  stepData as any
                ).beneficiaries.map((beneficiary: any) => ({
                  id: beneficiary.id?.toString() || '',
                  reaBeneficiaryId:
                    beneficiary.reabBeneficiaryId ||
                    beneficiary.beneficiaryId ||
                    beneficiary.reaBeneficiaryId ||
                    '',
                  reaBeneficiaryType:
                    beneficiary.reabType ||
                    beneficiary.beneficiaryType ||
                    beneficiary.reaBeneficiaryType ||
                    '',
                  reaName:
                    beneficiary.reabName ||
                    beneficiary.name ||
                    beneficiary.reaName ||
                    '',
                  reaBankName:
                    beneficiary.reabBank ||
                    beneficiary.bankName ||
                    beneficiary.reaBankName ||
                    '',
                  reaSwiftCode:
                    beneficiary.reabSwift ||
                    beneficiary.swiftCode ||
                    beneficiary.reaSwiftCode ||
                    '',
                  reaRoutingCode:
                    beneficiary.reabRoutingCode ||
                    beneficiary.routingCode ||
                    beneficiary.reaRoutingCode ||
                    '',
                  reaAccountNumber:
                    beneficiary.reabBeneAccount ||
                    beneficiary.accountNumber ||
                    beneficiary.reaAccountNumber ||
                    '',

                  beneficiaryId:
                    beneficiary.reabBeneficiaryId ||
                    beneficiary.beneficiaryId ||
                    '',
                  beneficiaryType:
                    beneficiary.reabTranferTypeDTO.languageTranslationId
                      .configValue ||
                    beneficiary.beneficiaryType ||
                    '',
                  name: beneficiary.reabName || beneficiary.name || '',
                  bankName: beneficiary.reabBank || beneficiary.bankName || '',
                  swiftCode:
                    beneficiary.reabSwift || beneficiary.swiftCode || '',
                  routingCode:
                    beneficiary.reabRoutingCode ||
                    beneficiary.routingCode ||
                    '',
                  accountNumber:
                    beneficiary.reabBeneAccount ||
                    beneficiary.accountNumber ||
                    '',
                }))
                ;(processedData as any).beneficiaries = processedBeneficiaries
              }
            }

            if (activeStep === 5) {
              if (
                (stepData as any).paymentPlan &&
                Array.isArray((stepData as any).paymentPlan)
              ) {
                ;(processedData as any).paymentPlan = (
                  stepData as any
                ).paymentPlan
              }
            }

            if (activeStep === 6) {
              setShouldResetForm(false)
              return
            }

            methods.reset(processedData)
            setShouldResetForm(false)
            return
          } catch (error) {
            throw error
          }
        }
      }

      const fetchStepDataFromAPI = async () => {
        try {
          let apiData = null
          switch (activeStep) {
            case 0:
              apiData =
                await realEstateAssetService.getProjectDetails(projectId)
              break
            case 1:
              setShouldResetForm(false)
              return
            case 2:
              apiData =
                await realEstateAssetService.getProjectAccounts(projectId)
              break
            case 3:
              apiData = await realEstateAssetService.getProjectFees(projectId)
              break
            case 4:
              apiData =
                await realEstateAssetService.getProjectBeneficiaries(projectId)
              break
            case 5:
              apiData =
                await realEstateAssetService.getProjectPaymentPlans(projectId)
              break
            case 6:
              apiData =
                await realEstateAssetService.getProjectFinancialSummary(
                  projectId
                )
              break
            case 7:
              apiData =
                await realEstateAssetService.getProjectClosure(projectId)
              break
            case 8:
              setShouldResetForm(false)
              return
            default:
              setShouldResetForm(false)
              return
          }

          if (apiData) {
            let processedData = apiData

            if (activeStep === 0) {
              processedData = {
                ...apiData,
                reaStartDate: apiData.reaStartDate
                  ? dayjs(apiData.reaStartDate)
                  : null,
                reaCompletionDate: apiData.reaCompletionDate
                  ? dayjs(apiData.reaCompletionDate)
                  : null,
                reaRetentionEffectiveDate: apiData.reaRetentionEffectiveDate
                  ? dayjs(apiData.reaRetentionEffectiveDate)
                  : null,
                reaAccoutStatusDate: apiData.reaAccoutStatusDate
                  ? dayjs(apiData.reaAccoutStatusDate)
                  : null,
                reaRegistrationDate: apiData.reaRegistrationDate
                  ? dayjs(apiData.reaRegistrationDate)
                  : null,
                // Extract only necessary fields from nested DTOs
                buildPartnerDTO: apiData.buildPartnerDTO
                  ? {
                      id: apiData.buildPartnerDTO.id,
                      bpCifrera: apiData.buildPartnerDTO.bpCifrera,
                      bpName: apiData.buildPartnerDTO.bpName,
                      bpMasterName: apiData.buildPartnerDTO.bpMasterName,
                    }
                  : undefined,
                reaStatusDTO: apiData.reaStatusDTO
                  ? { id: apiData.reaStatusDTO.id }
                  : undefined,
                reaTypeDTO: apiData.reaTypeDTO
                  ? { id: apiData.reaTypeDTO.id }
                  : undefined,
                reaAccountStatusDTO: apiData.reaAccountStatusDTO
                  ? { id: apiData.reaAccountStatusDTO.id }
                  : undefined,
                reaConstructionCostCurrencyDTO:
                  apiData.reaConstructionCostCurrencyDTO
                    ? { id: apiData.reaConstructionCostCurrencyDTO.id }
                    : undefined,
                reaBlockPaymentTypeDTO: apiData.reaBlockPaymentTypeDTO
                  ? { id: apiData.reaBlockPaymentTypeDTO.id }
                  : undefined,
              }
            } else if (activeStep === 2) {
              const accountsArray =
                apiData?.content || (Array.isArray(apiData) ? apiData : [])
              const normalizeAccountType = (
                type: string | null | undefined
              ) => {
                if (!type) {
                  return ''
                }

                const formatted = String(type).trim().toUpperCase()

                switch (formatted) {
                  case 'TRUST':
                  case 'TRUST ACCOUNT':
                    return 'TRUST'
                  case 'RETENTION':
                  case 'RETENTION ACCOUNT':
                    return 'RETENTION'
                  case 'SUBCONSTRUCTION':
                  case 'SUB CONSTRUCTION':
                  case 'SUB-CONSTRUCTION':
                  case 'SUB CONSTRUCTION ACCOUNT':
                  case 'SUB-CONSTRUCTION ACCOUNT':
                    return 'SUBCONSTRUCTION'
                  case 'CORPORATE':
                  case 'CORPORATE ACCOUNT':
                    return 'CORPORATE'
                  default:
                    return formatted
                }
              }

              const accountsByType = accountsArray.reduce(
                (acc: Record<string, any>, account: any) => {
                  const key = normalizeAccountType(account?.accountType)

                  if (key) {
                    acc[key] = account
                  }

                  return acc
                },
                {}
              )

              processedData = {
                accounts: ACCOUNT_TYPES.map((type) => {
                  const account = accountsByType[type] || {}

                  return {
                    id: account.id ?? null,
                    trustAccountNumber:
                      account.accountNumber || account.trustAccountNumber || '',
                    ibanNumber: account.ibanNumber || '',
                    dateOpened: account.dateOpened
                      ? dayjs(account.dateOpened)
                      : null,
                    accountTitle: account.accountTitle || '',
                    currency: account.currencyCode || account.currency || '',
                    accountType: type,
                    isValidated: account.isValidated || false,
                    enabled: account.enabled || false,
                  }
                }),
              }
            } else if (activeStep === 3) {
              const feesArray =
                apiData?.content || (Array.isArray(apiData) ? apiData : [])

              const processedFees = feesArray.map((fee: any) => ({
                id: fee.id?.toString() || '',
                FeeType:
                  fee.reafCategoryDTO?.languageTranslationId?.configValue ||
                  fee.reafCategoryDTO?.settingValue ||
                  '',
                Frequency:
                  fee.reafFrequencyDTO?.languageTranslationId?.configValue ||
                  fee.reafFrequencyDTO?.settingValue ||
                  'N/A',
                DebitAmount: fee.reafDebitAmount?.toString() || '',
                Feetobecollected: fee.reafCollectionDate || '',
                NextRecoveryDate: fee.reafNextRecoveryDate
                  ? dayjs(fee.reafNextRecoveryDate).format('YYYY-MM-DD')
                  : '',
                FeePercentage: fee.reafFeePercentage?.toString() || '',
                Amount: fee.reafTotalAmount?.toString() || '',
                VATPercentage: fee.reafVatPercentage?.toString() || '',

                feeType:
                  fee.reafCategoryDTO?.languageTranslationId?.configValue ||
                  fee.reafCategoryDTO?.settingValue ||
                  '',
                frequency:
                  fee.reafFrequencyDTO?.languageTranslationId?.configValue ||
                  fee.reafFrequencyDTO?.settingValue ||
                  'N/A',
                debitAmount: fee.reafDebitAmount?.toString() || '',
                feeToBeCollected: fee.reafCollectionDate || '',
                nextRecoveryDate: fee.reafNextRecoveryDate
                  ? dayjs(fee.reafNextRecoveryDate)
                  : null,
                feePercentage: fee.reafFeePercentage?.toString() || '',
                amount: fee.reafTotalAmount?.toString() || '',
                vatPercentage: fee.reafVatPercentage?.toString() || '',
                currency:
                  fee.reafCurrencyDTO?.languageTranslationId?.configValue ||
                  fee.reafCurrencyDTO?.settingValue ||
                  '',
              }))

              processedData = {
                fees: processedFees,
              }
            } else if (activeStep === 4) {
              const beneficiariesArray =
                apiData?.content || (Array.isArray(apiData) ? apiData : [])
              processedData = {
                beneficiaries: beneficiariesArray.map((beneficiary: any) => ({
                  id: beneficiary.id?.toString() || '',
                  reaBeneficiaryId: beneficiary.reabBeneficiaryId || '',
                  reaBeneficiaryType:
                    beneficiary.reabTranferTypeDTO?.languageTranslationId
                      ?.configValue || '',
                  reaName: beneficiary.reabName || '',
                  reaBankName: beneficiary.reabBank || '',
                  reaSwiftCode: beneficiary.reabSwift || '',
                  reaRoutingCode: beneficiary.reabRoutingCode || '',
                  reaAccountNumber: beneficiary.reabBeneAccount || '',

                  beneficiaryId: beneficiary.reabBeneficiaryId || '',
                  beneficiaryType:
                    beneficiary.reabTranferTypeDTO?.languageTranslationId
                      ?.configValue || '',
                  name: beneficiary.reabName || '',
                  bankName: beneficiary.reabBank || '',
                  swiftCode: beneficiary.reabSwift || '',
                  routingCode: beneficiary.reabRoutingCode || '',
                  accountNumber: beneficiary.reabBeneAccount || '',
                })),
              }
            } else if (activeStep === 5) {
              const paymentPlansArray =
                apiData?.content || (Array.isArray(apiData) ? apiData : [])
              processedData = {
                paymentPlan: paymentPlansArray.map((plan: any) => ({
                  id: plan.id?.toString() || '',
                  installmentNumber: plan.reappInstallmentNumber || 0,
                  installmentPercentage:
                    plan.reappInstallmentPercentage?.toString() || '0',
                  projectCompletionPercentage:
                    plan.reappProjectCompletionPercentage?.toString() || '0',
                })),
              }
            } else if (activeStep === 6) {
              setShouldResetForm(false)
              return
            } else if (activeStep === 7) {
              const closureData = apiData?.content?.[0] || apiData

              if (closureData?.id) {
                setProjectClosureId(closureData.id)
              }

              processedData = {
                closureData: {
                  totalIncomeFund:
                    closureData?.reacTotalIncomeFund?.toString() ||
                    closureData?.totalIncomeFund?.toString() ||
                    '',
                  totalPayment:
                    closureData?.reacTotalPayment?.toString() ||
                    closureData?.totalPayment?.toString() ||
                    '',
                },
              }
            }

            methods.reset(processedData)
          }

          setShouldResetForm(false)
        } catch (error) {
          setShouldResetForm(false)
        }
      }

      fetchStepDataFromAPI()
    } else {
    }
  }, [
    stepStatus,
    shouldResetForm,
    isAddingContact,
    activeStep,
    methods,
    projectId,
  ])

  useEffect(() => {
    setShouldResetForm(true)
  }, [activeStep])

  useEffect(() => {
    if (activeStep === 3 && projectId && !isAddingContact) {
      const loadFeesData = async () => {
        try {
          const apiData = await realEstateAssetService.getProjectFees(projectId)

          const feesArray =
            (apiData as any)?.content || (Array.isArray(apiData) ? apiData : [])

          if (feesArray.length > 0) {
            const processedFees = feesArray.map((fee: any) => ({
              id: fee.id?.toString() || '',
              FeeType:
                fee.reafCategoryDTO?.languageTranslationId?.configValue ||
                fee.reafCategoryDTO?.settingValue ||
                '',
              Frequency:
                fee.reafFrequencyDTO?.languageTranslationId?.configValue ||
                fee.reafFrequencyDTO?.settingValue ||
                'N/A',
              DebitAmount: fee.reafDebitAmount?.toString() || '',
              Feetobecollected: fee.reafCollectionDate || '',
              NextRecoveryDate: fee.reafNextRecoveryDate
                ? dayjs(fee.reafNextRecoveryDate).format('YYYY-MM-DD')
                : '',
              FeePercentage: fee.reafFeePercentage?.toString() || '',
              Amount: fee.reafTotalAmount?.toString() || '',
              VATPercentage: fee.reafVatPercentage?.toString() || '',

              feeType:
                fee.reafCategoryDTO?.languageTranslationId?.configValue ||
                fee.reafCategoryDTO?.settingValue ||
                '',
              frequency:
                fee.reafFrequencyDTO?.languageTranslationId?.configValue ||
                fee.reafFrequencyDTO?.settingValue ||
                'N/A',
              debitAmount: fee.reafDebitAmount?.toString() || '',
              feeToBeCollected: fee.reafCollectionDate || '',
              nextRecoveryDate: fee.reafNextRecoveryDate
                ? dayjs(fee.reafNextRecoveryDate)
                : null,
              feePercentage: fee.reafFeePercentage?.toString() || '',
              amount: fee.reafTotalAmount?.toString() || '',
              vatPercentage: fee.reafVatPercentage?.toString() || '',
              currency:
                fee.reafCurrencyDTO?.languageTranslationId?.configValue ||
                fee.reafCurrencyDTO?.settingValue ||
                '',
            }))

            methods.setValue('fees', processedFees)
          }
        } catch (error) {
          throw error
        }
      }

      loadFeesData()
    }
  }, [activeStep, projectId, isAddingContact, methods])

  useEffect(() => {
    if (activeStep === 4 && projectId && !isAddingContact) {
      const loadBeneficiariesData = async () => {
        try {
          const apiData =
            await realEstateAssetService.getProjectBeneficiaries(projectId)

          const beneficiariesArray =
            (apiData as any)?.content || (Array.isArray(apiData) ? apiData : [])

          if (beneficiariesArray.length > 0) {
            const processedBeneficiaries = beneficiariesArray.map(
              (beneficiary: any) => ({
                id: beneficiary.id?.toString() || '',
                reaBeneficiaryId: beneficiary.reabBeneficiaryId || '',
                reaBeneficiaryType:
                  beneficiary.reabTranferTypeDTO?.languageTranslationId
                    ?.configValue || '',
                reaName: beneficiary.reabName || '',
                reaBankName: beneficiary.reabBank || '',
                reaSwiftCode: beneficiary.reabSwift || '',
                reaRoutingCode: beneficiary.reabRoutingCode || '',
                reaAccountNumber: beneficiary.reabBeneAccount || '',

                beneficiaryId: beneficiary.reabBeneficiaryId || '',
                beneficiaryType:
                  beneficiary.reabTranferTypeDTO?.languageTranslationId
                    ?.configValue || '',
                name: beneficiary.reabName || '',
                bankName: beneficiary.reabBank || '',
                swiftCode: beneficiary.reabSwift || '',
                routingCode: beneficiary.reabRoutingCode || '',
                accountNumber: beneficiary.reabBeneAccount || '',
              })
            )

            methods.setValue('beneficiaries', processedBeneficiaries)
          }
        } catch (error) {
          throw error
        }
      }

      loadBeneficiariesData()
    }
  }, [activeStep, projectId, isAddingContact, methods])

  useEffect(() => {
    if (activeStep === 5 && projectId && !isAddingContact) {
      const loadPaymentPlansData = async () => {
        try {
          const apiData =
            await realEstateAssetService.getProjectPaymentPlans(projectId)

          if (apiData && apiData.length > 0) {
            const processedPaymentPlans = apiData.map((plan: any) => ({
              id: plan.id?.toString() || '',
              installmentNumber: plan.reappInstallmentNumber || 0,
              installmentPercentage:
                plan.reappInstallmentPercentage?.toString() || '',
              projectCompletionPercentage:
                plan.reappProjectCompletionPercentage?.toString() || '',
            }))

            methods.setValue('paymentPlan', processedPaymentPlans)
          }
        } catch (error) {
          throw error
        }
      }

      loadPaymentPlansData()
    }
  }, [activeStep, projectId, isAddingContact, methods])

  useEffect(() => {
    if (activeStep === 6 && projectId && !isAddingContact) {
      const loadFinancialData = async () => {
        try {
          const apiData =
            await realEstateAssetService.getProjectFinancialSummary(projectId)

          const financialData = apiData?.content?.[0] || apiData

          if (financialData?.id) {
            setFinancialSummaryId(financialData.id)
          } else {
            console.warn(
              '⚠️ Financial data has no ID - financialSummaryId will remain null'
            )
          }

          if (financialData) {
            setShouldResetForm(false)

            const breakdownMap = {
              0: {
                out: 'reafsCurCashRecvdOutEscrow',
                within: 'reafsCurCashRecvdWithinEscrow',
                total: 'reafsCurCashRecvdTotal',
                except: 'reafsCurCashexceptCapVal',
              },
              1: {
                out: 'reafsCurLandCostOut',
                within: 'reafsCurLandCostWithin',
                total: 'reafsCurLandTotal',
                except: 'reafsCurLandexceptCapVal',
              },
              2: {
                out: 'reafsCurConsCostOut',
                within: 'reafsCurConsCostWithin',
                total: 'reafsCurConsCostTotal',
                except: 'reafsCurConsExcepCapVal',
              },
              3: {
                out: 'reafsCurrentMktgExpOut',
                within: 'reafsCurrentMktgExpWithin',
                total: 'reafsCurrentMktgExpTotal',
                except: 'reafsCurrentmktgExcepCapVal',
              },
              4: {
                out: 'reafsCurProjMgmtExpOut',
                within: 'reafsCurProjMgmtExpWithin',
                total: 'reafsCurProjMgmtExpTotal',
                except: 'reafsCurProjExcepCapVal',
              },
              5: {
                out: 'currentMortgageOut',
                within: 'reafsCurrentMortgageWithin',
                total: 'reafsCurrentMortgageTotal',
                except: 'reafsCurMortgageExceptCapVal',
              },
              6: {
                out: 'reafsCurrentVatPaymentOut',
                within: 'reafsCurrentVatPaymentWithin',
                total: 'reafsCurrentVatPaymentTotal',
                except: 'reafsCurVatExceptCapVal',
              },
              7: {
                out: 'reafsCurrentOqoodOut',
                within: 'reafsCurrentOqoodWithin',
                total: 'reafsCurrentOqoodTotal',
                except: 'reafsCurOqoodExceptCapVal',
              },
              8: {
                out: 'reafsCurrentRefundOut',
                within: 'reafsCurrentRefundWithin',
                total: 'reafsCurrentRefundTotal',
                except: 'reafsCurRefundExceptCapVal',
              },
              9: {
                out: 'reafsCurBalInRetenAccOut',
                within: 'reafsCurBalInRetenAccWithin',
                total: 'reafsCurBalInRetenAccTotal',
                except: 'reafsCurBalInRetenExceptCapVal',
              },
              10: {
                out: 'reafsCurBalInTrustAccOut',
                within: 'reafsCurBalInTrustAccWithin',
                total: 'reafsCurBalInTrustAccTotal',
                except: 'reafsCurBalInExceptCapVal',
              },
              11: {
                out: 'reafsCurBalInSubsConsOut',
                within: 'reafsCurBalInRSubsConsWithin',
                total: 'reafsCurBalInSubsConsTotal',
                except: 'reafsCurBalInSubsConsCapVal',
              },
              12: {
                out: 'reafsCurTechnFeeOut',
                within: 'reafsCurTechnFeeWithin',
                total: 'reafsCurTechnFeeTotal',
                except: 'reafsCurTechFeeExceptCapVal',
              },
              13: {
                out: 'reafsCurUnIdeFundOut',
                within: 'reafsCurUnIdeFundWithin',
                total: 'reafsCurUnIdeFundTotal',
                except: 'reafsCurUnIdeExceptCapVal',
              },
              14: {
                out: 'reafsCurLoanInstalOut',
                within: 'reafsCurLoanInstalWithin',
                total: 'reafsCurLoanInstalTotal',
                except: 'reafsCurLoanExceptCapVal',
              },
              15: {
                out: 'reafsCurInfraCostOut',
                within: 'reafsCurInfraCostWithin',
                total: 'reafsCurInfraCostTotal',
                except: 'reafsCurInfraExceptCapVal',
              },
              16: {
                out: 'reafsCurOthersCostOut',
                within: 'reafsCurOthersCostWithin',
                total: 'reafsCurOthersCostTotal',
                except: 'reafsCurOthersExceptCapVal',
              },
              17: {
                out: 'reafsCurTransferCostOut',
                within: 'reafsCurTransferCostWithin',
                total: 'reafsCurTransferCostTotal',
                except: 'reafsCurTransferExceptCapVal',
              },
              18: {
                out: 'reafsCurForfeitCostOut',
                within: 'reafsCurForfeitCostWithin',
                total: 'reafsCurForfeitCostTotal',
                except: 'reafsCurForfeitExceptCapVal',
              },
              19: {
                out: 'reafsCurDeveEqtycostOut',
                within: 'reafsCurDeveEqtycostWithin',
                total: 'reafsCurDeveEqtycostTotal',
                except: 'reafsCurDeveExceptCapVal',
              },
              20: {
                out: 'reafsCurAmntFundOut',
                within: 'reafsCurAmntFundWithin',
                total: 'reafsCurAmntFundTotal',
                except: 'reafsCurAmntExceptCapVal',
              },
              21: {
                out: 'reafsCurOtherWithdOut',
                within: 'reafsCurOtherWithdWithin',
                total: 'reafsCurOtherWithdTotal',
                except: 'reafsCurOtherExceptCapVal',
              },
              22: {
                out: 'reafsCurOqoodOthFeeOut',
                within: 'reafsCurOqoodOthFeeWithin',
                total: 'reafsCurOqoodOthFeeTotal',
                except: 'reafsOtherFeesAnPaymentExcepVal',
              },
              23: {
                out: 'reafsCurVatDepositOut',
                within: 'reafsCurVatDepositWithin',
                total: 'reafsCurVatDepositTotal',
                except: 'reafsCurVatDepositCapVal',
              },
            }

            const breakdown = Array(24)
              .fill(null)
              .map((_, index) => {
                const mapping = breakdownMap[index as keyof typeof breakdownMap]
                if (!mapping) {
                  return {
                    outOfEscrow: '',
                    withinEscrow: '',
                    total: '',
                    exceptionalCapValue: '',
                  }
                }

                // Explicitly access each field to ensure correct mapping per index
                const financialDataAny = financialData as any
                const outValue = financialDataAny.hasOwnProperty(mapping.out)
                  ? financialDataAny[mapping.out]
                  : undefined
                const withinValue = financialDataAny.hasOwnProperty(
                  mapping.within
                )
                  ? financialDataAny[mapping.within]
                  : undefined
                const totalValue = financialDataAny.hasOwnProperty(
                  mapping.total
                )
                  ? financialDataAny[mapping.total]
                  : undefined
                const exceptValue = financialDataAny.hasOwnProperty(
                  mapping.except
                )
                  ? financialDataAny[mapping.except]
                  : undefined

                return {
                  outOfEscrow:
                    outValue != null &&
                    outValue !== undefined &&
                    outValue !== ''
                      ? String(outValue)
                      : '',
                  withinEscrow:
                    withinValue != null &&
                    withinValue !== undefined &&
                    withinValue !== ''
                      ? String(withinValue)
                      : '',
                  total:
                    totalValue != null &&
                    totalValue !== undefined &&
                    totalValue !== ''
                      ? String(totalValue)
                      : '',
                  exceptionalCapValue:
                    exceptValue != null &&
                    exceptValue !== undefined &&
                    exceptValue !== ''
                      ? String(exceptValue)
                      : '',
                }
              })

            const completeFinancialData = {
              estimate: {
                revenue: financialData.reafsEstRevenue?.toString() || '',
                constructionCost:
                  financialData.reafsEstConstructionCost?.toString() || '',
                projectManagementExpense:
                  financialData.reafsEstProjectMgmtExpense?.toString() || '',
                landCost: financialData.reafsEstLandCost?.toString() || '',
                marketingExpense:
                  financialData.reafsEstMarketingExpense?.toString() || '',
                date: financialData.reafsEstimatedDate
                  ? dayjs(financialData.reafsEstimatedDate)
                  : null,
              },
              actual: {
                soldValue: financialData.reafsActualSoldValue?.toString() || '',
                constructionCost:
                  financialData.reafsActualConstructionCost?.toString() || '',
                infraCost: financialData.reafsActualInfraCost?.toString() || '',
                landCost: financialData.reafsActualLandCost?.toString() || '',
                projectManagementExpense:
                  financialData.reafsActualProjectMgmtExpense?.toString() || '',
                marketingExpense:
                  financialData.reafsActualMarketingExp?.toString() || '',
                date: financialData.reafsActualDate
                  ? dayjs(financialData.reafsActualDate)
                  : null,
              },
              breakdown,
              additional: {
                creditInterestRetention:
                  financialData.reafsCreditInterest?.toString() || '',
                paymentsRetentionAccount:
                  financialData.reafsPaymentForRetentionAcc?.toString() || '',
                reimbursementsDeveloper:
                  financialData.reafsDeveloperReimburse?.toString() || '',
                unitRegistrationFees:
                  financialData.reafsUnitRegFees?.toString() || '',
                creditInterestEscrow:
                  financialData.reafsCreditInterestProfit?.toString() || '',
                vatCapped: financialData.reafsVatCappedCost?.toString() || '',
              },
            }

            methods.reset({
              ...methods.getValues(),
              estimate: completeFinancialData.estimate,
              actual: completeFinancialData.actual,
              breakdown: completeFinancialData.breakdown,
              additional: completeFinancialData.additional,
            } as any)
          }
        } catch (error) {
          throw error
        }
      }

      loadFinancialData()
    }
  }, [activeStep, projectId, isAddingContact, methods])

  useEffect(() => {
    if (activeStep === 0 && projectId && !isAddingContact) {
      const loadProjectDetails = async () => {
        try {
          const apiData =
            await realEstateAssetService.getProjectDetails(projectId)

          if (apiData) {
            const processedProjectData = {
              ...apiData,
              reaStartDate: apiData.reaStartDate
                ? dayjs(apiData.reaStartDate)
                : null,
              reaCompletionDate: apiData.reaCompletionDate
                ? dayjs(apiData.reaCompletionDate)
                : null,
              reaRetentionEffectiveDate: apiData.reaRetentionEffectiveDate
                ? dayjs(apiData.reaRetentionEffectiveDate)
                : null,
              reaAccoutStatusDate: apiData.reaAccoutStatusDate
                ? dayjs(apiData.reaAccoutStatusDate)
                : null,
              reaRegistrationDate: apiData.reaRegistrationDate
                ? dayjs(apiData.reaRegistrationDate)
                : null,
            }

            methods.reset(processedProjectData)
          }
        } catch (error) {
          throw error
        }
      }

      loadProjectDetails()
    }
  }, [activeStep, projectId, isAddingContact, methods])

  useEffect(() => {
    if (activeStep === 7 && projectId && !isAddingContact) {
      const loadClosureData = async () => {
        try {
          const apiData =
            await realEstateAssetService.getProjectClosure(projectId)

          if (apiData) {
            const closureData = apiData?.content?.[0] || apiData

            if (closureData?.id) {
              setProjectClosureId(closureData.id)
            }

            const processedClosureData = {
              totalIncomeFund:
                closureData.reacTotalIncomeFund?.toString() ||
                closureData.totalIncomeFund?.toString() ||
                '',
              totalPayment:
                closureData.reacTotalPayment?.toString() ||
                closureData.totalPayment?.toString() ||
                '',
            }

            methods.setValue(
              'closureData.totalIncomeFund' as any,
              processedClosureData.totalIncomeFund,
              { shouldValidate: false }
            )
            methods.setValue(
              'closureData.totalPayment' as any,
              processedClosureData.totalPayment,
              { shouldValidate: false }
            )
          }
        } catch (error) {
          throw error
        }
      }

      loadClosureData()
    }
  }, [activeStep, projectId, isAddingContact, methods])

  useEffect(() => {
    if (activeStep === 2 && projectId && !isAddingContact) {
      const loadAccountsData = async () => {
        try {
          const apiData =
            await realEstateAssetService.getProjectAccounts(projectId)

          const accountsArray =
            (apiData as any)?.content || (Array.isArray(apiData) ? apiData : [])

          ;(window as any).originalStep2Accounts = []

          if (accountsArray.length > 0) {
            const normalizeAccountType = (type: string | null | undefined) => {
              if (!type) {
                return ''
              }

              const formatted = String(type).trim().toUpperCase()

              switch (formatted) {
                case 'TRUST':
                case 'TRUST ACCOUNT':
                  return 'TRUST'
                case 'RETENTION':
                case 'RETENTION ACCOUNT':
                  return 'RETENTION'
                case 'SUBCONSTRUCTION':
                case 'SUB CONSTRUCTION':
                case 'SUB-CONSTRUCTION':
                case 'SUB CONSTRUCTION ACCOUNT':
                case 'SUB-CONSTRUCTION ACCOUNT':
                  return 'SUBCONSTRUCTION'
                case 'CORPORATE':
                case 'CORPORATE ACCOUNT':
                  return 'CORPORATE'
                default:
                  return formatted
              }
            }

            const accountsByType = accountsArray.reduce(
              (acc: Record<string, any>, account: any) => {
                const key = normalizeAccountType(account?.accountType)

                if (key) {
                  acc[key] = account
                }

                return acc
              },
              {}
            )

            const processedAccounts = ACCOUNT_TYPES.map((type) => {
              const account = accountsByType[type] || {}
              const dateOpened = account.dateOpened
                ? dayjs(account.dateOpened)
                : null

              return {
                id: account.id ?? null,
                trustAccountNumber:
                  account.accountNumber || account.trustAccountNumber || '',
                ibanNumber: account.ibanNumber || '',
                dateOpened,
                accountTitle: account.accountTitle || '',
                currency: account.currencyCode || account.currency || '',
                accountType: type,
                isValidated: account.isValidated || false,
                enabled: account.enabled || false,
              }
            })

            const normalizedOriginalAccounts = processedAccounts.map(
              (account: any) => ({
                id: account.id ?? null,
                accountType: account.accountType || '',
                accountNumber: account.trustAccountNumber || '',
                ibanNumber: account.ibanNumber || '',
                accountTitle: account.accountTitle || '',
                currencyCode: account.currency || '',
                dateOpened: account.dateOpened
                  ? account.dateOpened.format('YYYY-MM-DD')
                  : '',
              })
            )

            ;(window as any).originalStep2Accounts = normalizedOriginalAccounts

            methods.setValue('accounts', processedAccounts)
          } else {
            methods.setValue('accounts', [])
          }
        } catch (error) {
          throw error
        }
      }

      loadAccountsData()
    }
  }, [activeStep, projectId, isAddingContact, methods])

  useEffect(() => {
    if (!projectId) {
      setIsEditingMode(false)
    } else {
      setIsEditingMode(true)
    }
  }, [projectId, isEditingMode])

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <Step1 isViewMode={isViewMode} projectId={projectId} />
      case 1:
        return (
          <DocumentUploadFactory
            type="BUILD_PARTNER_ASSET"
            entityId={projectId || 'temp_project_id'}
            isReadOnly={isViewMode}
            isOptional={true}
            onDocumentsChange={(documents: DocumentItem[]) => {
              methods.setValue('documents', documents)
            }}
            formFieldName="documents"
          />
        )
      case 2:
        const watchedAccounts = methods.watch('accounts')
        return (
          <Step2
            accounts={watchedAccounts}
            onAccountsChange={(accounts) => {
              setIsAddingContact(true)
              methods.setValue('accounts', accounts)
              setTimeout(() => setIsAddingContact(false), 100)
            }}
            projectId={projectId || ''}
            isViewMode={isViewMode}
          />
        )
      case 3:
        const watchedFees = methods.watch('fees')
        const buildPartnerIdForFees = methods
          .watch('buildPartnerDTO.id')
          ?.toString()

        return (
          <Step3
            fees={watchedFees}
            onFeesChange={(fees) => {
              setIsAddingContact(true)
              methods.setValue('fees', fees)
              setTimeout(() => setIsAddingContact(false), 100)
            }}
            projectId={projectId || ''}
            buildPartnerId={buildPartnerIdForFees}
            isViewMode={isViewMode}
          />
        )
      case 4:
        const buildPartnerIdForBeneficiaries = methods
          .watch('buildPartnerDTO.id')
          ?.toString()
        const watchedBeneficiaries = methods.watch('beneficiaries')

        return (
          <Step4
            beneficiaries={watchedBeneficiaries}
            onBeneficiariesChange={(beneficiaries) =>
              methods.setValue('beneficiaries', beneficiaries)
            }
            projectId={projectId || ''}
            buildPartnerId={buildPartnerIdForBeneficiaries}
            isViewMode={isViewMode}
          />
        )
      case 5:
        const watchedPaymentPlan = methods.watch('paymentPlan') || []

        return (
          <Step5
            paymentPlan={watchedPaymentPlan}
            onPaymentPlanChange={(paymentPlan) =>
              methods.setValue('paymentPlan', paymentPlan)
            }
            projectId={projectId || ''}
            isViewMode={isViewMode}
          />
        )
      case 6:
        const watchedFinancialData = methods.watch('financialData')

        return (
          <Step6
            financialData={watchedFinancialData}
            onFinancialDataChange={(financialData) =>
              methods.setValue('financialData', financialData)
            }
            isViewMode={isViewMode}
          />
        )
      case 7:
        return (
          <Step7
            projectId={projectId || 'temp_project_id'}
            isViewMode={isViewMode}
          />
        )
      case 8:
        return (
          <Step8
            projectData={methods.getValues()}
            onEditStep={handleEditStep}
            projectId={projectId || ''}
            isViewMode={isViewMode}
          />
        )
      default:
        return null
    }
  }

  const transformDetailsData = (formData: ProjectData) => ({
    ...(projectId && { id: projectId }),
    reaId: formData.reaId,
    reaCif: formData.reaCif,
    reaName: formData.reaName,
    reaLocation: formData.reaLocation,
    reaReraNumber: formData.reaReraNumber,
    reaStartDate: formData.reaStartDate
      ? convertDatePickerToZonedDateTime(
          formData.reaStartDate.format('YYYY-MM-DD')
        )
      : null,
    reaCompletionDate: formData.reaCompletionDate
      ? convertDatePickerToZonedDateTime(
          formData.reaCompletionDate.format('YYYY-MM-DD')
        )
      : null,
    reaRegistrationDate: formData.reaRegistrationDate
      ? convertDatePickerToZonedDateTime(
          formData.reaRegistrationDate.format('YYYY-MM-DD')
        )
      : null,
    reaAccoutStatusDate: formData.reaAccoutStatusDate
      ? convertDatePickerToZonedDateTime(
          formData.reaAccoutStatusDate.format('YYYY-MM-DD')
        )
      : null,
    reaConstructionCost:
      typeof formData.reaConstructionCost === 'number'
        ? formData.reaConstructionCost
        : parseFloat(String(formData.reaConstructionCost || '0')),
    reaNoOfUnits:
      typeof formData.reaNoOfUnits === 'number'
        ? formData.reaNoOfUnits
        : parseInt(String(formData.reaNoOfUnits || '0')),
    reaRemarks: formData.reaRemarks,
    reaSpecialApproval: formData.reaSpecialApproval,
    reaManagedBy: formData.reaManagedBy,
    reaBackupUser: formData.reaBackupUser,
    reaTeamLeadName: formData.reaTeamLeadName,
    reamprelationshipManagerName: formData.reamprelationshipManagerName,
    reaAssestRelshipManagerName: formData.reaAssestRelshipManagerName,
    reaLandOwnerName: formData.reaLandOwnerName,
    reaRetentionPercent: formData.reaRetentionPercent,
    reaAdditionalRetentionPercent: formData.reaAdditionalRetentionPercent,
    reaTotalRetentionPercent: formData.reaTotalRetentionPercent,
    reaRetentionEffectiveDate: formData.reaRetentionEffectiveDate
      ? convertDatePickerToZonedDateTime(
          formData.reaRetentionEffectiveDate.format('YYYY-MM-DD')
        )
      : null,
    reaManagementExpenses: formData.reaManagementExpenses,
    reaMarketingExpenses: formData.reaMarketingExpenses,
    reaRealEstateBrokerExp:
      typeof formData.reaRealEstateBrokerExp === 'number'
        ? formData.reaRealEstateBrokerExp
        : parseFloat(String(formData.reaRealEstateBrokerExp || '0')),
    reaAdvertisementExp:
      typeof formData.reaAdvertisementExp === 'number'
        ? formData.reaAdvertisementExp
        : parseFloat(String(formData.reaAdvertisementExp || '0')),
    reaPercentComplete: formData.reaPercentComplete,
    reaConstructionCostCurrencyDTO: {
      id:
        parseInt(
          formData.reaConstructionCostCurrencyDTO?.id?.toString() || '32'
        ) || 32,
    },
    buildPartnerDTO: {
      id: parseInt(formData.buildPartnerDTO?.id?.toString() || '501') || 501,
    },
    reaStatusDTO: {
      id: parseInt(formData.reaStatusDTO?.id?.toString() || '53') || 53,
    },
    reaTypeDTO: {
      id: parseInt(formData.reaTypeDTO?.id?.toString() || '51') || 51,
    },
    reaAccountStatusDTO: {
      id: parseInt(formData.reaAccountStatusDTO?.id?.toString() || '55') || 55,
    },
    reaBlockPaymentTypeDTO: formData.reaBlockPaymentTypeDTO?.id
      ? {
          id: parseInt(formData.reaBlockPaymentTypeDTO.id.toString()),
        }
      : null,
    status: formData.status || 'ACTIVE',
    enabled: true,
    deleted: false,
  })

  const handleViewNext = useCallback(() => {
    if (activeStep < steps.length - 1) {
      const nextStep = activeStep + 1
      setActiveStep(nextStep)

      if (projectId) {
        const targetUrl = `/build-partner-assets/${projectId}?step=${nextStep + 1}&mode=view`
        router.push(targetUrl)
      }
    } else {
      router.push('/build-partner-assets')
    }
  }, [activeStep, steps.length, projectId, router])

  const handleViewBack = useCallback(() => {
    if (activeStep > 0) {
      const prevStep = activeStep - 1
      setActiveStep(prevStep)

      if (projectId) {
        const targetUrl = `/build-partner-assets/${projectId}?step=${prevStep + 1}&mode=view`
        router.push(targetUrl)
      }
    }
  }, [activeStep, projectId, router])

  const handleSaveAndNext = useCallback(async () => {
    if (isViewMode) {
      handleViewNext()
      return
    }

    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      // Check for unsaved changes in Step 5 (Payment Plan)
      if (activeStep === 5) {
        const step5State = (window as any).step5ValidationState || {}
        if (step5State.hasUnsavedChanges) {
          setErrorMessage(
            'You have unsaved installment data. Please save all rows (click the ✓ icon) or cancel editing (click the ✗ icon) before proceeding.'
          )
          setTimeout(() => setErrorMessage(null), 5000)
          return
        }
      }

      if (stepRequiresValidation(activeStep)) {
        const { isValid } = await validateCurrentStep(methods, activeStep)

        if (!isValid) {
          setErrorMessage(
            'Please fix the validation errors highlighted in the form below.'
          )
          setTimeout(() => setErrorMessage(null), 3000)
          return
        }
      }

      const currentFormData = methods.getValues()

      if (SKIP_VALIDATION_STEPS.includes(activeStep as 1 | 3 | 4)) {
        const nextStep = activeStep + 1
        setActiveStep(nextStep)

        if (projectId) {
          const targetUrl = `/build-partner-assets/${projectId}?step=${nextStep + 1}${getModeParam()}`
          router.push(targetUrl)
        }
        return
      }

      if (activeStep >= steps.length - 1) {
        try {
          const projectIdFromStatus =
            stepStatus?.stepData?.step1?.id?.toString()
          const step1Data = stepStatus?.stepData?.step1

          if (!projectIdFromStatus || !step1Data) {
            setErrorMessage(
              'No Build Partner Asset data available - check stepStatus'
            )
            return
          }

          await createProjectWorkflowRequest.mutateAsync({
            referenceId: projectIdFromStatus,
            payloadData: step1Data as unknown as Record<string, unknown>,
            referenceType: 'BUILD_PARTNER_ASSET',
            moduleName: 'BUILD_PARTNER_ASSET',
            actionKey: 'CREATE',
          })

          setSuccessMessage(
            'Build partner asset registration submitted successfully! Workflow request created.'
          )
          router.push('/build-partner-assets')
          return
        } catch (error) {
          setErrorMessage(
            'Failed to submit workflow request. Please try again.'
          )
          return
        }
      }

      if (activeStep === 1) {
        const nextStep = activeStep + 1
        setActiveStep(nextStep)

        if (projectId) {
          const targetUrl = `/build-partner-assets/${projectId}?step=${nextStep + 1}${getModeParam()}`
          router.push(targetUrl)
        }
        return
      }

      if (activeStep === 3) {
        const nextStep = activeStep + 1
        setActiveStep(nextStep)

        if (projectId) {
          const targetUrl = `/build-partner-assets/${projectId}?step=${nextStep + 1}${getModeParam()}`
          router.push(targetUrl)
        }
        return
      }

      if (activeStep === 4) {
        const nextStep = activeStep + 1
        setActiveStep(nextStep)

        if (projectId) {
          const targetUrl = `/build-partner-assets/${projectId}?step=${nextStep + 1}${getModeParam()}`
          router.push(targetUrl)
        }
        return
      }

      if (SKIP_VALIDATION_STEPS.includes(activeStep as 1 | 3 | 4)) {
        const nextStep = activeStep + 1
        setActiveStep(nextStep)

        if (projectId) {
          const targetUrl = `/build-partner-assets/${projectId}?step=${nextStep + 1}${getModeParam()}`
          router.push(targetUrl)
        }
        return
      }

      if (activeStep === 2) {
        try {
          const validatedAccounts = (window as any).step2ValidatedAccounts || []
          const accountsArray = Array.isArray(validatedAccounts)
            ? validatedAccounts
            : []
          const accountsToSave = accountsArray.filter(
            (account: any) => account && account.isValidated
          )

          if (accountsToSave.length === 0) {
            setErrorMessage(ERROR_MESSAGES.NO_VALIDATED_ACCOUNTS)
            return
          }

          const originalAccounts = (window as any).originalStep2Accounts || []
          const changedAccounts = getChangedAccounts(
            accountsToSave,
            originalAccounts
          )

          if (changedAccounts.length === 0) {
            setSuccessMessage('No account changes detected.')
            const nextStep = activeStep + 1
            setActiveStep(nextStep)

            if (projectId) {
              const targetUrl = `/build-partner-assets/${projectId}?step=${nextStep + 1}${getModeParam()}`
              router.push(targetUrl)
            }
            return
          }

          const accountsToProcess = changedAccounts.map((account: any) => ({
            ...account,

            dateOpened: account.dateOpened
              ? convertDatePickerToZonedDateTime(account.dateOpened)
              : account.dateOpened,
          }))

          const saveResults = []
          const errors = []

          for (let i = 0; i < accountsToProcess.length; i++) {
            const account = accountsToProcess[i]
            try {
              let result
              if (isEditingMode && account.id) {
                result = await BankAccountService.updateBankAccount(account)
              } else {
                result = await BankAccountService.saveBankAccount(account)
              }
              saveResults.push(result)
            } catch (error) {
              errors.push({
                accountIndex: i + 1,
                account: account,
                error: error,
              })
            }
          }

          if (errors.length > 0) {
            return
          }

          setSuccessMessage(SUCCESS_MESSAGES.ACCOUNTS_SAVED)

          const currentAccountsSnapshot = methods.getValues('accounts') || []
          const normalizedSnapshot = currentAccountsSnapshot.map(
            (account: any) => ({
              id: account.id ?? null,
              accountType: account.accountType || '',
              accountNumber: account.trustAccountNumber || '',
              ibanNumber: account.ibanNumber || '',
              accountTitle: account.accountTitle || '',
              currencyCode: account.currency || '',
              dateOpened: account.dateOpened
                ? account.dateOpened.format?.('YYYY-MM-DD') ||
                  new Date(account.dateOpened).toISOString().split('T')[0]
                : '',
            })
          )

          ;(window as any).originalStep2Accounts = normalizedSnapshot

          const nextStep = activeStep + 1
          setActiveStep(nextStep)

          if (projectId) {
            const targetUrl = `/build-partner-assets/${projectId}?step=${nextStep + 1}${getModeParam()}`
            router.push(targetUrl)
          }
          return
        } catch (error) {
          setErrorMessage(ERROR_MESSAGES.ACCOUNT_SAVE_FAILED)
          return
        }
      }

      if (activeStep === 5) {
        // Check payment plan validation before proceeding
        const step5Validation = (window as any).step5ValidationState
        if (step5Validation && !step5Validation.isValid) {
          setErrorMessage(
            'Payment plan percentages exceed 100%. Please adjust the values before proceeding.'
          )
          setTimeout(() => setErrorMessage(null), 5000)
          return
        }

        const nextStep = activeStep + 1
        setActiveStep(nextStep)
        if (projectId) {
          const targetUrl = `/build-partner-assets/${projectId}?step=${nextStep + 1}${getModeParam()}`
          router.push(targetUrl)
        }
        return
      }

      if (activeStep === 6) {
        const financialData = {
          estimate: (currentFormData as any).estimate || {},
          actual: (currentFormData as any).actual || {},
          breakdown: (currentFormData as any).breakdown || {},
          additional: (currentFormData as any).additional || {},
        }

        if (isEditingMode && financialSummaryId) {
          await saveFinancialSummary.mutateAsync({
            financialData: financialData,
            projectId: financialSummaryId.toString(),
            isEdit: true,
            realProjectId: projectId,
          } as any)
        } else {
          await stepManager.saveStep(6, financialData, projectId, false)
        }
        setSuccessMessage('Financial Summary saved successfully')
        const nextStep = 7
        setActiveStep(nextStep)
        if (projectId) {
          const targetUrl = `/build-partner-assets/${projectId}?step=${nextStep + 1}${getModeParam()}`
          router.push(targetUrl)
        }
        return
      }

      if (activeStep === 7) {
        const closureData = currentFormData.closureData

        if (isEditingMode && projectClosureId) {
          await saveProjectClosure.mutateAsync({
            data: closureData,
            projectId: projectClosureId.toString(),
            isEdit: true,
            realProjectId: projectId,
          } as any)
        } else {
          await stepManager.saveStep(7, closureData, projectId, false)
        }

        setSuccessMessage('Asset Closure saved successfully')
        const nextStep = 8
        setActiveStep(nextStep)
        if (projectId) {
          const targetUrl = `/build-partner-assets/${projectId}?step=${nextStep + 1}${getModeParam()}`
          router.push(targetUrl)
        }
        return
      }

      const stepSpecificData = transformDetailsData(currentFormData)

      if (stepRequiresValidation(activeStep)) {
        const { isValid } = await validateCurrentStep(methods, activeStep)
        if (!isValid) {
          return
        }
      }

      const saveResponse = await stepManager.saveStep(
        activeStep + 1,
        stepSpecificData,
        projectId,
        isEditingMode
      )

      setSuccessMessage(SUCCESS_MESSAGES.STEP_SAVED)

      if (activeStep < STEPS.length - 1) {
        if (activeStep === 0) {
          const savedProjectId =
            (saveResponse as any)?.data?.id || (saveResponse as any)?.id

          const targetProjectId = isEditingMode
            ? projectId
            : savedProjectId || projectId

          if (targetProjectId) {
            const targetUrl = `/build-partner-assets/${targetProjectId}?step=2${getModeParam()}`

            setActiveStep(1)
            router.push(targetUrl)
          } else {
            setActiveStep((prev) => prev + 1)
          }
        } else {
          const nextStep = activeStep + 1

          setActiveStep(nextStep)

          if (projectId) {
            const targetUrl = `/build-partner-assets/${projectId}?step=${nextStep + 1}${getModeParam()}`

            router.push(targetUrl)
          }
        }
      } else {
        try {
          const projectIdFromStatus =
            stepStatus?.stepData?.step1?.id?.toString()
          const step1Data = stepStatus?.stepData?.step1

          if (!projectIdFromStatus || !step1Data) {
            setErrorMessage(
              'No Build Partner Asset data available - check stepStatus'
            )
            return
          }

          await createProjectWorkflowRequest.mutateAsync({
            referenceId: projectIdFromStatus,
            payloadData: step1Data as unknown as Record<string, unknown>,
            referenceType: 'BUILD_PARTNER_ASSET',
            moduleName: 'BUILD_PARTNER_ASSET',
            actionKey: 'CREATE',
          })

          setSuccessMessage(
            'Build Partner Asset registration submitted successfully! Workflow request created.'
          )
          router.push('/build-partner-assets')
        } catch (error) {
          setErrorMessage(
            'Failed to submit workflow request. Please try again.'
          )
        }
        router.push('/build-partner-assets')
        setSuccessMessage(SUCCESS_MESSAGES.ALL_STEPS_COMPLETED)
      }
    } catch (error: unknown) {
      const errorData = error as {
        response?: { data?: { message?: string } }
        message?: string
      }
      const errorMessage =
        errorData?.response?.data?.message ||
        errorData?.message ||
        ERROR_MESSAGES.SAVE_FAILED
      setErrorMessage(errorMessage)
    }
  }, [activeStep, methods, stepManager, projectId, router, isEditingMode])

  const handleBack = useCallback(() => {
    if (isViewMode) {
      handleViewBack()
      return
    }

    if (activeStep > 0) {
      const previousStep = activeStep - 1
      setActiveStep(previousStep)

      if (projectId) {
        const targetUrl = `/build-partner-assets/${projectId}?step=${previousStep + 1}${getModeParam()}`
        router.push(targetUrl)
      }
    }
  }, [activeStep, projectId, router, isViewMode, handleViewBack, getModeParam])

  const handleReset = useCallback(() => {
    router.push('/build-partner-assets')
  }, [router])

  const handleEditStep = useCallback(
    (stepNumber: number) => {
      setActiveStep(stepNumber)
      setIsEditingMode(true)
      setShouldResetForm(true)
      setSuccessMessage(`Now editing step ${stepNumber + 1} data`)

      if (projectId) {
        const targetUrl = `/build-partner-assets/${projectId}?step=${stepNumber + 1}${getModeParam()}`
        router.push(targetUrl)
      }
    },
    [setShouldResetForm, projectId, router, stepStatus, getModeParam]
  )

  const onSubmit = (_data: ProjectData) => {}

  if (isLoadingStepStatus && projectId) {
    return (
      <Box sx={loadingContainerSx}>
        <GlobalLoading fullHeight />
      </Box>
    )
  }

  try {
    return (
      <ErrorBoundary>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit((data: ProjectData) =>
              onSubmit(data)
            )}
          >
            <Box
              sx={{
                width: '100%',
                backgroundColor: theme.palette.mode === 'dark' 
                  ? '#111827' 
                  : alpha('#FFFFFF', 0.75),
                borderRadius: '16px',
                paddingTop: '16px',
                border: theme.palette.mode === 'dark' 
                  ? `1px solid ${alpha('#FFFFFF', 0.2)}` 
                  : '1px solid #FFFFFF',
              }}
            >
              <Stepper activeStep={activeStep} alternativeLabel>
                {STEPS.map((label) => (
                  <Step key={label}>
                    <StepLabel>
                      <Typography variant="caption" sx={stepperLabelSx}>
                        {label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box sx={formSectionSx}>
                {getStepContent(activeStep)}

                <Box
                  display="flex"
                  justifyContent="space-between"
                  sx={buttonContainerSx}
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
                      color: theme.palette.mode === 'dark' 
                        ? theme.palette.text.primary 
                        : theme.palette.text.primary,
                      borderColor: theme.palette.mode === 'dark' 
                        ? alpha('#FFFFFF', 0.3) 
                        : theme.palette.divider,
                      '&:hover': {
                        borderColor: theme.palette.mode === 'dark' 
                          ? alpha('#FFFFFF', 0.5) 
                          : theme.palette.divider,
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? alpha('#FFFFFF', 0.1) 
                          : alpha('#000000', 0.04),
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
                        sx={[
                          backButtonSx(theme),
                          { mr: 2 },
                        ]}
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      onClick={handleSaveAndNext}
                      variant="contained"
                      disabled={
                        !isViewMode &&
                        (stepManager.isLoading ||
                          createProjectWorkflowRequest.isPending)
                      }
                      sx={nextButtonSx(theme)}
                    >
                      {isViewMode
                        ? activeStep === steps.length - 1
                          ? 'Finish'
                          : 'Next'
                        : stepManager.isLoading ||
                            createProjectWorkflowRequest.isPending
                          ? activeStep === steps.length - 1
                            ? 'Submitting...'
                            : 'Saving...'
                          : activeStep === steps.length - 1
                            ? 'Submit'
                            : 'Save and Next'}
                    </Button>
                  </Box>

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
            </Box>
          </form>
        </FormProvider>
      </ErrorBoundary>
    )
  } catch (error) {
    return (
      <Box sx={errorContainerSx}>
        <Typography color="error">
          Error rendering form:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </Typography>
      </Box>
    )
  }
}
