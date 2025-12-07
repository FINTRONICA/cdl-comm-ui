'use client'

import React from 'react'
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
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CloseIcon from '@mui/icons-material/Close'
import { PaymentPlanData } from '../types'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  compactFieldStyles,
  compactLabelSx,
  compactValueSx,
  cardStyles,
} from '../styles'

import {
  usePaymentPlans,
  useSaveProjectPaymentPlan,
  useDeletePaymentPlan,
} from '@/hooks/useProjects'
// import { useProjectLabels } from '@/hooks/useProjectLabels'
import { useBuildPartnerAssetLabelsWithUtils } from '@/hooks/useBuildPartnerAssetLabels'

interface Step5Props {
  paymentPlan: PaymentPlanData[]
  onPaymentPlanChange: (paymentPlan: PaymentPlanData[]) => void
  projectId?: string
  isViewMode?: boolean
}

const Step5: React.FC<Step5Props> = ({
  paymentPlan,
  onPaymentPlanChange,
  projectId,
  isViewMode = false,
}) => {
  const safePaymentPlan = paymentPlan || []

  // const { getLabel } = useProjectLabels()
  const { getLabel } = useBuildPartnerAssetLabelsWithUtils()
  const language = 'EN'
  const { data: existingPaymentPlans } = usePaymentPlans(projectId || '')
  const savePaymentPlanMutation = useSaveProjectPaymentPlan()
  const deletePaymentPlanMutation = useDeletePaymentPlan()

  const [editModeRows, setEditModeRows] = React.useState<
    Record<number, boolean>
  >({})
  const [touchedFields, setTouchedFields] = React.useState<
    Record<string, boolean>
  >({})
  const [originalValues, setOriginalValues] = React.useState<
    Record<number, PaymentPlanData>
  >({})
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false)
  const [deleteTargetIndex, setDeleteTargetIndex] = React.useState<
    number | null
  >(null)

  // Calculate totals for validation
  const calculateTotals = React.useMemo(() => {
    let installmentTotal = 0
    let completionTotal = 0

    safePaymentPlan.forEach((plan) => {
      const installmentValue = parseFloat(
        String(plan.installmentPercentage || '0')
      )
      const completionValue = parseFloat(
        String(plan.projectCompletionPercentage || '0')
      )

      if (!isNaN(installmentValue)) {
        installmentTotal += installmentValue
      }
      if (!isNaN(completionValue)) {
        completionTotal += completionValue
      }
    })

    return {
      installmentTotal: Math.round(installmentTotal * 100) / 100,
      completionTotal: Math.round(completionTotal * 100) / 100,
      isValid: installmentTotal <= 100 && completionTotal <= 100,
    }
  }, [safePaymentPlan])

  // Check if there are unsaved rows in edit mode
  const hasUnsavedChanges = React.useMemo(() => {
    return Object.keys(editModeRows).some((key) => editModeRows[parseInt(key)])
  }, [editModeRows])

  // Expose validation state to parent via useEffect
  React.useEffect(() => {
    if (window) {
      ;(window as any).step5ValidationState = {
        isValid: calculateTotals.isValid,
        installmentTotal: calculateTotals.installmentTotal,
        completionTotal: calculateTotals.completionTotal,
        hasUnsavedChanges: hasUnsavedChanges,
      }
    }
  }, [calculateTotals, hasUnsavedChanges])

  // Helper function to mark a field as touched
  const markFieldAsTouched = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }))
  }

  // Helper function to check if we should show validation error
  const shouldShowError = (fieldName: string, value: string | number) => {
    // Only show error if field has been touched
    if (!touchedFields[fieldName]) return false
    return !!validateField(fieldName, value)
  }

  // Helper function to get error message
  const getErrorMessage = (fieldName: string, value: string | number) => {
    if (!touchedFields[fieldName]) return ''
    return validateField(fieldName, value) || ''
  }

  const validateField = (fieldName: string, value: string | number) => {
    try {
      if (fieldName.includes('installmentPercentage')) {
        const stringValue = String(value || '').trim()
        if (!stringValue || stringValue === '') {
          return 'Installment Percentage is required'
        }
        if (stringValue.length > 5) {
          return 'Installment Percentage must be maximum 5 characters'
        }
        if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(stringValue)) {
          return 'Installment Percentage must be a valid number (e.g., 25 or 25.5)'
        }
        const numValue = parseFloat(stringValue)
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
          return 'Installment Percentage must be between 0 and 100'
        }
      }
      if (fieldName.includes('projectCompletionPercentage')) {
        const stringValue = String(value || '').trim()
        if (!stringValue || stringValue === '') {
          return 'Project Completion Percentage is required'
        }
        if (stringValue.length > 5) {
          return 'Project Completion Percentage must be maximum 5 characters'
        }
        if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(stringValue)) {
          return 'Project Completion Percentage must be a valid number (e.g., 25 or 25.5)'
        }
        const numValue = parseFloat(stringValue)
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
          return 'Project Completion Percentage must be between 0 and 100'
        }
      }
      return null
    } catch (error) {
      return 'Invalid input'
    }
  }

  React.useEffect(() => {
    if (existingPaymentPlans && existingPaymentPlans.length > 0) {
      // Transform server data
      const transformedPlans = existingPaymentPlans.map((plan: any) => ({
        id: plan.id?.toString(),
        installmentNumber: plan.reappInstallmentNumber,
        installmentPercentage:
          plan.reappInstallmentPercentage?.toString() || '',
        projectCompletionPercentage:
          plan.reappProjectCompletionPercentage?.toString() || '',
      }))

      // Check if we have any local rows that aren't on the server yet (unsaved new rows)
      const localUnsavedRows = safePaymentPlan.filter(
        (localPlan) =>
          !localPlan.id &&
          !transformedPlans.some(
            (serverPlan) =>
              serverPlan.installmentNumber === localPlan.installmentNumber
          )
      )

      // Only load if:
      // 1. Local state is empty (initial load), OR
      // 2. Server has different data (more/less plans, OR different plan IDs)
      // But DON'T load if we have local unsaved rows that would be lost
      const shouldLoadData =
        safePaymentPlan.length === 0 ||
        (localUnsavedRows.length === 0 &&
          (existingPaymentPlans.length !== safePaymentPlan.length ||
            safePaymentPlan.some(
              (plan, idx) => plan.id !== transformedPlans[idx]?.id
            )))

      if (shouldLoadData) {
        // Merge local unsaved rows with server data
        const mergedPlans = [...transformedPlans, ...localUnsavedRows]

        // Load the merged data into the form
        onPaymentPlanChange(mergedPlans)

        // Clear edit mode states for server-loaded plans only
        // Keep edit mode for unsaved local rows
        const newEditModeRows: Record<number, boolean> = {}
        localUnsavedRows.forEach((_, idx) => {
          newEditModeRows[transformedPlans.length + idx] = true
        })
        setEditModeRows(newEditModeRows)

        // Clear touched fields when loading existing data (but keep for unsaved rows)
        const newTouchedFields: Record<string, boolean> = {}
        localUnsavedRows.forEach((_, idx) => {
          const baseIndex = transformedPlans.length + idx
          if (touchedFields[`installmentPercentage${baseIndex}`]) {
            newTouchedFields[`installmentPercentage${baseIndex}`] = true
          }
          if (touchedFields[`projectCompletionPercentage${baseIndex}`]) {
            newTouchedFields[`projectCompletionPercentage${baseIndex}`] = true
          }
        })
        setTouchedFields(newTouchedFields)

        // Clear original values when loading fresh data
        setOriginalValues({})
      }
    } else if (existingPaymentPlans && existingPaymentPlans.length === 0) {
      // If server returns empty array and we have unsaved local rows, keep them
      const localUnsavedRows = safePaymentPlan.filter((plan) => !plan.id)
      if (
        localUnsavedRows.length > 0 &&
        safePaymentPlan.length !== localUnsavedRows.length
      ) {
        // Only update if we have mixed saved and unsaved rows
        onPaymentPlanChange(localUnsavedRows)
        setEditModeRows(
          localUnsavedRows.reduce(
            (acc, _, idx) => {
              acc[idx] = true
              return acc
            },
            {} as Record<number, boolean>
          )
        )
      } else if (safePaymentPlan.length === 0) {
        // If both are empty, ensure state is cleared
        onPaymentPlanChange([])
        setEditModeRows({})
        setTouchedFields({})
        setOriginalValues({})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPaymentPlans])

  const handlePaymentPlanChange = (
    index: number,
    field: keyof PaymentPlanData,
    value: unknown
  ) => {
    const updatedPaymentPlan = [...safePaymentPlan]
    updatedPaymentPlan[index] = {
      ...updatedPaymentPlan[index],
      [field]: value,
    } as PaymentPlanData
    onPaymentPlanChange(updatedPaymentPlan)
  }

  const addPaymentPlan = () => {
    // Don't allow adding new rows if totals already exceed 100
    if (!calculateTotals.isValid) {
      return
    }

    const existingNumbers: number[] = []
    safePaymentPlan.forEach((plan) => {
      if (plan.installmentNumber) {
        existingNumbers.push(plan.installmentNumber)
      }
    })

    if (existingPaymentPlans && existingPaymentPlans.length > 0) {
      existingPaymentPlans.forEach((plan: any) => {
        if (plan.reappInstallmentNumber) {
          existingNumbers.push(plan.reappInstallmentNumber)
        }
      })
    }

    const nextInstallmentNumber =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1

    const newIndex = safePaymentPlan.length

    const newPlan: PaymentPlanData = {
      installmentNumber: nextInstallmentNumber,
      installmentPercentage: '',
      projectCompletionPercentage: '',
    }

    // Mark the new row as editable
    setEditModeRows((prev) => ({ ...prev, [newIndex]: true }))

    // Store original values for the new row (empty values)
    setOriginalValues((prev) => ({ ...prev, [newIndex]: { ...newPlan } }))

    onPaymentPlanChange([...safePaymentPlan, newPlan])
  }

  // Open confirmation dialog
  const handleDeleteClick = (index: number) => {
    setDeleteTargetIndex(index)
    setConfirmDialogOpen(true)
  }

  // Close confirmation dialog
  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
    setDeleteTargetIndex(null)
  }

  // Confirm and execute delete
  const handleConfirmDelete = async () => {
    if (deleteTargetIndex === null) return

    const index = deleteTargetIndex
    const plan = safePaymentPlan[index]

    if (!plan) {
      setConfirmDialogOpen(false)
      setDeleteTargetIndex(null)
      return
    }

    // If plan has an ID, call delete API first
    if (plan.id) {
      try {
        const planIdNum =
          typeof plan.id === 'string' ? parseInt(plan.id) : plan.id
        if (!isNaN(planIdNum) && planIdNum > 0) {
          await deletePaymentPlanMutation.mutateAsync(planIdNum)
        }
      } catch (error) {
        console.error('Error deleting payment plan:', error)
        setConfirmDialogOpen(false)
        setDeleteTargetIndex(null)
        return // Don't proceed with local deletion if API call fails
      }
    }

    // Remove the plan from local state
    const updatedPaymentPlan = safePaymentPlan.filter((_, i) => i !== index)

    // Reorder installment numbers starting from 1
    const reorderedPlan = updatedPaymentPlan.map((plan, idx) => ({
      ...plan,
      installmentNumber: idx + 1,
    }))

    // Clean up state for deleted row - adjust indices for rows after deleted one
    setEditModeRows((prev) => {
      const newState: Record<number, boolean> = {}
      Object.keys(prev).forEach((key) => {
        const keyNum = parseInt(key)
        if (!isNaN(keyNum)) {
          const value = prev[keyNum]
          if (value !== undefined) {
            if (keyNum < index) {
              newState[keyNum] = value
            } else if (keyNum > index) {
              newState[keyNum - 1] = value
            }
          }
        }
      })
      return newState
    })

    // Clean up touched fields for deleted row - adjust indices
    setTouchedFields((prev) => {
      const newState: Record<string, boolean> = {}
      Object.keys(prev).forEach((key) => {
        const match = key.match(/(\w+)(\d+)/)
        const value = prev[key]
        if (match && match[1] && match[2] && value !== undefined) {
          const fieldName = match[1]
          const fieldIndexStr = match[2]
          const fieldIndex = parseInt(fieldIndexStr)
          if (!isNaN(fieldIndex)) {
            if (fieldIndex < index) {
              newState[key] = value
            } else if (fieldIndex > index) {
              newState[`${fieldName}${fieldIndex - 1}`] = value
            }
          }
        } else if (value !== undefined) {
          newState[key] = value
        }
      })
      return newState
    })

    // Clean up original values for deleted row - adjust indices
    setOriginalValues((prev) => {
      const newState: Record<number, PaymentPlanData> = {}
      Object.keys(prev).forEach((key) => {
        const keyNum = parseInt(key)
        if (!isNaN(keyNum)) {
          const value = prev[keyNum]
          if (value !== undefined) {
            if (keyNum < index) {
              newState[keyNum] = value
            } else if (keyNum > index) {
              newState[keyNum - 1] = value
            }
          }
        }
      })
      return newState
    })

    onPaymentPlanChange(reorderedPlan)

    // Close dialog
    setConfirmDialogOpen(false)
    setDeleteTargetIndex(null)
  }

  // Phase 2 & 3: Enable edit mode for a specific row
  const enableEditMode = (index: number) => {
    // Store the original values before enabling edit mode
    const currentPlan = safePaymentPlan[index]
    if (currentPlan) {
      setOriginalValues((prev) => ({ ...prev, [index]: { ...currentPlan } }))
    }
    setEditModeRows((prev) => ({ ...prev, [index]: true }))
  }

  // Cancel edit and restore original values
  const cancelEdit = (index: number) => {
    const plan = safePaymentPlan[index]

    // If this is a new row (no ID), remove it
    if (!plan?.id) {
      const updatedPaymentPlan = safePaymentPlan.filter((_, i) => i !== index)
      onPaymentPlanChange(updatedPaymentPlan)
    } else {
      // If editing existing row, restore original values
      const originalValue = originalValues[index]
      if (originalValue) {
        const updatedPaymentPlan = [...safePaymentPlan]
        updatedPaymentPlan[index] = { ...originalValue }
        onPaymentPlanChange(updatedPaymentPlan)
      }
    }

    // Clear edit mode
    setEditModeRows((prev) => {
      const newState = { ...prev }
      delete newState[index]
      return newState
    })

    // Clear touched fields for this row
    setTouchedFields((prev) => {
      const newState = { ...prev }
      delete newState[`installmentPercentage${index}`]
      delete newState[`projectCompletionPercentage${index}`]
      return newState
    })

    // Clear original values
    setOriginalValues((prev) => {
      const newState = { ...prev }
      delete newState[index]
      return newState
    })
  }

  // Phase 3: Save individual payment plan row
  const saveIndividualPaymentPlan = async (
    plan: PaymentPlanData,
    index: number
  ) => {
    if (!projectId) {
      return
    }

    // Mark fields as touched when attempting to save
    markFieldAsTouched(`installmentPercentage${index}`)
    markFieldAsTouched(`projectCompletionPercentage${index}`)

    // Validate the row data
    const installmentError = validateField(
      `installmentPercentage${index}`,
      plan.installmentPercentage
    )
    const completionError = validateField(
      `projectCompletionPercentage${index}`,
      plan.projectCompletionPercentage
    )

    if (installmentError || completionError) {
      return
    }

    try {
      const isEdit = !!plan.id

      const response = await savePaymentPlanMutation.mutateAsync({
        projectId: projectId,
        data: plan,
        isEdit: isEdit,
      })

      // Extract ID from response (handle both direct response and wrapped in data/content)
      const responseId =
        response?.id || response?.data?.id || response?.content?.id

      // Update the plan with the returned ID
      if (responseId) {
        const updatedPaymentPlan = [...safePaymentPlan]
        const currentPlan = updatedPaymentPlan[index]
        if (currentPlan) {
          const responseIdNum =
            typeof responseId === 'number'
              ? responseId
              : parseInt(String(responseId))
          if (!isNaN(responseIdNum)) {
            updatedPaymentPlan[index] = {
              installmentNumber: currentPlan.installmentNumber,
              installmentPercentage: currentPlan.installmentPercentage || '',
              projectCompletionPercentage:
                currentPlan.projectCompletionPercentage || '',
              id: responseIdNum,
            }
            onPaymentPlanChange(updatedPaymentPlan)
          }
        }
      }

      // Clear edit mode
      setEditModeRows((prev) => {
        const newState = { ...prev }
        delete newState[index]
        return newState
      })

      // Clear touched fields for this row
      setTouchedFields((prev) => {
        const newState = { ...prev }
        delete newState[`installmentPercentage${index}`]
        delete newState[`projectCompletionPercentage${index}`]
        return newState
      })

      // Clear original values for this row
      setOriginalValues((prev) => {
        const newState = { ...prev }
        delete newState[index]
        return newState
      })
    } catch (error) {
      // Handle error - validation errors are already shown
      console.error('Error saving payment plan:', error)
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={cardStyles}>
        <CardContent>
          {!calculateTotals.isValid && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {calculateTotals.installmentTotal > 100 &&
                `Installment Percentage total (${calculateTotals.installmentTotal}%) exceeds 100%. `}
              {calculateTotals.completionTotal > 100 &&
                `Asset Completion Percentage total (${calculateTotals.completionTotal}%) exceeds 100%. `}
              Please adjust the values before proceeding.
            </Alert>
          )}

          <Box display="flex" justifyContent="end" alignItems="center" mb={2}>
            {!isViewMode && (
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={addPaymentPlan}
                disabled={!calculateTotals.isValid}
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
                  'CDL_BPA_ADD_INSTALLMENT',
                  language,
                  'Add New Installment'
                )}
              </Button>
            )}
          </Box>
          <TableContainer
            component={Paper}
            sx={{ boxShadow: 'none', borderRadius: '8px' }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={compactValueSx}>
                    {getLabel(
                      'CDL_BPA_INSTALLMENT_NO',
                      language,
                      'Installment Sequence Number'
                    )}
                  </TableCell>
                  <TableCell sx={compactValueSx}>
                    {getLabel(
                      'CDL_BPA_INSTALLMENT_PER',
                      language,
                      'Installment Percentage (%)'
                    )}
                  </TableCell>
                  <TableCell sx={compactValueSx}>
                    {getLabel(
                      'CDL_BPA_PROJ_COM_PER',
                      language,
                      'Asset Completion Percentage (%)'
                    )}
                  </TableCell>
                  <TableCell sx={compactValueSx}>
                    {getLabel('CDL_BPA_ACTION', language, 'Action')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {safePaymentPlan.map((plan, index) => {
                  const isRowInEditMode = editModeRows[index] || false
                  const isRowDisabled = isViewMode || !isRowInEditMode

                  return (
                    <TableRow key={index}>
                      <TableCell>{plan.installmentNumber}</TableCell>
                      <TableCell>
                        <TextField
                          name={`installmentPercentage${index}`}
                          size="small"
                          disabled={isRowDisabled}
                          fullWidth
                          required
                          placeholder={getLabel(
                            'CDL_BPA_INSTALLMENT_PER',
                            language,
                            'Installment Percentage'
                          )}
                          value={plan.installmentPercentage}
                          onChange={(e) =>
                            handlePaymentPlanChange(
                              index,
                              'installmentPercentage',
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            markFieldAsTouched(`installmentPercentage${index}`)
                          }
                          error={shouldShowError(
                            `installmentPercentage${index}`,
                            plan.installmentPercentage
                          )}
                          helperText={getErrorMessage(
                            `installmentPercentage${index}`,
                            plan.installmentPercentage
                          )}
                          InputLabelProps={{ sx: compactLabelSx }}
                          InputProps={{ sx: compactValueSx }}
                          sx={compactFieldStyles}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name={`bookingAmount${index}`}
                          size="small"
                          fullWidth
                          required
                          disabled={isRowDisabled}
                          placeholder={getLabel(
                            'CDL_BPA_PROJ_COM_PER',
                            language,
                            'Asset Completion Percentage (%)'
                          )}
                          value={plan.projectCompletionPercentage}
                          onChange={(e) =>
                            handlePaymentPlanChange(
                              index,
                              'projectCompletionPercentage',
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            markFieldAsTouched(
                              `projectCompletionPercentage${index}`
                            )
                          }
                          error={shouldShowError(
                            `projectCompletionPercentage${index}`,
                            plan.projectCompletionPercentage
                          )}
                          helperText={getErrorMessage(
                            `projectCompletionPercentage${index}`,
                            plan.projectCompletionPercentage
                          )}
                          InputLabelProps={{ sx: compactLabelSx }}
                          InputProps={{ sx: compactValueSx }}
                          sx={compactFieldStyles}
                        />
                      </TableCell>
                      <TableCell>
                        {!isViewMode && (
                          <div className="flex items-center space-x-2">
                            {isRowInEditMode ? (
                              // Show Check and Cancel icons when in edit mode
                              <>
                                <button
                                  onClick={() =>
                                    saveIndividualPaymentPlan(plan, index)
                                  }
                                  disabled={
                                    savePaymentPlanMutation.isPending ||
                                    !calculateTotals.isValid
                                  }
                                  className="p-1 transition-colors rounded cursor-pointer hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Save"
                                  title={
                                    !calculateTotals.isValid
                                      ? 'Cannot save - total percentage exceeds 100%'
                                      : 'Save'
                                  }
                                >
                                  <Check className="w-5 h-5 text-green-600 hover:text-green-800" />
                                </button>
                                <button
                                  onClick={() => cancelEdit(index)}
                                  disabled={savePaymentPlanMutation.isPending}
                                  className="p-1 transition-colors rounded cursor-pointer hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Cancel"
                                  title="Cancel"
                                >
                                  <X className="w-5 h-5 text-red-600 hover:text-red-800" />
                                </button>
                              </>
                            ) : (
                              // Show Edit and Delete icons when not in edit mode
                              <>
                                <button
                                  onClick={() => enableEditMode(index)}
                                  className="p-1 transition-colors rounded cursor-pointer hover:bg-blue-50"
                                  aria-label="Edit"
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(index)}
                                  className="p-1 transition-colors rounded cursor-pointer hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Delete"
                                  title="Delete"
                                  disabled={deletePaymentPlanMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600 hover:text-red-800" />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            padding: '8px',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            paddingBottom: '16px',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '28px',
          }}
        >
          <ErrorOutlineIcon
            sx={{
              color: '#DC2626',
              fontSize: '24px',
              backgroundColor: '#FEE2E2',
              borderRadius: '50%',
              padding: '4px',
            }}
          />
          Delete Confirmation
          <IconButton
            aria-label="close"
            onClick={handleCancelDelete}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#6B7280',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#374151',
            }}
          >
            {deleteTargetIndex !== null && safePaymentPlan[deleteTargetIndex]
              ? `Are you sure you want to delete installment number ${safePaymentPlan[deleteTargetIndex].installmentNumber} with ${safePaymentPlan[deleteTargetIndex].installmentPercentage}% installment percentage? This action cannot be undone.`
              : 'Are you sure you want to delete this installment? This action cannot be undone.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', gap: 1 }}>
          <Button
            onClick={handleCancelDelete}
            variant="outlined"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              borderRadius: '8px',
              borderColor: '#D1D5DB',
              color: '#374151',
              padding: '8px 16px',
              '&:hover': {
                borderColor: '#9CA3AF',
                backgroundColor: '#F9FAFB',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            disabled={deletePaymentPlanMutation.isPending}
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              borderRadius: '8px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: '#B91C1C',
              },
              '&:disabled': {
                backgroundColor: '#FCA5A5',
                color: '#FFFFFF',
              },
            }}
          >
            {deletePaymentPlanMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}

export default Step5
