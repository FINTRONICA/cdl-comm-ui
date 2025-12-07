import React from 'react'
import { Typography } from '@mui/material'

interface FormErrorProps {
  error?: string
  touched?: boolean
  className?: string | undefined
}

export const FormError: React.FC<FormErrorProps> = ({ 
  error, 
  touched, 
  className 
}) => {
  if (!error || !touched) return null
  
  return (
    <Typography 
      variant="caption" 
      color="error" 
      sx={{ 
        mt: 0.5, 
        display: 'block',
        fontSize: '0.75rem',
        lineHeight: 1.2,
      }}
      className={className}
    >
      {error}
    </Typography>
  )
}
