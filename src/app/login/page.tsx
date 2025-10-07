'use client'

import { useState, useEffect } from 'react'
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
import { Visibility, VisibilityOff, Language } from '@mui/icons-material'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import Image from 'next/image'
import { useLoginWithLoader } from '@/hooks/useAuthQuery'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [language, setLanguage] = useState('en')

  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  )
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: true,
  })

  const {
    login,
    isLoading,
    isLoginLoading,
    isApiLoading,
    apiProgress,
    loadingStatus,
    error,
  } = useLoginWithLoader()

  useEffect(() => {
    const token =
      localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    if (token) {
      router.replace('/dashboard')
    }
  }, [router])

  const handleLanguageChange = (event: any) => {
    setLanguage(event.target.value)
  }

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }))
    }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      rememberMe: event.target.checked,
    }))
  }

  const handleLogin = async () => {
    try {
      const result = await login({
        username: formData.username,
        password: formData.password,
      })

      if (result.token || result.access_token) {
        router.push(redirectTo)
      }
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
              <Image src="/Logo.png" alt="logo" width={100} height={40} />
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
                    IconComponent={KeyboardArrowDownIcon}
                    inputProps={{ 'aria-label': 'Language' }}
                    startAdornment={
                      <InputAdornment position="start">
                        <Language sx={{ color: '#2F80ED', fontSize: 20 }} />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: '8px',
                      border: '2px solid #90CAF9',
                      backgroundColor: 'transparent',
                      color: '#2F80ED',
                      pl: 0.5,
                      fontWeight: 500,
                      fontSize: '14px',
                      height: '36px',
                      '& .MuiSelect-icon': {
                        color: '#2F80ED',
                        right: 8,
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
                      return selected === 'en' ? 'English' : 'Español'
                    }}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Español</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <div style={{ marginTop: 8 }}>
              Welcome back, please login to access your personal account
            </div>

            {/* Error/Success Messages */}
            {Boolean(error) && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {String((error as any)?.message || 'Login failed')}
              </Alert>
            )}

            {/* Form */}
            <Box mt={3} onKeyPress={handleKeyPress}>
              <TextField
                fullWidth
                placeholder="Enter your username"
                label="Username"
                type="text"
                value={formData.username}
                onChange={handleInputChange('username')}
                disabled={isLoading}
                InputLabelProps={{ sx: labelSx }}
                InputProps={{ sx: valueSx }}
                sx={[commonFieldStyles, { mb: 2 }]}
              />

              <TextField
                fullWidth
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={formData.password}
                onChange={handleInputChange('password')}
                disabled={isLoading}
                InputLabelProps={{ sx: labelSx }}
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

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={formData.rememberMe}
                      onChange={handleCheckboxChange}
                      disabled={isLoading}
                    />
                  }
                  label="Remember me"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontFamily: 'Outfit',
                      fontSize: '14px',
                      color: '#1E2939',
                    },
                  }}
                />
                <Button
                  variant="text"
                  sx={{
                    fontSize: '14px',
                    fontFamily: 'Outfit',
                    textTransform: 'none',
                  }}
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  Forgot Password
                </Button>
              </Box>

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
                      : `Loading data... (${apiProgress.completed}/${apiProgress.total})`}
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
                    {loadingStatus || 'Loading application data...'}
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
          color="text.secondary"
        >
          © 2025, Powered by <strong>Fintronika®</strong>
        </Typography>
      </Grid>
    </Grid>
  )
}
