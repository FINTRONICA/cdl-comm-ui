'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { useUI, useUIActions } from '../store'
import { type Theme } from '@/types'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useUI()
  const { setTheme } = useUIActions()

  // Create Material-UI theme
  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: theme === 'dark' ? 'dark' : 'light',
        primary: {
          main: '#2563EB',
        },
        secondary: {
          main: '#2F80ED',
        },
        background: {
          default: theme === 'dark' ? '#121212' : '#ffffff',
          paper: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        },
        text: {
          primary: theme === 'dark' ? '#ffffff' : '#1E2939',
          secondary: theme === 'dark' ? '#b0b0b0' : '#6A7282',
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
            },
          },
        },
      },
    })
  }, [theme])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme]
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
