'use client'

import { useCapitalPartnerLabelsApi } from '@/hooks/useCapitalPartnerLabelsApi'
import { useAppStore } from '@/store'
import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react'
import { capitalPartnerPaymentPlanService } from '../../../../services/api/capitalPartnerPaymentPlanService'
import { useGetEnhanced } from '@/hooks/useApiEnhanced'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { PaymentPlanResponse } from '@/types/capitalPartner'
import dayjs from 'dayjs'
import {
  mapStep3ToCapitalPartnerPaymentPlanPayload,
  validateStep3Data,
  type Step3FormData,
} from '../../../../utils/capitalPartnerPaymentPlanMapper'

const errors: Record<string, any> = {}

import {
  Box,
  TextField,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { PaymentPlanData } from '../investorsTypes'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import { Controller, useFormContext } from 'react-hook-form'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const commonFieldStyles = {
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

const valueSx = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#333',
  lineHeight: 1.4,
}

const labelSx = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  mb: 0.5,
}

const datePickerStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#B0B0B0',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
    },
  },
}

interface Step3Props {
  paymentPlan: PaymentPlanData[]
  onPaymentPlanChange: (paymentPlan: PaymentPlanData[]) => void
  onSaveAndNext?: (data: any) => void
  capitalPartnerId?: number | null
  isEditMode?: boolean
  isViewMode?: boolean
}

export interface Step3Ref {
  handleSaveAndNext: () => Promise<void>
}

const Step3 = forwardRef<Step3Ref, Step3Props>(
  (
    {
      paymentPlan,
      onPaymentPlanChange,
      onSaveAndNext,
      capitalPartnerId,
      isEditMode,
      isViewMode = false,
    },
    ref
  ) => {
    const [saveError, setSaveError] = useState<string | null>(null)
    const [currentExistingPaymentPlanData, setCurrentExistingPaymentPlanData] =
      useState<PaymentPlanResponse[]>([])

    const { control, watch, setValue } = useFormContext()
    const { getLabel } = useCapitalPartnerLabelsApi()
    const currentLanguage = useAppStore((state) => state.language)

    // Load existing payment plan data when in edit mode
    const {
      data: existingPaymentPlanData,
      isLoading: isLoadingExistingPaymentPlan,
    } = useGetEnhanced<PaymentPlanResponse[]>(
      `${API_ENDPOINTS.CAPITAL_PARTNER_PAYMENT_PLAN.GET_ALL}?capitalPartnerId.equals=${capitalPartnerId || 0}`,
      {},
      {
        enabled: Boolean(isEditMode && capitalPartnerId),
      }
    )

    // Update current existing payment plan data when fetched data changes
    useEffect(() => {
      if (existingPaymentPlanData) {
        setCurrentExistingPaymentPlanData([...existingPaymentPlanData])
      }
    }, [existingPaymentPlanData])

    // Pre-populate form when existing data is loaded
    useEffect(() => {
      if (
        isEditMode &&
        existingPaymentPlanData &&
        existingPaymentPlanData.length > 0 &&
        !isLoadingExistingPaymentPlan
      ) {
        // Map existing payment plan data to the form format
        const mappedPaymentPlan: PaymentPlanData[] =
          existingPaymentPlanData.map((plan, index) => {
            // Set the installment date in the form
            if (plan.cpppInstallmentDate) {
              setValue(
                `installmentDate${index}`,
                dayjs(plan.cpppInstallmentDate)
              )
            }

            return {
              installmentNumber: plan.cpppInstallmentNumber || index + 1,
              installmentPercentage: '',
              projectCompletionPercentage:
                plan.cpppBookingAmount?.toString() || '',
            }
          })

        // Update the payment plan state
        onPaymentPlanChange(mappedPaymentPlan)
      }
    }, [
      existingPaymentPlanData,
      isLoadingExistingPaymentPlan,
      isEditMode,
      setValue,
      onPaymentPlanChange,
    ])

    const handlePaymentPlanChange = (
      index: number,
      field: keyof PaymentPlanData,
      value: unknown
    ) => {
      const updatedPaymentPlan = [...paymentPlan]
      updatedPaymentPlan[index] = {
        ...updatedPaymentPlan[index],
        [field]: value,
      } as PaymentPlanData
      onPaymentPlanChange(updatedPaymentPlan)
    }

    const handleSaveAndNext = async () => {
      try {
        setSaveError(null)

        if (!capitalPartnerId) {
          setSaveError('Capital Partner ID is required from Step1')
          throw new Error('Capital Partner ID is required from Step1')
        }

        const installmentDates: { [key: string]: any } = {}
        paymentPlan.forEach((_, index) => {
          const dateKey = `installmentDate${index}`
          installmentDates[dateKey] = watch(dateKey)
        })

        const formData: Step3FormData = {
          paymentPlan: paymentPlan,
          installmentDates: installmentDates,
        }

        const validationErrors = validateStep3Data(formData)
        if (validationErrors.length > 0) {
          setSaveError(validationErrors.join(', '))
          throw new Error(validationErrors.join(', '))
        }

        const payloadArray = mapStep3ToCapitalPartnerPaymentPlanPayload(
          formData,
          capitalPartnerId
        )

        const responses = []
        for (let i = 0; i < payloadArray.length; i++) {
          const payload = payloadArray[i]
          let response

          if (
            isEditMode &&
            currentExistingPaymentPlanData &&
            currentExistingPaymentPlanData.length > i
          ) {
            // Update existing payment plan
            const existingPaymentPlanId = currentExistingPaymentPlanData[i]?.id
            if (existingPaymentPlanId) {
              // Add the id to the payload for update requests
              const updatePayload = {
                ...payload,
                id: existingPaymentPlanId,
              }
              response =
                await capitalPartnerPaymentPlanService.updateCapitalPartnerPaymentPlan(
                  existingPaymentPlanId,
                  updatePayload
                )
            } else {
              // Fallback to create if no existing ID
              response =
                await capitalPartnerPaymentPlanService.createCapitalPartnerPaymentPlan(
                  payload
                )
            }
          } else {
            // Create new payment plan
            response =
              await capitalPartnerPaymentPlanService.createCapitalPartnerPaymentPlan(
                payload
              )
          }
          responses.push(response)
        }

        if (onSaveAndNext) {
          onSaveAndNext(responses)
        }
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : 'Failed to save data'
        )
        throw error
      }
    }
    useImperativeHandle(
      ref,
      () => ({
        handleSaveAndNext,
      }),
      [handleSaveAndNext]
    )

    const addPaymentPlan = () => {
      const newIndex = paymentPlan.length

      // Clear form values for the new payment plan row
      setValue(`installmentDate${newIndex}`, null)

      onPaymentPlanChange([
        ...paymentPlan,
        {
          installmentNumber: newIndex + 1,
          installmentPercentage: '',
          projectCompletionPercentage: '',
        },
      ])
    }

    const deletePaymentPlan = async (index: number) => {
      try {
        // If in edit mode and payment plan exists, call delete API
        if (
          isEditMode &&
          currentExistingPaymentPlanData &&
          currentExistingPaymentPlanData.length > index
        ) {
          const paymentPlanToDelete = currentExistingPaymentPlanData[index]
          if (paymentPlanToDelete?.id) {
            await capitalPartnerPaymentPlanService.deleteCapitalPartnerPaymentPlan(
              paymentPlanToDelete.id
            )

            // Remove the deleted payment plan from current existing data
            const updatedExistingData = currentExistingPaymentPlanData.filter(
              (_, i) => i !== index
            )
            setCurrentExistingPaymentPlanData(updatedExistingData)
          }
        }

        // Update the local state regardless of API call
        const updatedPaymentPlan = paymentPlan.filter((_, i) => i !== index)
        const reorderedPlan = updatedPaymentPlan.map((plan, idx) => ({
          ...plan,
          installmentNumber: idx + 1,
        }))

        // Clear form values for removed and shifted rows
        // Clear the last row's form data since it's being removed
        setValue(`installmentDate${paymentPlan.length - 1}`, null)

        onPaymentPlanChange(reorderedPlan)
      } catch (error) {
        // Still update local state even if API call fails
        const updatedPaymentPlan = paymentPlan.filter((_, i) => i !== index)
        const reorderedPlan = updatedPaymentPlan.map((plan, idx) => ({
          ...plan,
          installmentNumber: idx + 1,
        }))

        // Also update existing data even if API call failed (optimistic update)
        if (isEditMode && currentExistingPaymentPlanData.length > index) {
          const updatedExistingData = currentExistingPaymentPlanData.filter(
            (_, i) => i !== index
          )
          setCurrentExistingPaymentPlanData(updatedExistingData)
        }

        // Clear form values for removed and shifted rows
        // Clear the last row's form data since it's being removed
        setValue(`installmentDate${paymentPlan.length - 1}`, null)

        onPaymentPlanChange(reorderedPlan)
      }
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

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card
          sx={{
            boxShadow: 'none',
            backgroundColor: '#FFFFFFBF',
            width: '94%',
            margin: '0 auto',
          }}
        >
          <CardContent>
            {saveError && (
              <Box
                sx={{
                  mb: 2,
                  p: 1,
                  bgcolor: '#fef2f2',
                  borderRadius: 1,
                  border: '1px solid #ef4444',
                }}
              >
                <Typography variant="body2" color="error">
                  ⚠️ {saveError}
                </Typography>
              </Box>
            )}
            <Box display="flex" justifyContent="end" alignItems="center" mb={2}>
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={addPaymentPlan}
                disabled={isViewMode}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '16px',
                  lineHeight: '24px',
                  letterSpacing: '0.5px',
                  verticalAlign: 'middle',
                }}
              >
                {getLabel(
                  'CDL_CP_ADD_PAYMENT_PLAN',
                  currentLanguage,
                  'Add Payment Plan'
                )}
                {getLabel(
                  'CDL_CP_ADD_PAYMENT_PLAN',
                  currentLanguage,
                  'Add Payment Plan'
                )}
              </Button>
            </Box>
            <TableContainer
              component={Paper}
              sx={{ boxShadow: 'none', borderRadius: '8px' }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={valueSx}>
                      {getLabel(
                        'CDL_CP_INSTALLMENT_NUMBER',
                        currentLanguage,
                        'Installment Number'
                      )}
                    </TableCell>
                    <TableCell sx={valueSx}>
                      {getLabel(
                        'CDL_CP_INSTALLMENT_DATE',
                        currentLanguage,
                        'Installment Date'
                      )}
                    </TableCell>
                    <TableCell sx={valueSx}>
                      {getLabel(
                        'CDL_CP_BOOKING_AMOUNT',
                        currentLanguage,
                        'Booking Amount'
                      )}
                    </TableCell>
                    <TableCell sx={valueSx}>
                      {getLabel('CDL_CP_ACTION', currentLanguage, 'Action')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentPlan.map((plan, index) => (
                    <TableRow key={index}>
                      <TableCell>{plan.installmentNumber}</TableCell>
                      <TableCell>
                        <Controller
                          name={`installmentDate${index}`}
                          control={control}
                          defaultValue={null}
                          render={({ field }) => (
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              format="DD/MM/YYYY"
                              disabled={isViewMode}
                              slots={{
                                openPickerIcon: StyledCalendarIcon,
                              }}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  error: !!errors.agreementDate,
                                  sx: datePickerStyles,
                                  InputLabelProps: { sx: labelSx },
                                  InputProps: {
                                    sx: valueSx,
                                    style: { height: '32px' },
                                  },
                                },
                              }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name={`bookingAmount${index}`}
                          size="small"
                          fullWidth
                          disabled={isViewMode}
                          placeholder={getLabel(
                            'CDL_CP_AMOUNT',
                            currentLanguage,
                            'Amount'
                          )}
                          value={plan.projectCompletionPercentage}
                          onChange={(e) =>
                            handlePaymentPlanChange(
                              index,
                              'projectCompletionPercentage',
                              e.target.value
                            )
                          }
                          InputLabelProps={{ sx: labelSx }}
                          InputProps={{ sx: valueSx }}
                          sx={commonFieldStyles}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => deletePaymentPlan(index)}
                          disabled={isViewMode}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </LocalizationProvider>
    )
  }
)

Step3.displayName = 'Step3'

export default Step3
