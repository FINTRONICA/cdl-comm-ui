import React, { useState, useEffect } from "react";
import {
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  Button,
  Drawer,
  Checkbox,
  OutlinedInput,
  ListItemText,
  Select as MuiSelect,
  Grid,
  Box,
  Typography,
  Switch,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { TextAtom } from "../../atoms/TextAtom/TextAtom";
import { ToggleSwitch } from "@/components/atoms/ToggleSwitch/ToggleSwitch";

interface User {
  id: string;
  name: string;

  initials?: string;
}

interface RoleManagementData {
  roleName: string;
  roleId: string;
  usersAssigned: User[];
  activeUsers: number;
  inactiveUsers: number;
  permissions: string[];
  status: string;
}

interface EditRightSideRolePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleName: string, users: User[], selectedPermissions: string[]) => void;
  mode: "edit" | "add";

  roleData?: RoleManagementData | null;
}

export const EditRightSideRolePanel: React.FC<EditRightSideRolePanelProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,

  roleData,
}) => {
  const [selectedRole, setSelectedRole] = useState(roleData?.roleName || "");
  const [selectedUsers, setSelectedUsers] = useState<User[]>(roleData?.usersAssigned || []);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(roleData?.permissions || []);
  const [permissionStates, setPermissionStates] = useState<{ [key: string]: boolean }>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([])

  // Sync state when roleData changes
  useEffect(() => {
    if (roleData) {
      setSelectedRole(roleData.roleName);
      setSelectedUsers(roleData.usersAssigned);
      setSelectedPermissions(roleData.permissions);
      setAllUsers(roleData.usersAssigned); // Assuming all users are the ones assigned to the role initially
    }
  }, [roleData, isOpen]);

  // Sync permissionStates when selectedPermissions changes
  useEffect(() => {
    setPermissionStates(
      Object.fromEntries((selectedPermissions || []).map((p) => [p, true]))
    );
  }, [selectedPermissions]);

  // User change handler
  const handleUserChange = (event: SelectChangeEvent<string[]>) => {
    const selectedIds = event.target.value as string[];
    const updatedUsers = allUsers.filter((u) => selectedIds.includes(u.id));
    setSelectedUsers(updatedUsers);
  };

  // Toggle permissions
  const handleTogglePermission = (perm: string) => {
    setPermissionStates((prev) => ({
      ...prev,
      [perm]: !prev[perm],
    }));
  };

  // Save role
  const handleSave = () => {
    if (selectedRole && selectedUsers.length) {
      onSave(
        selectedRole,
        selectedUsers,
        Object.keys(permissionStates).filter((p) => permissionStates[p])
      );
      onClose();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "460px",
          height: "calc(100vh - 48px)",
          // height: "900px",
          borderRadius: "16px",
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
            // backdropFilter: "blur(10px)",
  overflowY:'auto', // enable vertical scrolling
  overflowX:'hidden',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "36px",
          padding: 0,
        }}
      >
        <span className="font-sans font-medium text-lg leading-7 tracking-0 text-[#1E2939]">
          {mode === "edit" ? "Edit Role" : "Add New Role"}
        </span>
        <IconButton onClick={onClose}>
          <img src="/close.svg" alt="close" />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers sx={{ p: 0, pt: "16px" }}>
        {/* Role Name */}
        <TextField
          fullWidth
          label="Role Name"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          disabled={mode === "edit"} // disable editing role name in edit mode
          sx={{ mb: 2 }}
        />

        {/* Users */}
        <span className="font-sans font-medium text-lg leading-7 tracking-0 text-[#1E2939] ">
          {"Assign Users"}
        </span>
        <Grid size={{ xs: 12 }} sx={{ mt: 1, mb: 2 }}>
          <FormControl fullWidth>
            <MuiSelect
              multiple
              value={selectedUsers.map((u) => u.id)}
              onChange={handleUserChange}
              onOpen={() => setIsDropdownOpen(true)}
              onClose={() => setIsDropdownOpen(false)}
              renderValue={() => ""}
              input={<OutlinedInput />}
              MenuProps={{
                PaperProps: {
                  sx: {
                    "& .MuiMenu-list": {
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 1,
                      p: 0,
                      width: "412px",
                      minHeight: "116px",
                    },
                  },
                },
              }}
            >
              {allUsers.map((user) => (
                <MenuItem
                  key={user.id}
                  value={user.id}
                  sx={{
                    height: "50px",
                    p: 1,
                    borderRadius: "4px",
                    "&:hover": {
                      backgroundColor: "#DBEAFE",
                    },
                  }}
                >
                  <Checkbox checked={selectedUsers.some((u) => u.id === user.id)} />
                  <ListItemText primary={user.name} />
                </MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
        </Grid>

        {/* Permissions Section */}
        <span className="font-sans font-medium text-lg leading-7 tracking-0 text-[#1E2939] ">
          {"Permissions"}
        </span>

        {/* Heading row for permission list */}
        {selectedPermissions && selectedPermissions.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 2,
              py: 1,
              borderBottom: "1px solid #E5E7EB",
            }}
          >
            <TextAtom text="Permission Name" />
            <TextAtom text="Permission On / Off" />
          </Box>
        )}


        {/* Permission list with switches */}
       <div className="max-h-[300px] overflow-y-auto">
         {selectedPermissions.map((perm) => (
          <Box
            key={perm}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 2,
              py: 1,
              height: "60px",
              borderBottom: "1px solid #E5E7EB",
              transition: "background-color 0.3s",
              "&:hover": {
                backgroundColor: "#EFF6FF",
              },
            }}
          >
            <Typography>{perm}</Typography>
            <ToggleSwitch
              size="medium"
              checked={permissionStates[perm] || false}
              onChange={() => handleTogglePermission(perm)}
            />
          </Box>
        ))}
       </div>
      </DialogContent>

      {/* Actions */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 2,
          display: "flex",
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={handleSave}
          color="primary"
          fullWidth
          size="large"
          disabled={isDropdownOpen}
        >
          {mode === "edit" ? "Save" : "Add New Role"}
        </Button>
      </Box>
    </Drawer>
  );
};