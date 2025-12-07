'use client'

import React from 'react'
import DocumentUploadFactory from '../../../../DocumentUpload/DocumentUploadFactory'

interface Step2Props {
  paymentBeneficiaryId?: string | undefined
  isReadOnly?: boolean
}

const Step2 = ({ paymentBeneficiaryId, isReadOnly = false }: Step2Props) => {
  return (
    <DocumentUploadFactory
      type="PAYMENT_BENEFICIARY"
      entityId={paymentBeneficiaryId || ''}
      isOptional={true}
      isReadOnly={isReadOnly}
      formFieldName="documents"
    />
  )
}

export default Step2

