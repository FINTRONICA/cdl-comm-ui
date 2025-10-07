import Cookies from 'js-cookie'

const AUTH_TOKEN = 'auth_token'
const USER_TYPE = 'user_type'
const USER_NAME = 'user_name'
const USER_ID = 'user_id'


const DEFAULT_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const
}

export const setAuthCookies = (token: string, userType: string, userName: string, userId: string, days: number = 7) => {
  try {
    Cookies.set(AUTH_TOKEN, token, { ...DEFAULT_OPTIONS, expires: days })
    Cookies.set(USER_TYPE, userType, { ...DEFAULT_OPTIONS, expires: days })
    Cookies.set(USER_NAME, userName, { ...DEFAULT_OPTIONS, expires: days })
    Cookies.set(USER_ID, userId, { ...DEFAULT_OPTIONS, expires: days })
  } catch (error) {
    console.error('Error setting auth cookies:', error)
  }
}


export const getAuthCookies = () => {
  try {
    return {
      token: Cookies.get(AUTH_TOKEN) || null,
      userType: Cookies.get(USER_TYPE) || null,
      userName: Cookies.get(USER_NAME) || null,
      userId: Cookies.get(USER_ID) || null
    }
  } catch (error) {
    console.error('Error getting auth cookies:', error)
    return { token: null, userType: null, userName: null, userId: null }
  }
}


export const clearAuthCookies = () => {
  try {
    Cookies.remove(AUTH_TOKEN)
    Cookies.remove(USER_TYPE)
    Cookies.remove(USER_NAME)
    Cookies.remove(USER_ID)
  } catch (error) {
    console.error('Error clearing auth cookies:', error)
  }
}


export const setCookie = (name: string, value: string, days: number = 7) => {
  try {
    Cookies.set(name, value, { ...DEFAULT_OPTIONS, expires: days })
  } catch (error) {
    console.error(`Error setting cookie ${name}:`, error)
  }
}


export const getCookie = (name: string): string | null => {
  try {
    return Cookies.get(name) || null
  } catch (error) {
    console.error(`Error getting cookie ${name}:`, error)
    return null
  }
}


export const removeCookie = (name: string) => {
  try {
    Cookies.remove(name)
  } catch (error) {
    console.error(`Error removing cookie ${name}:`, error)
  }
}
