'use client'

import React from 'react'
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { ProjectData } from '../types'
import { useProjectLabels } from '@/hooks/useProjectLabels'
import { useProjectReview } from '@/hooks/useProjectReview'
import { labelSx, valueSx, fieldBoxSx, cardStyles } from '../styles'
import { formatDate } from '@/utils'

const renderDisplayField = (
  label: string,
  value: string | number | null = '-'
) => (
  <Box sx={fieldBoxSx}>
    <Typography sx={labelSx}>{label}</Typography>
    <Typography sx={valueSx}>{value || '-'} </Typography>
  </Box>
)

interface Step8Props {
  projectData: ProjectData
  onEditStep?: (stepNumber: number) => void
  projectId?: string
  isViewMode?: boolean
}

const Step8: React.FC<Step8Props> = ({ onEditStep, projectId, isViewMode = false }) => {
  const { getLabel } = useProjectLabels()
  
  // Fetch real project data using the new hook
  const { projectData: reviewData, loading, error } = useProjectReview(projectId || '')

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    )
  }

  // No data state
  if (!reviewData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No project data found.</Alert>
      </Box>
    )
  }

  // Project fields with real data from API
  const projectFields = [
    { gridSize: 6, label: 'System ID*', value: reviewData.projectDetails?.id || 'PROJ7102' },
    { gridSize: 6, label: 'Developer CIF/Name*', value: reviewData.projectDetails?.developerCif || '' },
    { gridSize: 6, label: 'Developer ID (RERA)*', value: reviewData.projectDetails?.developerId || '' },
    { gridSize: 6, label: 'Developer Name', value: reviewData.projectDetails?.developerName || '' },
    { gridSize: 6, label: 'Master Developer Name', value: reviewData.projectDetails?.masterDeveloperName || '' },
    { gridSize: 6, label: 'Project RERA Number*', value: reviewData.projectDetails?.reraNumber || '' },
    { gridSize: 6, label: 'Project Name*', value: reviewData.projectDetails?.projectName || '' },
    { gridSize: 6, label: 'Project Type*', value: reviewData.projectDetails?.projectType || '' },
    { gridSize: 12, label: 'Project Location*', value: reviewData.projectDetails?.projectLocation || '' },
    { gridSize: 3, label: 'Project Account CIF*', value: reviewData.projectDetails?.projectAccountCif || '' },
    { gridSize: 3, label: 'Project Status*', value: reviewData.projectDetails?.projectStatus || '' },
    { gridSize: 6, label: 'Project Account Status*', value: reviewData.projectDetails?.projectAccountStatus || '' },
    { gridSize: 3, label: 'Project Account Status Date', value: reviewData.projectDetails?.projectAccountStatusDate ? formatDate(reviewData.projectDetails.projectAccountStatusDate, 'MM/DD/YYYY') : '' },
    { gridSize: 3, label: 'Project Registration Date*', value: reviewData.projectDetails?.projectRegistrationDate ? formatDate(reviewData.projectDetails.projectRegistrationDate, 'MM/DD/YYYY') : '' },
    { gridSize: 3, label: 'Project Start Date Est.*', value: reviewData.projectDetails?.projectStartDateEst ? formatDate(reviewData.projectDetails.projectStartDateEst, 'MM/DD/YYYY') : '' },
    { gridSize: 3, label: 'Project Start Date*', value: reviewData.projectDetails?.projectStartDate ? formatDate(reviewData.projectDetails.projectStartDate, 'MM/DD/YYYY') : '' },
    { gridSize: 3, label: 'Retention %*', value: reviewData.projectDetails?.retentionPercent || '5.00' },
    { gridSize: 3, label: 'Additional Retention %', value: reviewData.projectDetails?.additionalRetentionPercent || '8.00' },
    { gridSize: 3, label: 'Total Retention %', value: reviewData.projectDetails?.totalRetentionPercent || '13.00' },
    {
      gridSize: 3,
      label: 'Retention Effective Start Date*',
      value: reviewData.projectDetails?.retentionEffectiveStartDate ? formatDate(reviewData.projectDetails.retentionEffectiveStartDate, 'MM/DD/YYYY') : '31/12/2022',
    },
    {
      gridSize: 6,
      label: 'Project Management Expenses (% of paid construction cost)*',
      value: reviewData.projectDetails?.projectManagementExpenses || '5.00',
    },
    {
      gridSize: 6,
      label: 'Marketing Expenses (% of sold value)*',
      value: reviewData.projectDetails?.marketingExpenses || '10.00',
    },
    {
      gridSize: 6,
      label: getLabel('CDL_BPA_BROK_FEES', 'Real Estate Broker Expense'),
      value: reviewData.projectDetails?.realEstateBrokerExpense || '',
    },
    {
      gridSize: 6,
      label: getLabel('CDL_BPA_ADVTG_COST', 'Advertising Expense'),
      value: reviewData.projectDetails?.advertisingExpense || '',
    },
    {
      gridSize: 6,
      label: getLabel('CDL_BPA_LANDOWNER_NAME', 'Land Owner Name'),
      value: reviewData.projectDetails?.landOwnerName || '',
    },
    { gridSize: 6, label: 'Project Completion Percentage', value: reviewData.projectDetails?.projectCompletionPercentage || '' },
    {
      gridSize: 3,
      label: getLabel('CDL_BPA_TRAN_CUR', 'Currency'),
      value: reviewData.projectDetails?.currency || 'AED',
    },
    { gridSize: 3, label: 'Actual Construction Cost', value: reviewData.projectDetails?.actualConstructionCost || '' },
    { gridSize: 6, label: 'No. of Units', value: reviewData.projectDetails?.noOfUnits || '12' },
    { gridSize: 12, label: getLabel('CDL_BPA_ADD_NOTES', 'Remarks'), value: reviewData.projectDetails?.remarks || '' },
    {
      gridSize: 12,
      label: getLabel('CDL_BPA_SP_REG_APPROVAL', 'Special Approval'),
      value: reviewData.projectDetails?.specialApproval || '',
    },
    {
      gridSize: 6,
      label: getLabel('CDL_BPA_RES_PAYMENT_TYPE', 'Payment Type to be Blocked'),
      value: reviewData.projectDetails?.paymentType || '',
    },
    {
      gridSize: 6,
      label: getLabel('CDL_BPA_ASS_MANAGER', 'Managed By*'),
      value: reviewData.projectDetails?.managedBy || 'ems_checker1, ems_checker1',
    },
    {
      gridSize: 6,
      label: getLabel('CDL_BPA_BACKUP_MANAGER', 'Backup By'),
      value: reviewData.projectDetails?.backupRef || 'Maker ENBD;[enbd_maker]',
    },
    { gridSize: 6, label: 'Relationship Manager', value: reviewData.projectDetails?.relationshipManager || '' },
    { gridSize: 6, label: 'Assistant Relationship Manager', value: reviewData.projectDetails?.assistantRelationshipManager || '' },
    { gridSize: 6, label: 'Team Leader Name', value: reviewData.projectDetails?.teamLeaderName || '' },
  ]

  // Account fields with real data from API
  const accountFields = reviewData.accounts.map((account) => [
    { gridSize: 6, label: `${account.accountType || 'Account'} Number*`, value: account.accountNumber || '' },
    { gridSize: 6, label: 'IBAN Number*', value: account.ibanNumber || '' },
    { gridSize: 3, label: 'Date Opened*', value: account.dateOpened ? formatDate(account.dateOpened, 'MM/DD/YYYY') : '-' },
    { gridSize: 3, label: 'Account Title*', value: account.accountTitle || 'dev' },
    { gridSize: 6, label: 'Currency*', value: account.currency || '-' },
  ]).flat()

  // If no accounts, show default structure
  if (accountFields.length === 0) {
    accountFields.push(
      { gridSize: 6, label: 'Trust Account Number*', value: '102800280' },
      { gridSize: 6, label: 'IBAN Number*', value: '12345678' },
      { gridSize: 3, label: 'Date Opened*', value: '-' },
      { gridSize: 3, label: 'Account Title*', value: 'dev' },
      { gridSize: 6, label: 'Currency*', value: '-' }
    )
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Project Details Section */}
      <Card sx={cardStyles}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              gutterBottom
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '18px',
                lineHeight: '28px',
                letterSpacing: '0.15px',
                verticalAlign: 'middle',
              }}
            >
              Project Details
            </Typography>
            {!isViewMode && (
              <Button
                startIcon={<EditIcon />}
                onClick={() => onEditStep?.(0)} // Navigate to Step 1 (Project Details)
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#6B7280',
                borderColor: '#D1D5DB',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#9CA3AF',
                  backgroundColor: '#F9FAFB',
                },
              }}
            >
              Edit
            </Button>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            {projectFields.map((field, idx) => (
              <Grid size={{ xs: 12, md: field.gridSize }} key={idx}>
                {renderDisplayField(field.label, field.value)}
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Account Details Section */}
      <Card sx={cardStyles}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              gutterBottom
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '18px',
                lineHeight: '28px',
                letterSpacing: '0.15px',
                verticalAlign: 'middle',
              }}
            >
              Account Details
            </Typography>
            {!isViewMode && (
              <Button
                startIcon={<EditIcon />}
                onClick={() => onEditStep?.(2)} // Navigate to Step 3 (Account)
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#6B7280',
                borderColor: '#D1D5DB',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#9CA3AF',
                  backgroundColor: '#F9FAFB',
                },
              }}
            >
              Edit
            </Button>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            {accountFields.map((field, idx) => (
              <Grid size={{ xs: 12, md: field.gridSize }} key={idx}>
                {renderDisplayField(field.label, field.value)}
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Fee Details Section */}
      {reviewData.fees.length > 0 && (
        <Card sx={cardStyles}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '0.15px',
                  verticalAlign: 'middle',
                }}
              >
                Fee Details
              </Typography>
              {!isViewMode && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => onEditStep?.(3)} // Navigate to Step 4 (Fees)
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#6B7280',
                  borderColor: '#D1D5DB',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#9CA3AF',
                    backgroundColor: '#F9FAFB',
                  },
                }}
              >
                Edit
              </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={3}>
              {reviewData.fees.map((fee, index) => (
                <Grid size={{ xs: 12 }} key={index}>
                  <Typography variant="h6" sx={{ mb: 2, fontSize: '16px' }}>
                    Fee {index + 1}
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Fee Type', fee.feeType)}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Frequency', fee.frequency)}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Debit Amount', fee.debitAmount)}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Fee to be Collected', fee.feeToBeCollected)}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Next Recovery Date', fee.nextRecoveryDate)}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Fee Percentage', fee.feePercentage)}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Amount', fee.amount)}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('VAT Percentage', fee.vatPercentage)}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Currency', fee.currency)}
                    </Grid>
                  </Grid>
                  {index < reviewData.fees.length - 1 && <Divider sx={{ mt: 2, mb: 2 }} />}
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Beneficiary Details Section */}
      {reviewData.beneficiaries.length > 0 && (
        <Card sx={cardStyles}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '0.15px',
                  verticalAlign: 'middle',
                }}
              >
                Beneficiary Details
              </Typography>
              {!isViewMode && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => onEditStep?.(4)} // Navigate to Step 5 (Beneficiaries)
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#6B7280',
                  borderColor: '#D1D5DB',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#9CA3AF',
                    backgroundColor: '#F9FAFB',
                  },
                }}
              >
                Edit
              </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={3}>
              {reviewData.beneficiaries.map((beneficiary, index) => (
                <Grid size={{ xs: 12 }} key={index}>
                  <Typography variant="h6" sx={{ mb: 2, fontSize: '16px' }}>
                    Beneficiary {index + 1}
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Beneficiary ID', beneficiary.beneficiaryId)}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Beneficiary Type', beneficiary.beneficiaryType)}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Name', beneficiary.name)}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Bank Name', beneficiary.bankName)}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Account Number', beneficiary.accountNumber)}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Swift Code', beneficiary.swiftCode)}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderDisplayField('Routing Code', beneficiary.routingCode)}
                    </Grid>
                  </Grid>
                  {index < reviewData.beneficiaries.length - 1 && <Divider sx={{ mt: 2, mb: 2 }} />}
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Payment Plan Section */}
      {reviewData.paymentPlans.length > 0 && (
        <Card sx={cardStyles}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '0.15px',
                  verticalAlign: 'middle',
                }}
              >
                Payment Plan
              </Typography>
              {!isViewMode && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => onEditStep?.(5)} // Navigate to Step 6 (Payment Plan)
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#6B7280',
                  borderColor: '#D1D5DB',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#9CA3AF',
                    backgroundColor: '#F9FAFB',
                  },
                }}
              >
                Edit
              </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                    <TableCell sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                      Installment Number
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                      Installment Percentage
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                      Project Completion Percentage
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviewData.paymentPlans.map((plan, index) => (
                    <TableRow key={plan.id || index} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                      <TableCell sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                        {plan.installmentNumber}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                        {plan.installmentPercentage}%
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                        {plan.projectCompletionPercentage}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Financial Summary Section */}
      {reviewData.financialData && (
        <Card sx={cardStyles}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '0.15px',
                  verticalAlign: 'middle',
                }}
              >
                Financial Summary
              </Typography>
              {!isViewMode && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => onEditStep?.(6)} // Navigate to Step 7 (Financial Summary)
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#2563EB',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#F3F4F6',
                  },
                }}
              >
                Edit
              </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              {/* Estimated Section */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#374151', fontWeight: 600 }}>
                  Estimated Values
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Estimated Revenue', reviewData.financialData.reafsEstRevenue || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Estimated Construction Cost', reviewData.financialData.reafsEstConstructionCost || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Estimated Land Cost', reviewData.financialData.reafsEstLandCost || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Estimated Marketing Expense', reviewData.financialData.reafsEstMarketingExpense || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Estimated Project Management Expense', reviewData.financialData.reafsEstProjectMgmtExpense || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Estimated Date', reviewData.financialData.reafsEstimatedDate ? new Date(reviewData.financialData.reafsEstimatedDate).toLocaleDateString() : 'N/A')}
              </Grid>

              {/* Actual Section */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#374151', fontWeight: 600, mt: 3 }}>
                  Actual Values
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Actual Sold Value', reviewData.financialData.reafsActualSoldValue || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Actual Construction Cost', reviewData.financialData.reafsActualConstructionCost || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Actual Land Cost', reviewData.financialData.reafsActualLandCost || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Actual Marketing Expense', reviewData.financialData.reafsActualMarketingExp || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Actual Infrastructure Cost', reviewData.financialData.reafsActualInfraCost || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Actual Project Management Expense', reviewData.financialData.reafsActualProjectMgmtExpense || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Actual Date', reviewData.financialData.reafsActualDate ? new Date(reviewData.financialData.reafsActualDate).toLocaleDateString() : 'N/A')}
              </Grid>

              {/* Current Section */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#374151', fontWeight: 600, mt: 3 }}>
                  Current Values
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Cash Received', reviewData.financialData.reafsCurrentCashReceived || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Construction Cost', reviewData.financialData.reafsCurrentConstructionCost || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Land Cost', reviewData.financialData.reafsCurrentLandCost || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Marketing Expense', reviewData.financialData.reafsCurrentMarketingExp || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Project Management Expense', reviewData.financialData.reafsCurrentProjectMgmtExp || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Infrastructure Cost', reviewData.financialData.reafsCurrentInfraCost || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Mortgage', reviewData.financialData.reafsCurrentMortgage || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current VAT Payment', reviewData.financialData.reafsCurrentVatPayment || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Oqood', reviewData.financialData.reafsCurrentOqood || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Refund', reviewData.financialData.reafsCurrentRefund || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Balance in Retention Account', reviewData.financialData.reafsCurrentBalInRetenAcc || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Balance in Trust Account', reviewData.financialData.reafsCurrentBalInTrustAcc || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Technical Fee', reviewData.financialData.reafsCurrentTechnicalFee || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Unidentified Fund', reviewData.financialData.reafsCurrentUnIdentifiedFund || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Loan Installment', reviewData.financialData.reafsCurrentLoanInstal || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Others Cost', reviewData.financialData.reafsCurrentOthersCost || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Transferred Cost', reviewData.financialData.reafsCurrentTransferredCost || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Forfeited Cost', reviewData.financialData.reafsCurrentForfeitedCost || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Developer Equity Cost', reviewData.financialData.reafsCurrentDeveloperEquitycost || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Amount Fund', reviewData.financialData.reafsCurrentAmantFund || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Other Withdrawals', reviewData.financialData.reafsCurrentOtherWithdrawls || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Oqood Other Fee Payment', reviewData.financialData.reafsCurrentOqoodOtherFeePay || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current VAT Deposit', reviewData.financialData.reafsCurrentVatDeposit || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Balance Construction Total', reviewData.financialData.reafsCurBalConstructionTotal || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Credit Interest', reviewData.financialData.reafsCreditInterest || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Payment for Retention Account', reviewData.financialData.reafsPaymentForRetentionAcc || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Developer Reimburse', reviewData.financialData.reafsDeveloperReimburse || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Unit Registration Fees', reviewData.financialData.reafsUnitRegFees || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Credit Interest Profit', reviewData.financialData.reafsCreditInterestProfit || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('VAT Capped Cost', reviewData.financialData.reafsVatCappedCost || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Current Balance in Subs Construction Account', reviewData.financialData.reafsCurrentBalInSubsConsAcc || 'N/A')}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Project Closure Section */}
      {reviewData.closureData && reviewData.closureData.length > 0 && (
        <Card sx={cardStyles}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '0.15px',
                  verticalAlign: 'middle',
                }}
              >
                Project Closure
              </Typography>
              {!isViewMode && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => onEditStep?.(7)} // Navigate to Step 8 (Project Closure)
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#2563EB',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#F3F4F6',
                  },
                }}
              >
                Edit
              </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Total Income Fund', reviewData.closureData[0]?.totalIncomeFund || 'N/A')}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField('Total Payment', reviewData.closureData[0]?.totalPayment || 'N/A')}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Documents Section */}
      {reviewData.documents.length > 0 && (
        <Card sx={cardStyles}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                lineHeight: '24px',
                color: '#1E2939',
                mb: 3,
              }}
            >
              Submitted Documents
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                    <TableCell sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                      Type
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviewData.documents.map((doc, index) => (
                    <TableRow key={doc.id || index} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                      <TableCell sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                        {doc.fileName}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                        {formatDate(doc.uploadDate, 'DD-MM-YYYY')}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                        {doc.documentType}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default Step8
