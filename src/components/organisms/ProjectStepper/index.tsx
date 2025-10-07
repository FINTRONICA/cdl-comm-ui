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
  DEFAULT_FORM_VALUES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './constants'
import {
  stepperLabelSx,
  loadingContainerSx,
  errorContainerSx,
  formSectionSx,
  buttonContainerSx,
  primaryButtonSx,
} from './styles'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useAutoSave, useFormPersistence } from './hooks/useAutoSave'

export default function StepperWrapper({
  projectId,
  initialStep = 0,
  isViewMode = false,
}: {
  projectId?: string
  initialStep?: number
  isViewMode?: boolean
} = {}) {
  
  const [activeStep, setActiveStep] = useState(initialStep)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [shouldResetForm, setShouldResetForm] = useState(true)
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [financialSummaryId, setFinancialSummaryId] = useState<number | null>(null)
  const [projectClosureId, setProjectClosureId] = useState<number | null>(null)

  const router = useRouter()

  // Debug log for isEditingMode state
  useEffect(() => {
    
  }, [isEditingMode])


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

  const methods = useForm<ProjectData>({
    defaultValues: {
      ...DEFAULT_FORM_VALUES,
      reaAccoutStatusDate: null,
      reaRegistrationDate: null,
      reaStartDate: null,
      reaCompletionDate: null,
      reaRetentionEffectiveDate: dayjs('2022-03-31'),
      reaAccStatusDate: null,
      reaBlockPaymentTypeDTO: null,
    } as unknown as ProjectData,
    mode: 'onChange',
  })

  
  useAutoSave({
    interval: 30000, 
    debounceMs: 2000, 
    onSave: async (data) => {
      
      try {
        localStorage.setItem('projectStepper_draft', JSON.stringify(data))
      } catch (error) {
     throw error
      }
    },
    enabled: true,
  })


  useFormPersistence('projectStepper', {
    enabled: true,
    version: '1.0',
  })


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

            // Handle data processing for all steps
            const stepData = currentStepData as any
            
            // Process date fields (for Step 1)
            if (activeStep === 0) {
              if (stepData.reaStartDate && typeof stepData.reaStartDate === 'string') {
                ;(processedData as any).reaStartDate = dayjs(stepData.reaStartDate)
              }
              if (stepData.reaCompletionDate && typeof stepData.reaCompletionDate === 'string') {
                ;(processedData as any).reaCompletionDate = dayjs(stepData.reaCompletionDate)
              }
              if (stepData.reaRetentionEffectiveDate && typeof stepData.reaRetentionEffectiveDate === 'string') {
                ;(processedData as any).reaRetentionEffectiveDate = dayjs(stepData.reaRetentionEffectiveDate)
              }
              if (stepData.reaAccoutStatusDate && typeof stepData.reaAccoutStatusDate === 'string') {
                ;(processedData as any).reaAccoutStatusDate = dayjs(stepData.reaAccoutStatusDate)
              }
              if (stepData.reaRegistrationDate && typeof stepData.reaRegistrationDate === 'string') {
                ;(processedData as any).reaRegistrationDate = dayjs(stepData.reaRegistrationDate)
              }

              // Process DTO objects (for Step 1)
              if (stepData.buildPartnerDTO && typeof stepData.buildPartnerDTO === 'object') {
                processedData.buildPartnerDTO = stepData.buildPartnerDTO
              }
              if (stepData.reaStatusDTO && typeof stepData.reaStatusDTO === 'object') {
                processedData.reaStatusDTO = stepData.reaStatusDTO
              }
              if (stepData.reaTypeDTO && typeof stepData.reaTypeDTO === 'object') {
                processedData.reaTypeDTO = stepData.reaTypeDTO
              }
              if (stepData.reaAccountStatusDTO && typeof stepData.reaAccountStatusDTO === 'object') {
                processedData.reaAccountStatusDTO = stepData.reaAccountStatusDTO
              }
              if (stepData.reaConstructionCostCurrencyDTO && typeof stepData.reaConstructionCostCurrencyDTO === 'object') {
                processedData.reaConstructionCostCurrencyDTO = stepData.reaConstructionCostCurrencyDTO
              }
            }
            
            // Handle other steps data processing
            if (activeStep === 2) {
              // Step 3: Account data
              if ((stepData as any).accounts && Array.isArray((stepData as any).accounts)) {
                ;(processedData as any).accounts = (stepData as any).accounts.map((account: any) => ({
                  ...account,
                  id: account.id, // Preserve the original ID for updates
                  trustAccountNumber: account.accountNumber || account.trustAccountNumber || '', // Map accountNumber to trustAccountNumber
                  currency: account.currencyCode || account.currency || '', // Map currencyCode to currency
                  dateOpened: account.dateOpened ? dayjs(account.dateOpened) : null
                }))
              }
            }
            
            if (activeStep === 3) {
              // Step 4: Fee data
          
              if ((stepData as any).fees && Array.isArray((stepData as any).fees)) {
                const processedFees = (stepData as any).fees.map((fee: any) => ({
                  id: fee.id?.toString() || '',
                  FeeType: fee.reafCategoryDTO?.languageTranslationId?.configValue || fee.reafCategoryDTO?.settingValue || fee.feeType || fee.FeeType || '',
                  Frequency: fee.reafFrequencyDTO?.languageTranslationId?.configValue || fee.reafFrequencyDTO?.settingValue || fee.frequency || fee.Frequency || 'N/A',
                  DebitAmount: fee.reafDebitAmount?.toString() || fee.debitAmount || fee.DebitAmount || '',
                  Feetobecollected: fee.reafCollectionDate || fee.feeToBeCollected || fee.Feetobecollected || '',
                  NextRecoveryDate: fee.reafNextRecoveryDate ? dayjs(fee.reafNextRecoveryDate).format('YYYY-MM-DD') : (fee.nextRecoveryDate ? dayjs(fee.nextRecoveryDate).format('YYYY-MM-DD') : (fee.NextRecoveryDate || '')),
                  FeePercentage: fee.reafFeePercentage?.toString() || fee.feePercentage || fee.FeePercentage || '',
                  Amount: fee.reafTotalAmount?.toString() || fee.amount || fee.Amount || '',
                  VATPercentage: fee.reafVatPercentage?.toString() || fee.vatPercentage || fee.VATPercentage || '',
                  // Keep original field names for compatibility
                  feeType: fee.reafCategoryDTO?.languageTranslationId?.configValue || fee.reafCategoryDTO?.settingValue || fee.feeType || '',
                  frequency: fee.reafFrequencyDTO?.languageTranslationId?.configValue || fee.reafFrequencyDTO?.settingValue || fee.frequency || 'N/A',
                  debitAmount: fee.reafDebitAmount?.toString() || fee.debitAmount || '',
                  feeToBeCollected: fee.reafCollectionDate || fee.feeToBeCollected || '',
                  nextRecoveryDate: fee.reafNextRecoveryDate ? dayjs(fee.reafNextRecoveryDate) : (fee.nextRecoveryDate ? dayjs(fee.nextRecoveryDate) : null),
                  feePercentage: fee.reafFeePercentage?.toString() || fee.feePercentage || '',
                  amount: fee.reafTotalAmount?.toString() || fee.amount || '',
                  vatPercentage: fee.reafVatPercentage?.toString() || fee.vatPercentage || '',
                  currency: fee.reafCurrencyDTO?.languageTranslationId?.configValue || fee.reafCurrencyDTO?.settingValue || fee.currency || '',
                }))
               
                ;(processedData as any).fees = processedFees
              }
            }
            
            if (activeStep === 4) {
              // Step 5: Beneficiary data
              if ((stepData as any).beneficiaries && Array.isArray((stepData as any).beneficiaries)) {
                const processedBeneficiaries = (stepData as any).beneficiaries.map((beneficiary: any) => ({
                  id: beneficiary.id?.toString() || '',
                  reaBeneficiaryId: beneficiary.reabBeneficiaryId || beneficiary.beneficiaryId || beneficiary.reaBeneficiaryId || '',
                  reaBeneficiaryType: beneficiary.reabType || beneficiary.beneficiaryType || beneficiary.reaBeneficiaryType || '',
                  reaName: beneficiary.reabName || beneficiary.name || beneficiary.reaName || '',
                  reaBankName: beneficiary.reabBank || beneficiary.bankName || beneficiary.reaBankName || '',
                  reaSwiftCode: beneficiary.reabSwift || beneficiary.swiftCode || beneficiary.reaSwiftCode || '',
                  reaRoutingCode: beneficiary.reabRoutingCode || beneficiary.routingCode || beneficiary.reaRoutingCode || '',
                  reaAccountNumber: beneficiary.reabBeneAccount || beneficiary.accountNumber || beneficiary.reaAccountNumber || '',
                  // Keep original field names for compatibility
                  beneficiaryId: beneficiary.reabBeneficiaryId || beneficiary.beneficiaryId || '',
                  beneficiaryType: beneficiary.reabType || beneficiary.beneficiaryType || '',
                  name: beneficiary.reabName || beneficiary.name || '',
                  bankName: beneficiary.reabBank || beneficiary.bankName || '',
                  swiftCode: beneficiary.reabSwift || beneficiary.swiftCode || '',
                  routingCode: beneficiary.reabRoutingCode || beneficiary.routingCode || '',
                  accountNumber: beneficiary.reabBeneAccount || beneficiary.accountNumber || '',
                }))
                ;(processedData as any).beneficiaries = processedBeneficiaries
              }
            }
            
            if (activeStep === 5) {
              // Step 6: Payment Plan data
              if ((stepData as any).paymentPlan && Array.isArray((stepData as any).paymentPlan)) {
                ;(processedData as any).paymentPlan = (stepData as any).paymentPlan
              }
            }
            
            if (activeStep === 6) {
              // Step 7: Financial data
              if ((stepData as any).financialData && typeof (stepData as any).financialData === 'object') {
                ;(processedData as any).financialData = (stepData as any).financialData
              }
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
              apiData = await realEstateAssetService.getProjectDetails(projectId)
              break
            case 1: // Step 2: Documents - no API call needed, just navigate
              
              setShouldResetForm(false)
              return
            case 2: // Step 3: Accounts
              apiData = await realEstateAssetService.getProjectAccounts(projectId)
              break
            case 3: // Step 4: Fees
              apiData = await realEstateAssetService.getProjectFees(projectId)
              break
            case 4: // Step 5: Beneficiaries
              apiData = await realEstateAssetService.getProjectBeneficiaries(projectId)
              break
            case 5: // Step 6: Payment Plans
              apiData = await realEstateAssetService.getProjectPaymentPlans(projectId)
              break
            case 6: // Step 7: Financial Data
              apiData = await realEstateAssetService.getProjectFinancialSummary(projectId)
              break
            case 7: // Step 8: Project Closure
              apiData = await realEstateAssetService.getProjectClosure(projectId)
              break
            case 8: // Step 9: Review - no API call needed
              
              setShouldResetForm(false)
              return
            default:
             
              setShouldResetForm(false)
              return
          }

         

          if (apiData) {
            let processedData = apiData

            // Process the API data based on step
            if (activeStep === 0) {
              // Step 1: Process project details
              processedData = {
                ...apiData,
                reaStartDate: apiData.reaStartDate ? dayjs(apiData.reaStartDate) : null,
                reaCompletionDate: apiData.reaCompletionDate ? dayjs(apiData.reaCompletionDate) : null,
                reaRetentionEffectiveDate: apiData.reaRetentionEffectiveDate ? dayjs(apiData.reaRetentionEffectiveDate) : null,
                reaAccoutStatusDate: apiData.reaAccoutStatusDate ? dayjs(apiData.reaAccoutStatusDate) : null,
                reaRegistrationDate: apiData.reaRegistrationDate ? dayjs(apiData.reaRegistrationDate) : null,
              }
            } else if (activeStep === 2) {
              // Step 3: Process accounts data
              // Handle paginated response structure
              const accountsArray = apiData?.content || (Array.isArray(apiData) ? apiData : [])
              processedData = {
                accounts: accountsArray.map((account: any) => ({
                  id: account.id, // Preserve the original ID for updates
                  trustAccountNumber: account.accountNumber || '', // Map accountNumber to trustAccountNumber
                  ibanNumber: account.ibanNumber || '',
                  dateOpened: account.dateOpened ? dayjs(account.dateOpened) : null,
                  accountTitle: account.accountTitle || '',
                  currency: account.currencyCode || '', // Map currencyCode to currency
                  accountType: account.accountType || '',
                  isValidated: account.isValidated || false,
                  enabled: account.enabled || false
                }))
              }
            } else if (activeStep === 3) {
            
              const feesArray = apiData?.content || (Array.isArray(apiData) ? apiData : [])
             
              const processedFees = feesArray.map((fee: any) => ({
                id: fee.id?.toString() || '',
                FeeType: fee.reafCategoryDTO?.languageTranslationId?.configValue || fee.reafCategoryDTO?.settingValue || '',
                Frequency: fee.reafFrequencyDTO?.languageTranslationId?.configValue || fee.reafFrequencyDTO?.settingValue || 'N/A', // Default to 'N/A' since reafFrequencyDTO is null
                DebitAmount: fee.reafDebitAmount?.toString() || '',
                Feetobecollected: fee.reafCollectionDate || '',
                NextRecoveryDate: fee.reafNextRecoveryDate ? dayjs(fee.reafNextRecoveryDate).format('YYYY-MM-DD') : '',
                FeePercentage: fee.reafFeePercentage?.toString() || '',
                Amount: fee.reafTotalAmount?.toString() || '',
                VATPercentage: fee.reafVatPercentage?.toString() || '',
                // Keep original field names for compatibility
                feeType: fee.reafCategoryDTO?.languageTranslationId?.configValue || fee.reafCategoryDTO?.settingValue || '',
                frequency: fee.reafFrequencyDTO?.languageTranslationId?.configValue || fee.reafFrequencyDTO?.settingValue || 'N/A',
                debitAmount: fee.reafDebitAmount?.toString() || '',
                feeToBeCollected: fee.reafCollectionDate || '',
                nextRecoveryDate: fee.reafNextRecoveryDate ? dayjs(fee.reafNextRecoveryDate) : null,
                feePercentage: fee.reafFeePercentage?.toString() || '',
                amount: fee.reafTotalAmount?.toString() || '',
                vatPercentage: fee.reafVatPercentage?.toString() || '',
                currency: fee.reafCurrencyDTO?.languageTranslationId?.configValue || fee.reafCurrencyDTO?.settingValue || '',
              }))
             
              processedData = {
                fees: processedFees
              }
            } else if (activeStep === 4) {
              // Step 5: Process beneficiaries data
              // Handle paginated response structure
              const beneficiariesArray = apiData?.content || (Array.isArray(apiData) ? apiData : [])
              processedData = {
                beneficiaries: beneficiariesArray.map((beneficiary: any) => ({
                  id: beneficiary.id?.toString() || '',
                  reaBeneficiaryId: beneficiary.reabBeneficiaryId || '',
                  reaBeneficiaryType: beneficiary.reabType || '',
                  reaName: beneficiary.reabName || '',
                  reaBankName: beneficiary.reabBank || '',
                  reaSwiftCode: beneficiary.reabSwift || '',
                  reaRoutingCode: beneficiary.reabRoutingCode || '',
                  reaAccountNumber: beneficiary.reabBeneAccount || '',
                  // Keep original field names for compatibility
                  beneficiaryId: beneficiary.reabBeneficiaryId || '',
                  beneficiaryType: beneficiary.reabType || '',
                  name: beneficiary.reabName || '',
                  bankName: beneficiary.reabBank || '',
                  swiftCode: beneficiary.reabSwift || '',
                  routingCode: beneficiary.reabRoutingCode || '',
                  accountNumber: beneficiary.reabBeneAccount || '',
                }))
              }
            } else if (activeStep === 5) {
              // Step 6: Process payment plans data
              // Handle paginated response structure
              const paymentPlansArray = apiData?.content || (Array.isArray(apiData) ? apiData : [])
              processedData = {
                paymentPlan: paymentPlansArray.map((plan: any) => ({
                  id: plan.id?.toString() || '',
                  installmentNumber: plan.reappInstallmentNumber || 0,
                  installmentPercentage: plan.reappInstallmentPercentage?.toString() || '0',
                  projectCompletionPercentage: plan.reappProjectCompletionPercentage?.toString() || '0',
                }))
              }
            } else if (activeStep === 6) {
              // Step 7: Process financial data
              // Handle paginated response structure
              const financialData = apiData?.content?.[0] || apiData
              processedData = {
                estimate: {
                  revenue: financialData?.reafsEstRevenue?.toString() || '',
                  constructionCost: financialData?.reafsEstConstructionCost?.toString() || '',
                  projectManagementExpense: financialData?.reafsEstProjectMgmtExpense?.toString() || '',
                  landCost: financialData?.reafsEstLandCost?.toString() || '',
                  marketingExpense: financialData?.reafsEstMarketingExpense?.toString() || '',
                  date: financialData?.reafsEstimatedDate ? dayjs(financialData.reafsEstimatedDate) : null,
                },
                actual: {
                  soldValue: financialData?.reafsActualSoldValue?.toString() || '',
                  constructionCost: financialData?.reafsActualConstructionCost?.toString() || '',
                  infraCost: financialData?.reafsActualInfraCost?.toString() || '',
                  landCost: financialData?.reafsActualLandCost?.toString() || '',
                  projectManagementExpense: financialData?.reafsActualProjectMgmtExpense?.toString() || '',
                  marketingExpense: financialData?.reafsActualMarketingExp?.toString() || '',
                  date: financialData?.reafsActualDate ? dayjs(financialData.reafsActualDate) : null,
                },
                // Add breakdown fields for current financial data
                breakdown: {
                  0: {
                    outOfEscrow: financialData?.reafsCurCashRecvdOutEscrow?.toString() || '',
                    withinEscrow: financialData?.reafsCurCashRecvdWithin?.toString() || '',
                    total: financialData?.reafsCurCashRecvdTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurCashexceptCapVal || '',
                  },
                  1: {
                    outOfEscrow: financialData?.reafsCurLandCostOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurLandCostWithin?.toString() || '',
                    total: financialData?.reafsCurLandTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurLandexceptCapVal || '',
                  },
                  2: {
                    outOfEscrow: financialData?.reafsCurConsCostOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurConsCostWithin?.toString() || '',
                    total: financialData?.reafsCurConsCostTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurConsExcepCapVal || '',
                  },
                  3: {
                    outOfEscrow: financialData?.reafsCurrentMktgExpOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurrentMktgExpWithin?.toString() || '',
                    total: financialData?.reafsCurrentMktgExpTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurrentmktgExcepCapVal || '',
                  },
                  4: {
                    outOfEscrow: financialData?.reafsCurProjMgmtExpOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurProjMgmtExpWithin?.toString() || '',
                    total: financialData?.reafsCurProjMgmtExpTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurProjExcepCapVal || '',
                  },
                  5: {
                    outOfEscrow: financialData?.currentMortgageOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurrentMortgageWithin?.toString() || '',
                    total: financialData?.reafsCurrentMortgageTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurMortgageExceptCapVal || '',
                  },
                  6: {
                    outOfEscrow: financialData?.reafsCurrentVatPaymentOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurrentVatPaymentWithin?.toString() || '',
                    total: financialData?.reafsCurrentVatPaymentTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurVatExceptCapVal || '',
                  },
                  7: {
                    outOfEscrow: financialData?.reafsCurrentOqoodOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurrentOqoodWithin?.toString() || '',
                    total: financialData?.reafsCurrentOqoodTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurOqoodExceptCapVal || '',
                  },
                  8: {
                    outOfEscrow: financialData?.reafsCurrentRefundOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurrentRefundWithin?.toString() || '',
                    total: financialData?.reafsCurrentRefundTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurRefundExceptCapVal || '',
                  },
                  9: {
                    outOfEscrow: financialData?.reafsCurBalInRetenAccOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurBalInRetenAccWithin?.toString() || '',
                    total: financialData?.reafsCurBalInRetenAccTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurBalInRetenExceptCapVal || '',
                  },
                  10: {
                    outOfEscrow: financialData?.reafsCurBalInTrustAccOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurBalInTrustAccWithin?.toString() || '',
                    total: financialData?.reafsCurBalInTrustAccTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurBalInExceptCapVal || '',
                  },
                  11: {
                    outOfEscrow: financialData?.reafsCurBalInSubsConsOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurBalInRSubsConsWithin?.toString() || '',
                    total: financialData?.reafsCurBalInSubsConsTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurBalInSubsConsCapVal || '',
                  },
                  12: {
                    outOfEscrow: financialData?.reafsCurTechnFeeOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurTechnFeeWithin?.toString() || '',
                    total: financialData?.reafsCurTechnFeeTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurTechFeeExceptCapVal || '',
                  },
                  13: {
                    outOfEscrow: financialData?.reafsCurUnIdeFundOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurUnIdeFundWithin?.toString() || '',
                    total: financialData?.reafsCurUnIdeFundTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurUnIdeExceptCapVal || '',
                  },
                  14: {
                    outOfEscrow: financialData?.reafsCurLoanInstalOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurLoanInstalWithin?.toString() || '',
                    total: financialData?.reafsCurLoanInstalTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurLoanExceptCapVal || '',
                  },
                  15: {
                    outOfEscrow: financialData?.reafsCurInfraCostOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurInfraCostWithin?.toString() || '',
                    total: financialData?.reafsCurInfraCostTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurInfraExceptCapVal || '',
                  },
                  16: {
                    outOfEscrow: financialData?.reafsCurOthersCostOut?.toString() || '',
                    withinEscrow: financialData?.reafsCurOthersCostWithin?.toString() || '',
                    total: financialData?.reafsCurOthersCostTotal?.toString() || '',
                    exceptionalCapValue: financialData?.reafsCurOthersExceptCapVal || '',
                  },
                }
              }
            } else if (activeStep === 7) {
            
              const closureData = apiData?.content?.[0] || apiData
              
         
              if (closureData?.id) {
               
                setProjectClosureId(closureData.id)
              }
              
              processedData = {
                closureData: {
                  totalIncomeFund: closureData?.reacTotalIncomeFund?.toString() || closureData?.totalIncomeFund?.toString() || '',
                  totalPayment: closureData?.reacTotalPayment?.toString() || closureData?.totalPayment?.toString() || '',
                }
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
  }, [stepStatus, shouldResetForm, isAddingContact, activeStep, methods, projectId])

 
  useEffect(() => {
    setShouldResetForm(true)
  }, [activeStep])


  useEffect(() => {
    if (activeStep === 3 && projectId && !isAddingContact) {
     
      
      const loadFeesData = async () => {
        try {
          const apiData = await realEstateAssetService.getProjectFees(projectId)
          
          
          const feesArray = (apiData as any)?.content || (Array.isArray(apiData) ? apiData : [])
          
          
          if (feesArray.length > 0) {
            const processedFees = feesArray.map((fee: any) => ({
              id: fee.id?.toString() || '',
              FeeType: fee.reafCategoryDTO?.languageTranslationId?.configValue || fee.reafCategoryDTO?.settingValue || '',
              Frequency: fee.reafFrequencyDTO?.languageTranslationId?.configValue || fee.reafFrequencyDTO?.settingValue || 'N/A', // Default to 'N/A' since reafFrequencyDTO is null
              DebitAmount: fee.reafDebitAmount?.toString() || '',
              Feetobecollected: fee.reafCollectionDate || '',
              NextRecoveryDate: fee.reafNextRecoveryDate ? dayjs(fee.reafNextRecoveryDate).format('YYYY-MM-DD') : '',
              FeePercentage: fee.reafFeePercentage?.toString() || '',
              Amount: fee.reafTotalAmount?.toString() || '',
              VATPercentage: fee.reafVatPercentage?.toString() || '',
              // Keep original field names for compatibility
              feeType: fee.reafCategoryDTO?.languageTranslationId?.configValue || fee.reafCategoryDTO?.settingValue || '',
              frequency: fee.reafFrequencyDTO?.languageTranslationId?.configValue || fee.reafFrequencyDTO?.settingValue || 'N/A',
              debitAmount: fee.reafDebitAmount?.toString() || '',
              feeToBeCollected: fee.reafCollectionDate || '',
              nextRecoveryDate: fee.reafNextRecoveryDate ? dayjs(fee.reafNextRecoveryDate) : null,
              feePercentage: fee.reafFeePercentage?.toString() || '',
              amount: fee.reafTotalAmount?.toString() || '',
              vatPercentage: fee.reafVatPercentage?.toString() || '',
              currency: fee.reafCurrencyDTO?.languageTranslationId?.configValue || fee.reafCurrencyDTO?.settingValue || '',
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
          const apiData = await realEstateAssetService.getProjectBeneficiaries(projectId)
          
          
          const beneficiariesArray = (apiData as any)?.content || (Array.isArray(apiData) ? apiData : [])
         
          
          if (beneficiariesArray.length > 0) {
            const processedBeneficiaries = beneficiariesArray.map((beneficiary: any) => ({
              id: beneficiary.id?.toString() || '',
              reaBeneficiaryId: beneficiary.reabBeneficiaryId || '',
              reaBeneficiaryType: beneficiary.reabType || '',
              reaName: beneficiary.reabName || '',
              reaBankName: beneficiary.reabBank || '',
              reaSwiftCode: beneficiary.reabSwift || '',
              reaRoutingCode: beneficiary.reabRoutingCode || '',
              reaAccountNumber: beneficiary.reabBeneAccount || '',
              // Keep original field names for compatibility
              beneficiaryId: beneficiary.reabBeneficiaryId || '',
              beneficiaryType: beneficiary.reabType || '',
              name: beneficiary.reabName || '',
              bankName: beneficiary.reabBank || '',
              swiftCode: beneficiary.reabSwift || '',
              routingCode: beneficiary.reabRoutingCode || '',
              accountNumber: beneficiary.reabBeneAccount || '',
            }))
            
            
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
          const apiData = await realEstateAssetService.getProjectPaymentPlans(projectId)
         
          
          if (apiData && apiData.length > 0) {
            const processedPaymentPlans = apiData.map((plan: any) => ({
              id: plan.id?.toString() || '',
              installmentNumber: plan.reappInstallmentNumber || 0,
              installmentPercentage: plan.reappInstallmentPercentage?.toString() || '',
              projectCompletionPercentage: plan.reappProjectCompletionPercentage?.toString() || '',
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

  // Specific useEffect for financial data loading
  useEffect(() => {
    if (activeStep === 6 && projectId && !isAddingContact) {
      
      
      const loadFinancialData = async () => {
        try {
          const apiData = await realEstateAssetService.getProjectFinancialSummary(projectId)
          
          
          // Extract financial summary ID from paginated response
          const financialData = apiData?.content?.[0] || apiData
          if (financialData?.id) {
            
            setFinancialSummaryId(financialData.id)
          }
          
          if (apiData) {
            // Process financial data and set it to the form
            const processedFinancialData = {
              estimate: {
                revenue: apiData.reafsEstRevenue?.toString() || '',
                constructionCost: apiData.reafsEstConstructionCost?.toString() || '',
                projectManagementExpense: apiData.reafsEstProjectMgmtExpense?.toString() || '',
                landCost: apiData.reafsEstLandCost?.toString() || '',
                marketingExpense: apiData.reafsEstMarketingExpense?.toString() || '',
                date: apiData.reafsEstimatedDate ? dayjs(apiData.reafsEstimatedDate) : null,
              },
              actual: {
                soldValue: apiData.reafsActualSoldValue?.toString() || '',
                constructionCost: apiData.reafsActualConstructionCost?.toString() || '',
                infraCost: apiData.reafsActualInfraCost?.toString() || '',
                landCost: apiData.reafsActualLandCost?.toString() || '',
                projectManagementExpense: apiData.reafsActualProjectMgmtExpense?.toString() || '',
                marketingExpense: apiData.reafsActualMarketingExp?.toString() || '',
                date: apiData.reafsActualDate ? dayjs(apiData.reafsActualDate) : null,
              }
            }
            
           
     
            methods.setValue('estimate.revenue' as any, processedFinancialData.estimate.revenue, { shouldValidate: false })
            methods.setValue('estimate.constructionCost' as any, processedFinancialData.estimate.constructionCost, { shouldValidate: false })
            methods.setValue('estimate.projectManagementExpense' as any, processedFinancialData.estimate.projectManagementExpense, { shouldValidate: false })
            methods.setValue('estimate.landCost' as any, processedFinancialData.estimate.landCost, { shouldValidate: false })
            methods.setValue('estimate.marketingExpense' as any, processedFinancialData.estimate.marketingExpense, { shouldValidate: false })
            methods.setValue('estimate.date' as any, processedFinancialData.estimate.date, { shouldValidate: false })
  
            methods.setValue('actual.soldValue' as any, processedFinancialData.actual.soldValue, { shouldValidate: false })
            methods.setValue('actual.constructionCost' as any, processedFinancialData.actual.constructionCost, { shouldValidate: false })
            methods.setValue('actual.infraCost' as any, processedFinancialData.actual.infraCost, { shouldValidate: false })
            methods.setValue('actual.landCost' as any, processedFinancialData.actual.landCost, { shouldValidate: false })
            methods.setValue('actual.projectManagementExpense' as any, processedFinancialData.actual.projectManagementExpense, { shouldValidate: false })
            methods.setValue('actual.marketingExpense' as any, processedFinancialData.actual.marketingExpense, { shouldValidate: false })
            methods.setValue('actual.date' as any, processedFinancialData.actual.date, { shouldValidate: false })
            
            // Set breakdown fields for current financial data
            // Cash Received from the Unit Holder (index 0)
            methods.setValue('breakdown.0.outOfEscrow' as any, apiData.reafsCurCashRecvdOutEscrow?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.0.withinEscrow' as any, apiData.reafsCurCashRecvdWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.0.total' as any, apiData.reafsCurCashRecvdTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.0.exceptionalCapValue' as any, apiData.reafsCurCashexceptCapVal || '', { shouldValidate: false })
            
            // Land Cost (index 1)
            methods.setValue('breakdown.1.outOfEscrow' as any, apiData.reafsCurLandCostOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.1.withinEscrow' as any, apiData.reafsCurLandCostWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.1.total' as any, apiData.reafsCurLandTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.1.exceptionalCapValue' as any, apiData.reafsCurLandexceptCapVal || '', { shouldValidate: false })
            
            // Construction Cost (index 2)
            methods.setValue('breakdown.2.outOfEscrow' as any, apiData.reafsCurConsCostOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.2.withinEscrow' as any, apiData.reafsCurConsCostWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.2.total' as any, apiData.reafsCurConsCostTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.2.exceptionalCapValue' as any, apiData.reafsCurConsExcepCapVal || '', { shouldValidate: false })
            
            // Marketing Expense (index 3)
            methods.setValue('breakdown.3.outOfEscrow' as any, apiData.reafsCurrentMktgExpOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.3.withinEscrow' as any, apiData.reafsCurrentMktgExpWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.3.total' as any, apiData.reafsCurrentMktgExpTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.3.exceptionalCapValue' as any, apiData.reafsCurrentmktgExcepCapVal || '', { shouldValidate: false })
            
            // Project Management Expense (index 4)
            methods.setValue('breakdown.4.outOfEscrow' as any, apiData.reafsCurProjMgmtExpOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.4.withinEscrow' as any, apiData.reafsCurProjMgmtExpWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.4.total' as any, apiData.reafsCurProjMgmtExpTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.4.exceptionalCapValue' as any, apiData.reafsCurProjExcepCapVal || '', { shouldValidate: false })
            
            // Mortgage (index 5)
            methods.setValue('breakdown.5.outOfEscrow' as any, apiData.currentMortgageOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.5.withinEscrow' as any, apiData.reafsCurrentMortgageWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.5.total' as any, apiData.reafsCurrentMortgageTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.5.exceptionalCapValue' as any, apiData.reafsCurMortgageExceptCapVal || '', { shouldValidate: false })
            
            // VAT Payment (index 6)
            methods.setValue('breakdown.6.outOfEscrow' as any, apiData.reafsCurrentVatPaymentOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.6.withinEscrow' as any, apiData.reafsCurrentVatPaymentWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.6.total' as any, apiData.reafsCurrentVatPaymentTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.6.exceptionalCapValue' as any, apiData.reafsCurVatExceptCapVal || '', { shouldValidate: false })
            
            // Deposit (index 7)
            methods.setValue('breakdown.7.outOfEscrow' as any, apiData.reafsCurrentOqoodOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.7.withinEscrow' as any, apiData.reafsCurrentOqoodWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.7.total' as any, apiData.reafsCurrentOqoodTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.7.exceptionalCapValue' as any, apiData.reafsCurOqoodExceptCapVal || '', { shouldValidate: false })
            
            // Refund (index 8)
            methods.setValue('breakdown.8.outOfEscrow' as any, apiData.reafsCurrentRefundOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.8.withinEscrow' as any, apiData.reafsCurrentRefundWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.8.total' as any, apiData.reafsCurrentRefundTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.8.exceptionalCapValue' as any, apiData.reafsCurRefundExceptCapVal || '', { shouldValidate: false })
            
            // Balance in Retention A/C (index 9)
            methods.setValue('breakdown.9.outOfEscrow' as any, apiData.reafsCurBalInRetenAccOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.9.withinEscrow' as any, apiData.reafsCurBalInRetenAccWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.9.total' as any, apiData.reafsCurBalInRetenAccTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.9.exceptionalCapValue' as any, apiData.reafsCurBalInRetenExceptCapVal || '', { shouldValidate: false })
            
            // Balance in Trust A/C (index 10)
            methods.setValue('breakdown.10.outOfEscrow' as any, apiData.reafsCurBalInTrustAccOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.10.withinEscrow' as any, apiData.reafsCurBalInTrustAccWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.10.total' as any, apiData.reafsCurBalInTrustAccTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.10.exceptionalCapValue' as any, apiData.reafsCurBalInExceptCapVal || '', { shouldValidate: false })
            
            // Balance in Sub Construction A/C (index 11)
            methods.setValue('breakdown.11.outOfEscrow' as any, apiData.reafsCurBalInSubsConsOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.11.withinEscrow' as any, apiData.reafsCurBalInRSubsConsWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.11.total' as any, apiData.reafsCurBalInSubsConsTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.11.exceptionalCapValue' as any, apiData.reafsCurBalInSubsConsCapVal || '', { shouldValidate: false })
            
            // Technical Fees (index 12)
            methods.setValue('breakdown.12.outOfEscrow' as any, apiData.reafsCurTechnFeeOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.12.withinEscrow' as any, apiData.reafsCurTechnFeeWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.12.total' as any, apiData.reafsCurTechnFeeTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.12.exceptionalCapValue' as any, apiData.reafsCurTechFeeExceptCapVal || '', { shouldValidate: false })
            
            // Unidentified Funds (index 13)
            methods.setValue('breakdown.13.outOfEscrow' as any, apiData.reafsCurUnIdeFundOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.13.withinEscrow' as any, apiData.reafsCurUnIdeFundWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.13.total' as any, apiData.reafsCurUnIdeFundTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.13.exceptionalCapValue' as any, apiData.reafsCurUnIdeExceptCapVal || '', { shouldValidate: false })
            
            // Loan/Installments (index 14)
            methods.setValue('breakdown.14.outOfEscrow' as any, apiData.reafsCurLoanInstalOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.14.withinEscrow' as any, apiData.reafsCurLoanInstalWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.14.total' as any, apiData.reafsCurLoanInstalTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.14.exceptionalCapValue' as any, apiData.reafsCurLoanExceptCapVal || '', { shouldValidate: false })
            
            // Infrastructure Cost (index 15)
            methods.setValue('breakdown.15.outOfEscrow' as any, apiData.reafsCurInfraCostOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.15.withinEscrow' as any, apiData.reafsCurInfraCostWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.15.total' as any, apiData.reafsCurInfraCostTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.15.exceptionalCapValue' as any, apiData.reafsCurInfraExceptCapVal || '', { shouldValidate: false })
            
            // Others (index 16)
            methods.setValue('breakdown.16.outOfEscrow' as any, apiData.reafsCurOthersCostOut?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.16.withinEscrow' as any, apiData.reafsCurOthersCostWithin?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.16.total' as any, apiData.reafsCurOthersCostTotal?.toString() || '', { shouldValidate: false })
            methods.setValue('breakdown.16.exceptionalCapValue' as any, apiData.reafsCurOthersExceptCapVal || '', { shouldValidate: false })
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
          const apiData = await realEstateAssetService.getProjectDetails(projectId)
      
          
          if (apiData) {
            
            const processedProjectData = {
              ...apiData,
              reaStartDate: apiData.reaStartDate ? dayjs(apiData.reaStartDate) : null,
              reaCompletionDate: apiData.reaCompletionDate ? dayjs(apiData.reaCompletionDate) : null,
              reaRetentionEffectiveDate: apiData.reaRetentionEffectiveDate ? dayjs(apiData.reaRetentionEffectiveDate) : null,
              reaAccoutStatusDate: apiData.reaAccoutStatusDate ? dayjs(apiData.reaAccoutStatusDate) : null,
              reaRegistrationDate: apiData.reaRegistrationDate ? dayjs(apiData.reaRegistrationDate) : null,
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
          const apiData = await realEstateAssetService.getProjectClosure(projectId)
          
          
          if (apiData) {
            // Handle paginated response structure
            const closureData = apiData?.content?.[0] || apiData
            
            // Store project closure ID for PUT requests
            if (closureData?.id) {
              
              setProjectClosureId(closureData.id)
            }
            
            const processedClosureData = {
              totalIncomeFund: closureData.reacTotalIncomeFund?.toString() || closureData.totalIncomeFund?.toString() || '',
              totalPayment: closureData.reacTotalPayment?.toString() || closureData.totalPayment?.toString() || '',
            }
            
           
            methods.setValue('closureData.totalIncomeFund' as any, processedClosureData.totalIncomeFund, { shouldValidate: false })
            methods.setValue('closureData.totalPayment' as any, processedClosureData.totalPayment, { shouldValidate: false })
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
          const apiData = await realEstateAssetService.getProjectAccounts(projectId)
          
          
          const accountsArray = (apiData as any)?.content || (Array.isArray(apiData) ? apiData : [])
  
          
          if (accountsArray.length > 0) {
            const processedAccounts = accountsArray.map((account: any) => ({
              id: account.id,
              trustAccountNumber: account.accountNumber || account.trustAccountNumber || '',
              ibanNumber: account.ibanNumber || '',
              dateOpened: account.dateOpened ? dayjs(account.dateOpened) : null,
              accountTitle: account.accountTitle || '',
              currency: account.currencyCode || account.currency || '',
              accountType: account.accountType || '',
              isValidated: account.isValidated || false,
              enabled: account.enabled || false
            }))
            
           
            methods.setValue('accounts', processedAccounts)
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
      // If projectId exists, we're in edit mode
      setIsEditingMode(true)
    }
  }, [projectId, isEditingMode])

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        const watchedProjectData = methods.watch()
        
        return <Step1 isViewMode={isViewMode} />
      case 1: 
     
        return (
          <DocumentUploadFactory
            type="BUILD_PARTNER_ASSET"
            entityId={projectId || 'temp_project_id'}
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
        const buildPartnerIdForFees = methods.watch('buildPartnerDTO.id')?.toString()
      
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
        const buildPartnerIdForBeneficiaries = methods.watch('buildPartnerDTO.id')?.toString()
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
        return <Step8 projectData={methods.getValues()} onEditStep={handleEditStep} projectId={projectId || ''} isViewMode={isViewMode} />
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
    reaRelationshipManagerName: formData.reaRelationshipManagerName,
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
    status: formData.status || 'ACTIVE',
  })


  // Simple navigation for view mode
  const handleViewNext = useCallback(() => {
    if (activeStep < steps.length - 1) {
      const nextStep = activeStep + 1
      setActiveStep(nextStep)
      
      if (projectId) {
        const targetUrl = `/projects/${projectId}?step=${nextStep + 1}&view=true`
        router.push(targetUrl)
      }
    } else {
      // If we're on the last step (review step) in view mode, redirect to projects list
      router.push('/entities/projects')
    }
  }, [activeStep, steps.length, projectId, router])

  const handleViewBack = useCallback(() => {
    if (activeStep > 0) {
      const prevStep = activeStep - 1
      setActiveStep(prevStep)
      
      if (projectId) {
        const targetUrl = `/projects/${projectId}?step=${prevStep + 1}&view=true`
        router.push(targetUrl)
      }
    }
  }, [activeStep, projectId, router])

  const handleSaveAndNext = useCallback(async () => {
    // If in view mode, use simple navigation
    if (isViewMode) {
      handleViewNext()
      return
    }

    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      
        
        const currentFormData = methods.getValues()

      // Skip saving for steps that don't need API calls (Documents, Fees, Beneficiaries) - just navigate
      if (SKIP_VALIDATION_STEPS.includes(activeStep as 1 | 3 | 4)) {
        
        const nextStep = activeStep + 1
        setActiveStep(nextStep)
        
        if (projectId) {
          const targetUrl = `/projects/${projectId}?step=${nextStep + 1}`
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
            setErrorMessage('No project data available - check stepStatus')
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
            'Project registration submitted successfully! Workflow request created.'
          )
          router.push('/entities/projects')
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
          const targetUrl = `/projects/${projectId}?step=${nextStep + 1}`
          router.push(targetUrl)
        }
        return
      }

      if (activeStep === 3) {
       
        const nextStep = activeStep + 1
        setActiveStep(nextStep)
        
        if (projectId) {
          const targetUrl = `/projects/${projectId}?step=${nextStep + 1}`
          router.push(targetUrl)
        }
        return
      }

      if (activeStep === 4) {
      
        const nextStep = activeStep + 1
        setActiveStep(nextStep)
        
        if (projectId) {
          const targetUrl = `/projects/${projectId}?step=${nextStep + 1}`
          router.push(targetUrl)
        }
        return
      }
      

      if (SKIP_VALIDATION_STEPS.includes(activeStep as 1 | 3 | 4)) {
        const nextStep = activeStep + 1
        setActiveStep(nextStep)
   
        if (projectId) {
          const targetUrl = `/projects/${projectId}?step=${nextStep + 1}`
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

          const accountsToProcess = accountsToSave.map((account: any) => ({
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
            const errorMessage = `Failed to save ${errors.length} out of ${accountsToProcess.length} accounts. Check console for details.`
            setErrorMessage(errorMessage)
            return
          }

          setSuccessMessage(SUCCESS_MESSAGES.ACCOUNTS_SAVED)

          const nextStep = activeStep + 1
          setActiveStep(nextStep)
          
     
          if (projectId) {
            const targetUrl = `/projects/${projectId}?step=${nextStep + 1}`
            router.push(targetUrl)
          }
          return
        } catch (error) {
          setErrorMessage(ERROR_MESSAGES.ACCOUNT_SAVE_FAILED)
          return
        }
      }

    
      if (activeStep === 5) {
        
        const stepSpecificData = { paymentPlan: currentFormData.paymentPlan }
       
        await stepManager.saveStep(
          5, 
          stepSpecificData,
          projectId,
          isEditingMode 
        )
        
        setSuccessMessage(SUCCESS_MESSAGES.STEP_SAVED)
        
        const nextStep = activeStep + 1
        setActiveStep(nextStep)
        if (projectId) {
          const targetUrl = `/projects/${projectId}?step=${nextStep + 1}`
          router.push(targetUrl)
        }
        return
      }

      if (activeStep === 6) {
        
        const financialData = {
          estimate: (currentFormData as any).estimate || {},
          actual: (currentFormData as any).actual || {},
          breakdown: (currentFormData as any).breakdown || {}
        }
        
        if (isEditingMode && financialSummaryId) {
         
          await saveFinancialSummary.mutateAsync({
            financialData: financialData,
            projectId: financialSummaryId.toString(), 
            isEdit: true,
            realProjectId: projectId 
          } as any)
        } else {
          
          
          await stepManager.saveStep(
            6, 
            financialData,
            projectId, 
            false 
          )
        }
        setSuccessMessage('Financial Summary saved successfully')
        const nextStep = 7 
        setActiveStep(nextStep)
        if (projectId) {
          const targetUrl = `/projects/${projectId}?step=${nextStep + 1}`
          router.push(targetUrl)
        }
        return
      }

     
      if (activeStep === 7) {

        const closureData = currentFormData.closureData
        
        if (isEditingMode && projectClosureId) {
          
          await saveProjectClosure.mutateAsync({
            closureData: closureData,
            projectId: projectClosureId.toString(), 
            isEdit: true,
            realProjectId: projectId 
          } as any)
        } else {
          
          
          await stepManager.saveStep(
            7, 
            closureData,
            projectId,
            false 
          )
        }
        
        setSuccessMessage('Project Closure saved successfully')
        const nextStep = 8 
        setActiveStep(nextStep)
        if (projectId) {
          const targetUrl = `/projects/${projectId}?step=${nextStep + 1}`
          router.push(targetUrl)
        }
        return
      }

     
      const stepSpecificData = transformDetailsData(currentFormData)
    

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

          const targetProjectId = isEditingMode ? projectId : (savedProjectId || projectId)
          
          if (targetProjectId) {
            const targetUrl = `/projects/${targetProjectId}?step=2`
          
            setActiveStep(1)
            router.push(targetUrl)
          } else {
           
            setActiveStep((prev) => prev + 1)
          }
        } else {
          
          const nextStep = activeStep + 1
         
          setActiveStep(nextStep)
          
        
          if (projectId) {
            const targetUrl = `/projects/${projectId}?step=${nextStep + 1}`
          
            router.push(targetUrl)
          }
        }
      } else {
        
       

        try {
          const projectIdFromStatus =
            stepStatus?.stepData?.step1?.id?.toString()
          const step1Data = stepStatus?.stepData?.step1

         

          if (!projectIdFromStatus || !step1Data) {
            setErrorMessage('No project data available - check stepStatus')
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
            'Project registration submitted successfully! Workflow request created.'
          )
          router.push('/entities/projects')
        } catch (error) {
          
          setErrorMessage(
            'Failed to submit workflow request. Please try again.'
          )
        }
        router.push('/entities/projects')
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
    // If in view mode, use simple navigation
    if (isViewMode) {
      handleViewBack()
      return
    }

    if (activeStep > 0) {
      const previousStep = activeStep - 1
      setActiveStep(previousStep)
      
      
      if (projectId) {
        const targetUrl = `/projects/${projectId}?step=${previousStep + 1}`
        router.push(targetUrl)
      }
    }
  }, [activeStep, projectId, router, isViewMode, handleViewBack])

  const handleReset = useCallback(() => {
    setActiveStep(0)
    methods.reset()
    setErrorMessage(null)
    setSuccessMessage(null)
  }, [methods])


  const handleEditStep = useCallback(
    (stepNumber: number) => {
     
      setActiveStep(stepNumber)
      setIsEditingMode(true)
      setShouldResetForm(true)
      setSuccessMessage(`Now editing step ${stepNumber + 1} data`)
    
      if (projectId) {
        const targetUrl = `/projects/${projectId}?step=${stepNumber + 1}`
        router.push(targetUrl)
      }
    },
    [setShouldResetForm, projectId, router, stepStatus]
  )

  const onSubmit = (data: ProjectData) => {
    
    const transformedData = {
      reaId: data.reaId,
      reaCif: data.reaCif,
      reaName: data.reaName,
      reaLocation: data.reaLocation,
      reaReraNumber: data.reaReraNumber,
      reaAccoutStatusDate: data.reaAccoutStatusDate?.toISOString(),
      reaRegistrationDate: data.reaRegistrationDate?.toISOString(),
      reaStartDate: data.reaStartDate?.toISOString(),
      reaCompletionDate: data.reaCompletionDate?.toISOString(),
      reaRetentionPercent: data.reaRetentionPercent,
      reaPercentComplete: data.reaPercentComplete,
      reaConstructionCost: data.reaConstructionCost,
      reaAccStatusDate: data.reaAccStatusDate?.toISOString(),
      reaNoOfUnits: data.reaNoOfUnits,
      reaRemarks: data.reaRemarks,
      reaSpecialApproval: data.reaSpecialApproval,
      reaManagedBy: data.reaManagedBy,
      reaBackupUser: data.reaBackupUser,
      reaAdditionalRetentionPercent: data.reaAdditionalRetentionPercent,
      reaTotalRetentionPercent: data.reaTotalRetentionPercent,
      reaRetentionEffectiveDate: data.reaRetentionEffectiveDate?.toISOString(),
      reaManagementExpenses: data.reaManagementExpenses,
      reaMarketingExpenses: data.reaMarketingExpenses,
      reaTeamLeadName: data.reaTeamLeadName,
      reaRelationshipManagerName: data.reaRelationshipManagerName,
      reaAssestRelshipManagerName: data.reaAssestRelshipManagerName,
      reaRealEstateBrokerExp: data.reaRealEstateBrokerExp,
      reaAdvertisementExp: data.reaAdvertisementExp,
      reaLandOwnerName: data.reaLandOwnerName,
      buildPartnerDTO: {
        id: data.buildPartnerDTO?.id || 501,
      },
      reaStatusDTO: {
        id: data.reaStatusDTO?.id || 53,
      },
      reaTypeDTO: {
        id: data.reaTypeDTO?.id || 51,
      },
      reaAccountStatusDTO: {
        id: data.reaAccountStatusDTO?.id || 55,
      },
      reaConstructionCostCurrencyDTO: {
        id: data.reaConstructionCostCurrencyDTO?.id || 32,
      },
      status: data.status,
      reaBlockPaymentTypeDTO: data.reaBlockPaymentTypeDTO,
      accounts: data.accounts,
      fees: data.fees,
      beneficiaries: data.beneficiaries,
      paymentPlan: data.paymentPlan,
      financialData: data.financialData,
    }


  }

  if (isLoadingStepStatus && projectId) {
    return (
      <Box sx={loadingContainerSx}>
        <Typography>Loading saved data...</Typography>
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
                backgroundColor: '#FFFFFFBF',
                borderRadius: '16px',
                paddingTop: '16px',
                border: '1px solid #FFFFFF',
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
                  <Button onClick={handleReset} sx={primaryButtonSx}>
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
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      onClick={handleSaveAndNext}
                      variant="contained"
                      disabled={
                        !isViewMode && (
                          stepManager.isLoading ||
                          createProjectWorkflowRequest.isPending
                        )
                      }
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
                    
                    
                    {/* <Button onClick={handleReset} sx={primaryButtonSx}>
                      Cancel
                    </Button>
                    <Box>
                      {activeStep !== 0 && (
                        <Button
                          onClick={handleBack}
                          variant="outlined"
                          sx={{ ...backButtonSx, mr: 2 }}
                        >
                          Back
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color="primary"
                        type="submit"
                        onClick={handleSaveAndNext}
                        disabled={stepManager.isLoading}
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 500,
                          fontStyle: 'normal',
                          fontSize: '14px',
                          lineHeight: '20px',
                          letterSpacing: 0,
                          backgroundColor: '#2563EB',
                          color: '#fff',
                        }}
                      >
                        {stepManager.isLoading
                          ? 'Saving...'
                          : activeStep === STEPS.length - 1
                            ? 'Submit'
                            : 'Save and Next'}
                      </Button>
                    </Box> */}
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
