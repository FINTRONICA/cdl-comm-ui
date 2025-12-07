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
} from '@mui/material'
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material'
import { Pencil, Trash2 } from 'lucide-react'
import { PaymentPlanData } from '../investorsTypes'

// Extended PaymentPlanData to track new entries
interface ExtendedPaymentPlanData extends PaymentPlanData {
  isNewEntry?: boolean
}
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import { Controller, useFormContext } from 'react-hook-form'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useTheme, alpha } from '@mui/material/styles'
import {
  commonFieldStyles as sharedCommonFieldStyles,
  datePickerStyles as sharedDatePickerStyles,
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  calendarIconSx as sharedCalendarIconSx,
  cardStyles as sharedCardStyles,
  primaryButtonSx,
} from '../styles'

interface Step3Props {
  paymentPlan: ExtendedPaymentPlanData[]
  onPaymentPlanChange: (paymentPlan: ExtendedPaymentPlanData[]) => void
  onSaveAndNext?: (data: any) => void
  capitalPartnerId?: number | null
  isEditMode?: boolean
  isViewMode?: boolean
}

export interface Step3Ref {
  handleSaveAndNext: () => Promise<void>
  hasUnconfirmedEntries: () => boolean
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
    const [currentExistingPaymentPlanData, setCurrentExistingPaymentPlanData] =
      useState<PaymentPlanResponse[]>([])
    const [isDataLoaded, setIsDataLoaded] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [editingData, setEditingData] = useState<{
      date: any
      amount: string
    } | null>(null)
    const [fieldErrors, setFieldErrors] = useState<{
      [key: string]: { date?: string; amount?: string }
    }>({})

    const { control, watch, setValue } = useFormContext()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const fieldStyles = React.useMemo(
      () => (sharedCommonFieldStyles as any)(theme),
      [theme]
    )
    const dateFieldStyles = React.useMemo(
      () => (sharedDatePickerStyles as any)(theme),
      [theme]
    )
    const labelStyles = React.useMemo(
      () => (sharedLabelSx as any)(theme),
      [theme]
    )
    const valueStyles = React.useMemo(
      () => (sharedValueSx as any)(theme),
      [theme]
    )
    const calendarIconStyles = React.useMemo(
      () => (sharedCalendarIconSx as any)(theme),
      [theme]
    )
    const cardBaseStyles = React.useMemo(
      () => (sharedCardStyles as any)(theme),
      [theme]
    )
    const addPaymentPlanButtonSx = React.useMemo(
      () => ({
        ...(primaryButtonSx as any),
        fontSize: '16px',
        lineHeight: '24px',
        letterSpacing: '0.5px',
        color: isDark
          ? theme.palette.primary.light
          : theme.palette.primary.main,
        borderColor: isDark
          ? alpha(theme.palette.primary.light, 0.4)
          : theme.palette.primary.main,
        '&:hover': {
          borderColor: isDark
            ? theme.palette.primary.light
            : theme.palette.primary.dark,
          backgroundColor: isDark
            ? alpha(theme.palette.primary.main, 0.15)
            : alpha(theme.palette.primary.main, 0.08),
        },
      }),
      [isDark, theme]
    )
    const tableHeaderCellSx = React.useMemo(
      () => ({
        ...valueStyles,
        color: isDark
          ? theme.palette.common.white
          : (valueStyles?.color ?? theme.palette.text.primary),
        borderBottom: `1px solid ${
          isDark
            ? alpha(theme.palette.common.white, 0.12)
            : alpha(theme.palette.divider, 0.8)
        }`,
      }),
      [isDark, theme, valueStyles]
    )
    const tableBodyCellSx = React.useMemo(
      () => ({
        color: isDark ? theme.palette.common.white : theme.palette.text.primary,
        borderBottom: `1px solid ${
          isDark
            ? alpha(theme.palette.common.white, 0.08)
            : alpha(theme.palette.divider, 0.5)
        }`,
      }),
      [isDark, theme]
    )
    const tableContainerSx = React.useMemo(
      () => ({
        boxShadow: 'none',
        borderRadius: '8px',
        backgroundColor: isDark
          ? alpha(theme.palette.background.paper, 0.3)
          : theme.palette.background.paper,
      }),
      [isDark, theme]
    )
    const tableHeadSx = React.useMemo(
      () => ({
        backgroundColor: isDark
          ? alpha(theme.palette.common.white, 0.05)
          : alpha('#F1F5F9', 0.6),
      }),
      [isDark, theme]
    )
    const successIconSx = React.useMemo(
      () => ({
        color: theme.palette.success.main,
        '&:hover': {
          backgroundColor: alpha(theme.palette.success.main, 0.12),
        },
      }),
      [theme]
    )
    const errorIconSx = React.useMemo(
      () => ({
        color: theme.palette.error.main,
        '&:hover': {
          backgroundColor: alpha(theme.palette.error.main, 0.12),
        },
      }),
      [theme]
    )
    const editIconSx = React.useMemo(
      () => ({
        color: isDark
          ? theme.palette.primary.light
          : theme.palette.primary.main,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
        },
      }),
      [isDark, theme]
    )
    const deleteIconSx = React.useMemo(
      () => ({
        color: theme.palette.error.main,
        '&:hover': {
          backgroundColor: alpha(theme.palette.error.main, 0.12),
        },
      }),
      [theme]
    )
    const { getLabel } = useCapitalPartnerLabelsApi()
    const currentLanguage = useAppStore((state) => state.language)

    // Load existing payment plan data when in edit mode
    const {
      data: existingPaymentPlanData,
      isLoading: isLoadingExistingPaymentPlan,
    } = useGetEnhanced<PaymentPlanResponse[]>(
      `${API_ENDPOINTS.CAPITAL_PARTNER_PAYMENT_PLAN.GET_ALL}?capitalPartnerId.equals=${capitalPartnerId || 0}&deleted.equals=false&enabled.equals=true`,
      {},
      {
        enabled: Boolean(isEditMode && capitalPartnerId),
        // Disable caching to always fetch fresh data
        gcTime: 0,
        staleTime: 0,
        // Refetch when component mounts
        refetchOnMount: true,
        refetchOnWindowFocus: false,
      }
    )

    // Reset data loaded flag when capitalPartnerId changes (e.g., navigating to different capital partner)
    useEffect(() => {
      setIsDataLoaded(false)
    }, [capitalPartnerId])

    // Update current existing payment plan data when fetched data changes
    useEffect(() => {
      if (existingPaymentPlanData) {
        setCurrentExistingPaymentPlanData([...existingPaymentPlanData])
        // Reset the loaded flag to allow re-population
        setIsDataLoaded(false)
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
        // Clear all existing form date values first
        paymentPlan.forEach((_, i) => {
          setValue(`installmentDate${i}`, null)
        })

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
              isNewEntry: false, // Explicitly mark existing entries as confirmed
            }
          })

        // Update the payment plan state only if data has changed
        const currentPlanJson = JSON.stringify(paymentPlan)
        const newPlanJson = JSON.stringify(mappedPaymentPlan)

        if (currentPlanJson !== newPlanJson || !isDataLoaded) {
          onPaymentPlanChange(mappedPaymentPlan)
          setIsDataLoaded(true)
        }
      }
    }, [
      existingPaymentPlanData,
      isLoadingExistingPaymentPlan,
      isEditMode,
      setValue,
      onPaymentPlanChange,
      isDataLoaded,
    ])

    const handlePaymentPlanChange = (
      index: number,
      field: keyof ExtendedPaymentPlanData,
      value: unknown
    ) => {
      const updatedPaymentPlan = [...paymentPlan]
      updatedPaymentPlan[index] = {
        ...updatedPaymentPlan[index],
        [field]: value,
      } as ExtendedPaymentPlanData
      onPaymentPlanChange(updatedPaymentPlan)
    }

    const handleSaveAndNext = async () => {
      try {
        if (!capitalPartnerId) {
          throw new Error('Capital Partner ID is required from Step1')
        }

        // Filter out new entries that haven't been saved yet - only save existing entries
        const existingPaymentPlans = paymentPlan.filter(
          (plan) => !plan.isNewEntry
        )

        if (existingPaymentPlans.length === 0) {
          // No existing payment plans to save, just proceed
          if (onSaveAndNext) {
            onSaveAndNext([])
          }
          return
        }

        const installmentDates: { [key: string]: any } = {}
        existingPaymentPlans.forEach((_, index) => {
          const originalIndex = paymentPlan.findIndex(
            (plan) => plan === existingPaymentPlans[index]
          )
          const dateKey = `installmentDate${originalIndex}`
          installmentDates[dateKey] = watch(dateKey)
        })

        const formData: Step3FormData = {
          paymentPlan: existingPaymentPlans,
          installmentDates: installmentDates,
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
              // Add the id and preserve deleted/enabled fields for update requests
              const existingPlan = currentExistingPaymentPlanData[i]
              const updatePayload = {
                ...payload,
                id: existingPaymentPlanId,
                deleted: existingPlan?.deleted ?? false,
                enabled: existingPlan?.enabled ?? true,
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

        // Update the current existing payment plan data with the saved responses
        // This ensures that the state is in sync with the backend
        if (responses.length > 0) {
          setCurrentExistingPaymentPlanData(responses as PaymentPlanResponse[])
        }

        if (onSaveAndNext) {
          onSaveAndNext(responses)
        }
      } catch (error) {
        throw error
      }
    }
    const hasUnconfirmedEntries = () => {
      return (
        editingIndex !== null ||
        paymentPlan.some((plan) => plan.isNewEntry === true)
      )
    }

    // Expose validation state to parent stepper via window object
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const hasUnsavedChanges = hasUnconfirmedEntries()
        ;(window as any).step3ValidationState = {
          hasUnsavedChanges,
          isValid: !hasUnsavedChanges,
        }
      }
    }, [editingIndex, paymentPlan])

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (typeof window !== 'undefined') {
          delete (window as any).step3ValidationState
        }
      }
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        handleSaveAndNext,
        hasUnconfirmedEntries,
      }),
      [handleSaveAndNext, editingIndex, paymentPlan]
    )

    const addPaymentPlan = () => {
      const newIndex = paymentPlan.length

      // Find the maximum installment number to avoid duplicates
      const maxInstallmentNumber =
        paymentPlan.length > 0
          ? Math.max(...paymentPlan.map((plan) => plan.installmentNumber))
          : 0

      // Clear form values for the new payment plan row
      setValue(`installmentDate${newIndex}`, null)

      onPaymentPlanChange([
        ...paymentPlan,
        {
          installmentNumber: maxInstallmentNumber + 1,
          installmentPercentage: '',
          projectCompletionPercentage: '',
          isNewEntry: true, // Mark as new entry
        },
      ])
    }

    const handleEditRow = (index: number) => {
      setEditingIndex(index)
      setEditingData({
        date: watch(`installmentDate${index}`),
        amount: paymentPlan[index]?.projectCompletionPercentage || '',
      })
    }

    const handleCancelEdit = () => {
      setEditingIndex(null)
      setEditingData(null)
    }

    const handleSaveEdit = async (index: number) => {
      try {
        const currentPlan = paymentPlan[index]
        if (!editingData || !currentPlan) return

        // Update local state
        const updatedPaymentPlan = [...paymentPlan]
        updatedPaymentPlan[index] = {
          installmentNumber: currentPlan.installmentNumber,
          installmentPercentage: currentPlan.installmentPercentage,
          projectCompletionPercentage: editingData.amount,
        }

        // Update form value for date
        setValue(`installmentDate${index}`, editingData.date)

        // Update payment plan
        onPaymentPlanChange(updatedPaymentPlan)

        // If in edit mode, update via API
        if (
          isEditMode &&
          currentExistingPaymentPlanData &&
          currentExistingPaymentPlanData.length > index
        ) {
          const existingPaymentPlanId =
            currentExistingPaymentPlanData[index]?.id
          const updatedEntry = updatedPaymentPlan[index]
          if (existingPaymentPlanId && capitalPartnerId && updatedEntry) {
            const existingPlan = currentExistingPaymentPlanData[index]
            const payload = {
              id: existingPaymentPlanId,
              cpppInstallmentNumber: updatedEntry.installmentNumber,
              cpppInstallmentDate: editingData.date
                ?.startOf?.('day')
                ?.toISOString?.(),
              cpppBookingAmount: parseFloat(editingData.amount) || 0,
              capitalPartnerDTO: {
                id: capitalPartnerId,
              },
              deleted: existingPlan?.deleted ?? false,
              enabled: existingPlan?.enabled ?? true,
            }

            await capitalPartnerPaymentPlanService.updateCapitalPartnerPaymentPlan(
              existingPaymentPlanId,
              payload
            )
          }
        }

        // Clear editing state
        setEditingIndex(null)
        setEditingData(null)
      } catch (error) {
        console.error('Error saving edit:', error)
      }
    }

    const handleSaveNewEntry = async (index: number) => {
      try {
        if (!capitalPartnerId) {
          return
        }

        const plan = paymentPlan[index]
        if (!plan) {
          return
        }

        const installmentDate = watch(`installmentDate${index}`)

        // Validate required fields and set field-level errors
        const errors: { date?: string; amount?: string } = {}

        if (!installmentDate) {
          errors.date = 'Installment Date is required'
        }

        if (
          !plan.projectCompletionPercentage ||
          plan.projectCompletionPercentage.trim() === ''
        ) {
          errors.amount = 'Initial Booking Payment is required'
        }

        if (Object.keys(errors).length > 0) {
          setFieldErrors((prev) => ({
            ...prev,
            [`row${index}`]: errors,
          }))
          return
        }

        // Clear field errors for this row
        setFieldErrors((prev) => {
          const updated = { ...prev }
          delete updated[`row${index}`]
          return updated
        })

        const payload = {
          cpppInstallmentNumber: plan.installmentNumber,
          cpppInstallmentDate: installmentDate
            ?.startOf?.('day')
            ?.toISOString?.(),
          cpppBookingAmount: parseFloat(plan.projectCompletionPercentage) || 0,
          capitalPartnerDTO: {
            id: capitalPartnerId,
          },
          deleted: false,
        }

        const response =
          await capitalPartnerPaymentPlanService.createCapitalPartnerPaymentPlan(
            payload
          )

        // Update the payment plan to mark it as no longer new
        const updatedPaymentPlan = [...paymentPlan]
        updatedPaymentPlan[index] = {
          installmentNumber: plan.installmentNumber,
          installmentPercentage: plan.installmentPercentage,
          projectCompletionPercentage: plan.projectCompletionPercentage,
          isNewEntry: false,
        }
        onPaymentPlanChange(updatedPaymentPlan)

        // Add to existing payment plan data
        setCurrentExistingPaymentPlanData([
          ...currentExistingPaymentPlanData,
          response,
        ])
      } catch (error) {
        console.error('Error saving new entry:', error)
      }
    }

    const handleCancelNewEntry = (index: number) => {
      // Store dates from form values before deletion
      const savedDates: any[] = []
      paymentPlan.forEach((_, i) => {
        savedDates[i] = watch(`installmentDate${i}`)
      })

      // Remove the new entry from payment plan
      const updatedPaymentPlan = paymentPlan.filter((_, i) => i !== index)

      // Reorganize form date values for remaining rows
      const filteredDates = savedDates.filter((_, i) => i !== index)

      // Clear all existing date form values first
      paymentPlan.forEach((_, i) => {
        setValue(`installmentDate${i}`, null)
      })

      // Set dates for remaining rows with new indices
      filteredDates.forEach((date, newIndex) => {
        setValue(`installmentDate${newIndex}`, date)
      })

      // Clear any field errors for this row
      setFieldErrors((prev) => {
        const updated = { ...prev }
        delete updated[`row${index}`]
        return updated
      })

      onPaymentPlanChange(updatedPaymentPlan)
    }

    const deletePaymentPlan = async (index: number) => {
      try {
        // If in edit mode and payment plan exists, call soft delete API
        if (
          isEditMode &&
          currentExistingPaymentPlanData &&
          currentExistingPaymentPlanData.length > index
        ) {
          const paymentPlanToDelete = currentExistingPaymentPlanData[index]
          if (paymentPlanToDelete?.id) {
            // Call soft delete API endpoint
            await capitalPartnerPaymentPlanService.softDeleteCapitalPartnerPaymentPlan(
              paymentPlanToDelete.id
            )

            // Remove the deleted payment plan from current existing data
            const updatedExistingData = currentExistingPaymentPlanData.filter(
              (_, i) => i !== index
            )
            setCurrentExistingPaymentPlanData(updatedExistingData)
          }
        }

        // Store dates from form values before deletion
        const savedDates: any[] = []
        paymentPlan.forEach((_, i) => {
          savedDates[i] = watch(`installmentDate${i}`)
        })

        // Update the local state regardless of API call
        // Keep original installment numbers - don't renumber them
        const updatedPaymentPlan = paymentPlan.filter((_, i) => i !== index)

        // Reorganize form date values for remaining rows
        // Map dates excluding the deleted index
        const filteredDates = savedDates.filter((_, i) => i !== index)

        // Clear all existing date form values first
        paymentPlan.forEach((_, i) => {
          setValue(`installmentDate${i}`, null)
        })

        // Set dates for remaining rows with new indices
        filteredDates.forEach((date, newIndex) => {
          setValue(`installmentDate${newIndex}`, date)
        })

        onPaymentPlanChange(updatedPaymentPlan)
      } catch (error) {
        // Store dates from form values before deletion
        const savedDates: any[] = []
        paymentPlan.forEach((_, i) => {
          savedDates[i] = watch(`installmentDate${i}`)
        })

        // Still update local state even if API call fails
        // Keep original installment numbers - don't renumber them
        const updatedPaymentPlan = paymentPlan.filter((_, i) => i !== index)

        // Also update existing data even if API call failed (optimistic update)
        if (isEditMode && currentExistingPaymentPlanData.length > index) {
          const updatedExistingData = currentExistingPaymentPlanData.filter(
            (_, i) => i !== index
          )
          setCurrentExistingPaymentPlanData(updatedExistingData)
        }

        // Reorganize form date values for remaining rows
        // Map dates excluding the deleted index
        const filteredDates = savedDates.filter((_, i) => i !== index)

        // Clear all existing date form values first
        paymentPlan.forEach((_, i) => {
          setValue(`installmentDate${i}`, null)
        })

        // Set dates for remaining rows with new indices
        filteredDates.forEach((date, newIndex) => {
          setValue(`installmentDate${newIndex}`, date)
        })

        onPaymentPlanChange(updatedPaymentPlan)
      }
    }

    const StyledCalendarIcon = React.useCallback(
      (props: React.ComponentProps<typeof CalendarTodayOutlinedIcon>) => (
        <CalendarTodayOutlinedIcon {...props} sx={calendarIconStyles} />
      ),
      [calendarIconStyles]
    )

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card sx={cardBaseStyles}>
          <CardContent>
            {!isViewMode && (
              <Box
                display="flex"
                justifyContent="end"
                alignItems="center"
                mb={2}
              >
                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutlineOutlinedIcon />}
                  onClick={addPaymentPlan}
                  sx={addPaymentPlanButtonSx}
                >
                  {getLabel(
                    'CDL_PAYMENT_PLAN_NEW',
                    currentLanguage,
                    'Add Payment Plan'
                  )}
                </Button>
              </Box>
            )}
            <TableContainer component={Paper} sx={tableContainerSx}>
              <Table>
                <TableHead sx={tableHeadSx}>
                  <TableRow>
                    <TableCell sx={tableHeaderCellSx}>
                      {getLabel(
                        'CDL_CP_SEQ_NO',
                        currentLanguage,
                        'Installment Number'
                      )}
                    </TableCell>
                    <TableCell sx={tableHeaderCellSx}>
                      {getLabel(
                        'CDL_CP_DUE_DATE',
                        currentLanguage,
                        'Installment Date'
                      )}
                    </TableCell>
                    <TableCell sx={tableHeaderCellSx}>
                      {getLabel(
                        'CDL_CP_BOOKING_AMOUNT',
                        currentLanguage,
                        'Booking Amount'
                      )}
                    </TableCell>
                    <TableCell sx={tableHeaderCellSx}>
                      {getLabel('CDL_CP_ACTION', currentLanguage, 'Action')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentPlan.map((plan, index) => {
                    const isEditing = editingIndex === index
                    const rowErrors = fieldErrors[`row${index}`] || {}
                    return (
                      <TableRow key={index} hover>
                        <TableCell sx={tableBodyCellSx}>
                          {plan.installmentNumber}
                        </TableCell>
                        <TableCell sx={tableBodyCellSx}>
                          {isEditing ? (
                            <DatePicker
                              value={editingData?.date}
                              onChange={(newValue) =>
                                setEditingData((prev) => ({
                                  ...prev!,
                                  date: newValue,
                                }))
                              }
                              format="DD/MM/YYYY"
                              slots={{
                                openPickerIcon: StyledCalendarIcon,
                              }}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  error: !!errors.agreementDate,
                                  sx: dateFieldStyles,
                                  InputLabelProps: { sx: labelStyles },
                                  InputProps: {
                                    sx: valueStyles,
                                    style: { height: '32px' },
                                  },
                                },
                              }}
                            />
                          ) : (
                            <Box>
                              <Controller
                                name={`installmentDate${index}`}
                                control={control}
                                defaultValue={null}
                                render={({ field }) => (
                                  <DatePicker
                                    value={field.value}
                                    onChange={(newValue) => {
                                      field.onChange(newValue)
                                      // Clear error when user inputs data
                                      if (newValue && rowErrors.date) {
                                        setFieldErrors((prev) => {
                                          const updated = { ...prev }
                                          const rowKey = `row${index}`
                                          const rowEntry = updated[rowKey]
                                          if (rowEntry) {
                                            delete rowEntry.date
                                            if (
                                              Object.keys(rowEntry).length === 0
                                            ) {
                                              delete updated[rowKey]
                                            } else {
                                              updated[rowKey] = rowEntry
                                            }
                                          }
                                          return updated
                                        })
                                      }
                                    }}
                                    format="DD/MM/YYYY"
                                    disabled={
                                      isViewMode ||
                                      (!plan.isNewEntry && !isEditing)
                                    }
                                    slots={{
                                      openPickerIcon: StyledCalendarIcon,
                                    }}
                                    slotProps={{
                                      textField: {
                                        fullWidth: true,
                                        error: !!rowErrors.date,
                                        helperText: rowErrors.date,
                                        sx: dateFieldStyles,
                                        InputLabelProps: { sx: labelStyles },
                                        InputProps: {
                                          sx: valueStyles,
                                          style: { height: '32px' },
                                        },
                                      },
                                    }}
                                  />
                                )}
                              />
                            </Box>
                          )}
                        </TableCell>
                        <TableCell sx={tableBodyCellSx}>
                          {isEditing ? (
                            <TextField
                              size="small"
                              fullWidth
                              placeholder={getLabel(
                                'CDL_CP_AMOUNT',
                                currentLanguage,
                                'Amount'
                              )}
                              value={editingData?.amount || ''}
                              onChange={(e) =>
                                setEditingData((prev) => ({
                                  ...prev!,
                                  amount: e.target.value,
                                }))
                              }
                              InputLabelProps={{ sx: labelStyles }}
                              InputProps={{ sx: valueStyles }}
                              sx={fieldStyles}
                            />
                          ) : (
                            <TextField
                              name={`bookingAmount${index}`}
                              size="small"
                              fullWidth
                              disabled={
                                isViewMode || (!plan.isNewEntry && !isEditing)
                              }
                              placeholder={getLabel(
                                'CDL_CP_AMOUNT',
                                currentLanguage,
                                'Amount'
                              )}
                              value={plan.projectCompletionPercentage}
                              onChange={(e) => {
                                handlePaymentPlanChange(
                                  index,
                                  'projectCompletionPercentage',
                                  e.target.value
                                )
                                // Clear error when user inputs data
                                if (e.target.value && rowErrors.amount) {
                                  setFieldErrors((prev) => {
                                    const updated = { ...prev }
                                    const rowKey = `row${index}`
                                    const rowEntry = updated[rowKey]
                                    if (rowEntry) {
                                      delete rowEntry.amount
                                      if (Object.keys(rowEntry).length === 0) {
                                        delete updated[rowKey]
                                      } else {
                                        updated[rowKey] = rowEntry
                                      }
                                    }
                                    return updated
                                  })
                                }
                              }}
                              error={!!rowErrors.amount}
                              helperText={rowErrors.amount}
                              InputLabelProps={{ sx: labelStyles }}
                              InputProps={{ sx: valueStyles }}
                              sx={fieldStyles}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={tableBodyCellSx}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {isEditing ? (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleSaveEdit(index)}
                                  sx={successIconSx}
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={handleCancelEdit}
                                  sx={errorIconSx}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </>
                            ) : plan.isNewEntry ? (
                              // Show Save and Cancel buttons for new entries
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleSaveNewEntry(index)}
                                  disabled={isViewMode}
                                  sx={successIconSx}
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleCancelNewEntry(index)}
                                  disabled={isViewMode}
                                  sx={errorIconSx}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </>
                            ) : (
                              !isViewMode && (
                                <>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditRow(index)}
                                    aria-label="Edit"
                                    title="Edit"
                                    sx={editIconSx}
                                  >
                                    <Pencil size={16} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => deletePaymentPlan(index)}
                                    aria-label="Delete"
                                    title="Delete"
                                    sx={deleteIconSx}
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </>
                              )
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
