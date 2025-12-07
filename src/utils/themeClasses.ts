/**
 * Reusable dark mode theme classes
 * Use these utilities to ensure consistent dark mode styling across the application
 */

export const themeClasses = {
  // Backgrounds
  background: 'bg-white dark:bg-gray-800',
  backgroundSecondary: 'bg-gray-50 dark:bg-gray-900',
  backgroundCard: 'bg-white dark:bg-gray-800',
  backgroundElevated: 'bg-white dark:bg-gray-800 shadow dark:shadow-gray-900',
  
  // Text
  textPrimary: 'text-gray-900 dark:text-gray-100',
  textSecondary: 'text-gray-600 dark:text-gray-400',
  textMuted: 'text-gray-500 dark:text-gray-500',
  textInverse: 'text-white dark:text-gray-100',
  
  // Borders
  border: 'border-gray-200 dark:border-gray-700',
  borderLight: 'border-gray-100 dark:border-gray-800',
  borderDark: 'border-gray-300 dark:border-gray-600',
  
  // Interactive states
  hover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
  hoverLight: 'hover:bg-gray-100 dark:hover:bg-gray-700',
  hoverCard: 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
  
  // Focus states
  focusRing: 'focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
  
  // Shadows
  shadow: 'shadow-lg dark:shadow-gray-900/50',
  shadowMd: 'shadow-md dark:shadow-gray-900/30',
  
  // Common combinations
  card: 'bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700',
  input: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100',
  dropdown: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/50',
}

/**
 * Get theme-aware status colors
 */
export const getStatusColors = (status: string) => {
  const statusLower = status.toLowerCase()
  
  switch (statusLower) {
    case 'approved':
    case 'active':
      return {
        bg: 'bg-green-50 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
      }
    case 'rejected':
    case 'failed':
    case 'closed':
    case 'expired':
      return {
        bg: 'bg-red-50 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
      }
    case 'pending':
    case 'incomplete':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800',
      }
    case 'in_progress':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
      }
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-700',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-600',
      }
  }
}

