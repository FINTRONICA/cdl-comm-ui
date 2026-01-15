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
import {
  useSaveCurrency,
  useCurrency,
} from "@/hooks/master/CustomerHook/useCurrency";
import {
  validateCurrencyData as validateCurrencySchema,
  sanitizeCurrencyData,
  type CurrencyFormData,
} from "@/lib/validation/masterValidation/CurrencySchemas";
import type {
  CreateCurrencyRequest,
  UpdateCurrencyRequest,
  Currency,
  TaskStatusDTO,
} from "@/services/api/masterApi/Customer/currencyService";
import { getMasterLabel } from "@/constants/mappings/master/masterMapping";
import { alpha, useTheme } from "@mui/material/styles";
import { buildPanelSurfaceTokens } from "../panelTheme";
import { useTaskStatuses } from "@/hooks/master/CustomerHook/useTaskStatus";
import { idService } from "@/services/api/developerIdService";

interface RightSlideCurrencyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCurrencyAdded?: (currency: Currency) => void;
  onCurrencyUpdated?: (currency: Currency, index: number) => void;
  title?: string;
  mode?: "add" | "edit";
  actionData?: Currency | null;
  currencyIndex?: number | undefined;
  taskStatusOptions?: TaskStatusDTO[];
  taskStatusLoading?: boolean;
  taskStatusError?: unknown;
}

export const RightSlideCurrencyPanel: React.FC<
  RightSlideCurrencyPanelProps
> = ({
  isOpen,
  onClose,
  onCurrencyAdded,
  onCurrencyUpdated,
  mode = "add",
  actionData,
  currencyIndex,
  taskStatusOptions: _propTaskStatusOptions = [], // eslint-disable-line @typescript-eslint/no-unused-vars
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
  const saveCurrencyMutation = useSaveCurrency();

  // Fetch full currency data when in edit mode
  const { data: apiCurrencyData } = useCurrency(
    isEditMode && actionData?.id ? String(actionData.id) : null
  );

  // Fetch task statuses
  const { isLoading: taskStatusesLoading } = useTaskStatuses();
  const taskStatusLoading = propTaskStatusLoading || taskStatusesLoading;
  const taskStatusError = propTaskStatusError || null;

  const getCurrencyLabelDynamic = useCallback((configId: string): string => {
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
  } = useForm<CurrencyFormData & { currencyId?: string }>({
    defaultValues: {
      currencyId: "",
      description: "",
      isEnabled: true,
      taskStatusDTO: null,
    },
    mode: "onChange",
  });

  // Sync currencyId from form to generatedId state
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "currencyId" && value.currencyId) {
        setGeneratedId(value.currencyId);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Track the last reset ID and mode to prevent unnecessary resets
  const lastResetIdRef = useRef<string | number | null>(null);
  const lastModeRef = useRef<"add" | "edit" | null>(null);
  const lastIsOpenRef = useRef<boolean>(false);

  // Reset form when panel opens/closes or mode/data changes
  useEffect(() => {
    if (!isOpen) {
      if (lastIsOpenRef.current) {
        reset({
          currencyId: "",
          description: "",
          isEnabled: true,
          taskStatusDTO: null,
        });
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

    const currentId = (apiCurrencyData?.id || actionData?.id) ?? null;
    const shouldReset =
      lastModeRef.current !== mode ||
      (isEditMode && lastResetIdRef.current !== currentId) ||
      (isEditMode && !lastResetIdRef.current && currentId);

    if (isEditMode) {
      // Wait for API data to load if we're in edit mode, but use actionData as fallback
      if (taskStatusLoading && !actionData) {
        return;
      }

      if (shouldReset && (apiCurrencyData || actionData)) {
        const dataToUse = apiCurrencyData || actionData;
        if (!dataToUse) return;

        const currencyId = dataToUse.uuid || `MCUR-${dataToUse.id}` || "";
        setGeneratedId(currencyId);

        reset({
          currencyId: currencyId,
          description: dataToUse.description || "",
          isEnabled: dataToUse.isEnabled ?? true,
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
      reset({
        currencyId: "",
        description: "",
        isEnabled: true,
        taskStatusDTO: null,
      });
      setGeneratedId("");
      lastResetIdRef.current = null;
      lastModeRef.current = mode;
    }
  }, [
    isOpen,
    mode,
    isEditMode,
    apiCurrencyData,
    actionData,
    taskStatusLoading,
    reset,
  ]);

  const handleGenerateNewId = useCallback(async () => {
    try {
      setIsGeneratingId(true);
      const newIdResponse = idService.generateNewId("MCUR");
      setGeneratedId(newIdResponse.id);
      setValue("currencyId", newIdResponse.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      setErrorMessage(
        "Failed to generate Currency ID. Please try again or enter manually."
      );
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Error generating currency ID:", error);
      }
    } finally {
      setIsGeneratingId(false);
    }
  }, [setValue]);

  const validateCurrencyField = useCallback(
    (
      fieldName: keyof CurrencyFormData | "currencyId",
      value: unknown,
      allValues: CurrencyFormData & { currencyId?: string }
    ): string | boolean => {
      try {
        const requiredFields: Record<string, string> = {
          description: "Currency Description is required",
        };

        if (requiredFields[fieldName]) {
          if (!value || (typeof value === "string" && value.trim() === "")) {
            return requiredFields[fieldName];
          }
        }

        // Validate currency ID for new currencies (not in edit mode)
        if (fieldName === "currencyId" && !isEditMode) {
          if (!value || (typeof value === "string" && value.trim() === "")) {
            return "Currency ID is required. Please generate an ID.";
          }
        }

        if (
          fieldName === "description" &&
          value &&
          typeof value === "string" &&
          value.trim() !== ""
        ) {
          const result = validateCurrencySchema(allValues);
          if (result.success) {
            return true;
          } else {
            const fieldError = result.errors?.issues.find((issue) =>
              issue.path.some((p) => String(p) === fieldName)
            );
            return fieldError ? fieldError.message : true;
          }
        }

        return true;
      } catch {
        return true;
      }
    },
    [isEditMode, validateCurrencySchema]
  );

  const onSubmit = useCallback(
    async (data: CurrencyFormData & { currencyId?: string }) => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);

        if (taskStatusLoading) {
          setErrorMessage(getCurrencyLabelDynamic("CDL_COMMON_SUBMIT_WAIT"));
          return;
        }

        const validatedData = sanitizeCurrencyData(data);
        const currentDataToEdit = apiCurrencyData || actionData;
        const isEditing = Boolean(isEditMode && currentDataToEdit?.id);

        // Validate currency ID for new currencies
        if (!isEditing && !data.currencyId && !generatedId) {
          setErrorMessage("Please generate a Currency ID before submitting.");
          return;
        }

        const isValid = await trigger();
        if (!isValid) {
          const errors: string[] = [];
          if (!data.description) {
            errors.push("Currency Description is required");
          }
          if (errors.length > 0) {
            setErrorMessage(
              `${getCurrencyLabelDynamic("CDL_COMMON_REQUIRED_FIELDS_PREFIX")} ${errors.join(", ")}`
            );
          }
          return;
        }

        const currencyId = isEditing
          ? String(currentDataToEdit?.id || "")
          : undefined;
        const formCurrencyId = data.currencyId || generatedId;

        let currencyData: CreateCurrencyRequest | UpdateCurrencyRequest;

        if (isEditing) {
          currencyData = {
            id: currentDataToEdit?.id,
            description: validatedData.description,
            isEnabled: validatedData.isEnabled,
            enabled: true,
            deleted: false,
            ...(formCurrencyId && { uuid: formCurrencyId }),
            ...(validatedData.taskStatusDTO !== null &&
              validatedData.taskStatusDTO?.id && {
                taskStatusDTO: { id: validatedData.taskStatusDTO.id },
              }),
          } as UpdateCurrencyRequest;
        } else {
          currencyData = {
            description: validatedData.description,
            isEnabled: validatedData.isEnabled,
            enabled: true,
            deleted: false,
            ...(formCurrencyId && { uuid: formCurrencyId }),
            ...(validatedData.taskStatusDTO !== null &&
              validatedData.taskStatusDTO?.id && {
                taskStatusDTO: { id: validatedData.taskStatusDTO.id },
              }),
          } as CreateCurrencyRequest;
        }

        const result = await saveCurrencyMutation.mutateAsync({
          data: currencyData,
          isEditing,
          ...(currencyId && { currencyId }),
        });

        // Update generatedId with the UUID from the response if available
        if (result?.uuid) {
          setGeneratedId(result.uuid);
        }

        setSuccessMessage(
          isEditing
            ? "Currency updated successfully!"
            : "Currency added successfully!"
        );

        if (
          isEditMode &&
          onCurrencyUpdated &&
          currencyIndex !== null &&
          currencyIndex !== undefined
        ) {
          onCurrencyUpdated(result as Currency, currencyIndex);
        } else if (onCurrencyAdded) {
          onCurrencyAdded(result as Currency);
        }

        setTimeout(() => {
          reset();
          setGeneratedId("");
          handleClose();
        }, 1500);
      } catch (error: unknown) {
        let errorMessage = "Failed to save currency. Please try again.";
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
      apiCurrencyData,
      actionData,
      isEditMode,
      generatedId,
      trigger,
      saveCurrencyMutation,
      onCurrencyUpdated,
      onCurrencyAdded,
      currencyIndex,
      reset,
      getCurrencyLabelDynamic,
    ]
  );

  const handleClose = useCallback(() => {
    reset();
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
      name: "description",
      label: string,
      gridSize: number = 6,
      required = false
    ) => (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          rules={{
            validate: (value, formValues) =>
              validateCurrencyField(name, value, formValues),
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
    [
      control,
      errors,
      validateCurrencyField,
      labelSx,
      valueSx,
      errorFieldStyles,
      commonFieldStyles,
    ]
  );

  const renderCurrencyIdField = useCallback(
    (
      name: "currencyId",
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
            validate: (value, formValues) =>
              validateCurrencyField(
                name,
                value,
                formValues as CurrencyFormData & { currencyId?: string }
              ),
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
      isGeneratingId,
      validateCurrencyField,
      handleGenerateNewId,
      theme,
      labelSx,
      valueSx,
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
            ? `${getCurrencyLabelDynamic("CDL_COMMON_UPDATE")} ${getCurrencyLabelDynamic("CDL_MCUR_NAME")}`
            : `${getCurrencyLabelDynamic("CDL_COMMON_ADD")} ${getCurrencyLabelDynamic("CDL_MCUR_NAME")}`}
          <IconButton
            onClick={onClose}
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
                {getCurrencyLabelDynamic("CDL_COMMON_DROPDOWNS_LOAD_FAILED")}
              </Alert>
            )}

            <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
              {renderCurrencyIdField(
                "currencyId",
                getCurrencyLabelDynamic("CDL_MCUR_ID"),
                12,
                true
              )}
              {renderTextField(
                "description",
                getCurrencyLabelDynamic("CDL_MCUR_DESCRIPTION"),
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
                  disabled={saveCurrencyMutation.isPending || taskStatusLoading}
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
                  {getCurrencyLabelDynamic("CDL_COMMON_CANCEL")}
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={saveCurrencyMutation.isPending || taskStatusLoading}
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
                  {saveCurrencyMutation.isPending
                    ? isEditMode
                      ? getCurrencyLabelDynamic("CDL_COMMON_UPDATING")
                      : getCurrencyLabelDynamic("CDL_COMMON_ADDING")
                    : isEditMode
                      ? getCurrencyLabelDynamic("CDL_COMMON_UPDATE")
                      : getCurrencyLabelDynamic("CDL_COMMON_ADD")}
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
