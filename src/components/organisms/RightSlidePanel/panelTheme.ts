import { alpha } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

export interface PanelSurfaceTokens {
  paper: Record<string, unknown>
  header: Record<string, unknown>
  sectionBorder: Record<string, unknown>
  input: Record<string, unknown>
  inputError: Record<string, unknown>
  label: Record<string, unknown>
  value: Record<string, unknown>
  helperText: Record<string, unknown>
  dividerColor: string
  neutralButtonClasses: string
  primaryButtonClasses: string
}

export const buildPanelSurfaceTokens = (theme: Theme): PanelSurfaceTokens => {
  const isDark = theme.palette.mode === 'dark'
  // Use #111827 (gray-900) for dark mode to match page background, white for light mode
  const paperBg = isDark ? '#111827' : '#FFFFFF'
  const divider = isDark 
    ? alpha('#FFFFFF', 0.2) // White divider with opacity for dark mode
    : alpha('#000000', 0.1) // Dark divider for light mode
  const hoverDivider = isDark
    ? alpha('#FFFFFF', 0.3) // Slightly more opaque on hover for dark mode
    : alpha('#000000', 0.15) // Darker on hover for light mode

  return {
    paper: {
      width: 460,
      borderRadius: 3,
      backdropFilter: 'blur(15px)',
      backgroundColor: paperBg,
      backgroundImage: 'none',
      color: isDark ? '#FFFFFF' : '#111827', // White text for dark mode, dark text for light mode
      border: `1px solid ${divider}`,
      boxShadow: isDark
        ? '0 18px 40px rgba(15, 23, 42, 0.55)'
        : '0 18px 40px rgba(15, 23, 42, 0.18)',
    },
    header: {
      color: isDark ? '#FFFFFF' : '#111827', // White header text for dark mode, dark for light mode
      borderBottom: `1px solid ${divider}`,
      backgroundColor: paperBg, // Same background as panel body
    },
    sectionBorder: {
      borderColor: divider,
      '&:hover': {
        borderColor: hoverDivider,
      },
    },
    input: {
      '& .MuiOutlinedInput-root': {
        height: '46px',
        borderRadius: '8px',
        backgroundColor: isDark
          ? alpha('#1E293B', 0.5) // Darker background for inputs in dark mode
          : '#FFFFFF', // White background for inputs in light mode
        '& fieldset': {
          borderColor: isDark
            ? alpha('#FFFFFF', 0.3) // White border with opacity for dark mode
            : '#CAD5E2', // Light border for light mode
        },
        '&:hover fieldset': {
          borderColor: isDark
            ? alpha('#FFFFFF', 0.5) // Brighter on hover for dark mode
            : '#94A3B8', // Darker on hover for light mode
        },
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.primary.main,
          borderWidth: '1px',
        },
      },
      '& .MuiInputBase-input': {
        color: isDark ? '#FFFFFF' : '#111827', // White text in dark mode, dark text in light mode
      },
      '& .MuiInputBase-input::placeholder': {
        color: isDark
          ? alpha('#FFFFFF', 0.5) // Semi-transparent white for placeholder in dark mode
          : alpha('#6B7280', 0.7), // Gray placeholder for light mode
        opacity: 1,
      },
      '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
        WebkitTextFillColor: isDark ? '#FFFFFF' : '#111827',
        transition: 'background-color 9999s ease-out 0s',
        boxShadow: `0 0 0px 1000px ${
          isDark ? alpha('#1E293B', 0.5) : '#FFFFFF'
        } inset`,
      },
    },
    inputError: {
      '& .MuiOutlinedInput-root': {
        height: '46px',
        borderRadius: '8px',
        backgroundColor: alpha(theme.palette.error.main, 0.15),
        '& fieldset': {
          borderColor: alpha(theme.palette.error.main, 0.8),
          borderWidth: '1px',
        },
        '&:hover fieldset': {
          borderColor: theme.palette.error.main,
        },
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.error.main,
          borderWidth: '2px',
        },
      },
      '& .MuiInputBase-input': {
        color: isDark ? '#FFFFFF' : '#111827', // White text in dark mode, dark text in light mode
      },
      '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
        WebkitTextFillColor: isDark ? '#FFFFFF' : '#111827',
        transition: 'background-color 9999s ease-out 0s',
        boxShadow: `0 0 0px 1000px ${
          isDark ? alpha('#1E293B', 0.5) : '#FFFFFF'
        } inset`,
      },
    },
    label: {
      color: isDark ? '#FFFFFF' : '#374151', // White labels for dark mode, gray for light mode
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 400,
      fontSize: 12,
      letterSpacing: 0,
    },
    value: {
      color: isDark ? '#FFFFFF' : '#111827', // White text for values in dark mode, dark for light mode
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 400,
      fontSize: 14,
      letterSpacing: 0,
      wordBreak: 'break-word',
    },
    helperText: {
      color: isDark 
        ? alpha('#FFFFFF', 0.7) // Semi-transparent white for helper text in dark mode
        : alpha('#6B7280', 0.8), // Gray helper text for light mode
      fontFamily: 'Outfit, sans-serif',
      fontSize: 12,
    },
    dividerColor: divider,
    neutralButtonClasses:
      'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
    primaryButtonClasses:
      'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors',
  }
}

