/**
 * Centralized Theme Configuration
 * All colors used throughout the application
 * 
 * Usage:
 * import { themeConfig, themeClasses } from '@/config/themeConfig'
 */

export const themeConfig = {
  // Brand Colors
  brand: {
    primary: '#2563EB',      // Blue-600
    secondary: '#2F80ED',    // Blue-500
    accent: '#60A5FA',       // Blue-400
  },

  // Light Mode Colors
  light: {
    // Backgrounds
    background: {
      primary: '#FFFFFF',     // Pure white
      secondary: '#F3F4F6',   // Gray-50
      tertiary: '#F9FAFB',    // Gray-25
      card: '#FFFFFF',        // Card background
      hover: '#F3F4F6',       // Hover state
      active: '#DBEAFE',      // Active/selected state (blue-100)
      sidebar: '#FFFFFF',     // Sidebar background
      header: '#FFFFFF',      // Header background
    },
    
    // Text Colors
    text: {
      primary: '#1E2939',     // Dark navy (headings)
      secondary: '#4A5565',   // Medium gray (body)
      tertiary: '#6A7282',    // Light gray (labels)
      muted: '#9CA3AF',       // Very light gray
      inverse: '#FFFFFF',     // White text on dark
      link: '#155DFC',        // Blue link
      linkHover: '#2563EB',   // Blue link hover
      linkActive: '#60A5FA',  // Blue link active
    },
    
    // Border Colors
    border: {
      primary: '#E5E7EB',     // Gray-200
      secondary: '#CAD5E2',   // Blue-gray-200
      light: '#F3F4F6',       // Very light
      focus: '#2563EB',       // Focus ring
      active: '#DBEAFE',      // Active border
    },
    
    // UI Element Colors
    ui: {
      sidebar: '#FFFFFF',
      sidebarBorder: '#E5E7EB',
      header: '#FFFFFF',
      card: '#FFFFFF',
      cardBorder: '#E5E7EB',
      input: '#FFFFFF',
      inputBorder: '#CAD5E2',
      divider: '#E5E7EB',
    },
  },

  // Dark Mode Colors
  dark: {
    // Backgrounds
    background: {
      primary: '#0F172A',     // Navy-900
      secondary: '#1E293B',   // Navy-800
      tertiary: '#334155',    // Navy-700
      card: '#1E293B',        // Card background
      hover: '#334155',       // Hover state
      active: '#1E3A8A',      // Active state (dark blue)
      sidebar: '#1E293B',     // Sidebar background
      header: '#0F172A',      // Header background
    },
    
    // Text Colors
    text: {
      primary: '#F1F5F9',     // Very light gray
      secondary: '#CBD5E1',   // Light gray
      tertiary: '#94A3B8',    // Medium gray
      muted: '#64748B',       // Muted gray
      inverse: '#0F172A',     // Dark text on light
      link: '#60A5FA',        // Blue link
      linkHover: '#93C5FD',   // Blue link hover
      linkActive: '#3B82F6',  // Blue link active
    },
    
    // Border Colors
    border: {
      primary: '#334155',     // Navy-700
      secondary: '#475569',   // Navy-600
      light: '#1E293B',       // Navy-800
      focus: '#3B82F6',       // Focus ring
      active: '#1E3A8A',      // Active border
    },
    
    // UI Element Colors
    ui: {
      sidebar: '#1E293B',
      sidebarBorder: '#334155',
      header: '#0F172A',
      card: '#1E293B',
      cardBorder: '#334155',
      input: '#334155',
      inputBorder: '#475569',
      divider: '#334155',
    },
  },

  // Status Colors (Same for both modes, but with dark variants)
  status: {
    success: {
      light: { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
      dark: { bg: '#14532D', text: '#86EFAC', border: '#166534' },
    },
    warning: {
      light: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
      dark: { bg: '#78350F', text: '#FCD34D', border: '#92400E' },
    },
    error: {
      light: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
      dark: { bg: '#7F1D1D', text: '#FCA5A5', border: '#991B1B' },
    },
    info: {
      light: { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
      dark: { bg: '#1E3A8A', text: '#93C5FD', border: '#1E40AF' },
    },
  },

  // Chart Colors
  charts: {
    deposits: ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'],
    payments: ['#86198f', '#a21caf', '#c026d3', '#d946ef', '#e879f9'],
    fees: ['#4c1d95', '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa'],
    status: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
    guarantee: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
    developers: ['#c4b5fd', '#8b5cf6', '#6d28d9'],
  },
}

/**
 * Tailwind CSS class helpers for common patterns
 * Use these instead of hardcoded classes
 */
export const themeClasses = {
  // Backgrounds
  bgPrimary: 'bg-white dark:bg-gray-900',
  bgSecondary: 'bg-gray-50 dark:bg-gray-800',
  bgCard: 'bg-white dark:bg-gray-800',
  bgHover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
  bgActive: 'bg-blue-50 dark:bg-blue-900/30',
  bgSidebar: 'bg-white dark:bg-gray-800',
  bgHeader: 'bg-white dark:bg-gray-900',
  
  // Text
  textPrimary: 'text-gray-900 dark:text-gray-100',
  textSecondary: 'text-gray-600 dark:text-gray-400',
  textTertiary: 'text-gray-500 dark:text-gray-500',
  textMuted: 'text-gray-400 dark:text-gray-600',
  textLink: 'text-blue-600 dark:text-blue-400',
  textLinkHover: 'hover:text-blue-700 dark:hover:text-blue-300',
  
  // Borders
  borderPrimary: 'border-gray-200 dark:border-gray-700',
  borderSecondary: 'border-gray-300 dark:border-gray-600',
  borderLight: 'border-gray-100 dark:border-gray-800',
  borderActive: 'border-blue-200 dark:border-blue-800',
  
  // Dividers
  divider: 'divide-gray-200 dark:divide-gray-700',
  
  // Shadows
  shadowSm: 'shadow-sm dark:shadow-gray-900/50',
  shadowMd: 'shadow-md dark:shadow-gray-900/50',
  shadowLg: 'shadow-lg dark:shadow-gray-900/50',
  
  // Interactive States
  interactive: 'hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600',
  
  // Combined Patterns
  card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-gray-900/50',
  input: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100',
  button: 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white',
}

/**
 * Helper function to get theme-aware color value
 * @param path - Dot notation path to color (e.g., 'background.primary')
 * @param isDark - Whether dark mode is active
 */
export const getThemeColor = (path: string, isDark: boolean): string => {
  const keys = path.split('.')
  let value: any = isDark ? themeConfig.dark : themeConfig.light
  
  for (const key of keys) {
    value = value?.[key]
  }
  
  return value || '#000000'
}

