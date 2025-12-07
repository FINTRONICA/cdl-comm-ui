'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Theme,
  alpha,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { cardStyles } from '../styles'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo)

    if (process.env.NODE_ENV === 'development') {
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange && resetKeys) {
        this.resetErrorBoundary()
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      })
    }, 0)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI - we need to access theme here
      // Since this is a class component, we'll use a render prop pattern or inline styles
      return (
        <Card
          sx={(theme: Theme) => [
            cardStyles(theme),
            {
              color: theme.palette.mode === 'dark' 
                ? theme.palette.text.primary 
                : theme.palette.text.primary,
            },
          ]}
        >
          <CardContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Something went wrong</AlertTitle>
              An unexpected error occurred in the form component.
            </Alert>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box mb={2}>
                <Typography variant="h6" color="error" gutterBottom>
                  Error Details:
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={(theme: Theme) => ({
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha('#000000', 0.3) 
                      : '#f5f5f5',
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.text.primary 
                      : theme.palette.text.primary,
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '12px',
                  })}
                >
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Box mb={2}>
                <Typography variant="h6" color="error" gutterBottom>
                  Component Stack:
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={(theme: Theme) => ({
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha('#000000', 0.3) 
                      : '#f5f5f5',
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.text.primary 
                      : theme.palette.text.primary,
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '12px',
                  })}
                >
                  {this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}

            <Box display="flex" gap={2}>
              <Button
                onClick={this.resetErrorBoundary}
                startIcon={<RefreshIcon />}
                variant="contained"
                color="primary"
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outlined"
              >
                Reload Page
              </Button>
            </Box>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to trigger error boundary
export const useErrorHandler = () => {
  const throwError = (error: Error) => {
    throw error
  }

  return { throwError }
}

// Higher-order component for easier error boundary wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
