import React, { useState } from 'react'
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
} from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { Controller, useForm } from 'react-hook-form'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { useSaveBuildPartnerContact } from '@/hooks/useBuildPartners'
import { contactValidationSchema } from '@/lib/validation'
import { useFeeDropdownLabels } from '@/hooks/useFeeDropdowns'

interface RightSlidePanelProps {
  isOpen: boolean
  onClose: () => void
  onContactAdded?: (contact: unknown) => void
  title?: string
  buildPartnerId?: string | undefined
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
  buildPartnerId,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const addContactMutation = useSaveBuildPartnerContact()

  const {
    countryCodes = [],
    countryCodesLoading,
    countryCodesError,
    getDisplayLabel,
  } = useFeeDropdownLabels()

  const {
    control,
    handleSubmit,
    reset,
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
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      const selectedCountryCode = countryCodes.find(
        (country) => country.id.toString() === data.countrycode.toString()
      )
      const countryCodeValue = selectedCountryCode
        ? selectedCountryCode.configValue
        : data.countrycode

      const contactData = {
        bpcFirstName: data.fname,
        bpcLastName: data.lname,
        bpcContactEmail: data.email,
        bpcContactAddressLine1: data.address1,
        bpcContactAddressLine2: data.address2,
        bpcContactPoBox: data.pobox,
        bpcCountryMobCode: countryCodeValue,
        bpcContactTelNo: data.telephoneno,
        bpcContactMobNo: data.mobileno,
        bpcContactFaxNo: data.fax,
        buildPartnerDTO: {
          id: buildPartnerId ? parseInt(buildPartnerId) : undefined,
        },
      }

      const validationResult = contactValidationSchema.safeParse(contactData)
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(
          (issue: { message: string }) => issue.message
        )
        setErrorMessage(errorMessages.join(', '))
        return
      }

      await addContactMutation.mutateAsync({
        data: contactData,
        isEditing: false, // false for adding new contact
        developerId: buildPartnerId,
      })

      setSuccessMessage('Contact added successfully!')

      // Add contact to form data after successful backend save
      if (onContactAdded) {
        const contactForForm = {
          name: `${data.fname} ${data.lname}`.trim(),
          address: `${data.address1} ${data.address2}`.trim(),
          email: data.email,
          pobox: data.pobox,
          countrycode: data.countrycode,
          mobileno: data.mobileno,
          telephoneno: data.telephoneno,
          fax: data.fax,
          buildPartnerDTO: {
            id: buildPartnerId ? parseInt(buildPartnerId) : undefined,
          },
        }

        onContactAdded(contactForForm)
      }

      // Reset form and close after a short delay
      setTimeout(() => {
        reset()
        onClose()
      }, 1500)
    } catch (error: unknown) {
      console.error('Error adding contact:', error)
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

  // Common styles for form components
  const commonFieldStyles = {
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

  const errorFieldStyles = {
    '& .MuiOutlinedInput-root': {
      height: '46px',
      borderRadius: '8px',
      '& fieldset': {
        borderColor: 'red',
        borderWidth: '1px',
      },
    },
  }

  const selectStyles = {
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

  const labelSx = {
    color: '#6A7282',
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '12px',
    letterSpacing: 0,
  }

  const valueSx = {
    color: '#1E2939',
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '14px',
    letterSpacing: 0,
    wordBreak: 'break-word',
  }

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
        rules={required ? { required: `${label} is required` } : {}}
        render={({ field }) => (
          <TextField
            {...field}
            label={label}
            fullWidth
            error={!!errors[name]}
            helperText={errors[name]?.message}
            InputLabelProps={{ sx: labelSx }}
            InputProps={{ sx: valueSx }}
            sx={errors[name] ? errorFieldStyles : commonFieldStyles}
          />
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
          </FormControl>
        )}
      />
    </Grid>
  )

  // New render function for API-driven dropdowns
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
        rules={required ? { required: `${label} is required` } : {}}
        defaultValue={''}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors[name]}>
            <InputLabel sx={labelSx}>
              {loading ? `Loading ${label}...` : label}
            </InputLabel>
            <Select
              {...field}
              label={loading ? `Loading ${label}...` : label}
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
          width: 460,
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
        }}
      >
        Add Contact Details
        <IconButton onClick={handleClose}>
          <CancelOutlinedIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {/* Show error if country codes fail to load */}
          {countryCodesError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load country code options. Please refresh the page.
            </Alert>
          )}

          {/* Show info if using fallback country codes */}
          {!countryCodesLoading &&
            !countryCodesError &&
            countryCodes.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Using default country code options. API data not available.
              </Alert>
            )}

          <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
            {renderTextField('fname', 'First Name', '', 6, false)}
            {renderTextField('lname', 'Last Name', '', 6, false)}
            {renderTextField('email', 'Email Id', '', 12, false)}
            {renderTextField('address1', 'Address Line 1', '', 12, false)}
            {renderTextField('address2', 'Address Line 2', '', 12, false)}
            {renderTextField('pobox', 'PO Box', '', 12, false)}
            {countryCodes.length > 0
              ? renderApiSelectField(
                  'countrycode',
                  'Country Code',
                  countryCodes,
                  6,
                  false,
                  countryCodesLoading
                )
              : renderSelectField(
                  'countrycode',
                  'Country Code',
                  ['+971', '+1', '+44', '+91'],
                  6,
                  false
                )}
            {renderTextField('telephoneno', 'Telephone Number', '', 6, false)}
            {renderTextField('mobileno', 'Mobile Number', '', 6, false)}
            {renderTextField('fax', 'FAX', '', 12, false)}
          </Grid>
        </DialogContent>

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 2,
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
                  backgroundColor: '#2563EB',
                  color: '#fff',
                }}
              >
                {addContactMutation.isPending ? 'Adding...' : 'Add'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </form>

      {/* Error and Success Notifications */}
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
