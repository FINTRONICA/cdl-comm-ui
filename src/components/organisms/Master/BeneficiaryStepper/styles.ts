// import { SxProps, Theme, alpha } from '@mui/material/styles'
// import {
//   commonFieldStyles as projectCommonFieldStyles,
//   compactFieldStyles as projectCompactFieldStyles,
//   selectStyles as projectSelectStyles,
//   datePickerStyles as projectDatePickerStyles,
//   errorFieldStyles as projectErrorFieldStyles,
//   labelSx as projectLabelSx,
//   valueSx as projectValueSx,
//   calendarIconSx as projectCalendarIconSx,
//   cardStyles as projectCardStyles,
//   backButtonSx as projectBackButtonSx,
//   nextButtonSx as projectNextButtonSx,
//   primaryButtonSx as projectPrimaryButtonSx,
//   formSectionSx as projectFormSectionSx,
//   buttonContainerSx as projectButtonContainerSx,
//   stepperLabelSx as projectStepperLabelSx,
// } from '@/components/organisms/Master/styles'

// export const commonFieldStyles = (theme: Theme) =>
//   projectCommonFieldStyles(theme)

// export const compactFieldStyles = (theme: Theme) =>
//   projectCompactFieldStyles(theme)

// export const selectStyles = (theme: Theme) => projectSelectStyles(theme)

// export const datePickerStyles = (theme: Theme) =>
//   projectDatePickerStyles(theme)

// export const errorFieldStyles = (theme: Theme) =>
//   projectErrorFieldStyles(theme)

// export const labelSx = (theme: Theme) => projectLabelSx(theme)

// export const valueSx = (theme: Theme) => projectValueSx(theme)

// export const calendarIconSx = (theme: Theme) => projectCalendarIconSx(theme)

// export const cardStyles = (theme: Theme) => projectCardStyles(theme)

// export const backButtonSx = (theme: Theme) => projectBackButtonSx(theme)

// export const nextButtonSx = (theme: Theme) => projectNextButtonSx(theme)

// export const primaryButtonSx = projectPrimaryButtonSx

// export const viewModeInputStyles = (theme: Theme) => ({
//   backgroundColor:
//     theme.palette.mode === 'dark'
//       ? alpha(theme.palette.background.paper, 0.25)
//       : '#F9FAFB',
//   borderColor:
//     theme.palette.mode === 'dark'
//       ? alpha('#FFFFFF', 0.2)
//       : '#E5E7EB',
//   textColor: theme.palette.mode === 'dark' ? '#CBD5E1' : '#6B7280',
// })

// export const neutralBorder = (theme: Theme) =>
//   theme.palette.mode === 'dark' ? alpha('#FFFFFF', 0.3) : '#CAD5E2'

// export const neutralBorderHover = (theme: Theme) =>
//   theme.palette.mode === 'dark' ? alpha('#FFFFFF', 0.5) : '#CAD5E2'

// // Container styles
// export const outerContainerSx: SxProps<Theme> = (theme) => ({
//   width: '100%',
//   backgroundColor: theme.palette.mode === 'dark' ? '#101828' : 'rgba(255, 255, 255, 0.75)',
//   borderRadius: '16px',
//   paddingTop: '16px',
//   border: theme.palette.mode === 'dark'
//     ? '1px solid rgba(51, 65, 85, 1)'
//     : '1px solid #FFFFFF',
// })

// export const formSectionSx = projectFormSectionSx
// export const buttonContainerSx = projectButtonContainerSx
// export const stepperLabelSx = projectStepperLabelSx

// export const cancelButtonSx: SxProps<Theme> = (theme) => ({
//   fontFamily: 'Outfit, sans-serif',
//   fontWeight: 500,
//   fontSize: '14px',
//   color: theme.palette.mode === 'dark' ? '#93C5FD' : '#155DFC',
//   borderColor: theme.palette.mode === 'dark' ? '#334155' : '#CAD5E2',
//   '&:hover': {
//     borderColor: theme.palette.mode === 'dark' ? '#475569' : '#93C5FD',
//     backgroundColor: theme.palette.mode === 'dark'
//       ? 'rgba(51, 65, 85, 0.3)'
//       : 'rgba(219, 234, 254, 0.3)',
//   },
// })

import { SxProps, Theme, alpha } from '@mui/material/styles'
import {
  commonFieldStyles as projectCommonFieldStyles,
  selectStyles as projectSelectStyles,
  datePickerStyles as projectDatePickerStyles,
  labelSx as projectLabelSx,
  valueSx as projectValueSx,
  calendarIconSx as projectCalendarIconSx,
  cardStyles as projectCardStyles,
  errorFieldStyles as projectErrorFieldStyles,
  stepperLabelSx as projectStepperLabelSx,
  formSectionSx as projectFormSectionSx,
  buttonContainerSx as projectButtonContainerSx,
  backButtonSx as projectBackButtonSx,
  nextButtonSx as projectNextButtonSx,
  primaryButtonSx as projectPrimaryButtonSx
} from '../styles'

export const commonFieldStyles = projectCommonFieldStyles

export const selectStyles = projectSelectStyles

export const datePickerStyles = projectDatePickerStyles

export const labelSx = projectLabelSx

export const valueSx = projectValueSx

export const calendarIconSx = projectCalendarIconSx

export const cardStyles = projectCardStyles

export const errorFieldStyles = projectErrorFieldStyles

export const outerContainerSx: SxProps<Theme> = (theme) => ({
  width: '100%',
  backgroundColor:
    theme.palette.mode === 'dark' ? '#101828' : alpha('#FFFFFF', 0.75),
  borderRadius: '16px',
  paddingTop: '16px',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(51, 65, 85, 1)'
    : '1px solid #FFFFFF',
})

export const formSectionSx = projectFormSectionSx

export const buttonContainerSx = projectButtonContainerSx

export const stepperLabelSx = projectStepperLabelSx

export const backButtonSx = projectBackButtonSx

export const nextButtonSx = projectNextButtonSx

export const primaryButtonSx = projectPrimaryButtonSx

export const cancelButtonSx: SxProps<Theme> = (theme) => ({
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 500,
  fontStyle: 'normal',
  fontSize: '14px',
  lineHeight: '20px',
  letterSpacing: 0,
  color:
    theme.palette.mode === 'dark'
      ? theme.palette.text.primary
      : theme.palette.text.secondary,
  borderColor:
    theme.palette.mode === 'dark'
      ? alpha('#FFFFFF', 0.3)
      : theme.palette.divider,
  '&:hover': {
    borderColor:
      theme.palette.mode === 'dark'
        ? alpha('#FFFFFF', 0.5)
        : theme.palette.divider,
    backgroundColor:
      theme.palette.mode === 'dark'
        ? alpha('#FFFFFF', 0.08)
        : alpha('#000000', 0.04),
  },
})

export const viewModeInputStyles = (theme: Theme) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.25)
      : '#F9FAFB',
  borderColor:
    theme.palette.mode === 'dark'
      ? alpha('#FFFFFF', 0.2)
      : '#E5E7EB',
  textColor: theme.palette.mode === 'dark' ? '#CBD5E1' : '#6B7280',
})

export const neutralBorder = (theme: Theme) =>
  theme.palette.mode === 'dark' ? alpha('#FFFFFF', 0.3) : '#CAD5E2'

export const neutralBorderHover = (theme: Theme) =>
  theme.palette.mode === 'dark' ? alpha('#FFFFFF', 0.5) : '#CAD5E2'