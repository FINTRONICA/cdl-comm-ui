// Utility functions for the application

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { JWTParser } from '@/utils/jwtParser';
import { JWTPayload } from '@/types/auth';

// Status utilities
export * from './statusUtils'

dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(utc)

/**
 * Combines class names with Tailwind CSS class merging
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Formats a date using dayjs
 */
export function formatDate(
  date: string | Date,
  format: string = 'MMM dd, yyyy'
): string {
  return dayjs(date).format(format)
}

/**
 * Formats a date for input fields
 */
export function formatDateForInput(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * Formats a date for Java ZonedDateTime (ISO 8601 with timezone)
 */
export function formatDateForZonedDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DDTHH:mm:ssZ')
}

/**
 * Formats a date for Java ZonedDateTime with specific timezone
 */
export function formatDateForZonedDateTimeWithTimezone(date: string | Date, timezone: string = 'Asia/Kolkata'): string {
  return dayjs(date).tz(timezone).format('YYYY-MM-DDTHH:mm:ssZ')
}

/**
 * Converts date picker format (YYYY-MM-DD) to Java ZonedDateTime format
 * This function takes a date string from date picker and adds time and timezone
 */
export function convertDatePickerToZonedDateTime(dateString: string, time: string = '00:00:00'): string {
  if (!dateString) return '';
  
  // If already in ISO format, return as is
  if (dateString.includes('T')) {
    return dateString;
  }
  
  // Convert YYYY-MM-DD to YYYY-MM-DDTHH:mm:ssZ
  const dateTimeString = `${dateString}T${time}`;
  return dayjs(dateTimeString).format('YYYY-MM-DDTHH:mm:ssZ');
}

/**
 * Gets relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow()
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Debounces a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttles a function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}


/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Converts a string to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Formats file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * Removes undefined values from an object
 */
export function removeUndefined<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key]
    }
  }
  return result
}

/**
 * Gets initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Converts a string to slug
 */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Checks if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Formats a phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  return phone
}

/**
 * Generates a color based on a string
 */
export function generateColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = hash % 360
  return `hsl(${hue}, 70%, 50%)`
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry function for async operations
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await sleep(delay)
      return retry(fn, retries - 1, delay * 2)
    }
    throw error
  }
}

/**
 * Formats a date string to display date and time on separate lines
 * @param dateString - Date string in format like "3 June 2025 19:45 PM"
 * @returns Object with date and time separated
 */
export const formatDateForDisplay = (dateString: string) => {
  if (!dateString) return { date: '', time: '' }
  
  // Split the date string into parts
  const parts = dateString.split(' ')
  
  if (parts.length >= 4) {
    // Format: "3 June 2025 19:45 PM"
    const datePart = parts.slice(0, 3).join(' ') // "3 June 2025"
    const timePart = parts.slice(3).join(' ') // "19:45 PM"
    return { date: datePart, time: timePart }
  } else if (parts.length === 3) {
    // Format: "3 June 2025 19:45" (without AM/PM)
    const datePart = parts.slice(0, 2).join(' ') // "3 June"
    const timePart = parts[2] // "2025 19:45"
    return { date: datePart, time: timePart }
  }
  
  // Fallback: return as is
  return { date: dateString, time: '' }
}

// JWT Utilities
export { JWTParser } from '@/utils/jwtParser';

/**
 * Utility function to decode JWT token from storage
 * @returns Decoded JWT payload or null if not found/invalid
 */
export const decodeStoredJWT = (): JWTPayload | null => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (!token) return null;
  
  const parsed = JWTParser.parseToken(token);
  return parsed ? parsed.payload : null;
};

/**
 * Utility function to get current user info from JWT
 * @returns User info from JWT or null if not found/invalid
 */
export const getCurrentUserFromJWT = (): { name: any; email: any; role: string; issuedAt: Date; expiresAt: Date } | null => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (!token) return null;
  
  const userInfo = JWTParser.extractUserInfo(token);
  return userInfo;
};

/**
 * Utility function to check if current JWT is expired
 * @returns True if expired or invalid, false otherwise
 */
export const isCurrentJWTExpired = (): boolean => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (!token) return true;
  
  return JWTParser.isExpired(token);
};

/**
 * Utility function to check if current JWT is expiring soon
 * @param minutes - Minutes before expiration to consider "soon" (default: 5)
 * @returns True if expiring soon, false otherwise
 */
export const isCurrentJWTExpiringSoon = (minutes: number = 5): boolean => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (!token) return true;
  
  return JWTParser.isExpiringSoon(token, minutes);
};


export function generateId(prefix: string = 'DEV'): string {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') + '-' +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');

  const randomPart = Math.random().toString(36).substr(2, 5).toUpperCase();

  return `${prefix}-${timestamp}-${randomPart}`;
}

// Backward compatibility functions
export function generateDeveloperId(): string {
  return generateId('DEV');
}

export function generateReaId(): string {
  return generateId('REA');
}
