'use client'

import React from 'react'
import DocumentUploadFactory from '../../../../DocumentUpload/DocumentUploadFactory'

interface Step2Props {
  paymentInstructionId?: string | undefined
  isReadOnly?: boolean
}

const Step2 = ({ paymentInstructionId, isReadOnly = false }: Step2Props) => {
  return (
    <DocumentUploadFactory
      type="PAYMENT_INSTRUCTION"
      entityId={paymentInstructionId || ''}
      isOptional={true}
      isReadOnly={isReadOnly}
      formFieldName="documents"
    />
  )
}

export default Step2

