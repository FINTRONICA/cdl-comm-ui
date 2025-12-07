'use client'

import React from 'react'
import Step1 from '../../ManualPaymentStepper/steps/Step1'
import { fundEgressService, FundEgressData } from '@/services/api/fundEgressService'

interface TasStep1Props {
  savedId?: string | null
  fundEgressData?: FundEgressData | null
  loading?: boolean
  isEditMode?: boolean
}

/**
 * TasStep1 component - Same as ManualPaymentStep1 but always in view mode (all fields disabled)
 * This component wraps ManualPaymentStep1 and ensures all fields are read-only
 */
const TasStep1 = ({ savedId, fundEgressData, loading, isEditMode }: TasStep1Props) => {
    return (
    <Step1
      savedId={savedId}
      isEditMode={isEditMode}
      isReadOnly={true} // Always read-only for TAS view mode
      onDataLoaded={() => {
        // Optional callback if needed
      }}
    />
  )
}

export default TasStep1
