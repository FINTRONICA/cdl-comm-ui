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
  // Add transformation function for each report
  transformResponse?: (data: any) => Array<{
    id: string
    [key: string]: string | number | boolean | null | undefined
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
      ],
      // Add transformation function for charges report
      transformResponse: (data: any) => {
        return data.content?.map((item: any, index: number) => ({
          id: item.serialNo?.toString() || index.toString(),
          serialNo: item.serialNo,
          transactionDate: item.transactionDate,
          developerName: item.developerName,
          projectName: item.projectName,
          chargeType: item.chargeType,
          frequency: item.frequency,
          perUnit: item.perUnit,
          transactionStatus: item.transactionStatus
        })) || []
      }
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
      ],
      // Add transformation function for transaction summary report
      transformResponse: (data: any) => {
        return data.content?.map((item: any, index: number) => ({
          id: item.serialNo?.toString() || index.toString(),
          serialNo: item.serialNo,
          transactionDate: item.transactionDate,
          transactionType: item.transactionType,
          amount: item.amount,
          projectName: item.projectName,
          transactionStatus: item.transactionStatus
        })) || []
      }
    }
  },
  'beneficiary': {
    id: 'beneficiary',
    title: 'Beneficiary Report',
    fields: [
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
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        required: false,
        placeholder: 'Select Status',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'pending', label: 'Pending' }
        ]
      }
    ],
    api: {
      endpoint: '/business-objects/build-partner',
      method: 'POST',
      payloadFields: ['fromDate', 'toDate', 'status'],
      downloadEndpoint: '/business-objects/build-partner/download',
      columns: [
        { key: 'serialNo', title: 'S.No', type: 'number' },
        { key: 'bpName', title: 'Name', type: 'text' },
        { key: 'bpCifrera', title: 'CIF rera', type: 'text' },
        { key: 'bpDeveloperRegNo', title: 'Reg No.', type: 'number' },
        { key: 'bpLicenseNo', title: 'License No.', type: 'text' },
        { key: 'bpActiveStatus', title: 'Status', type: 'status' }
      ],
      // Add transformation function specific to beneficiary report
      transformResponse: (data: any) => {
        if (!data || !data.content) {
          console.warn('Beneficiary transformResponse: No data or content found', data)
          return []
        }
        
        return data.content.map((item: any, index: number) => ({
          id: item.serialNo?.toString() || item.id?.toString() || index.toString(),
          serialNo: item.serialNo,
          bpName: item.bpName || '',
          bpCifrera: item.bpCifrera || '',
          bpDeveloperRegNo: item.bpDeveloperRegNo || '',
          bpLicenseNo: item.bpLicenseNo || '',
          bpActiveStatus: item.bpActiveStatus || ''
        }))
      }
    }
  },
  'transactions-audit': {
    id: 'transactions-audit',
    title: 'Transactions Audit Report',
    fields: [
      {
        id: 'project',
        label: 'Project',
        type: 'select',
        required: false,
        placeholder: 'Select Project',
        options: [] // Will be populated dynamically
      },
      {
        id: 'asOnDate',
        label: 'As On Date',
        type: 'date',
        required: true,
        placeholder: 'YYYY-MM-DD'
      }
    ],
    api: {
      endpoint: '/business-objects/financial-data-summary',
      method: 'POST',
      payloadFields: ['project', 'asOnDate'],
      downloadEndpoint: '/business-objects/financial-data-summary/download',
      columns: [
        { key: 'serialNo', title: 'S.No', type: 'number' },
        { key: 'project', title: 'Project', type: 'text' },
        { key: 'unitNo', title: 'Unit No', type: 'text' },
        { key: 'ownerName', title: 'Owner Name', type: 'text' },
        { key: 'openingBalance', title: 'Opening Balance', type: 'number' },
        { key: 'collections', title: 'Collections', type: 'number' },
        { key: 'refunds', title: 'Refunds', type: 'number' },
        { key: 'transfers', title: 'Transfers', type: 'number' },
        { key: 'paidOutEscrow', title: 'Paid Out Escrow', type: 'number' },
        { key: 'paidWithinEscrow', title: 'Paid Within Escrow', type: 'number' },
        { key: 'totalCashReceived', title: 'Total Cash Received', type: 'number' },
        { key: 'ownerBalance', title: 'Owner Balance', type: 'number' },
        { key: 'oqoodAmount', title: 'Oqood Amount', type: 'number' },
        { key: 'dldAmount', title: 'DLD Amount', type: 'number' },
        { key: 'lastPaymentDate', title: 'Last Payment Date', type: 'date' },
        { key: 'status', title: 'Status', type: 'status' },
        { key: 'remarks', title: 'Remarks', type: 'text' }
      ],
      transformResponse: (data: any) => {
        if (!data || !data.content) {
          console.warn('Transactions Audit transformResponse: No data or content found', data)
          return []
        }
        
        return data.content.map((item: any, index: number) => ({
          id: item.serialNo?.toString() || item.id?.toString() || index.toString(),
          serialNo: item.serialNo,
          project: item.project || '',
          unitNo: item.unitNo || '',
          ownerName: item.ownerName || '',
          openingBalance: item.openingBalance || 0,
          collections: item.collections || 0,
          refunds: item.refunds || 0,
          transfers: item.transfers || 0,
          paidOutEscrow: item.paidOutEscrow || 0,
          paidWithinEscrow: item.paidWithinEscrow || 0,
          totalCashReceived: item.totalCashReceived || 0,
          ownerBalance: item.ownerBalance || 0,
          oqoodAmount: item.oqoodAmount || 0,
          dldAmount: item.dldAmount || 0,
          lastPaymentDate: item.lastPaymentDate || '',
          status: item.status || '',
          remarks: item.remarks || ''
        }))
      }
    }
  },
  'monthly-rera': {
    id: 'monthly-rera',
    title: 'Monthly RERA Report',
    fields: [
      {
        id: 'developer',
        label: 'Developer',
        type: 'select',
        required: false,
        placeholder: 'Select Developer',
        options: [] // Will be populated dynamically
      },
      {
        id: 'project',
        label: 'Project',
        type: 'select',
        required: false,
        placeholder: 'Select Project',
        options: [] // Will be populated dynamically
      },
      {
        id: 'asOnDate',
        label: 'As On Date',
        type: 'date',
        required: true,
        placeholder: 'YYYY-MM-DD'
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
      endpoint: '/business-objects/monthly-rera-report',
      method: 'POST',
      payloadFields: ['developer', 'project', 'asOnDate', 'fromDate', 'toDate'],
      downloadEndpoint: '/business-objects/monthly-rera-report/download',
      columns: [
        { key: 'serialNo', title: 'S.No', type: 'number' },
        { key: 'date', title: 'Date', type: 'date' },
        { key: 'developer', title: 'Developer', type: 'text' },
        { key: 'project', title: 'Project', type: 'text' },
        { key: 'unitNo', title: 'Unit No', type: 'text' },
        { key: 'ownerName', title: 'Owner Name', type: 'text' },
        { key: 'activity', title: 'Activity', type: 'text' },
        { key: 'paymentMode', title: 'Payment Mode', type: 'text' },
        { key: 'amount', title: 'Amount', type: 'number' },
        { key: 'bankName', title: 'Bank Name', type: 'text' },
        { key: 'tasRef', title: 'TAS Ref', type: 'text' },
        { key: 'status', title: 'Status', type: 'status' }
      ],
      transformResponse: (data: any) => {
        if (!data || !data.content) {
          console.warn('Monthly RERA transformResponse: No data or content found', data)
          return []
        }
        
        return data.content.map((item: any, index: number) => ({
          id: item.serialNo?.toString() || item.id?.toString() || index.toString(),
          serialNo: item.serialNo,
          date: item.date || '',
          developer: item.developer || '',
          project: item.project || '',
          unitNo: item.unitNo || '',
          ownerName: item.ownerName || '',
          activity: item.activity || '',
          paymentMode: item.paymentMode || '',
          amount: item.amount || 0,
          bankName: item.bankName || '',
          tasRef: item.tasRef || '',
          status: item.status || ''
        }))
      }
    }
  },
  'monthly-tas': {
    id: 'monthly-tas',
    title: 'Monthly TAS Report',
    fields: [
      {
        id: 'developer',
        label: 'Developer',
        type: 'select',
        required: false,
        placeholder: 'Select Developer',
        options: [] // Will be populated dynamically
      },
      {
        id: 'project',
        label: 'Project',
        type: 'select',
        required: false,
        placeholder: 'Select Project',
        options: [] // Will be populated dynamically
      },
      {
        id: 'asOnDate',
        label: 'As On Date',
        type: 'date',
        required: true,
        placeholder: 'YYYY-MM-DD'
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
      endpoint: '/business-objects/monthly-tas-report',
      method: 'POST',
      payloadFields: ['developer', 'project', 'asOnDate', 'fromDate', 'toDate'],
      downloadEndpoint: '/business-objects/monthly-tas-report/download',
      columns: [
        { key: 'serialNo', title: 'S.No', type: 'number' },
        { key: 'txnDate', title: 'Txn Date', type: 'date' },
        { key: 'batchNo', title: 'Batch No', type: 'text' },
        { key: 'tasReferenceNo', title: 'TAS Ref No', type: 'text' },
        { key: 'developer', title: 'Developer', type: 'text' },
        { key: 'project', title: 'Project', type: 'text' },
        { key: 'unitNo', title: 'Unit No', type: 'text' },
        { key: 'ownerName', title: 'Owner Name', type: 'text' },
        { key: 'paymentType', title: 'Payment Type', type: 'text' },
        { key: 'paymentMode', title: 'Payment Mode', type: 'text' },
        { key: 'amount', title: 'Amount', type: 'number' },
        { key: 'bankName', title: 'Bank Name', type: 'text' },
        { key: 'finacleRefNo', title: 'Finacle Ref No', type: 'text' },
        { key: 'serviceStatus', title: 'Service Status', type: 'status' },
        { key: 'errorDescription', title: 'Error Description', type: 'text' }
      ],
      transformResponse: (data: any) => {
        if (!data || !data.content) {
          console.warn('Monthly TAS transformResponse: No data or content found', data)
          return []
        }
        
        return data.content.map((item: any, index: number) => ({
          id: item.serialNo?.toString() || item.id?.toString() || index.toString(),
          serialNo: item.serialNo,
          txnDate: item.txnDate || '',
          batchNo: item.batchNo || '',
          tasReferenceNo: item.tasReferenceNo || '',
          developer: item.developer || '',
          project: item.project || '',
          unitNo: item.unitNo || '',
          ownerName: item.ownerName || '',
          paymentType: item.paymentType || '',
          paymentMode: item.paymentMode || '',
          amount: item.amount || 0,
          bankName: item.bankName || '',
          finacleRefNo: item.finacleRefNo || '',
          serviceStatus: item.serviceStatus || '',
          errorDescription: item.errorDescription || ''
        }))
      }
    }
  },
  'tas-batch-status': {
    id: 'tas-batch-status',
    title: 'TAS Batch Status Report',
    fields: [
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
      endpoint: '/business-objects/tas-batch-status-report',
      method: 'POST',
      payloadFields: ['fromDate', 'toDate'],
      downloadEndpoint: '/business-objects/tas-batch-status-report/download',
      columns: [
        { key: 'serialNo', title: 'S.No', type: 'number' },
        { key: 'createDate', title: 'Create Date', type: 'date' },
        { key: 'batchNo', title: 'Batch No', type: 'text' },
        { key: 'paymentType', title: 'Payment Type', type: 'text' },
        { key: 'subType', title: 'Sub Type', type: 'text' },
        { key: 'buildingNumber', title: 'Building Number', type: 'text' },
        { key: 'dateOfPayment', title: 'Date of Payment', type: 'date' },
        { key: 'paymentAmount', title: 'Payment Amount', type: 'number' },
        { key: 'paymentMode', title: 'Payment Mode', type: 'text' },
        { key: 'payeeName', title: 'Payee Name', type: 'text' },
        { key: 'developerNumber', title: 'Developer Number', type: 'text' },
        { key: 'projectNumber', title: 'Project Number', type: 'text' },
        { key: 'tasReferenceNo', title: 'TAS Ref No', type: 'text' },
        { key: 'propertyTypeId', title: 'Property Type ID', type: 'text' },
        { key: 'unitNumber', title: 'Unit Number', type: 'text' },
        { key: 'service', title: 'Service', type: 'text' },
        { key: 'errorDescription', title: 'Error Description', type: 'text' },
        { key: 'finacleRefNo', title: 'Finacle Ref No', type: 'text' },
        { key: 'mortgageNumber', title: 'Mortgage Number', type: 'text' },
        { key: 'maker', title: 'Maker', type: 'text' },
        { key: 'checker', title: 'Checker', type: 'text' }
      ],
      transformResponse: (data: any) => {
        if (!data || !data.content) {
          console.warn('TAS Batch Status transformResponse: No data or content found', data)
          return []
        }
        
        return data.content.map((item: any, index: number) => ({
          id: item.serialNo?.toString() || item.id?.toString() || index.toString(),
          serialNo: item.serialNo,
          createDate: item.createDate || '',
          batchNo: item.batchNo || '',
          paymentType: item.paymentType || '',
          subType: item.subType || '',
          buildingNumber: item.buildingNumber || '',
          dateOfPayment: item.dateOfPayment || '',
          paymentAmount: item.paymentAmount || 0,
          paymentMode: item.paymentMode || '',
          payeeName: item.payeeName || '',
          developerNumber: item.developerNumber || '',
          projectNumber: item.projectNumber || '',
          tasReferenceNo: item.tasReferenceNo || '',
          propertyTypeId: item.propertyTypeId || '',
          unitNumber: item.unitNumber || '',
          service: item.service || '',
          errorDescription: item.errorDescription || '',
          finacleRefNo: item.finacleRefNo || '',
          mortgageNumber: item.mortgageNumber || '',
          maker: item.maker || '',
          checker: item.checker || ''
        }))
      }
    }
  },
  'rt04-trust': {
    id: 'rt04-trust',
    title: 'RT04 Trust Report',
    fields: [
      {
        id: 'developerName',
        label: 'Developer Name',
        type: 'text',
        required: false,
        placeholder: 'Enter Developer Name'
      },
      {
        id: 'projectName',
        label: 'Project Name',
        type: 'text',
        required: false,
        placeholder: 'Enter Project Name'
      },
      {
        id: 'unitNo',
        label: 'Unit Number',
        type: 'text',
        required: false,
        placeholder: 'Enter Unit Number'
      },
      {
        id: 'unitHolderName',
        label: 'Unit Holder Name',
        type: 'text',
        required: false,
        placeholder: 'Enter Unit Holder Name'
      }
    ],
    api: {
      endpoint: '/business-objects/trust-report',
      method: 'POST',
      payloadFields: ['developerName', 'projectName', 'unitNo', 'unitHolderName'],
      downloadEndpoint: '/business-objects/trust-report/download',
      columns: [
        { key: 'serialNo', title: 'S.No', type: 'number' },
        { key: 'buildingName', title: 'Building Name', type: 'text' },
        { key: 'unitNumber', title: 'Unit Number', type: 'text' },
        { key: 'owner1', title: 'Owner 1', type: 'text' },
        { key: 'owner2', title: 'Owner 2', type: 'text' },
        { key: 'owner3', title: 'Owner 3', type: 'text' },
        { key: 'owner4', title: 'Owner 4', type: 'text' },
        { key: 'owner5', title: 'Owner 5', type: 'text' },
        { key: 'owner6', title: 'Owner 6', type: 'text' },
        { key: 'owner7', title: 'Owner 7', type: 'text' },
        { key: 'owner8', title: 'Owner 8', type: 'text' },
        { key: 'owner9', title: 'Owner 9', type: 'text' },
        { key: 'owner10', title: 'Owner 10', type: 'text' },
        { key: 'grossSalesValue', title: 'Gross Sales Value', type: 'number' },
        { key: 'cashCollectionOutEscrow', title: 'Cash Collection Out Escrow', type: 'number' },
        { key: 'cashCollectionWithinEscrow', title: 'Cash Collection Within Escrow', type: 'number' },
        { key: 'totalCashReceivedInEscrow', title: 'Total Cash Received In Escrow', type: 'number' },
        { key: 'totalCashFromUnitHolder', title: 'Total Cash From Unit Holder', type: 'number' },
        { key: 'ownerBalance', title: 'Owner Balance', type: 'number' },
        { key: 'unitStatus', title: 'Unit Status', type: 'status' },
        { key: 'oqoodPaid', title: 'Oqood Paid', type: 'status' },
        { key: 'spa', title: 'SPA', type: 'status' },
        { key: 'reservationForm', title: 'Reservation Form', type: 'status' },
        { key: 'oqoodAmount', title: 'Oqood Amount', type: 'number' },
        { key: 'dldAmount', title: 'DLD Amount', type: 'number' },
        { key: 'balanceLetterSent', title: 'Balance Letter Sent', type: 'text' },
        { key: 'balanceLetterIssued', title: 'Balance Letter Issued', type: 'date' },
        { key: 'remarks', title: 'Remarks', type: 'text' }
      ],
      transformResponse: (data: any) => {
        if (!data || !data.content) {
          console.warn('RT04 Trust transformResponse: No data or content found', data)
          return []
        }
        
        return data.content.map((item: any, index: number) => ({
          id: item.serialNo?.toString() || item.id?.toString() || index.toString(),
          serialNo: item.serialNo,
          buildingName: item.buildingName || '',
          unitNumber: item.unitNumber || '',
          owner1: item.owner1 || '',
          owner2: item.owner2 || '',
          owner3: item.owner3 || '',
          owner4: item.owner4 || '',
          owner5: item.owner5 || '',
          owner6: item.owner6 || '',
          owner7: item.owner7 || '',
          owner8: item.owner8 || '',
          owner9: item.owner9 || '',
          owner10: item.owner10 || '',
          grossSalesValue: item.grossSalesValue || 0,
          cashCollectionOutEscrow: item.cashCollectionOutEscrow || 0,
          cashCollectionWithinEscrow: item.cashCollectionWithinEscrow || 0,
          totalCashReceivedInEscrow: item.totalCashReceivedInEscrow || 0,
          totalCashFromUnitHolder: item.totalCashFromUnitHolder || 0,
          ownerBalance: item.ownerBalance || 0,
          unitStatus: item.unitStatus || '',
          oqoodPaid: item.oqoodPaid || false,
          spa: item.spa || false,
          reservationForm: item.reservationForm || false,
          oqoodAmount: item.oqoodAmount || 0,
          dldAmount: item.dldAmount || 0,
          balanceLetterSent: item.balanceLetterSent || '',
          balanceLetterIssued: item.balanceLetterIssued || '',
          remarks: item.remarks || ''
        }))
      }
    }
  },
  'unit-history': {
    id: 'unit-history',
    title: 'Unit History Report',
    fields: [
      {
        id: 'project',
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
      endpoint: '/business-objects/unit-history-report',
      method: 'POST',
      payloadFields: ['project', 'fromDate', 'toDate'],
      downloadEndpoint: '/business-objects/unit-history-report/download',
      columns: [
        { key: 'serialNo', title: 'S.No', type: 'number' },
        { key: 'unitNo', title: 'Unit Number', type: 'text' },
        { key: 'owner1', title: 'Owner 1', type: 'text' },
        { key: 'owner2', title: 'Owner 2', type: 'text' },
        { key: 'unitHistoryFlag', title: 'Unit History Flag', type: 'text' },
        { key: 'status', title: 'Status', type: 'status' }
      ],
      transformResponse: (data: any) => {
        if (!data || !data.content) {
          console.warn('Unit History transformResponse: No data or content found', data)
          return []
        }
        
        return data.content.map((item: any, index: number) => ({
          id: item.serialNo?.toString() || item.id?.toString() || index.toString(),
          serialNo: item.serialNo,
          unitNo: item.unitNo || '',
          owner1: item.owner1 || '',
          owner2: item.owner2 || '',
          unitHistoryFlag: item.unitHistoryFlag || '',
          status: item.status || ''
        }))
      }
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
  
  // Deep clone the configuration to avoid mutating the original, but preserve functions
  const configWithProjects: ReportConfiguration = {
    ...config,
    api: {
      ...config.api,
      // Preserve the transformResponse function if it exists
      ...(config.api.transformResponse && { transformResponse: config.api.transformResponse })
    },
    fields: config.fields.map(field => {
      if ((field.id === 'projectId' || field.id === 'project') && projectOptions.length > 0) {
        return { ...field, options: projectOptions }
      }
      if ((field.id === 'developerId' || field.id === 'developer') && developerOptions.length > 0) {
        return { ...field, options: developerOptions }
      }
      return field
    })
  }
  
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
