// 'use client'

// import React from 'react'
// import {
//   Box,
//   Grid,
//   Typography,
//   Card,
//   CardContent,
//   Divider,
//   Button,
//   Alert,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   useTheme,
//   alpha,
//   Theme,
// } from '@mui/material'
// import EditIcon from '@mui/icons-material/Edit'
// import { ProjectData } from '../types'
// // import { useProjectLabels } from '@/hooks/useProjectLabels'
// import { useBuildPartnerAssetLabelsWithUtils } from '@/hooks/useBuildPartnerAssetLabels'
// import { useProjectReview } from '@/hooks/useProjectReview'
// import { labelSx, valueSx, fieldBoxSx, cardStyles } from '../styles'
// import { GlobalLoading } from '@/components/atoms'
// import { formatDate } from '@/utils'

// const renderDisplayField = (
//   label: string,
//   value: string | number | null = '-',
//   theme: Theme
// ) => {
//   return (
//     <Box sx={fieldBoxSx}>
//       <Typography sx={(labelSx as any)(theme)}>{label}</Typography>
//       <Typography sx={(valueSx as any)(theme)}>{value || '-'} </Typography>
//     </Box>
//   )
// }

// interface Step8Props {
//   projectData: ProjectData
//   onEditStep?: (stepNumber: number) => void
//   projectId?: string
//   isViewMode?: boolean
// }

// const Step8: React.FC<Step8Props> = ({
//   onEditStep,
//   projectId,
//   isViewMode = false,
// }) => {
//   const theme = useTheme()
//   const textPrimary = theme.palette.mode === 'dark' ? '#FFFFFF' : '#1E2939'
//   const textSecondary = theme.palette.mode === 'dark' ? '#CBD5E1' : '#6B7280'
//   const tableHeaderBackground =
//     theme.palette.mode === 'dark'
//       ? alpha(theme.palette.background.paper, 0.5)
//       : alpha('#F9FAFB', 0.8)
//   const borderColor =
//     theme.palette.mode === 'dark' ? alpha('#FFFFFF', 0.2) : '#E5E7EB'
//   const hoverBorderColor =
//     theme.palette.mode === 'dark' ? alpha('#FFFFFF', 0.35) : '#9CA3AF'
//   const hoverBackground =
//     theme.palette.mode === 'dark' ? alpha('#FFFFFF', 0.06) : '#F9FAFB'
//   const primaryHoverBackground =
//     theme.palette.mode === 'dark'
//       ? alpha(theme.palette.primary.main, 0.2)
//       : alpha(theme.palette.primary.main, 0.1)
//   const { getLabel } = useBuildPartnerAssetLabelsWithUtils()
//   const language = 'EN'

//   // Fetch real project data using the new hook
//   const {
//     projectData: reviewData,
//     loading,
//     error,
//   } = useProjectReview(projectId || '')

//   // Loading state
//   if (loading) {
//     return (
//       <Box
//         sx={{
//           backgroundColor:
//             theme.palette.mode === 'dark' ? '#111827' : alpha('#FFFFFF', 0.75),
//           borderRadius: '16px',
//           margin: '0 auto',
//           width: '100%',
//           height: '400px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <GlobalLoading fullHeight className="min-h-[400px]" />
//       </Box>
//     )
//   }

//   // Error state
//   if (error) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error}
//         </Alert>
//       </Box>
//     )
//   }

//   // No data state
//   if (!reviewData) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <Alert severity="info">No project data found.</Alert>
//       </Box>
//     )
//   }

//   // Project fields with real data from API
//   const projectFields = [
//     {
//       gridSize: 6,
//       label: 'System ID*',
//       value: reviewData.projectDetails?.id || 'PROJ7102',
//     },
//     {
//       gridSize: 6,
//       // label: 'Developer CIF/Name*',
//       label: getLabel('CDL_BPA_BP_CIF', language, 'Build Partner CIF'),
//       value: reviewData.projectDetails?.developerCif || '',
//     },
//     {
//       gridSize: 6,
//       // label: 'Developer ID (RERA)*',
//       label: getLabel('CDL_BPA_BP_ID', language, 'Build Partner ID'),
//       value: reviewData.projectDetails?.developerId || '',
//     },
//     {
//       gridSize: 6,
//       // label: 'Developer Name',
//       label: getLabel('CDL_BPA_BP_NAME', language, 'Build Partner Name'),
//       value: reviewData.projectDetails?.developerName || '',
//     },
//     {
//       gridSize: 6,
//       // label: 'Master Developer Name',
//       label: getLabel('CDL_BPA_BP_NAME', language, 'Master Build Partner Name'),
//       value: reviewData.projectDetails?.masterDeveloperName || '',
//     },
//     {
//       gridSize: 6,
//       // label: 'Project RERA Number*',
//       label: getLabel('CDL_BPA_REGNO', language, 'RERA Registration Number'),
//       value: reviewData.projectDetails?.reraNumber || '',
//     },
//     {
//       gridSize: 6,
//       // label: 'Project Name*',
//       label: getLabel('CDL_BPA_NAME', language, 'Asset Name'),
//       value: reviewData.projectDetails?.projectName || '',
//     },
//     {
//       gridSize: 6,
//       // label: 'Project Type*',
//       label: getLabel('CDL_BPA_TP_TYPE', language, 'Assets Type'),
//       value: reviewData.projectDetails?.projectType || '',
//     },
//     {
//       gridSize: 12,
//       // label: 'Project Location*',
//       label: getLabel('CDL_BPA_LOCATION', language, 'Asset Location'),
//       value: reviewData.projectDetails?.projectLocation || '',
//     },
//     {
//       gridSize: 3,
//       // label: 'Project Account CIF*',
//       label: getLabel(
//         'CDL_BPA_CIF',
//         language,
//         'Customer Information File (CIF) Number'
//       ),
//       value: reviewData.projectDetails?.projectAccountCif || '',
//     },
//     {
//       gridSize: 3,
//       // label: 'Project Status*',
//       label: getLabel('CDL_BPA_STATUS', language, 'Asset Status'),
//       value: reviewData.projectDetails?.projectStatus || '',
//     },
//     {
//       gridSize: 6,
//       // label: 'Project Account Status*',
//       label: getLabel('CDL_BPA_ACC_STATUS', language, 'Asset Account Status'),
//       value: reviewData.projectDetails?.projectAccountStatus || '',
//     },
//     {
//       gridSize: 3,
//       // label: 'Project Account Status Date',
//       label: getLabel(
//         'CDL_BPA_ACC_STATUS_DATE',
//         language,
//         'Asset Account Status Date'
//       ),
//       value: reviewData.projectDetails?.projectAccountStatusDate
//         ? formatDate(
//             reviewData.projectDetails.projectAccountStatusDate,
//             'DD/MM/YYYY'
//           )
//         : '',
//     },
//     {
//       gridSize: 3,
//       // label: 'Project Registration Date*',
//       label: getLabel('CDL_BPA_REG_DATE', language, 'Asset Registration Date'),
//       value: reviewData.projectDetails?.projectRegistrationDate
//         ? formatDate(
//             reviewData.projectDetails.projectRegistrationDate,
//             'DD/MM/YYYY'
//           )
//         : '',
//     },
//     {
//       gridSize: 3,
//       // label: 'Project Start Date Est.*',
//       label: getLabel(
//         'CDL_BPA_EST_DATE',
//         language,
//         'Estimated Commencement Date'
//       ),
//       value: reviewData.projectDetails?.projectStartDateEst
//         ? formatDate(
//             reviewData.projectDetails.projectStartDateEst,
//             'DD/MM/YYYY'
//           )
//         : '',
//     },
//     {
//       gridSize: 3,
//       // label: 'Project Start Date*',
//       label: getLabel(
//         'CDL_BPA_RETENTION_START_DATE',
//         language,
//         'Retention Start Date'
//       ),
//       value: reviewData.projectDetails?.projectStartDate
//         ? formatDate(reviewData.projectDetails.projectStartDate, 'DD/MM/YYYY')
//         : '',
//     },
//     {
//       gridSize: 3,
//       // label: 'Retention %*',
//       label: getLabel(
//         'CDL_BPA_PRIMARY_RETENTION',
//         language,
//         'Primary Retention(%)'
//       ),
//       value: reviewData.projectDetails?.retentionPercent || '5.00',
//     },
//     {
//       gridSize: 3,
//       // label: 'Additional Retention %',
//       label: getLabel(
//         'CDL_BPA_SECONDARY_RETENTION',
//         language,
//         'Supplementary Retention(%)'
//       ),
//       value: reviewData.projectDetails?.additionalRetentionPercent || '8.00',
//     },
//     {
//       gridSize: 3,
//       // label: 'Total Retention %',
//       label: getLabel(
//         'CDL_BPA_AGG_RETENTION',
//         language,
//         'Aggregate Retention(%)'
//       ),
//       value: reviewData.projectDetails?.totalRetentionPercent || '13.00',
//     },
//     {
//       gridSize: 3,
//       label: 'Retention Effective Start Date*',
//       value: reviewData.projectDetails?.retentionEffectiveStartDate
//         ? formatDate(
//             reviewData.projectDetails.retentionEffectiveStartDate,
//             'MM/DD/YYYY'
//           )
//         : '31/12/2022',
//     },
//     {
//       gridSize: 6,
//       label: 'Project Management Expenses (% of paid construction cost)*',
//       value: reviewData.projectDetails?.projectManagementExpenses || '5.00',
//     },
//     {
//       gridSize: 6,
//       label: 'Marketing Expenses (% of sold value)*',
//       value: reviewData.projectDetails?.marketingExpenses || '10.00',
//     },
//     {
//       gridSize: 6,
//       label: getLabel('CDL_BPA_BROK_FEES', language, 'Brokerage Fees'),
//       value: reviewData.projectDetails?.realEstateBrokerExpense || '',
//     },
//     {
//       gridSize: 6,
//       label: getLabel('CDL_BPA_ADVTG_COST', language, 'Advertising Costs'),
//       value: reviewData.projectDetails?.advertisingExpense || '',
//     },
//     {
//       gridSize: 6,
//       label: getLabel('CDL_BPA_LANDOWNER_NAME', language, 'Land Owner Name'),
//       value: reviewData.projectDetails?.landOwnerName || '',
//     },
//     {
//       gridSize: 6,
//       label: 'Project Completion Percentage',
//       value: reviewData.projectDetails?.projectCompletionPercentage || '',
//     },
//     {
//       gridSize: 3,
//       label: getLabel('CDL_BPA_TRAN_CUR', language, 'Transaction Currency'),
//       value: reviewData.projectDetails?.currency || 'AED',
//     },
//     {
//       gridSize: 3,
//       label: 'Actual Construction Cost',
//       value: reviewData.projectDetails?.actualConstructionCost || '',
//     },
//     {
//       gridSize: 6,
//       label: 'No. of Units',
//       value: reviewData.projectDetails?.noOfUnits || '12',
//     },
//     {
//       gridSize: 12,
//       label: getLabel('CDL_BPA_ADD_NOTES', language, 'Additional Notes'),
//       value: reviewData.projectDetails?.remarks || '',
//     },
//     {
//       gridSize: 12,
//       label: getLabel('CDL_BPA_SP_REG_APPROVAL', language, 'Special Approval'),
//       value: reviewData.projectDetails?.specialApproval || '',
//     },
//     {
//       gridSize: 6,
//       label: getLabel(
//         'CDL_BPA_RES_PAYMENT_TYPE',
//         language,
//         'Payment Type to be Blocked'
//       ),
//       value: reviewData.projectDetails?.paymentType || '',
//     },
//     {
//       gridSize: 6,
//       label: getLabel('CDL_BPA_ASS_MANAGER', language, 'Asset Manager'),
//       value:
//         reviewData.projectDetails?.managedBy || 'ems_checker1, ems_checker1',
//     },
//     {
//       gridSize: 6,
//       label: getLabel('CDL_BPA_BACKUP_MANAGER', language, 'Backup By*'),
//       value: reviewData.projectDetails?.backupRef || 'Maker ENBD;[enbd_maker]',
//     },
//     {
//       gridSize: 6,
//       label: getLabel('CDL_BPA_REL_MANAGER', language, 'Relationship Manager'),
//       value: reviewData.projectDetails?.relationshipManager || '',
//     },
//     {
//       gridSize: 6,
//       label: getLabel(
//         'CDL_BPA_ASS_REL_MANAGER',
//         language,
//         'Assistant Relationship Manager'
//       ),
//       value: reviewData.projectDetails?.assistantRelationshipManager || '',
//     },
//     {
//       gridSize: 6,
//       label: getLabel('CDL_BPA_TL', language, 'Team Leader Name'),
//       value: reviewData.projectDetails?.mpteamLeaderName || '',
//     },
//   ]

//   // Account fields with real data from API
//   const accountFields = reviewData.accounts
//     .map((account) => [
//       {
//         gridSize: 6,
//         label: getLabel(
//           'CDL_BPA_ACCOUNT_NUMBER',
//           language,
//           `${account.accountType || 'Account'} Number*`
//         ),
//         value: account.accountNumber || '',
//       },
//       {
//         gridSize: 6,
//         label: getLabel('CDL_BPA_IBAN_NUMBER', language, 'IBAN Number*'),
//         value: account.ibanNumber || '',
//       },
//       {
//         gridSize: 3,
//         label: getLabel('CDL_BPA_DATE_OPENED', language, 'Date Opened*'),
//         value: account.dateOpened
//           ? formatDate(account.dateOpened, 'MM/DD/YYYY')
//           : '-',
//       },
//       {
//         gridSize: 3,
//         label: getLabel('CDL_BPA_ACCOUNT_TITLE', language, 'Account Title*'),
//         value: account.accountTitle || 'dev',
//       },
//       {
//         gridSize: 6,
//         label: getLabel('CDL_BPA_TRAN_CUR', language, 'Currency'),
//         value: account.currency || '-',
//       },
//     ])
//     .flat()

//   // If no accounts, show default structure
//   if (accountFields.length === 0) {
//     accountFields.push(
//       { gridSize: 6, label: 'Trust Account Number*', value: '102800280' },
//       { gridSize: 6, label: 'IBAN Number*', value: '12345678' },
//       { gridSize: 3, label: 'Date Opened*', value: '-' },
//       { gridSize: 3, label: 'Account Title*', value: 'dev' },
//       { gridSize: 6, label: 'Currency*', value: '-' }
//     )
//   }

//   return (
//     <Box sx={{ width: '100%', p: 3 }}>
//       {/* Project Details Section */}
//       <Card sx={cardStyles}>
//         <CardContent>
//           <Box
//             display="flex"
//             justifyContent="space-between"
//             alignItems="center"
//             mb={2}
//           >
//             <Typography
//               variant="h6"
//               fontWeight={600}
//               gutterBottom
//               sx={{
//                 fontFamily: 'Outfit, sans-serif',
//                 fontWeight: 500,
//                 fontStyle: 'normal',
//                 fontSize: '18px',
//                 lineHeight: '28px',
//                 letterSpacing: '0.15px',
//                 verticalAlign: 'middle',
//                 color: textPrimary,
//               }}
//             >
//               {getLabel(
//                 'CDL_BPA_DETAILS',
//                 language,
//                 'Build Partner Asset Details'
//               )}
//             </Typography>
//             {!isViewMode && (
//               <Button
//                 startIcon={<EditIcon />}
//                 onClick={() => onEditStep?.(0)} // Navigate to Step 1 (Project Details)
//                 sx={{
//                   fontFamily: 'Outfit, sans-serif',
//                   fontWeight: 500,
//                   fontSize: '14px',
//                   lineHeight: '20px',
//                   color: textSecondary,
//                   borderColor,
//                   textTransform: 'none',
//                   '&:hover': {
//                     borderColor: hoverBorderColor,
//                     backgroundColor: hoverBackground,
//                   },
//                 }}
//               >
//                 Edit
//               </Button>
//             )}
//           </Box>

//           <Divider sx={{ mb: 2 }} />
//           <Grid container spacing={3}>
//             {projectFields.map((field, idx) => (
//               <Grid size={{ xs: 12, md: field.gridSize }} key={idx}>
//                 {renderDisplayField(field.label, field.value, theme)}
//               </Grid>
//             ))}
//           </Grid>
//         </CardContent>
//       </Card>

//       {/* Documents Section (placed after Project Details) */}
//       {reviewData.documents.length > 0 && (
//         <Card sx={(cardStyles as any)(theme)}>
//           <CardContent>
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               alignItems="center"
//               mb={2}
//             >
//               <Typography
//                 variant="h6"
//                 fontWeight={600}
//                 sx={{
//                   fontFamily: 'Outfit, sans-serif',
//                   fontWeight: 600,
//                   fontSize: '18px',
//                   lineHeight: '24px',
//                   color: textPrimary,
//                 }}
//               >
//                 Submitted Documents
//               </Typography>
//               {!isViewMode && (
//                 <Button
//                   startIcon={<EditIcon />}
//                   onClick={() => onEditStep?.(1)}
//                   sx={{
//                     fontFamily: 'Outfit, sans-serif',
//                     fontWeight: 500,
//                     fontSize: '14px',
//                     lineHeight: '20px',
//                     color: textSecondary,
//                     borderColor,
//                     textTransform: 'none',
//                     '&:hover': {
//                       borderColor: hoverBorderColor,
//                       backgroundColor: hoverBackground,
//                     },
//                   }}
//                 >
//                   Edit
//                 </Button>
//               )}
//             </Box>
//             <Divider sx={{ mb: 2 }} />
//             <TableContainer
//               component={Paper}
//               sx={{ boxShadow: 'none', border: `1px solid ${borderColor}` }}
//             >
//               <Table>
//                 <TableHead>
//                   <TableRow sx={{ backgroundColor: tableHeaderBackground }}>
//                     <TableCell
//                       sx={{
//                         fontFamily: 'Outfit, sans-serif',
//                         fontWeight: 600,
//                         fontSize: '14px',
//                         color: textPrimary,
//                         borderBottom: `1px solid ${borderColor}`,
//                       }}
//                     >
//                       Name
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontFamily: 'Outfit, sans-serif',
//                         fontWeight: 600,
//                         fontSize: '14px',
//                         color: textPrimary,
//                         borderBottom: `1px solid ${borderColor}`,
//                       }}
//                     >
//                       Date
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontFamily: 'Outfit, sans-serif',
//                         fontWeight: 600,
//                         fontSize: '14px',
//                         color: textPrimary,
//                         borderBottom: `1px solid ${borderColor}`,
//                       }}
//                     >
//                       Type
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {reviewData.documents.map((doc, index) => (
//                     <TableRow
//                       key={doc.id || index}
//                       sx={{
//                         backgroundColor:
//                           theme.palette.mode === 'dark'
//                             ? alpha(theme.palette.background.paper, 0.3)
//                             : '#FFFFFF',
//                         '&:hover': { backgroundColor: hoverBackground },
//                       }}
//                     >
//                       <TableCell
//                         sx={{
//                           fontFamily: 'Outfit, sans-serif',
//                           fontSize: '14px',
//                           color: textPrimary,
//                           borderBottom: `1px solid ${borderColor}`,
//                         }}
//                       >
//                         {doc.fileName}
//                       </TableCell>
//                       <TableCell
//                         sx={{
//                           fontFamily: 'Outfit, sans-serif',
//                           fontSize: '14px',
//                           color: textPrimary,
//                           borderBottom: `1px solid ${borderColor}`,
//                         }}
//                       >
//                         {formatDate(doc.uploadDate, 'DD/MM/YYYY')}
//                       </TableCell>
//                       <TableCell
//                         sx={{
//                           fontFamily: 'Outfit, sans-serif',
//                           fontSize: '14px',
//                           color: textPrimary,
//                           borderBottom: `1px solid ${borderColor}`,
//                         }}
//                       >
//                         {doc.documentType}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </CardContent>
//         </Card>
//       )}

//       {/* Account Details Section */}
//       <Card sx={cardStyles}>
//         <CardContent>
//           <Box
//             display="flex"
//             justifyContent="space-between"
//             alignItems="center"
//             mb={2}
//           >
//             <Typography
//               variant="h6"
//               fontWeight={600}
//               gutterBottom
//               sx={{
//                 fontFamily: 'Outfit, sans-serif',
//                 fontWeight: 500,
//                 fontStyle: 'normal',
//                 fontSize: '18px',
//                 lineHeight: '28px',
//                 letterSpacing: '0.15px',
//                 verticalAlign: 'middle',
//               }}
//             >
//               Account Details
//             </Typography>
//             {!isViewMode && (
//               <Button
//                 startIcon={<EditIcon />}
//                 onClick={() => onEditStep?.(2)} // Navigate to Step 3 (Account)
//                 sx={{
//                   fontFamily: 'Outfit, sans-serif',
//                   fontWeight: 500,
//                   fontSize: '14px',
//                   lineHeight: '20px',
//                   color: textSecondary,
//                   borderColor,
//                   textTransform: 'none',
//                   '&:hover': {
//                     borderColor: hoverBorderColor,
//                     backgroundColor: hoverBackground,
//                   },
//                 }}
//               >
//                 Edit
//               </Button>
//             )}
//           </Box>
//           <Divider sx={{ mb: 2 }} />

//           <Grid container spacing={3}>
//             {accountFields.map((field, idx) => (
//               <Grid size={{ xs: 12, md: field.gridSize }} key={idx}>
//                 {renderDisplayField(field.label, field.value, theme)}
//               </Grid>
//             ))}
//           </Grid>
//         </CardContent>
//       </Card>

//       {/* Fee Details Section */}
//       {reviewData.fees.length > 0 && (
//         <Card sx={(cardStyles as any)(theme)}>
//           <CardContent>
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               alignItems="center"
//               mb={2}
//             >
//               <Typography
//                 variant="h6"
//                 fontWeight={600}
//                 gutterBottom
//                 sx={{
//                   fontFamily: 'Outfit, sans-serif',
//                   fontWeight: 500,
//                   fontStyle: 'normal',
//                   fontSize: '18px',
//                   lineHeight: '28px',
//                   letterSpacing: '0.15px',
//                   verticalAlign: 'middle',
//                 }}
//               >
//                 Fee Details
//               </Typography>
//               {!isViewMode && (
//                 <Button
//                   startIcon={<EditIcon />}
//                   onClick={() => onEditStep?.(3)} // Navigate to Step 4 (Fees)
//                   sx={{
//                     fontFamily: 'Outfit, sans-serif',
//                     fontWeight: 500,
//                     fontSize: '14px',
//                     lineHeight: '20px',
//                     color: textSecondary,
//                     borderColor,
//                     textTransform: 'none',
//                     '&:hover': {
//                       borderColor: hoverBorderColor,
//                       backgroundColor: hoverBackground,
//                     },
//                   }}
//                 >
//                   Edit
//                 </Button>
//               )}
//             </Box>
//             <Divider sx={{ mb: 2 }} />

//             <Grid container spacing={3}>
//               {reviewData.fees.map((fee, index) => (
//                 <Grid size={{ xs: 12 }} key={index}>
//                   <Typography
//                     variant="h6"
//                     sx={{
//                       mb: 2,
//                       fontSize: '16px',
//                       color: textPrimary,
//                     }}
//                   >
//                     Fee {index + 1}
//                   </Typography>
//                   <Grid container spacing={3}>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel('CDL_BPA_FEES_TYPE', language, 'Type of Fee'),
//                         fee.feeType,
//                         theme
//                       )}
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel(
//                           'CDL_BPA_FEES_FREQUENCY',
//                           language,
//                           'Collection Frequency'
//                         ),
//                         fee.frequency,
//                         theme
//                       )}
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel(
//                           'CDL_BPA_FEES_ACCOUNT',
//                           language,
//                           'Debit Amount'
//                         ),
//                         fee.debitAmount,
//                         theme
//                       )}
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel(
//                           'CDL_BPA_FEE_COLLECTION_DATE',
//                           language,
//                           'Fee Collection Date'
//                         ),
//                         fee.feeToBeCollected,
//                         theme
//                       )}
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel(
//                           'CDL_BPA_FEES_DATE',
//                           language,
//                           'Next Collection Date'
//                         ),
//                         fee.nextRecoveryDate,
//                         theme
//                       )}
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel('CDL_BPA_FEES_RATE', language, 'Fee Rate (%)'),
//                         fee.feePercentage,
//                         theme
//                       )}
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel('CDL_BPA_FEES_AMOUNT', language, 'Fee Amount'),
//                         fee.amount,
//                         theme
//                       )}
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel(
//                           'CDL_BPA_FEES_VAT',
//                           language,
//                           'Applicable VAT (%)'
//                         ),
//                         fee.vatPercentage,
//                         theme
//                       )}
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel(
//                           'CDL_BPA_FEES_CURRENCY',
//                           language,
//                           'Transaction Currency'
//                         ),
//                         fee.currency,
//                         theme
//                       )}
//                     </Grid>
//                   </Grid>
//                   {index < reviewData.fees.length - 1 && (
//                     <Divider sx={{ mt: 2, mb: 2 }} />
//                   )}
//                 </Grid>
//               ))}
//             </Grid>
//           </CardContent>
//         </Card>
//       )}

//       {/* Beneficiary Details Section */}
//       {reviewData.beneficiaries.length > 0 && (
//         <Card sx={(cardStyles as any)(theme)}>
//           <CardContent>
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               alignItems="center"
//               mb={2}
//             >
//               <Typography
//                 variant="h6"
//                 fontWeight={600}
//                 gutterBottom
//                 sx={{
//                   fontFamily: 'Outfit, sans-serif',
//                   fontWeight: 500,
//                   fontStyle: 'normal',
//                   fontSize: '18px',
//                   lineHeight: '28px',
//                   letterSpacing: '0.15px',
//                   verticalAlign: 'middle',
//                   color: textPrimary,
//                 }}
//               >
//                 Beneficiary Details
//               </Typography>
//               {!isViewMode && (
//                 <Button
//                   startIcon={<EditIcon />}
//                   onClick={() => onEditStep?.(4)} // Navigate to Step 5 (Beneficiaries)
//                   sx={{
//                     fontFamily: 'Outfit, sans-serif',
//                     fontWeight: 500,
//                     fontSize: '14px',
//                     lineHeight: '20px',
//                     color: textSecondary,
//                     borderColor,
//                     textTransform: 'none',
//                     '&:hover': {
//                       borderColor: hoverBorderColor,
//                       backgroundColor: hoverBackground,
//                     },
//                   }}
//                 >
//                   Edit
//                 </Button>
//               )}
//             </Box>
//             <Divider sx={{ mb: 2 }} />

//             <Grid container spacing={3}>
//               {reviewData.beneficiaries.map((beneficiary, index) => (
//                 <Grid size={{ xs: 12 }} key={index}>
//                   <Typography
//                     variant="h6"
//                     sx={{ mb: 2, fontSize: '16px', color: textPrimary }}
//                   >
//                     Beneficiary {index + 1}
//                   </Typography>
//                   <Grid container spacing={3}>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel(
//                           'CDL_BPA_BENE_REFID',
//                           language,
//                           'Beneficiary Reference ID'
//                         ),
//                         beneficiary.beneficiaryId,
//                         theme
//                       )}
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel(
//                           'CDL_BPA_RES_PAYMENT_TYPE',
//                           language,
//                           'Restricted Payment Type'
//                         ),
//                         beneficiary.beneficiaryType,
//                         theme
//                       )}
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel(
//                           'CDL_BPA_BENE_NAME',
//                           language,
//                           'Beneficiary Full Name'
//                         ),
//                         beneficiary.name,
//                         theme
//                       )}
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel('CDL_BPA_BENE_BANK', language, 'Bank Name'),
//                         beneficiary.bankName,
//                         theme
//                       )}
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel(
//                           'CDL_BPA_BENE_ACC',
//                           language,
//                           'Bank Account Number'
//                         ),
//                         beneficiary.accountNumber,
//                         theme
//                       )}
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel(
//                           'CDL_BPA_BENE_BIC',
//                           language,
//                           'SWIFT/BIC Code'
//                         ),
//                         beneficiary.swiftCode,
//                         theme
//                       )}
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       {renderDisplayField(
//                         getLabel(
//                           'CDL_BPA_BENE_ROUTING',
//                           language,
//                           'Routing Number'
//                         ),
//                         beneficiary.routingCode,
//                         theme
//                       )}
//                     </Grid>
//                   </Grid>
//                   {index < reviewData.beneficiaries.length - 1 && (
//                     <Divider sx={{ mt: 2, mb: 2 }} />
//                   )}
//                 </Grid>
//               ))}
//             </Grid>
//           </CardContent>
//         </Card>
//       )}

//       {/* Payment Plan Section */}
//       {reviewData.paymentPlans.length > 0 && (
//         <Card sx={(cardStyles as any)(theme)}>
//           <CardContent>
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               alignItems="center"
//               mb={2}
//             >
//               <Typography
//                 variant="h6"
//                 fontWeight={600}
//                 gutterBottom
//                 sx={{
//                   fontFamily: 'Outfit, sans-serif',
//                   fontWeight: 500,
//                   fontStyle: 'normal',
//                   fontSize: '18px',
//                   lineHeight: '28px',
//                   letterSpacing: '0.15px',
//                   verticalAlign: 'middle',
//                   color: textPrimary,
//                 }}
//               >
//                 Payment Plan
//               </Typography>
//               {!isViewMode && (
//                 <Button
//                   startIcon={<EditIcon />}
//                   onClick={() => onEditStep?.(5)} // Navigate to Step 6 (Payment Plan)
//                   sx={{
//                     fontFamily: 'Outfit, sans-serif',
//                     fontWeight: 500,
//                     fontSize: '14px',
//                     lineHeight: '20px',
//                     color: textSecondary,
//                     borderColor,
//                     textTransform: 'none',
//                     '&:hover': {
//                       borderColor: hoverBorderColor,
//                       backgroundColor: hoverBackground,
//                     },
//                   }}
//                 >
//                   Edit
//                 </Button>
//               )}
//             </Box>
//             <Divider sx={{ mb: 2 }} />

//             <TableContainer
//               component={Paper}
//               sx={{ boxShadow: 'none', border: `1px solid ${borderColor}` }}
//             >
//               <Table>
//                 <TableHead>
//                   <TableRow sx={{ backgroundColor: tableHeaderBackground }}>
//                     <TableCell
//                       sx={{
//                         fontFamily: 'Outfit, sans-serif',
//                         fontWeight: 600,
//                         fontSize: '14px',
//                         color: textPrimary,
//                         borderBottom: `1px solid ${borderColor}`,
//                       }}
//                     >
//                       {getLabel(
//                         'CDL_BPA_INSTALLMENT_NO',
//                         language,
//                         'Installment Sequence Number'
//                       )}
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontFamily: 'Outfit, sans-serif',
//                         fontWeight: 600,
//                         fontSize: '14px',
//                         color: textPrimary,
//                         borderBottom: `1px solid ${borderColor}`,
//                       }}
//                     >
//                       {getLabel(
//                         'CDL_BPA_INSTALLMENT_PER',
//                         language,
//                         'Installment Percentage (%)'
//                       )}
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontFamily: 'Outfit, sans-serif',
//                         fontWeight: 600,
//                         fontSize: '14px',
//                         color: textPrimary,
//                         borderBottom: `1px solid ${borderColor}`,
//                       }}
//                     >
//                       {getLabel(
//                         'CDL_BPA_ASST_COMP_PER',
//                         language,
//                         'Asset Completion Percentage'
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {reviewData.paymentPlans.map((plan, index) => (
//                     <TableRow
//                       key={plan.id || index}
//                       sx={{
//                         backgroundColor:
//                           theme.palette.mode === 'dark'
//                             ? alpha(theme.palette.background.paper, 0.3)
//                             : '#FFFFFF',
//                         '&:hover': { backgroundColor: hoverBackground },
//                       }}
//                     >
//                       <TableCell
//                         sx={{
//                           fontFamily: 'Outfit, sans-serif',
//                           fontSize: '14px',
//                           color: textPrimary,
//                           borderBottom: `1px solid ${borderColor}`,
//                         }}
//                       >
//                         {plan.installmentNumber}
//                       </TableCell>
//                       <TableCell
//                         sx={{
//                           fontFamily: 'Outfit, sans-serif',
//                           fontSize: '14px',
//                           color: textPrimary,
//                           borderBottom: `1px solid ${borderColor}`,
//                         }}
//                       >
//                         {plan.installmentPercentage}%
//                       </TableCell>
//                       <TableCell
//                         sx={{
//                           fontFamily: 'Outfit, sans-serif',
//                           fontSize: '14px',
//                           color: textPrimary,
//                           borderBottom: `1px solid ${borderColor}`,
//                         }}
//                       >
//                         {plan.projectCompletionPercentage}%
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </CardContent>
//         </Card>
//       )}

//       {/* Financial Summary Section */}
//       {reviewData.financialData &&
//         (() => {
//           // Normalize API financial summary to the same structure used in Step 6
//           const fd: any = reviewData.financialData as any
//           const breakdownMap: Record<
//             number,
//             { out: string; within: string; total: string; except: string }
//           > = {
//             0: {
//               out: 'reafsCurCashRecvdOutEscrow',
//               within: 'reafsCurCashRecvdWithinEscrow',
//               total: 'reafsCurCashRecvdTotal',
//               except: 'reafsCurCashexceptCapVal',
//             },
//             1: {
//               out: 'reafsCurLandCostOut',
//               within: 'reafsCurLandCostWithin',
//               total: 'reafsCurLandTotal',
//               except: 'reafsCurLandexceptCapVal',
//             },
//             2: {
//               out: 'reafsCurConsCostOut',
//               within: 'reafsCurConsCostWithin',
//               total: 'reafsCurConsCostTotal',
//               except: 'reafsCurConsExcepCapVal',
//             },
//             3: {
//               out: 'reafsCurrentMktgExpOut',
//               within: 'reafsCurrentMktgExpWithin',
//               total: 'reafsCurrentMktgExpTotal',
//               except: 'reafsCurrentmktgExcepCapVal',
//             },
//             4: {
//               out: 'reafsCurProjMgmtExpOut',
//               within: 'reafsCurProjMgmtExpWithin',
//               total: 'reafsCurProjMgmtExpTotal',
//               except: 'reafsCurProjExcepCapVal',
//             },
//             5: {
//               out: 'currentMortgageOut',
//               within: 'reafsCurrentMortgageWithin',
//               total: 'reafsCurrentMortgageTotal',
//               except: 'reafsCurMortgageExceptCapVal',
//             },
//             6: {
//               out: 'reafsCurrentVatPaymentOut',
//               within: 'reafsCurrentVatPaymentWithin',
//               total: 'reafsCurrentVatPaymentTotal',
//               except: 'reafsCurVatExceptCapVal',
//             },
//             7: {
//               out: 'reafsCurrentOqoodOut',
//               within: 'reafsCurrentOqoodWithin',
//               total: 'reafsCurrentOqoodTotal',
//               except: 'reafsCurOqoodExceptCapVal',
//             },
//             8: {
//               out: 'reafsCurrentRefundOut',
//               within: 'reafsCurrentRefundWithin',
//               total: 'reafsCurrentRefundTotal',
//               except: 'reafsCurRefundExceptCapVal',
//             },
//             9: {
//               out: 'reafsCurBalInRetenAccOut',
//               within: 'reafsCurBalInRetenAccWithin',
//               total: 'reafsCurBalInRetenAccTotal',
//               except: 'reafsCurBalInRetenExceptCapVal',
//             },
//             10: {
//               out: 'reafsCurBalInTrustAccOut',
//               within: 'reafsCurBalInTrustAccWithin',
//               total: 'reafsCurBalInTrustAccTotal',
//               except: 'reafsCurBalInExceptCapVal',
//             },
//             11: {
//               out: 'reafsCurBalInSubsConsOut',
//               within: 'reafsCurBalInRSubsConsWithin',
//               total: 'reafsCurBalInSubsConsTotal',
//               except: 'reafsCurBalInSubsConsCapVal',
//             },
//             12: {
//               out: 'reafsCurTechnFeeOut',
//               within: 'reafsCurTechnFeeWithin',
//               total: 'reafsCurTechnFeeTotal',
//               except: 'reafsCurTechFeeExceptCapVal',
//             },
//             13: {
//               out: 'reafsCurUnIdeFundOut',
//               within: 'reafsCurUnIdeFundWithin',
//               total: 'reafsCurUnIdeFundTotal',
//               except: 'reafsCurUnIdeExceptCapVal',
//             },
//             14: {
//               out: 'reafsCurLoanInstalOut',
//               within: 'reafsCurLoanInstalWithin',
//               total: 'reafsCurLoanInstalTotal',
//               except: 'reafsCurLoanExceptCapVal',
//             },
//             15: {
//               out: 'reafsCurInfraCostOut',
//               within: 'reafsCurInfraCostWithin',
//               total: 'reafsCurInfraCostTotal',
//               except: 'reafsCurInfraExceptCapVal',
//             },
//             16: {
//               out: 'reafsCurOthersCostOut',
//               within: 'reafsCurOthersCostWithin',
//               total: 'reafsCurOthersCostTotal',
//               except: 'reafsCurOthersExceptCapVal',
//             },
//             17: {
//               out: 'reafsCurTransferCostOut',
//               within: 'reafsCurTransferCostWithin',
//               total: 'reafsCurTransferCostTotal',
//               except: 'reafsCurTransferExceptCapVal',
//             },
//             18: {
//               out: 'reafsCurForfeitCostOut',
//               within: 'reafsCurForfeitCostWithin',
//               total: 'reafsCurForfeitCostTotal',
//               except: 'reafsCurForfeitExceptCapVal',
//             },
//             19: {
//               out: 'reafsCurDeveEqtycostOut',
//               within: 'reafsCurDeveEqtycostWithin',
//               total: 'reafsCurDeveEqtycostTotal',
//               except: 'reafsCurDeveExceptCapVal',
//             },
//             20: {
//               out: 'reafsCurAmntFundOut',
//               within: 'reafsCurAmntFundWithin',
//               total: 'reafsCurAmntFundTotal',
//               except: 'reafsCurAmntExceptCapVal',
//             },
//             21: {
//               out: 'reafsCurOtherWithdOut',
//               within: 'reafsCurOtherWithdWithin',
//               total: 'reafsCurOtherWithdTotal',
//               except: 'reafsCurOtherExceptCapVal',
//             },
//             22: {
//               out: 'reafsCurOqoodOthFeeOut',
//               within: 'reafsCurOqoodOthFeeWithin',
//               total: 'reafsCurOqoodOthFeeTotal',
//               except: 'reafsOtherFeesAnPaymentExcepVal',
//             },
//             23: {
//               out: 'reafsCurVatDepositOut',
//               within: 'reafsCurVatDepositWithin',
//               total: 'reafsCurVatDepositTotal',
//               except: 'reafsCurVatDepositCapVal',
//             },
//           }

//           const breakdown = Array(24)
//             .fill(null)
//             .map((_, index) => {
//               const m = breakdownMap[index]
//               if (!m) {
//                 return {
//                   outOfEscrow: '',
//                   withinEscrow: '',
//                   total: '',
//                   exceptionalCapValue: '',
//                 }
//               }

//               // Explicitly access each field to ensure we get the correct mapping
//               const outValue = fd.hasOwnProperty(m.out) ? fd[m.out] : undefined
//               const withinValue = fd.hasOwnProperty(m.within)
//                 ? fd[m.within]
//                 : undefined
//               const totalValue = fd.hasOwnProperty(m.total)
//                 ? fd[m.total]
//                 : undefined
//               const exceptValue = fd.hasOwnProperty(m.except)
//                 ? fd[m.except]
//                 : undefined

//               return {
//                 outOfEscrow:
//                   outValue != null && outValue !== undefined && outValue !== ''
//                     ? String(outValue)
//                     : '',
//                 withinEscrow:
//                   withinValue != null &&
//                   withinValue !== undefined &&
//                   withinValue !== ''
//                     ? String(withinValue)
//                     : '',
//                 total:
//                   totalValue != null &&
//                   totalValue !== undefined &&
//                   totalValue !== ''
//                     ? String(totalValue)
//                     : '',
//                 exceptionalCapValue:
//                   exceptValue != null &&
//                   exceptValue !== undefined &&
//                   exceptValue !== ''
//                     ? String(exceptValue)
//                     : '',
//               }
//             })

//           const normalized = {
//             estimate: {
//               revenue: fd.reafsEstRevenue?.toString() || '',
//               constructionCost: fd.reafsEstConstructionCost?.toString() || '',
//               projectManagementExpense:
//                 fd.reafsEstProjectMgmtExpense?.toString() || '',
//               landCost: fd.reafsEstLandCost?.toString() || '',
//               marketingExpense: fd.reafsEstMarketingExpense?.toString() || '',
//               date: fd.reafsEstimatedDate
//                 ? new Date(fd.reafsEstimatedDate)
//                 : null,
//             },
//             actual: {
//               soldValue: fd.reafsActualSoldValue?.toString() || '',
//               constructionCost:
//                 fd.reafsActualConstructionCost?.toString() || '',
//               infraCost: fd.reafsActualInfraCost?.toString() || '',
//               landCost: fd.reafsActualLandCost?.toString() || '',
//               projectManagementExpense:
//                 fd.reafsActualProjectMgmtExpense?.toString() || '',
//               marketingExpense: fd.reafsActualMarketingExp?.toString() || '',
//               date: fd.reafsActualDate ? new Date(fd.reafsActualDate) : null,
//             },
//             breakdown,
//             additional: {
//               creditInterestRetention: fd.reafsCreditInterest?.toString() || '',
//               paymentsRetentionAccount:
//                 fd.reafsPaymentForRetentionAcc?.toString() || '',
//               reimbursementsDeveloper:
//                 fd.reafsDeveloperReimburse?.toString() || '',
//               unitRegistrationFees: fd.reafsUnitRegFees?.toString() || '',
//               creditInterestEscrow:
//                 fd.reafsCreditInterestProfit?.toString() || '',
//               vatCapped: fd.reafsVatCappedCost?.toString() || '',
//             },
//           }

//           const breakdownSectionTitles = [
//             getLabel(
//               'CDL_BPA_CASH_FROM_UNIT',
//               language,
//               'Cash Inflow from Unit Holders'
//             ),
//             getLabel(
//               'CDL_BPA_LAND_ACQ_COST',
//               language,
//               'Land Acquisition Cost'
//             ),
//             getLabel('CDL_BPA_BUILD_COST', language, 'Build Cost'),
//             getLabel('CDL_BPA_MARK_EXP', language, 'Marketing Expense'),
//             getLabel(
//               'CDL_BPA_ASST_MGMT_EXP',
//               language,
//               'Asset Management Expense'
//             ),
//             getLabel('CDL_BPA_MORTGAGE_AMT', language, 'Mortgage Amount'),
//             getLabel('CDL_BPA_VAT_AMT', language, 'VAT Payment'),
//             getLabel('CDL_BPA_TOTAL_AMOUNT', language, 'Total Amount'),
//             getLabel('CDL_BPA_REFUND_AMT', language, 'Refund Amount'),
//             getLabel(
//               'CDL_BPA_RETEN_ACC_BAL',
//               language,
//               'Retention Account Balance'
//             ),
//             getLabel(
//               'CDL_BPA_TRUST_ACC_BAL',
//               language,
//               'Trust Account Balance'
//             ),
//             getLabel(
//               'CDL_BPA_SUBCONS_ACC_BAL',
//               language,
//               'Sub-Construction Account Balance'
//             ),
//             getLabel('CDL_BPA_TECH_FEES', language, 'Technical Fees'),
//             getLabel('CDL_BPA_UNALLO_COST', language, 'Unallocated Costs'),
//             getLabel('CDL_BPA_LOAN', language, 'Loan/Installment Payments'),
//             getLabel(
//               'CDL_BPA_INFRA_COST',
//               language,
//               'Infrastructure Development Cost'
//             ),
//             getLabel('CDL_BPA_OTHER_EXP', language, 'Other Expenses'),
//             getLabel('CDL_BPA_TRANS_AMT', language, 'Transferred Amount'),
//             getLabel('CDL_BPA_FORFEIT_AMT', language, 'Forfeited Amount'),
//             getLabel(
//               'CDL_BPA_DEV_EQUITY_CONT',
//               language,
//               'Developer Equity Contribution'
//             ),
//             getLabel('CDL_BPA_AMANAT_FUND', language, 'Amanat Fund Allocation'),
//             getLabel('CDL_BPA_OTHER_WITHDRAW', language, 'Other Withdrawals'),
//             getLabel(
//               'CDL_BPA_OQOOD_OTHER_PMT',
//               language,
//               'Oqood and Other Payments'
//             ),
//             getLabel(
//               'CDL_BPA_VAT_DEPOSIT_AMT',
//               language,
//               'VAT Deposited Amount'
//             ),
//           ]

//           return (
//             <Card sx={(cardStyles as any)(theme)}>
//               <CardContent>
//                 <Box
//                   display="flex"
//                   justifyContent="space-between"
//                   alignItems="center"
//                   mb={2}
//                 >
//                   <Typography
//                     variant="h6"
//                     fontWeight={600}
//                     gutterBottom
//                     sx={{
//                       fontFamily: 'Outfit, sans-serif',
//                       fontWeight: 500,
//                       fontStyle: 'normal',
//                       fontSize: '18px',
//                       lineHeight: '28px',
//                       letterSpacing: '0.15px',
//                       verticalAlign: 'middle',
//                     }}
//                   >
//                     {getLabel(
//                       'CDL_BPA_FINANCIAL',
//                       language,
//                       'Asset Financial Overview'
//                     )}
//                   </Typography>
//                   {!isViewMode && (
//                     <Button
//                       startIcon={<EditIcon />}
//                       onClick={() => onEditStep?.(6)}
//                       sx={{
//                         fontFamily: 'Outfit, sans-serif',
//                         fontWeight: 500,
//                         fontSize: '14px',
//                         lineHeight: '20px',
//                         color: '#2563EB',
//                         textTransform: 'none',
//                         '&:hover': { backgroundColor: primaryHoverBackground },
//                       }}
//                     >
//                       Edit
//                     </Button>
//                   )}
//                 </Box>
//                 <Divider sx={{ mb: 2 }} />

//                 {/* Estimated */}
//                 <Grid container spacing={3}>
//                   <Grid size={{ xs: 12 }}>
//                     <Typography
//                       variant="h6"
//                       sx={{
//                         mb: 2,
//                         color: textPrimary,
//                         fontWeight: 600,
//                       }}
//                     >
//                       {getLabel(
//                         'CDL_BPA_FINANCIAL',
//                         language,
//                         'Asset Financial Overview'
//                       )}
//                     </Typography>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_TOTAL_REVENUE',
//                         language,
//                         'Total Revenue'
//                       ),
//                       normalized.estimate.revenue || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel('CDL_BPA_BUILD_COST', language, 'Build Cost'),
//                       normalized.estimate.constructionCost || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_ASST_MGMT_EXP',
//                         language,
//                         'Asset Management Expense'
//                       ),
//                       normalized.estimate.projectManagementExpense || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_LAND_ACQ_COST',
//                         language,
//                         'Land Acquisition Cost'
//                       ),
//                       normalized.estimate.landCost || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_MARK_EXP',
//                         language,
//                         'Marketing Expense'
//                       ),
//                       normalized.estimate.marketingExpense || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_TRAN_DATE',
//                         language,
//                         'Transaction Date'
//                       ),
//                       normalized.estimate.date
//                         ? formatDate(
//                             normalized.estimate.date as any,
//                             'DD/MM/YYYY'
//                           )
//                         : 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                 </Grid>

//                 {/* Actual */}
//                 <Grid container spacing={3}>
//                   <Grid size={{ xs: 12 }}>
//                     <Typography
//                       variant="h6"
//                       sx={{
//                         mb: 2,
//                         color: textPrimary,
//                         fontWeight: 600,
//                         mt: 3,
//                       }}
//                     >
//                       {getLabel(
//                         'CDL_BPA_ACTUAL_ASSEST_COST',
//                         language,
//                         'Actual Asset Cost'
//                       )}
//                     </Typography>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_TOTAL_UNIT_SOLD',
//                         language,
//                         'Total Units Sold Value'
//                       ),
//                       normalized.actual.soldValue || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel('CDL_BPA_BUILD_COST', language, 'Build Cost'),
//                       normalized.actual.constructionCost || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_INFRA_COST',
//                         language,
//                         'Infrastructure Development Cost'
//                       ),
//                       normalized.actual.infraCost || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_LAND_ACQ_COST',
//                         language,
//                         'Land Acquisition Cost'
//                       ),
//                       normalized.actual.landCost || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_ASST_MGMT_EXP',
//                         language,
//                         'Asset Management Expense'
//                       ),
//                       normalized.actual.projectManagementExpense || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_MARK_EXP',
//                         language,
//                         'Marketing Expense'
//                       ),
//                       normalized.actual.marketingExpense || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_TRAN_DATE',
//                         language,
//                         'Transaction Date'
//                       ),
//                       normalized.actual.date
//                         ? formatDate(
//                             normalized.actual.date as any,
//                             'DD/MM/YYYY'
//                           )
//                         : 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                 </Grid>

//                 {/* Breakdown sections */}
//                 {normalized.breakdown.map((item, i) => (
//                   <Box key={i} mb={4}>
//                     <Typography
//                       variant="h6"
//                       sx={{
//                         mb: 2,
//                         color: textPrimary,
//                         fontFamily: 'Outfit, sans-serif',
//                         fontWeight: 500,
//                         fontSize: '18px',
//                         lineHeight: '28px',
//                         letterSpacing: '0.15px',
//                       }}
//                     >
//                       {breakdownSectionTitles[i]}
//                     </Typography>
//                     <Grid container spacing={3}>
//                       <Grid size={{ xs: 12, md: 3 }}>
//                         {renderDisplayField(
//                           getLabel(
//                             'CDL_BPA_FUND_OUT_ESCROW',
//                             language,
//                             'Funds Outside Escrow'
//                           ),
//                           item.outOfEscrow && item.outOfEscrow.trim() !== ''
//                             ? item.outOfEscrow
//                             : 'N/A',
//                           theme
//                         )}
//                       </Grid>
//                       <Grid size={{ xs: 12, md: 3 }}>
//                         {renderDisplayField(
//                           getLabel(
//                             'CDL_BPA_FUND_WITHIN_ESCROW',
//                             language,
//                             'Funds Within Escrow'
//                           ),
//                           item.withinEscrow && item.withinEscrow.trim() !== ''
//                             ? item.withinEscrow
//                             : 'N/A',
//                           theme
//                         )}
//                       </Grid>
//                       <Grid size={{ xs: 12, md: 3 }}>
//                         {renderDisplayField(
//                           getLabel(
//                             'CDL_BPA_TOTAL_AMOUNT',
//                             language,
//                             'Total Amount'
//                           ),
//                           item.total && item.total.trim() !== ''
//                             ? item.total
//                             : 'N/A',
//                           theme
//                         )}
//                       </Grid>
//                       <Grid size={{ xs: 12, md: 3 }}>
//                         {renderDisplayField(
//                           getLabel(
//                             'CDL_BPA_EXCEP_CAP_VAL',
//                             language,
//                             'Exceptional Capital Value'
//                           ),
//                           item.exceptionalCapValue &&
//                             item.exceptionalCapValue.trim() !== ''
//                             ? item.exceptionalCapValue
//                             : 'N/A',
//                           theme
//                         )}
//                       </Grid>
//                     </Grid>
//                   </Box>
//                 ))}

//                 {/* Additional */}
//                 <Grid container spacing={3}>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_PROFIT_ERND',
//                         language,
//                         'Credit Interest/Profit Earned for Retention A/c'
//                       ),
//                       normalized.additional.creditInterestRetention || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_PMT_FRM_RETENTION',
//                         language,
//                         'Payments for Retention Account'
//                       ),
//                       normalized.additional.paymentsRetentionAccount || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_REIMB_AMT',
//                         language,
//                         'Reimbursement Amount'
//                       ),
//                       normalized.additional.reimbursementsDeveloper || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_UNIT_REG_FEES',
//                         language,
//                         'Unit Registration Fees'
//                       ),
//                       normalized.additional.unitRegistrationFees || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel(
//                         'CDL_BPA_INT_ERND_ESCROW',
//                         language,
//                         'Credit Interest/Profit Earned for ESCROW A/c'
//                       ),
//                       normalized.additional.creditInterestEscrow || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     {renderDisplayField(
//                       getLabel('CDL_BPA_CAP_VAT_AMT', language, 'VAT Capped*'),
//                       normalized.additional.vatCapped || 'N/A',
//                       theme
//                     )}
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           )
//         })()}

//       {/* Project Closure Section */}
//       {reviewData.closureData && reviewData.closureData.length > 0 && (
//         <Card sx={(cardStyles as any)(theme)}>
//           <CardContent>
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               alignItems="center"
//               mb={2}
//             >
//               <Typography
//                 variant="h6"
//                 fontWeight={600}
//                 gutterBottom
//                 sx={{
//                   fontFamily: 'Outfit, sans-serif',
//                   fontWeight: 500,
//                   fontStyle: 'normal',
//                   fontSize: '18px',
//                   lineHeight: '28px',
//                   letterSpacing: '0.15px',
//                   verticalAlign: 'middle',
//                   color: textPrimary,
//                 }}
//               >
//                 {getLabel('CDL_BPA_CLOSURE', language, 'Asset Closure')}
//               </Typography>
//               {!isViewMode && (
//                 <Button
//                   startIcon={<EditIcon />}
//                   onClick={() => onEditStep?.(7)} // Navigate to Step 8 (Project Closure)
//                   sx={{
//                     fontFamily: 'Outfit, sans-serif',
//                     fontWeight: 500,
//                     fontSize: '14px',
//                     lineHeight: '20px',
//                     color: '#2563EB',
//                     textTransform: 'none',
//                     '&:hover': {
//                       backgroundColor: primaryHoverBackground,
//                     },
//                   }}
//                 >
//                   Edit
//                 </Button>
//               )}
//             </Box>
//             <Divider sx={{ mb: 2 }} />

//             <Grid container spacing={3}>
//               <Grid size={{ xs: 12, md: 6 }}>
//                 {renderDisplayField(
//                   getLabel(
//                     'CDL_BPA_TOTAL_INCOME_FUND',
//                     language,
//                     'Total Income Fund'
//                   ),
//                   reviewData.closureData[0]?.totalIncomeFund || 'N/A',
//                   theme
//                 )}
//               </Grid>
//               <Grid size={{ xs: 12, md: 6 }}>
//                 {renderDisplayField(
//                   getLabel('CDL_BPA_TOTAL_PAYMENT', language, 'Total Payment'),
//                   reviewData.closureData[0]?.totalPayment || 'N/A',
//                   theme
//                 )}
//               </Grid>
//             </Grid>
//           </CardContent>
//         </Card>
//       )}
//     </Box>
//   )
// }

// export default Step8
