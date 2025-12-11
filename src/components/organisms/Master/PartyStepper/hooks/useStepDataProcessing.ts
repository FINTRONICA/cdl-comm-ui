import { useCallback } from 'react'
import { processStepData } from '../utils'
import { ProcessingOptions } from '../types'


export const useStepDataProcessing = () => {
  const processStepDataForForm = useCallback((options: ProcessingOptions) => {
    const { activeStep, stepStatus } = options
    return processStepData(activeStep, stepStatus)
  }, [])

  const shouldProcessStepData = useCallback((stepStatus: any, partyId?: string, shouldResetForm?: boolean) => {
    // Process step data when (matching DeveloperStepper pattern):
    // 1. stepStatus exists (data is loaded)
    // 2. partyId exists (editing existing party) OR stepStatus has stepData (data available)
    // 3. shouldResetForm is true (form needs to be initialized/reset)
    return !!(stepStatus && stepStatus.stepData && (partyId || stepStatus.stepData) && shouldResetForm)
  }, [])

  return {
    processStepDataForForm,
    shouldProcessStepData,
  }
}
