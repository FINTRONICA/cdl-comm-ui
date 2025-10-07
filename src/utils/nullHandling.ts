// Utility functions for handling null and undefined values

/**
 * Safely converts a value to a string, handling null/undefined.
 */
export const safeString = (value: any, fallback: string = ''): string => {
    if (value === null || value === undefined) return fallback
    return String(value)
  }
  
  /**
   * Safely converts any value to a number, handling null/undefined
   */
  export const safeNumber = (value: unknown, fallback: number = 0): number => {
    if (value === null || value === undefined) return fallback
    const num = Number(value)
    return isNaN(num) ? fallback : num
  }
  
  /**
   * Safely converts any value to a boolean, handling null/undefined
   */
  export const safeBoolean = (value: unknown, fallback: boolean = false): boolean => {
    if (value === null || value === undefined) return fallback
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') return value.toLowerCase() === 'true'
    return Boolean(value)
  }
  
  /**
   * Safely gets a property from an object, handling null/undefined
   */
  export const safeGet = (obj: any, path: string, fallback: any = null): any => {
    if (obj === null || obj === undefined) {
      return fallback
    }
    const parts = path.split('.')
    let current = obj
    for (let i = 0; i < parts.length; i++) {
      if (current === null || current === undefined) {
        return fallback
      }
      current = current[parts[i]]
    }
    return current ?? fallback
  }
  
  /**
   * Safely formats a status value for display
   */
  export const formatStatus = (value: any): string => {
    if (value === null || value === undefined) return 'Unknown'
    
    const str = String(value).toLowerCase()
    
    // Handle boolean values
    if (str === 'true') return 'Active'
    if (str === 'false') return 'Inactive'
    
    // Handle common status values
    switch (str) {
      case 'active':
      case 'approved':
      case 'enabled':
        return 'Active'
      case 'inactive':
      case 'rejected':
      case 'disabled':
        return 'Inactive'
      case 'pending':
      case 'in review':
        return 'Pending'
      case 'failed':
      case 'error':
        return 'Failed'
      default:
        return String(value)
    }
  }
  
  /**
   * Safely formats a boolean value for display
   */
  export const formatBoolean = (value: any): string => {
    if (value === null || value === undefined) return 'No'
    return safeBoolean(value) ? 'Yes' : 'No'
  }
  
  /**
   * Safely formats a date value for display
   */
  export const formatDate = (value: any): string => {
    if (value === null || value === undefined) return 'N/A'
    
    try {
      const date = new Date(value)
      if (isNaN(date.getTime())) return 'N/A'
      return date.toLocaleDateString()
    } catch {
      return 'N/A'
    }
  }
  
  /**
   * Safely formats a currency value for display
   */
  export const formatCurrency = (value: any, currency: string = 'USD'): string => {
    if (value === null || value === undefined) return 'N/A'
    
    const num = safeNumber(value)
    if (num === 0) return 'N/A'
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(num)
    } catch {
      return `${currency} ${num.toFixed(2)}`
    }
  }
  
  /**
   * Safely displays a value, showing "-" for null/undefined
   */
  export const displayValue = (value: any, fallback: string = '-'): string => {
    if (value === null || value === undefined || value === '') {
      return fallback
    }
    
    // Handle [object Object] case
    if (typeof value === 'object' && !Array.isArray(value)) {
      console.warn('displayValue received object:', value)
      return fallback
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return fallback
      // Check if array contains objects
      const hasObjects = value.some(item => typeof item === 'object' && item !== null)
      if (hasObjects) {
        console.warn('displayValue received array with objects:', value)
        return fallback
      }
      return value.join(', ')
    }
    
    const stringValue = String(value)
    
    // Check for [object Object] string
    if (stringValue === '[object Object]') {
      console.warn('displayValue received [object Object]:', value)
      return fallback
    }
    
    // Check for other object-like strings
    if (stringValue.includes('[object ') && stringValue.includes(']')) {
      console.warn('displayValue received object-like string:', value)
      return fallback
    }
    
    return stringValue
  }
  
  /**
   * Safely displays a value with custom null handling
   */
  export const displayValueWithCustomNull = (value: any, nullText: string = '-', undefinedText: string = '-'): string => {
    if (value === null) return nullText
    if (value === undefined) return undefinedText
    if (value === '') return '-'
    return String(value)
  }
  
  /**
   * Safely converts any value to a displayable string, handling all edge cases
   */
  export const safeDisplayValue = (value: any, fallback: string = '-'): string => {
    // Handle null/undefined/empty
    if (value === null || value === undefined || value === '') {
      return fallback
    }
    
    // Handle primitive types
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return fallback
      // Convert array items to strings, filtering out objects
      const stringItems = value
        .map(item => {
          if (item === null || item === undefined) return ''
          if (typeof item === 'object') return '[Object]'
          return String(item)
        })
        .filter(item => item !== '')
      return stringItems.length > 0 ? stringItems.join(', ') : fallback
    }
    
    // Handle objects
    if (typeof value === 'object') {
      // Try to extract meaningful data from common object patterns
      if (value.name) return String(value.name)
      if (value.title) return String(value.title)
      if (value.label) return String(value.label)
      if (value.id) return String(value.id)
      
      console.warn('safeDisplayValue received unhandled object:', value)
      return fallback
    }
    
    // Fallback to string conversion
    const stringValue = String(value)
    if (stringValue === '[object Object]' || stringValue.includes('[object ')) {
      console.warn('safeDisplayValue received object string:', value)
      return fallback
    }
    
    return stringValue
  }
  