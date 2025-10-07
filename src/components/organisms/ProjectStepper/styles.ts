import { SxProps, Theme } from '@mui/material'

// Common field styles used across all steps
export const commonFieldStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    height: '46px',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#CAD5E2',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#CAD5E2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563EB',
    },
  },
}

// Smaller field styles for compact forms (like Step5)
export const compactFieldStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    height: '32px',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#CAD5E2',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#CAD5E2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563EB',
    },
  },
}

export const selectStyles: SxProps<Theme> = {
  height: '46px',
  '& .MuiOutlinedInput-root': {
    height: '46px',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#CAD5E2',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#CAD5E2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563EB',
    },
  },
  '& .MuiSelect-icon': {
    color: '#666',
  },
}

export const datePickerStyles: SxProps<Theme> = {
  height: '46px',
  '& .MuiOutlinedInput-root': {
    height: '46px',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#CAD5E2',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#CAD5E2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563EB',
    },
  },
}

export const errorFieldStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    height: '46px',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: 'red',
      borderWidth: '1px',
    },
  },
}

// Typography styles
export const labelSx: SxProps<Theme> = {
  color: '#6A7282',
  fontFamily: 'Outfit',
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: '12px',
  letterSpacing: 0,
}

export const valueSx: SxProps<Theme> = {
  color: '#1E2939',
  fontFamily: 'Outfit',
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: '14px',
  letterSpacing: 0,
  wordBreak: 'break-word',
}

// Compact typography for Step5
export const compactLabelSx: SxProps<Theme> = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  mb: 0.5,
}

export const compactValueSx: SxProps<Theme> = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#333',
  lineHeight: 1.4,
}

// Stepper label styles
export const stepperLabelSx: SxProps<Theme> = {
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: '12px',
  lineHeight: '100%',
  letterSpacing: '0.36px',
  textAlign: 'center',
  verticalAlign: 'middle',
  textTransform: 'uppercase',
}

// Card styles
export const cardStyles: SxProps<Theme> = {
  boxShadow: 'none',
  backgroundColor: '#FFFFFFBF',
  width: '94%',
  margin: '0 auto',
} as const

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

export const backButtonSx: SxProps<Theme> = {
  ...stepperButtonSx,
  backgroundColor: '#DBEAFE',
  color: '#155DFC',
  border: 'none',
}

export const nextButtonSx: SxProps<Theme> = {
  ...stepperButtonSx,
  backgroundColor: '#2563EB',
  color: '#FFFFFF',
  boxShadow: 'none',
}

// Calendar icon styles
export const calendarIconSx: SxProps<Theme> = {
  width: '18px',
  height: '20px',
  position: 'relative',
  top: '2px',
  left: '3px',
  transform: 'rotate(0deg)',
  opacity: 1,
}

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
export const formSectionSx: SxProps<Theme> = {
  my: 4,
  backgroundColor: '#FFFFFFBF',
  boxShadow: 'none',
}

export const buttonContainerSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: '#FFFFFFBF',
  mt: 3,
  mx: 6,
  mb: 2,
}
