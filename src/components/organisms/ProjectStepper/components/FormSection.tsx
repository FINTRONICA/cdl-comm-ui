'use client'

import React from 'react'
import { Card, CardContent, Box, Typography, Alert } from '@mui/material'
import { cardStyles } from '../styles'

interface FormSectionProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  error?: string
  warning?: string
  info?: string
  loading?: boolean
  loadingMessage?: string
  sx?: any
}

export const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  subtitle,
  error,
  warning,
  info,
  loading = false,
  loadingMessage = 'Loading...',
  sx,
}) => {
  return (
    <Card sx={{ ...cardStyles, ...sx }}>
      <CardContent>
        {title && (
          <Typography
            variant="h6"
            gutterBottom
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
            {title}
          </Typography>
        )}

        {subtitle && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {warning && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {warning}
          </Alert>
        )}

        {info && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {info}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
            }}
          >
            <Typography>{loadingMessage}</Typography>
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
