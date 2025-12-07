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
      | 'discardedTransaction',
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
      party: state.partyLabelsLoading,
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
      any:
        state.sidebarLabelsLoading ||
        state.partyLabelsLoading ||
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
        state.allLabelsLoading,
      all: state.allLabelsLoading,
    }
  },
})
