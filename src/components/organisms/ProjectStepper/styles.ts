import { SxProps, Theme, alpha } from '@mui/material'

// Common field styles used across all steps
export const commonFieldStyles: SxProps<Theme> = (theme: Theme) => ({
  '& .MuiOutlinedInput-root': {
    height: '46px',
    borderRadius: '8px',
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.background.paper, 0.5) 
      : '#FFFFFF',
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' 
        ? alpha('#FFFFFF', 0.3) 
        : '#CAD5E2',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' 
        ? alpha('#FFFFFF', 0.5) 
        : '#CAD5E2',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '& .MuiInputBase-input': {
      color: theme.palette.mode === 'dark' 
        ? '#FFFFFF' 
        : '#1E2939',
    },
  },
})

// Smaller field styles for compact forms (like Step5)
export const compactFieldStyles: SxProps<Theme> = (theme: Theme) => ({
  '& .MuiOutlinedInput-root': {
    height: '32px',
    borderRadius: '8px',
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.background.paper, 0.5) 
      : '#FFFFFF',
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' 
        ? alpha('#FFFFFF', 0.3) 
        : '#CAD5E2',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' 
        ? alpha('#FFFFFF', 0.5) 
        : '#CAD5E2',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '& .MuiInputBase-input': {
      color: theme.palette.mode === 'dark' 
        ? '#FFFFFF' 
        : '#1E2939',
    },
  },
})

export const selectStyles: SxProps<Theme> = (theme: Theme) => ({
  height: '46px',
  '& .MuiOutlinedInput-root': {
    height: '46px',
    borderRadius: '8px',
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.background.paper, 0.5) 
      : '#FFFFFF',
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' 
        ? alpha('#FFFFFF', 0.3) 
        : '#CAD5E2',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' 
        ? alpha('#FFFFFF', 0.5) 
        : '#CAD5E2',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '& .MuiInputBase-input': {
      color: theme.palette.mode === 'dark' 
        ? '#FFFFFF' 
        : '#1E2939',
    },
  },
  '& .MuiSelect-icon': {
    color: theme.palette.mode === 'dark' 
      ? alpha('#FFFFFF', 0.7) 
      : '#666',
  },
})

export const datePickerStyles: SxProps<Theme> = (theme: Theme) => ({
  height: '46px',
  '& .MuiOutlinedInput-root': {
    height: '46px',
    borderRadius: '8px',
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.background.paper, 0.5) 
      : '#FFFFFF',
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' 
        ? alpha('#FFFFFF', 0.3) 
        : '#CAD5E2',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' 
        ? alpha('#FFFFFF', 0.5) 
        : '#CAD5E2',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '& .MuiInputBase-input': {
      color: theme.palette.mode === 'dark' 
        ? '#FFFFFF' 
        : '#1E2939',
    },
  },
})

export const errorFieldStyles: SxProps<Theme> = (theme: Theme) => ({
  '& .MuiOutlinedInput-root': {
    height: '46px',
    borderRadius: '8px',
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.error.main, 0.15) 
      : alpha(theme.palette.error.main, 0.08),
    '& fieldset': {
      borderColor: theme.palette.error.main,
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.error.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.error.main,
      borderWidth: '2px',
    },
    '& .MuiInputBase-input': {
      color: theme.palette.mode === 'dark' 
        ? '#FFFFFF' 
        : '#1E2939',
    },
  },
})

// Typography styles
export const labelSx: SxProps<Theme> = (theme: Theme) => ({
  color: theme.palette.mode === 'dark' 
    ? '#FFFFFF' 
    : '#6A7282',
  fontFamily: 'Outfit',
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: '12px',
  letterSpacing: 0,
})

export const valueSx: SxProps<Theme> = (theme: Theme) => ({
  color: theme.palette.mode === 'dark' 
    ? '#FFFFFF' 
    : '#1E2939',
  fontFamily: 'Outfit',
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: '14px',
  letterSpacing: 0,
  wordBreak: 'break-word',
})

// Compact typography for Step5
export const compactLabelSx: SxProps<Theme> = (theme: Theme) => ({
  fontSize: '12px',
  fontWeight: 600,
  color: theme.palette.mode === 'dark' 
    ? alpha('#FFFFFF', 0.7) 
    : '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  mb: 0.5,
})

export const compactValueSx: SxProps<Theme> = (theme: Theme) => ({
  fontSize: '14px',
  fontWeight: 500,
  color: theme.palette.mode === 'dark' 
    ? theme.palette.text.primary 
    : '#333',
  lineHeight: 1.4,
})

// Stepper label styles
export const stepperLabelSx: SxProps<Theme> = (theme: Theme) => ({
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: '12px',
  lineHeight: '100%',
  letterSpacing: '0.36px',
  textAlign: 'center',
  verticalAlign: 'middle',
  textTransform: 'uppercase',
  color: theme.palette.mode === 'dark' 
    ? theme.palette.text.primary 
    : theme.palette.text.primary,
})

// Card styles
export const cardStyles: SxProps<Theme> = (theme: Theme) => ({
  boxShadow: 'none',
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#111827' 
    : alpha('#FFFFFF', 0.75),
  width: '94%',
  margin: '0 auto',
  color: theme.palette.mode === 'dark' 
    ? '#FFFFFF' 
    : theme.palette.text.primary,
})

// Field box styles for display fields
export const fieldBoxSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
}

// Button styles
export const primaryButtonSx: SxProps<Theme> = {
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 500,
  fontStyle: 'normal',
  fontSize: '14px',
  lineHeight: '20px',
  letterSpacing: 0,
}

export const stepperButtonSx: SxProps<Theme> = {
  width: '114px',
  height: '36px',
  gap: '6px',
  opacity: 1,
  paddingTop: '2px',
  paddingRight: '3px',
  paddingBottom: '2px',
  paddingLeft: '3px',
  borderRadius: '6px',
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 500,
  fontStyle: 'normal',
  fontSize: '14px',
  lineHeight: '20px',
  letterSpacing: 0,
}

export const backButtonSx: SxProps<Theme> = (theme: Theme) => ({
  width: '114px',
  height: '36px',
  gap: '6px',
  opacity: 1,
  paddingTop: '2px',
  paddingRight: '3px',
  paddingBottom: '2px',
  paddingLeft: '3px',
  borderRadius: '6px',
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 500,
  fontStyle: 'normal',
  fontSize: '14px',
  lineHeight: '20px',
  letterSpacing: 0,
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.primary.main, 0.2) 
    : '#DBEAFE',
  color: theme.palette.mode === 'dark' 
    ? theme.palette.primary.light 
    : '#155DFC',
  border: 'none',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.primary.main, 0.3) 
      : alpha('#DBEAFE', 0.8),
  },
})

export const nextButtonSx: SxProps<Theme> = (theme: Theme) => ({
  width: '114px',
  height: '36px',
  gap: '6px',
  opacity: 1,
  paddingTop: '2px',
  paddingRight: '3px',
  paddingBottom: '2px',
  paddingLeft: '3px',
  borderRadius: '6px',
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 500,
  fontStyle: 'normal',
  fontSize: '14px',
  lineHeight: '20px',
  letterSpacing: 0,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
})

// Calendar icon styles
export const calendarIconSx: SxProps<Theme> = (theme: Theme) => ({
  width: '18px',
  height: '20px',
  position: 'relative',
  top: '2px',
  left: '3px',
  transform: 'rotate(0deg)',
  opacity: 1,
  color: theme.palette.mode === 'dark' 
    ? alpha('#FFFFFF', 0.7) 
    : theme.palette.text.secondary,
})

// Loading and error states
export const loadingContainerSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
}

export const errorContainerSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
}

// Form section styles
export const formSectionSx: SxProps<Theme> = (theme: Theme) => ({
  my: 4,
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#111827' 
    : alpha('#FFFFFF', 0.75),
  boxShadow: 'none',
  color: theme.palette.mode === 'dark' 
    ? '#FFFFFF' 
    : theme.palette.text.primary,
})

export const buttonContainerSx: SxProps<Theme> = (theme: Theme) => ({
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#111827' 
    : alpha('#FFFFFF', 0.75),
  mt: 3,
  mx: 6,
  mb: 2,
})
