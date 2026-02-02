export const sanitizeInput = (value: string): string => {
  return value.replace(/\s+/g, ' ').trim()
}

export const sanitizeOptionalInput = (value?: string | null): string => {
  return sanitizeInput(value ?? '')
}
