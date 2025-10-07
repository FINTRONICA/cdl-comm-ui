interface ReportField {
  id: string
  label: string
  type: 'select' | 'date' | 'text' | 'multiselect'
  required: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface ReportApiConfig {
  endpoint: string
  method: 'GET' | 'POST'
  payloadFields: string[]
  downloadEndpoint?: string
  downloadOnly?: boolean // New flag for reports that only download files
  columns: Array<{
    key: string
    title: string
    type: 'number' | 'date' | 'text' | 'status'
  }>
}

export interface ReportConfiguration {
  id: string
  title: string
  fields: ReportField[]
  api: ReportApiConfig
}

// Configuration-driven report system - easy to add new reports
export const BUSINESS_REPORTS_CONFIG: Record<string, ReportConfiguration> = {
  'account-opening': {
    id: 'account-opening',
    title: 'Account Opening Letter Report',
    fields: [
      {
        id: 'developerId',
        label: 'Developer',
        type: 'select',
        required: false,
        placeholder: 'Select Developer',
        options: [] // Will be populated dynamically
      },
      {
        id: 'projectId',
        label: 'Project',
        type: 'select',
        required: false,
        placeholder: 'Select Project',
        options: [] // Will be populated dynamically
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        required: false,
        placeholder: 'Select Status',
        options: [
          { value: 'CLOSE_ESCROW_AND_RETENTION', label: 'Close Escrow and Retention' },
          { value: 'PENDING_CLOSURE', label: 'Pending Closure' },
          { value: 'COMPLETED', label: 'Completed' }
        ]
      },
      {
        id: 'asOnDate',
        label: 'As On Date',
        type: 'date',
        required: false,
        placeholder: 'YYYY-MM-DD'
      }
    ],
    api: {
      endpoint: '/account-banking/opening-documents',
      method: 'POST',
      payloadFields: ['developerId', 'projectId', 'status', 'asOnDate'],
      downloadOnly: true, // This report only downloads files, no table display
      columns: [] // No columns needed for download-only reports
    }
  },
  
  'charges': {
    id: 'charges',
    title: 'Charges Report',
    fields: [
      {
        id: 'projectId',
        label: 'Project',
        type: 'select',
        required: false,
        placeholder: 'Select Project',
        options: [] // Will be populated dynamically
      },
      {
        id: 'fromDate',
        label: 'From Date',
        type: 'date',
        required: false,
        placeholder: 'YYYY-MM-DD'
      },
      {
        id: 'toDate',
        label: 'To Date',
        type: 'date',
        required: false,
        placeholder: 'YYYY-MM-DD'
      }
    ],
    api: {
      endpoint: '/account-banking/charges-report',
      method: 'POST',
      payloadFields: ['projectId', 'fromDate', 'toDate'],
      downloadEndpoint: '/account-banking/charges-report/download',
      columns: [
        { key: 'serialNo', title: 'S.No', type: 'number' },
        { key: 'transactionDate', title: 'Transaction Date', type: 'date' },
        { key: 'developerName', title: 'Developer Name', type: 'text' },
        { key: 'projectName', title: 'Project Name', type: 'text' },
        { key: 'chargeType', title: 'Charge Type', type: 'text' },
        { key: 'frequency', title: 'Frequency', type: 'text' },
        { key: 'perUnit', title: 'Per Unit', type: 'text' },
        { key: 'transactionStatus', title: 'Status', type: 'status' }
      ]
    }
  },
  
  'account-closure': {
    id: 'account-closure',
    title: 'Account Closure Report',
    fields: [
      {
        id: 'developerId',
        label: 'Developer',
        type: 'select',
        required: false,
        placeholder: 'Select Developer',
        options: [] // Will be populated dynamically
      },
      {
        id: 'projectId',
        label: 'Project',
        type: 'select',
        required: false,
        placeholder: 'Select Project',
        options: [] // Will be populated dynamically
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        required: false,
        placeholder: 'Select Status',
        options: [
          { value: 'CLOSE_ESCROW_AND_RETENTION', label: 'Close Escrow and Retention' },
          { value: 'PENDING_CLOSURE', label: 'Pending Closure' },
          { value: 'COMPLETED', label: 'Completed' }
        ]
      },
      {
        id: 'asOnDate',
        label: 'As On Date',
        type: 'date',
        required: false,
        placeholder: 'YYYY-MM-DD'
      }
    ],
    api: {
      endpoint: '/account-banking/closure-documents',
      method: 'POST',
      payloadFields: ['developerId', 'projectId', 'status', 'asOnDate'],
      downloadOnly: true, // This report only downloads files, no table display
      columns: [] // No columns needed for download-only reports
    }
  },
  
  'balance-confirmation': {
    id: 'balance-confirmation',
    title: 'Balance Confirmation Letter',
    fields: [
      {
        id: 'developerId',
        label: 'Developer',
        type: 'select',
        required: false,
        placeholder: 'Select Developer',
        options: [] // Will be populated dynamically
      },
      {
        id: 'projectId',
        label: 'Project',
        type: 'select',
        required: false,
        placeholder: 'Select Project',
        options: [] // Will be populated dynamically
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        required: false,
        placeholder: 'Select Status',
        options: [
          { value: 'CLOSE_ESCROW_AND_RETENTION', label: 'Close Escrow and Retention' },
          { value: 'PENDING_CLOSURE', label: 'Pending Closure' },
          { value: 'COMPLETED', label: 'Completed' }
        ]
      },
      {
        id: 'asOnDate',
        label: 'As On Date',
        type: 'date',
        required: false,
        placeholder: 'YYYY-MM-DD'
      }
    ],
    api: {
      endpoint: '/account-banking/balance-confirmation',
      method: 'POST',
      payloadFields: ['developerId', 'projectId', 'status', 'asOnDate'],
      downloadOnly: true, // This report only downloads files, no table display
      columns: [] // No columns needed for download-only reports
    }
  },
  
  // Example: Easy to add new reports
  'transaction-summary': {
    id: 'transaction-summary',
    title: 'Transaction Summary Report',
    fields: [
      {
        id: 'projectId',
        label: 'Project',
        type: 'select',
        required: false,
        placeholder: 'Select Project',
        options: []
      },
      {
        id: 'transactionType',
        label: 'Transaction Type',
        type: 'select',
        required: false,
        placeholder: 'Select Type',
        options: [
          { value: 'deposit', label: 'Deposit' },
          { value: 'withdrawal', label: 'Withdrawal' },
          { value: 'transfer', label: 'Transfer' }
        ]
      },
      {
        id: 'fromDate',
        label: 'From Date',
        type: 'date',
        required: true,
        placeholder: 'YYYY-MM-DD'
      },
      {
        id: 'toDate',
        label: 'To Date',
        type: 'date',
        required: true,
        placeholder: 'YYYY-MM-DD'
      }
    ],
    api: {
      endpoint: '/api/v1/transaction-summary-report',
      method: 'POST',
      payloadFields: ['projectId', 'transactionType', 'fromDate', 'toDate'],
      columns: [
        { key: 'serialNo', title: 'S.No', type: 'number' },
        { key: 'transactionDate', title: 'Date', type: 'date' },
        { key: 'transactionType', title: 'Type', type: 'text' },
        { key: 'amount', title: 'Amount', type: 'number' },
        { key: 'projectName', title: 'Project', type: 'text' },
        { key: 'transactionStatus', title: 'Status', type: 'status' }
      ]
    }
  }
}

/**
 * Get report configuration with populated project and developer options
 */
export const getReportConfiguration = (
  reportId: string, 
  projectOptions: Array<{ value: string; label: string }> = [],
  developerOptions: Array<{ value: string; label: string }> = []
): ReportConfiguration => {
  const config = BUSINESS_REPORTS_CONFIG[reportId]
  
  if (!config) {
    // Return default config for unknown reports
    return {
      id: reportId,
      title: `${reportId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Report`,
      fields: [],
      api: {
        endpoint: '/default-report-controller/report',
        method: 'POST',
        payloadFields: [],
        columns: [
          { key: 'serialNo', title: 'S.No', type: 'number' },
          { key: 'transactionDate', title: 'Date', type: 'date' },
          { key: 'description', title: 'Description', type: 'text' },
          { key: 'status', title: 'Status', type: 'status' }
        ]
      }
    }
  }
  
  // Deep clone the configuration to avoid mutating the original
  const configWithProjects = JSON.parse(JSON.stringify(config)) as ReportConfiguration
  
  // Populate project and developer options for fields that need them
  configWithProjects.fields = config.fields.map(field => {
    if (field.id === 'projectId' && projectOptions.length > 0) {
      return { ...field, options: projectOptions }
    }
    if (field.id === 'developerId' && developerOptions.length > 0) {
      return { ...field, options: developerOptions }
    }
    return field
  })
  
  return configWithProjects
}

/**
 * Get all available report configurations
 */
export const getAllReportConfigurations = (): ReportConfiguration[] => {
  return Object.values(BUSINESS_REPORTS_CONFIG)
}

/**
 * Check if a report exists in configuration
 */
export const isValidReportId = (reportId: string): boolean => {
  return reportId in BUSINESS_REPORTS_CONFIG
}
