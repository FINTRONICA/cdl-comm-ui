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
  useTheme,
} from '@mui/material'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { groupService } from '@/services/api/groupService'
import { useGroupManagementLabelApi } from '@/hooks/useGroupManagementLabelApi'
import { getGroupManagementLabel } from '@/constants/mappings/groupManagementMapping'
import { useAppStore } from '@/store'
import { alpha } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from './panelTheme'

interface GroupData {
  id?: string
  name: string
  description?: string
}

interface RightSlideGroupPanelProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (groupName: string, groupData?: GroupData) => void
  mode?: 'add' | 'edit' | 'view'
  userData?: GroupData | undefined
  onSuccess?: (group: any) => void
  onError?: (error: string) => void
  onSwitchToEdit?: () => void
}

export const RightSlideGroupPanel: React.FC<RightSlideGroupPanelProps> = ({
  isOpen,
  onClose,
  onSave,
  mode = 'add',
  userData,
  onSuccess,
  onError,
  onSwitchToEdit,
}) => {
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedDescription, setSelectedDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get current language from store
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  // Group Management Label API
  const { getLabel: getLabelFromApi } = useGroupManagementLabelApi()

  // Dynamic label function
  const getGroupLabelDynamic = React.useCallback(
    (configId: string): string => {
      const apiLabel = getLabelFromApi(configId, currentLanguage)

      if (apiLabel !== configId) {
        return apiLabel
      }

      const fallbackLabel = getGroupManagementLabel(configId)
      return fallbackLabel
    },
    [getLabelFromApi, currentLanguage]
  )

  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && userData) {
      setSelectedGroup(userData.name)
      // Convert 'N/A' to empty string for description
      setSelectedDescription(
        userData.description && userData.description !== 'N/A'
          ? userData.description
          : ''
      )
    } else {
      setSelectedGroup('')
      setSelectedDescription('')
    }
    setError(null) // Clear error when panel opens
  }, [mode, userData, isOpen])

  const handleSave = async () => {
    if (!selectedGroup.trim()) {
      setError(getGroupLabelDynamic('CDL_GROUP_NAME_HELPER'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (mode === 'edit' && userData) {
        // Update existing group
        const updatedGroup = await groupService.updateGroup(userData.id!, {
          name: selectedGroup.trim(),
          description: selectedDescription.trim() || '',
        })

        onSuccess?.(updatedGroup)
        onSave?.(selectedGroup, userData)
        onClose()
        setSelectedGroup('')
        setSelectedDescription('')
      } else {
        // Create new group - let parent handle the API call
        onSave?.(selectedGroup, {
          name: selectedGroup,
          description: selectedDescription,
        })
        onClose()
        setSelectedGroup('')
        setSelectedDescription('')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save group'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Common styles for form components
  const commonFieldStyles = React.useMemo(() => tokens.input, [tokens])
  const errorFieldStyles = React.useMemo(() => tokens.inputError, [tokens])
  const labelSx = tokens.label
  const valueSx = tokens.value

  const multilineFieldStyles = React.useMemo(
    () => ({
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        backgroundColor:
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.default, 0.9)
            : theme.palette.background.paper,
        '& fieldset': {
          borderColor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.grey[600], 0.7)
              : '#CAD5E2',
          borderWidth: '1px',
        },
        '&:hover fieldset': {
          borderColor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.grey[300], 0.8)
              : '#94A3B8',
        },
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.primary.main,
        },
      },
      '& .MuiInputBase-input': {
        color: theme.palette.text.primary,
      },
    }),
    [theme]
  )

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
          overflow: 'hidden',
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
          flexShrink: 0,
          borderBottom: `1px solid ${tokens.dividerColor}`,
          backgroundColor: tokens.paper.backgroundColor,
          color: theme.palette.text.primary,
          zIndex: 11,
          px: 3,
          py: 2,
        }}
      >
        {mode === 'edit'
          ? getGroupLabelDynamic('CDL_EDIT_GROUP')
          : mode === 'view'
            ? getGroupLabelDynamic('CDL_GROUP_VIEW_ONLY')
            : getGroupLabelDynamic('CDL_ADD_NEW_GROUP')}
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
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '20px',
          marginBottom: '80px',
          px: 3,
          pt: '16px',
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
          label={getGroupLabelDynamic('CDL_ACCESS_GRANT_NAME') + '*'}
          value={selectedGroup}
          onChange={(e) => {
            setSelectedGroup(e.target.value)
            if (error) setError(null) // Clear error when user starts typing
          }}
          disabled={loading || mode === 'view'}
          error={!!error}
          // helperText={
          //   error ||
          //   (mode === 'view'
          //     ? getGroupLabelDynamic('CDL_VIEW_ONLY')
          //     : undefined)
          // }
          variant="outlined"
          sx={{
            ...(error ? errorFieldStyles : commonFieldStyles),
            mb: 3,
          }}
          InputLabelProps={{ sx: labelSx }}
          InputProps={{ sx: valueSx }}
        />

        <TextField
          fullWidth
          label={getGroupLabelDynamic('CDL_ACCESS_GRANT_DESC')}
          value={selectedDescription}
          onChange={(e) => {
            setSelectedDescription(e.target.value)
            if (error) setError(null) // Clear error when user starts typing
          }}
          disabled={loading || mode === 'view'}
          multiline
          rows={3}
          // helperText={
          //   mode === 'view' ? getGroupLabelDynamic('CDL_VIEW_ONLY') : undefined
          // }
          variant="outlined"
          sx={multilineFieldStyles}
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
          backdropFilter: 'blur(10px)',
          zIndex: 10,
        }}
      >
        {mode === 'view' && onSwitchToEdit ? (
          <Button
            fullWidth
            variant="outlined"
            onClick={onSwitchToEdit}
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '0.01em',
              borderRadius: '8px',
              borderWidth: '1px',
              borderColor: theme.palette.mode === 'dark' 
                ? theme.palette.primary.main 
                : tokens.dividerColor,
              color: theme.palette.text.secondary,
              textTransform: 'none',
              height: '44px',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.action.hover, 0.1)
                    : alpha(theme.palette.action.hover, 0.05),
              },
            }}
          >
            {getGroupLabelDynamic('CDL_EDIT')}
          </Button>
        ) : mode !== 'view' ? (
          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={loading || !selectedGroup.trim()}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '0.01em',
              borderRadius: '8px',
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              textTransform: 'none',
              height: '44px',
              boxShadow: 'none',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: theme.palette.mode === 'dark' 
                ? theme.palette.primary.main 
                : 'transparent',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                borderColor: theme.palette.mode === 'dark' 
                  ? theme.palette.primary.main 
                  : 'transparent',
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              },
              '&:disabled': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.grey[600], 0.5)
                    : theme.palette.grey[300],
                color: theme.palette.text.disabled,
              },
            }}
          >
            {loading
              ? mode === 'edit'
                ? getGroupLabelDynamic('CDL_SAVING')
                : getGroupLabelDynamic('CDL_CREATING')
              : mode === 'edit'
                ? getGroupLabelDynamic('CDL_SAVE')
                : getGroupLabelDynamic('CDL_ADD_NEW_GROUP')}
          </Button>
        ) : null}
      </Box>
    </Drawer>
  )
}
