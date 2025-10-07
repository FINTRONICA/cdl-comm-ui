'use client'

import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
} from '@mui/material'
import DocumentUploadFactory from '../../DocumentUpload/DocumentUploadFactory'
import { DocumentItem } from '../../DeveloperStepper/developerTypes'
import { useFormContext } from 'react-hook-form'
import { CustomerData } from '../customerTypes'

interface CustomerStep3Props {
  customerId?: string
  isReadOnly?: boolean
}

const CustomerStep3: React.FC<CustomerStep3Props> = ({ 
  customerId = '',
  isReadOnly: _isReadOnly = false
}) => {
  const { setValue } = useFormContext<CustomerData>()

  const handleDocumentsChange = (documents: DocumentItem[]) => {
    setValue('documents', documents)
  }

  return (
    <Card
      sx={{
        boxShadow: 'none',
        backgroundColor: '#FFFFFFBF',
        width: '84%',
        margin: '0 auto',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '24px',
              color: '#1E2939',
            }}
          >
            Document Upload (Optional)
          </Typography>
        </Box>
        <Divider sx={{ mb: 3, borderColor: '#E5E7EB' }} />

        <DocumentUploadFactory
          type="BUILD_PARTNER"
          entityId={customerId}
          isOptional={true}
          onDocumentsChange={handleDocumentsChange}
          formFieldName="documents"
        />
      </CardContent>
    </Card>
  )
}

export default CustomerStep3