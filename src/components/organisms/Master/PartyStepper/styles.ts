import { SxProps, Theme, alpha } from '@mui/material/styles'
import {
  commonFieldStyles as projectCommonFieldStyles,
  compactFieldStyles as projectCompactFieldStyles,
  selectStyles as projectSelectStyles,
  datePickerStyles as projectDatePickerStyles,
  errorFieldStyles as projectErrorFieldStyles,
  labelSx as projectLabelSx,
  valueSx as projectValueSx,
  calendarIconSx as projectCalendarIconSx,
  cardStyles as projectCardStyles,
  backButtonSx as projectBackButtonSx,
  nextButtonSx as projectNextButtonSx,
  primaryButtonSx as projectPrimaryButtonSx,
} from '@/components/organisms/ProjectStepper/styles'

export const commonFieldStyles = (theme: Theme) =>
  projectCommonFieldStyles(theme)

export const compactFieldStyles = (theme: Theme) =>
  projectCompactFieldStyles(theme)

export const selectStyles = (theme: Theme) => projectSelectStyles(theme)

export const datePickerStyles = (theme: Theme) =>
  projectDatePickerStyles(theme)

export const errorFieldStyles = (theme: Theme) =>
  projectErrorFieldStyles(theme)

export const labelSx = (theme: Theme) => projectLabelSx(theme)

export const valueSx = (theme: Theme) => projectValueSx(theme)

export const calendarIconSx = (theme: Theme) => projectCalendarIconSx(theme)

export const cardStyles = (theme: Theme) => projectCardStyles(theme)

export const backButtonSx = (theme: Theme) => projectBackButtonSx(theme)

export const nextButtonSx = (theme: Theme) => projectNextButtonSx(theme)

export const primaryButtonSx = projectPrimaryButtonSx

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
