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
  IconButton,
} from '@mui/material'
import { PaymentPlanData } from '../types'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import DeleteIcon from '@mui/icons-material/Delete'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  compactFieldStyles,
  compactLabelSx,
  compactValueSx,
  cardStyles,
} from '../styles'

import { usePaymentPlans } from '@/hooks/useProjects'

interface Step5Props {
  paymentPlan: PaymentPlanData[]
  onPaymentPlanChange: (paymentPlan: PaymentPlanData[]) => void
  projectId?: string
  isViewMode?: boolean
}

const Step5: React.FC<Step5Props> = ({ paymentPlan, onPaymentPlanChange, projectId, isViewMode = false }) => {
  // Add default value for paymentPlan to prevent undefined errors
  const safePaymentPlan = paymentPlan || []

  const { data: existingPaymentPlans } = usePaymentPlans(projectId || '')

  React.useEffect(() => {
    if (existingPaymentPlans && existingPaymentPlans.length > 0) {
      const shouldLoadData = safePaymentPlan.length === 0 || 
        (safePaymentPlan.length !== existingPaymentPlans.length) ||
        (safePaymentPlan.length > 0 && existingPaymentPlans.length > 0 && 
         safePaymentPlan[0]?.installmentNumber !== existingPaymentPlans[0]?.reappInstallmentNumber)
      
      if (shouldLoadData) {
        const transformedPlans = existingPaymentPlans.map((plan: any) => ({
          installmentNumber: plan.reappInstallmentNumber,
          installmentPercentage: plan.reappInstallmentPercentage?.toString() || '',
          projectCompletionPercentage: plan.reappProjectCompletionPercentage?.toString() || '',
        }))
        
        onPaymentPlanChange(transformedPlans)
      }
    }
  }, [existingPaymentPlans, safePaymentPlan.length, onPaymentPlanChange])
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
    const existingNumbers: number[] = []
    safePaymentPlan.forEach(plan => {
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
    
    const nextInstallmentNumber = existingNumbers.length > 0 
      ? Math.max(...existingNumbers) + 1
      : 1

    
    onPaymentPlanChange([
      ...safePaymentPlan,
      {
        installmentNumber: nextInstallmentNumber,
        installmentPercentage: '',
        projectCompletionPercentage: '',
      },
    ])
  }

  const deletePaymentPlan = (index: number) => {
    const updatedPaymentPlan = safePaymentPlan.filter((_, i) => i !== index)
    // Reorder installment numbers
    const reorderedPlan = updatedPaymentPlan.map((plan, idx) => ({
      ...plan,
      installmentNumber: idx + 1,
    }))
    onPaymentPlanChange(reorderedPlan)
  }


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={cardStyles}>
        <CardContent>
          <Box display="flex" justifyContent="end" alignItems="center" mb={2}>
            {!isViewMode && (
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={addPaymentPlan}
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
                Add Payment Plan
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
                  <TableCell sx={compactValueSx}>Installment Number</TableCell>
                  <TableCell sx={compactValueSx}>
                    Installment Percentage
                  </TableCell>
                  <TableCell sx={compactValueSx}>
                    Project Completion Percentage
                  </TableCell>
                  <TableCell sx={compactValueSx}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
               
                {safePaymentPlan.map((plan, index) => {
                
                  return (
                  <TableRow key={index}>
                    <TableCell>{plan.installmentNumber}</TableCell>
                    <TableCell>
                      <TextField
                        name={`installmentPercentage${index}`}
                        size="small"
                        disabled={isViewMode}
                        fullWidth
                        placeholder="Installment Percentage"
                        value={plan.installmentPercentage}
                        onChange={(e) =>
                          handlePaymentPlanChange(
                            index,
                            'installmentPercentage',
                            e.target.value
                          )
                        }
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
                        placeholder="Project Completion Percentage"
                        value={plan.projectCompletionPercentage}
                        onChange={(e) =>
                          handlePaymentPlanChange(
                            index,
                            'projectCompletionPercentage',
                            e.target.value
                          )
                        }
                        InputLabelProps={{ sx: compactLabelSx }}
                        InputProps={{ sx: compactValueSx }}
                        sx={compactFieldStyles}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => deletePaymentPlan(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
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

export default Step5
