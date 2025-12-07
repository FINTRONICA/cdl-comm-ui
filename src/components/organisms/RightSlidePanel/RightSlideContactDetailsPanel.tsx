import React, { useState, useCallback } from 'react'
import {
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Drawer,
  Box,
  Alert,
  Snackbar,
  OutlinedInput,
} from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { Controller, useForm } from 'react-hook-form'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import {
  useSaveBuildPartnerContact,
  useBuildPartnerContactById,
} from '@/hooks/useBuildPartners'
import { DeveloperStep3Schema } from '@/lib/validation/developerSchemas'
import { useFeeDropdownLabels } from '@/hooks/useFeeDropdowns'
import {
  type BuildPartnerContactData,
  type BuildPartnerContactResponse,
} from '@/services/api/buildPartnerService'
import { useBuildPartnerLabelsWithCache } from '@/hooks/useBuildPartnerLabelsWithCache'
import { getBuildPartnerLabel } from '@/constants/mappings/buildPartnerMapping'
import { useAppStore } from '@/store'
import { FormError } from '../../atoms/FormError'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from './panelTheme'

interface RightSlidePanelProps {
  isOpen: boolean
  onClose: () => void
  onContactAdded?: (contact: unknown) => void
  onContactUpdated?: (contact: unknown, index: number) => void
  title?: string
  buildPartnerId?: string | undefined
  mode?: 'add' | 'edit'
  contactData?: {
    id?: string | number
    name?: string
    address?: string
    email?: string
    pobox?: string
    countrycode?: string
    mobileno?: string
    telephoneno?: string
    fax?: string
    buildPartnerDTO?: {
      id: number
    }
  }
  contactIndex?: number
}

interface ContactFormData {
  fname: string
  lname: string
  email: string
  address1: string
  address2: string
  pobox: string
  countrycode: string
  telephoneno: string
  mobileno: string
  fax: string
}

export const RightSlideContactDetailsPanel: React.FC<RightSlidePanelProps> = ({
  isOpen,
  onClose,
  onContactAdded,
  onContactUpdated,
  buildPartnerId,
  mode = 'add',
  contactData,
  contactIndex,
}) => {
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const addContactMutation = useSaveBuildPartnerContact()

  const { data: apiContactData } = useBuildPartnerContactById(
    mode === 'edit' && contactData?.id ? contactData.id : null
  )

  const {
    countryCodes = [],
    countryCodesLoading,
    countryCodesError,
    getDisplayLabel,
  } = useFeeDropdownLabels()

  // Phase 1: Dynamic label foundation
  const { data: buildPartnerLabels, getLabel } =
    useBuildPartnerLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getBuildPartnerLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getBuildPartnerLabel(configId)
      return buildPartnerLabels
        ? getLabel(configId, currentLanguage, fallback)
        : fallback
    },
    [buildPartnerLabels, currentLanguage, getLabel]
  )

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<ContactFormData>({
    defaultValues: {
      fname: '',
      lname: '',
      email: '',
      address1: '',
      address2: '',
      pobox: '',
      countrycode: '',
      telephoneno: '',
      mobileno: '',
      fax: '',
    },
    mode: 'onChange',
  })

  const validateContactField = (
    fieldName: string,
    _value: any,
    allValues: ContactFormData
  ) => {
    try {
      const selectedCountryCode = countryCodes.find(
        (country) => country.id.toString() === allValues.countrycode.toString()
      )
      const countryCodeValue = selectedCountryCode
        ? selectedCountryCode.configValue
        : allValues.countrycode

      const contactForValidation = {
        contactData: [
          {
            name: `${allValues.fname} ${allValues.lname}`.trim(),
            address: `${allValues.address1} ${allValues.address2}`.trim(),
            email: allValues.email,
            pobox: allValues.pobox,
            countrycode: countryCodeValue,
            mobileno: allValues.mobileno,
            telephoneno: allValues.telephoneno,
            fax: allValues.fax,
            buildPartnerDTO: {
              id: buildPartnerId ? parseInt(buildPartnerId) : undefined,
            },
          },
        ],
      }

      const result = DeveloperStep3Schema.safeParse(contactForValidation)

      if (result.success) {
        return true
      } else {
        const fieldMapping: Record<string, string> = {
          fname: 'name',
          lname: 'name',
          email: 'email',
          address1: 'address',
          address2: 'address',
          pobox: 'pobox',
          countrycode: 'countrycode',
          mobileno: 'mobileno',
          telephoneno: 'telephoneno',
          fax: 'fax',
        }

        const schemaFieldName = fieldMapping[fieldName]

        if (!schemaFieldName) {
          return true
        }

        const fieldError = result.error.issues.find(
          (issue) =>
            issue.path.includes('contactData') &&
            issue.path.includes(0) &&
            issue.path.includes(schemaFieldName)
        )

        if (fieldError) {
          return fieldError.message
        }

        return true
      }
    } catch (error) {
      return true
    }
  }

  React.useEffect(() => {
    if (isOpen && mode === 'edit' && (apiContactData || contactData)) {
      const dataToUse: any = apiContactData || contactData

      const firstName =
        dataToUse.bpcFirstName || contactData?.name?.split(' ')[0] || ''
      const lastName =
        dataToUse.bpcLastName ||
        contactData?.name?.split(' ').slice(1).join(' ') ||
        ''

      const address1 = dataToUse.bpcContactmpaddressLine1 || ''
      const address2 = dataToUse.bpcContactmpaddressLine2 || ''

      const countryCodeFromApi =
        dataToUse.bpcCountryMobCode || contactData?.countrycode || ''
      let countryCodeId = countryCodeFromApi

      if (countryCodes.length > 0 && countryCodeFromApi) {
        const matchingCountry = countryCodes.find(
          (country) =>
            country.configValue === countryCodeFromApi ||
            country.id?.toString() === countryCodeFromApi
        )
        if (matchingCountry) {
          countryCodeId = matchingCountry.id?.toString() || ''
        }
      }

      reset({
        fname: firstName,
        lname: lastName,
        email: dataToUse.bpcContactEmail || contactData?.email || '',
        address1: address1,
        address2: address2,
        pobox: dataToUse.bpcContactPoBox || contactData?.pobox || '',
        countrycode: countryCodeId,
        telephoneno:
          dataToUse.bpcContactTelNo || contactData?.telephoneno || '',
        mobileno: dataToUse.bpcContactMobNo || contactData?.mobileno || '',
        fax: dataToUse.bpcContactFaxNo || contactData?.fax || '',
      })
    } else if (isOpen && mode === 'add') {
      reset({
        fname: '',
        lname: '',
        email: '',
        address1: '',
        address2: '',
        pobox: '',
        countrycode: '',
        telephoneno: '',
        mobileno: '',
        fax: '',
      })
    }
  }, [isOpen, mode, contactData, apiContactData, reset, countryCodes])

  const onSubmit = async (data: ContactFormData) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      // Trigger validation on all fields to show errors even if not touched
      const isValid = await trigger([
        'fname',
        'lname',
        'email',
        'address1',
        'address2',
        'pobox',
        'countrycode',
        'mobileno',
        'telephoneno',
        'fax',
      ])

      // If field-level validation fails, don't proceed
      if (!isValid) {
        return
      }

      const selectedCountryCode = countryCodes.find(
        (country) => country.id.toString() === data.countrycode.toString()
      )
      const countryCodeValue = selectedCountryCode
        ? selectedCountryCode.configValue
        : data.countrycode

      const isEditing = mode === 'edit'

      const contactForValidation = {
        contactData: [
          {
            name: `${data.fname} ${data.lname}`.trim(),
            address: `${data.address1} ${data.address2}`.trim(),
            email: data.email,
            pobox: data.pobox,
            countrycode: countryCodeValue,
            mobileno: data.mobileno,
            telephoneno: data.telephoneno,
            fax: data.fax,
            buildPartnerDTO: {
              id: buildPartnerId ? parseInt(buildPartnerId) : undefined,
            },
          },
        ],
      }

      const validationResult =
        DeveloperStep3Schema.safeParse(contactForValidation)
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(
          (issue: { message: string }) => issue.message
        )
        setErrorMessage(errorMessages.join(', '))
        return
      }

      const contactPayload: BuildPartnerContactData = {
        ...(isEditing && contactData?.id && { id: contactData.id }),
        bpcFirstName: data.fname,
        bpcLastName: data.lname,
        bpcContactEmail: data.email,
        bpcContactmpaddressLine1: data.address1,
        bpcContactmpaddressLine2: data.address2,
        bpcContactPoBox: data.pobox,
        bpcCountryMobCode: countryCodeValue,
        bpcContactTelNo: data.telephoneno,
        bpcContactMobNo: data.mobileno,
        bpcContactFaxNo: data.fax,

        ...(isEditing && apiContactData
          ? {
              enabled: true,
              deleted: false,
              workflowStatus:
                (apiContactData as BuildPartnerContactResponse)
                  .workflowStatus ?? null,
            }
          : {}),
        ...(buildPartnerId && {
          buildPartnerDTO: {
            id: parseInt(buildPartnerId),
          },
        }),
      }

      await addContactMutation.mutateAsync({
        data: contactPayload,
        isEditing: isEditing,
        developerId: buildPartnerId,
      })

      setSuccessMessage(
        isEditing
          ? 'Contact updated successfully!'
          : 'Contact added successfully!'
      )

      const selectedCountryCodeForDisplay = countryCodes.find(
        (country) => country.id?.toString() === data.countrycode?.toString()
      )

      const countryCodeDisplayValue = selectedCountryCodeForDisplay
        ? selectedCountryCodeForDisplay.configValue
        : countryCodeValue

      const contactForForm = {
        ...(isEditing && contactData?.id && { id: contactData.id }),
        name: `${data.fname} ${data.lname}`.trim(),
        address: `${data.address1} ${data.address2}`.trim(),
        email: data.email,
        pobox: data.pobox,
        countrycode: countryCodeDisplayValue,
        mobileno: data.mobileno,
        telephoneno: data.telephoneno,
        fax: data.fax,
        buildPartnerDTO: {
          id: buildPartnerId ? parseInt(buildPartnerId) : undefined,
        },
      }

      if (isEditing && onContactUpdated && contactIndex !== undefined) {
        onContactUpdated(contactForForm, contactIndex)
      } else if (!isEditing && onContactAdded) {
        onContactAdded(contactForForm)
      }

      setTimeout(() => {
        reset()
        onClose()
      }, 1500)
    } catch (error: unknown) {
      const errorData = error as {
        response?: { data?: { message?: string } }
        message?: string
      }
      const errorMessage =
        errorData?.response?.data?.message ||
        errorData?.message ||
        'Failed to add contact. Please try again.'
      setErrorMessage(errorMessage)
    }
  }

  const handleClose = () => {
    reset()
    setErrorMessage(null)
    setSuccessMessage(null)
    onClose()
  }

  const commonFieldStyles = React.useMemo(() => tokens.input, [tokens])
  const errorFieldStyles = React.useMemo(() => tokens.inputError, [tokens])
  const labelSx = tokens.label
  const valueSx = tokens.value

  const selectStyles = React.useMemo(
    () => ({
      height: '46px',
      borderRadius: '8px',
      backgroundColor: alpha('#1E293B', 0.5), // Darker background for inputs
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: alpha('#FFFFFF', 0.3), // White border with opacity
        borderWidth: '1px',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: alpha('#FFFFFF', 0.5), // Brighter on hover
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
      '& .MuiSelect-icon': {
        color: '#FFFFFF', // White icon
      },
      '& .MuiInputBase-input': {
        color: '#FFFFFF', // White text in inputs
      },
    }),
    [theme]
  )

  const renderTextField = (
    name: keyof ContactFormData,
    label: string,
    defaultValue = '',
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={{
          validate: (value: any) => {
            const allValues = control._formValues as ContactFormData
            return validateContactField(name, value, allValues)
          },
        }}
        render={({ field }) => (
          <>
            <TextField
              {...field}
              label={label}
              fullWidth
              required={required}
              error={!!errors[name]}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: valueSx }}
              sx={errors[name] ? errorFieldStyles : commonFieldStyles}
            />
            <FormError
              error={(errors[name]?.message as string) || ''}
              touched={true}
            />
          </>
        )}
      />
    </Grid>
  )

  const renderSelectField = (
    name: keyof ContactFormData,
    label: string,
    options: string[],
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : {}}
        defaultValue={''}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors[name]}>
            <InputLabel sx={labelSx}>{label}</InputLabel>
            <Select
              {...field}
              input={<OutlinedInput label={label} />}
              label={label}
              sx={{ ...selectStyles, ...valueSx }}
              IconComponent={KeyboardArrowDownIcon}
            >
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
            <FormError
              error={(errors[name]?.message as string) || ''}
              touched={true}
            />
          </FormControl>
        )}
      />
    </Grid>
  )

  const renderApiSelectField = (
    name: keyof ContactFormData,
    label: string,
    options: unknown[],
    gridSize: number = 6,
    required = false,
    loading = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        rules={{
          validate: (value: any) => {
            const allValues = control._formValues as ContactFormData
            return validateContactField(name, value, allValues)
          },
        }}
        defaultValue={''}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors[name]} required={required}>
            <InputLabel sx={labelSx}>
              {loading ? `Loading...` : label}
            </InputLabel>
            <Select
              {...field}
              input={<OutlinedInput label={loading ? `Loading...` : label} />}
              label={loading ? `Loading...` : label}
              sx={{ ...selectStyles, ...valueSx }}
              IconComponent={KeyboardArrowDownIcon}
              disabled={loading}
            >
              {options.map((option) => (
                <MenuItem
                  key={(option as { id?: string }).id}
                  value={(option as { id?: string }).id}
                >
                  {getDisplayLabel(
                    option as any,
                    (option as { configValue?: string }).configValue
                  )}
                </MenuItem>
              ))}
            </Select>
            <FormError
              error={(errors[name]?.message as string) || ''}
              touched={true}
            />
          </FormControl>
        )}
      />
    </Grid>
  )

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={handleClose}
      PaperProps={{
        sx: {
          ...tokens.paper,
          width: 460,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 500,
          fontStyle: 'normal',
          fontSize: '20px',
          lineHeight: '28px',
          letterSpacing: '0.15px',
          verticalAlign: 'middle',
          flexShrink: 0,
          borderBottom: `1px solid ${tokens.dividerColor}`,
          backgroundColor: tokens.paper.backgroundColor,
          color: theme.palette.text.primary,
          zIndex: 11,
          pr: 3,
          pl: 3,
        }}
      >
        {mode === 'edit'
          ? getBuildPartnerLabelDynamic('CDL_BP_CONTACT_EDIT')
          : getBuildPartnerLabelDynamic('CDL_BP_CONTACT_ADD')}
        <IconButton
          onClick={handleClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <CancelOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <DialogContent
          dividers
          sx={{
            flex: 1,
            overflowY: 'auto',
            paddingBottom: '20px',
            marginBottom: '80px', // Space for fixed buttons
            borderColor: tokens.dividerColor,
            backgroundColor: tokens.paper.backgroundColor as string,
          }}
        >
          {countryCodesError && (
            <Alert
              severity="error"
              variant="outlined"
              sx={{
                mb: 2,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(254, 226, 226, 0.4)',
                borderColor: alpha(theme.palette.error.main, 0.4),
                color: theme.palette.error.main,
              }}
            >
              Failed to load country code options. Please refresh the page.
            </Alert>
          )}

          {!countryCodesLoading &&
            !countryCodesError &&
            countryCodes.length === 0 && (
              <Alert
                severity="info"
                variant="outlined"
                sx={{
                  mb: 2,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.info.main, 0.08)
                      : alpha(theme.palette.info.light, 0.2),
                  borderColor: alpha(theme.palette.info.main, 0.4),
                  color: theme.palette.info.main,
                }}
              >
                Using default country code options. API data not available.
              </Alert>
            )}

          <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
            {renderTextField(
              'fname',
              getBuildPartnerLabelDynamic('CDL_BP_AUTH_FIRST_NAME'),
              '',
              6,
              true
            )}
            {renderTextField(
              'lname',
              getBuildPartnerLabelDynamic('CDL_BP_AUTH_LAST_NAME'),
              '',
              6,
              true
            )}
            {renderTextField(
              'email',
              getBuildPartnerLabelDynamic('CDL_BP_EMAIL_ADDRESS'),
              '',
              12,
              true
            )}
            {renderTextField(
              'address1',
              getBuildPartnerLabelDynamic('CDL_BP_ADDRESS_LINE1'),
              '',
              12,
              true
            )}
            {renderTextField(
              'address2',
              getBuildPartnerLabelDynamic('CDL_BP_ADDRESS_LINE2'),
              '',
              12,
              false
            )}
            {renderTextField(
              'pobox',
              getBuildPartnerLabelDynamic('CDL_BP_POBOX'),
              '',
              12,
              false
            )}
            {countryCodes.length > 0
              ? renderApiSelectField(
                  'countrycode',
                  getBuildPartnerLabelDynamic('CDL_BP_COUNTRY_CODE'),
                  countryCodes,
                  6,
                  true,
                  countryCodesLoading
                )
              : renderSelectField(
                  'countrycode',
                  getBuildPartnerLabelDynamic('CDL_BP_COUNTRY_CODE'),
                  ['+971', '+1', '+44', '+91'],
                  6,
                  true
                )}
            {renderTextField(
              'telephoneno',
              getBuildPartnerLabelDynamic('CDL_BP_TELEPHONE_NUMBER'),
              '',
              6,
              false
            )}
            {renderTextField(
              'mobileno',
              getBuildPartnerLabelDynamic('CDL_BP_MOBILE_NUMBER'),
              '',
              6,
              true
            )}
            {renderTextField(
              'fax',
              getBuildPartnerLabelDynamic('CDL_BP_FAX_NUMBER'),
              '',
              12,
              false
            )}
          </Grid>
        </DialogContent>

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 2,
            display: 'flex',
            gap: 2,
            borderTop: `1px solid ${tokens.dividerColor}`,
            backgroundColor: alpha(
              theme.palette.background.paper,
              theme.palette.mode === 'dark' ? 0.92 : 0.9
            ),
            backdropFilter: 'blur(10px)',
            zIndex: 10,
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClose}
                disabled={addContactMutation.isPending || countryCodesLoading}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: 0,
                  borderWidth: '1px',
                  borderColor: theme.palette.mode === 'dark' 
                    ? theme.palette.primary.main 
                    : undefined,
                }}
              >
                Cancel
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                type="submit"
                disabled={addContactMutation.isPending || countryCodesLoading}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: 0,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: theme.palette.mode === 'dark' 
                    ? theme.palette.primary.main 
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    borderColor: theme.palette.mode === 'dark' 
                      ? theme.palette.primary.main 
                      : 'transparent',
                  },
                  '&:disabled': {
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.grey[600], 0.5)
                        : theme.palette.grey[300],
                    borderColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.primary.main, 0.5) 
                      : 'transparent',
                    color: theme.palette.text.disabled,
                  },
                }}
              >
                {addContactMutation.isPending
                  ? mode === 'edit'
                    ? 'Updating...'
                    : 'Adding...'
                  : mode === 'edit'
                    ? 'Update'
                    : 'Add'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </form>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setErrorMessage(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Drawer>
  )
}
