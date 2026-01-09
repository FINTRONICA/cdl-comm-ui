import { type StateCreator } from 'zustand'

// Type definitions for labels
export interface LabelData {
  configId: string
  configValue: string
  language: string
  module: string
}

export interface ProcessedLabels {
  [configId: string]: {
    [language: string]: string
  }
}

// Label loading state interface
export interface LabelLoadingState {
  loading: boolean
  error: string | null
  lastFetched: number | null
}

// Main labels state
export interface LabelsState {
  // Sidebar labels
  sidebarLabels: ProcessedLabels | null
  sidebarLabelsLoading: boolean
  sidebarLabelsError: string | null
  sidebarLabelsLastFetched: number | null

  // Party labels
  partyLabels: ProcessedLabels | null
  partyLabelsLoading: boolean
  partyLabelsError: string | null
  partyLabelsLastFetched: number | null

  // Build partner labels
  buildPartnerLabels: ProcessedLabels | null
  buildPartnerLabelsLoading: boolean
  buildPartnerLabelsError: string | null
  buildPartnerLabelsLastFetched: number | null

  // Capital partner labels
  capitalPartnerLabels: ProcessedLabels | null
  capitalPartnerLabelsLoading: boolean
  capitalPartnerLabelsError: string | null
  capitalPartnerLabelsLastFetched: number | null

  // Build partner asset labels
  buildPartnerAssetLabels: ProcessedLabels | null
  buildPartnerAssetLabelsLoading: boolean
  buildPartnerAssetLabelsError: string | null
  buildPartnerAssetLabelsLastFetched: number | null

  // Workflown Action  labels
  workflowActionLabels: ProcessedLabels | null
  workflowActionLabelsLoading: boolean
  workflowActionLabelsError: string | null
  workflowActionLabelsLastFetched: number | null

  // Workflow Definition labels
  workflowDefinitionLabels: ProcessedLabels | null
  workflowDefinitionLabelsLoading: boolean
  workflowDefinitionLabelsError: string | null
  workflowDefinitionLabelsLastFetched: number | null

  // Workflow Stage Template labels
  workflowStageTemplateLabels: ProcessedLabels | null
  workflowStageTemplateLabelsLoading: boolean
  workflowStageTemplateLabelsError: string | null
  workflowStageTemplateLabelsLastFetched: number | null

  // Workflow Amount Rule labels
  workflowAmountRuleLabels: ProcessedLabels | null
  workflowAmountRuleLabelsLoading: boolean
  workflowAmountRuleLabelsError: string | null
  workflowAmountRuleLabelsLastFetched: number | null

  // Workflow Amount Stage Override labels
  workflowAmountStageOverrideLabels: ProcessedLabels | null
  workflowAmountStageOverrideLabelsLoading: boolean
  workflowAmountStageOverrideLabelsError: string | null
  workflowAmountStageOverrideLabelsLastFetched: number | null

  // Workflow Requested labels
  workflowRequestedLabels: ProcessedLabels | null
  workflowRequestedLabelsLoading: boolean
  workflowRequestedLabelsError: string | null
  workflowRequestedLabelsLastFetched: number | null

  // Pending transaction labels
  pendingTransactionLabels: ProcessedLabels | null
  pendingTransactionLabelsLoading: boolean
  pendingTransactionLabelsError: string | null
  pendingTransactionLabelsLastFetched: number | null

  // Discarded transaction labels
  discardedTransactionLabels: ProcessedLabels | null
  discardedTransactionLabelsLoading: boolean
  discardedTransactionLabelsError: string | null
  discardedTransactionLabelsLastFetched: number | null

  // Entity labels (Account, Agreement, etc.)
  accountLabels: ProcessedLabels | null
  accountLabelsLoading: boolean
  accountLabelsError: string | null
  accountLabelsLastFetched: number | null

  agreementLabels: ProcessedLabels | null
  agreementLabelsLoading: boolean
  agreementLabelsError: string | null
  agreementLabelsLastFetched: number | null

  agreementFeeScheduleLabels: ProcessedLabels | null
  agreementFeeScheduleLabelsLoading: boolean
  agreementFeeScheduleLabelsError: string | null
  agreementFeeScheduleLabelsLastFetched: number | null

  agreementParameterLabels: ProcessedLabels | null
  agreementParameterLabelsLoading: boolean
  agreementParameterLabelsError: string | null
  agreementParameterLabelsLastFetched: number | null

  agreementSignatoryLabels: ProcessedLabels | null
  agreementSignatoryLabelsLoading: boolean
  agreementSignatoryLabelsError: string | null
  agreementSignatoryLabelsLastFetched: number | null

  paymentInstructionLabels: ProcessedLabels | null
  paymentInstructionLabelsLoading: boolean
  paymentInstructionLabelsError: string | null
  paymentInstructionLabelsLastFetched: number | null

  standingInstructionLabels: ProcessedLabels | null
  standingInstructionLabelsLoading: boolean
  standingInstructionLabelsError: string | null
  standingInstructionLabelsLastFetched: number | null

  standingInstructionBeneficiaryLabels: ProcessedLabels | null
  standingInstructionBeneficiaryLabelsLoading: boolean
  standingInstructionBeneficiaryLabelsError: string | null
  standingInstructionBeneficiaryLabelsLastFetched: number | null

  // Beneficiary labels
  beneficiaryLabels: ProcessedLabels | null
  beneficiaryLabelsLoading: boolean
  beneficiaryLabelsError: string | null
  beneficiaryLabelsLastFetched: number | null

  // Global loading state for all labels
  allLabelsLoading: boolean
  allLabelsError: string | null
}

// Label actions interface
export interface LabelsActions {
  // Sidebar labels actions
  setSidebarLabels: (labels: ProcessedLabels) => void
  setSidebarLabelsLoading: (loading: boolean) => void
  setSidebarLabelsError: (error: string | null) => void

  // Party labels actions
  setPartyLabels: (labels: ProcessedLabels) => void
  setPartyLabelsLoading: (loading: boolean) => void
  setPartyLabelsError: (error: string | null) => void

  // Build partner labels actions
  setBuildPartnerLabels: (labels: ProcessedLabels) => void
  setBuildPartnerLabelsLoading: (loading: boolean) => void
  setBuildPartnerLabelsError: (error: string | null) => void

  // Capital partner labels actions
  setCapitalPartnerLabels: (labels: ProcessedLabels) => void
  setCapitalPartnerLabelsLoading: (loading: boolean) => void
  setCapitalPartnerLabelsError: (error: string | null) => void

  // Build partner asset labels actions
  setBuildPartnerAssetLabels: (labels: ProcessedLabels) => void
  setBuildPartnerAssetLabelsLoading: (loading: boolean) => void
  setBuildPartnerAssetLabelsError: (error: string | null) => void

  //  Workflow Action  labels actions
  setWorkflowActionLabels: (labels: ProcessedLabels) => void
  setWorkflowActionLabelsLoading: (loading: boolean) => void
  setWorkflowActionLabelsError: (error: string | null) => void

  // Workflow Definition labels actions
  setWorkflowDefinitionLabels: (labels: ProcessedLabels) => void
  setWorkflowDefinitionLabelsLoading: (loading: boolean) => void
  setWorkflowDefinitionLabelsError: (error: string | null) => void

  // Workflow Stage Template labels actions
  setWorkflowStageTemplateLabels: (labels: ProcessedLabels) => void
  setWorkflowStageTemplateLabelsLoading: (loading: boolean) => void
  setWorkflowStageTemplateLabelsError: (error: string | null) => void

  // Workflow Amount Rule labels actions
  setWorkflowAmountRuleLabels: (labels: ProcessedLabels) => void
  setWorkflowAmountRuleLabelsLoading: (loading: boolean) => void
  setWorkflowAmountRuleLabelsError: (error: string | null) => void

  // Workflow Amount Stage Override labels actions
  setWorkflowAmountStageOverrideLabels: (labels: ProcessedLabels) => void
  setWorkflowAmountStageOverrideLabelsLoading: (loading: boolean) => void
  setWorkflowAmountStageOverrideLabelsError: (error: string | null) => void

  // Workflow Requested labels actions
  setWorkflowRequestedLabels: (labels: ProcessedLabels) => void
  setWorkflowRequestedLabelsLoading: (loading: boolean) => void
  setWorkflowRequestedLabelsError: (error: string | null) => void

  // Pending transaction labels actions
  setPendingTransactionLabels: (labels: ProcessedLabels) => void
  setPendingTransactionLabelsLoading: (loading: boolean) => void
  setPendingTransactionLabelsError: (error: string | null) => void

  // Discarded transaction labels actions
  setDiscardedTransactionLabels: (labels: ProcessedLabels) => void
  setDiscardedTransactionLabelsLoading: (loading: boolean) => void
  setDiscardedTransactionLabelsError: (error: string | null) => void

  // Entity labels actions
  setAccountLabels: (labels: ProcessedLabels) => void
  setAccountLabelsLoading: (loading: boolean) => void
  setAccountLabelsError: (error: string | null) => void

  setAgreementLabels: (labels: ProcessedLabels) => void
  setAgreementLabelsLoading: (loading: boolean) => void
  setAgreementLabelsError: (error: string | null) => void

  setAgreementFeeScheduleLabels: (labels: ProcessedLabels) => void
  setAgreementFeeScheduleLabelsLoading: (loading: boolean) => void
  setAgreementFeeScheduleLabelsError: (error: string | null) => void

  setAgreementParameterLabels: (labels: ProcessedLabels) => void
  setAgreementParameterLabelsLoading: (loading: boolean) => void
  setAgreementParameterLabelsError: (error: string | null) => void

  setAgreementSignatoryLabels: (labels: ProcessedLabels) => void
  setAgreementSignatoryLabelsLoading: (loading: boolean) => void
  setAgreementSignatoryLabelsError: (error: string | null) => void

  setPaymentInstructionLabels: (labels: ProcessedLabels) => void
  setPaymentInstructionLabelsLoading: (loading: boolean) => void
  setPaymentInstructionLabelsError: (error: string | null) => void

  setStandingInstructionLabels: (labels: ProcessedLabels) => void
  setStandingInstructionLabelsLoading: (loading: boolean) => void
  setStandingInstructionLabelsError: (error: string | null) => void

  setStandingInstructionBeneficiaryLabels: (labels: ProcessedLabels) => void
  setStandingInstructionBeneficiaryLabelsLoading: (loading: boolean) => void
  setStandingInstructionBeneficiaryLabelsError: (error: string | null) => void

  // Beneficiary labels actions
  setBeneficiaryLabels: (labels: ProcessedLabels) => void
  setBeneficiaryLabelsLoading: (loading: boolean) => void
  setBeneficiaryLabelsError: (error: string | null) => void

  // Global actions
  setAllLabelsLoading: (loading: boolean) => void
  setAllLabelsError: (error: string | null) => void

  // Utility actions
  clearAllLabels: () => void
  getLabel: (
    type:
      | 'sidebar'
      | 'party'
      | 'buildPartner'
      | 'capitalPartner'
      | 'buildPartnerAsset'
      | 'workflowAction'
      | 'workflowDefinition'
      | 'workflowStageTemplate'
      | 'workflowAmountRule'
      | 'workflowAmountStageOverride'
      | 'workflowRequested'
      | 'pendingTransaction'
      | 'discardedTransaction'
      | 'account'
      | 'agreement'
      | 'agreementFeeSchedule'
      | 'agreementParameter'
      | 'agreementSignatory'
      | 'paymentInstruction'
      | 'standingInstruction'
      | 'standingInstructionBeneficiary'
      | 'beneficiary',
    configId: string,
    language: string,
    fallback: string
  ) => string

  // Validation helpers
  hasLabels: (
    type:
      | 'sidebar'
      | 'party'
      | 'buildPartner'
      | 'capitalPartner'
      | 'buildPartnerAsset'
      | 'workflowAction'
      | 'workflowDefinition'
      | 'workflowStageTemplate'
      | 'workflowAmountRule'
      | 'workflowAmountStageOverride'
      | 'workflowRequested'
      | 'pendingTransaction'
      | 'discardedTransaction'
      | 'account'
      | 'agreement'
      | 'agreementFeeSchedule'
      | 'agreementParameter'
      | 'agreementSignatory'
      | 'paymentInstruction'
      | 'standingInstruction'
      | 'standingInstructionBeneficiary'
      | 'beneficiary'
  ) => boolean
  getAvailableLanguages: (
    type:
      | 'sidebar'
      | 'party'
      | 'buildPartner'
      | 'capitalPartner'
      | 'buildPartnerAsset'
      | 'workflowAction'
      | 'workflowDefinition'
      | 'workflowStageTemplate'
      | 'workflowAmountRule'
      | 'workflowAmountStageOverride'
      | 'workflowRequested'
      | 'pendingTransaction'
      | 'discardedTransaction'
      | 'account'
      | 'agreement'
      | 'agreementFeeSchedule'
      | 'agreementParameter'
      | 'agreementSignatory'
      | 'paymentInstruction'
      | 'standingInstruction'
      | 'standingInstructionBeneficiary'
      | 'beneficiary'
  ) => string[]

  // Status helpers
  getLoadingStatus: () => {
    sidebar: boolean
    party: boolean
    buildPartner: boolean
    capitalPartner: boolean
    buildPartnerAsset: boolean
    workflowAction: boolean
    workflowDefinition: boolean
    workflowStageTemplate: boolean
    workflowAmountRule: boolean
    workflowAmountStageOverride: boolean
    workflowRequested: boolean
    pendingTransaction: boolean
    discardedTransaction: boolean
    account: boolean
    agreement: boolean
    agreementFeeSchedule: boolean
    agreementParameter: boolean
    agreementSignatory: boolean
    paymentInstruction: boolean
    standingInstruction: boolean
    standingInstructionBeneficiary: boolean
    any: boolean
    all: boolean
  }
}

// Combined slice type
export type LabelsSlice = LabelsState & LabelsActions

// Labels slice implementation
export const labelsSlice: StateCreator<LabelsSlice> = (set, get) => ({
  // Initial state - all labels start as null (banking compliance: always fresh)
  sidebarLabels: null,
  sidebarLabelsLoading: false,
  sidebarLabelsError: null,
  sidebarLabelsLastFetched: null,

  partyLabels: null,
  partyLabelsLoading: false,
  partyLabelsError: null,
  partyLabelsLastFetched: null,


  buildPartnerLabels: null,
  buildPartnerLabelsLoading: false,
  buildPartnerLabelsError: null,
  buildPartnerLabelsLastFetched: null,

  capitalPartnerLabels: null,
  capitalPartnerLabelsLoading: false,
  capitalPartnerLabelsError: null,
  capitalPartnerLabelsLastFetched: null,

  buildPartnerAssetLabels: null,
  buildPartnerAssetLabelsLoading: false,
  buildPartnerAssetLabelsError: null,
  buildPartnerAssetLabelsLastFetched: null,

  workflowActionLabels: null,
  workflowActionLabelsLoading: false,
  workflowActionLabelsError: null,
  workflowActionLabelsLastFetched: null,

  workflowDefinitionLabels: null,
  workflowDefinitionLabelsLoading: false,
  workflowDefinitionLabelsError: null,
  workflowDefinitionLabelsLastFetched: null,

  workflowStageTemplateLabels: null,
  workflowStageTemplateLabelsLoading: false,
  workflowStageTemplateLabelsError: null,
  workflowStageTemplateLabelsLastFetched: null,

  workflowAmountRuleLabels: null,
  workflowAmountRuleLabelsLoading: false,
  workflowAmountRuleLabelsError: null,
  workflowAmountRuleLabelsLastFetched: null,

  workflowAmountStageOverrideLabels: null,
  workflowAmountStageOverrideLabelsLoading: false,
  workflowAmountStageOverrideLabelsError: null,
  workflowAmountStageOverrideLabelsLastFetched: null,

  workflowRequestedLabels: null,
  workflowRequestedLabelsLoading: false,
  workflowRequestedLabelsError: null,
  workflowRequestedLabelsLastFetched: null,

  pendingTransactionLabels: null,
  pendingTransactionLabelsLoading: false,
  pendingTransactionLabelsError: null,
  pendingTransactionLabelsLastFetched: null,

  discardedTransactionLabels: null,
  discardedTransactionLabelsLoading: false,
  discardedTransactionLabelsError: null,
  discardedTransactionLabelsLastFetched: null,

  // Entity labels initial state
  accountLabels: null,
  accountLabelsLoading: false,
  accountLabelsError: null,
  accountLabelsLastFetched: null,

  agreementLabels: null,
  agreementLabelsLoading: false,
  agreementLabelsError: null,
  agreementLabelsLastFetched: null,

  agreementFeeScheduleLabels: null,
  agreementFeeScheduleLabelsLoading: false,
  agreementFeeScheduleLabelsError: null,
  agreementFeeScheduleLabelsLastFetched: null,

  agreementParameterLabels: null,
  agreementParameterLabelsLoading: false,
  agreementParameterLabelsError: null,
  agreementParameterLabelsLastFetched: null,

  agreementSignatoryLabels: null,
  agreementSignatoryLabelsLoading: false,
  agreementSignatoryLabelsError: null,
  agreementSignatoryLabelsLastFetched: null,

  paymentInstructionLabels: null,
  paymentInstructionLabelsLoading: false,
  paymentInstructionLabelsError: null,
  paymentInstructionLabelsLastFetched: null,

  standingInstructionLabels: null,
  standingInstructionLabelsLoading: false,
  standingInstructionLabelsError: null,
  standingInstructionLabelsLastFetched: null,

  standingInstructionBeneficiaryLabels: null,
  standingInstructionBeneficiaryLabelsLoading: false,
  standingInstructionBeneficiaryLabelsError: null,
  standingInstructionBeneficiaryLabelsLastFetched: null,

  beneficiaryLabels: null,
  beneficiaryLabelsLoading: false,
  beneficiaryLabelsError: null,
  beneficiaryLabelsLastFetched: null,

  allLabelsLoading: false,
  allLabelsError: null,

  // Sidebar labels actions
  setSidebarLabels: (labels) => {
    set({
      sidebarLabels: labels,
      sidebarLabelsLastFetched: Date.now(),
      sidebarLabelsError: null,
    })
  },

  setSidebarLabelsLoading: (loading) => set({ sidebarLabelsLoading: loading }),

  setSidebarLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Sidebar labels error:', error)
    }
    set({ sidebarLabelsError: error })
  },

  // Build partner labels actions
  setBuildPartnerLabels: (labels) => {
    set({
      buildPartnerLabels: labels,
      buildPartnerLabelsLastFetched: Date.now(),
      buildPartnerLabelsError: null,
    })
  },

  // Party labels actions
  setPartyLabels: (labels) => {
    set({
      partyLabels: labels,
      partyLabelsLastFetched: Date.now(),
      partyLabelsError: null,
    })
  },

  setPartyLabelsLoading: (loading) => set({ partyLabelsLoading: loading }),

  setPartyLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Party labels error:', error)
    }
    set({ partyLabelsError: error })
  },

  setBuildPartnerLabelsLoading: (loading) =>
    set({ buildPartnerLabelsLoading: loading }),

  setBuildPartnerLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Build partner labels error:', error)
    }
    set({ buildPartnerLabelsError: error })
  },

  // Capital partner labels actions
  setCapitalPartnerLabels: (labels) => {
    set({
      capitalPartnerLabels: labels,
      capitalPartnerLabelsLastFetched: Date.now(),
      capitalPartnerLabelsError: null,
    })
  },

  setCapitalPartnerLabelsLoading: (loading) =>
    set({ capitalPartnerLabelsLoading: loading }),

  setCapitalPartnerLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Capital partner labels error:', error)
    }
    set({ capitalPartnerLabelsError: error })
  },

  // Build partner asset labels actions
  setBuildPartnerAssetLabels: (labels) => {

    set({
      buildPartnerAssetLabels: labels,
      buildPartnerAssetLabelsLastFetched: Date.now(),
      buildPartnerAssetLabelsError: null,
    })
  },

  setBuildPartnerAssetLabelsLoading: (loading) =>
    set({ buildPartnerAssetLabelsLoading: loading }),

  setBuildPartnerAssetLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Build partner asset labels error:', error)
    }
    set({ buildPartnerAssetLabelsError: error })
  },
  //Workflow action labels actions
  setWorkflowActionLabels: (labels) => {
    set({
      workflowActionLabels: labels,
      workflowActionLabelsLastFetched: Date.now(),
      workflowActionLabelsError: null,
    })
  },
  setWorkflowActionLabelsLoading: (loading) =>
    set({ workflowActionLabelsLoading: loading }),
  setWorkflowActionLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] workflow action labels error:', error)
    }
    set({ workflowActionLabelsError: error })
  },

  //  Workflow definition labels actions
  setWorkflowDefinitionLabels: (labels) => {
    set({
      workflowDefinitionLabels: labels,
      workflowDefinitionLabelsLastFetched: Date.now(),
      workflowDefinitionLabelsError: null,
    })
  },
  setWorkflowDefinitionLabelsLoading: (loading) =>
    set({ workflowDefinitionLabelsLoading: loading }),
  setWorkflowDefinitionLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] workflow definition labels error:', error)
    }
    set({ workflowDefinitionLabelsError: error })
  },

  // Workflow Stage Template labels actions
  setWorkflowStageTemplateLabels: (labels) => {
    set({
      workflowStageTemplateLabels: labels,
      workflowStageTemplateLabelsLastFetched: Date.now(),
      workflowStageTemplateLabelsError: null,
    })
  },
  setWorkflowStageTemplateLabelsLoading: (loading) =>
    set({ workflowStageTemplateLabelsLoading: loading }),
  setWorkflowStageTemplateLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] workflow-stage-template labels error:', error)
    }
    set({ workflowStageTemplateLabelsError: error })
  },

  // Workflow Amount Rule labels actions
  setWorkflowAmountRuleLabels: (labels) => {
    set({
      workflowAmountRuleLabels: labels,
      workflowAmountRuleLabelsLastFetched: Date.now(),
      workflowAmountRuleLabelsError: null,
    })
  },
  setWorkflowAmountRuleLabelsLoading: (loading) =>
    set({ workflowAmountRuleLabelsLoading: loading }),
  setWorkflowAmountRuleLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] workflow-amount-rule labels error:', error)
    }
    set({ workflowAmountRuleLabelsError: error })
  },

  // Workflow Amount Stage Override labels actions
  setWorkflowAmountStageOverrideLabels: (labels) => {
    set({
      workflowAmountStageOverrideLabels: labels,
      workflowAmountStageOverrideLabelsLastFetched: Date.now(),
      workflowAmountStageOverrideLabelsError: null,
    })
  },
  setWorkflowAmountStageOverrideLabelsLoading: (loading) =>
    set({ workflowAmountStageOverrideLabelsLoading: loading }),
  setWorkflowAmountStageOverrideLabelsError: (error) => {
    if (error) {
      console.error(
        '❌ [COMPLIANCE] workflow-amount-stage-override labels error:',
        error
      )
    }
    set({ workflowAmountStageOverrideLabelsError: error })
  },

  // Workflow Requested labels actions
  setWorkflowRequestedLabels: (labels) => {
    set({
      workflowRequestedLabels: labels,
      workflowRequestedLabelsLastFetched: Date.now(),
      workflowRequestedLabelsError: null,
    })
  },
  setWorkflowRequestedLabelsLoading: (loading) =>
    set({ workflowRequestedLabelsLoading: loading }),
  setWorkflowRequestedLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] workflow-requested labels error:', error)
    }
    set({ workflowRequestedLabelsError: error })
  },

  // Pending transaction labels actions
  setPendingTransactionLabels: (labels) => {
    set({
      pendingTransactionLabels: labels,
      pendingTransactionLabelsLastFetched: Date.now(),
      pendingTransactionLabelsError: null,
    })
  },

  setPendingTransactionLabelsLoading: (loading) =>
    set({ pendingTransactionLabelsLoading: loading }),

  setPendingTransactionLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Pending transaction labels error:', error)
    }
    set({ pendingTransactionLabelsError: error })
  },

  // Discarded transaction labels actions
  setDiscardedTransactionLabels: (labels) => {
    set({
      discardedTransactionLabels: labels,
      discardedTransactionLabelsLastFetched: Date.now(),
      discardedTransactionLabelsError: null,
    })
  },

  setDiscardedTransactionLabelsLoading: (loading) =>
    set({ discardedTransactionLabelsLoading: loading }),

  setDiscardedTransactionLabelsError: (error) => {
    if (error) {
      console.error(
        '❌ [COMPLIANCE] Discarded transaction labels error:',
        error
      )
    }
    set({ discardedTransactionLabelsError: error })
  },

  // Entity labels actions
  setAccountLabels: (labels) => {
    set({
      accountLabels: labels,
      accountLabelsLastFetched: Date.now(),
      accountLabelsError: null,
    })
  },
  setAccountLabelsLoading: (loading) => set({ accountLabelsLoading: loading }),
  setAccountLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Account labels error:', error)
    }
    set({ accountLabelsError: error })
  },

  setAgreementLabels: (labels) => {
    set({
      agreementLabels: labels,
      agreementLabelsLastFetched: Date.now(),
      agreementLabelsError: null,
    })
  },
  setAgreementLabelsLoading: (loading) => set({ agreementLabelsLoading: loading }),
  setAgreementLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Agreement labels error:', error)
    }
    set({ agreementLabelsError: error })
  },

  setAgreementFeeScheduleLabels: (labels) => {
    set({
      agreementFeeScheduleLabels: labels,
      agreementFeeScheduleLabelsLastFetched: Date.now(),
      agreementFeeScheduleLabelsError: null,
    })
  },
  setAgreementFeeScheduleLabelsLoading: (loading) => set({ agreementFeeScheduleLabelsLoading: loading }),
  setAgreementFeeScheduleLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Agreement fee schedule labels error:', error)
    }
    set({ agreementFeeScheduleLabelsError: error })
  },

  setAgreementParameterLabels: (labels) => {
    set({
      agreementParameterLabels: labels,
      agreementParameterLabelsLastFetched: Date.now(),
      agreementParameterLabelsError: null,
    })
  },
  setAgreementParameterLabelsLoading: (loading) => set({ agreementParameterLabelsLoading: loading }),
  setAgreementParameterLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Agreement parameter labels error:', error)
    }
    set({ agreementParameterLabelsError: error })
  },

  setAgreementSignatoryLabels: (labels) => {
    set({
      agreementSignatoryLabels: labels,
      agreementSignatoryLabelsLastFetched: Date.now(),
      agreementSignatoryLabelsError: null,
    })
  },
  setAgreementSignatoryLabelsLoading: (loading) => set({ agreementSignatoryLabelsLoading: loading }),
  setAgreementSignatoryLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Agreement signatory labels error:', error)
    }
    set({ agreementSignatoryLabelsError: error })
  },

  setPaymentInstructionLabels: (labels) => {
    set({
      paymentInstructionLabels: labels,
      paymentInstructionLabelsLastFetched: Date.now(),
      paymentInstructionLabelsError: null,
    })
  },
  setPaymentInstructionLabelsLoading: (loading) => set({ paymentInstructionLabelsLoading: loading }),
  setPaymentInstructionLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Payment instruction labels error:', error)
    }
    set({ paymentInstructionLabelsError: error })
  },

  setStandingInstructionLabels: (labels) => {
    set({
      standingInstructionLabels: labels,
      standingInstructionLabelsLastFetched: Date.now(),
      standingInstructionLabelsError: null,
    })
  },
  setStandingInstructionLabelsLoading: (loading) => set({ standingInstructionLabelsLoading: loading }),
  setStandingInstructionLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Standing instruction labels error:', error)
    }
    set({ standingInstructionLabelsError: error })
  },

  setStandingInstructionBeneficiaryLabels: (labels) => {
    set({
      standingInstructionBeneficiaryLabels: labels,
      standingInstructionBeneficiaryLabelsLastFetched: Date.now(),
      standingInstructionBeneficiaryLabelsError: null,
    })
  },
  setStandingInstructionBeneficiaryLabelsLoading: (loading) => set({ standingInstructionBeneficiaryLabelsLoading: loading }),
  setStandingInstructionBeneficiaryLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Standing instruction beneficiary labels error:', error)
    }
    set({ standingInstructionBeneficiaryLabelsError: error })
  },

  // Beneficiary labels actions
  setBeneficiaryLabels: (labels) => {
    set({
      beneficiaryLabels: labels,
      beneficiaryLabelsLastFetched: Date.now(),
      beneficiaryLabelsError: null,
    })
  },
  setBeneficiaryLabelsLoading: (loading) => set({ beneficiaryLabelsLoading: loading }),
  setBeneficiaryLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Beneficiary labels error:', error)
    }
    set({ beneficiaryLabelsError: error })
  },

  // Global actions
  setAllLabelsLoading: (loading) => set({ allLabelsLoading: loading }),

  setAllLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] All labels error:', error)
    }
    set({ allLabelsError: error })
  },

  // Utility actions
  clearAllLabels: () => {
    set({
      sidebarLabels: null,
      partyLabels: null,
      buildPartnerLabels: null,
      capitalPartnerLabels: null,
      buildPartnerAssetLabels: null,
      pendingTransactionLabels: null,
      discardedTransactionLabels: null,
      sidebarLabelsLastFetched: null,
      partyLabelsLastFetched: null,
      workflowActionLabels: null,
      workflowDefinitionLabels: null,
      workflowStageTemplateLabels: null,
      workflowAmountRuleLabels: null,
      workflowAmountStageOverrideLabels: null,
      workflowRequestedLabels: null,
      buildPartnerLabelsLastFetched: null,
      capitalPartnerLabelsLastFetched: null,
      buildPartnerAssetLabelsLastFetched: null,
      workflowActionLabelsLastFetched: null,
      workflowDefinitionLabelsLastFetched: null,
      workflowStageTemplateLabelsLastFetched: null,
      workflowAmountRuleLabelsLastFetched: null,
      workflowAmountStageOverrideLabelsLastFetched: null,
      workflowRequestedLabelsLastFetched: null,
      pendingTransactionLabelsLastFetched: null,
      discardedTransactionLabelsLastFetched: null,
      sidebarLabelsError: null,
      partyLabelsError: null,
      buildPartnerLabelsError: null,
      capitalPartnerLabelsError: null,
      buildPartnerAssetLabelsError: null,
      workflowActionLabelsError: null,
      workflowDefinitionLabelsError: null,
      workflowStageTemplateLabelsError: null,
      workflowAmountRuleLabelsError: null,
      workflowAmountStageOverrideLabelsError: null,
      workflowRequestedLabelsError: null,
      pendingTransactionLabelsError: null,
      discardedTransactionLabelsError: null,
      // Entity labels
      accountLabels: null,
      accountLabelsLastFetched: null,
      accountLabelsError: null,
      agreementLabels: null,
      agreementLabelsLastFetched: null,
      agreementLabelsError: null,
      agreementFeeScheduleLabels: null,
      agreementFeeScheduleLabelsLastFetched: null,
      agreementFeeScheduleLabelsError: null,
      agreementParameterLabels: null,
      agreementParameterLabelsLastFetched: null,
      agreementParameterLabelsError: null,
      agreementSignatoryLabels: null,
      agreementSignatoryLabelsLastFetched: null,
      agreementSignatoryLabelsError: null,
      paymentInstructionLabels: null,
      paymentInstructionLabelsLastFetched: null,
      paymentInstructionLabelsError: null,
      standingInstructionLabels: null,
      standingInstructionLabelsLastFetched: null,
      standingInstructionLabelsError: null,
      standingInstructionBeneficiaryLabels: null,
      standingInstructionBeneficiaryLabelsLastFetched: null,
      standingInstructionBeneficiaryLabelsError: null,
      beneficiaryLabels: null,
      beneficiaryLabelsLastFetched: null,
      beneficiaryLabelsError: null,
      allLabelsError: null,
    })
  },

  getLabel: (type, configId, language, fallback) => {
    const state = get()
    let labels: ProcessedLabels | null = null

    switch (type) {
      // Core labels
      case 'sidebar':
        labels = state.sidebarLabels
        break
      case 'party':
        labels = state.partyLabels
        break
      case 'buildPartner':
        labels = state.buildPartnerLabels
        break
      case 'capitalPartner':
        labels = state.capitalPartnerLabels
        break
      case 'buildPartnerAsset':
        labels = state.buildPartnerAssetLabels
        break
      
      // Workflow labels
      case 'workflowAction':
        labels = state.workflowActionLabels
        break
      case 'workflowDefinition':
        labels = state.workflowDefinitionLabels
        break
      case 'workflowStageTemplate':
        labels = state.workflowStageTemplateLabels
        break
      case 'workflowAmountRule':
        labels = state.workflowAmountRuleLabels
        break
      case 'workflowAmountStageOverride':
        labels = state.workflowAmountStageOverrideLabels
        break
      case 'workflowRequested':
        labels = state.workflowRequestedLabels
        break
      
      // Transaction labels
      case 'pendingTransaction':
        labels = state.pendingTransactionLabels
        break
      case 'discardedTransaction':
        labels = state.discardedTransactionLabels
        break
      
      // Entity labels
      case 'account':
        labels = state.accountLabels
        break
      case 'agreement':
        labels = state.agreementLabels
        break
      case 'agreementFeeSchedule':
        labels = state.agreementFeeScheduleLabels
        break
      case 'agreementParameter':
        labels = state.agreementParameterLabels
        break
      case 'agreementSignatory':
        labels = state.agreementSignatoryLabels
        break
      case 'paymentInstruction':
        labels = state.paymentInstructionLabels
        break
      case 'standingInstruction':
        labels = state.standingInstructionLabels
        break
      case 'standingInstructionBeneficiary':
        labels = state.standingInstructionBeneficiaryLabels
        break
      case 'beneficiary':
        labels = state.beneficiaryLabels
        break
      
      default:
        console.warn('⚠️ [COMPLIANCE] Unknown label type:', type)
        return fallback
    }

    if (!labels || !labels[configId]) {
      return fallback
    }

    // Try requested language first, then fallback to English, then fallback text
    const labelValue =
      labels[configId]?.[language] || labels[configId]?.['EN'] || fallback
    return labelValue
  },

  // Validation helpers
  hasLabels: (type) => {
    const state = get()
    switch (type) {
      // Core labels
      case 'sidebar':
        return !!(
          state.sidebarLabels && Object.keys(state.sidebarLabels).length > 0
        )
      case 'party':
        return !!(
          state.partyLabels && Object.keys(state.partyLabels).length > 0
        )
      case 'buildPartner':
        return !!(
          state.buildPartnerLabels &&
          Object.keys(state.buildPartnerLabels).length > 0
        )
      case 'capitalPartner':
        return !!(
          state.capitalPartnerLabels &&
          Object.keys(state.capitalPartnerLabels).length > 0
        )
      case 'buildPartnerAsset':
        return !!(
          state.buildPartnerAssetLabels &&
          Object.keys(state.buildPartnerAssetLabels).length > 0
        )
      
      // Workflow labels
      case 'workflowAction':
        return !!(
          state.workflowActionLabels &&
          Object.keys(state.workflowActionLabels).length > 0
        )
      case 'workflowDefinition':
        return !!(
          state.workflowDefinitionLabels &&
          Object.keys(state.workflowDefinitionLabels).length > 0
        )
      case 'workflowStageTemplate':
        return !!(
          state.workflowStageTemplateLabels &&
          Object.keys(state.workflowStageTemplateLabels).length > 0
        )
      case 'workflowAmountRule':
        return !!(
          state.workflowAmountRuleLabels &&
          Object.keys(state.workflowAmountRuleLabels).length > 0
        )
      case 'workflowAmountStageOverride':
        return !!(
          state.workflowAmountStageOverrideLabels &&
          Object.keys(state.workflowAmountStageOverrideLabels).length > 0
        )
      case 'workflowRequested':
        return !!(
          state.workflowRequestedLabels &&
          Object.keys(state.workflowRequestedLabels).length > 0
        )
      
      // Transaction labels
      case 'pendingTransaction':
        return !!(
          state.pendingTransactionLabels &&
          Object.keys(state.pendingTransactionLabels).length > 0
        )
      case 'discardedTransaction':
        return !!(
          state.discardedTransactionLabels &&
          Object.keys(state.discardedTransactionLabels).length > 0
        )
      
      // Entity labels
      case 'account':
        return !!(
          state.accountLabels &&
          Object.keys(state.accountLabels).length > 0
        )
      case 'agreement':
        return !!(
          state.agreementLabels &&
          Object.keys(state.agreementLabels).length > 0
        )
      case 'agreementFeeSchedule':
        return !!(
          state.agreementFeeScheduleLabels &&
          Object.keys(state.agreementFeeScheduleLabels).length > 0
        )
      case 'agreementParameter':
        return !!(
          state.agreementParameterLabels &&
          Object.keys(state.agreementParameterLabels).length > 0
        )
      case 'agreementSignatory':
        return !!(
          state.agreementSignatoryLabels &&
          Object.keys(state.agreementSignatoryLabels).length > 0
        )
      case 'paymentInstruction':
        return !!(
          state.paymentInstructionLabels &&
          Object.keys(state.paymentInstructionLabels).length > 0
        )
      case 'standingInstruction':
        return !!(
          state.standingInstructionLabels &&
          Object.keys(state.standingInstructionLabels).length > 0
        )
      case 'standingInstructionBeneficiary':
        return !!(
          state.standingInstructionBeneficiaryLabels &&
          Object.keys(state.standingInstructionBeneficiaryLabels).length > 0
        )
      case 'beneficiary':
        return !!(
          state.beneficiaryLabels &&
          Object.keys(state.beneficiaryLabels).length > 0
        )
      
      default:
        return false
    }
  },

  getAvailableLanguages: (type) => {
    const state = get()
    let labels: ProcessedLabels | null = null

    switch (type) {
      // Core labels
      case 'sidebar':
        labels = state.sidebarLabels
        break
      case 'party':
        labels = state.partyLabels
        break
      case 'buildPartner':
        labels = state.buildPartnerLabels
        break
      case 'capitalPartner':
        labels = state.capitalPartnerLabels
        break
      case 'buildPartnerAsset':
        labels = state.buildPartnerAssetLabels
        break
      
      // Workflow labels
      case 'workflowAction':
        labels = state.workflowActionLabels
        break
      case 'workflowDefinition':
        labels = state.workflowDefinitionLabels
        break
      case 'workflowStageTemplate':
        labels = state.workflowStageTemplateLabels
        break
      case 'workflowAmountRule':
        labels = state.workflowAmountRuleLabels
        break
      case 'workflowAmountStageOverride':
        labels = state.workflowAmountStageOverrideLabels
        break
      case 'workflowRequested':
        labels = state.workflowRequestedLabels
        break
      
      // Transaction labels
      case 'pendingTransaction':
        labels = state.pendingTransactionLabels
        break
      case 'discardedTransaction':
        labels = state.discardedTransactionLabels
        break
      
      // Entity labels
      case 'account':
        labels = state.accountLabels
        break
      case 'agreement':
        labels = state.agreementLabels
        break
      case 'agreementFeeSchedule':
        labels = state.agreementFeeScheduleLabels
        break
      case 'agreementParameter':
        labels = state.agreementParameterLabels
        break
      case 'agreementSignatory':
        labels = state.agreementSignatoryLabels
        break
      case 'paymentInstruction':
        labels = state.paymentInstructionLabels
        break
      case 'standingInstruction':
        labels = state.standingInstructionLabels
        break
      case 'standingInstructionBeneficiary':
        labels = state.standingInstructionBeneficiaryLabels
        break
      case 'beneficiary':
        labels = state.beneficiaryLabels
        break
      
      default:
        return ['EN']
    }

    if (!labels) {
      return ['EN']
    }

    const languages = new Set<string>()
    Object.values(labels).forEach((languageLabels) => {
      Object.keys(languageLabels).forEach((language) => {
        languages.add(language)
      })
    })

    return Array.from(languages)
  },

  // Status helpers
  getLoadingStatus: () => {
    const state = get()
    
    // Core label loading states
    const coreLabelsLoading =
      state.sidebarLabelsLoading ||
      state.partyLabelsLoading ||
      state.buildPartnerLabelsLoading ||
      state.capitalPartnerLabelsLoading ||
      state.buildPartnerAssetLabelsLoading
    
    // Workflow label loading states
    const workflowLabelsLoading =
      state.workflowActionLabelsLoading ||
      state.workflowDefinitionLabelsLoading ||
      state.workflowStageTemplateLabelsLoading ||
      state.workflowAmountRuleLabelsLoading ||
      state.workflowAmountStageOverrideLabelsLoading ||
      state.workflowRequestedLabelsLoading
    
    // Transaction label loading states
    const transactionLabelsLoading =
      state.pendingTransactionLabelsLoading ||
      state.discardedTransactionLabelsLoading
    
    // Entity label loading states
    const entityLabelsLoading =
      state.accountLabelsLoading ||
      state.agreementLabelsLoading ||
      state.agreementFeeScheduleLabelsLoading ||
      state.agreementParameterLabelsLoading ||
      state.agreementSignatoryLabelsLoading ||
      state.paymentInstructionLabelsLoading ||
      state.standingInstructionLabelsLoading ||
      state.standingInstructionBeneficiaryLabelsLoading ||
      state.beneficiaryLabelsLoading
    
    // Combined loading state
    const anyLoading =
      coreLabelsLoading ||
      workflowLabelsLoading ||
      transactionLabelsLoading ||
      entityLabelsLoading ||
      state.allLabelsLoading
    
    return {
      // Core labels
      sidebar: state.sidebarLabelsLoading,
      party: state.partyLabelsLoading,
      buildPartner: state.buildPartnerLabelsLoading,
      capitalPartner: state.capitalPartnerLabelsLoading,
      buildPartnerAsset: state.buildPartnerAssetLabelsLoading,
      
      // Workflow labels
      workflowAction: state.workflowActionLabelsLoading,
      workflowDefinition: state.workflowDefinitionLabelsLoading,
      workflowStageTemplate: state.workflowStageTemplateLabelsLoading,
      workflowAmountRule: state.workflowAmountRuleLabelsLoading,
      workflowAmountStageOverride: state.workflowAmountStageOverrideLabelsLoading,
      workflowRequested: state.workflowRequestedLabelsLoading,
      
      // Transaction labels
      pendingTransaction: state.pendingTransactionLabelsLoading,
      discardedTransaction: state.discardedTransactionLabelsLoading,
      
      // Entity labels
      account: state.accountLabelsLoading,
      agreement: state.agreementLabelsLoading,
      agreementFeeSchedule: state.agreementFeeScheduleLabelsLoading,
      agreementParameter: state.agreementParameterLabelsLoading,
      agreementSignatory: state.agreementSignatoryLabelsLoading,
      paymentInstruction: state.paymentInstructionLabelsLoading,
      standingInstruction: state.standingInstructionLabelsLoading,
      standingInstructionBeneficiary: state.standingInstructionBeneficiaryLabelsLoading,
      beneficiary: state.beneficiaryLabelsLoading,
      
      // Combined states
      any: anyLoading,
      all: state.allLabelsLoading,
    }
  },
})
