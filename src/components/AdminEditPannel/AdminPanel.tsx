import React, { useState, useEffect } from 'react'
import { DialogTitle, Drawer, Box, Typography, Switch } from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import { ActiveButton } from '../atoms/ActiveButton/ActiveButton'
import { InactiveButton } from '../atoms/ActiveButton/InactiveButton'
import { Pencil } from 'lucide-react'
import { EditRightSideRolePanel } from '../organisms/EditRightSideRolePanel/EditRightSideRolePanel'
import { ToggleSwitch } from '../atoms/ToggleSwitch/ToggleSwitch'
interface User {
  id: string
  name: string
  initials?: string
}

interface RoleManagementData {
  roleName: string
  roleId: string
  usersAssigned: User[]
  activeUsers: number
  inactiveUsers: number
  permissions: string[]
  status: string
}

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    roleName: string,
    users: User[],
    selectedPermissions: string[]
  ) => void
  mode: 'edit' | 'add'
  roleData?: RoleManagementData | null
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  roleData,
}) => {
  const [editRolePanelOpen, setEditRolePanelOpen] = useState(false)
  const [localRoleData, setLocalRoleData] = useState<RoleManagementData | null>(
    roleData || null
  )
  const [editingRole, setEditingRole] = useState<RoleManagementData | null>(
    null
  )
  const [selectedRole, setSelectedRole] = useState(roleData?.roleName || '')
  const [selectedUsers, setSelectedUsers] = useState<User[]>(
    roleData?.usersAssigned || []
  )
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  // NEW: User-level states
  const [userPermissionStates, setUserPermissionStates] = useState<{
    [userId: string]: boolean
  }>({})

  // NEW: Permission-level states
  const [permissionStates, setPermissionStates] = useState<{
    [userId: string]: { [perm: string]: boolean }
  }>({})

  // Handle editing
  const handleEditRole = (
    roleName: string,
    usersAssigned: Array<{
      id: string
      name: string
      avatar?: string
      initials?: string
    }>,
    permissions: string[]
  ) => {
    if (!localRoleData) return

    setLocalRoleData({
      ...localRoleData,
      roleName,
      usersAssigned,
      permissions,
      activeUsers: usersAssigned.length,
      inactiveUsers: 0,
    })
  }
  useEffect(() => {
    if (roleData) {
      setLocalRoleData(roleData) // keep local in sync with props
      setSelectedRole(roleData.roleName)
      setSelectedUsers(roleData.usersAssigned)
      setAllUsers(roleData.usersAssigned)

      // Initialize user switches (default true)
      const userStates = Object.fromEntries(
        roleData.usersAssigned.map((u) => [u.id, true])
      )
      setUserPermissionStates(userStates)

      // Initialize permission switches per user (default true)
      const permStates = Object.fromEntries(
        roleData.usersAssigned.map((u) => [
          u.id,
          Object.fromEntries(roleData.permissions.map((p) => [p, true])),
        ])
      )
      setPermissionStates(permStates)
    }
  }, [roleData, isOpen])
  // Toggle user switch
  const handleToggleUser = (userId: string) => {
    setUserPermissionStates((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  // Toggle individual permission
  const handleTogglePermission = (userId: string, perm: string) => {
    setPermissionStates((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [perm]: !prev[userId]?.[perm],
      },
    }))
  }

  // Save role
  const handleSave = () => {
    if (selectedRole && selectedUsers.length) {
      const activePerms: string[] = []
      Object.entries(permissionStates).forEach(([userId, perms]) => {
        Object.entries(perms).forEach(([perm, isOn]) => {
          if (isOn) activePerms.push(`${userId}:${perm}`)
        })
      })

      onSave(selectedRole, selectedUsers, activePerms)
      onClose()
    }
  }

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx:{
  width: "460px",
  // height: "900px",
    height: "calc(100vh - 48px)",

  borderRadius: "12px",
  opacity: 1,
  gap: "16px",
  borderWidth: "1px",
  paddingTop: "16px",
  paddingRight: "24px",
  paddingBottom: "16px",
  paddingLeft: "24px",
  position: "absolute", // needed for top/left
  top: "24px",
  right: "24px",
  background: "#FFFFFFE5",
  border: "1px solid #FFFFFF",
  boxShadow: "-8px 0px 8px 0px #62748E14",
  // backdropFilter: "blur(10px)",
  overflowY:'auto', // enable vertical scrolling
  overflowX:'hidden',

},
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 0,
          width: ' 412px',
          height: '72px',
          gap: 2,
        }}
      >
        <div className="flex flex-col gap-1">
          <span className="font-sans font-medium text-lg text-[#1E2939]">
            {selectedRole}
          </span>
          <div className="flex gap-2 w-[248px] h-[24px]">
            <ActiveButton label={`${roleData?.activeUsers} ACTIVE USER`} />
            <InactiveButton
              label={`${roleData?.inactiveUsers} INACTIVE USER`}
            />
          </div>
        </div>
        <div
          className="flex items-center gap-[6px] w-[75px] h-[36px] px-3 py-2 
  rounded-[calc(var(--ui-radius)*1.5)] text-blue-600 font-medium text-sm 
  hover:underline cursor-pointer"
          onClick={() => {
            if (roleData) {
              setEditingRole(roleData) // use prop value
              setEditRolePanelOpen(true)
            }
          }}
        >
          <Pencil className="w-4 h-4" />
          <span>Edit</span>
        </div>

        {/* Conditional rendering */}
        {editRolePanelOpen && (
          <EditRightSideRolePanel
            isOpen={editRolePanelOpen}
            onClose={() => setEditRolePanelOpen(false)}
            onSave={handleEditRole}
            mode="edit"
            roleData={localRoleData}
          />
        )}
      </DialogTitle>
<hr className=" border-gray-300" />
      {/* Content */}
      <div className="w-[412px] h-[540px]">
        {/* Table Header */}
        <span className="font-[Outfit] font-medium text-[18px] leading-[100%] tracking-[0%] align-middle w-[90px] h-[23px] opacity-100 py-3">
          User Name
        </span>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderBottom: '1px solid #E5E7EB',
            marginTop: '10px',
          }}
        >
          <span
            className="font-normal text-[12px] py-3"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            User Name
          </span>
          <span
            className="font-normal text-[12px]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Permission On / Off
          </span>
        </Box>

       {selectedUsers.map((user) => (
  <div
    key={user.id}
    className="flex flex-col border-b border-gray-200 px-4" // no fixed height here
  >
    {/* User row with switch */}
    <div className="flex justify-between items-center cursor-pointer h-[60px] transition-colors duration-300 hover:bg-[#EFF6FF]">
      {/* Username + expand toggle */}
      <div
        className="flex items-center gap-2"
        onClick={() =>
          setExpandedUser((prev) => (prev === user.id ? null : user.id))
        }
      >
        <button className="text-gray-500 text-xs">
          {expandedUser === user.id ? (
            <img
              src="/arrowdownicon.svg"
              alt="Collapse"
              className="inline-block w-3.5 h-3.5"
            />
          ) : (
            <img
              src="/arrowright.svg"
              alt="Expand"
              className="inline-block w-3.5 h-3.5"
            />
          )}
        </button>

        <span className="font-outfit text-[14px] font-medium">
          {user.name}
        </span>
      </div>
<div className='flex items-center gap-4 text-blue-600 font-medium text-sm '>
  <Pencil  className="w-4 h-4 " 
   onClick={() =>
          setExpandedUser((prev) => (prev === user.id ? null : user.id))
        }
  />
      {/* User-level switch */}
      <ToggleSwitch
        size="medium"
        checked={userPermissionStates[user.id] || false}
        onChange={() => handleToggleUser(user.id)}
      />
</div>
    </div>

    {/* Permissions for this user */}
    {expandedUser === user.id && (
      <div className="pl-4">
        {roleData?.permissions.map((perm, idx) => (
          <div
            key={perm}
            className="flex justify-between items-center h-[60px] border-b border-gray-200"
          >
            <span className="font-outfit text-[12px]">{perm}</span>
            <ToggleSwitch
              size="small"
              checked={permissionStates[user.id]?.[perm] || false}
              onChange={() => handleTogglePermission(user.id, perm)}
            />
          </div>
        ))}
      </div>
    )}
  </div>
))}

      </div>
    </Drawer>
  )
}
