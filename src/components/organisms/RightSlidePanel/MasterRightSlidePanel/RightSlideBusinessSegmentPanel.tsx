import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import {
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  TextField,
  Button,
  Drawer,
  Box,
  Alert,
  Snackbar,
  InputAdornment,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { Controller, useForm } from "react-hook-form";
import { alpha, useTheme } from "@mui/material/styles";

import {
  useSaveBusinessSegment,
  useBusinessSegment,
} from "@/hooks/master/CustomerHook/useBusinessSegment";
import {
  validateBusinessSegmentData,
  sanitizeBusinessSegmentData,
  type BusinessSegmentFormData,
} from "@/lib/validation/masterValidation/businessSegmentSchemas";
import type {
  CreateBusinessSegmentRequest,
  UpdateBusinessSegmentRequest,
  BusinessSegment,
} from "@/services/api/masterApi/Customer/businessSegmentService";
import { getMasterLabel } from "@/constants/mappings/master/masterMapping";
import { buildPanelSurfaceTokens } from "../panelTheme";
import { useTaskStatuses } from "@/hooks/master/CustomerHook/useTaskStatus";
import { idService } from "@/services/api/developerIdService";

interface RightSlideBusinessSegmentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onBusinessSegmentAdded?: (businessSegment: BusinessSegment) => void;
  onBusinessSegmentUpdated?: (
    businessSegment: BusinessSegment,
    index: number
  ) => void;
  mode?: "add" | "edit";
  actionData?: BusinessSegment | null;
  businessSegmentIndex?: number;
  taskStatusLoading?: boolean;
  taskStatusError?: unknown;
}

type BusinessSegmentFormWithId = BusinessSegmentFormData & {
  businessSegmentId?: string;
};

type TableDataWithBusinessSegmentFields = BusinessSegment & {
  businessSegmentName?: string;
  businessSegmentDescription?: string;
};

const DEFAULT_FORM_VALUES: BusinessSegmentFormWithId = {
  businessSegmentId: "",
  segmentName: "",
  segmentDescription: "",
  active: true,
  taskStatusDTO: null,
};

export const RightSlideBusinessSegmentPanel: React.FC<
  RightSlideBusinessSegmentPanelProps
> = ({
  isOpen,
  onClose,
  onBusinessSegmentAdded,
  onBusinessSegmentUpdated,
  mode = "add",
  actionData,
  businessSegmentIndex,
  taskStatusLoading: propTaskStatusLoading = false,
  taskStatusError: propTaskStatusError = null,
}) => {
  const theme = useTheme();
  const tokens = useMemo(() => buildPanelSurfaceTokens(theme), [theme]);

  // State management
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generatedId, setGeneratedId] = useState<string>("");
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false);

  // Refs for tracking form resets
  const lastResetIdRef = useRef<string | number | null>(null);
  const lastModeRef = useRef<"add" | "edit" | null>(null);
  const lastIsOpenRef = useRef<boolean>(false);

  // Computed values
  const isEditMode = mode === "edit";

  // API hooks
  const saveBusinessSegmentMutation = useSaveBusinessSegment();
  const { data: apiBusinessSegmentData } = useBusinessSegment(
    isEditMode && actionData?.id ? String(actionData.id) : null
  );
  const { isLoading: taskStatusesLoading } = useTaskStatuses();
  const taskStatusLoading = propTaskStatusLoading || taskStatusesLoading;
  const taskStatusError = propTaskStatusError || null;

  // Form management
  const {
    control,
    handleSubmit,
    reset,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BusinessSegmentFormWithId>({
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onChange",
  });

  // Helper: Get label dynamically
  const getLabel = useCallback(
    (configId: string): string => getMasterLabel(configId),
    []
  );

  // Helper: Extract field values from data source (handles both API and table data formats)
  const extractFieldValues = useCallback(
    (data: BusinessSegment | TableDataWithBusinessSegmentFields) => {
      const tableData = data as TableDataWithBusinessSegmentFields;
      return {
        segmentName:
          tableData.segmentName || tableData.businessSegmentName || "",
        segmentDescription:
          tableData.segmentDescription ||
          tableData.businessSegmentDescription ||
          "",
        businessSegmentId: data.uuid || `MBS-${data.id}` || "",
      };
    },
    []
  );

  // Helper: Reset form to default values
  const resetFormToDefaults = useCallback(() => {
    reset(DEFAULT_FORM_VALUES);
    setGeneratedId("");
  }, [reset]);

  // Watch businessSegmentId changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "businessSegmentId" && value.businessSegmentId) {
        setGeneratedId(value.businessSegmentId);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Generate new business segment ID
  const handleGenerateNewId = useCallback(async () => {
    try {
      setIsGeneratingId(true);
      const newIdResponse = idService.generateNewId("MBS");
      const newId = newIdResponse.id;
      setGeneratedId(newId);
      setValue("businessSegmentId", newId, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to generate ID. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsGeneratingId(false);
    }
  }, [setValue]);

  // Form reset logic: Handle panel open/close and data changes
  useEffect(() => {
    if (!isOpen) {
      if (lastIsOpenRef.current) {
        resetFormToDefaults();
        lastResetIdRef.current = null;
        lastModeRef.current = null;
      }
      lastIsOpenRef.current = false;
      return;
    }

    lastIsOpenRef.current = true;

    const currentId = (apiBusinessSegmentData?.id || actionData?.id) ?? null;
    const shouldReset =
      lastModeRef.current !== mode ||
      (isEditMode && lastResetIdRef.current !== currentId) ||
      (isEditMode && !lastResetIdRef.current && currentId);

    if (isEditMode) {
      // Wait for API data if loading, but use actionData as fallback
      if (taskStatusLoading && !actionData) {
        return;
      }

      if (shouldReset && (apiBusinessSegmentData || actionData)) {
        const dataToUse = apiBusinessSegmentData || actionData;
        if (!dataToUse) return;

        const { segmentName, segmentDescription, businessSegmentId } =
          extractFieldValues(dataToUse);
        setGeneratedId(businessSegmentId);

        reset({
          businessSegmentId,
          segmentName,
          segmentDescription,
          active: dataToUse.active ?? true,
          taskStatusDTO: dataToUse.taskStatusDTO?.id
            ? { id: dataToUse.taskStatusDTO.id }
            : null,
        });

        lastResetIdRef.current = dataToUse.id;
        lastModeRef.current = mode;
      } else if (!shouldReset) {
        return;
      }
    } else {
      // Add mode: always reset to defaults
      if (shouldReset) {
        resetFormToDefaults();
        lastResetIdRef.current = null;
        lastModeRef.current = mode;
      }
    }
  }, [
    isOpen,
    mode,
    isEditMode,
    apiBusinessSegmentData,
    actionData,
    taskStatusLoading,
    reset,
    resetFormToDefaults,
    extractFieldValues,
  ]);

  // Field validation
  const validateField = useCallback(
    (
      fieldName: string,
      value: unknown,
      allValues: BusinessSegmentFormWithId
    ): string | boolean => {
      const requiredFields: Record<string, string> = {
        segmentName: "Business Segment Name is required",
        segmentDescription: "Business Segment Description is required",
      };

      // Check required fields
      if (requiredFields[fieldName]) {
        if (!value || (typeof value === "string" && value.trim() === "")) {
          return requiredFields[fieldName];
        }
      }

      // Validate business segment ID for new records
      if (fieldName === "businessSegmentId" && !isEditMode) {
        if (!value || (typeof value === "string" && value.trim() === "")) {
          return "Business Segment ID is required. Please generate an ID.";
        }
      }

      // Validate with schema if value exists
      if (
        (fieldName === "segmentName" || fieldName === "segmentDescription") &&
        value &&
        typeof value === "string" &&
        value.trim() !== ""
      ) {
        const validationResult = validateBusinessSegmentData(allValues);
        if (!validationResult.success && validationResult.errors) {
          const fieldError = validationResult.errors.issues.find((issue) =>
            issue.path.some((p) => String(p) === fieldName)
          );
          return fieldError ? fieldError.message : true;
        }
      }

      return true;
    },
    [isEditMode]
  );

  // Close handler
  const handleClose = useCallback(() => {
    resetFormToDefaults();
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  }, [resetFormToDefaults, onClose]);

  // Form submission handler
  const onSubmit = useCallback(
    async (data: BusinessSegmentFormWithId) => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);

        if (taskStatusLoading) {
          setErrorMessage(
            "Please wait for dropdown options to load before submitting."
          );
          return;
        }

        const validatedData = sanitizeBusinessSegmentData(data);
        const currentDataToEdit = apiBusinessSegmentData || actionData;
        const isEditing = Boolean(isEditMode && currentDataToEdit?.id);

        // Validate business segment ID for new records
        if (!isEditing && !data.businessSegmentId && !generatedId) {
          setErrorMessage(
            "Please generate a Business Segment ID before submitting."
          );
          return;
        }

        // Trigger form validation
        const isValid = await trigger();
        if (!isValid) {
          const missingFields: string[] = [];
          if (!data.segmentName) missingFields.push("Business Segment Name");
          if (!data.segmentDescription)
            missingFields.push("Business Segment Description");
          if (missingFields.length > 0) {
            setErrorMessage(
              `Please fill in the required fields: ${missingFields.join(", ")}`
            );
          }
          return;
        }

        const businessSegmentId = isEditing
          ? String(currentDataToEdit?.id || "")
          : undefined;
        const formBusinessSegmentId = data.businessSegmentId || generatedId;

        // Prepare request payload
        const basePayload = {
          segmentName: validatedData.segmentName,
          segmentDescription: validatedData.segmentDescription,
          active: validatedData.active,
          enabled: true,
          deleted: false,
          ...(formBusinessSegmentId && { uuid: formBusinessSegmentId }),
          ...(validatedData.taskStatusDTO?.id && {
            taskStatusDTO: { id: validatedData.taskStatusDTO.id },
          }),
        };

        const requestPayload:
          | CreateBusinessSegmentRequest
          | UpdateBusinessSegmentRequest = isEditing
          ? {
              ...basePayload,
              id: currentDataToEdit?.id,
            }
          : basePayload;

        // Execute mutation
        const result = await saveBusinessSegmentMutation.mutateAsync({
          data: requestPayload,
          isEditing,
          ...(businessSegmentId && { businessSegmentId }),
        });

        // Update generatedId if UUID is returned
        if (result?.uuid) {
          setGeneratedId(result.uuid);
        }

        // Show success message
        setSuccessMessage(
          isEditing
            ? "Business Segment updated successfully!"
            : "Business Segment added successfully!"
        );

        // Trigger callbacks
        if (
          isEditing &&
          onBusinessSegmentUpdated &&
          businessSegmentIndex !== null &&
          businessSegmentIndex !== undefined
        ) {
          onBusinessSegmentUpdated(result, businessSegmentIndex);
        } else if (onBusinessSegmentAdded) {
          onBusinessSegmentAdded(result);
        }

        // Close panel after delay
        setTimeout(() => {
          resetFormToDefaults();
          handleClose();
        }, 1500);
      } catch (error: unknown) {
        let errorMsg = "Failed to save business segment. Please try again.";
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes("validation")) {
            errorMsg =
              "Validation error: Please check your input and try again.";
          } else {
            errorMsg = error.message || errorMsg;
          }
        }
        setErrorMessage(errorMsg);
      }
    },
    [
      taskStatusLoading,
      apiBusinessSegmentData,
      actionData,
      isEditMode,
      generatedId,
      trigger,
      saveBusinessSegmentMutation,
      onBusinessSegmentUpdated,
      onBusinessSegmentAdded,
      businessSegmentIndex,
      resetFormToDefaults,
      handleClose,
    ]
  );

  // Style memoization
  const isDark = theme.palette.mode === "dark";
  const styles = useMemo(
    () => ({
      textSecondary: isDark ? "#CBD5E1" : "#6B7280",
      commonField: tokens.input,
      errorField: tokens.inputError,
      label: tokens.label,
      value: tokens.value,
      viewMode: {
        backgroundColor: isDark ? alpha("#1E293B", 0.5) : "#F9FAFB",
        borderColor: isDark ? alpha("#FFFFFF", 0.2) : "#E5E7EB",
      },
    }),
    [isDark, tokens]
  );

  // Render text field component
  const renderTextField = useCallback(
    (
      name: "segmentName" | "segmentDescription",
      label: string,
      gridSize = 12,
      required = false
    ) => (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          rules={{
            validate: (value, formValues) =>
              validateField(name, value, formValues),
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label={label}
              fullWidth
              required={required}
              error={!!errors[name]}
              helperText={errors[name]?.message?.toString()}
              InputLabelProps={{ sx: styles.label }}
              InputProps={{ sx: styles.value }}
              sx={errors[name] ? styles.errorField : styles.commonField}
            />
          )}
        />
      </Grid>
    ),
    [control, errors, validateField, styles]
  );

  // Render ID field component
  const renderBusinessSegmentIdField = useCallback(
    (label: string, gridSize = 12, required = false) => {
      const fieldName = "businessSegmentId" as const;
      return (
        <Grid key={fieldName} size={{ xs: 12, md: gridSize }}>
          <Controller
            name={fieldName}
            control={control}
            rules={{
              required: required ? `${label} is required` : false,
              validate: (value, formValues) =>
                validateField(fieldName, value, formValues),
            }}
            render={({ field }) => {
              const fieldError = errors[fieldName];
              return (
                <TextField
                  {...field}
                  fullWidth
                  label={label}
                  required={required}
                  value={field.value || generatedId}
                  error={!!fieldError}
                  helperText={fieldError?.message?.toString()}
                  disabled={isEditMode}
                  onChange={(e) => {
                    setGeneratedId(e.target.value);
                    field.onChange(e);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end" sx={{ mr: 0 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<RefreshIcon />}
                          onClick={handleGenerateNewId}
                          disabled={isGeneratingId || isEditMode}
                          sx={{
                            color: theme.palette.primary.contrastText,
                            borderRadius: "8px",
                            textTransform: "none",
                            background: theme.palette.primary.main,
                            "&:hover": {
                              background: theme.palette.primary.dark,
                            },
                            minWidth: "100px",
                            height: "32px",
                            fontFamily: "Outfit, sans-serif",
                            fontWeight: 500,
                            fontSize: "11px",
                            lineHeight: "14px",
                            letterSpacing: "0.3px",
                            px: 1,
                          }}
                        >
                          {isGeneratingId ? "Generating..." : "Generate ID"}
                        </Button>
                      </InputAdornment>
                    ),
                    sx: styles.value,
                  }}
                  InputLabelProps={{
                    sx: {
                      ...styles.label,
                      ...(!!fieldError && {
                        color: theme.palette.error.main,
                        "&.Mui-focused": { color: theme.palette.error.main },
                        "&.MuiFormLabel-filled": {
                          color: theme.palette.error.main,
                        },
                      }),
                    },
                  }}
                  sx={{
                    ...styles.commonField,
                    ...(isEditMode && {
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: styles.viewMode.backgroundColor,
                        color: styles.textSecondary,
                        "& fieldset": {
                          borderColor: styles.viewMode.borderColor,
                        },
                        "&:hover fieldset": {
                          borderColor: styles.viewMode.borderColor,
                        },
                      },
                    }),
                  }}
                />
              );
            }}
          />
        </Grid>
      );
    },
    [
      control,
      errors,
      generatedId,
      isEditMode,
      isGeneratingId,
      validateField,
      handleGenerateNewId,
      styles,
      theme,
    ]
  );

  // Panel title
  const panelTitle = useMemo(
    () =>
      isEditMode
        ? `${getLabel("CDL_COMMON_UPDATE")} ${getLabel("CDL_MBS_NAME")}`
        : `${getLabel("CDL_COMMON_ADD")} ${getLabel("CDL_MBS_NAME")}`,
    [isEditMode, getLabel]
  );

  // Submit button text
  const submitButtonText = useMemo(() => {
    if (saveBusinessSegmentMutation.isPending) {
      return isEditMode
        ? getLabel("CDL_COMMON_UPDATING")
        : getLabel("CDL_COMMON_ADDING");
    }
    return isEditMode
      ? getLabel("CDL_COMMON_UPDATE")
      : getLabel("CDL_COMMON_ADD");
  }, [saveBusinessSegmentMutation.isPending, isEditMode, getLabel]);

  const isSubmitDisabled =
    saveBusinessSegmentMutation.isPending || taskStatusLoading;

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={handleClose}
      PaperProps={{
        sx: {
          ...tokens.paper,
          width: 460,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Outfit, sans-serif",
          fontWeight: 500,
          fontSize: "20px",
          lineHeight: "28px",
          letterSpacing: "0.15px",
          borderBottom: `1px solid ${tokens.dividerColor}`,
          backgroundColor: tokens.paper.backgroundColor as string,
          color: theme.palette.text.primary,
          pr: 3,
          pl: 3,
        }}
      >
        {panelTitle}
        <IconButton
          onClick={handleClose}
          sx={{
            color: theme.palette.text.secondary,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <CancelOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          dividers
          sx={{
            borderColor: tokens.dividerColor,
            backgroundColor: tokens.paper.backgroundColor as string,
          }}
        >
          {taskStatusError && (
            <Alert
              severity="error"
              variant="outlined"
              sx={{
                mb: 2,
                backgroundColor: isDark
                  ? "rgba(239, 68, 68, 0.08)"
                  : "rgba(254, 226, 226, 0.4)",
                borderColor: alpha(theme.palette.error.main, 0.4),
                color: theme.palette.error.main,
              }}
            >
              Failed to load dropdown options. Please refresh the page.
            </Alert>
          )}

          <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
            {renderBusinessSegmentIdField(getLabel("CDL_MBS_ID"), 12, true)}
            {renderTextField("segmentName", getLabel("CDL_MBS_NAME"), 12, true)}
            {renderTextField(
              "segmentDescription",
              getLabel("CDL_MBS_DESCRIPTION"),
              12,
              true
            )}
          </Grid>
        </DialogContent>

        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 2,
            display: "flex",
            gap: 2,
            borderTop: `1px solid ${tokens.dividerColor}`,
            backgroundColor: alpha(
              theme.palette.background.paper,
              isDark ? 0.92 : 0.9
            ),
            backdropFilter: "blur(10px)",
            zIndex: 10,
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClose}
                disabled={isSubmitDisabled}
                sx={{
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 500,
                  fontStyle: "normal",
                  fontSize: "14px",
                  lineHeight: "20px",
                  letterSpacing: 0,
                  borderRadius: "8px",
                  textTransform: "none",
                  borderWidth: "1px",
                  borderColor: isDark
                    ? theme.palette.primary.main
                    : theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  "&:hover": {
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: isDark
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.05),
                  },
                  "&:disabled": {
                    borderColor: isDark
                      ? alpha(theme.palette.primary.main, 0.3)
                      : alpha(theme.palette.primary.main, 0.3),
                    color: theme.palette.text.disabled,
                  },
                }}
              >
                {getLabel("CDL_COMMON_CANCEL")}
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                type="submit"
                disabled={isSubmitDisabled}
                sx={{
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 500,
                  fontStyle: "normal",
                  fontSize: "14px",
                  lineHeight: "20px",
                  letterSpacing: 0,
                  borderRadius: "8px",
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  textTransform: "none",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: isDark
                    ? theme.palette.primary.main
                    : "transparent",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                    borderColor: isDark
                      ? theme.palette.primary.main
                      : "transparent",
                    boxShadow: isDark
                      ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  },
                  "&:disabled": {
                    backgroundColor: isDark
                      ? alpha(theme.palette.grey[600], 0.5)
                      : theme.palette.grey[300],
                    borderColor: isDark
                      ? alpha(theme.palette.primary.main, 0.5)
                      : "transparent",
                    color: theme.palette.text.disabled,
                  },
                }}
              >
                {submitButtonText}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </form>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorMessage(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Drawer>
  );
};
