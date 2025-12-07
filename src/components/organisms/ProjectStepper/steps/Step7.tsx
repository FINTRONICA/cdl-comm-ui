'use client'

import React from 'react'
import { Card, CardContent, Grid, TextField, useTheme } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { commonFieldStyles, labelSx, valueSx, cardStyles } from '../styles'
// import { useProjectLabels } from '@/hooks/useProjectLabels'
import { ProjectData } from '../types'
import { useBuildPartnerAssetLabelsWithUtils } from '@/hooks/useBuildPartnerAssetLabels'

interface Step7Props {
  projectId?: string
  isViewMode?: boolean
}

const Step7: React.FC<Step7Props> = ({ isViewMode = false }) => {
  const theme = useTheme()
  const { control } = useFormContext<ProjectData>()
  const { getLabel } = useBuildPartnerAssetLabelsWithUtils()
  const language = 'EN'

  return (
    <Card sx={cardStyles}>
      <CardContent
        sx={{
          color:
            theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
        }}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="closureData.totalIncomeFund"
              control={control}
              rules={{
                required: 'Total Income Received is required',
                pattern: {
                  value: /^[0-9.,\s]+$/,
                  message: 'Must contain only numbers, decimals, and commas',
                },
                maxLength: {
                  value: 20,
                  message: 'Maximum 20 characters allowed',
                },
              }}
              render={({ field, fieldState: { error, isTouched } }) => {
                // Show validation error if field has been touched OR if there's an error (for form submission)
                const shouldShowError = (isTouched || !!error) && !!error
                return (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    required
                    label={getLabel(
                      'CDL_BPA_TOTAL_AMT_RECEIVED',
                      language,
                      'Total Income Received'
                    )}
                    placeholder="e.g., 1,000.00"
                    error={shouldShowError}
                    helperText={shouldShowError ? error?.message : ''}
                    InputLabelProps={{
                      sx: labelSx,
                      shrink: Boolean(field.value),
                    }}
                    InputProps={{ sx: valueSx }}
                    sx={commonFieldStyles}
                  />
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="closureData.totalPayment"
              control={control}
              rules={{
                required: 'Total Disbursed Payments is required',
                pattern: {
                  value: /^[0-9.,\s]+$/,
                  message: 'Must contain only numbers, decimals, and commas',
                },
                maxLength: {
                  value: 20,
                  message: 'Maximum 20 characters allowed',
                },
              }}
              render={({ field, fieldState: { error, isTouched } }) => {
                // Show validation error if field has been touched OR if there's an error (for form submission)
                const shouldShowError = (isTouched || !!error) && !!error
                return (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    required
                    label={getLabel(
                      'CDL_BPA_TOTAL_DIS_PMT',
                      language,
                      'Total Disbursed Payments'
                    )}
                    placeholder="e.g., 1,000.00"
                    error={shouldShowError}
                    helperText={shouldShowError ? error?.message : ''}
                    InputLabelProps={{
                      sx: labelSx,
                      shrink: Boolean(field.value),
                    }}
                    InputProps={{ sx: valueSx }}
                    sx={commonFieldStyles}
                  />
                )
              }}
            />
          </Grid>
        </Grid>

        {/* <Box mt={6}>
          <DocumentUploadFactory
            type="BUILD_PARTNER_ASSET"
            entityId={projectId}
            isOptional={true}
            formFieldName="projectClosureDocuments"
          />
        </Box> */}
      </CardContent>
    </Card>
  )
}

export default Step7
