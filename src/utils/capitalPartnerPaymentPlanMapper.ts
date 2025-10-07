import { PaymentPlanData } from '../components/organisms/InvestorStepper/investorsTypes'

// Interface for Step3 form data
export interface Step3FormData {
  paymentPlan: PaymentPlanData[]
  installmentDates: { [key: string]: any } // Dynamic installment dates
}

/**
 * Maps Step3 payment plan data to Capital Partner Payment Plan API payload
 * Only includes the 3 UI fields: cpppInstallmentNumber, cpppInstallmentDate, cpppBookingAmount
 */
export function mapStep3ToCapitalPartnerPaymentPlanPayload(
  formData: Step3FormData,
  capitalPartnerId: number // ID from Step1 response
): any[] {
  // Format the installment date to ISO string if it exists
  const formatInstallmentDate = (date: any): string | undefined => {
    if (!date) return undefined
    try {
      // If it's a Dayjs object
      if (date && typeof date.format === 'function') {
        // Use startOf('day') to avoid timezone issues and get the exact date selected
        return date.startOf('day').toISOString()
      }
      // If it's already a string
      if (typeof date === 'string') {
        const parsedDate = new Date(date)
        // Set to start of day to avoid timezone issues
        parsedDate.setHours(0, 0, 0, 0)
        return parsedDate.toISOString()
      }
      // If it's a Date object
      if (date instanceof Date) {
        // Set to start of day to avoid timezone issues
        const newDate = new Date(date)
        newDate.setHours(0, 0, 0, 0)
        return newDate.toISOString()
      }
    } catch (error) {
      console.warn('Error formatting installment date:', error)
    }
    return undefined
  }

  // Map each payment plan item to API payload with only the 3 UI fields
  const paymentPlans = formData.paymentPlan.map((plan, index) => {
    const payload: any = {}

    // 1. cpppInstallmentNumber - Installment Number from UI
    if (plan.installmentNumber) {
      payload.cpppInstallmentNumber = plan.installmentNumber
    }

    // 2. cpppInstallmentDate - Installment Date from UI
    const installmentDateKey = `installmentDate${index}`
    const installmentDate = formData.installmentDates[installmentDateKey]
    if (installmentDate) {
      payload.cpppInstallmentDate = formatInstallmentDate(installmentDate)
    }

    // 3. cpppBookingAmount - Booking Amount from UI (stored in projectCompletionPercentage field)
    if (plan.projectCompletionPercentage) {
      payload.cpppBookingAmount = parseFloat(plan.projectCompletionPercentage)
    }

    // Add the capital partner reference with the ID from Step1 response
    payload.capitalPartnerDTO = {
      id: capitalPartnerId,
    }

    // Add required defaults
    payload.deleted = false

    return payload
  })

  return paymentPlans
}

/**
 * Validates Step3 form data before mapping
 */
export function validateStep3Data(formData: Step3FormData): string[] {
  const errors: string[] = []

  if (!formData.paymentPlan || formData.paymentPlan.length === 0) {
    errors.push('At least one payment plan is required')
  }

  formData.paymentPlan.forEach((plan, index) => {
    if (!plan.installmentNumber) {
      errors.push(
        `Installment number is required for payment plan ${index + 1}`
      )
    }

    if (!plan.projectCompletionPercentage) {
      errors.push(`Booking amount is required for payment plan ${index + 1}`)
    }

    // Check if installment date exists
    const installmentDateKey = `installmentDate${index}`
    if (!formData.installmentDates[installmentDateKey]) {
      errors.push(`Installment date is required for payment plan ${index + 1}`)
    }
  })

  return errors
}
