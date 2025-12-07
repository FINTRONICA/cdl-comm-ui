import Cookies from 'js-cookie'
import { COOKIES } from '@/types/auth'


const DEFAULT_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const
}

export const setAuthCookies = (
  token: string,
  userType: string,
  userName: string,
  userId: string,
  refreshToken?: string,
  days: number = 7
) => {
  try {
    Cookies.set(COOKIES.AUTH_TOKEN, token, { ...DEFAULT_OPTIONS, expires: days })
    Cookies.set(COOKIES.USER_TYPE, userType, { ...DEFAULT_OPTIONS, expires: days })
    Cookies.set(COOKIES.USER_NAME, userName, { ...DEFAULT_OPTIONS, expires: days })
    Cookies.set(COOKIES.USER_ID, userId, { ...DEFAULT_OPTIONS, expires: days })
    if (refreshToken) {
      Cookies.set(COOKIES.REFRESH_TOKEN, refreshToken, { ...DEFAULT_OPTIONS, expires: days })
    }
  } catch (error) {
    console.error('Error setting auth cookies:', error)
  }
}


export const getAuthCookies = () => {
  try {
    return {
      token: Cookies.get(COOKIES.AUTH_TOKEN) || null,
      userType: Cookies.get(COOKIES.USER_TYPE) || null,
      userName: Cookies.get(COOKIES.USER_NAME) || null,
      userId: Cookies.get(COOKIES.USER_ID) || null,
      refreshToken: Cookies.get(COOKIES.REFRESH_TOKEN) || null
    }
  } catch (error) {
    console.error('Error getting auth cookies:', error)
    return { token: null, userType: null, userName: null, userId: null, refreshToken: null }
  }
}


export const clearAuthCookies = () => {
  try {
    Cookies.remove(COOKIES.AUTH_TOKEN)
    Cookies.remove(COOKIES.USER_TYPE)
    Cookies.remove(COOKIES.USER_NAME)
    Cookies.remove(COOKIES.USER_ID)
    Cookies.remove(COOKIES.REFRESH_TOKEN)
  } catch (error) {
    console.error('Error clearing auth cookies:', error)
  }
}

export const getRefreshTokenCookie = (): string | null => {
  try {
    return Cookies.get(COOKIES.REFRESH_TOKEN) || null
  } catch (error) {
    console.error('Error getting refresh token cookie:', error)
    return null
  }
}

export const setRefreshTokenCookie = (refreshToken: string, days: number = 7) => {
  try {
    Cookies.set(COOKIES.REFRESH_TOKEN, refreshToken, { ...DEFAULT_OPTIONS, expires: days })
  } catch (error) {
    console.error('Error setting refresh token cookie:', error)
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
