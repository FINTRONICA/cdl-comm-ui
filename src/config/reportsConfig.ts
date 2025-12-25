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
  title: 'Customer Report',
    fields: [
      {
      id: 'customerId',
      label: 'Customer ID / Name',
        type: 'select',
        required: false,
      placeholder: 'Select Customer',
      options: [] // Populate from EMS customer list (include "All")
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
    endpoint: '/ems/customer-report',
    method: 'POST',
    payloadFields: ['customerId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/customer-report/download',

    columns: [
      { key: 'customerId', title: 'Customer ID', type: 'text' },
      { key: 'customerName', title: 'Customer Name', type: 'text' },
      { key: 'customerAddress1', title: 'Customer Address 1', type: 'text' },
      { key: 'customerAddress2', title: 'Customer Address 2', type: 'text' },
      { key: 'customerAddress3', title: 'Customer Address 3', type: 'text' },
      { key: 'typeOfCustomer', title: 'Type Of Customer', type: 'text' },
      { key: 'ucc', title: 'UCC', type: 'text' },
      { key: 'solId', title: 'SOL ID', type: 'text' },
      { key: 'relationshipManagerId', title: 'Relationship Manager ID', type: 'text' },
      { key: 'relationshipManagerName', title: 'Relationship Manager Name', type: 'text' },
      { key: 'borrowerAccountNumber', title: 'Borrower Account No', type: 'text' },
      { key: 'telephone', title: 'Telephone No', type: 'text' },
      { key: 'mobileNo', title: 'Mobile No', type: 'text' },
      { key: 'email', title: 'Email ID', type: 'text' },
      { key: 'creationDate', title: 'Creation Date', type: 'date' },
      { key: 'userId', title: 'Maker User ID', type: 'text' },
      { key: 'trxStatus', title: 'Txn Status', type: 'status' },
      { key: 'recordStatus', title: 'Record Status', type: 'status' },
      { key: 'reviewerId', title: 'Reviewer ID', type: 'text' },
      { key: 'approverId', title: 'Approver ID', type: 'text' },
      { key: 'customerTypeOther', title: 'Customer Type Other', type: 'text' },
      { key: 'lastUpdated', title: 'Last Updated Date & Time', type: 'dateTime' },
      { key: 'trxName', title: 'Txn Name', type: 'text' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.customerId || index.toString(),
          customerId: item.customerId,
          customerName: item.customerName,
          customerAddress1: item.customerAddress1,
          customerAddress2: item.customerAddress2,
          customerAddress3: item.customerAddress3,
          typeOfCustomer: item.typeOfCustomer,
          ucc: item.ucc,
          solId: item.solId,
          relationshipManagerId: item.relationshipManagerId,
          relationshipManagerName: item.relationshipManagerName,
          borrowerAccountNumber: item.borrowerAccountNumber,
          telephone: item.telephone,
          mobileNo: item.mobileNo,
          email: item.email,
          creationDate: item.creationDate,
          userId: item.userId,
          trxStatus: item.trxStatus,
          recordStatus: item.recordStatus,
          reviewerId: item.reviewerId,
          approverId: item.approverId,
          customerTypeOther: item.customerTypeOther,
          lastUpdated: item.lastUpdated,
          trxName: item.trxName
        })) || []
      )
    }
  }
  },

  'partyReport': {
    id: 'partyReport',
    title: 'Party Report',
    fields: [
      {
        id: 'partyId',
        label: 'Party Number / Name',
        type: 'select',
        required: false,
        placeholder: 'Select Party',
        options: [] // Populate from EMS customer list (include "All")
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
      endpoint: '/ems/party-report',
      method: 'POST',
      payloadFields: ['partyId', 'fromDate', 'toDate'],
      downloadEndpoint: '/ems/party-report/download',
      columns: [
        { key: 'partyId', title: 'Party ID', type: 'text' },
        { key: 'partyName', title: 'Party Name', type: 'text' },
        { key: 'partyAddress1', title: 'Party Address 1', type: 'text' },
        { key: 'partyAddress2', title: 'Party Address 2', type: 'text' },
        { key: 'partyAddress3', title: 'Party Address 3', type: 'text' },
        { key: 'partyType', title: 'Party Type', type: 'text' },
        { key: 'partyCifNumber', title: 'Party CIF Number', type: 'text' },
        { key: 'solId', title: 'SOL ID', type: 'text' },
        { key: 'relationshipManagerId', title: 'Relationship Manager ID', type: 'text' },
        { key: 'relationshipManagerName', title: 'Relationship Manager Name', type: 'text' },
        { key: 'borrowerAccountNumber', title: 'Borrower Account No', type: 'text' },
        { key: 'telephone', title: 'Telephone No', type: 'text' },
        { key: 'mobileNo', title: 'Mobile No', type: 'text' },
        { key: 'email', title: 'Email ID', type: 'text' },
        { key: 'creationDate', title: 'Creation Date', type: 'date' },
        { key: 'userId', title: 'Maker User ID', type: 'text' },
        { key: 'trxStatus', title: 'Txn Status', type: 'status' },
        { key: 'recordStatus', title: 'Record Status', type: 'status' },
        { key: 'reviewerId', title: 'Reviewer ID', type: 'text' },
        { key: 'approverId', title: 'Approver ID', type: 'text' },
        { key: 'partyTypeOther', title: 'Party Type Other', type: 'text' },
        { key: 'lastUpdated', title: 'Last Updated Date & Time', type: 'dateTime' },
        { key: 'trxName', title: 'Txn Name', type: 'text' }
      ],
      transformResponse: (data: any) => {
        if (!data || !data.content) {
          return []
        }
        
        return data.content.map((item: any, index: number) => ({
          id: item.partyId || index.toString(),
          partyId: item.partyId,
          partyName: item.partyName,
          partyAddress1: item.partyAddress1,
          partyAddress2: item.partyAddress2,
          partyAddress3: item.partyAddress3,
          partyType: item.partyType,
          partyCifNumber: item.partyCifNumber,
          solId: item.solId,
          relationshipManagerId: item.relationshipManagerId,
          relationshipManagerName: item.relationshipManagerName,
          borrowerAccountNumber: item.borrowerAccountNumber,
          telephone: item.telephone,
          mobileNo: item.mobileNo,
          email: item.email,
          creationDate: item.creationDate,
          userId: item.userId,
          trxStatus: item.trxStatus,
          recordStatus: item.recordStatus,
          reviewerId: item.reviewerId,
          approverId: item.approverId,
          partyTypeOther: item.partyTypeOther,
          lastUpdated: item.lastUpdated,
          trxName: item.trxName
        }))
      }
    }
  },

  'beneficiaryReport': {
  id: 'beneficiaryReport',
  title: 'Beneficiary Report',

  fields: [
    {
      id: 'beneficiaryId',
      label: 'Beneficiary ID / Name',
      type: 'select',
        required: false,
      placeholder: 'Select Beneficiary',
      options: [] // Populate from EMS Beneficiary list (include "All")
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
    endpoint: '/ems/beneficiary-report',
      method: 'POST',
    payloadFields: ['beneficiaryId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/beneficiary-report/download',

      columns: [
      { key: 'counterpartyId', title: 'Beneficiary ID', type: 'text' },
      { key: 'counterpartyName', title: 'Beneficiary Name', type: 'text' },
      { key: 'counterpartyAddress1', title: 'Beneficiary Address 1', type: 'text' },
      { key: 'counterpartyAddress2', title: 'Beneficiary Address 2', type: 'text' },
      { key: 'counterpartyAddress3', title: 'Beneficiary Address 3', type: 'text' },
      { key: 'counterpartyRole', title: 'Role', type: 'text' },
      { key: 'roleOther', title: 'Role Other', type: 'text' },
      { key: 'accountNo', title: 'Account No', type: 'text' },
      { key: 'accountCategory', title: 'Account Category', type: 'text' },
      { key: 'ifscCodeNeftBank', title: 'IFSC NEFT Bank', type: 'text' },
      { key: 'ifscCodeRtgsBank', title: 'IFSC RTGS Bank', type: 'text' },
      { key: 'branchOutsideB', title: 'Branch Outside B', type: 'text' },
      { key: 'branchOutsideW', title: 'Branch Outside W', type: 'text' },
      { key: 'creationDate', title: 'Creation Date', type: 'date' },
      { key: 'userId', title: 'Maker User ID', type: 'text' },
      { key: 'trxStatus', title: 'Txn Status', type: 'status' },
      { key: 'recordStatus', title: 'Record Status', type: 'status' },
      { key: 'reviewerId', title: 'Reviewer ID', type: 'text' },
      { key: 'approverId', title: 'Approver ID', type: 'text' },
      { key: 'lastUpdated', title: 'Last Updated', type: 'dateTime' },
      { key: 'trxName', title: 'Txn Name', type: 'text' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.counterpartyId || index.toString(),

          counterpartyId: item.counterpartyId,
          counterpartyName: item.counterpartyName,
          counterpartyAddress1: item.counterpartyAddress1,
          counterpartyAddress2: item.counterpartyAddress2,
          counterpartyAddress3: item.counterpartyAddress3,
          counterpartyRole: item.counterpartyRole,
          roleOther: item.roleOther,
          accountNo: item.accountNo,
          accountCategory: item.accountCategory,
          ifscCodeNeftBank: item.ifscCodeNeftBank,
          ifscCodeRtgsBank: item.ifscCodeRtgsBank,
          branchOutsideB: item.branchOutsideB,
          branchOutsideW: item.branchOutsideW,
          creationDate: item.creationDate,
          userId: item.userId,
          trxStatus: item.trxStatus,
          recordStatus: item.recordStatus,
          reviewerId: item.reviewerId,
          approverId: item.approverId,
          lastUpdated: item.lastUpdated,
          trxName: item.trxName
        })) || []
      )
    }
  }
  },



  'documentReport': {
  id: 'documentReport',
  title: 'Document Report',

  fields: [
    {
      id: 'documentId',
      label: 'Document ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Document',
      options: [] // Populate from EMS Document list (include "All")
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
    endpoint: '/ems/document-report',
    method: 'POST',
    payloadFields: ['documentId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/document-report/download',

    columns: [
      { key: 'documentId', title: 'Document ID', type: 'text' },
      { key: 'documentName', title: 'Document Name', type: 'text' },
      { key: 'documentDescription', title: 'Document Description', type: 'text' },
      { key: 'creationDate', title: 'Creation Date', type: 'date' },
      { key: 'userId', title: 'User ID', type: 'text' },
      { key: 'trxStatus', title: 'Txn Status', type: 'status' },
      { key: 'recordStatus', title: 'Record Status', type: 'status' },
      { key: 'reviewerId', title: 'Reviewer ID', type: 'text' },
      { key: 'approverId', title: 'Approver ID', type: 'text' },
      { key: 'lastUpdated', title: 'Last Updated', type: 'dateTime' },
      { key: 'trxName', title: 'Txn Name', type: 'text' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.documentId || index.toString(),

          documentId: item.documentId,
          documentName: item.documentName,
          documentDescription: item.documentDescription,
          creationDate: item.creationDate,
          userId: item.userId,
          trxStatus: item.trxStatus,
          recordStatus: item.recordStatus,
          reviewerId: item.reviewerId,
          approverId: item.approverId,
          lastUpdated: item.lastUpdated,
          trxName: item.trxName
        })) || []
      )
    }
  }
  },

  'dealSegmentReport': {
  id: 'dealSegmentReport',
  title: 'Deal Segment Report',

  fields: [
    {
      id: 'dealSegmentId',
      label: 'Deal Segment ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Deal Segment',
      options: [] // Populate from EMS Deal Segment list (include "All")
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
    endpoint: '/ems/deal-segment-report',
    method: 'POST',
    payloadFields: ['dealSegmentId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/deal-segment-report/download',

    columns: [
      { key: 'dealSegmentId', title: 'Deal Segment ID', type: 'text' },
      { key: 'dealSegmentName', title: 'Deal Segment Name', type: 'text' },
      { key: 'dealSegmentDescription', title: 'Deal Segment Description', type: 'text' },
      { key: 'creationDate', title: 'Creation Date', type: 'date' },
      { key: 'userId', title: 'User ID', type: 'text' },
      { key: 'trxStatus', title: 'Txn Status', type: 'status' },
      { key: 'recordStatus', title: 'Record Status', type: 'status' },
      { key: 'reviewerId', title: 'Reviewer ID', type: 'text' },
      { key: 'approverId', title: 'Approver ID', type: 'text' },
      { key: 'lastUpdated', title: 'Last Updated', type: 'dateTime' },
      { key: 'trxName', title: 'Txn Name', type: 'text' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.dealSegmentId || index.toString(),

          dealSegmentId: item.dealSegmentId,
          dealSegmentName: item.dealSegmentName,
          dealSegmentDescription: item.dealSegmentDescription,
          creationDate: item.creationDate,
          userId: item.userId,
          trxStatus: item.trxStatus,
          recordStatus: item.recordStatus,
          reviewerId: item.reviewerId,
          approverId: item.approverId,
          lastUpdated: item.lastUpdated,
          trxName: item.trxName
        })) || []
      )
    }
  }
  },

  'dealInitiationReport': {
  id: 'dealInitiationReport',
  title: 'Deal Initiation Report',

  fields: [
    {
      id: 'dealId',
      label: 'Deal ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Deal',
      options: [] // Populate from EMS Deal list (include "All")
    },
    {
      id: 'customerId',
      label: 'Customer ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Customer',
      options: [] // Populate from EMS Customer list (include "All")
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
    endpoint: '/ems/deal-initiation-report',
    method: 'POST',
    payloadFields: ['dealId', 'customerId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/deal-initiation-report/download',

    columns: [
      { key: 'dealNumber', title: 'Deal Number / Name', type: 'text' },
      { key: 'branchSolId', title: 'Branch SOL ID', type: 'text' },
      { key: 'branchName', title: 'Branch Name', type: 'text' },
      { key: 'branchState', title: 'Branch State', type: 'text' },
      { key: 'dealSegmentName', title: 'Deal Segment Name', type: 'text' },
      { key: 'creationDate', title: 'Creation Date', type: 'date' },
      { key: 'typeOfAgreement', title: 'Type Of Agreement', type: 'text' },
      { key: 'businessGrp', title: 'Business Group', type: 'text' },
      { key: 'businessSubGrp', title: 'Business Sub Group', type: 'text' },
      { key: 'typeOfDeal', title: 'Type Of Deal', type: 'text' },
      { key: 'clientName', title: 'Client Name', type: 'text' },
      { key: 'customerIdName', title: 'Customer ID / Name', type: 'text' },
      { key: 'ucc', title: 'UCC', type: 'text' },
      { key: 'existingClient', title: 'Existing Client', type: 'text' },
      { key: 'acctType', title: 'Account Type', type: 'text' },
      { key: 'acctNum', title: 'Account Number', type: 'text' },
      { key: 'dealType', title: 'Deal Type', type: 'text' },
      { key: 'smEmpId', title: 'SM Emp ID', type: 'text' },
      { key: 'smEmpName', title: 'SM Emp Name', type: 'text' },
      { key: 'smManagerId', title: 'SM Manager ID', type: 'text' },
      { key: 'smManagerName', title: 'SM Manager Name', type: 'text' },
      { key: 'rmEmpId', title: 'RM Emp ID', type: 'text' },
      { key: 'rmEmpName', title: 'RM Emp Name', type: 'text' },
      { key: 'remarksNotes', title: 'Remarks', type: 'text' },
      { key: 'procFeeUp', title: 'Processing Fee Up', type: 'text' },
      { key: 'procFeePer', title: 'Processing Fee Per', type: 'text' },
        { key: 'frequency', title: 'Frequency', type: 'text' },
      { key: 'addedFeeTxn', title: 'Added Fee Txn', type: 'text' },
      { key: 'feeDescription', title: 'Fee Description', type: 'text' },
      { key: 'safeCustLoc', title: 'Safe Cust Location', type: 'text' },
      { key: 'safeCustStatus', title: 'Safe Cust Status', type: 'text' },
      { key: 'trxStatus', title: 'Txn Status', type: 'status' },
      { key: 'trxStatusVerify', title: 'Txn Status Verify', type: 'status' },
      { key: 'recordStatus', title: 'Record Status', type: 'status' },
      { key: 'trxName', title: 'Txn Name', type: 'text' },
      { key: 'lastUpdated', title: 'Last Updated', type: 'dateTime' },
      { key: 'userIdBranch', title: 'User ID Branch', type: 'text' },
      { key: 'userIdVerifier', title: 'User ID Verifier', type: 'text' },
      { key: 'reviewerIdVerifier', title: 'Reviewer ID Verifier', type: 'text' },
      { key: 'approverIdVerifier', title: 'Approver ID Verifier', type: 'text' }
    ],

      transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.dealNumber || index.toString(),

          dealNumber: item.dealNumber,
          branchSolId: item.branchSolId,
          branchName: item.branchName,
          branchState: item.branchState,
          dealSegmentName: item.dealSegmentName,
          creationDate: item.creationDate,
          typeOfAgreement: item.typeOfAgreement,
          businessGrp: item.businessGrp,
          businessSubGrp: item.businessSubGrp,
          typeOfDeal: item.typeOfDeal,
          clientName: item.clientName,
          customerIdName: item.customerIdName,
          ucc: item.ucc,
          existingClient: item.existingClient,
          acctType: item.acctType,
          acctNum: item.acctNum,
          dealType: item.dealType,
          smEmpId: item.smEmpId,
          smEmpName: item.smEmpName,
          smManagerId: item.smManagerId,
          smManagerName: item.smManagerName,
          rmEmpId: item.rmEmpId,
          rmEmpName: item.rmEmpName,
          remarksNotes: item.remarksNotes,
          procFeeUp: item.procFeeUp,
          procFeePer: item.procFeePer,
          frequency: item.frequency,
          addedFeeTxn: item.addedFeeTxn,
          feeDescription: item.feeDescription,
          safeCustLoc: item.safeCustLoc,
          safeCustStatus: item.safeCustStatus,
          trxStatus: item.trxStatus,
          trxStatusVerify: item.trxStatusVerify,
          recordStatus: item.recordStatus,
          trxName: item.trxName,
          lastUpdated: item.lastUpdated,
          userIdBranch: item.userIdBranch,
          userIdVerifier: item.userIdVerifier,
          reviewerIdVerifier: item.reviewerIdVerifier,
          approverIdVerifier: item.approverIdVerifier
        })) || []
      )
    }
  }
  },

  'dealVerificationReport': {
  id: 'dealVerificationReport',
  title: 'Deal Verification Report',

  fields: [
    {
      id: 'dealId',
      label: 'Deal ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Deal',
      options: [] // Populate from EMS Deal list (include "All")
    },
    {
      id: 'customerId',
      label: 'Customer ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Customer',
      options: [] // Populate from EMS Customer list (include "All")
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
    endpoint: '/ems/deal-verification-report',
    method: 'POST',
    payloadFields: ['dealId', 'customerId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/deal-verification-report/download',

    columns: [
      { key: 'dealNumber', title: 'Deal Number / Name', type: 'text' },
      { key: 'branchSolId', title: 'Branch SOL ID', type: 'text' },
      { key: 'branchName', title: 'Branch Name', type: 'text' },
      { key: 'branchState', title: 'Branch State', type: 'text' },
      { key: 'dealSegmentName', title: 'Deal Segment Name', type: 'text' },
      { key: 'creationDate', title: 'Creation Date', type: 'date' },
      { key: 'typeOfAgreement', title: 'Type Of Agreement', type: 'text' },
      { key: 'businessGrp', title: 'Business Group', type: 'text' },
      { key: 'businessSubGrp', title: 'Business Sub Group', type: 'text' },
      { key: 'typeOfDeal', title: 'Type Of Deal', type: 'text' },
      { key: 'clientName', title: 'Client Name', type: 'text' },
      { key: 'customerIdName', title: 'Customer ID / Name', type: 'text' },
      { key: 'ucc', title: 'UCC', type: 'text' },
      { key: 'existingClient', title: 'Existing Client', type: 'text' },
      { key: 'acctType', title: 'Account Type', type: 'text' },
      { key: 'acctNum', title: 'Account Number', type: 'text' },
      { key: 'dealType', title: 'Deal Type', type: 'text' },
      { key: 'smEmpId', title: 'SM Emp ID', type: 'text' },
      { key: 'smEmpName', title: 'SM Emp Name', type: 'text' },
      { key: 'smManagerId', title: 'SM Manager ID', type: 'text' },
      { key: 'smManagerName', title: 'SM Manager Name', type: 'text' },
      { key: 'rmEmpId', title: 'RM Emp ID', type: 'text' },
      { key: 'rmEmpName', title: 'RM Emp Name', type: 'text' },
      { key: 'remarksNotes', title: 'Remarks', type: 'text' },
      { key: 'procFeeUp', title: 'Processing Fee Up', type: 'text' },
      { key: 'procFeePer', title: 'Processing Fee Per', type: 'text' },
      { key: 'frequency', title: 'Frequency', type: 'text' },
      { key: 'addedFeeTxn', title: 'Added Fee Txn', type: 'text' },
      { key: 'feeDescription', title: 'Fee Description', type: 'text' },
      { key: 'safeCustLoc', title: 'Safe Cust Location', type: 'text' },
      { key: 'safeCustStatus', title: 'Safe Cust Status', type: 'text' },
      { key: 'trxStatus', title: 'Txn Status', type: 'status' },
      { key: 'trxStatusVerify', title: 'Txn Status Verify', type: 'status' },
      { key: 'recordStatus', title: 'Record Status', type: 'status' },
      { key: 'trxName', title: 'Txn Name', type: 'text' },
      { key: 'lastUpdated', title: 'Last Updated', type: 'dateTime' },
      { key: 'userIdBranch', title: 'User ID Branch', type: 'text' },
      { key: 'userIdVerifier', title: 'User ID Verifier', type: 'text' },
      { key: 'reviewerIdVerifier', title: 'Reviewer ID Verifier', type: 'text' },
      { key: 'approverIdVerifier', title: 'Approver ID Verifier', type: 'text' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.dealNumber || index.toString(),

          dealNumber: item.dealNumber,
          branchSolId: item.branchSolId,
          branchName: item.branchName,
          branchState: item.branchState,
          dealSegmentName: item.dealSegmentName,
          creationDate: item.creationDate,
          typeOfAgreement: item.typeOfAgreement,
          businessGrp: item.businessGrp,
          businessSubGrp: item.businessSubGrp,
          typeOfDeal: item.typeOfDeal,
          clientName: item.clientName,
          customerIdName: item.customerIdName,
          ucc: item.ucc,
          existingClient: item.existingClient,
          acctType: item.acctType,
          acctNum: item.acctNum,
          dealType: item.dealType,
          smEmpId: item.smEmpId,
          smEmpName: item.smEmpName,
          smManagerId: item.smManagerId,
          smManagerName: item.smManagerName,
          rmEmpId: item.rmEmpId,
          rmEmpName: item.rmEmpName,
          remarksNotes: item.remarksNotes,
          procFeeUp: item.procFeeUp,
          procFeePer: item.procFeePer,
          frequency: item.frequency,
          addedFeeTxn: item.addedFeeTxn,
          feeDescription: item.feeDescription,
          safeCustLoc: item.safeCustLoc,
          safeCustStatus: item.safeCustStatus,
          trxStatus: item.trxStatus,
          trxStatusVerify: item.trxStatusVerify,
          recordStatus: item.recordStatus,
          trxName: item.trxName,
          lastUpdated: item.lastUpdated,
          userIdBranch: item.userIdBranch,
          userIdVerifier: item.userIdVerifier,
          reviewerIdVerifier: item.reviewerIdVerifier,
          approverIdVerifier: item.approverIdVerifier
        })) || []
      )
    }
  }
  },

  'accountOpeningReport': {
  id: 'accountOpeningReport',
  title: 'Account Opening Report',

  fields: [
    {
      id: 'dealId',
      label: 'Deal ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Deal',
      options: [] // Populate from EMS Deal list (include "All")
    },
    {
      id: 'customerId',
      label: 'Customer ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Customer',
      options: [] // Populate from EMS Customer list (include "All")
    },
    {
      id: 'accountNumber',
      label: 'Account Number',
      type: 'text',
      required: false,
      placeholder: 'Enter Account Number'
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
    endpoint: '/ems/account-opening-report',
    method: 'POST',
    payloadFields: [
      'dealId',
      'customerId',
      'accountNumber',
      'fromDate',
      'toDate'
    ],

    downloadEndpoint: '/ems/account-opening-report/download',

    columns: [
      { key: 'dealNumber', title: 'Deal Number / Name', type: 'text' },
      { key: 'customerIdName', title: 'Customer ID / Name', type: 'text' },
      { key: 'accRefNumber', title: 'Account Reference Number', type: 'text' },
      { key: 'creationDate', title: 'Creation Date', type: 'date' },
      { key: 'notify', title: 'Notify', type: 'text' },
      { key: 'trxStatusAccOpen', title: 'Txn Status Acc Open', type: 'status' },
      { key: 'trxStatusCibPriv', title: 'Txn Status CIB Priv', type: 'status' },
      { key: 'recordStatus', title: 'Record Status', type: 'status' },
      { key: 'trxName', title: 'Txn Name', type: 'text' },
      { key: 'lastUpdated', title: 'Last Updated', type: 'dateTime' },
      { key: 'userIdAccOpen', title: 'User ID Acc Open', type: 'text' },
      { key: 'reviewerIdAccOpen', title: 'Reviewer ID Acc Open', type: 'text' },
      { key: 'approverIdAccOpen', title: 'Approver ID Acc Open', type: 'text' },
      { key: 'userIdCibPriv', title: 'User ID CIB Priv', type: 'text' },
      { key: 'reviewerIdCibPriv', title: 'Reviewer ID CIB Priv', type: 'text' },
      { key: 'approverIdCibPriv', title: 'Approver ID CIB Priv', type: 'text' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.accRefNumber || index.toString(),

          dealNumber: item.dealNumber,
          customerIdName: item.customerIdName,
          accRefNumber: item.accRefNumber,
          creationDate: item.creationDate,
          notify: item.notify,
          trxStatusAccOpen: item.trxStatusAccOpen,
          trxStatusCibPriv: item.trxStatusCibPriv,
          recordStatus: item.recordStatus,
          trxName: item.trxName,
          lastUpdated: item.lastUpdated,
          userIdAccOpen: item.userIdAccOpen,
          reviewerIdAccOpen: item.reviewerIdAccOpen,
          approverIdAccOpen: item.approverIdAccOpen,
          userIdCibPriv: item.userIdCibPriv,
          reviewerIdCibPriv: item.reviewerIdCibPriv,
          approverIdCibPriv: item.approverIdCibPriv
        })) || []
      )
    }
  }
  },

  'dealBasedRuleReport': {
  id: 'dealBasedRuleReport',
  title: 'Deal Based Rule Report',

  fields: [
    {
      id: 'dealId',
      label: 'Deal ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Deal',
      options: [] // Populate from EMS Deal list (include "All")
    },
    {
      id: 'customerId',
      label: 'Customer ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Customer',
      options: [] // Populate from EMS Customer list (include "All")
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
    endpoint: '/ems/deal-based-rule-report',
    method: 'POST',
    payloadFields: ['dealId', 'customerId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/deal-based-rule-report/download',

    columns: [
      { key: 'dealNumber', title: 'Deal Number / Name', type: 'text' },
      { key: 'creationDate', title: 'Creation Date', type: 'date' },
      { key: 'expiryDate', title: 'Expiry Date', type: 'date' },
      { key: 'customerIdName', title: 'Customer ID / Name', type: 'text' },
      { key: 'lastUpdated', title: 'Last Updated', type: 'dateTime' },
      { key: 'trxNameAccBl', title: 'Txn Name Acc BL', type: 'text' },

      { key: 'amendmentAllowed', title: 'Amendment Allowed', type: 'boolean' },
      { key: 'exceptionAllowed', title: 'Exception Allowed', type: 'boolean' },
      { key: 'budgetMonitored', title: 'Budget Monitored', type: 'boolean' },

      { key: 'reraDeclaration', title: 'RERA Declaration', type: 'text' },
      { key: 'reraFrequency', title: 'RERA Frequency', type: 'text' },
      { key: 'reraStartDate', title: 'RERA Start Date', type: 'date' },
      { key: 'reraReceivedDate', title: 'RERA Received Date', type: 'date' },

      { key: 'overallBudgetAmount', title: 'Overall Budget Amount', type: 'number' },

      { key: 'transactionProcessing', title: 'Transaction Processing', type: 'boolean' },
      { key: 'uploadProcessing', title: 'Upload Processing', type: 'boolean' },

      { key: 'emailAlertsToBorrower', title: 'Email Alerts To Borrower', type: 'boolean' },
      { key: 'smsAlertsToBorrower', title: 'SMS Alerts To Borrower', type: 'boolean' },

      { key: 'ppRtgs', title: 'PP RTGS', type: 'boolean' },
      { key: 'ppNeft', title: 'PP NEFT', type: 'boolean' },
      { key: 'ppImps', title: 'PP IMPS', type: 'boolean' },
      { key: 'ppDraftOrPo', title: 'PP Draft / PO', type: 'boolean' },
      { key: 'ppAccountTransfer', title: 'PP Account Transfer', type: 'boolean' },

      { key: 'ppiCertificateReminder', title: 'PPI Certificate Reminder', type: 'boolean' },
      { key: 'ppiCertificateFrequency', title: 'PPI Certificate Frequency', type: 'text' },
      { key: 'ppiStartDate', title: 'PPI Start Date', type: 'date' },
      { key: 'ppiReceivedDate', title: 'PPI Received Date', type: 'date' },

      { key: 'txnOverrideAllowed', title: 'Txn Override Allowed', type: 'boolean' },

      { key: 'investments', title: 'Investments', type: 'boolean' },
      { key: 'realTimeGrossSettlement', title: 'Real Time Gross Settlement', type: 'boolean' },
      { key: 'nationalElectronicFundsTransfer', title: 'National Electronic Funds Transfer', type: 'boolean' },
      { key: 'immediatePaymentService', title: 'Immediate Payment Service', type: 'boolean' },

      { key: 'draftOrPo', title: 'Draft / PO', type: 'boolean' },
      { key: 'accountTransfer', title: 'Account Transfer', type: 'boolean' },

      { key: 'trxStatusAccBl', title: 'Txn Status Acc BL', type: 'status' },
      { key: 'reviewerRemarksAccBased', title: 'Reviewer Remarks Acc Based', type: 'text' },
      { key: 'approverRemarksAccBased', title: 'Approver Remarks Acc Based', type: 'text' },
      { key: 'reviewerIdAccBased', title: 'Reviewer ID Acc Based', type: 'text' },
      { key: 'approverIdAccBased', title: 'Approver ID Acc Based', type: 'text' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.dealNumber || index.toString(),

          dealNumber: item.dealNumber,
          creationDate: item.creationDate,
          expiryDate: item.expiryDate,
          customerIdName: item.customerIdName,
          lastUpdated: item.lastUpdated,
          trxNameAccBl: item.trxNameAccBl,

          amendmentAllowed: item.amendmentAllowed,
          exceptionAllowed: item.exceptionAllowed,
          budgetMonitored: item.budgetMonitored,

          reraDeclaration: item.reraDeclaration,
          reraFrequency: item.reraFrequency,
          reraStartDate: item.reraStartDate,
          reraReceivedDate: item.reraReceivedDate,

          overallBudgetAmount: item.overallBudgetAmount,

          transactionProcessing: item.transactionProcessing,
          uploadProcessing: item.uploadProcessing,

          emailAlertsToBorrower: item.emailAlertsToBorrower,
          smsAlertsToBorrower: item.smsAlertsToBorrower,

          ppRtgs: item.ppRtgs,
          ppNeft: item.ppNeft,
          ppImps: item.ppImps,
          ppDraftOrPo: item.ppDraftOrPo,
          ppAccountTransfer: item.ppAccountTransfer,

          ppiCertificateReminder: item.ppiCertificateReminder,
          ppiCertificateFrequency: item.ppiCertificateFrequency,
          ppiStartDate: item.ppiStartDate,
          ppiReceivedDate: item.ppiReceivedDate,

          txnOverrideAllowed: item.txnOverrideAllowed,

          investments: item.investments,
          realTimeGrossSettlement: item.realTimeGrossSettlement,
          nationalElectronicFundsTransfer: item.nationalElectronicFundsTransfer,
          immediatePaymentService: item.immediatePaymentService,

          draftOrPo: item.draftOrPo,
          accountTransfer: item.accountTransfer,

          trxStatusAccBl: item.trxStatusAccBl,
          reviewerRemarksAccBased: item.reviewerRemarksAccBased,
          approverRemarksAccBased: item.approverRemarksAccBased,
          reviewerIdAccBased: item.reviewerIdAccBased,
          approverIdAccBased: item.approverIdAccBased
        })) || []
      )
    }
  }
  },

  'dealClosureReport': {
  id: 'dealClosureReport',
  title: 'Deal Closure Report',

  fields: [
    {
      id: 'dealId',
      label: 'Deal ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Deal',
      options: [] // Populate from EMS Deal list (include "All")
    },
    {
      id: 'customerId',
      label: 'Customer ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Customer',
      options: [] // Populate from EMS Customer list (include "All")
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
    endpoint: '/ems/deal-closure-report',
    method: 'POST',
    payloadFields: ['dealId', 'customerId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/deal-closure-report/download',

    columns: [
      { key: 'dealNumber', title: 'Deal Number / Name', type: 'text' },
      { key: 'customerIdName', title: 'Customer ID / Name', type: 'text' },
      { key: 'trxStatusClosure', title: 'Txn Status Closure', type: 'status' },
      { key: 'dealClosure', title: 'Deal Closure', type: 'text' },
      { key: 'transferFundsTo', title: 'Transfer Funds To', type: 'text' },
      { key: 'remarksClosure', title: 'Remarks (Closure)', type: 'text' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.dealNumber || index.toString(),

          dealNumber: item.dealNumber,
          customerIdName: item.customerIdName,
          trxStatusClosure: item.trxStatusClosure,
          dealClosure: item.dealClosure,
          transferFundsTo: item.transferFundsTo,
          remarksClosure: item.remarksClosure
        })) || []
      )
    }
  }
  },

  'dealAmendmentReport': {
  id: 'dealAmendmentReport',
  title: 'Deal Amendment Report',

  fields: [
    {
      id: 'dealId',
      label: 'Deal ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Deal',
      options: [] // Populate from EMS Deal list (include "All")
    },
    {
      id: 'customerId',
      label: 'Customer ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Customer',
      options: [] // Populate from EMS Customer list (include "All")
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
    endpoint: '/ems/deal-amendment-report',
    method: 'POST',
    payloadFields: ['dealId', 'customerId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/deal-amendment-report/download',

    columns: [
      { key: 'amendRefNumber', title: 'Amend Ref Number', type: 'text' },
      { key: 'dealNumber', title: 'Deal Number / Name', type: 'text' },
      { key: 'typeOfAmendment', title: 'Type Of Amendment', type: 'text' },
      { key: 'branchSolId', title: 'Branch SOL ID', type: 'text' },
      { key: 'branchName', title: 'Branch Name', type: 'text' },
      { key: 'branchState', title: 'Branch State', type: 'text' },
      { key: 'dealSegmentName', title: 'Deal Segment Name', type: 'text' },
      { key: 'creationDate', title: 'Creation Date', type: 'date' },
      { key: 'expiryDate', title: 'Expiry Date', type: 'date' },
      { key: 'typeOfAgreement', title: 'Type Of Agreement', type: 'text' },
      { key: 'businessGrp', title: 'Business Group', type: 'text' },
      { key: 'businessSubGrp', title: 'Business Sub Group', type: 'text' },
      { key: 'typeOfDeal', title: 'Type Of Deal', type: 'text' },
      { key: 'clientName', title: 'Client Name', type: 'text' },
      { key: 'customerIdName', title: 'Customer ID / Name', type: 'text' },
      { key: 'customerRole', title: 'Customer Role', type: 'text' },
      { key: 'ucc', title: 'UCC', type: 'text' },
      { key: 'existingClient', title: 'Existing Client', type: 'text' },
      { key: 'acctType', title: 'Account Type', type: 'text' },
      { key: 'acctNum', title: 'Account Number', type: 'text' },
      { key: 'otherBusinessSubGrp', title: 'Other Business Sub Group', type: 'text' },
      { key: 'dealType', title: 'Deal Type', type: 'text' },
      { key: 'smEmpId', title: 'SM Emp ID', type: 'text' },
      { key: 'smEmpName', title: 'SM Emp Name', type: 'text' },
      { key: 'smManagerId', title: 'SM Manager ID', type: 'text' },
      { key: 'smManagerName', title: 'SM Manager Name', type: 'text' },
      { key: 'procFeePer', title: 'Processing Fee Per', type: 'text' },
      { key: 'frequency', title: 'Frequency', type: 'text' },
      { key: 'addFeeTrx', title: 'Add Fee Trx', type: 'text' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.amendRefNumber || index.toString(),

          amendRefNumber: item.amendRefNumber,
          dealNumber: item.dealNumber,
          typeOfAmendment: item.typeOfAmendment,
          branchSolId: item.branchSolId,
          branchName: item.branchName,
          branchState: item.branchState,
          dealSegmentName: item.dealSegmentName,
          creationDate: item.creationDate,
          expiryDate: item.expiryDate,
          typeOfAgreement: item.typeOfAgreement,
          businessGrp: item.businessGrp,
          businessSubGrp: item.businessSubGrp,
          typeOfDeal: item.typeOfDeal,
          clientName: item.clientName,
          customerIdName: item.customerIdName,
          customerRole: item.customerRole,
          ucc: item.ucc,
          existingClient: item.existingClient,
          acctType: item.acctType,
          acctNum: item.acctNum,
          otherBusinessSubGrp: item.otherBusinessSubGrp,
          dealType: item.dealType,
          smEmpId: item.smEmpId,
          smEmpName: item.smEmpName,
          smManagerId: item.smManagerId,
          smManagerName: item.smManagerName,
          procFeePer: item.procFeePer,
          frequency: item.frequency,
          addFeeTrx: item.addFeeTrx
        })) || []
      )
    }
  }
  },

  'dealAmendmentVerificationReport': {
  id: 'dealAmendmentVerificationReport',
  title: 'Deal Amendment Verification Report',

  fields: [
    {
      id: 'dealId',
      label: 'Deal ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Deal',
      options: [] // Populate from EMS Deal list (include "All")
    },
    {
      id: 'customerId',
      label: 'Customer ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Customer',
      options: [] // Populate from EMS Customer list (include "All")
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
    endpoint: '/ems/deal-amendment-verification-report',
    method: 'POST',
    payloadFields: ['dealId', 'customerId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/deal-amendment-verification-report/download',

    columns: [
      { key: 'amendRefNumber', title: 'Amend Ref Number', type: 'text' },
      { key: 'dealNumber', title: 'Deal Number / Name', type: 'text' },
      { key: 'typeOfAmendment', title: 'Type Of Amendment', type: 'text' },
      { key: 'branchSolId', title: 'Branch SOL ID', type: 'text' },
      { key: 'branchName', title: 'Branch Name', type: 'text' },
      { key: 'dealSegmentName', title: 'Deal Segment Name', type: 'text' },
      { key: 'branchState', title: 'Branch State', type: 'text' },
      { key: 'creationDate', title: 'Creation Date', type: 'date' },
      { key: 'expiryDate', title: 'Expiry Date', type: 'date' },
      { key: 'typeOfAgreement', title: 'Type Of Agreement', type: 'text' },
      { key: 'businessGrp', title: 'Business Group', type: 'text' },
      { key: 'businessSubGrp', title: 'Business Sub Group', type: 'text' },
      { key: 'typeOfDeal', title: 'Type Of Deal', type: 'text' },
      { key: 'clientName', title: 'Client Name', type: 'text' },
      { key: 'customerIdName', title: 'Customer ID / Name', type: 'text' },
      { key: 'customerRole', title: 'Customer Role', type: 'text' },
      { key: 'ucc', title: 'UCC', type: 'text' },
      { key: 'existingClient', title: 'Existing Client', type: 'text' },
      { key: 'acctType', title: 'Account Type', type: 'text' },
      { key: 'acctNum', title: 'Account Number', type: 'text' },
      { key: 'otherBusinessSubGrp', title: 'Other Business Sub Group', type: 'text' },
      { key: 'dealType', title: 'Deal Type', type: 'text' },
      { key: 'smEmpId', title: 'SM Emp ID', type: 'text' },
      { key: 'smEmpName', title: 'SM Emp Name', type: 'text' },
      { key: 'smManagerId', title: 'SM Manager ID', type: 'text' },
      { key: 'smManagerName', title: 'SM Manager Name', type: 'text' },
      { key: 'rmEmpId', title: 'RM Emp ID', type: 'text' },
      { key: 'rmEmpName', title: 'RM Emp Name', type: 'text' },
      { key: 'remarksNotes', title: 'Remarks', type: 'text' },
      { key: 'procFeeUp', title: 'Processing Fee Up', type: 'text' },
      { key: 'procFeePer', title: 'Processing Fee Per', type: 'text' },
      { key: 'reminderDueDate', title: 'Reminder Due Date', type: 'date' },
      { key: 'feeDescription', title: 'Fee Description', type: 'text' },
      { key: 'safeCustLoc', title: 'Safe Cust Location', type: 'text' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.amendRefNumber || index.toString(),

          amendRefNumber: item.amendRefNumber,
          dealNumber: item.dealNumber,
          typeOfAmendment: item.typeOfAmendment,
          branchSolId: item.branchSolId,
          branchName: item.branchName,
          dealSegmentName: item.dealSegmentName,
          branchState: item.branchState,
          creationDate: item.creationDate,
          expiryDate: item.expiryDate,
          typeOfAgreement: item.typeOfAgreement,
          businessGrp: item.businessGrp,
          businessSubGrp: item.businessSubGrp,
          typeOfDeal: item.typeOfDeal,
          clientName: item.clientName,
          customerIdName: item.customerIdName,
          customerRole: item.customerRole,
          ucc: item.ucc,
          existingClient: item.existingClient,
          acctType: item.acctType,
          acctNum: item.acctNum,
          otherBusinessSubGrp: item.otherBusinessSubGrp,
          dealType: item.dealType,
          smEmpId: item.smEmpId,
          smEmpName: item.smEmpName,
          smManagerId: item.smManagerId,
          smManagerName: item.smManagerName,
          rmEmpId: item.rmEmpId,
          rmEmpName: item.rmEmpName,
          remarksNotes: item.remarksNotes,
          procFeeUp: item.procFeeUp,
          procFeePer: item.procFeePer,
          reminderDueDate: item.reminderDueDate,
          feeDescription: item.feeDescription,
          safeCustLoc: item.safeCustLoc
        })) || []
      )
    }
  }
  },

  'dealAmendmentBasedRuleReport': {
  id: 'dealAmendmentBasedRuleReport',
  title: 'Deal Amendment Based Rule Report',

  fields: [
    {
      id: 'dealId',
      label: 'Deal ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Deal',
      options: [] // Populate from EMS Deal list (include "All")
    },
    {
      id: 'customerId',
      label: 'Customer ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Customer',
      options: [] // Populate from EMS Customer list (include "All")
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
    endpoint: '/ems/deal-amendment-based-rule-report',
    method: 'POST',
    payloadFields: ['dealId', 'customerId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/deal-amendment-based-rule-report/download',

    columns: [
      { key: 'amendRefNumber', title: 'Amend Ref Number', type: 'text' },
      { key: 'dealNumber', title: 'Deal Number / Name', type: 'text' },
      { key: 'customerIdName', title: 'Customer ID / Name', type: 'text' },
      { key: 'recordStatus', title: 'Record Status', type: 'status' },
      { key: 'trxNameDealAmendBl', title: 'Txn Name Deal Amend BL', type: 'text' },
      { key: 'amendmentAllowed', title: 'Amendment Allowed', type: 'boolean' },
      { key: 'clientName', title: 'Client Name', type: 'text' },
      { key: 'exceptionAllowed', title: 'Exception Allowed', type: 'boolean' },
      { key: 'budgetMonitored', title: 'Budget Monitored', type: 'boolean' },
      {
        key: 'immediatePaymentService',
        title: 'Immediate Payment Service',
        type: 'boolean'
      }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.amendRefNumber || index.toString(),

          amendRefNumber: item.amendRefNumber,
          dealNumber: item.dealNumber,
          customerIdName: item.customerIdName,
          recordStatus: item.recordStatus,
          trxNameDealAmendBl: item.trxNameDealAmendBl,
          amendmentAllowed: item.amendmentAllowed,
          clientName: item.clientName,
          exceptionAllowed: item.exceptionAllowed,
          budgetMonitored: item.budgetMonitored,
          immediatePaymentService: item.immediatePaymentService
        })) || []
      )
    }
  }
  },

  'createFundingAndSIReport': {
  id: 'createFundingAndSIReport',
  title: 'Create Funding and SI Report',

  fields: [
    {
      id: 'dealId',
      label: 'Deal ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Deal',
      options: [] // Populate from EMS Deal list (include "All")
    },
    {
      id: 'customerId',
      label: 'Customer ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Customer',
      options: [] // Populate from EMS Customer list (include "All")
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
    endpoint: '/ems/create-funding-si-report',
    method: 'POST',
    payloadFields: ['dealId', 'customerId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/create-funding-si-report/download',

    columns: [
      { key: 'ruleRefNo', title: 'Rule Ref No', type: 'text' },
      { key: 'dealNumber', title: 'Deal Number / Name', type: 'text' },
      { key: 'customerIdName', title: 'Customer ID / Name', type: 'text' },
      { key: 'clientName', title: 'Client Name', type: 'text' },
      { key: 'fromAccount', title: 'From Account', type: 'text' },
      { key: 'amountCap', title: 'Amount Cap', type: 'number' },
      { key: 'transferType', title: 'Transfer Type', type: 'text' },
      { key: 'execution', title: 'Execution', type: 'text' },
      { key: 'resetCounter', title: 'Reset Counter', type: 'number' },
      { key: 'occurrence', title: 'Occurrence', type: 'number' },
      { key: 'recurringFrequency', title: 'Recurring Frequency', type: 'text' },
      { key: 'firstTxnDate', title: 'First Txn Date', type: 'date' },
      { key: 'capValidation', title: 'Cap Validation', type: 'boolean' },
      { key: 'retryDays', title: 'Retry Days', type: 'number' },
      { key: 'dependenceRuleNo', title: 'Dependence Rule No', type: 'text' },

      { key: 'toAccount1', title: 'To Account 1', type: 'text' },
      { key: 'toAccount2', title: 'To Account 2', type: 'text' },
      { key: 'toAccount3', title: 'To Account 3', type: 'text' },
      { key: 'toAccount4', title: 'To Account 4', type: 'text' },
      { key: 'toAccount5', title: 'To Account 5', type: 'text' },

      { key: 'amountCapCredit1', title: 'Amount Cap Credit 1', type: 'number' },
      { key: 'amountCapCredit2', title: 'Amount Cap Credit 2', type: 'number' },
      { key: 'amountCapCredit3', title: 'Amount Cap Credit 3', type: 'number' },
      { key: 'amountCapCredit4', title: 'Amount Cap Credit 4', type: 'number' },
      { key: 'amountCapCredit5', title: 'Amount Cap Credit 5', type: 'number' },

      { key: 'priorityAmountCap1', title: 'Priority Amount Cap 1', type: 'number' },
      { key: 'priorityAmountCap2', title: 'Priority Amount Cap 2', type: 'number' },
      { key: 'priorityAmountCap3', title: 'Priority Amount Cap 3', type: 'number' },
      { key: 'priorityAmountCap4', title: 'Priority Amount Cap 4', type: 'number' },
      { key: 'priorityAmountCap5', title: 'Priority Amount Cap 5', type: 'number' },

      { key: 'percentShare1', title: 'Percent Share 1', type: 'number' },
      { key: 'percentShare2', title: 'Percent Share 2', type: 'number' },
      { key: 'percentShare3', title: 'Percent Share 3', type: 'number' },
      { key: 'percentShare4', title: 'Percent Share 4', type: 'number' },
      { key: 'percentShare5', title: 'Percent Share 5', type: 'number' },

      { key: 'totalShare', title: 'Total Share', type: 'number' },

      { key: 'trxStatus', title: 'Txn Status', type: 'status' },
      { key: 'recordStatus', title: 'Record Status', type: 'status' },
      { key: 'trxName', title: 'Txn Name', type: 'text' },
      { key: 'lastUpdated', title: 'Last Updated', type: 'dateTime' },
      { key: 'userId', title: 'User ID', type: 'text' },
      { key: 'reviewerId', title: 'Reviewer ID', type: 'text' },
      { key: 'approverId', title: 'Approver ID', type: 'text' },
      { key: 'remarks', title: 'Remarks', type: 'text' },
      { key: 'nextExecutionDate', title: 'Next Execution Date', type: 'date' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.ruleRefNo || index.toString(),

          ruleRefNo: item.ruleRefNo,
          dealNumber: item.dealNumber,
          customerIdName: item.customerIdName,
          clientName: item.clientName,
          fromAccount: item.fromAccount,
          amountCap: item.amountCap,
          transferType: item.transferType,
          execution: item.execution,
          resetCounter: item.resetCounter,
          occurrence: item.occurrence,
          recurringFrequency: item.recurringFrequency,
          firstTxnDate: item.firstTxnDate,
          capValidation: item.capValidation,
          retryDays: item.retryDays,
          dependenceRuleNo: item.dependenceRuleNo,

          toAccount1: item.toAccount1,
          toAccount2: item.toAccount2,
          toAccount3: item.toAccount3,
          toAccount4: item.toAccount4,
          toAccount5: item.toAccount5,

          amountCapCredit1: item.amountCapCredit1,
          amountCapCredit2: item.amountCapCredit2,
          amountCapCredit3: item.amountCapCredit3,
          amountCapCredit4: item.amountCapCredit4,
          amountCapCredit5: item.amountCapCredit5,

          priorityAmountCap1: item.priorityAmountCap1,
          priorityAmountCap2: item.priorityAmountCap2,
          priorityAmountCap3: item.priorityAmountCap3,
          priorityAmountCap4: item.priorityAmountCap4,
          priorityAmountCap5: item.priorityAmountCap5,

          percentShare1: item.percentShare1,
          percentShare2: item.percentShare2,
          percentShare3: item.percentShare3,
          percentShare4: item.percentShare4,
          percentShare5: item.percentShare5,

          totalShare: item.totalShare,

          trxStatus: item.trxStatus,
          recordStatus: item.recordStatus,
          trxName: item.trxName,
          lastUpdated: item.lastUpdated,
          userId: item.userId,
          reviewerId: item.reviewerId,
          approverId: item.approverId,
          remarks: item.remarks,
          nextExecutionDate: item.nextExecutionDate
        })) || []
      )
    }
  }
  },

  'amendmentFundingAndSIReport': {
  id: 'amendmentFundingAndSIReport',
  title: 'Amendment Funding and SI Report',

  fields: [
    {
      id: 'dealId',
      label: 'Deal ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Deal',
      options: [] // Populate from EMS Deal list (include "All")
    },
    {
      id: 'customerId',
      label: 'Customer ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Customer',
      options: [] // Populate from EMS Customer list (include "All")
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
    endpoint: '/ems/amendment-funding-si-report',
    method: 'POST',
    payloadFields: ['dealId', 'customerId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/amendment-funding-si-report/download',

    columns: [
      { key: 'amendFundingSIRefNo', title: 'Amend Funding SI Ref No', type: 'text' },
      { key: 'ruleRefNo', title: 'Rule Ref No', type: 'text' },
      { key: 'dealNumber', title: 'Deal Number / Name', type: 'text' },
      { key: 'customerIdName', title: 'Customer ID / Name', type: 'text' },
      { key: 'clientName', title: 'Client Name', type: 'text' },
      { key: 'fromAccount', title: 'From Account', type: 'text' },
      { key: 'amountCap', title: 'Amount Cap', type: 'number' },
      { key: 'transferType', title: 'Transfer Type', type: 'text' },
      { key: 'execution', title: 'Execution', type: 'text' },
      { key: 'resetCounter', title: 'Reset Counter', type: 'number' },
      { key: 'occurrence', title: 'Occurrence', type: 'number' },
      { key: 'recurringFrequency', title: 'Recurring Frequency', type: 'text' },
      { key: 'firstTxnDate', title: 'First Txn Date', type: 'date' },
      { key: 'capValidation', title: 'Cap Validation', type: 'boolean' },
      { key: 'retryDays', title: 'Retry Days', type: 'number' },
      { key: 'dependenceRuleNo', title: 'Dependence Rule No', type: 'text' },

      { key: 'toAccount1', title: 'To Account 1', type: 'text' },
      { key: 'toAccount2', title: 'To Account 2', type: 'text' },
      { key: 'toAccount3', title: 'To Account 3', type: 'text' },
      { key: 'toAccount4', title: 'To Account 4', type: 'text' },
      { key: 'toAccount5', title: 'To Account 5', type: 'text' },

      { key: 'amountCapCredit1', title: 'Amount Cap Credit 1', type: 'number' },
      { key: 'amountCapCredit2', title: 'Amount Cap Credit 2', type: 'number' },
      { key: 'amountCapCredit3', title: 'Amount Cap Credit 3', type: 'number' },
      { key: 'amountCapCredit4', title: 'Amount Cap Credit 4', type: 'number' },
      { key: 'amountCapCredit5', title: 'Amount Cap Credit 5', type: 'number' },

      { key: 'priorityAmountCap1', title: 'Priority Amount Cap 1', type: 'number' },
      { key: 'priorityAmountCap2', title: 'Priority Amount Cap 2', type: 'number' },
      { key: 'priorityAmountCap3', title: 'Priority Amount Cap 3', type: 'number' },
      { key: 'priorityAmountCap4', title: 'Priority Amount Cap 4', type: 'number' },
      { key: 'priorityAmountCap5', title: 'Priority Amount Cap 5', type: 'number' },

      { key: 'percentShare1', title: 'Percent Share 1', type: 'number' },
      { key: 'percentShare2', title: 'Percent Share 2', type: 'number' },
      { key: 'percentShare3', title: 'Percent Share 3', type: 'number' },
      { key: 'percentShare4', title: 'Percent Share 4', type: 'number' },
      { key: 'percentShare5', title: 'Percent Share 5', type: 'number' },

      { key: 'totalShare', title: 'Total Share', type: 'number' },

      { key: 'trxStatus', title: 'Txn Status', type: 'status' },
      { key: 'recordStatus', title: 'Record Status', type: 'status' },
      { key: 'trxName', title: 'Txn Name', type: 'text' },
      { key: 'lastUpdated', title: 'Last Updated', type: 'dateTime' },
      { key: 'userId', title: 'User ID', type: 'text' },
      { key: 'reviewerId', title: 'Reviewer ID', type: 'text' },
      { key: 'approverId', title: 'Approver ID', type: 'text' },
      { key: 'remarks', title: 'Remarks', type: 'text' },
      { key: 'nextExecutionDate', title: 'Next Execution Date', type: 'date' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.amendFundingSIRefNo || index.toString(),

          amendFundingSIRefNo: item.amendFundingSIRefNo,
          ruleRefNo: item.ruleRefNo,
          dealNumber: item.dealNumber,
          customerIdName: item.customerIdName,
          clientName: item.clientName,
          fromAccount: item.fromAccount,
          amountCap: item.amountCap,
          transferType: item.transferType,
          execution: item.execution,
          resetCounter: item.resetCounter,
          occurrence: item.occurrence,
          recurringFrequency: item.recurringFrequency,
          firstTxnDate: item.firstTxnDate,
          capValidation: item.capValidation,
          retryDays: item.retryDays,
          dependenceRuleNo: item.dependenceRuleNo,

          toAccount1: item.toAccount1,
          toAccount2: item.toAccount2,
          toAccount3: item.toAccount3,
          toAccount4: item.toAccount4,
          toAccount5: item.toAccount5,

          amountCapCredit1: item.amountCapCredit1,
          amountCapCredit2: item.amountCapCredit2,
          amountCapCredit3: item.amountCapCredit3,
          amountCapCredit4: item.amountCapCredit4,
          amountCapCredit5: item.amountCapCredit5,

          priorityAmountCap1: item.priorityAmountCap1,
          priorityAmountCap2: item.priorityAmountCap2,
          priorityAmountCap3: item.priorityAmountCap3,
          priorityAmountCap4: item.priorityAmountCap4,
          priorityAmountCap5: item.priorityAmountCap5,

          percentShare1: item.percentShare1,
          percentShare2: item.percentShare2,
          percentShare3: item.percentShare3,
          percentShare4: item.percentShare4,
          percentShare5: item.percentShare5,

          totalShare: item.totalShare,

          trxStatus: item.trxStatus,
          recordStatus: item.recordStatus,
          trxName: item.trxName,
          lastUpdated: item.lastUpdated,
          userId: item.userId,
          reviewerId: item.reviewerId,
          approverId: item.approverId,
          remarks: item.remarks,
          nextExecutionDate: item.nextExecutionDate
        })) || []
      )
    }
  }
  },

  'unitaryPaymentReport': {
  id: 'unitaryPaymentReport',
  title: 'Unitary Payment Report',

  fields: [
    {
      id: 'dealId',
      label: 'Deal ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Deal',
      options: [] // EMS Deal list (All)
    },
    {
      id: 'customerId',
      label: 'Customer ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Customer',
      options: [] // EMS Customer list (All)
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
    endpoint: '/ems/unitary-payment-report',
    method: 'POST',
    payloadFields: ['dealId', 'customerId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/unitary-payment-report/download',

    columns: [
      { key: 'paymentDate', title: 'Payment Date', type: 'date' },
      { key: 'lastUpdated', title: 'Last Updated', type: 'dateTime' },
      { key: 'creationDate', title: 'Creation Date', type: 'date' },
      { key: 'paymentRefNo', title: 'Payment Ref No', type: 'text' },
      { key: 'customerId', title: 'Customer ID', type: 'text' },
      { key: 'customerName', title: 'Customer Name', type: 'text' },
      { key: 'dealNumber', title: 'Deal Number / Name', type: 'text' },
      { key: 'paymentReqEmail', title: 'Payment Req Email', type: 'text' },
      { key: 'paymentType', title: 'Payment Type', type: 'text' },
      { key: 'adhocPayment', title: 'Adhoc Payment', type: 'boolean' },
      { key: 'beneficiaryId', title: 'Beneficiary ID', type: 'text' },
      { key: 'beneficiaryName', title: 'Beneficiary Name', type: 'text' },
      { key: 'bankName', title: 'Bank Name', type: 'text' },
      { key: 'beneAccountNumber', title: 'Beneficiary Account Number', type: 'text' },
      { key: 'bankIFSCCode', title: 'Bank IFSC Code', type: 'text' },
      { key: 'accountNumber', title: 'Debit Account Number', type: 'text' },
      { key: 'accountBalance', title: 'Account Balance', type: 'number' },
      { key: 'amountPay', title: 'Amount Pay', type: 'number' },
      { key: 'payableAt', title: 'Payable At', type: 'text' },
      { key: 'issuingBranch', title: 'Issuing Branch', type: 'text' },
      { key: 'purpose', title: 'Purpose', type: 'text' },
      { key: 'budgetAvailable', title: 'Budget Available', type: 'boolean' },
      { key: 'remarks', title: 'Remarks', type: 'text' },
      { key: 'requestId', title: 'Request ID', type: 'text' },
      { key: 'status', title: 'Status', type: 'status' },
      { key: 'paymentStatus', title: 'Payment Status', type: 'status' },
      { key: 'response1', title: 'Response 1', type: 'text' },
      { key: 'response2', title: 'Response 2', type: 'text' },
      { key: 'trxStatusVerify', title: 'Txn Status Verify', type: 'status' },
      { key: 'trxStatus', title: 'Txn Status', type: 'status' },
      { key: 'recordStatus', title: 'Record Status', type: 'status' },
      { key: 'purposeOther', title: 'Purpose Other', type: 'text' },
      { key: 'userId', title: 'User ID', type: 'text' },
      { key: 'fees', title: 'Fees', type: 'number' },
      { key: 'currencyPay', title: 'Currency', type: 'text' },
      { key: 'trxBy', title: 'Transaction By', type: 'text' },
      { key: 'customerTypeOther', title: 'Customer Type Other', type: 'text' },
      { key: 'incompleteVerifyStatus', title: 'Incomplete Verify Status', type: 'status' },
      { key: 'userIdVerify', title: 'User ID Verify', type: 'text' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.paymentRefNo || index.toString(),

          paymentDate: item.paymentDate,
          lastUpdated: item.lastUpdated,
          creationDate: item.creationDate,
          paymentRefNo: item.paymentRefNo,
          customerId: item.customerId,
          customerName: item.customerName,
          dealNumber: item.dealNumber,
          paymentReqEmail: item.paymentReqEmail,
          paymentType: item.paymentType,
          adhocPayment: item.adhocPayment,
          beneficiaryId: item.beneficiaryId,
          beneficiaryName: item.beneficiaryName,
          bankName: item.bankName,
          beneAccountNumber: item.beneAccountNumber,
          bankIFSCCode: item.bankIFSCCode,
          accountNumber: item.accountNumber,
          accountBalance: item.accountBalance,
          amountPay: item.amountPay,
          payableAt: item.payableAt,
          issuingBranch: item.issuingBranch,
          purpose: item.purpose,
          budgetAvailable: item.budgetAvailable,
          remarks: item.remarks,
          requestId: item.requestId,
          status: item.status,
          paymentStatus: item.paymentStatus,
          response1: item.response1,
          response2: item.response2,
          trxStatusVerify: item.trxStatusVerify,
          trxStatus: item.trxStatus,
          recordStatus: item.recordStatus,
          purposeOther: item.purposeOther,
          userId: item.userId,
          fees: item.fees,
          currencyPay: item.currencyPay,
          trxBy: item.trxBy,
          customerTypeOther: item.customerTypeOther,
          incompleteVerifyStatus: item.incompleteVerifyStatus,
          userIdVerify: item.userIdVerify
        })) || []
      )
    }
  }
  },

  'unitaryPaymentVerificationReport': {
  id: 'unitaryPaymentVerificationReport',
  title: 'Unitary Payment Verification Report',

  fields: [
    {
      id: 'dealId',
      label: 'Deal ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Deal',
      options: [] // EMS Deal list (All)
    },
    {
      id: 'customerId',
      label: 'Customer ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Customer',
      options: [] // EMS Customer list (All)
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
    endpoint: '/ems/unitary-payment-verification-report',
    method: 'POST',
    payloadFields: ['dealId', 'customerId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/unitary-payment-verification-report/download',

    columns: [
      { key: 'paymentRefNo', title: 'Payment Ref No', type: 'text' },
      { key: 'customerId', title: 'Customer ID', type: 'text' },
      { key: 'customerName', title: 'Customer Name', type: 'text' },
      { key: 'dealNumber', title: 'Deal Number', type: 'text' },
      { key: 'paymentReqEmail', title: 'Payment Req Email', type: 'text' },
      { key: 'paymentType', title: 'Payment Type', type: 'text' },
      { key: 'adhocPayment', title: 'Adhoc Payment', type: 'boolean' },

      { key: 'beneficiaryId', title: 'Beneficiary ID', type: 'text' },
      { key: 'beneficiaryName', title: 'Beneficiary Name', type: 'text' },
      { key: 'bankName', title: 'Bank Name', type: 'text' },
      { key: 'bankIFSCCode', title: 'Bank IFSC Code', type: 'text' },
      { key: 'beneAccountNumber', title: 'Beneficiary Account Number', type: 'text' },

      { key: 'accountNumber', title: 'Debit Account Number', type: 'text' },
      { key: 'accountBalance', title: 'Account Balance', type: 'number' },
      { key: 'amountPay', title: 'Amount Pay', type: 'number' },
      { key: 'issuingBranch', title: 'Issuing Branch', type: 'text' },
      { key: 'payableAt', title: 'Payable At', type: 'text' },

      { key: 'purpose', title: 'Purpose', type: 'text' },
      { key: 'budgetAvailable', title: 'Budget Available', type: 'boolean' },
      { key: 'paymentDate', title: 'Payment Date', type: 'date' },
      { key: 'remarks', title: 'Remarks', type: 'text' },
      { key: 'requestId', title: 'Request ID', type: 'text' },

      { key: 'status', title: 'Status', type: 'status' },
      { key: 'paymentStatus', title: 'Payment Status', type: 'status' },
      { key: 'response1', title: 'Response 1', type: 'text' },
      { key: 'response2', title: 'Response 2', type: 'text' },

      { key: 'trxStatus', title: 'Txn Status', type: 'status' },
      { key: 'trxStatusVerify', title: 'Txn Status Verify', type: 'status' },
      { key: 'recordStatus', title: 'Record Status', type: 'status' },

      { key: 'trxName', title: 'Txn Name', type: 'text' },
      { key: 'lastUpdated', title: 'Last Updated', type: 'dateTime' },
      { key: 'purposeOther', title: 'Purpose Other', type: 'text' },

      { key: 'userId', title: 'User ID', type: 'text' },
      { key: 'reviewerId', title: 'Reviewer ID', type: 'text' },
      { key: 'approverId', title: 'Approver ID', type: 'text' },

      { key: 'creationDate', title: 'Creation Date', type: 'date' },
      { key: 'customerTypeOther', title: 'Customer Type Other', type: 'text' },
      { key: 'trxBy', title: 'Transaction By', type: 'text' },
      { key: 'currencyPay', title: 'Currency', type: 'text' },
      { key: 'fees', title: 'Fees', type: 'number' },

      { key: 'incompleteVerifyStatus', title: 'Incomplete Verify Status', type: 'status' },
      { key: 'userIdVerifier', title: 'User ID Verifier', type: 'text' },
      { key: 'reviewerIdVerifier', title: 'Reviewer ID Verifier', type: 'text' },
      { key: 'approverIdVerifier', title: 'Approver ID Verifier', type: 'text' },

      { key: 'msgStatus', title: 'Message Status', type: 'status' },
      { key: 'trxStatusCustPay', title: 'Txn Status Customer Pay', type: 'status' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.paymentRefNo || index.toString(),

          paymentRefNo: item.paymentRefNo,
          customerId: item.customerId,
          customerName: item.customerName,
          dealNumber: item.dealNumber,
          paymentReqEmail: item.paymentReqEmail,
          paymentType: item.paymentType,
          adhocPayment: item.adhocPayment,

          beneficiaryId: item.beneficiaryId,
          beneficiaryName: item.beneficiaryName,
          bankName: item.bankName,
          bankIFSCCode: item.bankIFSCCode,
          beneAccountNumber: item.beneAccountNumber,

          accountNumber: item.accountNumber,
          accountBalance: item.accountBalance,
          amountPay: item.amountPay,
          issuingBranch: item.issuingBranch,
          payableAt: item.payableAt,

          purpose: item.purpose,
          budgetAvailable: item.budgetAvailable,
          paymentDate: item.paymentDate,
          remarks: item.remarks,
          requestId: item.requestId,

          status: item.status,
          paymentStatus: item.paymentStatus,
          response1: item.response1,
          response2: item.response2,

          trxStatus: item.trxStatus,
          trxStatusVerify: item.trxStatusVerify,
          recordStatus: item.recordStatus,

          trxName: item.trxName,
          lastUpdated: item.lastUpdated,
          purposeOther: item.purposeOther,

          userId: item.userId,
          reviewerId: item.reviewerId,
          approverId: item.approverId,

          creationDate: item.creationDate,
          customerTypeOther: item.customerTypeOther,
          trxBy: item.trxBy,
          currencyPay: item.currencyPay,
          fees: item.fees,

          incompleteVerifyStatus: item.incompleteVerifyStatus,
          userIdVerifier: item.userIdVerifier,
          reviewerIdVerifier: item.reviewerIdVerifier,
          approverIdVerifier: item.approverIdVerifier,

          msgStatus: item.msgStatus,
          trxStatusCustPay: item.trxStatusCustPay
        })) || []
      )
    }
  }
  },

  'unitaryPaymentInvestmentDetailReport': {
  id: 'unitaryPaymentInvestmentDetailReport',
  title: 'Unitary Payment Investment Detail Report',

  fields: [
    {
      id: 'dealId',
      label: 'Deal ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Deal',
      options: [] // EMS Deal list (All)
    },
    {
      id: 'customerId',
      label: 'Customer ID / Name',
      type: 'select',
      required: false,
      placeholder: 'Select Customer',
      options: [] // EMS Customer list (All)
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
    endpoint: '/ems/unitary-payment-investment-detail-report',
    method: 'POST',
    payloadFields: ['dealId', 'customerId', 'fromDate', 'toDate'],

    downloadEndpoint: '/ems/unitary-payment-investment-detail-report/download',

    columns: [
      { key: 'investmentRefNo', title: 'Investment Ref No', type: 'text' },
      { key: 'paymentRefNo', title: 'Payment Ref No', type: 'text' },
      { key: 'dealNumber', title: 'Deal Number / Name', type: 'text' },
      { key: 'customerIdName', title: 'Customer ID / Name', type: 'text' },
      { key: 'paymentType', title: 'Payment Type', type: 'text' },
      { key: 'typeOfInvestment', title: 'Type Of Investment', type: 'text' },
      { key: 'nameOfInvestment', title: 'Name Of Investment', type: 'text' },
      { key: 'schemeName', title: 'Scheme Name', type: 'text' },
      { key: 'creditAccount', title: 'Credit Account', type: 'text' },
      { key: 'noOfUnits', title: 'No Of Units', type: 'number' },
      { key: 'price', title: 'Price', type: 'number' },
      {
        key: 'uniqueIdentificationNumber',
        title: 'Unique Identification Number',
        type: 'text'
      },
      { key: 'folioNumber', title: 'Folio Number', type: 'text' },
      { key: 'dividendDate', title: 'Dividend Date', type: 'date' },
      { key: 'maturityDate', title: 'Maturity Date', type: 'date' },

      { key: 'status', title: 'Status', type: 'status' },
      { key: 'userId', title: 'User ID', type: 'text' },
      { key: 'trxStatus', title: 'Txn Status', type: 'status' },
      { key: 'recordStatus', title: 'Record Status', type: 'status' },
      { key: 'reviewerId', title: 'Reviewer ID', type: 'text' },
      { key: 'approverId', title: 'Approver ID', type: 'text' },
      { key: 'creationDate', title: 'Creation Date', type: 'date' },
      { key: 'trxName', title: 'Txn Name', type: 'text' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.investmentRefNo || index.toString(),

          investmentRefNo: item.investmentRefNo,
          paymentRefNo: item.paymentRefNo,
          dealNumber: item.dealNumber,
          customerIdName: item.customerIdName,
          paymentType: item.paymentType,
          typeOfInvestment: item.typeOfInvestment,
          nameOfInvestment: item.nameOfInvestment,
          schemeName: item.schemeName,
          creditAccount: item.creditAccount,
          noOfUnits: item.noOfUnits,
          price: item.price,
          uniqueIdentificationNumber: item.uniqueIdentificationNumber,
          folioNumber: item.folioNumber,
          dividendDate: item.dividendDate,
          maturityDate: item.maturityDate,

          status: item.status,
          userId: item.userId,
          trxStatus: item.trxStatus,
          recordStatus: item.recordStatus,
          reviewerId: item.reviewerId,
          approverId: item.approverId,
          creationDate: item.creationDate,
          trxName: item.trxName
        })) || []
      )
    }
  }
  },

  'transactionStatusReport': {
  id: 'transactionStatusReport',
  title: 'Transaction Status Report',

  fields: [
    {
      id: 'paymentReference',
      label: 'Payment Reference',
      type: 'text',
      required: false,
      placeholder: 'Enter Payment Reference'
    },
    {
      id: 'ruleRefNo',
      label: 'Rule Ref No',
      type: 'text',
      required: false,
      placeholder: 'Enter Rule Ref No'
    },
    {
      id: 'recordStatus',
      label: 'Record Status',
      type: 'text',
      required: false,
      placeholder: 'Enter Record Status'
    },
    {
      id: 'txnStatus',
      label: 'Txn Status',
      type: 'text',
      required: false,
      placeholder: 'Enter Txn Status'
    },
    {
      id: 'msgStatus',
      label: 'Message Status',
      type: 'text',
      required: false,
      placeholder: 'Enter Message Status'
    },
    {
      id: 'fileName',
      label: 'File Name',
      type: 'text',
      required: false,
      placeholder: 'Enter File Name'
    },
    {
      id: 'utrRefNo',
      label: 'UTR Ref No',
      type: 'text',
      required: false,
      placeholder: 'Enter UTR Ref No'
    },
    {
      id: 'initiatorId',
      label: 'Initiator ID',
      type: 'text',
      required: false,
      placeholder: 'Enter Initiator ID'
    },
    {
      id: 'lastUpdated',
      label: 'Last Updated',
      type: 'dateTime',
      required: false,
      placeholder: 'YYYY-MM-DD HH:mm'
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
    endpoint: '/ems/transaction-status-report',
    method: 'POST',
    payloadFields: [
      'paymentReference',
      'ruleRefNo',
      'recordStatus',
      'txnStatus',
      'msgStatus',
      'fileName',
      'utrRefNo',
      'initiatorId',
      'lastUpdated',
      'fromDate',
      'toDate'
    ],

    downloadEndpoint: '/ems/transaction-status-report/download',

    columns: [
      { key: 'referenceNo', title: 'Reference No', type: 'text' },
      { key: 'transactionDate', title: 'Transaction Date', type: 'date' },
      { key: 'dealNo', title: 'Deal No', type: 'text' },
      { key: 'custId', title: 'Customer ID', type: 'text' },

      { key: 'remitterAccountNo', title: 'Remitter A/c No', type: 'text' },
      { key: 'remitterAccountName', title: 'Remitter A/c Name', type: 'text' },

      { key: 'beneficiaryAccountNo', title: 'Beneficiary A/c No', type: 'text' },
      { key: 'beneficiaryAccountName', title: 'Beneficiary A/c Name', type: 'text' },

      { key: 'ifscCode', title: 'IFSC Code', type: 'text' },
      { key: 'amount', title: 'Amount', type: 'number' },
      { key: 'transactionType', title: 'Transaction Type', type: 'text' },

      { key: 'remarks', title: 'Remarks', type: 'text' },
      { key: 'debitNarration', title: 'Debit Narration', type: 'text' },
      { key: 'creditNarration', title: 'Credit Narration', type: 'text' },

      {
        key: 'module',
        title: 'Module (SI / Bulk / Unitary)',
        type: 'text'
      },

      { key: 'txnStatus', title: 'Txn Status', type: 'status' },
      { key: 'msgStatus', title: 'Msg Status', type: 'status' },
      { key: 'paymentStatus', title: 'Payment Status', type: 'status' },

      { key: 'errorDescription', title: 'Error Description', type: 'text' },

      { key: 'phRefNumber', title: 'PH Ref Number', type: 'text' },
      { key: 'finacleRefNumber', title: 'Finacle Ref Number', type: 'text' },

      { key: 'userId', title: 'User ID', type: 'text' },
      { key: 'lastUpdated', title: 'Last Updated', type: 'dateTime' },
      { key: 'fileName', title: 'File Name', type: 'text' },

      { key: 'reportGenerationFrom', title: 'Report Generation From', type: 'date' },
      { key: 'reportGenerationTo', title: 'Report Generation To', type: 'date' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.referenceNo || index.toString(),

          referenceNo: item.referenceNo,
          transactionDate: item.transactionDate,
          dealNo: item.dealNo,
          custId: item.custId,

          remitterAccountNo: item.remitterAccountNo,
          remitterAccountName: item.remitterAccountName,

          beneficiaryAccountNo: item.beneficiaryAccountNo,
          beneficiaryAccountName: item.beneficiaryAccountName,

          ifscCode: item.ifscCode,
          amount: item.amount,
          transactionType: item.transactionType,

          remarks: item.remarks,
          debitNarration: item.debitNarration,
          creditNarration: item.creditNarration,

          module: item.module,

          txnStatus: item.txnStatus,
          msgStatus: item.msgStatus,
          paymentStatus: item.paymentStatus,

          errorDescription: item.errorDescription,

          phRefNumber: item.phRefNumber,
          finacleRefNumber: item.finacleRefNumber,

          userId: item.userId,
          lastUpdated: item.lastUpdated,
          fileName: item.fileName,

          reportGenerationFrom: item.reportGenerationFrom,
          reportGenerationTo: item.reportGenerationTo
        })) || []
      )
    }
  }
  },

  'ruleSITransactionStatusReport': {
  id: 'ruleSITransactionStatusReport',
  title: 'Rule SI Transaction Status Report',

  fields: [
    {
      id: 'paymentReference',
      label: 'Payment Reference',
      type: 'text',
      required: false,
      placeholder: 'Enter Payment Reference'
    },
    {
      id: 'ruleRefNo',
      label: 'Rule Ref No',
      type: 'text',
      required: false,
      placeholder: 'Enter Rule Ref No'
    },
    {
      id: 'recordStatus',
      label: 'Record Status',
      type: 'text',
      required: false,
      placeholder: 'Enter Record Status'
    },
    {
      id: 'txnStatus',
      label: 'Txn Status',
      type: 'text',
      required: false,
      placeholder: 'Enter Txn Status'
    },
    {
      id: 'msgStatus',
      label: 'Message Status',
      type: 'text',
      required: false,
      placeholder: 'Enter Message Status'
    },
    {
      id: 'fileName',
      label: 'File Name',
      type: 'text',
      required: false,
      placeholder: 'Enter File Name'
    },
    {
      id: 'utrRefNo',
      label: 'UTR Ref No',
      type: 'text',
      required: false,
      placeholder: 'Enter UTR Ref No'
    },
    {
      id: 'initiatorId',
      label: 'Initiator ID',
      type: 'text',
      required: false,
      placeholder: 'Enter Initiator ID'
    },
    {
      id: 'lastUpdated',
      label: 'Last Updated',
      type: 'dateTime',
      required: false,
      placeholder: 'YYYY-MM-DD HH:mm'
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
    endpoint: '/ems/rule-si-transaction-status-report',
    method: 'POST',

    payloadFields: [
      'paymentReference',
      'ruleRefNo',
      'recordStatus',
      'txnStatus',
      'msgStatus',
      'fileName',
      'utrRefNo',
      'initiatorId',
      'lastUpdated',
      'fromDate',
      'toDate'
    ],

    downloadEndpoint: '/ems/rule-si-transaction-status-report/download',

    columns: [
      { key: 'referenceNo', title: 'Reference No', type: 'text' },
      { key: 'transactionDate', title: 'Transaction Date', type: 'date' },
      { key: 'dealNo', title: 'Deal No', type: 'text' },
      { key: 'custId', title: 'Cust Id', type: 'text' },

      { key: 'remitterAccountNo', title: 'Remitter A/c No', type: 'text' },
      { key: 'remitterAccountName', title: 'Remitter A/c Name', type: 'text' },

      { key: 'beneficiaryAccountNo', title: 'Beneficiary A/c No', type: 'text' },
      { key: 'beneficiaryAccountName', title: 'Beneficiary A/c Name', type: 'text' },

      { key: 'ifscCode', title: 'IFSC Code', type: 'text' },
      { key: 'amount', title: 'Amount', type: 'number' },
      { key: 'transactionType', title: 'Transaction Type', type: 'text' },

      { key: 'remarks', title: 'Remarks', type: 'text' },
      { key: 'debitNarration', title: 'Debit Narration', type: 'text' },
      { key: 'creditNarration', title: 'Credit Narration', type: 'text' },

      {
        key: 'module',
        title: 'Module (SI / Bulk / Unitary)',
        type: 'text'
      },

      { key: 'txnStatus', title: 'Txn Status', type: 'status' },
      { key: 'msgStatus', title: 'Msg Status', type: 'status' },
      { key: 'paymentStatus', title: 'Payment Status', type: 'status' },

      { key: 'errorDescription', title: 'Error Description', type: 'text' },

      { key: 'phRefNumber', title: 'PH Ref Number', type: 'text' },
      { key: 'finacleRefNumber', title: 'Finacle Ref Number', type: 'text' },

      { key: 'userId', title: 'User ID', type: 'text' },
      { key: 'lastUpdated', title: 'Last Updated', type: 'dateTime' },
      { key: 'fileName', title: 'File Name', type: 'text' },

      { key: 'reportGenerationFrom', title: 'Report Generation From', type: 'date' },
      { key: 'reportGenerationTo', title: 'Report Generation To', type: 'date' }
    ],

    transformResponse: (data: any) => {
      return (
        data?.content?.map((item: any, index: number) => ({
          id: item.referenceNo || index.toString(),

          referenceNo: item.referenceNo,
          transactionDate: item.transactionDate,
          dealNo: item.dealNo,
          custId: item.custId,

          remitterAccountNo: item.remitterAccountNo,
          remitterAccountName: item.remitterAccountName,

          beneficiaryAccountNo: item.beneficiaryAccountNo,
          beneficiaryAccountName: item.beneficiaryAccountName,

          ifscCode: item.ifscCode,
          amount: item.amount,
          transactionType: item.transactionType,

          remarks: item.remarks,
          debitNarration: item.debitNarration,
          creditNarration: item.creditNarration,

          module: item.module,

          txnStatus: item.txnStatus,
          msgStatus: item.msgStatus,
          paymentStatus: item.paymentStatus,

          errorDescription: item.errorDescription,

          phRefNumber: item.phRefNumber,
          finacleRefNumber: item.finacleRefNumber,

          userId: item.userId,
          lastUpdated: item.lastUpdated,
          fileName: item.fileName,

          reportGenerationFrom: item.reportGenerationFrom,
          reportGenerationTo: item.reportGenerationTo
        })) || []
      )
    }
  }
  },

  'unitaryPaymentTransactionStatusReport': {
    id: 'unitaryPaymentTransactionStatusReport',
    title: 'Unitary Payment Transaction Status Report',

    fields: [
      {
        id: 'paymentReference',
        label: 'Payment Reference',
        type: 'text',
        required: false,
        placeholder: 'Enter Payment Reference'
      },
      {
        id: 'ruleRefNo',
        label: 'Rule Ref No',
        type: 'text',
        required: false,
        placeholder: 'Enter Rule Ref No'
      },
      {
        id: 'recordStatus',
        label: 'Record Status',
        type: 'text',
        required: false,
        placeholder: 'Enter Record Status'
      },
      {
        id: 'txnStatus',
        label: 'Txn Status',
        type: 'text',
        required: false,
        placeholder: 'Enter Txn Status'
      },
      {
        id: 'msgStatus',
        label: 'Message Status',
        type: 'text',
        required: false,
        placeholder: 'Enter Message Status'
      },
      {
        id: 'fileName',
        label: 'File Name',
        type: 'text',
        required: false,
        placeholder: 'Enter File Name'
      },
      {
        id: 'utrRefNo',
        label: 'UTR Ref No',
        type: 'text',
        required: false,
        placeholder: 'Enter UTR Ref No'
      },
      {
        id: 'initiatorId',
        label: 'Initiator ID',
        type: 'text',
        required: false,
        placeholder: 'Enter Initiator ID'
      },
      {
        id: 'lastUpdated',
        label: 'Last Updated',
        type: 'dateTime',
        required: false,
        placeholder: 'YYYY-MM-DD HH:mm'
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
      endpoint: '/ems/unitary-payment-transaction-status-report',
      method: 'POST',

      payloadFields: [
        'paymentReference',
        'ruleRefNo',
        'recordStatus',
        'txnStatus',
        'msgStatus',
        'fileName',
        'utrRefNo',
        'initiatorId',
        'lastUpdated',
        'fromDate',
        'toDate'
      ],

      downloadEndpoint:
        '/ems/unitary-payment-transaction-status-report/download',

      columns: [
        { key: 'referenceNo', title: 'Reference No', type: 'text' },
        { key: 'transactionDate', title: 'Transaction Date', type: 'date' },
        { key: 'dealNo', title: 'Deal No', type: 'text' },
        { key: 'custId', title: 'Cust Id', type: 'text' },

        { key: 'remitterAccountNo', title: 'Remitter A/c No', type: 'text' },
        { key: 'remitterAccountName', title: 'Remitter A/c Name', type: 'text' },

        { key: 'beneficiaryAccountNo', title: 'Beneficiary A/c No', type: 'text' },
        {
          key: 'beneficiaryAccountName',
          title: 'Beneficiary A/c Name',
          type: 'text'
        },

        { key: 'ifscCode', title: 'IFSC Code', type: 'text' },
        { key: 'amount', title: 'Amount', type: 'number' },
        { key: 'transactionType', title: 'Transaction Type', type: 'text' },

        { key: 'remarks', title: 'Remarks', type: 'text' },
        { key: 'debitNarration', title: 'Debit Narration', type: 'text' },
        { key: 'creditNarration', title: 'Credit Narration', type: 'text' },

        {
          key: 'module',
          title: 'Module (SI / Bulk / Unitary)',
          type: 'text'
        },

        { key: 'txnStatus', title: 'Txn Status', type: 'status' },
        { key: 'msgStatus', title: 'Msg Status', type: 'status' },
        { key: 'paymentStatus', title: 'Payment Status', type: 'status' },

        { key: 'errorDescription', title: 'Error Description', type: 'text' },

        { key: 'phRefNumber', title: 'PH Ref Number', type: 'text' },
        { key: 'finacleRefNumber', title: 'Finacle Ref Number', type: 'text' },

        { key: 'userId', title: 'User ID', type: 'text' },
        { key: 'lastUpdated', title: 'Last Updated', type: 'dateTime' },
        { key: 'fileName', title: 'File Name', type: 'text' },

        { key: 'reportGenerationFrom', title: 'Report Generation From', type: 'date' },
        { key: 'reportGenerationTo', title: 'Report Generation To', type: 'date' }
      ],

      transformResponse: (data: any) => {
        return (
          data?.content?.map((item: any, index: number) => ({
            id: item.referenceNo || index.toString(),

            referenceNo: item.referenceNo,
            transactionDate: item.transactionDate,
            dealNo: item.dealNo,
            custId: item.custId,

            remitterAccountNo: item.remitterAccountNo,
            remitterAccountName: item.remitterAccountName,

            beneficiaryAccountNo: item.beneficiaryAccountNo,
            beneficiaryAccountName: item.beneficiaryAccountName,

            ifscCode: item.ifscCode,
            amount: item.amount,
            transactionType: item.transactionType,

            remarks: item.remarks,
            debitNarration: item.debitNarration,
            creditNarration: item.creditNarration,

            module: item.module,

            txnStatus: item.txnStatus,
            msgStatus: item.msgStatus,
            paymentStatus: item.paymentStatus,

            errorDescription: item.errorDescription,

            phRefNumber: item.phRefNumber,
            finacleRefNumber: item.finacleRefNumber,

            userId: item.userId,
            lastUpdated: item.lastUpdated,
            fileName: item.fileName,

            reportGenerationFrom: item.reportGenerationFrom,
            reportGenerationTo: item.reportGenerationTo
          })) || []
        )
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
