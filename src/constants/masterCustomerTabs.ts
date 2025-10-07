import { Tab } from '@/types/activities'

// Tab configuration for master customers
export const masterCustomerTabs: Tab[] = [
  { id: 'customer', label: 'Customer' },
  { id: 'account-purpose', label: 'Account ' },
  { id: 'investment-master', label: 'Investment ' },
  { id: 'business-segment', label: ' Segment' },
  { id: 'business-sub-segment', label: ' Sub Segment' },
  { id: 'deal-type', label: 'Deal Type' },
  { id: 'deal-subtype', label: 'Deal Sub Type' },
  { id: 'product-program', label: 'Product ' },
  { id: 'document', label: 'Document' },
  { id: 'deal-segment', label: 'Deal Segment' },
  { id: 'ledger-account', label: 'Ledger Account' },
  { id: 'beneficiary', label: 'Beneficiary' },
  { id: 'country-code', label: 'Country Code' },
  { id: 'currency-code', label: 'Currency Code' },
]

// Map tab IDs to their corresponding routes
export const masterCustomerTabRoutes: Record<string, string> = {
  'customer': '/master-customers/customers',
  'account-purpose': '/master-customers/account-purpose',
  'investment-master': '/master-customers/investment-master',
  'business-segment': '/master-customers/business-segment',
  'business-sub-segment': '/master-customers/business-sub-segment',
  'deal-type': '/master-customers/deal-type',
  'deal-subtype': '/master-customers/deal-subtype',
  'product-program': '/master-customers/product-program',
  'document': '/master-customers/document',
  'deal-segment': '/master-customers/deal-segment',
  'ledger-account': '/master-customers/ledger-account',
  'beneficiary': '/master-customers/beneficiary',
  'country-code': '/master-customers/country-code',
  'currency-code': '/master-customers/currency-code',
}

// Utility function to get active tab from pathname
export const getActiveTabFromPathname = (pathname: string): string => {
  return Object.keys(masterCustomerTabRoutes).find(tabId => 
    masterCustomerTabRoutes[tabId] === pathname
  ) || 'customer'
}

// Utility function to get active tab label
export const getActiveTabLabel = (activeTab: string): string => {
  return masterCustomerTabs.find(tab => tab.id === activeTab)?.label || 'Customer'
}
