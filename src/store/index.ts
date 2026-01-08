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
  const partyLabels = useAppStore((state) => state.partyLabels)
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
  // Entity labels
  const accountLabels = useAppStore((state) => state.accountLabels)
  const agreementLabels = useAppStore((state) => state.agreementLabels)
  const agreementFeeScheduleLabels = useAppStore((state) => state.agreementFeeScheduleLabels)
  const agreementParameterLabels = useAppStore((state) => state.agreementParameterLabels)
  const agreementSignatoryLabels = useAppStore((state) => state.agreementSignatoryLabels)
  const paymentInstructionLabels = useAppStore((state) => state.paymentInstructionLabels)
  const standingInstructionLabels = useAppStore((state) => state.standingInstructionLabels)
  const standingInstructionBeneficiaryLabels = useAppStore((state) => state.standingInstructionBeneficiaryLabels)
  const allLabelsLoading = useAppStore((state) => state.allLabelsLoading)
  const allLabelsError = useAppStore((state) => state.allLabelsError)

  return useMemo(
    () => ({
      sidebarLabels,
      partyLabels,
      buildPartnerLabels,
      capitalPartnerLabels,
      buildPartnerAssetLabels,
      workflowActionLabels,
      workflowDefinitionLabels,
      workflowStageTemplateLabels,
      workflowAmountRuleLabels,
      workflowAmountStageOverrideLabels,
      workflowRequestedLabels,
      accountLabels,
      agreementLabels,
      agreementFeeScheduleLabels,
      agreementParameterLabels,
      agreementSignatoryLabels,
      paymentInstructionLabels,
      standingInstructionLabels,
      standingInstructionBeneficiaryLabels,
      allLabelsLoading,
      allLabelsError,
    }),
    [sidebarLabels, partyLabels, buildPartnerLabels, capitalPartnerLabels, buildPartnerAssetLabels, workflowActionLabels, workflowDefinitionLabels, workflowStageTemplateLabels, workflowAmountRuleLabels, workflowAmountStageOverrideLabels, workflowRequestedLabels, accountLabels, agreementLabels, agreementFeeScheduleLabels, agreementParameterLabels, agreementSignatoryLabels, paymentInstructionLabels, standingInstructionLabels, standingInstructionBeneficiaryLabels, allLabelsLoading, allLabelsError]
  )
}

export const useLabelsLoadingState = () => {
  const sidebarLabelsLoading = useAppStore((state) => state.sidebarLabelsLoading)
  const partyLabelsLoading = useAppStore((state) => state.partyLabelsLoading)
  const buildPartnerLabelsLoading = useAppStore((state) => state.buildPartnerLabelsLoading)
  const capitalPartnerLabelsLoading = useAppStore((state) => state.capitalPartnerLabelsLoading)
  const buildPartnerAssetLabelsLoading = useAppStore((state) => state.buildPartnerAssetLabelsLoading)
  const workflowActionLabelsLoading = useAppStore((state) => state.workflowActionLabelsLoading)
  const workflowDefinitionLabelsLoading = useAppStore((state) => state.workflowDefinitionLabelsLoading)
  const workflowStageTemplateLabelsLoading = useAppStore((state) => state.workflowStageTemplateLabelsLoading)
  const workflowAmountRuleLabelsLoading = useAppStore((state) => state.workflowAmountRuleLabelsLoading)
  const workflowAmountStageOverrideLabelsLoading = useAppStore((state) => state.workflowAmountStageOverrideLabelsLoading)
  const workflowRequestedLabelsLoading = useAppStore((state) => state.workflowRequestedLabelsLoading)
  // Entity labels loading states
  const accountLabelsLoading = useAppStore((state) => state.accountLabelsLoading)
  const agreementLabelsLoading = useAppStore((state) => state.agreementLabelsLoading)
  const agreementFeeScheduleLabelsLoading = useAppStore((state) => state.agreementFeeScheduleLabelsLoading)
  const agreementParameterLabelsLoading = useAppStore((state) => state.agreementParameterLabelsLoading)
  const agreementSignatoryLabelsLoading = useAppStore((state) => state.agreementSignatoryLabelsLoading)
  const paymentInstructionLabelsLoading = useAppStore((state) => state.paymentInstructionLabelsLoading)
  const standingInstructionLabelsLoading = useAppStore((state) => state.standingInstructionLabelsLoading)
  const standingInstructionBeneficiaryLabelsLoading = useAppStore((state) => state.standingInstructionBeneficiaryLabelsLoading)

  const getLoadingStatus = useAppStore((state) => state.getLoadingStatus)

  return useMemo(
    () => ({
      sidebarLabelsLoading,
      partyLabelsLoading,
      buildPartnerLabelsLoading,
      capitalPartnerLabelsLoading,
      buildPartnerAssetLabelsLoading,
      workflowActionLabelsLoading,
      workflowDefinitionLabelsLoading,
      workflowStageTemplateLabelsLoading,
      workflowAmountRuleLabelsLoading,
      workflowAmountStageOverrideLabelsLoading,
      workflowRequestedLabelsLoading,
      accountLabelsLoading,
      agreementLabelsLoading,
      agreementFeeScheduleLabelsLoading,
      agreementParameterLabelsLoading,
      agreementSignatoryLabelsLoading,
      paymentInstructionLabelsLoading,
      standingInstructionLabelsLoading,
      standingInstructionBeneficiaryLabelsLoading,
      getLoadingStatus,
    }),
    [sidebarLabelsLoading, partyLabelsLoading, buildPartnerLabelsLoading, capitalPartnerLabelsLoading, buildPartnerAssetLabelsLoading, workflowActionLabelsLoading, workflowDefinitionLabelsLoading, workflowStageTemplateLabelsLoading, workflowAmountRuleLabelsLoading, workflowAmountStageOverrideLabelsLoading, workflowRequestedLabelsLoading, accountLabelsLoading, agreementLabelsLoading, agreementFeeScheduleLabelsLoading, agreementParameterLabelsLoading, agreementSignatoryLabelsLoading, paymentInstructionLabelsLoading, standingInstructionLabelsLoading, standingInstructionBeneficiaryLabelsLoading, getLoadingStatus]
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

  // Party actions
  const setPartyLabels = useAppStore((state) => state.setPartyLabels)
  const setPartyLabelsLoading = useAppStore((state) => state.setPartyLabelsLoading)
  const setPartyLabelsError = useAppStore((state) => state.setPartyLabelsError)

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

  // Entity labels actions
  const setAccountLabels = useAppStore((state) => state.setAccountLabels)
  const setAccountLabelsLoading = useAppStore((state) => state.setAccountLabelsLoading)
  const setAccountLabelsError = useAppStore((state) => state.setAccountLabelsError)

  const setAgreementLabels = useAppStore((state) => state.setAgreementLabels)
  const setAgreementLabelsLoading = useAppStore((state) => state.setAgreementLabelsLoading)
  const setAgreementLabelsError = useAppStore((state) => state.setAgreementLabelsError)

  const setAgreementFeeScheduleLabels = useAppStore((state) => state.setAgreementFeeScheduleLabels)
  const setAgreementFeeScheduleLabelsLoading = useAppStore((state) => state.setAgreementFeeScheduleLabelsLoading)
  const setAgreementFeeScheduleLabelsError = useAppStore((state) => state.setAgreementFeeScheduleLabelsError)

  const setAgreementParameterLabels = useAppStore((state) => state.setAgreementParameterLabels)
  const setAgreementParameterLabelsLoading = useAppStore((state) => state.setAgreementParameterLabelsLoading)
  const setAgreementParameterLabelsError = useAppStore((state) => state.setAgreementParameterLabelsError)

  const setAgreementSignatoryLabels = useAppStore((state) => state.setAgreementSignatoryLabels)
  const setAgreementSignatoryLabelsLoading = useAppStore((state) => state.setAgreementSignatoryLabelsLoading)
  const setAgreementSignatoryLabelsError = useAppStore((state) => state.setAgreementSignatoryLabelsError)

  const setPaymentInstructionLabels = useAppStore((state) => state.setPaymentInstructionLabels)
  const setPaymentInstructionLabelsLoading = useAppStore((state) => state.setPaymentInstructionLabelsLoading)
  const setPaymentInstructionLabelsError = useAppStore((state) => state.setPaymentInstructionLabelsError)

  const setStandingInstructionLabels = useAppStore((state) => state.setStandingInstructionLabels)
  const setStandingInstructionLabelsLoading = useAppStore((state) => state.setStandingInstructionLabelsLoading)
  const setStandingInstructionLabelsError = useAppStore((state) => state.setStandingInstructionLabelsError)

  const setStandingInstructionBeneficiaryLabels = useAppStore((state) => state.setStandingInstructionBeneficiaryLabels)
  const setStandingInstructionBeneficiaryLabelsLoading = useAppStore((state) => state.setStandingInstructionBeneficiaryLabelsLoading)
  const setStandingInstructionBeneficiaryLabelsError = useAppStore((state) => state.setStandingInstructionBeneficiaryLabelsError)

  // Global actions
  const setAllLabelsLoading = useAppStore((state) => state.setAllLabelsLoading)
  const setAllLabelsError = useAppStore((state) => state.setAllLabelsError)

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

      // Party
      setPartyLabels,
      setPartyLabelsLoading,
      setPartyLabelsError,

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

      // Entity labels
      setAccountLabels,
      setAccountLabelsLoading,
      setAccountLabelsError,

      setAgreementLabels,
      setAgreementLabelsLoading,
      setAgreementLabelsError,

      setAgreementFeeScheduleLabels,
      setAgreementFeeScheduleLabelsLoading,
      setAgreementFeeScheduleLabelsError,

      setAgreementParameterLabels,
      setAgreementParameterLabelsLoading,
      setAgreementParameterLabelsError,

      setAgreementSignatoryLabels,
      setAgreementSignatoryLabelsLoading,
      setAgreementSignatoryLabelsError,

      setPaymentInstructionLabels,
      setPaymentInstructionLabelsLoading,
      setPaymentInstructionLabelsError,

      setStandingInstructionLabels,
      setStandingInstructionLabelsLoading,
      setStandingInstructionLabelsError,

      setStandingInstructionBeneficiaryLabels,
      setStandingInstructionBeneficiaryLabelsLoading,
      setStandingInstructionBeneficiaryLabelsError,

      // Global
      setAllLabelsLoading,
      setAllLabelsError,

      // Utilities
      clearAllLabels,
      getLabel,
      hasLabels,
      getAvailableLanguages,
    }),

    [
      // Sidebar
      setSidebarLabels, setSidebarLabelsLoading, setSidebarLabelsError,

      // Party
      setPartyLabels, setPartyLabelsLoading, setPartyLabelsError,
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
      // Entity labels
      setAccountLabels, setAccountLabelsLoading, setAccountLabelsError,
      setAgreementLabels, setAgreementLabelsLoading, setAgreementLabelsError,
      setAgreementFeeScheduleLabels, setAgreementFeeScheduleLabelsLoading, setAgreementFeeScheduleLabelsError,
      setAgreementParameterLabels, setAgreementParameterLabelsLoading, setAgreementParameterLabelsError,
      setAgreementSignatoryLabels, setAgreementSignatoryLabelsLoading, setAgreementSignatoryLabelsError,
      setPaymentInstructionLabels, setPaymentInstructionLabelsLoading, setPaymentInstructionLabelsError,
      setStandingInstructionLabels, setStandingInstructionLabelsLoading, setStandingInstructionLabelsError,
      setStandingInstructionBeneficiaryLabels, setStandingInstructionBeneficiaryLabelsLoading, setStandingInstructionBeneficiaryLabelsError,
      // Global & utilities
      setAllLabelsLoading, setAllLabelsError,
      clearAllLabels, getLabel, hasLabels, getAvailableLanguages,
    ]
  )
}
