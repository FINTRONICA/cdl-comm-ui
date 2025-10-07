import React, { useState, useEffect, useMemo } from 'react'
import dayjs from 'dayjs'
import { useManualPaymentData } from '../ManualPaymentDataProvider'
import { idService } from '../../../../services/api/developerIdService'
import { useManualPaymentLabelsWithCache } from '../../../../hooks/useManualPaymentLabelsWithCache'
import {
  MANUAL_PAYMENT_LABELS
} from '../../../../constants/mappings/manualPaymentLabels'
// State for developer names

import {
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { Controller, useFormContext } from 'react-hook-form'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { fundEgressService } from '../../../../services/api/fundEgressService'
// import { toast } from 'react-hot-toast' // Not used in this component

interface Step1Props {
  savedId?: string | null
  isEditMode?: boolean
  onDataLoaded?: () => void
  isReadOnly?: boolean
}

const Step1 = ({ savedId, isEditMode, onDataLoaded, isReadOnly = false }: Step1Props) => {

  // Form context
  const {
    control,
    setValue,
    watch,
  } = useFormContext()

  // Get dynamic labels
  const { getLabel } = useManualPaymentLabelsWithCache('EN')

  // Get shared data from provider
  const sharedData = useManualPaymentData()

  // State for payment reference ID generation
  const [paymentRefId, setPaymentRefId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)

  // Extract data from shared provider
  const {
    paymentTypes,
    paymentSubTypes,
    currencies,
    depositModes,
    paymentModes,
    transferTypes,
    buildAssetAccountStatuses,
    boolYnOptions,
    realEstateAssets,
    buildPartners,
    accountBalances,
  } = sharedData


  // Destructure account balance functions
  const { balances, loadingStates, errors: accountErrors, fetchBalance } = accountBalances

  // State to store additional developer/project data from prepopulated data
  const [additionalDeveloperNames, setAdditionalDeveloperNames] = useState<string[]>([])
  const [additionalProjectAssets, setAdditionalProjectAssets] = useState<{ id: number, reaName: string, reaId: string }[]>([])

  // Memoize developer names from build partners data + any additional names
  const developerNames = useMemo(() => {
    const baseNames = buildPartners.data && buildPartners.data.length > 0
      ? buildPartners.data
        .map((bp: any) => bp.bpName)
        .filter((name: string | null) => !!name)
      : []

    // Combine base names with additional names, removing duplicates
    const allNames = [...baseNames, ...additionalDeveloperNames]
    return [...new Set(allNames)].filter(Boolean)
  }, [buildPartners.data, additionalDeveloperNames])

  // Memoize project assets from real estate assets data + any additional assets
  const projectAssets = useMemo(() => {
    const baseAssets = realEstateAssets.data && realEstateAssets.data.length > 0
      ? realEstateAssets.data
      : []

    // Combine base assets with additional assets, removing duplicates by ID
    const allAssets = [...baseAssets, ...additionalProjectAssets]
    const uniqueAssets = allAssets.reduce((acc: any[], asset: any) => {
      if (!acc.find((a: any) => a.id === asset.id)) {
        acc.push(asset)
      }
      return acc
    }, [])

    return uniqueAssets
  }, [realEstateAssets.data, additionalProjectAssets])


  // State to track if prepopulation has been attempted
  const [prepopulationAttempted, setPrepopulationAttempted] = useState<boolean>(false)

  // Handle data prepopulation when in edit mode
  useEffect(() => {
    const prepopulateData = async () => {
      if (isEditMode && savedId && !prepopulationAttempted) {
        try {
          const savedData = await fundEgressService.getFundEgressById(savedId)


          // Map the saved data to form format - comprehensive field mapping
          const formData = {
            // Basic Payment Information
            tasReference: savedData.fePaymentRefNumber || '',

            // Developer Information
            developerName: savedData.buildPartnerDTO?.bpName || '',
            developerId: savedData.buildPartnerDTO?.bpDeveloperId || '',

            // Project Information
            projectName: savedData.realEstateAssestDTO?.id?.toString() || '',
            projectId: savedData.realEstateAssestDTO?.reaId || '',

            // Narrations and Remarks
            narration1: savedData.feNarration1 || '',
            narration2: savedData.feNarration2 || '',
            remarks: savedData.feRemark || '',

            // Payment Type Information (use expenseTypeDTO instead of voucherPaymentTypeDTO)
            paymentType: (savedData.expenseTypeDTO as any)?.id?.toString() || savedData.voucherPaymentTypeDTO?.id?.toString() || '',
            paymentSubType: (savedData.expenseSubTypeDTO as any)?.id?.toString() || savedData.voucherPaymentSubTypeDTO?.id?.toString() || '',

            // Payment Details
            paymentMode: savedData.paymentModeDTO?.id?.toString() || '',
            invoiceCurrency: savedData.invoiceCurrencyDTO?.id?.toString() || '',
            paymentCurrency: savedData.paymentCurrencyDTO?.id?.toString() || '',
            chargeCode: savedData.chargedCodeDTO?.id?.toString() || '',
            transactionType: savedData.transactionTypeDTO?.id?.toString() || '',

            // Financial Fields
            invoiceRef: savedData.feInvoiceRefNo || '',
            invoiceValue: savedData.feInvoiceValue?.toString() || '',
            invoiceDate: savedData.feInvoiceDate && savedData.feInvoiceDate !== '' ? dayjs(savedData.feInvoiceDate) : null,
            paymentDate: savedData.fePaymentDate && savedData.fePaymentDate !== '' ? dayjs(savedData.fePaymentDate) : null,
            paymentAmount: savedData.fePaymentAmount?.toString() || '',
            totalAmountPaid: savedData.feTotalAmountPaid?.toString() || '',

            // Account Balances
            escrowBalance: savedData.feCurBalInEscrowAcc?.toString() || '',
            retentionBalance: savedData.feCurBalInRetentionAcc?.toString() || '',
            corporateBalance: savedData.feCorporateAccBalance?.toString() || '',
            subConsBalance: savedData.feSubConsAccBalance?.toString() || '',

            // Debit/Credit Amounts
            debitFromEscrow: savedData.feDebitFromEscrow?.toString() || '',
            debitFromRetention: savedData.feDebitFromRetention?.toString() || '',

            // Engineer Fee Information (using correct field names)
            engineerApprovedAmount: savedData.feEngineerApprovedAmt?.toString() || '',
            corporatePaymentEngFee: savedData.feCorporatePaymentEngFee?.toString() || '',

            // Additional Financial Fields (using correct field names)
            totalEligibleAmount: savedData.feTotalEligibleAmtInv?.toString() || '',
            amountPaid: savedData.feAmtPaidAgainstInv?.toString() || '',
            currentEligibleAmt: savedData.feCurEligibleAmt?.toString() || '',
            totalPayoutAmt: savedData.feTotalPayoutAmt?.toString() || '',
            amountInTransit: savedData.feAmountInTransit?.toString() || '',
            indicativeRate: savedData.feIndicativeRate?.toString() || '',
            amountToBeReleased: savedData.feAmountToBeReleased?.toString() || '',
            beneVatPaymentAmt: savedData.feBeneVatPaymentAmt?.toString() || '',

            // Boolean Flags
            corporatePayment: savedData.feCorporatePayment ? 'true' : 'false',
            specialRate: savedData.feSpecialRate ? 'true' : 'false',
            isEngineerFee: savedData.feIsEngineerFee ? 'true' : 'false',
            forFeit: savedData.feForFeit ? 'true' : 'false',
            refundToUnitHolder: savedData.feRefundToUnitHolder ? 'true' : 'false',
            transferToOtherUnit: savedData.feTransferToOtherUnit ? 'true' : 'false',
            docVerified: savedData.feDocVerified ? 'true' : 'false',

            // Forfeit Amount
            forFeitAmt: savedData.feForFeitAmt?.toString() || '',

            // Date Fields
            unitTransferAppDate: savedData.feUnitTransferAppDate && savedData.feUnitTransferAppDate !== '' ? dayjs(savedData.feUnitTransferAppDate) : null,
            paymentSubType1: savedData.feReraApprovedDate && savedData.feReraApprovedDate !== '' ? dayjs(savedData.feReraApprovedDate) : null, // Regular approval date
            engineerFeePayment1: savedData.feBeneDateOfPayment && savedData.feBeneDateOfPayment !== '' ? dayjs(savedData.feBeneDateOfPayment) : null, // Payment date
          }



          // Add developer name to additional names if not in current list
          if (formData.developerName && !developerNames.includes(formData.developerName)) {
            setAdditionalDeveloperNames(prev => [...prev, formData.developerName])
          }

          // Add project asset to additional assets if not in current list (by ID)
          if (savedData.realEstateAssestDTO && formData.projectName) {
            const projectId = parseInt(formData.projectName)
            const existingAsset = projectAssets.find((asset: any) => asset.id === projectId)

            if (!existingAsset) {
              const newAsset = {
                id: savedData.realEstateAssestDTO.id,
                reaName: savedData.realEstateAssestDTO.reaName,
                reaId: savedData.realEstateAssestDTO.reaId
              }
              setAdditionalProjectAssets(prev => [...prev, newAsset])
            }
          }

          // Set form values - force update even if field exists
          Object.entries(formData).forEach(([key, value]) => {
            if (value) { // Only set non-empty values
              setValue(key as any, value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: false
              })

              if (key === 'tasReference') {
                setPaymentRefId(value)
              }
            }
          })

          // Mark prepopulation as attempted to prevent multiple attempts
          setPrepopulationAttempted(true)


          if (onDataLoaded) {
            onDataLoaded()
          }
        } catch (error) {
          console.error('Step1: Failed to prepopulate form data:', error)
          setPrepopulationAttempted(true) // Still mark as attempted to prevent retries

          // Still notify parent even if there's an error, to stop loading state
          if (onDataLoaded) {
            onDataLoaded()
          }
        }
      }
    }

    // Run prepopulation when:
    // 1. We're in edit mode
    // 2. We have a saved ID
    // 3. We haven't attempted prepopulation yet
    // 4. Either initial data is loaded OR we have some data to work with
    if (isEditMode && savedId && !prepopulationAttempted) {
      // Wait a bit for shared data to load, but don't wait forever
      const timeoutId = setTimeout(() => {
        prepopulateData()
      }, sharedData.isInitialLoading ? 1000 : 100) // 1s if loading, 100ms if data ready

      return () => clearTimeout(timeoutId)
    }

    // Return empty cleanup function if conditions not met
    return () => { }
  }, [isEditMode, savedId, setValue, sharedData.isInitialLoading, prepopulationAttempted, onDataLoaded])

  // Reset prepopulation flag and additional data when savedId changes
  useEffect(() => {
    setPrepopulationAttempted(false)
    setAdditionalDeveloperNames([])
    setAdditionalProjectAssets([])
  }, [savedId])

  // Function to generate new payment reference ID
  const handleGeneratePaymentRefId = async () => {
    try {
      setIsGeneratingId(true)
      const newIdResponse = idService.generateNewId('PAY')
      const newId = newIdResponse.id

      // Update both state and form value
      setPaymentRefId(newId)
      setValue('tasReference', newId, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false
      })


    } catch (error) {
      console.error('Error generating payment reference ID:', error)
    } finally {
      setIsGeneratingId(false)
    }
  }

  // Watch for developer name changes and auto-populate developer ID
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'developerName' && value.developerName) {
        const selectedPartner = buildPartners.data.find(
          (bp: any) => bp.bpName === value.developerName
        )
        if (selectedPartner) {
          setValue('developerId', selectedPartner.bpDeveloperId)

        }
      }

      // Watch for project name changes and auto-populate project ID
      if (name === 'projectName' && value.projectName) {
        const selectedAsset = projectAssets.find(
          (asset: any) => asset.id === parseInt(value.projectName)
        )
        if (selectedAsset) {
          setValue('projectId', selectedAsset.reaId)

        }
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue, buildPartners, projectAssets])

  // Re-attempt ID population when build partners data becomes available
  useEffect(() => {
    const currentDeveloperName = watch('developerName')
    const currentProjectName = watch('projectName')

    // Try to populate developer ID if we have a name but no ID
    if (currentDeveloperName && !watch('developerId') && buildPartners.data.length > 0) {
      const selectedPartner = buildPartners.data.find(
        (bp: any) => bp.bpName === currentDeveloperName
      )
      if (selectedPartner) {
        setValue('developerId', selectedPartner.bpDeveloperId)
      }
    }

    // Try to populate project ID if we have a project ID value but no project ID field
    if (currentProjectName && !watch('projectId') && projectAssets.length > 0) {
      const selectedAsset = projectAssets.find(
        (asset: any) => asset.id === parseInt(currentProjectName)
      )
      if (selectedAsset) {
        setValue('projectId', selectedAsset.reaId)
      }
    }
  }, [buildPartners.data, projectAssets, watch, setValue])

  // Initialize payment reference ID from form value and keep in sync
  React.useEffect(() => {
    const currentId = watch('tasReference')
    if (currentId !== paymentRefId) {
      setPaymentRefId(currentId || '')
    }
  }, [watch, paymentRefId])

  // Update form value when paymentRefId state changes (for generate button)
  React.useEffect(() => {
    const currentFormValue = watch('tasReference')
    if (paymentRefId && paymentRefId !== currentFormValue) {
      setValue('tasReference', paymentRefId, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false
      })
    }
  }, [paymentRefId, watch, setValue])

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

  const selectStyles = {
    height: '48px',
    '& .MuiOutlinedInput-root': {
      height: '48px',
      borderRadius: '12px',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease-in-out',
      '& fieldset': {
        borderColor: '#E2E8F0',
        borderWidth: '1.5px',
        transition: 'border-color 0.2s ease-in-out',
      },
      '&:hover fieldset': {
        borderColor: '#3B82F6',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
        borderWidth: '2px',
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
      },
    },
    '& .MuiSelect-icon': {
      color: '#64748B',
      fontSize: '20px !important',
      transition: 'color 0.2s ease-in-out',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    '&:hover .MuiSelect-icon': {
      color: '#3B82F6',
    },
    '&.Mui-focused .MuiSelect-icon': {
      color: '#2563EB',
    },
  }

  const datePickerStyles = {
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

  const labelSx = {
    color: '#374151',
    fontFamily:
      'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 500,
    fontStyle: 'normal',
    fontSize: '13px',
    letterSpacing: '0.025em',
    marginBottom: '4px',
    '&.Mui-focused': {
      color: '#2563EB',
    },
    '&.MuiFormLabel-filled': {
      color: '#374151',
    },
  }

  const valueSx = {
    color: '#111827',
    fontFamily:
      'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '14px',
    letterSpacing: '0.01em',
    wordBreak: 'break-word',
    '& .MuiSelect-select': {
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
    },
  }

  const StyledCalendarIcon = (
    props: React.ComponentProps<typeof CalendarTodayOutlinedIcon>
  ) => (
    <CalendarTodayOutlinedIcon
      {...props}
      sx={{
        width: '18px',
        height: '20px',
        position: 'relative',
        top: '2px',
        left: '3px',
        transform: 'rotate(0deg)',
        opacity: 1,
      }}
    />
  )
  const renderTextField = (
    name: string,
    label: string,
    gridSize = 6,
    defaultValue = '',
    isRequired = false,
    disabled = false
  ) => {
    const validationRules: any = {}

    if (isRequired && !isReadOnly) {
      validationRules.required = `${label} is required`
    }

    // Add specific validation rules based on field name
    if (name === 'tasReference' && !isReadOnly) {
      validationRules.required = 'Payment Reference Number is required'
      validationRules.minLength = {
        value: 3,
        message: 'Payment Reference Number must be at least 3 characters',
      }
      validationRules.pattern = {
        value: /^[A-Z0-9-]+$/,
        message:
          'Payment Reference Number can only contain uppercase letters, numbers, and hyphens',
      }
    }

    if (name === 'developerId') {
      validationRules.required = 'Developer ID is required'
      validationRules.pattern = {
        value: /^[A-Z0-9-]+$/,
        message:
          'Developer ID can only contain uppercase letters, numbers, and hyphens',
      }
    }

    if (name === 'projectId') {
      validationRules.required = 'Project ID is required'
      validationRules.pattern = {
        value: /^[A-Z0-9-]+$/,
        message:
          'Project ID can only contain uppercase letters, numbers, and hyphens',
      }
    }

    if (name === 'invoiceRef') {
      validationRules.required = 'Invoice Reference Number is required'
      validationRules.minLength = {
        value: 3,
        message: 'Invoice Reference Number must be at least 3 characters',
      }
    }

    if (
      name === 'invoiceValue' ||
      name === 'engineerApprovedAmount' ||
      name === 'totalEligibleAmount' ||
      name === 'amountPaid' ||
      name === 'totalAmountPaid' ||
      name === 'amountReceived'
    ) {
      validationRules.pattern = {
        value: /^\d+(\.\d{1,2})?$/,
        message:
          'Please enter a valid amount (numbers and up to 2 decimal places)',
      }
      validationRules.min = {
        value: 0,
        message: 'Amount must be greater than or equal to 0',
      }
    }

    if (name === 'regulatorApprovalRef') {
      validationRules.required =
        'Regulator Approval Reference Number is required'
      validationRules.minLength = {
        value: 3,
        message:
          'Regulator Approval Reference Number must be at least 3 characters',
      }
    }

    return (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          rules={validationRules}
          defaultValue={defaultValue}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label={label}
              fullWidth
              error={!!error}
              helperText={error?.message}
              disabled={disabled || isReadOnly}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: valueSx }}
              sx={commonFieldStyles}
            />
          )}
        />
      </Grid>
    )
  }

  const renderSelectField = (
    name: string,
    label: string,
    options: any[],
    gridSize = 6,
    isRequired = true,
    isLoading = false,
    disabled = false
  ) => {
    const validationRules: any = {}

    if (isRequired && !isReadOnly) {
      validationRules.required = `${label} is required`
    }

    // Add specific validation rules based on field name
    if (name === 'developerName' && !isReadOnly) {
      validationRules.validate = (value: string) => {
        if (!value || value === '') {
          return 'Please select a developer'
        }
        return true
      }
    }

    if (name === 'projectName' && !isReadOnly) {
      validationRules.validate = (value: string) => {
        if (!value || value === '') {
          return 'Please select a project'
        }
        return true
      }
    }

    if (name === 'paymentType' && !isReadOnly) {
      validationRules.validate = (value: string) => {
        if (!value || value === '') {
          return 'Please select a payment type'
        }
        return true
      }
    }

    if ((name === 'invoiceCurrency' || name === 'totalAmountPaid1') && !isReadOnly) {
      validationRules.validate = (value: string) => {
        if (!value || value === '') {
          return 'Please select a currency'
        }
        return true
      }
    }

    return (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          rules={validationRules}
          defaultValue={''}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel sx={labelSx}>
                {label}
              </InputLabel>
              <Select
                {...field}
                label={label}
                sx={{
                  ...selectStyles,
                  ...valueSx,
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    border: '1px solid #9ca3af',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: '2px solid #2563eb',
                  },
                }}
                disabled={disabled || isLoading || isReadOnly}
                IconComponent={KeyboardArrowDownIcon}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #E5E7EB',
                      marginTop: '8px',
                      minHeight: '120px',
                      maxHeight: '300px',
                      overflow: 'auto',
                      '& .MuiMenuItem-root': {
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontFamily:
                          'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        color: '#374151',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: '#F3F4F6',
                          color: '#111827',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#EBF4FF',
                          color: '#2563EB',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: '#DBEAFE',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  -- Select --
                </MenuItem>
                {options.map((option, index) => (
                  <MenuItem
                    key={option.id || option || `option-${index}`}
                    value={option.id || option || ''}
                    sx={{
                      fontSize: '14px',
                      fontFamily:
                        'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: '#374151',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                        color: '#111827',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#EBF4FF',
                        color: '#2563EB',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: '#DBEAFE',
                        },
                      },
                    }}
                  >
                    {option.displayName ||
                      option.name ||
                      (typeof option === 'string' ? option : '')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>
    )
  }

  const renderDatePickerField = (
    name: string,
    label: string,
    gridSize: number = 6,
    isRequired = false
  ) => {
    const validationRules: any = {}

    if (isRequired) {
      validationRules.required = `${label} is required`
    }

    // Add specific validation rules based on field name
    if (name === 'paymentDate' || name === 'engineerFeePayment1') {
      validationRules.required = `${label} is required`
      validationRules.validate = (value: any) => {
        if (!value) {
          return `${label} is required`
        }
        if (value && new Date(value) > new Date()) {
          return `${label} cannot be in the future`
        }
        return true
      }
    }

    if (name === 'invoiceDate') {
      validationRules.validate = (value: any) => {
        if (value && new Date(value) > new Date()) {
          return 'Invoice date cannot be in the future'
        }
        return true
      }
    }

    return (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          rules={validationRules}
          defaultValue={null}
          render={({ field, fieldState: { error } }) => (
            <DatePicker
              label={label}
              value={field.value}
              onChange={field.onChange}
              format="DD/MM/YYYY"
              disabled={isReadOnly}
              slots={{
                openPickerIcon: StyledCalendarIcon,
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!error,
                  helperText: error?.message,
                  sx: datePickerStyles,
                  InputLabelProps: { sx: labelSx },
                  InputProps: {
                    sx: valueSx,
                    style: { height: '46px' },
                  },
                },
              }}
            />
          )}
        />
      </Grid>
    )
  }

  const renderTextFieldWithButton = (
    name: string,
    label: string,
    buttonText: string,
    gridSize: number = 6
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={label}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    disabled={isReadOnly}
                    sx={{
                      color: '#2563EB',
                      borderRadius: '24px',
                      textTransform: 'none',
                      background: 'var(--UIColors-Blue-100, #DBEAFE)',
                      boxShadow: 'none',
                      '&:hover': {
                        background: '#D0E3FF',
                        boxShadow: 'none',
                      },
                      minWidth: '120px',
                      height: '36px',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 500,
                      fontStyle: 'normal',
                      fontSize: '14px',
                      lineHeight: '24px',
                      letterSpacing: '0.5px',
                      verticalAlign: 'middle',
                    }}
                    onClick={() => { }}
                  >
                    {buttonText}
                  </Button>
                </InputAdornment>
              ),
              sx: valueSx,
            }}
            InputLabelProps={{ sx: labelSx }}
            sx={commonFieldStyles}
          />
        )}
      />
    </Grid>
  )

  const renderCheckboxField = (
    name: string,
    label?: string,
    gridSize: number = 6
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={!!field.value}
                sx={{
                  color: '#CAD5E2',
                  '&.Mui-checked': {
                    color: '#2563EB',
                  },
                }}
              />
            }
            label={
              label ??
              name
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())
            }
            sx={{
              '& .MuiFormControlLabel-label': {
                fontFamily: 'Outfit, sans-serif',
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
              },
            }}
          />
        )}
      />
    </Grid>
  )

  const renderPaymentRefIdField = (
    name: string,
    label: string,
    gridSize: number = 6
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={label}
            value={field.value || paymentRefId} // Use form value first, fallback to state
            disabled={isReadOnly} // Disable in view mode
            onChange={(e) => {
              const newValue = e.target.value
              setPaymentRefId(newValue)
              field.onChange(newValue) // Update form value
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 0 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleGeneratePaymentRefId}
                    disabled={isGeneratingId || isReadOnly}
                    sx={{
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      textTransform: 'none',
                      background: '#2563EB',
                      '&:hover': {
                        background: '#1D4ED8',
                      },
                      minWidth: '100px',
                      height: '32px',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 500,
                      fontStyle: 'normal',
                      fontSize: '11px',
                      lineHeight: '14px',
                      letterSpacing: '0.3px',
                      px: 1,
                    }}
                  >
                    {isGeneratingId ? 'Generating...' : 'Generate ID'}
                  </Button>
                </InputAdornment>
              ),
              sx: valueSx,
            }}
            InputLabelProps={{ sx: labelSx }}
            sx={commonFieldStyles}
          />
        )}
      />
    </Grid>
  )

  const renderAccountBalanceField = (
    accountKey: string,
    accountFieldName: string,
    accountLabel: string,
    balanceFieldName: string,
    balanceLabel: string,
    gridSize: number = 6
  ) => (
    <>
      <Grid key={accountFieldName} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={accountFieldName}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={accountLabel}
              disabled={isReadOnly} // Disable in view mode
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      variant="contained"
                      sx={{
                        color: '#2563EB',
                        borderRadius: '24px',
                        textTransform: 'none',
                        background: 'var(--UIColors-Blue-100, #DBEAFE)',
                        boxShadow: 'none',
                        '&:hover': {
                          background: '#D0E3FF',
                          boxShadow: 'none',
                        },
                        minWidth: '120px',
                        height: '36px',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 500,
                        fontStyle: 'normal',
                        fontSize: '14px',
                        lineHeight: '24px',
                        letterSpacing: '0.5px',
                        verticalAlign: 'middle',
                      }}
                      onClick={() => {
                        if (field.value) {
                          fetchBalance(accountKey, field.value)
                        }
                      }}
                      disabled={loadingStates[accountKey] || !field.value || isReadOnly}
                    >
                      {loadingStates[accountKey]
                        ? 'Loading...'
                        : 'Fetch Account Balance'}
                    </Button>
                  </InputAdornment>
                ),
                sx: valueSx,
              }}
              InputLabelProps={{ sx: labelSx }}
              sx={commonFieldStyles}
            />
          )}
        />
      </Grid>
      <Grid key={balanceFieldName} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={balanceFieldName}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={balanceLabel}
              value={
                balances[accountKey]
                  ? `${balances[accountKey]?.currencyCode} ${balances[accountKey]?.details?.transferLimits?.creditTransfer || '0'}`
                  : field.value
              }
              onChange={(e) => field.onChange(e)}
              disabled={true}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: valueSx }}
              sx={{
                ...commonFieldStyles,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#F5F5F5',
                  '& fieldset': {
                    borderColor: '#E0E0E0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#E0E0E0',
                  },
                },
              }}
            />
          )}
        />
        {accountErrors[accountKey] && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 0.5, ml: 1.75 }}
          >
            {String(accountErrors[accountKey])}
          </Typography>
        )}
      </Grid>
    </>
  )

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          boxShadow: 'none',
          backgroundColor: '#FFFFFFBF',
          width: '84%',
          margin: '0 auto',
        }}
      >
        <CardContent>
          <Grid container rowSpacing={4} columnSpacing={2}>
            {renderPaymentRefIdField(
              'tasReference',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.TAS_REFERENCE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TAS_REFERENCE
              ) + '*'
            )}
            {/* {renderTextField('tasReference', 'Tas/EMS Payment Ref no.*', 6, '', true)} */}
            {renderSelectField(
              'developerName',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.DEVELOPER_NAME,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.DEVELOPER_NAME
              ) + '*',
              developerNames,
              6,
              true,
              buildPartners.loading
            )}
            {renderTextField(
              'developerId',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.DEVELOPER_ID,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.DEVELOPER_ID
              ) + '*',
              6,
              '',
              true
            )}
            {renderSelectField(
              'projectName',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PROJECT_NAME,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PROJECT_NAME
              ) + '*',
              projectAssets.map((asset) => ({
                id: asset.id,
                displayName: asset.reaName,
              })),
              6,
              true,
              realEstateAssets.loading
            )}
            {renderTextField(
              'projectId',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PROJECT_ID,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PROJECT_ID
              ) + '*',
              6,
              '',
              true
            )}
            {renderSelectField(
              'projectStatus',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PROJECT_STATUS,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PROJECT_STATUS
              ),
              buildAssetAccountStatuses.data
            )}
            {renderAccountBalanceField(
              'escrow',
              'escrowAccount',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.ESCROW_ACCOUNT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.ESCROW_ACCOUNT
              ),
              'subConstructionAccount',
              'Current Balance in Escrow Account*'
            )}
            {renderAccountBalanceField(
              'subConstruction',
              'corporateAccount',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.SUB_CONSTRUCTION_ACCOUNT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS
                  .SUB_CONSTRUCTION_ACCOUNT
              ),
              'retentionAccount',
              'Current Balance in Sub Construction Account*'
            )}
            {renderAccountBalanceField(
              'corporate',
              'corporateAccount1',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.CORPORATE_ACCOUNT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.CORPORATE_ACCOUNT
              ),
              'retentionAccount1',
              'Current Balance in Corporate Account*'
            )}
            {renderAccountBalanceField(
              'retention',
              'corporateAccount2',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.RETENTION_ACCOUNT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.RETENTION_ACCOUNT
              ),
              'retentionAccount2',
              'Current Balance in Retention Account*'
            )}

            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#1E2939',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '0.15px',
                  verticalAlign: 'middle',
                }}
              >
                Expense Type
              </Typography>
            </Grid>

            {renderSelectField(
              'paymentType',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_TYPE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_TYPE
              ) + '*',
              paymentTypes.data || [],
              6,
              true,
              paymentTypes.loading
            )}
            {renderSelectField(
              'paymentSubType',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_SUB_TYPE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_SUB_TYPE
              ),
              paymentSubTypes.data || [],
              6,
              true,
              paymentSubTypes.loading
            )}
            {renderTextField(
              'paymentType1',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.REGULAR_APPROVAL_REF,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.REGULAR_APPROVAL_REF
              ) + '*'
            )}
            {renderDatePickerField(
              'paymentSubType1',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.REGULAR_APPROVAL_DATE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS
                  .REGULAR_APPROVAL_DATE
              ) + '*',
              6,
              true
            )}
            {renderTextField(
              'invoiceRef',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.INVOICE_REF,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INVOICE_REF
              ) + '*',
              3,
              '',
              true
            )}
            {renderSelectField(
              'invoiceCurrency',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.INVOICE_CURRENCY,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INVOICE_CURRENCY
              ) + '*',
              currencies.data || [],
              3,
              true,
              currencies.loading
            )}
            {renderTextField(
              'invoiceValue',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.INVOICE_VALUE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INVOICE_VALUE
              ) + '*',
              3
            )}
            {renderDatePickerField(
              'invoiceDate',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.INVOICE_DATE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INVOICE_DATE
              ) + '*',
              3
            )}

            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#1E2939',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '0.15px',
                  verticalAlign: 'middle',
                }}
              >
                Amount Details
              </Typography>
            </Grid>

            {renderTextField(
              'engineerApprovedAmount',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.ENGINEER_APPROVED_AMOUNT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS
                  .ENGINEER_APPROVED_AMOUNT
              )
            )}
            {renderTextField(
              'totalEligibleAmount',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.TOTAL_ELIGIBLE_AMOUNT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS
                  .TOTAL_ELIGIBLE_AMOUNT
              )
            )}
            {renderTextField(
              'amountPaid',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.AMOUNT_PAID,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.AMOUNT_PAID
              )
            )}
            {renderTextField(
              'amountPaid1',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.CAP_EXCEEDED,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.CAP_EXCEEDED
              )
            )}
            {renderTextField(
              'totalAmountPaid',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.TOTAL_AMOUNT_PAID,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TOTAL_AMOUNT_PAID
              ),
              3
            )}
            {renderSelectField(
              'totalAmountPaid1',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_CURRENCY,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_CURRENCY
              ) + '*',
              currencies.data,
              3
            )}
            {renderTextField(
              'debitCreditToEscrow',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.DEBIT_CREDIT_ESCROW,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.DEBIT_CREDIT_ESCROW
              ),
              3
            )}
            {renderTextField(
              'currentEligibleAmount',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.CURRENT_ELIGIBLE_AMOUNT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS
                  .CURRENT_ELIGIBLE_AMOUNT
              ),
              3
            )}
            {renderTextField(
              'debitFromRetention',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.DEBIT_FROM_RETENTION,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.DEBIT_FROM_RETENTION
              ),
              3
            )}
            {renderTextField(
              'totalPayoutAmount',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.TOTAL_PAYOUT_AMOUNT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TOTAL_PAYOUT_AMOUNT
              ),
              3
            )}
            {renderTextField(
              'amountInTransit',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.AMOUNT_IN_TRANSIT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.AMOUNT_IN_TRANSIT
              ),
              3
            )}
            {renderTextField(
              'vatCapExceeded',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.VAT_CAP_EXCEEDED,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.VAT_CAP_EXCEEDED
              ),
              3
            )}
            {renderCheckboxField(
              'specialRate',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.SPECIAL_RATE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.SPECIAL_RATE
              ),
              3
            )}
            {renderCheckboxField(
              'corporateAmount',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.CORPORATE_AMOUNT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.CORPORATE_AMOUNT
              ),
              3
            )}
            {renderTextField(
              'delRefNo',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.DEAL_REF_NO,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.DEAL_REF_NO
              ),
              3
            )}
            {renderTextField(
              'ppcNo',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PPC_NUMBER,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PPC_NUMBER
              ),
              3
            )}
            {renderTextFieldWithButton(
              'vatCapExceeded3',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.INDICATIVE_RATE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INDICATIVE_RATE
              ),
              'Get Exchange Rate'
            )}
            {renderTextField(
              'vatCapExceeded4',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.CORPORATE_CERTIFICATION_FEES,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS
                  .CORPORATE_CERTIFICATION_FEES
              )
            )}

            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#1E2939',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '0.15px',
                  verticalAlign: 'middle',
                }}
              >
                Narration
              </Typography>
            </Grid>

            {renderTextField(
              'narration1',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.NARRATION_1,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.NARRATION_1
              )
            )}
            {renderTextField(
              'narration2',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.NARRATION_2,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.NARRATION_2
              )
            )}
            {renderTextField(
              'remarks',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.REMARKS,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.REMARKS
              ),
              12
            )}

            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#1E2939',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '0.15px',
                  verticalAlign: 'middle',
                }}
              >
                Unit Cancellation Details
              </Typography>
            </Grid>

            {renderTextField(
              'unitNo',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.UNIT_NO,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.UNIT_NO
              ) + '*'
            )}
            {renderTextField(
              'towerName',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.TOWER_NAME,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TOWER_NAME
              )
            )}
            {renderTextField(
              'unitStatus',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.UNIT_STATUS,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.UNIT_STATUS
              )
            )}
            {renderTextField(
              'amountReceived',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.AMOUNT_RECEIVED,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.AMOUNT_RECEIVED
              ) + '*'
            )}
            {renderCheckboxField(
              'Forfeit',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.FORFEIT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.FORFEIT
              ),
              4
            )}
            {renderCheckboxField(
              'Refundtounitholder',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.REFUND_TO_UNIT_HOLDER,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS
                  .REFUND_TO_UNIT_HOLDER
              ),
              4
            )}
            {renderCheckboxField(
              'Transfertootherunit',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.TRANSFER_TO_OTHER_UNIT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS
                  .TRANSFER_TO_OTHER_UNIT
              ),
              4
            )}
            {renderTextField(
              'forfeitAmount',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.FORFEIT_AMOUNT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.FORFEIT_AMOUNT
              ),
              4
            )}
            {renderTextField(
              'regulatorApprovalRef',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.REGULATOR_APPROVAL_REF,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS
                  .REGULATOR_APPROVAL_REF
              ),
              4,
              '',
              true
            )}
            {renderDatePickerField(
              'paymentDate',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.REGULATOR_APPROVAL_DATE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS
                  .REGULATOR_APPROVAL_DATE
              ),
              4,
              true
            )}

            {renderSelectField(
              'bankCharges',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.CHARGE_MODE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.CHARGE_MODE
              ),
              depositModes.data
            )}
            {renderSelectField(
              'paymentMode',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_MODE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_MODE
              ),
              paymentModes.data
            )}
            {renderSelectField(
              'engineerFeePayment',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.TRANSACTION_TYPE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TRANSACTION_TYPE
              ),
              transferTypes.data
            )}
            {renderTextField(
              'uploadDocuments',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.AMOUNT_TO_BE_RELEASED,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS
                  .AMOUNT_TO_BE_RELEASED
              )
            )}
            {renderDatePickerField(
              'engineerFeePayment1',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_DATE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_DATE
              ) + '*'
            )}
            {renderTextField(
              'uploadDocuments1',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.VAT_PAYMENT_AMOUNT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.VAT_PAYMENT_AMOUNT
              )
            )}
            {renderCheckboxField(
              'EngineerFeePaymentNeeded',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.ENGINEER_FEE_PAYMENT_NEEDED,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS
                  .ENGINEER_FEE_PAYMENT_NEEDED
              )
            )}
            {renderTextField(
              'EngineerFeesPayment',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.ENGINEER_FEES_PAYMENT,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS
                  .ENGINEER_FEES_PAYMENT
              )
            )}
            {renderTextField(
              'engineerFeePayment2',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.BANK_CHARGES,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.BANK_CHARGES
              )
            )}
            {renderSelectField(
              'uploadDocuments2',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_FROM_CBS,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_FROM_CBS
              ) + '*',
              boolYnOptions.data || []
            )}
            {renderCheckboxField(
              'reviewNote*',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.REVIEW_NOTE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.REVIEW_NOTE
              ) + '*',
              12
            )}
          </Grid>
        </CardContent>
      </Card>

    </LocalizationProvider>
  )
}

export default Step1
