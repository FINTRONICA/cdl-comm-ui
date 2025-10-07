'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Let middleware handle authentication - just redirect to dashboard
    // The middleware will redirect to login if not authenticated
    router.push('/dashboard')
  }, [router])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundImage: 'url("/login-back.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
      <Typography 
        variant="h6" 
        sx={{ 
          color: 'white', 
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 500 
        }}
      >
        Redirecting...
      </Typography>
    </Box>
  )
}

