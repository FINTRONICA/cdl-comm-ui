// 🏦 BANKING COMPLIANCE: Example usage of new labels store
// This file demonstrates how to use the new labels slice

import { useLabels, useLabelsActions, useLabelsLoadingState } from './index'

// Example: Using labels in a React component
export function ExampleLabelsUsage() {
  // Get labels data
  const { allLabelsLoading, allLabelsError } = useLabels()
  
  // Get labels actions
  const { getLabel, hasLabels, clearAllLabels } = useLabelsActions()
  
  // Get loading states
  const { getLoadingStatus } = useLabelsLoadingState()
  
  // Example: Get a specific label
  const dashboardLabel = getLabel('sidebar', 'DASHBOARD', 'EN', 'Dashboard')
  
  // Example: Check if labels are available
  const hasSidebarLabels = hasLabels('sidebar')
  
  // Example: Get loading status for all label types
  const loadingStatus = getLoadingStatus()
  
  console.log('🏦 [COMPLIANCE] Labels Usage Example:')
  console.log('- Dashboard Label:', dashboardLabel)
  console.log('- Has Sidebar Labels:', hasSidebarLabels)
  console.log('- Loading Status:', loadingStatus)
  console.log('- All Labels Loading:', allLabelsLoading)
  console.log('- All Labels Error:', allLabelsError)
  
  // Example: Clear all labels (useful for logout)
  const handleLogout = () => {
    console.log('🏦 [COMPLIANCE] Clearing all labels on logout')
    clearAllLabels()
  }
  
  return {
    dashboardLabel,
    hasSidebarLabels,
    loadingStatus,
    allLabelsLoading,
    allLabelsError,
    handleLogout
  }
}

// Example: Direct store access (for services/utilities)
export function ExampleDirectStoreUsage() {
  // You can also import and use the store directly
  // This is useful in non-React contexts (services, utilities, etc.)
  
  // const { useAppStore } = require('./index')
  
  // Get labels directly from store (commented out to avoid unused variables)
  // const sidebarLabels = useAppStore.getState().sidebarLabels
  // const getLabel = useAppStore.getState().getLabel
  
  // Set labels directly (useful in API loading services) - commented out to avoid unused variables
  // const setSidebarLabels = useAppStore.getState().setSidebarLabels
  // const setSidebarLabelsLoading = useAppStore.getState().setSidebarLabelsLoading
  
  console.log('🏦 [COMPLIANCE] Direct Store Usage Example:')
  // console.log('- Current Sidebar Labels:', sidebarLabels ? Object.keys(sidebarLabels).length : 0)
  
  return {
    // sidebarLabels,
    // getLabel,
    // setSidebarLabels,
    // setSidebarLabelsLoading
  }
}

// Example: Migration pattern from old localStorage approach
export function ExampleMigrationPattern() {
  console.log('🔄 [MIGRATION] Old vs New approach:')
  
  // ❌ OLD WAY (localStorage-based)
  console.log('❌ OLD: localStorage.getItem("sidebarLabels")')
  console.log('❌ OLD: localStorage.setItem("sidebarLabels", JSON.stringify(data))')
  
  // ✅ NEW WAY (Zustand session store)
  console.log('✅ NEW: const { sidebarLabels } = useLabels()')
  console.log('✅ NEW: setSidebarLabels(processedLabels)')
  
  // Key differences:
  console.log('🏦 [COMPLIANCE] Key Benefits:')
  console.log('- ✅ Session-only (no persistent storage)')
  console.log('- ✅ Always fresh data on app load')
  console.log('- ✅ Type-safe operations')
  console.log('- ✅ Centralized state management')
  console.log('- ✅ Banking compliance ready')
  console.log('- ✅ Better error handling')
  console.log('- ✅ Loading state management')
}
