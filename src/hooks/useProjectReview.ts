'use client'

import { useState, useEffect } from 'react'
import { realEstateAssetService } from '@/services/api/projectService'

// Data interfaces for project review
export interface ProjectReviewData {
  projectDetails: ProjectDetails | null
  accounts: AccountData[]
  fees: FeeData[]
  beneficiaries: BeneficiaryData[]
  paymentPlans: PaymentPlanData[]
  financialData: FinancialData | null
  closureData: ClosureData[]
  documents: DocumentData[]
}

export interface ProjectDetails {
  id: string
  projectName: string
  projectLocation: string
  projectStatus: string
  projectAccountStatus: string
  projectAccountStatusDate: string
  projectRegistrationDate: string
  projectStartDate: string
  projectStartDateEst: string
  projectCompletionDate: string
  retentionPercent: string
  additionalRetentionPercent: string
  totalRetentionPercent: string
  retentionEffectiveStartDate: string
  projectManagementExpenses: string
  marketingExpenses: string
  realEstateBrokerExpense: string
  advertisingExpense: string
  landOwnerName: string
  projectCompletionPercentage: string
  currency: string
  actualConstructionCost: string
  noOfUnits: string
  remarks: string
  specialApproval: string
  managedBy: string
  backupRef: string
  relationshipManager: string
  assistantRelationshipManager: string
  teamLeaderName: string
  // Developer fields
  developerCif: string
  developerId: string
  developerName: string
  masterDeveloperName: string
  reraNumber: string
  projectType: string
  projectAccountCif: string
  paymentType: string
}

export interface AccountData {
  id: string
  accountNumber: string
  ibanNumber: string
  dateOpened: string
  accountTitle: string
  currency: string
  accountType: string
}

export interface FeeData {
  id: string
  feeType: string
  frequency: string
  debitAmount: string
  feeToBeCollected: string
  nextRecoveryDate: string
  feePercentage: string
  amount: string
  vatPercentage: string
  currency: string
}

export interface BeneficiaryData {
  id: string
  beneficiaryId: string
  beneficiaryType: string
  name: string
  bankName: string
  swiftCode: string
  routingCode: string
  accountNumber: string
}

export interface PaymentPlanData {
  id: string
  installmentNumber: number
  installmentPercentage: string
  projectCompletionPercentage: string
}

export interface FinancialData {
  id: string
  projectEstimatedCost: string
  actualCost: string
  projectBudget: string
  // Add more financial fields as needed
}

export interface ClosureData {
  id: string
  totalIncomeFund: string
  totalPayment: string
  checkGuaranteeDoc: string | null
  enabled: boolean
}

export interface DocumentData {
  id: string
  fileName: string
  documentType: string
  uploadDate: string
  fileSize: number
}

export function useProjectReview(projectId: string) {
  const [projectData, setProjectData] = useState<ProjectReviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllProjectData = async () => {
      if (!projectId) {
        setError('Project ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const [projectDetails, accounts, fees, beneficiaries, paymentPlans, financialData, closureData, documents] =
          await Promise.allSettled([
            realEstateAssetService.getProjectDetails(projectId),
            realEstateAssetService.getProjectAccounts(projectId),
            realEstateAssetService.getProjectFees(projectId),
            realEstateAssetService.getProjectBeneficiaries(projectId),
            realEstateAssetService.getProjectPaymentPlans(projectId),
            realEstateAssetService.getProjectFinancialSummary(projectId),
            realEstateAssetService.getProjectClosure(projectId),
            realEstateAssetService.getProjectDocuments(projectId),
          ])

       

 
        const projectDetailsResult = projectDetails.status === 'fulfilled' ? projectDetails.value : null
        const accountsResult = accounts.status === 'fulfilled' ? accounts.value : []
        const feesResult = fees.status === 'fulfilled' ? fees.value : []
        const beneficiariesResult = beneficiaries.status === 'fulfilled' ? beneficiaries.value : []
        const paymentPlansResult = paymentPlans.status === 'fulfilled' ? paymentPlans.value : []
        const financialDataResult = financialData.status === 'fulfilled' ? financialData.value : null
      
        const extractedFinancialData = financialDataResult?.content?.[0] || null
        const closureDataResult = closureData.status === 'fulfilled' ? closureData.value : null
       
        const extractedClosureData = closureDataResult?.content || []
        const documentsResult = documents.status === 'fulfilled' ? documents.value : []

      

        const mappedProjectDetails: ProjectDetails | null = projectDetailsResult ? {
          id: projectDetailsResult.id?.toString() || '',
          projectName: projectDetailsResult.reaName || '',
          projectLocation: projectDetailsResult.reaLocation || '',
          projectStatus: projectDetailsResult.reaStatusDTO?.languageTranslationId?.configValue || '',
          projectAccountStatus: projectDetailsResult.reaAccountStatusDTO?.languageTranslationId?.configValue || '',
          projectAccountStatusDate: projectDetailsResult.reaAccStatusDate || '',
          projectRegistrationDate: projectDetailsResult.reaRegistrationDate || '',
          projectStartDate: projectDetailsResult.reaStartDate || '',
          projectStartDateEst: projectDetailsResult.reaCompletionDate || '',
          projectCompletionDate: projectDetailsResult.reaCompletionDate || '',
          retentionPercent: projectDetailsResult.reaRetentionPercent || '',
          additionalRetentionPercent: projectDetailsResult.reaAdditionalRetentionPercent || '',
          totalRetentionPercent: projectDetailsResult.reaTotalRetentionPercent || '',
          retentionEffectiveStartDate: projectDetailsResult.reaRetentionEffectiveDate || '',
          projectManagementExpenses: projectDetailsResult.reaManagementExpenses || '',
          marketingExpenses: projectDetailsResult.reaMarketingExpenses || '',
          realEstateBrokerExpense: projectDetailsResult.reaRealEstateBrokerExp?.toString() || '',
          advertisingExpense: projectDetailsResult.reaAdvertisementExp?.toString() || '',
          landOwnerName: projectDetailsResult.reaLandOwnerName || '',
          projectCompletionPercentage: projectDetailsResult.reaPercentComplete || '',
          currency: projectDetailsResult.reaConstructionCostCurrencyDTO?.languageTranslationId?.configValue || '',
          actualConstructionCost: projectDetailsResult.reaConstructionCost?.toString() || '',
          noOfUnits: projectDetailsResult.reaNoOfUnits?.toString() || '',
          remarks: projectDetailsResult.reaRemarks || '',
          specialApproval: projectDetailsResult.reaSpecialApproval || '',
          managedBy: projectDetailsResult.reaManagedBy || '',
          backupRef: projectDetailsResult.reaBackupUser || '',
          relationshipManager: projectDetailsResult.reaRelationshipManagerName || '',
          assistantRelationshipManager: projectDetailsResult.reaAssestRelshipManagerName || '',
          teamLeaderName: projectDetailsResult.reaTeamLeadName || '',
          // Developer fields
          developerCif: projectDetailsResult.buildPartnerDTO?.bpCifrera || '',
          developerId: projectDetailsResult.buildPartnerDTO?.bpDeveloperId || '',
          developerName: projectDetailsResult.buildPartnerDTO?.bpName || '',
          masterDeveloperName: projectDetailsResult.buildPartnerDTO?.bpMasterName || '',
          reraNumber: projectDetailsResult.reaReraNumber || '',
          projectType: projectDetailsResult.reaTypeDTO?.languageTranslationId?.configValue || '',
          projectAccountCif: projectDetailsResult.reaCif || '',
          paymentType: projectDetailsResult.reaBlockPaymentTypeDTO?.languageTranslationId?.configValue || '',
        } : null

        const mappedAccounts: AccountData[] = Array.isArray(accountsResult) ? accountsResult.map((acc: any) => ({
          id: acc.id?.toString() || '',
          accountNumber: acc.accountNumber || '',
          ibanNumber: acc.ibanNumber || '',
          dateOpened: acc.dateOpened || '',
          accountTitle: acc.accountTitle || '',
          currency: acc.currencyCode || '',
          accountType: acc.accountType || '',
        })) : []

        const mappedFees: FeeData[] = Array.isArray(feesResult) ? feesResult.map((fee: any) => ({
          id: fee.id?.toString() || '',
          feeType: fee.reafCategoryDTO?.languageTranslationId?.configValue || fee.reafCategoryDTO?.settingValue || '',
          frequency: fee.reafFrequencyDTO?.languageTranslationId?.configValue || fee.reafFrequencyDTO?.settingValue || '',
          debitAmount: fee.reafDebitAmount?.toString() || '',
          feeToBeCollected: fee.reafCollectionDate || '',
          nextRecoveryDate: fee.reafNextRecoveryDate || '',
          feePercentage: fee.reafFeePercentage?.toString() || '',
          amount: fee.reafTotalAmount?.toString() || '',
          vatPercentage: fee.reafVatPercentage?.toString() || '',
          currency: fee.reafCurrencyDTO?.languageTranslationId?.configValue || fee.reafCurrencyDTO?.settingValue || '',
        })) : []

        const mappedBeneficiaries: BeneficiaryData[] = Array.isArray(beneficiariesResult) ? beneficiariesResult.map((ben: any) => ({
          id: ben.id?.toString() || '',
          beneficiaryId: ben.reabBeneficiaryId || '',
          beneficiaryType: ben.reabType || '',
          name: ben.reabName || '',
          bankName: ben.reabBank || '',
          swiftCode: ben.reabSwift || '',
          routingCode: ben.reabRoutingCode || '',
          accountNumber: ben.reabBeneAccount || '',
        })) : []

        const mappedPaymentPlans: PaymentPlanData[] = Array.isArray(paymentPlansResult) ? paymentPlansResult.map((plan: any) => ({
          id: plan.id?.toString() || '',
          installmentNumber: plan.reappInstallmentNumber || 0,
          installmentPercentage: plan.reappInstallmentPercentage?.toString() || '0',
          projectCompletionPercentage: plan.reappProjectCompletionPercentage?.toString() || '0',
        })) : []

        const mappedDocuments: DocumentData[] = Array.isArray(documentsResult) ? documentsResult.map((doc: any) => ({
          id: doc.id?.toString() || '',
          fileName: doc.documentName || '',
          documentType: doc.documentTypeDTO?.settingValue || '',
          uploadDate: doc.uploadDate || '',
          fileSize: parseInt(doc.documentSize || '0'),
        })) : []

        const mappedClosureData: ClosureData[] = extractedClosureData.map((closure: any) => ({
          id: closure.id?.toString() || '',
          totalIncomeFund: closure.reacTotalIncomeFund?.toString() || '0',
          totalPayment: closure.reacTotalPayment?.toString() || '0',
          checkGuaranteeDoc: closure.reacCheckGuranteeDoc || null,
          enabled: closure.enabled || false,
        }))

        // Set the combined data with mapped values
        setProjectData({
          projectDetails: mappedProjectDetails,
          accounts: mappedAccounts,
          fees: mappedFees,
          beneficiaries: mappedBeneficiaries,
          paymentPlans: mappedPaymentPlans,
          financialData: extractedFinancialData, // Use extracted financial data from content array
          closureData: mappedClosureData,
          documents: mappedDocuments,
        })

      } catch (err) {
        
        setError(err instanceof Error ? err.message : 'Failed to fetch project data')
      } finally {
        setLoading(false)
      }
    }

    fetchAllProjectData()
  }, [projectId])

  // Helper function to fetch individual step data
  const fetchStepData = async (stepNumber: number) => {
    if (!projectId) return null
    
    try {
      switch (stepNumber) {
        case 1: // Project Details
          return await realEstateAssetService.getProjectDetails(projectId)
        case 3: // Accounts
          return await realEstateAssetService.getProjectAccounts(projectId)
        case 4: // Fees
          return await realEstateAssetService.getProjectFees(projectId)
        case 5: // Beneficiaries
          return await realEstateAssetService.getProjectBeneficiaries(projectId)
        case 6: // Payment Plans
          return await realEstateAssetService.getProjectPaymentPlans(projectId)
        case 7: // Financial Data
          return await realEstateAssetService.getProjectFinancialSummary(projectId)
        case 8: // Project Closure
          return await realEstateAssetService.getProjectClosure(projectId)
        default:
          return null
      }
    } catch (error) {
     
      return null
    }
  }

  return {
    projectData,
    loading,
    error,
    refetch: () => {
      setLoading(true)
      setError(null)
      // Trigger re-fetch by updating a dependency
    },
    fetchStepData
  }
}
