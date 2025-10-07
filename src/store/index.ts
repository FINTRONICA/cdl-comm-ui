// Zustand store configuration
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useMemo } from 'react'
import { userSlice, type UserSlice } from './slices/userSlice'
import { projectSlice, type ProjectSlice } from './slices/projectSlice'
import {
  transactionSlice,
  type TransactionSlice,
} from './slices/transactionSlice'
import { uiSlice, type UISlice } from './slices/uiSlice'
import { labelsSlice, type LabelsSlice } from './slices/labelsSlice'

// Combined store type
export type AppStore = UserSlice &
  ProjectSlice &
  TransactionSlice &
  UISlice &
  LabelsSlice

// Create the main store
export const useAppStore = create<AppStore>()(
  persist(
    (...a) => {
      const user = userSlice(...a)
      const project = projectSlice(...a)
      const transaction = transactionSlice(...a)
      const ui = uiSlice(...a)
      const labels = labelsSlice(...a)

      return {
        ...user,
        ...project,
        ...transaction,
        ...ui,
        ...labels,
      }
    },
    {
      name: 'escrow-store',
      storage: createJSONStorage(() => {
        // Handle SSR - return null for localStorage on server
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
          }
        }
        return localStorage
      }),
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        language: state.language,
        // 🔥 CRITICAL: Do NOT persist labels for banking compliance
        // Labels are session-only and always fetched fresh on app load
        // labels: state.labels, // ❌ Excluded for banking compliance
      }),
    }
  )
)

// Store selectors for better performance - memoized to prevent infinite loops
export const useUser = () => useAppStore((state) => state.user)
export const useProjects = () => useAppStore((state) => state.projects)
export const useTransactions = () => useAppStore((state) => state.transactions)

export const useUI = () => {
  const theme = useAppStore((state) => state.theme)
  const language = useAppStore((state) => state.language)
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const modalOpen = useAppStore((state) => state.modalOpen)
  const modalType = useAppStore((state) => state.modalType)
  const notifications = useAppStore((state) => state.notifications)

  return useMemo(
    () => ({
      theme,
      language,
      sidebarOpen,
      modalOpen,
      modalType,
      notifications,
    }),
    [theme, language, sidebarOpen, modalOpen, modalType, notifications]
  )
}

// Store actions - memoized to prevent infinite loops
export const useUserActions = () => {
  const setUser = useAppStore((state) => state.setUser)
  const updateUser = useAppStore((state) => state.updateUser)
  const logout = useAppStore((state) => state.logout)

  return useMemo(
    () => ({
      setUser,
      updateUser,
      logout,
    }),
    [setUser, updateUser, logout]
  )
}

export const useProjectActions = () => {
  const setProjects = useAppStore((state) => state.setProjects)
  const addProject = useAppStore((state) => state.addProject)
  const updateProject = useAppStore((state) => state.updateProject)
  const deleteProject = useAppStore((state) => state.deleteProject)

  return useMemo(
    () => ({
      setProjects,
      addProject,
      updateProject,
      deleteProject,
    }),
    [setProjects, addProject, updateProject, deleteProject]
  )
}

export const useTransactionActions = () => {
  const setTransactions = useAppStore((state) => state.setTransactions)
  const addTransaction = useAppStore((state) => state.addTransaction)
  const updateTransaction = useAppStore((state) => state.updateTransaction)
  const deleteTransaction = useAppStore((state) => state.deleteTransaction)

  return useMemo(
    () => ({
      setTransactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
    }),
    [setTransactions, addTransaction, updateTransaction, deleteTransaction]
  )
}

export const useUIActions = () => {
  const setTheme = useAppStore((state) => state.setTheme)
  const setLanguage = useAppStore((state) => state.setLanguage)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const setModalOpen = useAppStore((state) => state.setModalOpen)
  const addNotification = useAppStore((state) => state.addNotification)
  const removeNotification = useAppStore((state) => state.removeNotification)

  return useMemo(
    () => ({
      setTheme,
      setLanguage,
      toggleSidebar,
      setSidebarOpen,
      setModalOpen,
      addNotification,
      removeNotification,
    }),
    [
      setTheme,
      setLanguage,
      toggleSidebar,
      setSidebarOpen,
      setModalOpen,
      addNotification,
      removeNotification,
    ]
  )
}

// 🏦 BANKING COMPLIANCE: Labels selectors - session-only, no persistence
export const useLabels = () => {
  const sidebarLabels = useAppStore((state) => state.sidebarLabels)
  const buildPartnerLabels = useAppStore((state) => state.buildPartnerLabels)
  const capitalPartnerLabels = useAppStore(
    (state) => state.capitalPartnerLabels
  )
  const buildPartnerAssetLabels = useAppStore(
    (state) => state.buildPartnerAssetLabels
  )
  const workflowActionLabels = useAppStore((state) => state.workflowActionLabels)
  const workflowDefinitionLabels = useAppStore((state) => state.workflowDefinitionLabels)
  const workflowStageTemplateLabels = useAppStore((state) => state.workflowStageTemplateLabels)
  const workflowAmountRuleLabels = useAppStore((state) => state.workflowAmountRuleLabels)
  const workflowAmountStageOverrideLabels = useAppStore((state) => state.workflowAmountStageOverrideLabels)
  const workflowRequestedLabels = useAppStore((state) => state.workflowRequestedLabels)
  // Master Customer labels - Customer Master module
  const customerMasterLabels = useAppStore((state) => state.customerMasterLabels)
  // Master Customer labels - Account Purpose module
  const accountPurposeLabels = useAppStore((state) => state.accountPurposeLabels)
  // Master Customer labels - Investment Master module
  const investmentMasterLabels = useAppStore((state) => state.investmentMasterLabels)
  // Master Customer labels - Business Segment module
  const businessSegmentLabels = useAppStore((state) => state.businessSegmentLabels)
  // Master Customer labels - Business Sub Segment module
  const businessSubSegmentLabels = useAppStore((state) => state.businessSubSegmentLabels)
  // Master Customer labels - Deal Type module
  const dealTypeLabels = useAppStore((state) => state.dealTypeLabels)
  // Master Customer labels - Deal Subtype module
  const dealSubtypeLabels = useAppStore((state) => state.dealSubtypeLabels)
  // Master Customer labels - Product Program module
  const productProgramLabels = useAppStore((state) => state.productProgramLabels)
  // Master Customer labels - Beneficiary module
  const beneficiaryLabels = useAppStore((state) => state.beneficiaryLabels)
  // Master Customer labels - Document module
  const documentLabels = useAppStore((state) => state.documentLabels)
  // Master Customer labels - Deal Segment module
  const dealSegmentLabels = useAppStore((state) => state.dealSegmentLabels)
  // Master Customer labels - Ledger Account module
  const ledgerAccountLabels = useAppStore((state) => state.ledgerAccountLabels)
  // Master Customer labels - Country Code module
  const countryCodeLabels = useAppStore((state) => state.countryCodeLabels)
  // Master Customer labels - Currency Code module
  const currencyCodeLabels = useAppStore((state) => state.currencyCodeLabels)
  const allLabelsLoading = useAppStore((state) => state.allLabelsLoading)
  const allLabelsError = useAppStore((state) => state.allLabelsError)
  // Customer field configuration
  const customerFieldConfig = useAppStore((state) => state.customerFieldConfig)

  return useMemo(
    () => ({
      sidebarLabels,
      buildPartnerLabels,
      capitalPartnerLabels,
      buildPartnerAssetLabels,
      workflowActionLabels,
      workflowDefinitionLabels,
      workflowStageTemplateLabels,
      workflowAmountRuleLabels,
      workflowAmountStageOverrideLabels,
      workflowRequestedLabels,
      // Master Customer labels
      customerMasterLabels,
      accountPurposeLabels,
      investmentMasterLabels,
      businessSegmentLabels,
      businessSubSegmentLabels,
      dealTypeLabels,
      dealSubtypeLabels,
      productProgramLabels,
      beneficiaryLabels,
      documentLabels,
      dealSegmentLabels,
      ledgerAccountLabels,
      countryCodeLabels,
      currencyCodeLabels,
      allLabelsLoading,
      allLabelsError,
      // Customer field configuration
      customerFieldConfig,
    }),
    [sidebarLabels, buildPartnerLabels, capitalPartnerLabels, buildPartnerAssetLabels, workflowActionLabels, allLabelsLoading, allLabelsError, workflowDefinitionLabels, workflowStageTemplateLabels, workflowAmountRuleLabels, workflowAmountStageOverrideLabels, workflowRequestedLabels, customerMasterLabels, accountPurposeLabels, investmentMasterLabels, businessSegmentLabels, businessSubSegmentLabels, dealTypeLabels, dealSubtypeLabels, productProgramLabels, beneficiaryLabels, documentLabels, dealSegmentLabels, ledgerAccountLabels, countryCodeLabels, currencyCodeLabels, customerFieldConfig]

  )
}

export const useLabelsLoadingState = () => {
  const sidebarLabelsLoading = useAppStore((state) => state.sidebarLabelsLoading)
  const buildPartnerLabelsLoading = useAppStore((state) => state.buildPartnerLabelsLoading)
  const capitalPartnerLabelsLoading = useAppStore((state) => state.capitalPartnerLabelsLoading)
  const buildPartnerAssetLabelsLoading = useAppStore((state) => state.buildPartnerAssetLabelsLoading)
  const workflowActionLabelsLoading = useAppStore((state) => state.workflowActionLabelsLoading)
  const workflowDefinitionLabelsLoading = useAppStore((state) => state.workflowDefinitionLabelsLoading)
  const workflowStageTemplateLabelsLoading = useAppStore((state) => state.workflowStageTemplateLabelsLoading)
  const workflowAmountRuleLabelsLoading = useAppStore((state) => state.workflowAmountRuleLabelsLoading)
  const workflowAmountStageOverrideLabelsLoading = useAppStore((state) => state.workflowAmountStageOverrideLabelsLoading)
  const workflowRequestedLabelsLoading = useAppStore((state) => state.workflowRequestedLabelsLoading)
  // Master Customer loading states - Customer Master module
  const customerMasterLabelsLoading = useAppStore((state) => state.customerMasterLabelsLoading)
  // Master Customer loading states - Account Purpose module
  const accountPurposeLabelsLoading = useAppStore((state) => state.accountPurposeLabelsLoading)
  // Master Customer loading states - Investment Master module
  const investmentMasterLabelsLoading = useAppStore((state) => state.investmentMasterLabelsLoading)
  // Master Customer loading states - Business Segment module
  const businessSegmentLabelsLoading = useAppStore((state) => state.businessSegmentLabelsLoading)
  // Master Customer loading states - Business Sub Segment module
  const businessSubSegmentLabelsLoading = useAppStore((state) => state.businessSubSegmentLabelsLoading)
  // Master Customer loading states - Deal Type module
  const dealTypeLabelsLoading = useAppStore((state) => state.dealTypeLabelsLoading)
  // Master Customer loading states - Deal Subtype module
  const dealSubtypeLabelsLoading = useAppStore((state) => state.dealSubtypeLabelsLoading)
  // Master Customer loading states - Product Program module
  const productProgramLabelsLoading = useAppStore((state) => state.productProgramLabelsLoading)
  // Master Customer loading states - Beneficiary module
  const beneficiaryLabelsLoading = useAppStore((state) => state.beneficiaryLabelsLoading)
  // Master Customer loading states - Document module
  const documentLabelsLoading = useAppStore((state) => state.documentLabelsLoading)
  // Master Customer loading states - Deal Segment module
  const dealSegmentLabelsLoading = useAppStore((state) => state.dealSegmentLabelsLoading)
  // Master Customer loading states - Ledger Account module
  const ledgerAccountLabelsLoading = useAppStore((state) => state.ledgerAccountLabelsLoading)
  // Master Customer loading states - Country Code module
  const countryCodeLabelsLoading = useAppStore((state) => state.countryCodeLabelsLoading)
  // Master Customer loading states - Currency Code module
  const currencyCodeLabelsLoading = useAppStore((state) => state.currencyCodeLabelsLoading)

  const getLoadingStatus = useAppStore((state) => state.getLoadingStatus)

  return useMemo(
    () => ({
      sidebarLabelsLoading,
      buildPartnerLabelsLoading,
      capitalPartnerLabelsLoading,
      buildPartnerAssetLabelsLoading,
      workflowActionLabelsLoading,
      workflowDefinitionLabelsLoading,
      workflowStageTemplateLabelsLoading,
      workflowAmountRuleLabelsLoading,
      workflowAmountStageOverrideLabelsLoading,
      workflowRequestedLabelsLoading,
      // Master Customer loading states
      customerMasterLabelsLoading,
      accountPurposeLabelsLoading,
      investmentMasterLabelsLoading,
      businessSegmentLabelsLoading,
      businessSubSegmentLabelsLoading,
      dealTypeLabelsLoading,
      dealSubtypeLabelsLoading,
      productProgramLabelsLoading,
      beneficiaryLabelsLoading,
      documentLabelsLoading,
      dealSegmentLabelsLoading,
      ledgerAccountLabelsLoading,
      countryCodeLabelsLoading,
      currencyCodeLabelsLoading,

      getLoadingStatus,
    }),
    [sidebarLabelsLoading, buildPartnerLabelsLoading, capitalPartnerLabelsLoading, buildPartnerAssetLabelsLoading, workflowActionLabelsLoading, workflowDefinitionLabelsLoading, workflowStageTemplateLabelsLoading, workflowAmountRuleLabelsLoading, workflowAmountStageOverrideLabelsLoading, workflowRequestedLabelsLoading, customerMasterLabelsLoading, accountPurposeLabelsLoading, investmentMasterLabelsLoading, businessSegmentLabelsLoading, businessSubSegmentLabelsLoading, dealTypeLabelsLoading, dealSubtypeLabelsLoading, productProgramLabelsLoading, beneficiaryLabelsLoading, documentLabelsLoading, dealSegmentLabelsLoading, ledgerAccountLabelsLoading, countryCodeLabelsLoading, currencyCodeLabelsLoading, getLoadingStatus]

  )
}

export const useLabelsActions = () => {
  // Sidebar actions
  const setSidebarLabels = useAppStore((state) => state.setSidebarLabels)
  const setSidebarLabelsLoading = useAppStore(
    (state) => state.setSidebarLabelsLoading
  )
  const setSidebarLabelsError = useAppStore(
    (state) => state.setSidebarLabelsError
  )

  // Build partner actions
  const setBuildPartnerLabels = useAppStore(
    (state) => state.setBuildPartnerLabels
  )
  const setBuildPartnerLabelsLoading = useAppStore(
    (state) => state.setBuildPartnerLabelsLoading
  )
  const setBuildPartnerLabelsError = useAppStore(
    (state) => state.setBuildPartnerLabelsError
  )

  // Capital partner actions
  const setCapitalPartnerLabels = useAppStore(
    (state) => state.setCapitalPartnerLabels
  )
  const setCapitalPartnerLabelsLoading = useAppStore(
    (state) => state.setCapitalPartnerLabelsLoading
  )
  const setCapitalPartnerLabelsError = useAppStore(
    (state) => state.setCapitalPartnerLabelsError
  )

  // Build partner asset actions
  const setBuildPartnerAssetLabels = useAppStore(
    (state) => state.setBuildPartnerAssetLabels
  )
  const setBuildPartnerAssetLabelsLoading = useAppStore(
    (state) => state.setBuildPartnerAssetLabelsLoading
  )
  const setBuildPartnerAssetLabelsError = useAppStore(
    (state) => state.setBuildPartnerAssetLabelsError
  )

  // Workflow action actions
  const setWorkflowActionLabels = useAppStore((state) => state.setWorkflowActionLabels)
  const setWorkflowActionLabelsLoading = useAppStore((state) => state.setWorkflowActionLabelsLoading)
  const setWorkflowActionLabelsError = useAppStore((state) => state.setWorkflowActionLabelsError)


  //Workflow definition actions
  const setWorkflowDefinitionLabels = useAppStore((state) => state.setWorkflowDefinitionLabels)
  const setWorkflowDefinitionLabelsLoading = useAppStore((state) => state.setWorkflowDefinitionLabelsLoading)
  const setWorkflowDefinitionLabelsError = useAppStore((state) => state.setWorkflowDefinitionLabelsError)


  //Workflow Stage Template actions
  const setWorkflowStageTemplateLabels = useAppStore((state) => state.setWorkflowStageTemplateLabels)
  const setWorkflowStageTemplateLabelsLoading = useAppStore((state) => state.setWorkflowStageTemplateLabelsLoading)
  const setWorkflowStageTemplateLabelsError = useAppStore((state) => state.setWorkflowStageTemplateLabelsError)

  //Workflow Amount Rule actions
  const setWorkflowAmountRuleLabels = useAppStore((state) => state.setWorkflowAmountRuleLabels)
  const setWorkflowAmountRuleLabelsLoading = useAppStore((state) => state.setWorkflowAmountRuleLabelsLoading)
  const setWorkflowAmountRuleLabelsError = useAppStore((state) => state.setWorkflowAmountRuleLabelsError)

  //Workflow Amount Stage Override actions
  const setWorkflowAmountStageOverrideLabels = useAppStore((state) => state.setWorkflowAmountStageOverrideLabels)
  const setWorkflowAmountStageOverrideLabelsLoading = useAppStore((state) => state.setWorkflowAmountStageOverrideLabelsLoading)
  const setWorkflowAmountStageOverrideLabelsError = useAppStore((state) => state.setWorkflowAmountStageOverrideLabelsError)

  //Workflow Requested actions
  const setWorkflowRequestedLabels = useAppStore((state) => state.setWorkflowRequestedLabels)
  const setWorkflowRequestedLabelsLoading = useAppStore((state) => state.setWorkflowRequestedLabelsLoading)
  const setWorkflowRequestedLabelsError = useAppStore((state) => state.setWorkflowRequestedLabelsError)

  // Master Customer actions - Customer Master module
  const setCustomerMasterLabels = useAppStore((state) => state.setCustomerMasterLabels)
  const setCustomerMasterLabelsLoading = useAppStore((state) => state.setCustomerMasterLabelsLoading)
  const setCustomerMasterLabelsError = useAppStore((state) => state.setCustomerMasterLabelsError)

  // Master Customer actions - Account Purpose module
  const setAccountPurposeLabels = useAppStore((state) => state.setAccountPurposeLabels)
  const setAccountPurposeLabelsLoading = useAppStore((state) => state.setAccountPurposeLabelsLoading)
  const setAccountPurposeLabelsError = useAppStore((state) => state.setAccountPurposeLabelsError)

  // Master Customer actions - Investment Master module
  const setInvestmentMasterLabels = useAppStore((state) => state.setInvestmentMasterLabels)
  const setInvestmentMasterLabelsLoading = useAppStore((state) => state.setInvestmentMasterLabelsLoading)
  const setInvestmentMasterLabelsError = useAppStore((state) => state.setInvestmentMasterLabelsError)

  // Master Customer actions - Business Segment module
  const setBusinessSegmentLabels = useAppStore((state) => state.setBusinessSegmentLabels)
  const setBusinessSegmentLabelsLoading = useAppStore((state) => state.setBusinessSegmentLabelsLoading)
  const setBusinessSegmentLabelsError = useAppStore((state) => state.setBusinessSegmentLabelsError)

  // Master Customer actions - Business Sub Segment module
  const setBusinessSubSegmentLabels = useAppStore((state) => state.setBusinessSubSegmentLabels)
  const setBusinessSubSegmentLabelsLoading = useAppStore((state) => state.setBusinessSubSegmentLabelsLoading)
  const setBusinessSubSegmentLabelsError = useAppStore((state) => state.setBusinessSubSegmentLabelsError)

  // Master Customer actions - Deal Type module
  const setDealTypeLabels = useAppStore((state) => state.setDealTypeLabels)
  const setDealTypeLabelsLoading = useAppStore((state) => state.setDealTypeLabelsLoading)
  const setDealTypeLabelsError = useAppStore((state) => state.setDealTypeLabelsError)

  // Master Customer actions - Deal Subtype module
  const setDealSubtypeLabels = useAppStore((state) => state.setDealSubtypeLabels)
  const setDealSubtypeLabelsLoading = useAppStore((state) => state.setDealSubtypeLabelsLoading)
  const setDealSubtypeLabelsError = useAppStore((state) => state.setDealSubtypeLabelsError)

  // Master Customer actions - Product Program module
  const setProductProgramLabels = useAppStore((state) => state.setProductProgramLabels)
  const setProductProgramLabelsLoading = useAppStore((state) => state.setProductProgramLabelsLoading)
  const setProductProgramLabelsError = useAppStore((state) => state.setProductProgramLabelsError)

  // Master Customer actions - Beneficiary module
  const setBeneficiaryLabels = useAppStore((state) => state.setBeneficiaryLabels)
  const setBeneficiaryLabelsLoading = useAppStore((state) => state.setBeneficiaryLabelsLoading)
  const setBeneficiaryLabelsError = useAppStore((state) => state.setBeneficiaryLabelsError)

  // Master Customer actions - Document module
  const setDocumentLabels = useAppStore((state) => state.setDocumentLabels)
  const setDocumentLabelsLoading = useAppStore((state) => state.setDocumentLabelsLoading)
  const setDocumentLabelsError = useAppStore((state) => state.setDocumentLabelsError)

  // Master Customer actions - Deal Segment module
  const setDealSegmentLabels = useAppStore((state) => state.setDealSegmentLabels)
  const setDealSegmentLabelsLoading = useAppStore((state) => state.setDealSegmentLabelsLoading)
  const setDealSegmentLabelsError = useAppStore((state) => state.setDealSegmentLabelsError)

  // Master Customer actions - Ledger Account module
  const setLedgerAccountLabels = useAppStore((state) => state.setLedgerAccountLabels)
  const setLedgerAccountLabelsLoading = useAppStore((state) => state.setLedgerAccountLabelsLoading)
  const setLedgerAccountLabelsError = useAppStore((state) => state.setLedgerAccountLabelsError)

  // Master Customer actions - Country Code module
  const setCountryCodeLabels = useAppStore((state) => state.setCountryCodeLabels)
  const setCountryCodeLabelsLoading = useAppStore((state) => state.setCountryCodeLabelsLoading)
  const setCountryCodeLabelsError = useAppStore((state) => state.setCountryCodeLabelsError)

  // Master Customer actions - Currency Code module
  const setCurrencyCodeLabels = useAppStore((state) => state.setCurrencyCodeLabels)
  const setCurrencyCodeLabelsLoading = useAppStore((state) => state.setCurrencyCodeLabelsLoading)
  const setCurrencyCodeLabelsError = useAppStore((state) => state.setCurrencyCodeLabelsError)

  // Global actions
  const setAllLabelsLoading = useAppStore((state) => state.setAllLabelsLoading)
  const setAllLabelsError = useAppStore((state) => state.setAllLabelsError)

  // Customer field configuration actions
  const setCustomerFieldConfig = useAppStore((state) => state.setCustomerFieldConfig)
  const getCustomerFieldLabel = useAppStore((state) => state.getCustomerFieldLabel)

  // Utility actions
  const clearAllLabels = useAppStore((state) => state.clearAllLabels)
  const getLabel = useAppStore((state) => state.getLabel)
  const hasLabels = useAppStore((state) => state.hasLabels)
  const getAvailableLanguages = useAppStore(
    (state) => state.getAvailableLanguages
  )

  return useMemo(
    () => ({
      // Sidebar
      setSidebarLabels,
      setSidebarLabelsLoading,
      setSidebarLabelsError,

      // Build partner
      setBuildPartnerLabels,
      setBuildPartnerLabelsLoading,
      setBuildPartnerLabelsError,

      // Capital partner
      setCapitalPartnerLabels,
      setCapitalPartnerLabelsLoading,
      setCapitalPartnerLabelsError,

      // Build partner asset
      setBuildPartnerAssetLabels,
      setBuildPartnerAssetLabelsLoading,
      setBuildPartnerAssetLabelsError,


      // Workflow action
      setWorkflowActionLabels,
      setWorkflowActionLabelsLoading,
      setWorkflowActionLabelsError,


      // Workflow definition
      setWorkflowDefinitionLabels,
      setWorkflowDefinitionLabelsLoading,
      setWorkflowDefinitionLabelsError,


      // Workflow Stage Template
      setWorkflowStageTemplateLabels,
      setWorkflowStageTemplateLabelsLoading,
      setWorkflowStageTemplateLabelsError,

      // Workflow Amount Rule
      setWorkflowAmountRuleLabels,
      setWorkflowAmountRuleLabelsLoading,
      setWorkflowAmountRuleLabelsError,

      // Workflow Amount Stage Override
      setWorkflowAmountStageOverrideLabels,
      setWorkflowAmountStageOverrideLabelsLoading,
      setWorkflowAmountStageOverrideLabelsError,

      // Workflow Requested
      setWorkflowRequestedLabels,
      setWorkflowRequestedLabelsLoading,
      setWorkflowRequestedLabelsError,

      // Master Customer - Customer Master module
      setCustomerMasterLabels,
      setCustomerMasterLabelsLoading,
      setCustomerMasterLabelsError,

      // Master Customer - Account Purpose module
      setAccountPurposeLabels,
      setAccountPurposeLabelsLoading,
      setAccountPurposeLabelsError,

      // Master Customer - Investment Master module
      setInvestmentMasterLabels,
      setInvestmentMasterLabelsLoading,
      setInvestmentMasterLabelsError,

      // Master Customer - Business Segment module
      setBusinessSegmentLabels,
      setBusinessSegmentLabelsLoading,
      setBusinessSegmentLabelsError,

      // Master Customer - Business Sub Segment module
      setBusinessSubSegmentLabels,
      setBusinessSubSegmentLabelsLoading,
      setBusinessSubSegmentLabelsError,

      // Master Customer - Deal Type module
      setDealTypeLabels,
      setDealTypeLabelsLoading,
      setDealTypeLabelsError,

      // Master Customer - Deal Subtype module
      setDealSubtypeLabels,
      setDealSubtypeLabelsLoading,
      setDealSubtypeLabelsError,

      // Master Customer - Product Program module
      setProductProgramLabels,
      setProductProgramLabelsLoading,
      setProductProgramLabelsError,

      // Master Customer - Beneficiary module
      setBeneficiaryLabels,
      setBeneficiaryLabelsLoading,
      setBeneficiaryLabelsError,

      // Master Customer - Document module
      setDocumentLabels,
      setDocumentLabelsLoading,
      setDocumentLabelsError,

      // Master Customer - Deal Segment module
      setDealSegmentLabels,
      setDealSegmentLabelsLoading,
      setDealSegmentLabelsError,

      // Master Customer - Ledger Account module
      setLedgerAccountLabels,
      setLedgerAccountLabelsLoading,
      setLedgerAccountLabelsError,

      // Master Customer - Country Code module
      setCountryCodeLabels,
      setCountryCodeLabelsLoading,
      setCountryCodeLabelsError,

      // Master Customer - Currency Code module
      setCurrencyCodeLabels,
      setCurrencyCodeLabelsLoading,
      setCurrencyCodeLabelsError,

      // Global
      setAllLabelsLoading,
      setAllLabelsError,

      // Customer field configuration
      setCustomerFieldConfig,
      getCustomerFieldLabel,

      // Utilities
      clearAllLabels,
      getLabel,
      hasLabels,
      getAvailableLanguages,
    }),

    [
      // Sidebar
      setSidebarLabels, setSidebarLabelsLoading, setSidebarLabelsError,
      // Build partner
      setBuildPartnerLabels, setBuildPartnerLabelsLoading, setBuildPartnerLabelsError,
      // Capital partner
      setCapitalPartnerLabels, setCapitalPartnerLabelsLoading, setCapitalPartnerLabelsError,
      // Build partner asset
      setBuildPartnerAssetLabels, setBuildPartnerAssetLabelsLoading, setBuildPartnerAssetLabelsError,
      // Workflow action   (previously missing)
      setWorkflowActionLabels, setWorkflowActionLabelsLoading, setWorkflowActionLabelsError,
      // Workflow definition
      setWorkflowDefinitionLabels, setWorkflowDefinitionLabelsLoading, setWorkflowDefinitionLabelsError,
      // Workflow Stage Template
      setWorkflowStageTemplateLabels, setWorkflowStageTemplateLabelsLoading, setWorkflowStageTemplateLabelsError,
      // Workflow Amount Rule
      setWorkflowAmountRuleLabels, setWorkflowAmountRuleLabelsLoading, setWorkflowAmountRuleLabelsError,
      // Workflow Amount Stage Override
      setWorkflowAmountStageOverrideLabels, setWorkflowAmountStageOverrideLabelsLoading, setWorkflowAmountStageOverrideLabelsError,
      // Workflow Requested
      setWorkflowRequestedLabels, setWorkflowRequestedLabelsLoading, setWorkflowRequestedLabelsError,
      // Master Customer - Customer Master module
      setCustomerMasterLabels, setCustomerMasterLabelsLoading, setCustomerMasterLabelsError,
      // Master Customer - Account Purpose module
      setAccountPurposeLabels, setAccountPurposeLabelsLoading, setAccountPurposeLabelsError,
      // Master Customer - Investment Master module
      setInvestmentMasterLabels, setInvestmentMasterLabelsLoading, setInvestmentMasterLabelsError,
      // Master Customer - Business Segment module
      setBusinessSegmentLabels, setBusinessSegmentLabelsLoading, setBusinessSegmentLabelsError,
      // Master Customer - Business Sub Segment module
      setBusinessSubSegmentLabels, setBusinessSubSegmentLabelsLoading, setBusinessSubSegmentLabelsError,
      // Master Customer - Deal Type module
      setDealTypeLabels, setDealTypeLabelsLoading, setDealTypeLabelsError,
      // Master Customer - Deal Subtype module
      setDealSubtypeLabels, setDealSubtypeLabelsLoading, setDealSubtypeLabelsError,
      // Master Customer - Product Program module
      setProductProgramLabels, setProductProgramLabelsLoading, setProductProgramLabelsError,
      // Master Customer - Beneficiary module
      setBeneficiaryLabels, setBeneficiaryLabelsLoading, setBeneficiaryLabelsError,
      // Master Customer - Document module
      setDocumentLabels, setDocumentLabelsLoading, setDocumentLabelsError,
      // Master Customer - Deal Segment module
      setDealSegmentLabels, setDealSegmentLabelsLoading, setDealSegmentLabelsError,
      // Master Customer - Ledger Account module
      setLedgerAccountLabels, setLedgerAccountLabelsLoading, setLedgerAccountLabelsError,
      // Master Customer - Country Code module
      setCountryCodeLabels, setCountryCodeLabelsLoading, setCountryCodeLabelsError,
      // Master Customer - Currency Code module
      setCurrencyCodeLabels, setCurrencyCodeLabelsLoading, setCurrencyCodeLabelsError,
      // Global & utilities
      setAllLabelsLoading, setAllLabelsError,
      // Customer field configuration
      setCustomerFieldConfig, getCustomerFieldLabel,
      clearAllLabels, getLabel, hasLabels, getAvailableLanguages,
    ]
  )
}
