import { type StateCreator } from 'zustand'
import { CUSTOMER_FIELD_CONFIG, getCustomerLabel } from '../../constants/mappings/customerMapping'

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

  // Master Customer labels - Customer Master module
  customerMasterLabels: ProcessedLabels | null
  customerMasterLabelsLoading: boolean
  customerMasterLabelsError: string | null
  customerMasterLabelsLastFetched: number | null

  // Master Customer labels - Account Purpose module
  accountPurposeLabels: ProcessedLabels | null
  accountPurposeLabelsLoading: boolean
  accountPurposeLabelsError: string | null
  accountPurposeLabelsLastFetched: number | null

  // Master Customer labels - Investment Master module
  investmentMasterLabels: ProcessedLabels | null
  investmentMasterLabelsLoading: boolean
  investmentMasterLabelsError: string | null
  investmentMasterLabelsLastFetched: number | null

  // Master Customer labels - Business Segment module
  businessSegmentLabels: ProcessedLabels | null
  businessSegmentLabelsLoading: boolean
  businessSegmentLabelsError: string | null
  businessSegmentLabelsLastFetched: number | null

  // Master Customer labels - Business Sub Segment module
  businessSubSegmentLabels: ProcessedLabels | null
  businessSubSegmentLabelsLoading: boolean
  businessSubSegmentLabelsError: string | null
  businessSubSegmentLabelsLastFetched: number | null

  // Master Customer labels - Deal Type module
  dealTypeLabels: ProcessedLabels | null
  dealTypeLabelsLoading: boolean
  dealTypeLabelsError: string | null
  dealTypeLabelsLastFetched: number | null

  // Master Customer labels - Deal Subtype module
  dealSubtypeLabels: ProcessedLabels | null
  dealSubtypeLabelsLoading: boolean
  dealSubtypeLabelsError: string | null
  dealSubtypeLabelsLastFetched: number | null

  // Master Customer labels - Product Program module
  productProgramLabels: ProcessedLabels | null
  productProgramLabelsLoading: boolean
  productProgramLabelsError: string | null
  productProgramLabelsLastFetched: number | null

  // Master Customer labels - Beneficiary module
  beneficiaryLabels: ProcessedLabels | null
  beneficiaryLabelsLoading: boolean
  beneficiaryLabelsError: string | null
  beneficiaryLabelsLastFetched: number | null

  // Master Customer labels - Document module
  documentLabels: ProcessedLabels | null
  documentLabelsLoading: boolean
  documentLabelsError: string | null
  documentLabelsLastFetched: number | null

  // Master Customer labels - Deal Segment module
  dealSegmentLabels: ProcessedLabels | null
  dealSegmentLabelsLoading: boolean
  dealSegmentLabelsError: string | null
  dealSegmentLabelsLastFetched: number | null

  // Master Customer labels - Ledger Account module
  ledgerAccountLabels: ProcessedLabels | null
  ledgerAccountLabelsLoading: boolean
  ledgerAccountLabelsError: string | null
  ledgerAccountLabelsLastFetched: number | null

  // Master Customer labels - Country Code module
  countryCodeLabels: ProcessedLabels | null
  countryCodeLabelsLoading: boolean
  countryCodeLabelsError: string | null
  countryCodeLabelsLastFetched: number | null

  // Master Customer labels - Currency Code module
  currencyCodeLabels: ProcessedLabels | null
  currencyCodeLabelsLoading: boolean
  currencyCodeLabelsError: string | null
  currencyCodeLabelsLastFetched: number | null

  // Global loading state for all labels
  allLabelsLoading: boolean
  allLabelsError: string | null

  // Customer field configuration
  customerFieldConfig: typeof CUSTOMER_FIELD_CONFIG
}

// Label actions interface
export interface LabelsActions {
  // Sidebar labels actions
  setSidebarLabels: (labels: ProcessedLabels) => void
  setSidebarLabelsLoading: (loading: boolean) => void
  setSidebarLabelsError: (error: string | null) => void

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

  // Master Customer labels actions - Customer Master module
  setCustomerMasterLabels: (labels: ProcessedLabels) => void
  setCustomerMasterLabelsLoading: (loading: boolean) => void
  setCustomerMasterLabelsError: (error: string | null) => void

  // Master Customer labels actions - Account Purpose module
  setAccountPurposeLabels: (labels: ProcessedLabels) => void
  setAccountPurposeLabelsLoading: (loading: boolean) => void
  setAccountPurposeLabelsError: (error: string | null) => void

  // Master Customer labels actions - Investment Master module
  setInvestmentMasterLabels: (labels: ProcessedLabels) => void
  setInvestmentMasterLabelsLoading: (loading: boolean) => void
  setInvestmentMasterLabelsError: (error: string | null) => void

  // Master Customer labels actions - Business Segment module
  setBusinessSegmentLabels: (labels: ProcessedLabels) => void
  setBusinessSegmentLabelsLoading: (loading: boolean) => void
  setBusinessSegmentLabelsError: (error: string | null) => void

  // Master Customer labels actions - Business Sub Segment module
  setBusinessSubSegmentLabels: (labels: ProcessedLabels) => void
  setBusinessSubSegmentLabelsLoading: (loading: boolean) => void
  setBusinessSubSegmentLabelsError: (error: string | null) => void

  // Master Customer labels actions - Deal Type module
  setDealTypeLabels: (labels: ProcessedLabels) => void
  setDealTypeLabelsLoading: (loading: boolean) => void
  setDealTypeLabelsError: (error: string | null) => void

  // Master Customer labels actions - Deal Subtype module
  setDealSubtypeLabels: (labels: ProcessedLabels) => void
  setDealSubtypeLabelsLoading: (loading: boolean) => void
  setDealSubtypeLabelsError: (error: string | null) => void

  // Master Customer labels actions - Product Program module
  setProductProgramLabels: (labels: ProcessedLabels) => void
  setProductProgramLabelsLoading: (loading: boolean) => void
  setProductProgramLabelsError: (error: string | null) => void

  // Master Customer labels actions - Beneficiary module
  setBeneficiaryLabels: (labels: ProcessedLabels) => void
  setBeneficiaryLabelsLoading: (loading: boolean) => void
  setBeneficiaryLabelsError: (error: string | null) => void

  // Master Customer labels actions - Document module
  setDocumentLabels: (labels: ProcessedLabels) => void
  setDocumentLabelsLoading: (loading: boolean) => void
  setDocumentLabelsError: (error: string | null) => void

  // Master Customer labels actions - Deal Segment module
  setDealSegmentLabels: (labels: ProcessedLabels) => void
  setDealSegmentLabelsLoading: (loading: boolean) => void
  setDealSegmentLabelsError: (error: string | null) => void

  // Master Customer labels actions - Ledger Account module
  setLedgerAccountLabels: (labels: ProcessedLabels) => void
  setLedgerAccountLabelsLoading: (loading: boolean) => void
  setLedgerAccountLabelsError: (error: string | null) => void

  // Master Customer labels actions - Country Code module
  setCountryCodeLabels: (labels: ProcessedLabels) => void
  setCountryCodeLabelsLoading: (loading: boolean) => void
  setCountryCodeLabelsError: (error: string | null) => void

  // Master Customer labels actions - Currency Code module
  setCurrencyCodeLabels: (labels: ProcessedLabels) => void
  setCurrencyCodeLabelsLoading: (loading: boolean) => void
  setCurrencyCodeLabelsError: (error: string | null) => void

  // Global actions
  setAllLabelsLoading: (loading: boolean) => void
  setAllLabelsError: (error: string | null) => void

  // Customer field configuration actions
  setCustomerFieldConfig: (config: typeof CUSTOMER_FIELD_CONFIG) => void
  getCustomerFieldLabel: (configId: string) => string

  // Utility actions
  clearAllLabels: () => void
  getLabel: (
    type:
      | 'sidebar'
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
      | 'customerMaster'
      | 'accountPurpose'
      | 'investmentMaster'
      | 'businessSegment'
      | 'businessSubSegment'
      | 'dealType'
      | 'dealSubtype'
      | 'productProgram'
      | 'beneficiary'
      | 'document'
      | 'dealSegment'
      | 'ledgerAccount'
      | 'countryCode'
      | 'currencyCode',
    configId: string,
    language: string,
    fallback: string
  ) => string

  // Validation helpers
  hasLabels: (
    type:
      | 'sidebar'
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
      | 'customerMaster'
      | 'accountPurpose'
      | 'investmentMaster'
      | 'businessSegment'
      | 'businessSubSegment'
      | 'dealType'
      | 'dealSubtype'
      | 'productProgram'
      | 'beneficiary'
      | 'document'
      | 'dealSegment'
      | 'ledgerAccount'
      | 'countryCode'
      | 'currencyCode'
  ) => boolean
  getAvailableLanguages: (
    type:
      | 'sidebar'
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
      | 'customerMaster'
      | 'accountPurpose'
      | 'investmentMaster'
      | 'businessSegment'
      | 'businessSubSegment'
      | 'dealType'
      | 'dealSubtype'
      | 'productProgram'
      | 'beneficiary'
      | 'document'
      | 'dealSegment'
      | 'ledgerAccount'
      | 'countryCode'
      | 'currencyCode'
  ) => string[]

  // Status helpers
  getLoadingStatus: () => {
    sidebar: boolean
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

  // Master Customer labels initial state - Customer Master module
  customerMasterLabels: null,
  customerMasterLabelsLoading: false,
  customerMasterLabelsError: null,
  customerMasterLabelsLastFetched: null,

  // Master Customer labels initial state - Account Purpose module
  accountPurposeLabels: null,
  accountPurposeLabelsLoading: false,
  accountPurposeLabelsError: null,
  accountPurposeLabelsLastFetched: null,

  // Master Customer labels initial state - Investment Master module
  investmentMasterLabels: null,
  investmentMasterLabelsLoading: false,
  investmentMasterLabelsError: null,
  investmentMasterLabelsLastFetched: null,

  // Master Customer labels initial state - Business Segment module
  businessSegmentLabels: null,
  businessSegmentLabelsLoading: false,
  businessSegmentLabelsError: null,
  businessSegmentLabelsLastFetched: null,

  // Master Customer labels initial state - Business Sub Segment module
  businessSubSegmentLabels: null,
  businessSubSegmentLabelsLoading: false,
  businessSubSegmentLabelsError: null,
  businessSubSegmentLabelsLastFetched: null,

  // Master Customer labels initial state - Deal Type module
  dealTypeLabels: null,
  dealTypeLabelsLoading: false,
  dealTypeLabelsError: null,
  dealTypeLabelsLastFetched: null,

  // Master Customer labels initial state - Deal Subtype module
  dealSubtypeLabels: null,
  dealSubtypeLabelsLoading: false,
  dealSubtypeLabelsError: null,
  dealSubtypeLabelsLastFetched: null,

  // Master Customer labels initial state - Product Program module
  productProgramLabels: null,
  productProgramLabelsLoading: false,
  productProgramLabelsError: null,
  productProgramLabelsLastFetched: null,

  // Master Customer labels initial state - Beneficiary module
  beneficiaryLabels: null,
  beneficiaryLabelsLoading: false,
  beneficiaryLabelsError: null,
  beneficiaryLabelsLastFetched: null,

  // Master Customer labels initial state - Document module
  documentLabels: null,
  documentLabelsLoading: false,
  documentLabelsError: null,
  documentLabelsLastFetched: null,

  // Master Customer labels initial state - Deal Segment module
  dealSegmentLabels: null,
  dealSegmentLabelsLoading: false,
  dealSegmentLabelsError: null,
  dealSegmentLabelsLastFetched: null,

  // Master Customer labels initial state - Ledger Account module
  ledgerAccountLabels: null,
  ledgerAccountLabelsLoading: false,
  ledgerAccountLabelsError: null,
  ledgerAccountLabelsLastFetched: null,

  // Master Customer labels initial state - Country Code module
  countryCodeLabels: null,
  countryCodeLabelsLoading: false,
  countryCodeLabelsError: null,
  countryCodeLabelsLastFetched: null,

  // Master Customer labels initial state - Currency Code module
  currencyCodeLabels: null,
  currencyCodeLabelsLoading: false,
  currencyCodeLabelsError: null,
  currencyCodeLabelsLastFetched: null,

  allLabelsLoading: false,
  allLabelsError: null,

  // Customer field configuration initial state
  customerFieldConfig: CUSTOMER_FIELD_CONFIG,

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

  // Master Customer labels actions - Customer Master module
  setCustomerMasterLabels: (labels) => {
    set({
      customerMasterLabels: labels,
      customerMasterLabelsLastFetched: Date.now(),
      customerMasterLabelsError: null,
    })
  },
  setCustomerMasterLabelsLoading: (loading) =>
    set({ customerMasterLabelsLoading: loading }),
  setCustomerMasterLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Customer Master labels error:', error)
    }
    set({ customerMasterLabelsError: error })
  },

  // Master Customer labels actions - Account Purpose module
  setAccountPurposeLabels: (labels) => {
    set({
      accountPurposeLabels: labels,
      accountPurposeLabelsLastFetched: Date.now(),
      accountPurposeLabelsError: null,
    })
  },
  setAccountPurposeLabelsLoading: (loading) =>
    set({ accountPurposeLabelsLoading: loading }),
  setAccountPurposeLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Account Purpose labels error:', error)
    }
    set({ accountPurposeLabelsError: error })
  },

  // Master Customer labels actions - Investment Master module
  setInvestmentMasterLabels: (labels) => {
    set({
      investmentMasterLabels: labels,
      investmentMasterLabelsLastFetched: Date.now(),
      investmentMasterLabelsError: null,
    })
  },
  setInvestmentMasterLabelsLoading: (loading) =>
    set({ investmentMasterLabelsLoading: loading }),
  setInvestmentMasterLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Investment Master labels error:', error)
    }
    set({ investmentMasterLabelsError: error })
  },

  // Master Customer labels actions - Business Segment module
  setBusinessSegmentLabels: (labels) => {
    set({
      businessSegmentLabels: labels,
      businessSegmentLabelsLastFetched: Date.now(),
      businessSegmentLabelsError: null,
    })
  },
  setBusinessSegmentLabelsLoading: (loading) =>
    set({ businessSegmentLabelsLoading: loading }),
  setBusinessSegmentLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Business Segment labels error:', error)
    }
    set({ businessSegmentLabelsError: error })
  },

  // Master Customer labels actions - Business Sub Segment module
  setBusinessSubSegmentLabels: (labels) => {
    set({
      businessSubSegmentLabels: labels,
      businessSubSegmentLabelsLastFetched: Date.now(),
      businessSubSegmentLabelsError: null,
    })
  },
  setBusinessSubSegmentLabelsLoading: (loading) =>
    set({ businessSubSegmentLabelsLoading: loading }),
  setBusinessSubSegmentLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Business Sub Segment labels error:', error)
    }
    set({ businessSubSegmentLabelsError: error })
  },

  // Master Customer labels actions - Deal Type module
  setDealTypeLabels: (labels) => {
    set({
      dealTypeLabels: labels,
      dealTypeLabelsLastFetched: Date.now(),
      dealTypeLabelsError: null,
    })
  },
  setDealTypeLabelsLoading: (loading) =>
    set({ dealTypeLabelsLoading: loading }),
  setDealTypeLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Deal Type labels error:', error)
    }
    set({ dealTypeLabelsError: error })
  },

  // Master Customer labels actions - Deal Subtype module
  setDealSubtypeLabels: (labels) => {
    set({
      dealSubtypeLabels: labels,
      dealSubtypeLabelsLastFetched: Date.now(),
      dealSubtypeLabelsError: null,
    })
  },
  setDealSubtypeLabelsLoading: (loading) =>
    set({ dealSubtypeLabelsLoading: loading }),
  setDealSubtypeLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Deal Subtype labels error:', error)
    }
    set({ dealSubtypeLabelsError: error })
  },

  // Master Customer labels actions - Product Program module
  setProductProgramLabels: (labels) => {
    set({
      productProgramLabels: labels,
      productProgramLabelsLastFetched: Date.now(),
      productProgramLabelsError: null,
    })
  },
  setProductProgramLabelsLoading: (loading) =>
    set({ productProgramLabelsLoading: loading }),
  setProductProgramLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Product Program labels error:', error)
    }
    set({ productProgramLabelsError: error })
  },

  // Master Customer labels actions - Beneficiary module
  setBeneficiaryLabels: (labels) => {
    set({
      beneficiaryLabels: labels,
      beneficiaryLabelsLastFetched: Date.now(),
      beneficiaryLabelsError: null,
    })
  },
  setBeneficiaryLabelsLoading: (loading) =>
    set({ beneficiaryLabelsLoading: loading }),
  setBeneficiaryLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Beneficiary labels error:', error)
    }
    set({ beneficiaryLabelsError: error })
  },

  // Master Customer labels actions - Document module
  setDocumentLabels: (labels) => {
    set({
      documentLabels: labels,
      documentLabelsLastFetched: Date.now(),
      documentLabelsError: null,
    })
  },
  setDocumentLabelsLoading: (loading) =>
    set({ documentLabelsLoading: loading }),
  setDocumentLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Document labels error:', error)
    }
    set({ documentLabelsError: error })
  },

  // Master Customer labels actions - Deal Segment module
  setDealSegmentLabels: (labels) => {
    set({
      dealSegmentLabels: labels,
      dealSegmentLabelsLastFetched: Date.now(),
      dealSegmentLabelsError: null,
    })
  },
  setDealSegmentLabelsLoading: (loading) =>
    set({ dealSegmentLabelsLoading: loading }),
  setDealSegmentLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Deal Segment labels error:', error)
    }
    set({ dealSegmentLabelsError: error })
  },

  // Master Customer labels actions - Ledger Account module
  setLedgerAccountLabels: (labels) => {
    set({
      ledgerAccountLabels: labels,
      ledgerAccountLabelsLastFetched: Date.now(),
      ledgerAccountLabelsError: null,
    })
  },
  setLedgerAccountLabelsLoading: (loading) =>
    set({ ledgerAccountLabelsLoading: loading }),
  setLedgerAccountLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Ledger Account labels error:', error)
    }
    set({ ledgerAccountLabelsError: error })
  },

  // Master Customer labels actions - Country Code module
  setCountryCodeLabels: (labels) => {
    set({
      countryCodeLabels: labels,
      countryCodeLabelsLastFetched: Date.now(),
      countryCodeLabelsError: null,
    })
  },
  setCountryCodeLabelsLoading: (loading) =>
    set({ countryCodeLabelsLoading: loading }),
  setCountryCodeLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Country Code labels error:', error)
    }
    set({ countryCodeLabelsError: error })
  },

  // Master Customer labels actions - Currency Code module
  setCurrencyCodeLabels: (labels) => {
    set({
      currencyCodeLabels: labels,
      currencyCodeLabelsLastFetched: Date.now(),
      currencyCodeLabelsError: null,
    })
  },
  setCurrencyCodeLabelsLoading: (loading) =>
    set({ currencyCodeLabelsLoading: loading }),
  setCurrencyCodeLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] Currency Code labels error:', error)
    }
    set({ currencyCodeLabelsError: error })
  },

  // Global actions
  setAllLabelsLoading: (loading) => set({ allLabelsLoading: loading }),

  setAllLabelsError: (error) => {
    if (error) {
      console.error('❌ [COMPLIANCE] All labels error:', error)
    }
    set({ allLabelsError: error })
  },

  // Customer field configuration actions
  setCustomerFieldConfig: (config) => {
    set({ customerFieldConfig: config })
  },

  getCustomerFieldLabel: (configId) => {
    const state = get()
    return getCustomerLabel(configId)
  },

  // Utility actions
  clearAllLabels: () => {
    set({
      sidebarLabels: null,
      buildPartnerLabels: null,
      capitalPartnerLabels: null,
      buildPartnerAssetLabels: null,
      pendingTransactionLabels: null,
      discardedTransactionLabels: null,
      sidebarLabelsLastFetched: null,
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
      // Master Customer labels
      customerMasterLabels: null,
      accountPurposeLabels: null,
      investmentMasterLabels: null,
      businessSegmentLabels: null,
      businessSubSegmentLabels: null,
      dealTypeLabels: null,
      dealSubtypeLabels: null,
      productProgramLabels: null,
      beneficiaryLabels: null,
      documentLabels: null,
      dealSegmentLabels: null,
      ledgerAccountLabels: null,
      countryCodeLabels: null,
      currencyCodeLabels: null,
      customerMasterLabelsLastFetched: null,
      accountPurposeLabelsLastFetched: null,
      investmentMasterLabelsLastFetched: null,
      businessSegmentLabelsLastFetched: null,
      businessSubSegmentLabelsLastFetched: null,
      dealTypeLabelsLastFetched: null,
      dealSubtypeLabelsLastFetched: null,
      productProgramLabelsLastFetched: null,
      beneficiaryLabelsLastFetched: null,
      documentLabelsLastFetched: null,
      dealSegmentLabelsLastFetched: null,
      ledgerAccountLabelsLastFetched: null,
      countryCodeLabelsLastFetched: null,
      currencyCodeLabelsLastFetched: null,
      sidebarLabelsError: null,
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
      // Master Customer labels errors
      customerMasterLabelsError: null,
      accountPurposeLabelsError: null,
      investmentMasterLabelsError: null,
      businessSegmentLabelsError: null,
      businessSubSegmentLabelsError: null,
      dealTypeLabelsError: null,
      dealSubtypeLabelsError: null,
      productProgramLabelsError: null,
      beneficiaryLabelsError: null,
      documentLabelsError: null,
      dealSegmentLabelsError: null,
      ledgerAccountLabelsError: null,
      countryCodeLabelsError: null,
      currencyCodeLabelsError: null,
      allLabelsError: null,
    })
  },

  getLabel: (type, configId, language, fallback) => {
    const state = get()
    let labels: ProcessedLabels | null = null

    switch (type) {
      case 'sidebar':
        labels = state.sidebarLabels
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
      case 'pendingTransaction':
        labels = state.pendingTransactionLabels
        break
      case 'discardedTransaction':
        labels = state.discardedTransactionLabels
        break
      case 'customerMaster':
        labels = state.customerMasterLabels
        break
      case 'accountPurpose':
        labels = state.accountPurposeLabels
        break
      case 'investmentMaster':
        labels = state.investmentMasterLabels
        break
      case 'businessSegment':
        labels = state.businessSegmentLabels
        break
      case 'businessSubSegment':
        labels = state.businessSubSegmentLabels
        break
      case 'dealType':
        labels = state.dealTypeLabels
        break
      case 'dealSubtype':
        labels = state.dealSubtypeLabels
        break
      case 'productProgram':
        labels = state.productProgramLabels
        break
      case 'beneficiary':
        labels = state.beneficiaryLabels
        break
      case 'document':
        labels = state.documentLabels
        break
      case 'dealSegment':
        labels = state.dealSegmentLabels
        break
      case 'ledgerAccount':
        labels = state.ledgerAccountLabels
        break
      case 'countryCode':
        labels = state.countryCodeLabels
        break
      case 'currencyCode':
        labels = state.currencyCodeLabels
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
      case 'sidebar':
        return !!(
          state.sidebarLabels && Object.keys(state.sidebarLabels).length > 0
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
      case 'customerMaster':
        return !!(
          state.customerMasterLabels &&
          Object.keys(state.customerMasterLabels).length > 0
        )
      case 'accountPurpose':
        return !!(
          state.accountPurposeLabels &&
          Object.keys(state.accountPurposeLabels).length > 0
        )
      case 'investmentMaster':
        return !!(
          state.investmentMasterLabels &&
          Object.keys(state.investmentMasterLabels).length > 0
        )
      case 'businessSegment':
        return !!(
          state.businessSegmentLabels &&
          Object.keys(state.businessSegmentLabels).length > 0
        )
      case 'businessSubSegment':
        return !!(
          state.businessSubSegmentLabels &&
          Object.keys(state.businessSubSegmentLabels).length > 0
        )
      case 'dealType':
        return !!(
          state.dealTypeLabels &&
          Object.keys(state.dealTypeLabels).length > 0
        )
      case 'dealSubtype':
        return !!(
          state.dealSubtypeLabels &&
          Object.keys(state.dealSubtypeLabels).length > 0
        )
      case 'productProgram':
        return !!(
          state.productProgramLabels &&
          Object.keys(state.productProgramLabels).length > 0
        )
      case 'beneficiary':
        return !!(
          state.beneficiaryLabels &&
          Object.keys(state.beneficiaryLabels).length > 0
        )
      case 'document':
        return !!(
          state.documentLabels &&
          Object.keys(state.documentLabels).length > 0
        )
      case 'dealSegment':
        return !!(
          state.dealSegmentLabels &&
          Object.keys(state.dealSegmentLabels).length > 0
        )
      case 'ledgerAccount':
        return !!(
          state.ledgerAccountLabels &&
          Object.keys(state.ledgerAccountLabels).length > 0
        )
      case 'countryCode':
        return !!(
          state.countryCodeLabels &&
          Object.keys(state.countryCodeLabels).length > 0
        )
      case 'currencyCode':
        return !!(
          state.currencyCodeLabels &&
          Object.keys(state.currencyCodeLabels).length > 0
        )
      default:
        return false
    }
  },



  getAvailableLanguages: (type) => {
    const state = get()
    let labels: ProcessedLabels | null = null

    switch (type) {
      case 'sidebar':
        labels = state.sidebarLabels
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
      case 'pendingTransaction':
        labels = state.pendingTransactionLabels
        break
      case 'discardedTransaction':
        labels = state.discardedTransactionLabels
        break
      case 'customerMaster':
        labels = state.customerMasterLabels
        break
      case 'accountPurpose':
        labels = state.accountPurposeLabels
        break
      case 'investmentMaster':
        labels = state.investmentMasterLabels
        break
      case 'businessSegment':
        labels = state.businessSegmentLabels
        break
      case 'businessSubSegment':
        labels = state.businessSubSegmentLabels
        break
      case 'dealType':
        labels = state.dealTypeLabels
        break
      case 'dealSubtype':
        labels = state.dealSubtypeLabels
        break
      case 'productProgram':
        labels = state.productProgramLabels
        break
      case 'beneficiary':
        labels = state.beneficiaryLabels
        break
      case 'document':
        labels = state.documentLabels
        break
      case 'dealSegment':
        labels = state.dealSegmentLabels
        break
      case 'ledgerAccount':
        labels = state.ledgerAccountLabels
        break
      case 'countryCode':
        labels = state.countryCodeLabels
        break
      case 'currencyCode':
        labels = state.currencyCodeLabels
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

    const availableLanguages = Array.from(languages)
    return availableLanguages
  },

  // Status helpers
  getLoadingStatus: () => {
    const state = get()
    return {
      sidebar: state.sidebarLabelsLoading,
      buildPartner: state.buildPartnerLabelsLoading,
      capitalPartner: state.capitalPartnerLabelsLoading,
      buildPartnerAsset: state.buildPartnerAssetLabelsLoading,
      workflowAction: state.workflowActionLabelsLoading,
      workflowDefinition: state.workflowDefinitionLabelsLoading,
      workflowStageTemplate: state.workflowStageTemplateLabelsLoading,
      workflowAmountRule: state.workflowAmountRuleLabelsLoading,
      workflowAmountStageOverride:
        state.workflowAmountStageOverrideLabelsLoading,
      workflowRequested: state.workflowRequestedLabelsLoading,
      pendingTransaction: state.pendingTransactionLabelsLoading,
      discardedTransaction: state.discardedTransactionLabelsLoading,
      // Master Customer loading states
      customerMaster: state.customerMasterLabelsLoading,
      accountPurpose: state.accountPurposeLabelsLoading,
      investmentMaster: state.investmentMasterLabelsLoading,
      businessSegment: state.businessSegmentLabelsLoading,
      businessSubSegment: state.businessSubSegmentLabelsLoading,
      dealType: state.dealTypeLabelsLoading,
      dealSubtype: state.dealSubtypeLabelsLoading,
      productProgram: state.productProgramLabelsLoading,
      beneficiary: state.beneficiaryLabelsLoading,
      document: state.documentLabelsLoading,
      dealSegment: state.dealSegmentLabelsLoading,
      ledgerAccount: state.ledgerAccountLabelsLoading,
      countryCode: state.countryCodeLabelsLoading,
      currencyCode: state.currencyCodeLabelsLoading,
      any:
        state.sidebarLabelsLoading ||
        state.buildPartnerLabelsLoading ||
        state.capitalPartnerLabelsLoading ||
        state.buildPartnerAssetLabelsLoading ||
        state.workflowActionLabelsLoading ||
        state.workflowDefinitionLabelsLoading ||
        state.workflowStageTemplateLabelsLoading ||
        state.workflowAmountRuleLabelsLoading ||
        state.workflowAmountStageOverrideLabelsLoading ||
        state.workflowRequestedLabelsLoading ||
        state.pendingTransactionLabelsLoading ||
        state.discardedTransactionLabelsLoading ||
        state.customerMasterLabelsLoading ||
        state.accountPurposeLabelsLoading ||
        state.investmentMasterLabelsLoading ||
        state.businessSegmentLabelsLoading ||
        state.businessSubSegmentLabelsLoading ||
        state.dealTypeLabelsLoading ||
        state.dealSubtypeLabelsLoading ||
        state.productProgramLabelsLoading ||
        state.beneficiaryLabelsLoading ||
        state.documentLabelsLoading ||
        state.dealSegmentLabelsLoading ||
        state.ledgerAccountLabelsLoading ||
        state.countryCodeLabelsLoading ||
        state.currencyCodeLabelsLoading ||
        state.allLabelsLoading,
      all: state.allLabelsLoading,
    }
  },
})
