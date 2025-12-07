import React, { useState } from 'react'
import {
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Drawer,
  Box,
  Checkbox as MuiCheckbox,
  FormControlLabel,
  Switch,
  Typography,
  Alert,
  Snackbar,
  OutlinedInput,
} from '@mui/material'
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'

// imports for API integration
import {
  useCreateAuthAdminUser,
  useUserRolesAndGroups,
  useUpdateAuthAdminUser,
  useAllAvailableRoles,
  useAllAvailableGroups,
  useAssignRolesPermissions,
  useUnassignRolesPermissions,
} from '@/hooks/useAuthUser'
import { useAuthStore } from '@/store/authStore'
import { triggerPermissionRefresh } from '@/store/reactivePermissionsStore'
import { useUserManagementLabelApi } from '@/hooks/useUserManagementLabelApi'
import { getUserManagementLabel } from '@/constants/mappings/userManagementMapping'
import { useAppStore } from '@/store'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from './panelTheme'

interface RightSlideUserPanelProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'edit'
  userData?: {
    firstName: string
    lastName: string
    emailId: string
    status: string
    username: string
    userId: string
    selectedRoles: string[]
    rolePermissions: Record<string, Permission[]>
    roleEnabled: Record<string, boolean>
  } | null
}

// API-ready interfaces
interface Permission {
  id: string
  name: string
  description: string
  enabled: boolean
}

interface Role {
  id: string
  name: string
  permissions: Permission[]
}

interface UserFormData {
  firstName: string
  lastName: string
  emailId: string
  status: string
  username: string
  selectedRoles: string[]
  rolePermissions: Record<string, Permission[]>
  roleEnabled: Record<string, boolean>
}

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
]

function buildPayload({
  userId,
  roles,
  groups,
}: {
  userId: string
  roles?: string[]
  groups?: string[]
}) {
  const payload: any = { userId }

  if (roles && roles.length > 0) {
    payload.roles = roles
  }

  if (groups && groups.length > 0) {
    payload.groups = groups
  }

  return payload
}

export const RightSlideUserPanel: React.FC<RightSlideUserPanelProps> = ({
  isOpen,
  onClose,
  mode = 'add',
  userData,
}) => {
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  const createUser = useCreateAuthAdminUser()
  const updateUser = useUpdateAuthAdminUser()
  const [isEditMode, setIsEditMode] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Get current user info to check if we're editing our own permissions
  const { userId: currentUserId } = useAuthStore()

  // Hooks for assign/unassign
  const assignRolesPermissions = useAssignRolesPermissions()
  const unassignRolesPermissions = useUnassignRolesPermissions()

  // Fetch user roles and groups from API when in edit mode
  const { data: userRolesAndGroups, isLoading: isLoadingRoles } =
    useUserRolesAndGroups(
      mode === 'edit' && userData?.userId ? userData.userId : ''
    )

  // Fetch all available roles from API
  const { data: allAvailableRoles, isLoading: isLoadingAllRoles } =
    useAllAvailableRoles()

  // Fetch all available groups from API
  const { data: allAvailableGroups, isLoading: isLoadingAllGroups } =
    useAllAvailableGroups()

  // Get current language from store
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  // User Management Label API
  const {
    getLabel: getLabelFromApi,
    isLoading: labelsLoading,
    error: labelsError,
  } = useUserManagementLabelApi()

  // Dynamic label function
  const getUserLabelDynamic = React.useCallback(
    (configId: string): string => {
      const apiLabel = getLabelFromApi(configId, currentLanguage)

      if (apiLabel !== configId) {
        return apiLabel
      }

      const fallbackLabel = getUserManagementLabel(configId)
      return fallbackLabel
    },
    [getLabelFromApi, currentLanguage]
  )

  // Track selected roles for checkboxes (by name)
  const [selectedRoleNames, setSelectedRoleNames] = useState<string[]>([])

  // Track selected groups for switches
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])

  // Initialize selected roles when user data loads (by name)
  React.useEffect(() => {
    if (userRolesAndGroups?.roles) {
      setSelectedRoleNames(userRolesAndGroups.roles.map((role) => role.name))
    }
  }, [userRolesAndGroups])

  // Initialize selected groups when user data loads
  React.useEffect(() => {
    if (userRolesAndGroups?.groups) {
      setSelectedGroupIds(userRolesAndGroups.groups.map((group) => group.id))
    }
  }, [userRolesAndGroups])

  // Handle role checkbox change (by name)
  const handleRoleCheckboxChange = (roleName: string, checked: boolean) => {
    setSelectedRoleNames((prev) =>
      checked
        ? [...new Set([...prev, roleName])]
        : prev.filter((name) => name !== roleName)
    )

    if (userData?.userId) {
      const payload = {
        userId: userData.userId,
        roles: [roleName], // only roles, no groups here
      }

      const mutation = checked
        ? assignRolesPermissions
        : unassignRolesPermissions

      mutation.mutate(payload, {
        onSuccess: () => {
          setSuccessMessage(
            `Role ${roleName} ${checked ? 'assigned' : 'unassigned'} successfully`
          )

          // If we're updating the current user's permissions, refresh them
          if (userData.userId === currentUserId && currentUserId) {
            triggerPermissionRefresh(currentUserId).catch(console.error)
          }
        },
        onError: (error) => {
          console.error(
            ` [User Panel] Failed to ${checked ? 'assign' : 'unassign'} role:`,
            error
          )

          // Check if it's a JSON parsing error but the operation might have succeeded
          const errorMessage = error instanceof Error ? error.message : ''
          if (errorMessage.includes('Invalid JSON response')) {
            // Still try to refresh permissions as the operation might have succeeded
            if (userData.userId === currentUserId && currentUserId) {
              triggerPermissionRefresh(currentUserId).catch(console.error)
            }
          } else {
            // Revert the UI state only for actual failures
            setSelectedRoleNames((prev) =>
              checked
                ? prev.filter((name) => name !== roleName)
                : [...new Set([...prev, roleName])]
            )
          }
        },
      })
    }
  }

  // Handle group switch change
  const handleGroupCheckboxChange = (groupId: string, checked: boolean) => {
    setSelectedGroupIds((prev) =>
      checked
        ? [...new Set([...prev, groupId])]
        : prev.filter((id) => id !== groupId)
    )

    if (userData?.userId) {
      const payload = {
        userId: userData.userId,
        groups: [groupId], // only groups, no roles here
      }

      const mutation = checked
        ? assignRolesPermissions
        : unassignRolesPermissions

      mutation.mutate(payload, {
        onSuccess: () => {
          setSuccessMessage(
            `Group ${groupId} ${checked ? 'assigned' : 'unassigned'} successfully`
          )

          // If we're updating the current user's permissions, refresh them
          if (userData.userId === currentUserId && currentUserId) {
            triggerPermissionRefresh(currentUserId).catch(console.error)
          }
        },
        onError: (error) => {
          console.error(
            `❌ [User Panel] Failed to ${checked ? 'assign' : 'unassign'} group:`,
            error
          )

          // Check if it's a JSON parsing error but the operation might have succeeded
          const errorMessage = error instanceof Error ? error.message : ''
          if (errorMessage.includes('Invalid JSON response')) {
            // Still try to refresh permissions as the operation might have succeeded
            if (userData.userId === currentUserId && currentUserId) {
              triggerPermissionRefresh(currentUserId).catch(console.error)
            }
          } else {
            // Revert the UI state only for actual failures
            setSelectedGroupIds((prev) =>
              checked
                ? prev.filter((id) => id !== groupId)
                : [...new Set([...prev, groupId])]
            )
          }
        },
      })
    }
  }

  const [formData, setFormData] = useState<UserFormData>(() => {
    if (mode === 'edit' && userData) {
      return userData
    }
    return {
      firstName: '',
      lastName: '',
      emailId: '',
      status: 'active',
      username: '',
      selectedRoles: [],
      rolePermissions: {},
      roleEnabled: {},
    }
  })

  React.useEffect(() => {
    if (mode === 'edit' && userData) {
      setFormData(userData)
      setIsEditMode(false)
    } else if (mode === 'add') {
      // Reset form data when switching to add mode
      setFormData({
        firstName: '',
        lastName: '',
        emailId: '',
        status: 'active',
        username: '',
        selectedRoles: [],
        rolePermissions: {},
        roleEnabled: {},
      })
      // Clear role and group selections for add mode
      setSelectedRoleNames([])
      setSelectedGroupIds([])
      setIsEditMode(false)
    }
  }, [mode, userData])

  const commonFieldStyles = React.useMemo(() => tokens.input, [tokens])
  const labelSx = tokens.label
  const valueSx = tokens.value

  const selectStyles = React.useMemo(
    () => ({
      height: '46px',
      '& .MuiOutlinedInput-root': {
        height: '46px',
        borderRadius: '8px',
        backgroundColor: alpha('#1E293B', 0.5), // Darker background for inputs
        '& fieldset': {
          borderColor: alpha('#FFFFFF', 0.3), // White border with opacity
          borderWidth: '1px',
        },
        '&:hover fieldset': {
          borderColor: alpha('#FFFFFF', 0.5), // Brighter on hover
        },
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.primary.main,
        },
      },
      '& .MuiSelect-icon': {
        color: '#FFFFFF', // White icon
        fontSize: '20px',
      },
      '& .MuiInputBase-input': {
        color: '#FFFFFF', // White text in inputs
      },
    }),
    [theme]
  )

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddUser = () => {
    createUser.mutate({
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.emailId,
      enabled: formData.status === 'active',
    })
    onClose()
  }
  const handleSaveUser = () => {
    if (!userData?.userId) return

    updateUser.mutate(
      {
        id: userData.userId,
        updates: {
          id: userData.userId,
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.emailId,
          enabled: formData.status === 'active',
          emailVerified: true, // ✅ add this
        },
      },
      {
        onSuccess: () => {
          setIsEditMode(false)
          onClose()
        },
        onError: (error) => {
          console.error('Update failed:', error)
        },
      }
    )
  }

  const handleCancel = () => {
    if (isEditMode) {
      setIsEditMode(false)
      if (userData) setFormData(userData)
    } else {
      onClose()
    }
  }

  const handleEditClick = () => {
    setIsEditMode(true)
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
        <span>
          {mode === 'edit'
            ? isEditMode
              ? getUserLabelDynamic('CDL_EDIT_USER')
              : userData?.firstName + ' ' + userData?.lastName
            : getUserLabelDynamic('CDL_ADD_NEW_USER')}
        </span>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {mode === 'edit' && !isEditMode && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
              size="small"
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                height: '32px',
                px: 2,
                fontSize: '14px',
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.action.hover, 0.1)
                      : alpha(theme.palette.action.hover, 0.05),
                },
              }}
            >
              {getUserLabelDynamic('CDL_EDIT')}
            </Button>
          )}
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
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          padding: 0,
          paddingTop: '16px',
          paddingBottom: '100px', // Add space for bottom buttons
          paddingLeft: '24px',
          paddingRight: '24px',
          overflowY: 'auto',
          height: 'calc(100vh - 200px)', // Adjust height to prevent overlap
          borderColor: tokens.dividerColor,
          backgroundColor: tokens.paper.backgroundColor as string,
        }}
      >
        <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
          {/* Basic Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={getUserLabelDynamic('CDL_FIRST_NAME')}
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              disabled={mode === 'edit' && !isEditMode}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: valueSx }}
              sx={commonFieldStyles}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={getUserLabelDynamic('CDL_LAST_NAME')}
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              disabled={mode === 'edit' && !isEditMode}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: valueSx }}
              sx={commonFieldStyles}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={getUserLabelDynamic('CDL_EMAIL_ID')}
              type="email"
              value={formData.emailId}
              onChange={(e) => handleInputChange('emailId', e.target.value)}
              disabled={mode === 'edit' && !isEditMode}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: valueSx }}
              sx={commonFieldStyles}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel sx={labelSx}>
                {getUserLabelDynamic('CDL_STATUS')}
              </InputLabel>
              <MuiSelect
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                label={getUserLabelDynamic('CDL_STATUS')}
                disabled={mode === 'edit' && !isEditMode}
                IconComponent={KeyboardArrowDownIcon}
                input={
                  <OutlinedInput label={getUserLabelDynamic('CDL_STATUS')} />
                }
                sx={{ ...selectStyles, ...valueSx }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={getUserLabelDynamic('CDL_USER_NAME')}
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              disabled={mode === 'edit' && !isEditMode}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: valueSx }}
              sx={commonFieldStyles}
            />
          </Grid>

          {/* Roles and Permissions Section */}
          {mode === 'edit' && (
            <>
              <Grid size={{ xs: 12 }}>
                <span className="font-sans font-medium text-[18px] leading-7 text-gray-900 dark:text-gray-100">
                  {getUserLabelDynamic('CDL_ROLES')} and{' '}
                  {getUserLabelDynamic('CDL_PERMISSIONS')}
                </span>
              </Grid>

              {/* Roles Section */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    border: `1px solid ${tokens.dividerColor}`,
                    borderRadius: '8px',
                    p: 1,
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.default, 0.5)
                        : alpha(theme.palette.grey[50], 0.8),
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Available Roles
                  </Typography>
                  {isLoadingAllRoles ? (
                    <Typography variant="body2" color="text.secondary">
                      Loading...
                    </Typography>
                  ) : allAvailableRoles && allAvailableRoles.length > 0 ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 1,
                      }}
                    >
                      {allAvailableRoles.map((role) => (
                        <FormControlLabel
                          key={role.id}
                          control={
                            <MuiCheckbox
                              checked={selectedRoleNames.includes(role.name)}
                              onChange={(e) =>
                                handleRoleCheckboxChange(
                                  role.name,
                                  e.target.checked
                                )
                              }
                              disabled={!isEditMode}
                              sx={{
                                '&.Mui-checked': {
                                  color: theme.palette.primary.main,
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              sx={{ fontSize: '14px' }}
                            >
                              {role.name}
                            </Typography>
                          }
                          sx={{ margin: 0 }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No roles available
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Groups Section */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    border: `1px solid ${tokens.dividerColor}`,
                    borderRadius: '8px',
                    p: 2,
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.default, 0.5)
                        : alpha(theme.palette.grey[50], 0.8),
                    mt: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                    Available Permissions (Groups)
                  </Typography>
                  {isLoadingAllGroups ? (
                    <Typography variant="body2" color="text.secondary">
                      Loading...
                    </Typography>
                  ) : allAvailableGroups && allAvailableGroups.length > 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                    >
                      {allAvailableGroups.map((group) => (
                        <FormControlLabel
                          key={group.id}
                          control={
                            <Switch
                              checked={selectedGroupIds.includes(group.id)}
                              onChange={(e) =>
                                handleGroupCheckboxChange(
                                  group.id,
                                  e.target.checked
                                )
                              }
                              disabled={!isEditMode}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: theme.palette.primary.main,
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                                  {
                                    backgroundColor: theme.palette.primary.main,
                                  },
                              }}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              sx={{ fontSize: '14px' }}
                            >
                              {group.name}
                            </Typography>
                          }
                          sx={{ margin: 0 }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No groups available
                    </Typography>
                  )}
                </Box>
              </Grid>

              {isLoadingRoles && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      py: 4,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Loading...
                    </Typography>
                  </Box>
                </Grid>
              )}

              {!isLoadingRoles &&
                (!userRolesAndGroups?.roles ||
                  userRolesAndGroups.roles.length === 0) &&
                (!userRolesAndGroups?.groups ||
                  userRolesAndGroups.groups.length === 0) && (
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        py: 4,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No roles or groups assigned to this user.
                      </Typography>
                    </Box>
                  </Grid>
                )}
            </>
          )}
        </Grid>
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
        <Grid container spacing={2}>
          {mode === 'edit' && isEditMode && (
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleCancel}
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
                  backgroundColor: tokens.paper.backgroundColor,
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
                {getUserLabelDynamic('CDL_CANCEL')}
              </Button>
            </Grid>
          )}
          <Grid size={{ xs: mode === 'edit' && isEditMode ? 6 : 12 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={mode === 'edit' ? handleSaveUser : handleAddUser}
              disabled={
                createUser.isPending || updateUser.isPending || labelsLoading
              }
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '0.01em',
                borderRadius: '8px',
                backgroundColor: `${theme.palette.primary.main} !important`,
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
                  backgroundColor: `${theme.palette.primary.dark} !important`,
                  borderColor: theme.palette.mode === 'dark' 
                    ? theme.palette.primary.main 
                    : 'transparent',
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
                '&:disabled': {
                  backgroundColor: `${
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.grey[600], 0.5)
                      : theme.palette.grey[300]
                  } !important`,
                  color: theme.palette.text.disabled,
                },
              }}
            >
              {mode === 'edit'
                ? getUserLabelDynamic('CDL_SAVE')
                : getUserLabelDynamic('CDL_ADD_NEW_USER')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Error and Success Notifications */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setErrorMessage(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Drawer>
  )
}
