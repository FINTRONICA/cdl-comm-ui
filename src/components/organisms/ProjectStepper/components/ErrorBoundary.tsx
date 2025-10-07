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

      // Default error UI
      return (
        <Card sx={cardStyles}>
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
                  sx={{
                    backgroundColor: '#f5f5f5',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '12px',
                  }}
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
                  sx={{
                    backgroundColor: '#f5f5f5',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '12px',
                  }}
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
