'use client'

import React from 'react'
import { Card, CardContent, Grid, TextField } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { commonFieldStyles, labelSx, valueSx, cardStyles } from '../styles'

interface Step7Props {
  projectId?: string
  isViewMode?: boolean
}

const Step7: React.FC<Step7Props> = ({ isViewMode = false }) => {
  const { control } = useFormContext()

  return (
    <Card sx={cardStyles}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="closureData.totalIncomeFund"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  disabled={isViewMode}
                  label="Total Income Fund"
                  InputLabelProps={{ sx: labelSx }}
                  InputProps={{ sx: valueSx }}
                  sx={commonFieldStyles}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="closureData.totalPayment"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  disabled={isViewMode}
                  label="Total Payment"
                  InputLabelProps={{ sx: labelSx }}
                  InputProps={{ sx: valueSx }}
                  sx={commonFieldStyles}
                />
              )}
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
