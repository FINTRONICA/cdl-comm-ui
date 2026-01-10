import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
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
import { Controller, useForm } from "react-hook-form";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { alpha, useTheme } from "@mui/material/styles";
import {
  useSaveAgreementSegment,
  useAgreementSegment,
} from "@/hooks/master/CustomerHook/useAgreementSegment";
import {
  validateAgreementSegmentData as validateAgreementSegmentSchema,
  sanitizeAgreementSegmentData,
  type AgreementSegmentFormData,
} from "@/lib/validation/masterValidation/agreementSegmentSchemas";
import type {
  CreateAgreementSegmentRequest,
  UpdateAgreementSegmentRequest,
  AgreementSegment,
  TaskStatusDTO,
} from "@/services/api/masterApi/Customer/agreementSegmentService";
import { getMasterLabel } from "@/constants/mappings/master/masterMapping";
import { buildPanelSurfaceTokens } from "../panelTheme";
import { useTaskStatuses } from "@/hooks/master/CustomerHook/useTaskStatus";
import { idService } from "@/services/api/developerIdService";

interface RightSlideAgreementSegmentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAgreementSegmentAdded?: (agreementSegment: AgreementSegment) => void;
  onAgreementSegmentUpdated?: (
    agreementSegment: AgreementSegment,
    index: number
  ) => void;
  title?: string;
  mode?: "add" | "edit";
  actionData?: AgreementSegment | null;
  agreementSegmentIndex?: number | undefined;
  taskStatusOptions?: TaskStatusDTO[];
  taskStatusLoading?: boolean;
  taskStatusError?: unknown;
}

const DEFAULT_FORM_VALUES = {
  agreementSegmentId: "",
  segmentName: "",
  segmentDescription: "",
  active: true,
  taskStatusDTO: null,
} as const;

export const RightSlideAgreementSegmentPanel: React.FC<
  RightSlideAgreementSegmentPanelProps
> = ({
  isOpen,
  onClose,
  onAgreementSegmentAdded,
  onAgreementSegmentUpdated,
  mode = "add",
  actionData,
  agreementSegmentIndex,
  taskStatusOptions: _propTaskStatusOptions,
  taskStatusLoading: propTaskStatusLoading = false,
  taskStatusError: propTaskStatusError = null,
}) => {
  const theme = useTheme();
  const tokens = useMemo(() => buildPanelSurfaceTokens(theme), [theme]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generatedId, setGeneratedId] = useState<string>("");
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false);

  const isEditMode = mode === "edit";
  const saveAgreementSegmentMutation = useSaveAgreementSegment();

  // Fetch full agreement segment data when in edit mode
  const { data: apiAgreementSegmentData } = useAgreementSegment(
    isEditMode && actionData?.id ? String(actionData.id) : null
  );

  // Fetch task statuses
  const { isLoading: taskStatusesLoading } = useTaskStatuses();
  const taskStatusLoading = propTaskStatusLoading || taskStatusesLoading;
  const taskStatusError = propTaskStatusError || null;

  // Dynamic labels
  const getLabel = useCallback((configId: string): string => {
    return getMasterLabel(configId);
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AgreementSegmentFormData & { agreementSegmentId?: string }>({
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onChange",
  });

  // Sync generatedId with form value
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "agreementSegmentId" && value.agreementSegmentId) {
        setGeneratedId(value.agreementSegmentId);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Generate new agreement segment ID
  const handleGenerateNewId = useCallback(async () => {
    try {
      setIsGeneratingId(true);
      const newIdResponse = idService.generateNewId("MAS");
      setGeneratedId(newIdResponse.id);
      setValue("agreementSegmentId", newIdResponse.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      setErrorMessage("Failed to generate ID. Please try again.");
    } finally {
      setIsGeneratingId(false);
    }
  }, [setValue]);

  // Track form reset state
  const lastResetIdRef = useRef<string | number | null>(null);
  const lastModeRef = useRef<"add" | "edit" | null>(null);
  const lastIsOpenRef = useRef<boolean>(false);

  // Transform data to form format
  const transformDataToForm = useCallback((data: AgreementSegment | null) => {
    if (!data) return null;

    const segmentName =
      "segmentName" in data && data.segmentName
        ? data.segmentName
        : "agreementSegmentName" in data && (data as any).agreementSegmentName
          ? (data as any).agreementSegmentName
          : "";

    const segmentDescription =
      "segmentDescription" in data && data.segmentDescription
        ? data.segmentDescription
        : "agreementSegmentDescription" in data &&
            (data as any).agreementSegmentDescription
          ? (data as any).agreementSegmentDescription
          : "";

    const agreementSegmentId =
      data.uuid || (data.id ? `MAS-${data.id}` : "") || "";

    return {
      agreementSegmentId,
      segmentName: segmentName || "",
      segmentDescription: segmentDescription || "",
      active: "active" in data ? (data.active ?? true) : true,
      taskStatusDTO: data.taskStatusDTO?.id
        ? { id: data.taskStatusDTO.id }
        : null,
    };
  }, []);

  // Reset form when panel opens/closes or mode/data changes
  useEffect(() => {
    if (!isOpen) {
      if (lastIsOpenRef.current) {
        reset(DEFAULT_FORM_VALUES);
        setGeneratedId("");
        lastResetIdRef.current = null;
        lastModeRef.current = null;
      }
      lastIsOpenRef.current = false;
      return;
    }

    if (!lastIsOpenRef.current) {
      lastIsOpenRef.current = true;
    }

    // Handle ADD mode
    if (mode === "add") {
      if (lastModeRef.current !== "add") {
        reset(DEFAULT_FORM_VALUES);
        setGeneratedId("");
        lastResetIdRef.current = null;
        lastModeRef.current = "add";
      }
      return;
    }

    // Handle EDIT mode
    if (mode === "edit") {
      const currentId = actionData?.id ?? apiAgreementSegmentData?.id ?? null;

      if (!currentId) {
        return;
      }

      const shouldReset =
        lastModeRef.current !== "edit" || lastResetIdRef.current !== currentId;

      const dataToUse = apiAgreementSegmentData || actionData;

      if (shouldReset && dataToUse) {
        const formData = transformDataToForm(dataToUse as AgreementSegment);

        if (formData) {
          setGeneratedId(formData.agreementSegmentId);
          reset(formData);
          lastResetIdRef.current = currentId;
          lastModeRef.current = "edit";
        }
      } else if (
        apiAgreementSegmentData &&
        lastResetIdRef.current === apiAgreementSegmentData.id
      ) {
        // Update form when API data arrives (refinement after initial actionData)
        const formData = transformDataToForm(apiAgreementSegmentData);
        if (formData) {
          setGeneratedId(formData.agreementSegmentId);
          reset(formData, { keepDefaultValues: false });
        }
      }
    }
  }, [
    isOpen,
    mode,
    apiAgreementSegmentData,
    actionData,
    reset,
    transformDataToForm,
  ]);

  const onSubmit = useCallback(
    async (
      data: AgreementSegmentFormData & { agreementSegmentId?: string }
    ) => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);

        if (taskStatusLoading) {
          setErrorMessage(
            "Please wait for dropdown options to load before submitting."
          );
          return;
        }

        const validatedData = sanitizeAgreementSegmentData(data);
        const currentDataToEdit = apiAgreementSegmentData || actionData;
        const isEditing = Boolean(isEditMode && currentDataToEdit?.id);

        // Validate agreement segment ID for new segments
        if (!isEditing && !data.agreementSegmentId && !generatedId) {
          setErrorMessage(
            "Please generate an Agreement Segment ID before submitting."
          );
          return;
        }

        const isValid = await trigger();
        if (!isValid) {
          const errors: string[] = [];
          if (!data.segmentName) {
            errors.push("Agreement Segment Name is required");
          }
          if (!data.segmentDescription) {
            errors.push("Agreement Segment Description is required");
          }
          if (errors.length > 0) {
            setErrorMessage(
              `Please fill in the required fields: ${errors.join(", ")}`
            );
          }
          return;
        }

        const agreementSegmentId = isEditing
          ? String(currentDataToEdit?.id || "")
          : undefined;
        const formAgreementSegmentId = data.agreementSegmentId || generatedId;

        let agreementSegmentData:
          | CreateAgreementSegmentRequest
          | UpdateAgreementSegmentRequest;

        if (isEditing) {
          agreementSegmentData = {
            id: currentDataToEdit?.id,
            segmentName: validatedData.segmentName,
            segmentDescription: validatedData.segmentDescription,
            active: validatedData.active,
            enabled: true,
            deleted: false,
            ...(formAgreementSegmentId && { uuid: formAgreementSegmentId }),
            ...(validatedData.taskStatusDTO !== null &&
              validatedData.taskStatusDTO?.id && {
                taskStatusDTO: { id: validatedData.taskStatusDTO.id },
              }),
          } as UpdateAgreementSegmentRequest;
        } else {
          agreementSegmentData = {
            segmentName: validatedData.segmentName,
            segmentDescription: validatedData.segmentDescription,
            active: validatedData.active,
            enabled: true,
            deleted: false,
            ...(formAgreementSegmentId && { uuid: formAgreementSegmentId }),
            ...(validatedData.taskStatusDTO !== null &&
              validatedData.taskStatusDTO?.id && {
                taskStatusDTO: { id: validatedData.taskStatusDTO.id },
              }),
          } as CreateAgreementSegmentRequest;
        }

        const result = await saveAgreementSegmentMutation.mutateAsync({
          data: agreementSegmentData,
          isEditing,
          ...(agreementSegmentId && { agreementSegmentId }),
        });

        if (result?.uuid) {
          setGeneratedId(result.uuid);
        }

        setSuccessMessage(
          isEditing
            ? "Agreement Segment updated successfully!"
            : "Agreement Segment added successfully!"
        );

        if (
          isEditMode &&
          onAgreementSegmentUpdated &&
          agreementSegmentIndex !== null &&
          agreementSegmentIndex !== undefined
        ) {
          onAgreementSegmentUpdated(
            result as AgreementSegment,
            agreementSegmentIndex
          );
        } else if (onAgreementSegmentAdded) {
          onAgreementSegmentAdded(result as AgreementSegment);
        }

        setTimeout(() => {
          reset(DEFAULT_FORM_VALUES);
          setGeneratedId("");
          handleClose();
        }, 1500);
      } catch (error: unknown) {
        let errorMessage =
          "Failed to save agreement segment. Please try again.";
        if (error instanceof Error) {
          if (error.message.includes("validation")) {
            errorMessage = "Please check your input and try again.";
          } else {
            errorMessage = error.message;
          }
        }
        setErrorMessage(errorMessage);
      }
    },
    [
      taskStatusLoading,
      apiAgreementSegmentData,
      actionData,
      isEditMode,
      generatedId,
      trigger,
      saveAgreementSegmentMutation,
      agreementSegmentIndex,
      onAgreementSegmentUpdated,
      onAgreementSegmentAdded,
      reset,
    ]
  );

  const handleClose = useCallback(() => {
    reset(DEFAULT_FORM_VALUES);
    setErrorMessage(null);
    setSuccessMessage(null);
    setGeneratedId("");
    onClose();
  }, [reset, onClose]);

  // Style variables
  const isDark = theme.palette.mode === "dark";
  const textSecondary = isDark ? "#CBD5E1" : "#6B7280";
  const commonFieldStyles = useMemo(() => tokens.input, [tokens]);
  const errorFieldStyles = useMemo(() => tokens.inputError, [tokens]);
  const labelSx = tokens.label;
  const valueSx = tokens.value;

  const viewModeStyles = useMemo(
    () => ({
      backgroundColor: isDark ? alpha("#1E293B", 0.5) : "#F9FAFB",
      borderColor: isDark ? alpha("#FFFFFF", 0.2) : "#E5E7EB",
    }),
    [isDark]
  );

  const renderTextField = useCallback(
    (
      name: "segmentName" | "segmentDescription",
      label: string,
      gridSize: number = 6,
      required = false
    ) => (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          rules={{
            required: required ? `${label} is required` : false,
            validate: (_value, formValues) => {
              const result = validateAgreementSegmentSchema(
                formValues as AgreementSegmentFormData & {
                  agreementSegmentId?: string;
                }
              );
              if (result.success) {
                return true;
              }
              const fieldError = result.errors?.issues.find((issue) =>
                issue.path.some((p) => String(p) === name)
              );
              return fieldError ? fieldError.message : true;
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label={label}
              fullWidth
              required={required}
              error={!!errors[name]}
              helperText={errors[name]?.message?.toString()}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: valueSx }}
              sx={errors[name] ? errorFieldStyles : commonFieldStyles}
            />
          )}
        />
      </Grid>
    ),
    [control, errors, labelSx, valueSx, errorFieldStyles, commonFieldStyles]
  );

  const renderAgreementSegmentIdField = useCallback(
    (
      name: "agreementSegmentId",
      label: string,
      gridSize: number = 6,
      required = false
    ) => (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          defaultValue=""
          rules={{
            required: required ? `${label} is required` : false,
            validate: (value) => {
              if (
                mode === "add" &&
                (!value || (typeof value === "string" && value.trim() === ""))
              ) {
                return "Agreement Segment ID is required. Please generate an ID.";
              }
              return true;
            },
          }}
          render={({ field }) => {
            const fieldError = errors[name as keyof typeof errors];
            return (
              <TextField
                {...field}
                fullWidth
                label={label}
                required={required}
                value={field.value || generatedId}
                error={!!fieldError}
                helperText={fieldError?.message?.toString()}
                onChange={(e) => {
                  setGeneratedId(e.target.value);
                  field.onChange(e);
                }}
                disabled={isEditMode}
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
                          fontStyle: "normal",
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
                  sx: valueSx,
                }}
                InputLabelProps={{
                  sx: {
                    ...labelSx,
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
                  ...commonFieldStyles,
                  ...(isEditMode && {
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: viewModeStyles.backgroundColor,
                      color: textSecondary,
                      "& fieldset": {
                        borderColor: viewModeStyles.borderColor,
                      },
                      "&:hover fieldset": {
                        borderColor: viewModeStyles.borderColor,
                      },
                    },
                  }),
                }}
              />
            );
          }}
        />
      </Grid>
    ),
    [
      control,
      errors,
      generatedId,
      isEditMode,
      mode,
      handleGenerateNewId,
      isGeneratingId,
      theme,
      valueSx,
      labelSx,
      commonFieldStyles,
      viewModeStyles,
      textSecondary,
    ]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            fontStyle: "normal",
            fontSize: "20px",
            lineHeight: "28px",
            letterSpacing: "0.15px",
            verticalAlign: "middle",
            borderBottom: `1px solid ${tokens.dividerColor}`,
            backgroundColor: tokens.paper.backgroundColor as string,
            color: theme.palette.text.primary,
            pr: 3,
            pl: 3,
          }}
        >
          {isEditMode
            ? `${getLabel("CDL_COMMON_UPDATE")} ${getLabel("CDL_MAS_NAME")}`
            : `${getLabel("CDL_COMMON_ADD")} ${getLabel("CDL_MAS_NAME")}`}
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
                  backgroundColor:
                    theme.palette.mode === "dark"
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
              {renderAgreementSegmentIdField(
                "agreementSegmentId",
                getLabel("CDL_MAS_ID"),
                12,
                true
              )}
              {renderTextField(
                "segmentName",
                getLabel("CDL_MAS_NAME"),
                12,
                true
              )}
              {renderTextField(
                "segmentDescription",
                getLabel("CDL_MAS_DESCRIPTION"),
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
                theme.palette.mode === "dark" ? 0.92 : 0.9
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
                  disabled={
                    saveAgreementSegmentMutation.isPending || taskStatusLoading
                  }
                  sx={{
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 500,
                    fontStyle: "normal",
                    fontSize: "14px",
                    lineHeight: "20px",
                    letterSpacing: 0,
                    borderWidth: "1px",
                    borderColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.primary.main
                        : undefined,
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
                  disabled={
                    saveAgreementSegmentMutation.isPending || taskStatusLoading
                  }
                  sx={{
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 500,
                    fontStyle: "normal",
                    fontSize: "14px",
                    lineHeight: "20px",
                    letterSpacing: 0,
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.primary.main
                        : "transparent",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                      borderColor:
                        theme.palette.mode === "dark"
                          ? theme.palette.primary.main
                          : "transparent",
                    },
                    "&:disabled": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.grey[600], 0.5)
                          : theme.palette.grey[300],
                      borderColor:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.primary.main, 0.5)
                          : "transparent",
                      color: theme.palette.text.disabled,
                    },
                  }}
                >
                  {saveAgreementSegmentMutation.isPending
                    ? isEditMode
                      ? getLabel("CDL_COMMON_UPDATING")
                      : getLabel("CDL_COMMON_ADDING")
                    : isEditMode
                      ? getLabel("CDL_COMMON_UPDATE")
                      : getLabel("CDL_COMMON_ADD")}
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
    </LocalizationProvider>
  );
};
