import React, { useState, useEffect } from 'react'
import {
  useApplicationSettings,
  useBoolYnOptions,
} from '../../../../hooks/useApplicationSettings'
import { useMultipleAccountBalances } from '../../../../hooks/useAccountBalance'
import { BuildPartnerService } from '../../../../services/api/buildPartnerService'
import { useRealEstateAssets } from '../../../../hooks/useRealEstateAssets'
import { idService } from '../../../../services/api/developerIdService'
// State for developer names

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
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
import dayjs from 'dayjs'
import { useManualPaymentLabelsWithCache } from '@/hooks/useManualPaymentLabelsWithCache'
import { MANUAL_PAYMENT_LABELS } from '@/constants/mappings/manualPaymentLabels'

interface TasStep1Props {
  savedId?: string | null
  fundEgressData?: any
  loading?: boolean
  isEditMode?: boolean
}

const TasStep1 = ({ loading, isEditMode, fundEgressData }: TasStep1Props) => {
  // Form context
  const { control, setValue, watch } = useFormContext()

  // Use translation hook for TAS payment labels (same as manual payment)
  const { getLabel } = useManualPaymentLabelsWithCache('EN')

  const [developerNames, setDeveloperNames] = useState<string[]>([])
  const [buildPartners, setBuildPartners] = useState<any[]>([])

  // State for real estate assets
  const [projectNames, setProjectNames] = useState<string[]>([])
  const [realEstateAssets, setRealEstateAssets] = useState<any[]>([])

  // State for payment reference ID generation
  const [paymentRefId, setPaymentRefId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)

  // Use the new hooks for application settings
  const { data: paymentTypes, loading: paymentTypesLoading } =
    useApplicationSettings('PAYMENT_EXPENSE_TYPE')
  const { data: paymentSubTypes, loading: paymentSubTypesLoading } =
    useApplicationSettings('PAYMENT_EXPENSE_SUB_TYPE')
  const { data: currencies, loading: currenciesLoading } =
    useApplicationSettings('CURRENCY')
  const { data: depositModes, loading: depositModesLoading } =
    useApplicationSettings('DEPOSIT_MODE')
  const { data: paymentModes, loading: paymentModesLoading } =
    useApplicationSettings('PAYMENT_MODE')
  const { data: transferTypes, loading: transferTypesLoading } =
    useApplicationSettings('TRANSFER_TYPE')
  const {
    data: buildAssetAccountStatuses,
    loading: buildAssetAccountStatusesLoading,
  } = useApplicationSettings('BUILD_ASSEST_ACCOUNT_STATUS')
  const { data: boolYnOptions, loading: boolYnLoading } = useBoolYnOptions()

  // Real estate assets hook
  const { assets, loading: assetsLoading } = useRealEstateAssets(0, 20)

  // Account balance hooks for multiple accounts
  const {
    balances,
    loadingStates,
    errors: accountErrors,
    fetchBalance,
  } = useMultipleAccountBalances()

  // Fetch developer names from BuildPartnerService
  useEffect(() => {
    const fetchDeveloperNames = async () => {
      try {
        const service = new BuildPartnerService()
        const res = await service.getBuildPartners(0, 100)
        const partners = res?.content || []
        setBuildPartners(partners)
        const names = partners
          .map((bp: any) => bp.bpName)
          .filter((name: string | null) => !!name)
        setDeveloperNames(names)
      } catch (e) {
        setDeveloperNames([])
        setBuildPartners([])
      }
    }
    fetchDeveloperNames()
  }, [])

  // Populate project names from real estate assets
  useEffect(() => {
    if (assets.length > 0) {
      setRealEstateAssets(assets)
      const names = assets
        .map((asset: any) => asset.reaName)
        .filter((name: string | null) => !!name)
      setProjectNames(names)
    }
  }, [assets])

  // Handle data prepopulation when in edit mode
  useEffect(() => {
    console.log('Form population effect triggered:', {
      isEditMode,
      hasFundEgressData: !!fundEgressData,
      developerNamesLength: developerNames.length,
      projectNamesLength: projectNames.length,
      hasBuildPartnerDTO: !!fundEgressData?.buildPartnerDTO,
      hasRealEstateDTO: !!fundEgressData?.realEstateAssestDTO,
      fundEgressData: fundEgressData,
    })

    if (isEditMode && fundEgressData) {
      console.log('Starting form population with data:', fundEgressData)

      // Try setting just the basic fields first
      if (fundEgressData.fePaymentRefNumber) {
        console.log('Setting tasReference:', fundEgressData.fePaymentRefNumber)
        setValue('tasReference', fundEgressData.fePaymentRefNumber)
      }

      if (fundEgressData.buildPartnerDTO?.bpName) {
        console.log(
          'Setting developerName:',
          fundEgressData.buildPartnerDTO.bpName
        )
        console.log('Available developer names:', developerNames)
        console.log(
          'Is developer name in list?',
          developerNames.includes(fundEgressData.buildPartnerDTO.bpName)
        )

        // If the developer name is not in the list, add it
        if (!developerNames.includes(fundEgressData.buildPartnerDTO.bpName)) {
          console.log(
            'Adding developer name to list:',
            fundEgressData.buildPartnerDTO.bpName
          )
          setDeveloperNames((prev) => [
            ...prev,
            fundEgressData.buildPartnerDTO.bpName,
          ])
        }

        setValue('developerName', fundEgressData.buildPartnerDTO.bpName)

        // Debug: Check the form value after setting
        setTimeout(() => {
          const currentValue = watch('developerName')
          console.log('Current developerName form value:', currentValue)
        }, 100)
      } else {
        console.log('buildPartnerDTO is null - cannot set developerName')
      }

      if (fundEgressData.buildPartnerDTO?.bpDeveloperId) {
        console.log(
          'Setting developerId:',
          fundEgressData.buildPartnerDTO.bpDeveloperId
        )
        setValue('developerId', fundEgressData.buildPartnerDTO.bpDeveloperId)
      } else {
        console.log('buildPartnerDTO is null - cannot set developerId')
      }

      if (fundEgressData.realEstateAssestDTO?.reaName) {
        console.log(
          'Setting projectName:',
          fundEgressData.realEstateAssestDTO.reaName
        )
        setValue('projectName', fundEgressData.realEstateAssestDTO.reaName)
      } else {
        console.log('realEstateAssestDTO is null - cannot set projectName')
      }

      if (fundEgressData.realEstateAssestDTO?.reaId) {
        console.log(
          'Setting projectId:',
          fundEgressData.realEstateAssestDTO.reaId
        )
        setValue('projectId', fundEgressData.realEstateAssestDTO.reaId)
      } else {
        console.log('realEstateAssestDTO is null - cannot set projectId')
      }

      // Map the saved data to form format - use values directly from API response
      const formData = {
        // Basic Information
        tasReference: fundEgressData.fePaymentRefNumber || '',
        developerName: fundEgressData.buildPartnerDTO?.bpName || '',
        developerId: fundEgressData.buildPartnerDTO?.bpDeveloperId || '',
        projectName: fundEgressData.realEstateAssestDTO?.reaName || '',
        projectId: fundEgressData.realEstateAssestDTO?.reaId || '',
        projectStatus:
          fundEgressData.realEstateAssestDTO?.reaAccountStatusDTO
            ?.settingValue || '',

        // Payment Information
        paymentType: fundEgressData.voucherPaymentTypeDTO?.name || '',
        paymentSubType: fundEgressData.voucherPaymentSubTypeDTO?.name || '',
        paymentType1: '',
        paymentSubType1: fundEgressData.fePaymentDate
          ? dayjs(fundEgressData.fePaymentDate)
          : null,

        // Invoice Details
        invoiceNumber: fundEgressData.feInvoiceNumber || '',
        invoiceRef: fundEgressData.feInvoiceRefNo || '',
        invoiceCurrency: fundEgressData.invoiceCurrencyDTO?.name || '',
        invoiceValue: fundEgressData.feInvoiceValue || 0,
        invoiceDate: fundEgressData.feInvoiceDate
          ? dayjs(fundEgressData.feInvoiceDate)
          : null,

        // Amount Details
        engineerApprovedAmount: fundEgressData.feEngineerApprovedAmt || 0,
        totalEligibleAmount: fundEgressData.feTotalEligibleAmtInv || 0,
        amountPaid: fundEgressData.feAmtPaidAgainstInv || 0,
        amountPaid1: fundEgressData.feCapExcedded || '',
        totalAmountPaid: fundEgressData.feTotalAmountPaid || 0,
        totalAmountPaid1: fundEgressData.paymentCurrencyDTO?.name || '',
        debitCreditToEscrow: fundEgressData.feDebitFromEscrow || 0,
        currentEligibleAmount: fundEgressData.feCurEligibleAmt || 0,
        debitFromRetention: fundEgressData.feDebitFromRetention || 0,
        totalPayoutAmount: fundEgressData.feTotalPayoutAmt || 0,
        amountInTransit: fundEgressData.feAmountInTransit || 0,
        vatCapExceeded: fundEgressData.feVarCapExcedded || '',
        specialRate: fundEgressData.feSpecialRate || false,
        corporateAmount: fundEgressData.feCorporatePayment || false,
        delRefNo: fundEgressData.feDealRefNo || '',
        ppcNo: fundEgressData.fePpcNumber || '',
        vatCapExceeded3: fundEgressData.feIndicativeRate || 0,
        vatCapExceeded4: fundEgressData.feCorpCertEngFee || '',

        // Narration
        narration1: fundEgressData.feNarration1 || '',
        narration2: fundEgressData.feNarration2 || '',
        remarks: fundEgressData.feRemark || '',

        // Unit Cancellation Details
        unitNo: '',
        towerName: '',
        unitStatus: '',
        amountReceived: fundEgressData.feAmtRecdFromUnitHolder || 0,
        Forfeit: fundEgressData.feForFeit || false,
        Refundtounitholder: fundEgressData.feRefundToUnitHolder || false,
        Transfertootherunit: fundEgressData.feTransferToOtherUnit || false,
        forfeitAmount: fundEgressData.feForFeitAmt || 0,
        regulatorApprovalRef: fundEgressData.feUnitReraApprovedRefNo || '',
        paymentDate: fundEgressData.feUnitTransferAppDate
          ? dayjs(fundEgressData.feUnitTransferAppDate)
          : null,

        // Payment Details
        bankCharges: fundEgressData.fbbankCharges || '',
        paymentMode: fundEgressData.paymentModeDTO?.name || '',
        engineerFeePayment: fundEgressData.transactionTypeDTO?.name || '',
        uploadDocuments: fundEgressData.feAmountToBeReleased || 0,
        engineerFeePayment1: fundEgressData.feBeneDateOfPayment
          ? dayjs(fundEgressData.feBeneDateOfPayment)
          : null,
        uploadDocuments1: fundEgressData.feBeneVatPaymentAmt || 0,
        EngineerFeePaymentNeeded: fundEgressData.feIsEngineerFee || false,
        EngineerFeesPayment: fundEgressData.feEngineerFeePayment || '',
        engineerFeePayment2: fundEgressData.feCorporatePaymentEngFee || 0,
        uploadDocuments2: fundEgressData.payoutToBeMadeFromCbsDTO?.name || '',

        // Account Balances
        escrowAccount: fundEgressData.feCurBalInEscrowAcc || 0,
        corporateAccount: fundEgressData.feCorporateAccBalance || 0,
        corporateAccount1: fundEgressData.feSubConsAccBalance || 0,
        corporateAccount2: fundEgressData.feCurBalInRetentionAcc || 0,

        // Additional Fields from API Response
        paymentAmount: fundEgressData.fePaymentAmount || 0,
        isManualPayment: fundEgressData.feIsManualPayment || false,
        isTasPayment: fundEgressData.feIsTasPayment || false,
        docVerified: fundEgressData.feDocVerified || false,
        paymentStatus: fundEgressData.fePaymentStatus || '',
        splitPayment: fundEgressData.feSplitPayment || false,
        includeInPayout: fundEgressData.feIncludeInPayout || false,
        beneficiaryToMaster: fundEgressData.feBeneficiaryToMaster || false,
        fromProject: fundEgressData.feBenefFromProject || false,
        discardPayment: fundEgressData.feDiscardPayment || false,
        tasPaymentSuccess: fundEgressData.feTasPaymentSuccess || false,
        tasPaymentRerun: fundEgressData.fetasPaymentRerun || false,
      }

      // Set form values
      console.log('Setting form values:', formData)
      Object.entries(formData).forEach(([key, value]) => {
        console.log(`Setting ${key}:`, value)
        setValue(key as any, value)
      })
      console.log('Form population completed')
    } else {
      console.log('Form population skipped - conditions not met')
    }
  }, [isEditMode, fundEgressData, setValue])

  // Function to generate new payment reference ID
  const handleGeneratePaymentRefId = async () => {
    try {
      setIsGeneratingId(true)
      const newIdResponse = idService.generateNewId('PAY')
      setPaymentRefId(newIdResponse.id)
      setValue('tasReference', newIdResponse.id)
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
        const selectedPartner = buildPartners.find(
          (bp) => bp.bpName === value.developerName
        )
        if (selectedPartner) {
          setValue('developerId', selectedPartner.bpDeveloperId)
        }
      }

      // Watch for project name changes and auto-populate project ID
      if (name === 'projectName' && value.projectName) {
        const selectedAsset = realEstateAssets.find(
          (asset) => asset.id === parseInt(value.projectName)
        )
        if (selectedAsset) {
          setValue('projectId', selectedAsset.reaId)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue, buildPartners, realEstateAssets])

  // Initialize payment reference ID from form value
  React.useEffect(() => {
    const currentId = watch('tasReference')
    if (currentId && currentId !== paymentRefId) {
      setPaymentRefId(currentId)
    }
  }, [watch, paymentRefId])

  // Common styles for form components
  const commonFieldStyles = {
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
  }

  const selectStyles = {
    height: '48px',
    '& .MuiOutlinedInput-root': {
      height: '48px',
      borderRadius: '8px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #CAD5E2',
      transition: 'all 0.2s ease-in-out',
      '& fieldset': {
        border: 'none',
      },
      '&:hover': {
        borderColor: '#3B82F6',
        borderWidth: '1px',
      },
      '&.Mui-focused': {
        borderColor: '#2563EB',
        borderWidth: '1px',
        boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.1)',
      },
    },
    '& .MuiSelect-icon': {
      color: '#64748B',
      fontSize: '20px',
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
    isRequired = false
  ) => {
    const validationRules: any = {}

    if (isRequired) {
      validationRules.required = `${label} is required`
    }

    // Add specific validation rules based on field name
    if (name === 'tasReference') {
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
              disabled={true}
              error={!!error}
              helperText={error?.message}
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
    isRequired = true
  ) => {
    console.log(`Rendering select field ${name} with options:`, options)
    const validationRules: any = {}

    if (isRequired) {
      validationRules.required = `${label} is required`
    }

    // Add specific validation rules based on field name
    if (name === 'developerName') {
      validationRules.validate = (value: string) => {
        if (!value || value === '') {
          return 'Please select a developer'
        }
        return true
      }
    }

    if (name === 'projectName') {
      validationRules.validate = (value: string) => {
        if (!value || value === '') {
          return 'Please select a project'
        }
        return true
      }
    }

    if (name === 'paymentType') {
      validationRules.validate = (value: string) => {
        if (!value || value === '') {
          return 'Please select a payment type'
        }
        return true
      }
    }

    if (name === 'invoiceCurrency' || name === 'totalAmountPaid1') {
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
          render={({ field }) => {
            console.log(`Select field ${name} current value:`, field.value)
            return (
              <FormControl fullWidth>
                <InputLabel sx={labelSx}>{label}</InputLabel>
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
                  IconComponent={KeyboardArrowDownIcon}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #E5E7EB',
                        marginTop: '8px',
                        maxHeight: '300px',
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
                  {options.map((option) => (
                    <MenuItem
                      key={option.id || option}
                      value={option.id || option}
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
            )
          }}
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
              disabled={true}
              format="DD/MM/YYYY"
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
            disabled={true}
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
                    onClick={() => {}}
                    disabled={true}
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
                disabled={true}
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
            disabled={true}
            value={paymentRefId}
            onChange={(e) => {
              setPaymentRefId(e.target.value)
              field.onChange(e)
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 0 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleGeneratePaymentRefId}
                    disabled={isGeneratingId || true}
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
                      disabled={
                        loadingStates[accountKey] || !field.value || true
                      }
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

  // Check if all required data is loaded
  const isDataLoading =
    loading ||
    paymentTypesLoading ||
    paymentSubTypesLoading ||
    currenciesLoading ||
    depositModesLoading ||
    paymentModesLoading ||
    transferTypesLoading ||
    buildAssetAccountStatusesLoading ||
    boolYnLoading ||
    assetsLoading ||
    developerNames.length === 0 ||
    realEstateAssets.length === 0

  if (isDataLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="500px"
        sx={{
          backgroundColor: '#FFFFFFBF',
          borderRadius: '16px',
          margin: '0 auto',
          width: '84%',
          padding: '40px',
        }}
      >
        <CircularProgress
          size={60}
          sx={{
            color: '#155DFC',
            mb: 3,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            color: '#374151',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 500,
          }}
        >
          {getLabel(
            MANUAL_PAYMENT_LABELS.STEPS.DETAILS,
            'EN',
            MANUAL_PAYMENT_LABELS.FALLBACKS.STEPS.DETAILS
          )}
        </Typography>
        {/* <Typography
          variant="body2"
          sx={{
            color: '#6B7280',
            textAlign: 'center',
            fontFamily: 'Outfit, sans-serif',
            maxWidth: '400px',
          }}
        >
          Loading TAS payment form data...
        </Typography> */}
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* {paymentTypesLoading && (
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              • Loading payment types...
            </Typography>
          )} */}
          {/* {currenciesLoading && (
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              • Loading currencies...
            </Typography>
          )} */}
          {/* {assetsLoading && (
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              • Loading...
            </Typography>
          )} */}
          {/* {developerNames.length === 0 && (
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              • Loading...
            </Typography>
          )} */}
        </Box>
      </Box>
    )
  }

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
            {renderTextField(
              'developerName',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.DEVELOPER_NAME,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.DEVELOPER_NAME
              ) + '*',
              6,
              '',
              true
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
            {renderTextField(
              'projectName',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PROJECT_NAME,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PROJECT_NAME
              ) + '*',
              6,
              '',
              true
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
            {renderTextField(
              'projectStatus',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PROJECT_STATUS,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PROJECT_STATUS
              ),
              6,
              '',
              false
            )}
            {renderAccountBalanceField(
              'escrow',
              'escrowAccount',
              'Escrow Account',
              'subConstructionAccount',
              'Current Balance in Escrow Account*'
            )}
            {renderAccountBalanceField(
              'subConstruction',
              'corporateAccount',
              'Sub Construction Account',
              'retentionAccount',
              'Current Balance in Sub Construction Account*'
            )}
            {renderAccountBalanceField(
              'corporate',
              'corporateAccount1',
              'Corporate Account',
              'retentionAccount1',
              'Current Balance in Corporate Account*'
            )}
            {renderAccountBalanceField(
              'retention',
              'corporateAccount2',
              'Retention Account',
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
                {getLabel(
                  MANUAL_PAYMENT_LABELS.SECTION_TITLES.EXPENSE_TYPE,
                  'EN',
                  MANUAL_PAYMENT_LABELS.FALLBACKS.SECTION_TITLES.EXPENSE_TYPE
                )}
              </Typography>
            </Grid>

            {renderTextField(
              'paymentType',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_TYPE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_TYPE
              ) + '*',
              6,
              '',
              true
            )}
            {renderTextField(
              'paymentSubType',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_SUB_TYPE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_SUB_TYPE
              ),
              6,
              '',
              false
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
            {renderTextField(
              'invoiceCurrency',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.INVOICE_CURRENCY,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INVOICE_CURRENCY
              ) + '*',
              3,
              '',
              true
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
                {getLabel(
                  MANUAL_PAYMENT_LABELS.SECTION_TITLES.AMOUNT_DETAILS,
                  'EN',
                  MANUAL_PAYMENT_LABELS.FALLBACKS.SECTION_TITLES.AMOUNT_DETAILS
                )}
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
            {renderTextField(
              'totalAmountPaid1',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_CURRENCY,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_CURRENCY
              ) + '*',
              3,
              '',
              true
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
                {getLabel(
                  MANUAL_PAYMENT_LABELS.SECTION_TITLES.NARRATION,
                  'EN',
                  MANUAL_PAYMENT_LABELS.FALLBACKS.SECTION_TITLES.NARRATION
                )}
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
                {getLabel(
                  MANUAL_PAYMENT_LABELS.SECTION_TITLES.UNIT_CANCELLATION,
                  'EN',
                  MANUAL_PAYMENT_LABELS.FALLBACKS.SECTION_TITLES
                    .UNIT_CANCELLATION
                )}
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
              ) + '*',
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

            {renderTextField(
              'bankCharges',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.CHARGE_MODE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.CHARGE_MODE
              ),
              6,
              '',
              false
            )}
            {renderTextField(
              'paymentMode',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_MODE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_MODE
              ),
              6,
              '',
              false
            )}
            {renderTextField(
              'engineerFeePayment',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.TRANSACTION_TYPE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TRANSACTION_TYPE
              ),
              6,
              '',
              false
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
            {renderTextField(
              'uploadDocuments2',
              getLabel(
                MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_FROM_CBS,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_FROM_CBS
              ) + '*',
              6,
              '',
              true
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

export default TasStep1
