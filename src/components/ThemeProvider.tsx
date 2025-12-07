'use client'

import React, { createContext, useContext, useMemo, useEffect } from 'react'
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { useAppStore } from '../store'
import { type Theme } from '@/types'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Use direct Zustand selectors to ensure proper reactivity
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)

  // Resolve 'system' theme to actual 'light' or 'dark'
  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      if (typeof window !== 'undefined') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        return isDark ? 'dark' : 'light'
      }
      return 'light'
    }
    return theme
  }, [theme])

  // Apply/remove dark class on HTML element
  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const shouldBeDark = resolvedTheme === 'dark'

    // Remove both classes first
    root.classList.remove('dark', 'light')

    if (shouldBeDark) {
      root.classList.add('dark')
    } else {
      root.classList.add('light')
    }
  }, [resolvedTheme])

  // Listen for system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement
      if (e.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Fallback for older browsers - addListener uses MediaQueryListEvent
      const legacyHandler = (e: MediaQueryListEvent) => {
        const root = document.documentElement
        if (e.matches) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
      mediaQuery.addListener(legacyHandler)
      return () => mediaQuery.removeListener(legacyHandler)
    }
  }, [theme])

  // Create Material-UI theme
  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: resolvedTheme === 'dark' ? 'dark' : 'light',
        primary: {
          main: '#2563EB',
        },
        secondary: {
          main: '#2F80ED',
        },
        background: {
          default: resolvedTheme === 'dark' ? '#111827' : '#ffffff',
          paper: resolvedTheme === 'dark' ? '#111827' : '#ffffff',
        },
        text: {
          primary: resolvedTheme === 'dark' ? '#ffffff' : '#1E2939',
          secondary: resolvedTheme === 'dark' ? '#b0b0b0' : '#6A7282',
        },
      },
      typography: {
        fontFamily: 'Outfit, Roboto, Helvetica, Arial, sans-serif',
        h1: {
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
        },
        h2: {
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
        },
        h3: {
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
        },
        h4: {
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
        },
        h5: {
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
        },
        h6: {
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
        },
        body1: {
          fontFamily: 'Outfit, sans-serif',
        },
        body2: {
          fontFamily: 'Outfit, sans-serif',
        },
        button: {
          fontFamily: 'Outfit, sans-serif',
          textTransform: 'none',
        },
      },
      components: {
        MuiTextField: {
          defaultProps: {
            variant: 'outlined',
          },
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                height: '46px',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: '#CAD5E2',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: '#CAD5E2',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563EB',
                },
                '&.Mui-error fieldset': {
                  borderColor: '#d32f2f',
                  borderWidth: '1px',
                },
                '&.Mui-error:hover fieldset': {
                  borderColor: '#d32f2f',
                  borderWidth: '1px',
                },
                '&.Mui-error.Mui-focused fieldset': {
                  borderColor: '#d32f2f',
                  borderWidth: '1px',
                },
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              borderRadius: '8px',
            },
            contained: {
              borderRadius: '24px',
              height: '48px',
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            root: {
              borderRadius: '8px',
              '& fieldset': {
                border: 'none',
              },
              '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d32f2f',
                borderWidth: '1px',
              },
              '&.Mui-error:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d32f2f',
                borderWidth: '1px',
              },
              '&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d32f2f',
                borderWidth: '1px',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#ffffff',
            },
          },
        },
        MuiCardContent: {
          styleOverrides: {
            root: {
              backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#ffffff',
            },
          },
        },
      },
    })
  }, [resolvedTheme])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [theme, setTheme, resolvedTheme]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
