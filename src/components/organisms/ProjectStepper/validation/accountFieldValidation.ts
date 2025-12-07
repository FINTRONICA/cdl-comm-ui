// Field validation rules for Account Details (Step 3) - Single source of truth
export const ACCOUNT_FIELD_VALIDATION_RULES = {
  // Trust Account Section (All Mandatory)
  trustAccountNumber: {
    required: true,
    maxLength: 15,
    pattern: /^\d+$/,
    message: 'Trust Account Number is mandatory (Numerical only, max 15 digits)'
  },
  trustAccountIban: {
    required: true,
    maxLength: 25,
    pattern: /^[A-Z]{2}\d+$/,
    message: 'Trust Account IBAN is mandatory (Standard IBAN format, max 25 characters)'
  },
  trustAccountOpenedDate: {
    required: true,
    readOnly: true,
    message: 'Date Trust Account Opened is mandatory (fetched from core banking)'
  },
  trustAccountTitle: {
    required: true,
    maxLength: 100,
    message: 'Trust Account Title is mandatory (fetched from core banking)'
  },

  // Retention Account Section (All Mandatory)
  retentionAccountNumber: {
    required: true,
    maxLength: 15,
    pattern: /^\d+$/,
    message: 'Retention Account Number is mandatory (Numerical only, max 15 digits)'
  },
  retentionAccountIban: {
    required: true,
    maxLength: 25,
    pattern: /^[A-Z]{2}\d+$/,
    message: 'Retention Account IBAN is mandatory (Standard IBAN format, max 25 characters)'
  },
  retentionAccountOpenedDate: {
    required: true,
    editable: true,
    message: 'Date Retention Account Opened is mandatory (editable)'
  },
  retentionAccountTitle: {
    required: true,
    maxLength: 100,
    message: 'Retention Account Title is mandatory (fetched from core banking)'
  },

  // Sub Construction Account Section (All Optional)
  subConstructionAccountNumber: {
    required: false,
    maxLength: 15,
    pattern: /^\d+$/,
    message: 'Sub Construction Account Number must be numerical (max 15 digits)'
  },
  subConstructionAccountIban: {
    required: false,
    maxLength: 25,
    pattern: /^[A-Z]{2}\d+$/,
    message: 'Sub Construction Account IBAN must follow standard IBAN format (max 25 characters)'
  },
  subConstructionAccountOpenedDate: {
    required: false,
    editable: true,
    message: 'Date Sub-construction Account Opened is optional (editable)'
  },
  subConstructionAccountTitle: {
    required: false,
    maxLength: 100,
    message: 'Sub Construction Account Title (fetched from core banking)'
  },

  // Corporate Account Section (All Optional)
  corporateAccountNumber: {
    required: false,
    maxLength: 15,
    pattern: /^\d+$/,
    message: 'Corporate Account Number must be numerical (max 15 digits)'
  },
  corporateAccountIban: {
    required: false,
    maxLength: 25,
    pattern: /^[A-Z]{2}\d+$/,
    message: 'Corporate Account IBAN must follow standard IBAN format (max 25 characters)'
  },
  corporateAccountOpenedDate: {
    required: false,
    editable: true,
    message: 'Date Corporate Account Opened is optional (editable)'
  },
  corporateAccountTitle: {
    required: false,
    maxLength: 100,
    message: 'Corporate Account Title (fetched from core banking)'
  },

  // Account Currency (Mandatory)
  accountCurrency: {
    required: true,
    maxLength: 10,
    message: 'Account Currency is mandatory (fetched from core banking)'
  }
}

// Validation function for individual fields
export const validateAccountField = (fieldName: string, value: any): string | null => {
  const rule = ACCOUNT_FIELD_VALIDATION_RULES[fieldName as keyof typeof ACCOUNT_FIELD_VALIDATION_RULES]
  if (!rule) return null

  // Required field validation
  if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'message' in rule ? rule.message : 'This field is required'
  }

  // Skip validation for empty optional fields
  if (!rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return null
  }

  // Max length validation
  if ('maxLength' in rule && rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
    const message = 'message' in rule ? rule.message : 'Maximum length exceeded'
    return `${message} (max ${rule.maxLength} characters)`
  }

  // Pattern validation
  if ('pattern' in rule && rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return 'message' in rule ? rule.message : 'Invalid format'
  }

  return null
}

// Validation function for conditional fields (account groups)
// If any field in an optional account group is filled, validate the whole group
export const validateAccountGroup = (
  groupName: 'subConstruction' | 'corporate',
  formData: any
): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (groupName === 'subConstruction') {
    const hasAnyValue = 
      formData.subConstructionAccountNumber || 
      formData.subConstructionAccountIban || 
      formData.subConstructionAccountOpenedDate ||
      formData.subConstructionAccountTitle

    if (hasAnyValue) {
      // If any field is filled, all fields in this group should be filled
      if (!formData.subConstructionAccountNumber) {
        errors.subConstructionAccountNumber = 'Sub Construction Account Number is required when account details are provided'
      }
      if (!formData.subConstructionAccountIban) {
        errors.subConstructionAccountIban = 'Sub Construction Account IBAN is required when account details are provided'
      }
      if (!formData.subConstructionAccountTitle) {
        errors.subConstructionAccountTitle = 'Sub Construction Account Title is required when account details are provided'
      }
    }
  }

  if (groupName === 'corporate') {
    const hasAnyValue = 
      formData.corporateAccountNumber || 
      formData.corporateAccountIban || 
      formData.corporateAccountOpenedDate ||
      formData.corporateAccountTitle

    if (hasAnyValue) {
      // If any field is filled, all fields in this group should be filled
      if (!formData.corporateAccountNumber) {
        errors.corporateAccountNumber = 'Corporate Account Number is required when account details are provided'
      }
      if (!formData.corporateAccountIban) {
        errors.corporateAccountIban = 'Corporate Account IBAN is required when account details are provided'
      }
      if (!formData.corporateAccountTitle) {
        errors.corporateAccountTitle = 'Corporate Account Title is required when account details are provided'
      }
    }
  }

  return errors
}

// Complete validation function for all account fields
export const validateAllAccountFields = (formData: any): Record<string, string> => {
  const errors: Record<string, string> = {}

  // Validate all individual fields
  Object.keys(ACCOUNT_FIELD_VALIDATION_RULES).forEach(fieldName => {
    const value = formData[fieldName]
    const fieldError = validateAccountField(fieldName, value)
    if (fieldError) {
      errors[fieldName] = fieldError
    }
  })

  // Validate account groups (if one field is filled, all in group are required)
  const subConstructionErrors = validateAccountGroup('subConstruction', formData)
  Object.assign(errors, subConstructionErrors)

  const corporateErrors = validateAccountGroup('corporate', formData)
  Object.assign(errors, corporateErrors)

  return errors
}

// Get validation rules for React Hook Form
export const getAccountFieldValidationRules = (fieldName: string) => {
  const rule = ACCOUNT_FIELD_VALIDATION_RULES[fieldName as keyof typeof ACCOUNT_FIELD_VALIDATION_RULES]
  if (!rule) return {}

  return {
    required: rule.required ? ('message' in rule ? rule.message : 'This field is required') : false,
    validate: (value: any) => {
      const error = validateAccountField(fieldName, value)
      return error || true
    }
  }
}

// Required fields list
export const REQUIRED_ACCOUNT_FIELDS = Object.keys(ACCOUNT_FIELD_VALIDATION_RULES).filter(
  fieldName => ACCOUNT_FIELD_VALIDATION_RULES[fieldName as keyof typeof ACCOUNT_FIELD_VALIDATION_RULES].required
)

// Optional fields list
export const OPTIONAL_ACCOUNT_FIELDS = Object.keys(ACCOUNT_FIELD_VALIDATION_RULES).filter(
  fieldName => !ACCOUNT_FIELD_VALIDATION_RULES[fieldName as keyof typeof ACCOUNT_FIELD_VALIDATION_RULES].required
)
