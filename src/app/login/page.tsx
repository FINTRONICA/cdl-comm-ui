'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import {
  Box,
  Grid,
  Typography,
  TextField,
  Checkbox,
  Button,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Divider,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Visibility, VisibilityOff, Language, ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import Image from 'next/image'
import { useLoginWithLoader } from '@/hooks/useAuthQuery'
import { UserSchemas } from '@/lib/validation/userSchemas'
import { getPublicAssetPath } from '@/utils/basePath'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [language, setLanguage] = useState('en')

  type LoginValues = z.infer<typeof UserSchemas.login> & { rememberMe: boolean }

  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  )
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const [formData, setFormData] = useState<LoginValues>({
    username: '',
    password: '',
    rememberMe: true,
  })

  const [fieldErrors, setFieldErrors] = useState<{username?: string; password?: string}>({})

  const {
    login,
    isLoading,
    isLoginLoading,
    isApiLoading,
    apiProgress,
    loadingStatus,
    error,
    errorMessage,
  } = useLoginWithLoader()

  // Check if user is already authenticated using cookies (not localStorage)
  useEffect(() => {
    // Import getAuthCookies dynamically to avoid SSR issues
    const checkAuth = async () => {
      const { getAuthCookies } = await import('@/utils/cookieUtils')
      const { token } = getAuthCookies()
      if (token) {
        router.replace('/dashboard')
      }
    }
    checkAuth()
  }, [router])

  const handleLanguageChange = (event: any) => {
    setLanguage(event.target.value)
  }

  const validateField = (name: 'username' | 'password', value: string) => {
    const partial = UserSchemas.login.pick({ [name]: true } as any)
    const result = partial.safeParse({ [name]: value })
    setFieldErrors(prev => ({ 
      ...prev, 
      [name]: result.success ? undefined : result.error.issues[0]?.message 
    }))
  }

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
      
      // Clear error for this field when user starts typing
      if (fieldErrors[field as keyof typeof fieldErrors]) {
        setFieldErrors(prev => ({ ...prev, [field]: undefined }))
      }
    }

  const handleFieldBlur = (field: 'username' | 'password') => (event: React.FocusEvent<HTMLInputElement>) => {
    validateField(field, event.target.value)
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      rememberMe: event.target.checked,
    }))
  }

  const handleLogin = async () => {
    try {
      // Validate form data with Zod
      const parsed = UserSchemas.login.safeParse({
        username: formData.username,
        password: formData.password,
      })
      
      if (!parsed.success) {
        const errs: Record<string, string> = {}
        parsed.error.issues.forEach(issue => {
          if (issue.path[0]) {
            errs[issue.path[0] as string] = issue.message
          }
        })
        setFieldErrors(errs)
        return
      }
      
      // Clear errors and proceed with login
      setFieldErrors({})
      await login(
        {
          username: formData.username,
          password: formData.password,
        },
        redirectTo // Pass redirect URL to login hook
      )
      // Navigation will happen automatically after all data is loaded
    } catch (error: unknown) {}
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) {
      handleLogin()
    }
  }

  const handleForgotPassword = () => {}

  const labelSx = {
    color: '#6A7282',
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '14px',
    letterSpacing: 0,
  }

  const valueSx = {
    color: '#1E2939',
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '16px',
    letterSpacing: 0,
    wordBreak: 'break-word',
  }

  const commonFieldStyles = {
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
  }

  return (
    <Grid
      container
      className="login-page-container"
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url("/login-back.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: { xs: 2, md: 10 },
      }}
    >
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid
          sx={{
            borderRadius: '24px',
            padding: '16px',
            background: '#FFFFFF80',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            boxShadow: 4,
            
          }}
        >
          <Paper
            elevation={3}
            sx={{
              pt: 2,
              pr: 4,
              pb: 4,
              pl: 4,
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {/* Header */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Image src={getPublicAssetPath('/Logo.png')} alt="logo" width={100} height={40} />
              <Divider orientation="vertical" flexItem />
              <Typography
                sx={{
                  fontFamily: 'Outfit',
                  fontWeight: 600,
                  fontSize: '28px',
                  lineHeight: '100%',
                  color: '#1E2939',
                }}
              >
                Login
              </Typography>
              <Box display="flex" alignItems="center">
                <FormControl fullWidth>
                  <Select
                    value={language}
                    onChange={handleLanguageChange}
                    displayEmpty
                    IconComponent={ExpandMoreIcon}
                    inputProps={{ 'aria-label': 'Language' }}
                    startAdornment={
                      <InputAdornment position="start">
                        <Language sx={{ color: '#2F80ED', fontSize: 20 }} />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: '8px',
                      border: '1px solid #90CAF9',
                      backgroundColor: 'transparent',
                      color: '#2F80ED',
                      pl: 0.5,
                      fontWeight: 500,
                      fontSize: '14px',
                      height: '36px',
                      '& .MuiSelect-icon': {
                        color: '#2F80ED',
                        right: 8,
                        fontSize: 20,
                        strokeWidth: 0.5,
                        '& path': {
                          strokeWidth: 0.5,
                        },
                      },
                      '& fieldset': {
                        border: 'none',
                      },
                    }}
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Typography sx={{ color: '#2F80ED' }}>
                            Language
                          </Typography>
                        )
                      }
                      return 'English'
                    }}
                  >
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography
                sx={{
                  // fontFamily: 'Outfit',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '16px',
                  lineHeight: '100%',
                  letterSpacing: 0,
                  color: '#6A7282',
                }}
              >
                 Welcome back, please login to access your personal account
              </Typography>
            </Box>

            {/* Error/Success Messages */}
            {(Boolean(errorMessage) || Boolean(error)) && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {errorMessage || String((error as any)?.message || 'Login failed')}
              </Alert>
            )}

            {/* Form */}
            <Box mt={5}  onKeyPress={handleKeyPress}>
              <TextField
                fullWidth
                placeholder="Enter your username"
                label="Username"
                type="text"
                value={formData.username}
                onChange={handleInputChange('username')}
                onBlur={handleFieldBlur('username')}
                disabled={isLoading}
                error={Boolean(fieldErrors.username)}
                helperText={fieldErrors.username || ' '}
                slotProps={{ inputLabel: { shrink: true, sx: labelSx } }}
                InputProps={{ sx: valueSx }}
                sx={[commonFieldStyles, { mb: 2 }]}
              />

              <TextField
                fullWidth
                placeholder="Enter password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={formData.password}
                onChange={handleInputChange('password')}
                onBlur={handleFieldBlur('password')}
                disabled={isLoading}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password || ' '}
                slotProps={{ inputLabel: { shrink: true, sx: labelSx } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#CAD5E2' }}
                        disabled={isLoading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: valueSx,
                }}
                sx={[commonFieldStyles, { mb: 2 }]}
              />

           

              <Button
                fullWidth
                variant="contained"
                disabled={isLoading}
                onClick={handleLogin}
                sx={{
                  textTransform: 'none',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '16px',
                  lineHeight: '20px',
                  letterSpacing: 0,
                  borderRadius: '24px',
                  height: '48px',
                  position: 'relative',
                  mt: 3,
                }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress
                      size={20}
                      sx={{ color: 'white', mr: 1 }}
                      variant={isApiLoading ? 'determinate' : 'indeterminate'}
                      {...(isApiLoading && {
                        value:
                          (apiProgress.completed / apiProgress.total) * 100,
                      })}
                    />
                    {isLoginLoading
                      ? 'Authenticating...'
                      : `Loading... (${apiProgress.completed}/${apiProgress.total})`}
                  </>
                ) : (
                  'Login'
                )}
              </Button>

              {/* Loading Progress Indicator */}
              {isApiLoading && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      textAlign: 'center',
                      color: '#6A7282',
                      fontSize: '14px',
                    }}
                  >
                    {loadingStatus || 'Loading...'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '100%' }}>
                      <div
                        style={{
                          width: '100%',
                          height: '4px',
                          backgroundColor: '#E5E7EB',
                          borderRadius: '2px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${(apiProgress.completed / apiProgress.total) * 100}%`,
                            height: '100%',
                            backgroundColor: '#2563EB',
                            transition: 'width 0.3s ease',
                            borderRadius: '2px',
                          }}
                        />
                      </div>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6A7282',
                        fontSize: '12px',
                        minWidth: 'fit-content',
                      }}
                    >
                      {apiProgress.completed}/{apiProgress.total}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Footer */}
        <Typography
          variant="caption"
          textAlign="center"
          display="block"
          mt={2}
          color="#364153"
          fontSize="14px"
        >
          © 2025, Powered by <strong>Fintronika®</strong>
        </Typography>
      </Grid>
    </Grid>
  )
}
