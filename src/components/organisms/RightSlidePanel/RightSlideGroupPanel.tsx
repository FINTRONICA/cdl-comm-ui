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
import { groupService } from '@/services/api/groupService';
import { useGroupManagementLabelApi } from '@/hooks/useGroupManagementLabelApi';
import { getGroupManagementLabel } from '@/constants/mappings/groupManagementMapping';
import { useAppStore } from '@/store';

interface GroupData {
  id?: string;
  name: string;
  description?: string;
}

interface RightSlideGroupPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (groupName: string, groupData?: GroupData) => void;
  mode?: "add" | "edit" | "view";
  userData?: GroupData | undefined;
  onSuccess?: (group: any) => void;
  onError?: (error: string) => void;
  onSwitchToEdit?: () => void;
}

export const RightSlideGroupPanel: React.FC<RightSlideGroupPanelProps> = ({
  isOpen,
  onClose,
  onSave,
  mode = "add",
  userData,
  onSuccess,
  onError,
  onSwitchToEdit,
}) => {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDescription, setSelectedDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current language from store
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  // Group Management Label API
  const {
    getLabel: getLabelFromApi,
    isLoading: labelsLoading,
    error: labelsError
  } = useGroupManagementLabelApi()

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
    if ((mode === "edit" || mode === "view") && userData) {
      setSelectedGroup(userData.name);
      setSelectedDescription(userData.description || "");
    } else {
      setSelectedGroup("");
      setSelectedDescription("");
    }
    setError(null); // Clear error when panel opens
  }, [mode, userData, isOpen]);

  const handleSave = async () => {
    if (!selectedGroup.trim()) {
      setError(getGroupLabelDynamic('CDL_GROUP_NAME_HELPER'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "edit" && userData) {
        // Update existing group
        const updatedGroup = await groupService.updateGroup(userData.id!, {
          name: selectedGroup.trim(),
          description: selectedDescription.trim() || '',
        });
        
        onSuccess?.(updatedGroup);
        onSave?.(selectedGroup, userData);
        onClose();
        setSelectedGroup("");
        setSelectedDescription("");
      } else {
        // Create new group - let parent handle the API call
        onSave?.(selectedGroup, { name: selectedGroup, description: selectedDescription });
        onClose();
        setSelectedGroup("");
        setSelectedDescription("");
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save group';
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
          {mode === "edit" ? getGroupLabelDynamic('CDL_EDIT_GROUP') : mode === "view" ? getGroupLabelDynamic('CDL_GROUP_VIEW_ONLY') : getGroupLabelDynamic('CDL_ADD_NEW_GROUP')}
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
          label={getGroupLabelDynamic('CDL_ACCESS_GRANT_NAME')}
          value={selectedGroup}
          onChange={(e) => {
            setSelectedGroup(e.target.value);
            if (error) setError(null); // Clear error when user starts typing
          }}
          disabled={loading || mode === "view"}
          error={!!error}
          helperText={error || (mode === "view" ? `${getGroupLabelDynamic('CDL_VIEW_ONLY')}` : getGroupLabelDynamic('CDL_GROUP_NAME_HELPER'))}
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label={getGroupLabelDynamic('CDL_ACCESS_GRANT_DESC')}
          value={selectedDescription}
          onChange={(e) => {
            setSelectedDescription(e.target.value);
            if (error) setError(null); // Clear error when user starts typing
          }}
          disabled={loading || mode === "view"}
          // multiline
          rows={3}
          helperText={mode === "view" ? `${getGroupLabelDynamic('CDL_VIEW_ONLY')}` : "Enter group description (optional)"}
          variant="outlined"
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
            {getGroupLabelDynamic('CDL_EDIT')}
          </Button>
        ) : mode !== "view" ? (
          <Button
            variant="contained"
            onClick={handleSave}
            color="primary"
            fullWidth
            size="large"
            disabled={loading || !selectedGroup.trim()}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading 
              ? (mode === 'edit' ? getGroupLabelDynamic('CDL_SAVING') : getGroupLabelDynamic('CDL_CREATING')) 
              : (mode === 'edit' ? getGroupLabelDynamic('CDL_SAVE') : getGroupLabelDynamic('CDL_ADD_NEW_GROUP'))
            }
          </Button>
        ) : null}
      </Box>

    </Drawer>
  );
};
