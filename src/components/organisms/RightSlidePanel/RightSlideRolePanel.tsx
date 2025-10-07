import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { roleService } from '@/services/api/roleService';
import { useRoleManagementLabelApi } from '@/hooks/useRoleManagementLabelApi';
import { getRoleManagementLabel } from '@/constants/mappings/roleManagementMapping';
import { useAppStore } from '@/store';
interface RoleData {
  id?: string;
  name: string;
}

interface RightSlideRolePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (roleName: string, roleData?: RoleData) => void;
  mode?: "add" | "edit" | "view";
  userData?: RoleData | undefined;
  onSuccess?: (role: any) => void;
  onError?: (error: string) => void;
  onSwitchToEdit?: () => void;
}


export const RightSlideRolePanel: React.FC<RightSlideRolePanelProps> = ({
  isOpen,
  onClose,
  onSave,
  mode = "add",
  userData,
  onSuccess,
  onError,
  onSwitchToEdit,
}) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current language from store
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  // Role Management Label API
  const {
    getLabel: getLabelFromApi,
    isLoading: labelsLoading,
    error: labelsError
  } = useRoleManagementLabelApi()

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

  useEffect(() => {
    if ((mode === "edit" || mode === "view") && userData) {
      setSelectedRole(userData.name);
    } else {
      setSelectedRole("");
    }
    setError(null); // Clear error when panel opens
  }, [mode, userData, isOpen]);

  const handleSave = async () => {
    if (!selectedRole.trim()) {
      setError(`${getRoleLabelDynamic('CDL_ROLE_NAME')} is required`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "edit" && userData) {
        // Update existing role
        const updatedRole = await roleService.updateRole(userData.name, {
          name: selectedRole.trim(),
        });
        
        onSuccess?.(updatedRole);
        onSave?.(selectedRole, userData);
        onClose();
        setSelectedRole("");
      } else {
        // Create new role - let parent handle the API call
        onSave?.(selectedRole);
        onClose();
        setSelectedRole("");
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save role';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
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
          height: 'calc(100vh - 48px)',
          maxHeight: 'calc(100vh - 48px)',
          borderRadius: '12px',
          background: '#FFFFFFE5',
          boxShadow: '-8px 0px 8px 0px #62748E14',
          padding: '24px',
          marginTop: "24px",
          marginBottom: "12px",
          marginRight: "12px",
          overflow: 'auto',
        },
      }}
    >

      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: "36px", paddingLeft: "4px", paddingTop: 0, paddingBottom: 0, paddingRight: 0 }}>

        <span className="font-sans font-medium text-lg leading-7 tracking-0 text-[#1E2939]">
          {mode === "edit" ? getRoleLabelDynamic(' CDL_EDIT_ROLE') : mode === "view" ? `${getRoleLabelDynamic(' CDL_ROLE_VIEW_ONLY')}` : getRoleLabelDynamic('CDL_ADD_NEW_ROLE')}
        </span>
        <IconButton onClick={onClose}>
          <img src="/close.svg" alt="close" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, pt: "16px" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          fullWidth
          label={getRoleLabelDynamic('CDL_ROLE_NAME')}
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            if (error) setError(null); // Clear error when user starts typing
          }}
          disabled={loading || mode === "view"}
          error={!!error}
          helperText={error || (mode === "view" ? `${getRoleLabelDynamic('CDL_VIEW_ONLY')}` : getRoleLabelDynamic('CDL_ROLE_NAME_HELPER'))}
          sx={{ mb: 2 }}
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
        }}
      >
        {mode === "view" && onSwitchToEdit ? (
          <Button
            variant="outlined"
            onClick={onSwitchToEdit}
            color="primary"
            fullWidth
            size="large"
          >
            { ` ${getRoleLabelDynamic(' CDL_EDIT')}`}
          </Button>
        ) : mode !== "view" ? (
          <Button
            variant="contained"
            onClick={handleSave}
            color="primary"
            fullWidth
            size="large"
            disabled={loading || !selectedRole.trim()}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading 
              ? (mode === 'edit' ? getRoleLabelDynamic('CDL_SAVING') : getRoleLabelDynamic('CDL_CREATING')) 
              : (mode === 'edit' ? getRoleLabelDynamic('CDL_SAVE') : ` ${getRoleLabelDynamic('CDL_ADD_NEW_ROLE')} `)
            }
          </Button>
        ) : null}
      </Box>

    </Drawer>
  );
};
