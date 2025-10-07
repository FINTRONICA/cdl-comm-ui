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
} from '@mui/material'
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Edit as EditIcon,
} from '@mui/icons-material'

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
  const createUser = useCreateAuthAdminUser()
  const updateUser = useUpdateAuthAdminUser()
  const [isEditMode, setIsEditMode] = useState(false)

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
    error: labelsError
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
          alert(`Role ${roleName} ${checked ? 'assigned' : 'unassigned'} successfully`)

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
          alert(`Group ${groupId} ${checked ? 'assigned' : 'unassigned'} successfully`)

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

  const commonFieldStyles = {
    height: '46px',
    '& .MuiOutlinedInput-root': {
      height: '46px',
      borderRadius: '8px',
      backgroundColor: '#FFFFFF',
      '& fieldset': {
        borderColor: '#D1D5DB',
        borderWidth: '1px',
        borderStyle: 'solid',
      },
      '&:hover fieldset': {
        borderColor: '#9CA3AF',
        borderWidth: '1px',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
        borderWidth: '2px',
      },
      '&.Mui-disabled': {
        backgroundColor: '#F9FAFB',
        '& fieldset': {
          borderColor: '#E5E7EB',
        },
      },
    },
    '& .MuiInputLabel-root': {
      color: '#6B7280',
      '&.Mui-focused': {
        color: '#2563EB',
      },
    },
  }

  const selectStyles = {
    height: '46px',
    '& .MuiOutlinedInput-root': {
      height: '46px',
      borderRadius: '8px',
      backgroundColor: '#FFFFFF',
      '& fieldset': {
        borderColor: '#D1D5DB',
        borderWidth: '1px',
        borderStyle: 'solid',
      },
      '&:hover fieldset': {
        borderColor: '#9CA3AF',
        borderWidth: '1px',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
        borderWidth: '2px',
      },
      '&.Mui-disabled': {
        backgroundColor: '#F9FAFB',
        '& fieldset': {
          borderColor: '#E5E7EB',
        },
        '& .MuiSelect-select': {
          backgroundColor: '#F9FAFB',
        },
      },
      '& .MuiSelect-select': {
        backgroundColor: '#FFFFFF',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        minHeight: 'unset',
        height: '22px',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#6B7280',
      '&.Mui-focused': {
        color: '#2563EB',
      },
      '&.Mui-disabled': {
        color: '#9CA3AF',
      },
    },
    '& .MuiSelect-icon': {
      color: '#6B7280',
      '&.Mui-disabled': {
        color: '#D1D5DB',
      },
    },
  }

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
          width: '600px',
          height: 'calc(100vh - 48px)',
          maxHeight: 'calc(100vh - 48px)',
          borderRadius: '12px',
          background: '#FFFFFFE5',
          boxShadow: '-8px 0px 8px 0px #62748E14',
          backdropFilter: 'blur(10px)',
          padding: '24px',
          marginTop: '24px',
          marginBottom: '12px',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '36px',
          padding: 0,
        }}
      >
        <span className="font-sans font-medium text-lg leading-7 tracking-0 text-[#1E2939]">
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
                borderColor: '#2563EB',
                color: '#2563EB',
                height: '32px',
                px: 2,
                fontSize: '14px',
                '&:hover': {
                  borderColor: '#1D4ED8',
                  backgroundColor: '#F8FAFC',
                },
              }}
            >
              {getUserLabelDynamic('CDL_EDIT')}
            </Button>
          )}
          <IconButton onClick={onClose}>
            <img src="/close.svg" alt="close" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          padding: 0,
          paddingTop: '16px',
          paddingBottom: '100px', // Add space for bottom buttons
          overflowY: 'auto',
          height: 'calc(100vh - 200px)', // Adjust height to prevent overlap
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
              sx={commonFieldStyles}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{getUserLabelDynamic('CDL_STATUS')}</InputLabel>
              <MuiSelect
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                label="Status"
                disabled={mode === 'edit' && !isEditMode}
                IconComponent={KeyboardArrowDownIcon}
                sx={selectStyles}
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
              sx={commonFieldStyles}
            />
          </Grid>

          {/* Roles and Permissions Section */}
          {mode === 'edit' && (
            <>
              <Grid size={{ xs: 12 }}>
                <span className="font-sans font-medium text-[18px] leading-7 text-[#1E2939]">
                  {getUserLabelDynamic('CDL_ROLES')} and {getUserLabelDynamic('CDL_PERMISSIONS')}
                </span>
              </Grid>

              {/* Roles Section */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    p: 1,
                    backgroundColor: '#FAFAFA',
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Available Roles
                  </Typography>
                  {isLoadingAllRoles ? (
                    <Typography variant="body2" color="text.secondary">
                      Loading available roles...
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
                                  color: '#2563EB',
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
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    p: 2,
                    backgroundColor: '#FAFAFA',
                    mt: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                    Available Permissions (Groups)
                  </Typography>
                  {isLoadingAllGroups ? (
                    <Typography variant="body2" color="text.secondary">
                      Loading available groups...
                    </Typography>
                  ) : allAvailableGroups && allAvailableGroups.length > 0 ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
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
                                  color: '#2563EB',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                                  {
                                    backgroundColor: '#2563EB',
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
                      Loading user roles and groups...
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
          p: 3,
          display: 'flex',
          gap: 2,
          backgroundColor: '#FFFFFFE5',
          borderTop: '1px solid #E2E8F0',
        }}
      >
        {mode === 'edit' && isEditMode && (
          <Button
            fullWidth
            variant="outlined"
            onClick={handleCancel}
            sx={{
              borderColor: '#2563EB',
              color: '#2563EB',
            }}
          >
            {getUserLabelDynamic('CDL_CANCEL')}
          </Button>
        )}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={mode === 'edit' ? handleSaveUser : handleAddUser}
        >
          {mode === 'edit' ? getUserLabelDynamic('CDL_SAVE') : getUserLabelDynamic('CDL_ADD_NEW_USER')}
        </Button>
      </Box>
    </Drawer>
  )
}
