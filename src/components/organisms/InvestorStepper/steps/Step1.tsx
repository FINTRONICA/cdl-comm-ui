// 'use client'

// import React, {
//   useState,
//   forwardRef,
//   useImperativeHandle,
//   useEffect,
// } from 'react'
// import { investorIdService } from '../../../../services/api/investorIdService'
// import { capitalPartnerService } from '../../../../services/api/capitalPartnerService'
// import { useGetEnhanced } from '@/hooks/useApiEnhanced'
// import { API_ENDPOINTS } from '@/constants/apiEndpoints'
// import { CapitalPartnerResponse } from '@/types/capitalPartner'
// import {
//   mapStep1ToCapitalPartnerPayload,
//   type Step1FormData,
// } from '../../../../utils/capitalPartnerMapper'
// import { Refresh as RefreshIcon } from '@mui/icons-material'
// import {
//   useInvestorTypes,
//   useInvestorIdTypes,
//   useCountries,
// } from '../../../../hooks/useApplicationSettings1'
// import { useCapitalPartnerLabelsApi } from '@/hooks/useCapitalPartnerLabelsApi'
// import { useAppStore } from '@/store'

// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   FormControl,
//   Grid,
//   InputAdornment,
//   InputLabel,
//   MenuItem,
//   Select,
//   TextField,
//   Typography,
//   useTheme,
// } from '@mui/material'
// import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
// import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
// import { Controller, useFormContext } from 'react-hook-form'
// import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
// import dayjs from 'dayjs'
// import { CapitalPartnerStep1Schema } from '@/lib/validation'
// import { FormError } from '../../../atoms/FormError'
// import { alpha } from '@mui/material/styles'

// interface Step1Props {
//   onSaveAndNext?: (data: any) => void
//   isEditMode?: boolean
//   capitalPartnerId?: number | null
//   isViewMode?: boolean
// }

// export interface Step1Ref {
//   handleSaveAndNext: () => Promise<void>
// }

// const Step1 = forwardRef<Step1Ref, Step1Props>(
//   (
//     { onSaveAndNext, isEditMode, capitalPartnerId, isViewMode = false },
//     ref
//   ) => {
//     const {
//       control,
//       watch,
//       setValue,
//       trigger,
//       formState: { errors },
//     } = useFormContext()

//     // Get labels from API
//     const { getLabel } = useCapitalPartnerLabelsApi()
//     const currentLanguage = useAppStore((state) => state.language)

//     const theme = useTheme()
//     const isDark = theme.palette.mode === 'dark'
//     const textPrimary = isDark ? '#FFFFFF' : '#1E2939'
//     const textSecondary = isDark ? '#CBD5E1' : '#6B7280'
//     const neutralBorder = isDark ? alpha('#FFFFFF', 0.3) : '#CAD5E2'
//     const neutralBorderHover = isDark ? alpha('#FFFFFF', 0.5) : '#CAD5E2'
//     const focusBorder = theme.palette.primary.main
//     const viewModeBorder = isDark ? alpha('#FFFFFF', 0.2) : '#E5E7EB'
//     const viewModeBg = isDark
//       ? alpha(theme.palette.background.paper, 0.25)
//       : '#F9FAFB'
//     const selectIconColor = isDark ? alpha('#FFFFFF', 0.7) : '#666'

//     const [investorId, setInvestorId] = useState<string>('')
//     const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)
//     const [saveError, setSaveError] = useState<string | null>(null)
//     const {
//       data: investorTypes,
//       loading: loadingInvestorTypes,
//       error: investorTypesError,
//     } = useInvestorTypes()
//     const {
//       data: idTypes,
//       loading: loadingIdTypes,
//       error: idTypesError,
//     } = useInvestorIdTypes()
//     const {
//       data: countries,
//       loading: loadingCountries,
//       error: countriesError,
//     } = useCountries()

//     // Load existing data when in edit mode
//     const {
//       data: existingCapitalPartnerData,
//       isLoading: isLoadingExistingData,
//     } = useGetEnhanced<CapitalPartnerResponse>(
//       API_ENDPOINTS.CAPITAL_PARTNER.GET_BY_ID(
//         (capitalPartnerId || 0).toString()
//       ),
//       {},
//       {
//         enabled: Boolean(isEditMode && capitalPartnerId),
//         // Disable caching to always fetch fresh data
//         gcTime: 0,
//         staleTime: 0,
//         // Always refetch when component mounts
//         refetchOnMount: 'always',
//         refetchOnWindowFocus: false,
//       }
//     )

//     // Pre-populate form when existing data is loaded
//     useEffect(() => {
//       if (isEditMode && existingCapitalPartnerData && !isLoadingExistingData) {
//         setValue(
//           'investorType',
//           existingCapitalPartnerData.investorTypeDTO?.settingValue || ''
//         )
//         setValue(
//           'investorId',
//           existingCapitalPartnerData.capitalPartnerId || ''
//         )
//         setValue(
//           'investorFirstName',
//           existingCapitalPartnerData.capitalPartnerName || ''
//         )
//         setValue(
//           'investorMiddleName',
//           existingCapitalPartnerData.capitalPartnerMiddleName || ''
//         )
//         setValue(
//           'investorLastName',
//           existingCapitalPartnerData.capitalPartnerLastName || ''
//         )
//         setValue(
//           'arabicName',
//           existingCapitalPartnerData.capitalPartnerLocaleName || ''
//         )
//         setValue(
//           'ownership',
//           existingCapitalPartnerData.capitalPartnerOwnershipPercentage?.toString() ||
//             ''
//         )
//         setValue(
//           'investorIdType',
//           existingCapitalPartnerData.documentTypeDTO?.settingValue || ''
//         )
//         setValue(
//           'idNumber',
//           existingCapitalPartnerData.capitalPartnerIdNo || ''
//         )
//         setValue(
//           'idExpiryDate',
//           existingCapitalPartnerData.idExpiaryDate
//             ? dayjs(existingCapitalPartnerData.idExpiaryDate)
//             : null
//         )
//         setValue(
//           'nationality',
//           existingCapitalPartnerData.countryOptionDTO?.settingValue || ''
//         )
//         setValue(
//           'accountContact',
//           existingCapitalPartnerData.capitalPartnerTelephoneNo || ''
//         )
//         setValue(
//           'mpmobileNumber',
//           existingCapitalPartnerData.capitalPartnerMobileNo || ''
//         )
//         setValue('email', existingCapitalPartnerData.capitalPartnerEmail || '')

//         // Set investorId state for the UI
//         setInvestorId(existingCapitalPartnerData.capitalPartnerId || '')
//       }
//     }, [
//       existingCapitalPartnerData,
//       isLoadingExistingData,
//       isEditMode,
//       setValue,
//     ])

//     React.useEffect(() => {
//       const currentId = watch('investorId')
//       if (currentId && currentId !== investorId) {
//         setInvestorId(currentId)
//       }
//     }, [watch, investorId])
//     const handleGenerateNewId = async () => {
//       try {
//         setIsGeneratingId(true)
//         const newIdResponse = investorIdService.generateNewId()
//         setInvestorId(newIdResponse.id)
//         // Update RHF state and re-validate so any prior error clears immediately
//         setValue('investorId', newIdResponse.id, {
//           shouldValidate: true,
//           shouldDirty: true,
//           shouldTouch: true,
//         })
//         await trigger('investorId')
//       } catch (error) {
//       } finally {
//         setIsGeneratingId(false)
//       }
//     }
//     const handleSaveAndNext = async () => {
//       try {
//         setSaveError(null)

//         // Build current form data for schema validation and payload mapping
//         const formData: Step1FormData = {
//           investorType: watch('investorType'),
//           investorId: watch('investorId'),
//           investorFirstName: watch('investorFirstName'),
//           investorMiddleName: watch('investorMiddleName'),
//           investorLastName: watch('investorLastName'),
//           arabicName: watch('arabicName'),
//           ownership: watch('ownership'),
//           investorIdType: watch('investorIdType'),
//           idNumber: watch('idNumber'),
//           idExpiryDate: watch('idExpiryDate'),
//           nationality: watch('nationality'),
//           accountContact: watch('accountContact'),
//           mpmobileNumber: watch('mpmobileNumber'),
//           email: watch('email'),
//         }

//         const zodResult = CapitalPartnerStep1Schema.safeParse(formData)
//         if (!zodResult.success) {
//           await trigger()

//           return
//         }

//         await trigger()

//         const payload = mapStep1ToCapitalPartnerPayload(
//           formData,
//           investorTypes,
//           idTypes,
//           countries
//         )
//         let response
//         if (isEditMode && capitalPartnerId) {
//           const updatePayload = {
//             ...payload,
//             id: capitalPartnerId,
//           }

//           if (existingCapitalPartnerData) {
//             updatePayload.capitalPartnerUnitDTO =
//               existingCapitalPartnerData.capitalPartnerUnitDTO

//             updatePayload.capitalPartnerBankInfoDTOS =
//               existingCapitalPartnerData.capitalPartnerBankInfoDTOS

//             if (existingCapitalPartnerData.taskStatusDTO?.id) {
//               updatePayload.taskStatusDTO = {
//                 id: existingCapitalPartnerData.taskStatusDTO.id,
//               }
//             }

//             updatePayload.deleted = existingCapitalPartnerData.deleted ?? false
//             updatePayload.enabled =
//               (existingCapitalPartnerData as any).enabled ?? true
//           }

//           response = await capitalPartnerService.updateCapitalPartner(
//             capitalPartnerId,
//             updatePayload
//           )
//         } else {
//           // Create new capital partner
//           response = await capitalPartnerService.createCapitalPartner(payload)
//         }

//         if (onSaveAndNext) {
//           onSaveAndNext(response)
//         }
//       } catch (error) {
//         setSaveError(
//           error instanceof Error ? error.message : 'Failed to save data'
//         )
//         throw error
//       }
//     }
//     useImperativeHandle(
//       ref,
//       () => ({
//         handleSaveAndNext,
//       }),
//       [handleSaveAndNext]
//     )
//     const commonFieldStyles = React.useMemo(
//       () => ({
//         '& .MuiOutlinedInput-root': {
//           height: '46px',
//           borderRadius: '8px',
//           backgroundColor: isDark
//             ? alpha(theme.palette.background.paper, 0.3)
//             : '#FFFFFF',
//           '& fieldset': {
//             borderColor: neutralBorder,
//             borderWidth: '1px',
//           },
//           '&:hover fieldset': {
//             borderColor: neutralBorderHover,
//           },
//           '&.Mui-focused fieldset': {
//             borderColor: focusBorder,
//           },
//         },
//       }),
//       [focusBorder, isDark, neutralBorder, neutralBorderHover, theme]
//     )

//     const selectStyles = React.useMemo(
//       () => ({
//         height: '46px',
//         '& .MuiOutlinedInput-root': {
//           height: '46px',
//           borderRadius: '8px',
//           backgroundColor: isDark
//             ? alpha(theme.palette.background.paper, 0.3)
//             : '#FFFFFF',
//           '& fieldset': {
//             borderColor: neutralBorder,
//             borderWidth: '1px',
//           },
//           '&:hover fieldset': {
//             borderColor: neutralBorderHover,
//           },
//           '&.Mui-focused fieldset': {
//             borderColor: focusBorder,
//           },
//         },
//         '& .MuiSelect-icon': {
//           color: selectIconColor,
//         },
//       }),
//       [
//         focusBorder,
//         isDark,
//         neutralBorder,
//         neutralBorderHover,
//         selectIconColor,
//         theme,
//       ]
//     )

//     const datePickerStyles = React.useMemo(
//       () => ({
//         height: '46px',
//         '& .MuiOutlinedInput-root': {
//           height: '46px',
//           borderRadius: '8px',
//           backgroundColor: isDark
//             ? alpha(theme.palette.background.paper, 0.3)
//             : '#FFFFFF',
//           '& fieldset': {
//             borderColor: neutralBorder,
//             borderWidth: '1px',
//           },
//           '&:hover fieldset': {
//             borderColor: neutralBorderHover,
//           },
//           '&.Mui-focused fieldset': {
//             borderColor: focusBorder,
//           },
//         },
//       }),
//       [focusBorder, isDark, neutralBorder, neutralBorderHover, theme]
//     )

//     const getLabelSx = () => ({
//       color: textPrimary,
//       fontFamily:
//         'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//       fontWeight: 500,
//       fontStyle: 'normal',
//       fontSize: '13px',
//       letterSpacing: '0.025em',
//       marginBottom: '4px',
//       '&.Mui-focused': {
//         color: theme.palette.primary.main,
//       },
//       '&.MuiFormLabel-filled': {
//         color: textPrimary,
//       },
//     })

//     const valueSx = {
//       color: textPrimary,
//       fontFamily: 'Outfit',
//       fontWeight: 400,
//       fontStyle: 'normal',
//       fontSize: '14px',
//       letterSpacing: 0,
//       wordBreak: 'break-word',
//     }

//     const StyledCalendarIcon = (
//       props: React.ComponentProps<typeof CalendarTodayOutlinedIcon>
//     ) => (
//       <CalendarTodayOutlinedIcon
//         {...props}
//         sx={{
//           width: '18px',
//           height: '20px',
//           position: 'relative',
//           top: '2px',
//           left: '3px',
//           transform: 'rotate(0deg)',
//           opacity: 1,
//         }}
//       />
//     )

//     const renderTextField = (
//       name: string,
//       configId: string,
//       fallbackLabel: string,
//       defaultValue = '',
//       required = false
//     ) => {
//       const label = getLabel(configId, currentLanguage, fallbackLabel)
//       return (
//         <Grid key={name} size={{ xs: 12, md: 6 }}>
//           <Controller
//             name={name}
//             control={control}
//             defaultValue={defaultValue}
//             render={({ field }) => (
//               <>
//                 <TextField
//                   {...field}
//                   label={label}
//                   fullWidth
//                   required={required}
//                   disabled={isViewMode}
//                   error={!!errors[name] && !isViewMode}
//                   InputLabelProps={{
//                     sx: {
//                       ...getLabelSx(),
//                       ...(!!errors[name] &&
//                         !isViewMode && {
//                           color: theme.palette.error.main,
//                           '&.Mui-focused': { color: theme.palette.error.main },
//                           '&.MuiFormLabel-filled': {
//                             color: theme.palette.error.main,
//                           },
//                         }),
//                     },
//                   }}
//                   InputProps={{
//                     sx: {
//                       ...valueSx,
//                       ...(isViewMode && {
//                         backgroundColor: viewModeBg,
//                         color: textSecondary,
//                         '& .MuiOutlinedInput-notchedOutline': {
//                           borderColor: viewModeBorder,
//                         },
//                       }),
//                     },
//                   }}
//                   sx={{
//                     ...commonFieldStyles,
//                     ...(isViewMode && {
//                       '& .MuiOutlinedInput-root': {
//                         '& fieldset': { borderColor: viewModeBorder },
//                         '&:hover fieldset': { borderColor: viewModeBorder },
//                         '&.Mui-focused fieldset': {
//                           borderColor: viewModeBorder,
//                         },
//                       },
//                     }),
//                     ...(!!errors[name] &&
//                       !isViewMode && {
//                         '& .MuiOutlinedInput-root': {
//                           '& fieldset': {
//                             borderColor: theme.palette.error.main,
//                             borderWidth: '1px',
//                           },
//                           '&:hover fieldset': {
//                             borderColor: theme.palette.error.main,
//                             borderWidth: '1px',
//                           },
//                           '&.Mui-focused fieldset': {
//                             borderColor: theme.palette.error.main,
//                             borderWidth: '1px',
//                           },
//                         },
//                       }),
//                   }}
//                 />
//                 <FormError
//                   error={errors[name]?.message as string}
//                   touched={true}
//                 />
//               </>
//             )}
//           />
//         </Grid>
//       )
//     }

//     const renderInvestorIdField = (
//       name: string,
//       label: string,
//       gridSize: number = 6,
//       required: boolean = false
//     ) => (
//       <Grid key={name} size={{ xs: 12, md: gridSize }}>
//         <Controller
//           name={name}
//           control={control}
//           defaultValue=""
//           render={({ field }) => (
//             <>
//               <TextField
//                 {...field}
//                 fullWidth
//                 label={label}
//                 value={investorId}
//                 required={required}
//                 disabled={isViewMode}
//                 error={!!errors[name] && !isViewMode}
//                 onChange={(e) => {
//                   setInvestorId(e.target.value)
//                   field.onChange(e)
//                 }}
//                 InputProps={{
//                   endAdornment: !isViewMode ? (
//                     <InputAdornment position="end" sx={{ mr: 0 }}>
//                       <Button
//                         variant="contained"
//                         size="small"
//                         startIcon={<RefreshIcon />}
//                         onClick={handleGenerateNewId}
//                         disabled={
//                           isGeneratingId || isViewMode || (isEditMode ?? false)
//                         }
//                         sx={{
//                           color: theme.palette.primary.contrastText,
//                           borderRadius: '8px',
//                           textTransform: 'none',
//                           background: theme.palette.primary.main,
//                           '&:hover': {
//                             background: theme.palette.primary.dark,
//                           },
//                           minWidth: '100px',
//                           height: '32px',
//                           fontFamily: 'Outfit, sans-serif',
//                           fontWeight: 500,
//                           fontStyle: 'normal',
//                           fontSize: '11px',
//                           lineHeight: '14px',
//                           letterSpacing: '0.3px',
//                           px: 1,
//                         }}
//                       >
//                         {isGeneratingId ? 'Generating...' : 'Generate ID'}
//                       </Button>
//                     </InputAdornment>
//                   ) : undefined,
//                   sx: valueSx,
//                 }}
//                 InputLabelProps={{ sx: getLabelSx() }}
//                 sx={{
//                   ...commonFieldStyles,
//                   ...(!!errors[name] &&
//                     !isViewMode && {
//                       '& .MuiOutlinedInput-root': {
//                         '& fieldset': {
//                           borderColor: theme.palette.error.main,
//                           borderWidth: '1px',
//                         },
//                         '&:hover fieldset': {
//                           borderColor: theme.palette.error.main,
//                           borderWidth: '1px',
//                         },
//                         '&.Mui-focused fieldset': {
//                           borderColor: theme.palette.error.main,
//                           borderWidth: '1px',
//                         },
//                       },
//                     }),
//                 }}
//               />
//               <FormError
//                 error={errors[name]?.message as string}
//                 touched={true}
//               />
//             </>
//           )}
//         />
//       </Grid>
//     )

//     // Render function for API-driven dropdowns
//     const renderApiSelectField = (
//       name: string,
//       configId: string,
//       fallbackLabel: string,
//       options: { id: number; displayName: string; settingValue: string }[],
//       gridSize: number = 6,
//       _required = false,
//       loading = false
//     ) => {
//       const label = getLabel(configId, currentLanguage, fallbackLabel)
//       return (
//         <Grid key={name} size={{ xs: 12, md: gridSize }}>
//           <Controller
//             name={name}
//             control={control}
//             rules={{}}
//             defaultValue={''}
//             render={({ field }) => (
//               <>
//                 <FormControl
//                   fullWidth
//                   error={!!errors[name] && !isViewMode}
//                   required={_required}
//                   sx={{
//                     '& .MuiFormLabel-asterisk': {
//                       color: `${textSecondary} !important`,
//                     },
//                   }}
//                 >
//                   <InputLabel sx={getLabelSx()}>
//                     {loading ? `Loading...` : label}
//                   </InputLabel>
//                   <Select
//                     {...field}
//                     label={loading ? `Loading...` : label}
//                     sx={{
//                       ...selectStyles,
//                       ...valueSx,
//                       ...(isViewMode && {
//                         backgroundColor: viewModeBg,
//                         color: textSecondary,
//                         '& .MuiOutlinedInput-notchedOutline': {
//                           borderColor: viewModeBorder,
//                         },
//                       }),
//                       '& .MuiOutlinedInput-notchedOutline': {
//                         border: `1px solid ${neutralBorder}`,
//                         borderRadius: '6px',
//                       },
//                       '&:hover .MuiOutlinedInput-notchedOutline': {
//                         border: `1px solid ${neutralBorderHover}`,
//                       },
//                       '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
//                         border: `2px solid ${focusBorder}`,
//                       },
//                       ...(!!errors[name] &&
//                         !isViewMode && {
//                           '& .MuiOutlinedInput-notchedOutline': {
//                             border: `1px solid ${theme.palette.error.main}`,
//                           },
//                           '&:hover .MuiOutlinedInput-notchedOutline': {
//                             border: `1px solid ${theme.palette.error.main}`,
//                           },
//                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
//                             border: `1px solid ${theme.palette.error.main}`,
//                           },
//                         }),
//                     }}
//                     IconComponent={KeyboardArrowDownIcon}
//                     disabled={loading || isViewMode}
//                   >
//                     {options.map((option) => (
//                       <MenuItem key={option.id} value={option.settingValue}>
//                         {option.displayName}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//                 <FormError
//                   error={errors[name]?.message as string}
//                   touched={true}
//                 />
//               </>
//             )}
//           />
//         </Grid>
//       )
//     }

//     const getFallbackOptions = (key: string) => {
//       switch (key) {
//         case 'investorType':
//           return [
//             { id: 1, displayName: 'Individual', settingValue: 'CP_INDIVIDUAL' },
//             { id: 2, displayName: 'Company', settingValue: 'CP_COMPANY' },
//             { id: 3, displayName: 'Joint', settingValue: 'CP_JOINT' },
//           ]
//         case 'investorIdType':
//           return [
//             { id: 1, displayName: 'Passport', settingValue: 'PASSPORT' },
//             { id: 2, displayName: 'National ID', settingValue: 'NATIONAL_ID' },
//           ]
//         case 'nationality':
//           return [
//             { id: 1, displayName: 'India', settingValue: 'AS_COUNTRY_INDIA' },
//             { id: 2, displayName: 'Dubai', settingValue: 'AS_COUNTRY_DUBAI' },
//             {
//               id: 3,
//               displayName: 'Abu Dhabi',
//               settingValue: 'AS_COUNTRY_ABU_DHABI',
//             },
//             {
//               id: 4,
//               displayName: 'South Africa',
//               settingValue: 'AS_COUNTRY_SA',
//             },
//             { id: 5, displayName: 'USA', settingValue: 'AS_COUNTRY_USA' },
//           ]
//         default:
//           return []
//       }
//     }

//     return (
//       <LocalizationProvider dateAdapter={AdapterDayjs}>
//         <Card
//           sx={{
//             boxShadow: 'none',
//             backgroundColor: isDark
//               ? alpha(theme.palette.background.paper, 0.35)
//               : '#FFFFFFBF',
//             width: '84%',
//             margin: '0 auto',
//             color: textPrimary,
//           }}
//         >
//           <CardContent sx={{ color: textPrimary }}>
//             {(investorTypesError || idTypesError || countriesError) && (
//               <Box
//                 sx={{
//                   mb: 2,
//                   p: 1,
//                   bgcolor: isDark
//                     ? alpha(theme.palette.error.main, 0.15)
//                     : '#fef2f2',
//                   borderRadius: 1,
//                   border: `1px solid ${alpha(theme.palette.error.main, 0.4)}`,
//                 }}
//               >
//                 <Typography variant="body2" color="error">
//                   ⚠️ Failed to load some dropdown options. Using fallback
//                   values.
//                 </Typography>
//               </Box>
//             )}
//             {saveError && (
//               <Box
//                 sx={{
//                   mb: 2,
//                   p: 1,
//                   bgcolor: isDark
//                     ? alpha(theme.palette.error.main, 0.15)
//                     : '#fef2f2',
//                   borderRadius: 1,
//                   border: `1px solid ${alpha(theme.palette.error.main, 0.4)}`,
//                 }}
//               >
//                 <Typography variant="body2" color="error">
//                   ⚠️ 123{saveError} 456
//                 </Typography>
//               </Box>
//             )}

//             <Grid container rowSpacing={4} columnSpacing={2}>
//               {renderApiSelectField(
//                 'investorType',
//                 'CDL_CP_TYPE',
//                 'Investor Type',
//                 investorTypes?.length
//                   ? investorTypes
//                   : getFallbackOptions('investorType'),
//                 6,
//                 true,
//                 loadingInvestorTypes
//               )}
//               {renderInvestorIdField(
//                 'investorId',
//                 getLabel('CDL_CP_REFID', currentLanguage, 'Investor ID'),
//                 6,
//                 true
//               )}
//               {renderTextField(
//                 'investorFirstName',
//                 'CDL_CP_FIRSTNAME',
//                 'Investor Name',
//                 '',
//                 true
//               )}
//               {renderTextField(
//                 'investorMiddleName',
//                 'CDL_CP_MIDDLENAME',
//                 'Middle Name'
//               )}
//               {renderTextField(
//                 'investorLastName',
//                 'CDL_CP_LASTNAME',
//                 'Last Name'
//               )}
//               {renderTextField(
//                 'arabicName',
//                 'CDL_CP_LOCALE_NAME',
//                 'Arabic Name'
//               )}
//               {renderTextField(
//                 'ownership',
//                 'CDL_CP_OWNERSHIP',
//                 'Ownership Percentage'
//               )}
//               {renderApiSelectField(
//                 'investorIdType',
//                 'CDL_CP_ID_TYPE',
//                 'Investor ID Type',
//                 idTypes?.length
//                   ? idTypes
//                   : getFallbackOptions('investorIdType'),
//                 6,
//                 true,
//                 loadingIdTypes
//               )}
//               {renderTextField('idNumber', 'CDL_CP_DOC_NO', 'ID No.', '', true)}
//               <Grid size={{ xs: 12, md: 6 }}>
//                 <Controller
//                   name="idExpiryDate"
//                   control={control}
//                   defaultValue={null}
//                   render={({ field }) => (
//                     <>
//                       <DatePicker
//                         label={getLabel(
//                           'CDL_CP_ID_EXP',
//                           currentLanguage,
//                           'ID Expiry Date'
//                         )}
//                         value={field.value}
//                         onChange={field.onChange}
//                         format="DD/MM/YYYY"
//                         disabled={isViewMode}
//                         slots={{ openPickerIcon: StyledCalendarIcon }}
//                         slotProps={{
//                           textField: {
//                             fullWidth: true,
//                             error: !!errors.idExpiryDate && !isViewMode,
//                             helperText: '',
//                             sx: {
//                               ...datePickerStyles,
//                               ...(!!errors.idExpiryDate &&
//                                 !isViewMode && {
//                                   '& .MuiOutlinedInput-root': {
//                                     '& fieldset': {
//                                       borderColor: theme.palette.error.main,
//                                     },
//                                     '&:hover fieldset': {
//                                       borderColor: theme.palette.error.main,
//                                     },
//                                     '&.Mui-focused fieldset': {
//                                       borderColor: theme.palette.error.main,
//                                     },
//                                   },
//                                 }),
//                             },
//                             InputLabelProps: { sx: getLabelSx() },
//                             InputProps: {
//                               sx: valueSx,
//                               style: { height: '46px' },
//                             },
//                           },
//                         }}
//                       />
//                       <FormError
//                         error={(errors as any).idExpiryDate?.message as string}
//                         touched={true}
//                       />
//                     </>
//                   )}
//                 />
//               </Grid>
//               {renderApiSelectField(
//                 'nationality',
//                 'CDL_CP_NATIONALITY',
//                 'Nationality',
//                 countries?.length
//                   ? countries
//                   : getFallbackOptions('nationality'),
//                 6,
//                 false,
//                 loadingCountries
//               )}
//               {renderTextField(
//                 'accountContact',
//                 'CDL_CP_TELEPHONE',
//                 'Account Contact Number',
//                 ''
//               )}
//               {renderTextField(
//                 'mpmobileNumber',
//                 'CDL_CP_MOBILE',
//                 'Mobile Number',
//                 ''
//               )}
//               {renderTextField('email', 'CDL_CP_EMAIL', 'Email Address', '')}
//             </Grid>
//           </CardContent>
//         </Card>
//       </LocalizationProvider>
//     )
//   }
// )

// Step1.displayName = 'Step1'

// export default Step1
