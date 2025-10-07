import { useCallback } from 'react'
import { processStepData } from '../utils'
import { ProcessingOptions } from '../types'


export const useStepDataProcessing = () => {
  const processStepDataForForm = useCallback((options: ProcessingOptions) => {
    const { activeStep, stepStatus } = options
    return processStepData(activeStep, stepStatus)
  }, [])

  const shouldProcessStepData = useCallback((stepStatus: any, developerId?: string, shouldResetForm?: boolean) => {
    return !!(stepStatus && developerId && shouldResetForm)
  }, [])

  return {
    processStepDataForForm,
    shouldProcessStepData,
  }
}
