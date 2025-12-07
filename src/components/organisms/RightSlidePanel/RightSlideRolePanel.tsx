import React, { useState, useEffect } from 'react'
import {
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  Button,
  Drawer,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { roleService } from '@/services/api/roleService'
import { useRoleManagementLabelApi } from '@/hooks/useRoleManagementLabelApi'
import { getRoleManagementLabel } from '@/constants/mappings/roleManagementMapping'
import { useAppStore } from '@/store'
import { buildPanelSurfaceTokens } from './panelTheme'
interface RoleData {
  id?: string
  name: string
}

interface RightSlideRolePanelProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (roleName: string, roleData?: RoleData) => void
  mode?: 'add' | 'edit' | 'view'
  userData?: RoleData | undefined
  onSuccess?: (role: any) => void
  onError?: (error: string) => void
  onSwitchToEdit?: () => void
}

export const RightSlideRolePanel: React.FC<RightSlideRolePanelProps> = ({
  isOpen,
  onClose,
  onSave,
  mode = 'add',
  userData,
  onSuccess,
  onError,
  onSwitchToEdit,
}) => {
  const [selectedRole, setSelectedRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])

  // Get current language from store
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  // Role Management Label API
  const { getLabel: getLabelFromApi } = useRoleManagementLabelApi()

  // Dynamic label function
  const getRoleLabelDynamic = React.useCallback(
    (configId: string): string => {
      const apiLabel = getLabelFromApi(configId, currentLanguage)

      if (apiLabel !== configId) {
        return apiLabel
      }

      const fallbackLabel = getRoleManagementLabel(configId)
      return fallbackLabel
    },
    [getLabelFromApi, currentLanguage]
  )

  // Common styles for form components
  const commonFieldStyles = React.useMemo(() => tokens.input, [tokens])

  const errorFieldStyles = React.useMemo(() => tokens.inputError, [tokens])

  const labelSx = tokens.label

  const valueSx = tokens.value

  const buttonBaseStyles = React.useMemo(
    () => ({
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 500,
      fontStyle: 'normal',
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '0.01em',
      borderRadius: '8px',
      textTransform: 'none' as const,
      height: '44px',
    }),
    []
  )

  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && userData) {
      setSelectedRole(userData.name)
    } else {
      setSelectedRole('')
    }
    setError(null) // Clear error when panel opens
  }, [mode, userData, isOpen])

  const handleSave = async () => {
    if (!selectedRole.trim()) {
      setError(`${getRoleLabelDynamic('CDL_ROLE_NAME')} is required`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (mode === 'edit' && userData) {
        // Update existing role
        const updatedRole = await roleService.updateRole(userData.name, {
          name: selectedRole.trim(),
        })

        onSuccess?.(updatedRole)
        onClose()
        setSelectedRole('')
      } else {
        // Create new role - let parent handle the API call
        onSave?.(selectedRole)
        onClose()
        setSelectedRole('')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save role'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          ...tokens.paper,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 500,
          fontStyle: 'normal',
          fontSize: '20px',
          lineHeight: '28px',
          letterSpacing: '0.15px',
          verticalAlign: 'middle',
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${tokens.dividerColor}`,
          backgroundColor: tokens.paper.backgroundColor as string,
          pr: 3,
          pl: 3,
        }}
      >
        {mode === 'edit'
          ? getRoleLabelDynamic('CDL_EDIT_ROLE')
          : mode === 'view'
            ? getRoleLabelDynamic('CDL_ROLE_VIEW_ONLY')
            : getRoleLabelDynamic('CDL_ADD_NEW_ROLE')}
        <IconButton
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <CancelOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: 0,
          pt: '16px',
          px: 3,
          borderColor: tokens.dividerColor,
          backgroundColor: tokens.paper.backgroundColor as string,
        }}
      >
        {error && (
          <Alert
            severity="error"
            variant="outlined"
            sx={{
              mb: 2,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(239, 68, 68, 0.08)'
                  : 'rgba(254, 226, 226, 0.4)',
              borderColor: alpha(theme.palette.error.main, 0.4),
              color: theme.palette.error.main,
            }}
          >
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label={getRoleLabelDynamic('CDL_ROLE_NAME')}
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value)
            if (error) setError(null) // Clear error when user starts typing
          }}
          disabled={loading || mode === 'view'}
          error={!!error}
          helperText={
            error ||
            (mode === 'view' ? getRoleLabelDynamic('CDL_VIEW_ONLY') : undefined)
          }
          sx={error ? errorFieldStyles : commonFieldStyles}
          InputLabelProps={{ sx: labelSx }}
          InputProps={{ sx: valueSx }}
        />
      </DialogContent>

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 2,
          display: 'flex',
          gap: 2,
          borderTop: `1px solid ${tokens.dividerColor}`,
          backgroundColor: alpha(
            theme.palette.background.paper,
            theme.palette.mode === 'dark' ? 0.92 : 0.9
          ),
        }}
      >
        {mode === 'view' && onSwitchToEdit ? (
          <Button
            fullWidth
            variant="outlined"
            onClick={onSwitchToEdit}
            sx={{
              ...buttonBaseStyles,
              borderWidth: '1px',
              borderColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.primary.main
                  : tokens.dividerColor,
              color: theme.palette.text.primary,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.default, 0.6)
                  : 'transparent',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            {getRoleLabelDynamic('CDL_EDIT')}
          </Button>
        ) : mode !== 'view' ? (
          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={loading || !selectedRole.trim()}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
            sx={{
              ...buttonBaseStyles,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.primary.main
                  : 'transparent',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                borderColor:
                  theme.palette.mode === 'dark'
                    ? theme.palette.primary.main
                    : 'transparent',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
              },
              '&:disabled': {
                backgroundColor: alpha(theme.palette.primary.main, 0.35),
                borderColor:
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.5)
                    : 'transparent',
                color: alpha(theme.palette.common.white, 0.7),
              },
            }}
          >
            {loading
              ? mode === 'edit'
                ? getRoleLabelDynamic('CDL_SAVING')
                : getRoleLabelDynamic('CDL_CREATING')
              : mode === 'edit'
                ? getRoleLabelDynamic('CDL_SAVE')
                : getRoleLabelDynamic('CDL_ADD_NEW_ROLE')}
          </Button>
        ) : null}
      </Box>
    </Drawer>
  )
}
