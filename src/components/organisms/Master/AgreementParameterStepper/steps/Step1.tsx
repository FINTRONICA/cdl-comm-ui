import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
  alpha,
  Button,
  InputAdornment,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material'
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { getAgreementParameterLabel } from "@/constants/mappings/master/Entity/agreementParameterMapping";
import { useAgreementParameterLabelsWithCache } from "@/hooks";
import { useAppStore } from "@/store";
import { agreementParameterService } from "@/services/api/masterApi/Entitie/agreementParameterService";
import { validateAgreementParameterField } from "@/lib/validation/masterValidation/agreementParameterSchemas";
import { useApplicationSettings } from "@/hooks/useApplicationSettings";
import {
  commonFieldStyles as sharedCommonFieldStyles,
  selectStyles as sharedSelectStyles,
  datePickerStyles as sharedDatePickerStyles,
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  cardStyles as sharedCardStyles,
  viewModeInputStyles,
  neutralBorder,
  neutralBorderHover,
  calendarIconSx as sharedCalendarIconSx,
} from "../styles";

interface Step1Props {
  isReadOnly?: boolean;
  agreementParameterId?: string | undefined;
}

const Step1 = ({ isReadOnly = false, agreementParameterId }: Step1Props) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const textPrimary = isDark ? "#FFFFFF" : "#1E2939";
  const textSecondary = isDark ? "#CBD5E1" : "#6B7280";
  const fieldStyles = React.useMemo(() => {
    if (typeof sharedCommonFieldStyles === "function") {
      return sharedCommonFieldStyles(theme);
    }
    return sharedCommonFieldStyles;
  }, [theme]);
  const [generatedId, setGeneratedId] = useState<string>("");
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false);

  const selectFieldStyles = React.useMemo(() => {
    if (typeof sharedSelectStyles === "function") {
      return sharedSelectStyles(theme);
    }
    return sharedSelectStyles;
  }, [theme]);

  const datePickerFieldStyles = React.useMemo(() => {
    if (typeof sharedDatePickerStyles === "function") {
      return sharedDatePickerStyles(theme);
    }
    return sharedDatePickerStyles;
  }, [theme]);

  const labelStyles = React.useMemo(() => {
    if (typeof sharedLabelSx === "function") {
      return sharedLabelSx(theme);
    }
    return sharedLabelSx;
  }, [theme]);

  const valueStyles = React.useMemo(() => {
    if (typeof sharedValueSx === "function") {
      return sharedValueSx(theme);
    }
    return sharedValueSx;
  }, [theme]);

  const cardBaseStyles = React.useMemo(() => {
    if (typeof sharedCardStyles === "function") {
      return sharedCardStyles(theme);
    }
    return sharedCardStyles;
  }, [theme]);

  const calendarIconStyles = React.useMemo(() => {
    if (typeof sharedCalendarIconSx === "function") {
      return sharedCalendarIconSx(theme);
    }
    return sharedCalendarIconSx;
  }, [theme]);

  const viewModeStyles = viewModeInputStyles(theme);
  const neutralBorderColor = neutralBorder(theme);
  const neutralBorderHoverColor = neutralBorderHover(theme);
  const focusBorder = theme.palette.primary.main;

  // Check if we're in edit mode (existing agreement parameter)
  const isEditMode = !!agreementParameterId;
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext();

  // Dynamic label support
  const { data: agreementParameterLabels, getLabel } =
    useAgreementParameterLabelsWithCache();
  const currentLanguage = useAppStore((state) => state.language) || "EN";

  const getAgreementParameterLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAgreementParameterLabel(configId);

      if (agreementParameterLabels) {
        return getLabel(configId, currentLanguage, fallback);
      }
      return fallback;
    },
    [agreementParameterLabels, currentLanguage, getLabel]
  );

  const resolveSx = (styles: unknown) => {
    if (typeof styles === "function") {
      return styles(theme) as Record<string, unknown>;
    }
    if (Array.isArray(styles)) {
      return Object.assign({}, ...styles) as Record<string, unknown>;
    }
    if (styles && typeof styles === "object") {
      return styles as Record<string, unknown>;
    }
    return {};
  };

  const getDtoId = (value: unknown): number | undefined => {
    if (value && typeof value === "object" && "id" in value) {
      const idValue = (value as { id?: number | string }).id;
      return idValue !== undefined && idValue !== null ? Number(idValue) : undefined;
    }
    if (typeof value === "number") {
      return value;
    }
    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
    return undefined;
  };

  // Initialize agreement parameter ref no from form value
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.parametersRefNo) {
        setGeneratedId(String(value.parametersRefNo));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const {
    data: permittedInvestmentAllowedSettings = [],
    loading: permittedInvestmentAllowedLoading,
    error: permittedInvestmentAllowedError,
  } = useApplicationSettings("PERMITTED_INVESTMENT_ALLOWED");
  const {
    data: amendmentAllowedSettings = [],
    loading: amendmentAllowedLoading,
    error: amendmentAllowedError,
  } = useApplicationSettings("AMENDMENT_ALLOWED");
  const {
    data: dealClosureBasisSettings = [],
    loading: dealClosureBasisLoading,
    error: dealClosureBasisError,
  } = useApplicationSettings("DEAL_CLOSURE_BASIS");
  const {
    data: permittedInvestmentASettings = [],
    loading: permittedInvestmentALoading,
    error: permittedInvestmentAError,
  } = useApplicationSettings("PERMITTED_INVESTMENT");

  const permittedInvestmentAllowedOptions = React.useMemo(
    () =>
      permittedInvestmentAllowedSettings.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      })),
    [permittedInvestmentAllowedSettings]
  );

  const amendmentAllowedOptions = React.useMemo(
    () =>
      amendmentAllowedSettings.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      })),
    [amendmentAllowedSettings]
  );

  const dealClosureBasisOptions = React.useMemo(
    () =>
      dealClosureBasisSettings.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      })),
    [dealClosureBasisSettings]
  );

  const permittedInvestmentAOptions = React.useMemo(
    () =>
      permittedInvestmentASettings.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      })),
    [permittedInvestmentASettings]
  );

  // Populate fields when agreement parameter data is loaded (for edit mode)
  useEffect(() => {
    if (!agreementParameterId || !isEditMode) {
      return;
    }

    let isPopulating = false;
    const populateFields = async () => {
      if (isPopulating) return;
      isPopulating = true;

      try {
        // Wait a bit for form reset to complete
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Fetch agreement parameter data to populate fields
        const agreementParameter =
          await agreementParameterService.getAgreementParameter(
            agreementParameterId
          );

        // Populate fields if they exist in API response and form fields are empty
        if (agreementParameter?.parametersRefNo !== undefined && agreementParameter?.parametersRefNo !== null) {
          const currentRefNo = watch("parametersRefNo");
          if (!currentRefNo) {
            setValue("parametersRefNo", String(agreementParameter.parametersRefNo), {
              shouldValidate: true,
              shouldDirty: false,
            });
          }
        }

        if (agreementParameter?.agreementEffectiveDate) {
          const currentEffectiveDate = watch("agreementEffectiveDate");
          if (!currentEffectiveDate) {
            setValue(
              "agreementEffectiveDate",
              agreementParameter.agreementEffectiveDate,
              {
                shouldValidate: true,
                shouldDirty: false,
              }
            );
          }
        }

        if (agreementParameter?.agreementExpiryDate) {
          const currentExpiryDate = watch("agreementExpiryDate");
          if (!currentExpiryDate) {
            setValue(
              "agreementExpiryDate",
              agreementParameter.agreementExpiryDate,
              {
                shouldValidate: true,
                shouldDirty: false,
              }
            );
          }
        }

        if (agreementParameter?.agreementRemarks !== undefined && agreementParameter?.agreementRemarks !== null) {
          const currentRemarks = watch("agreementRemarks");
          if (!currentRemarks || currentRemarks.trim() === "") {
            setValue("agreementRemarks", String(agreementParameter.agreementRemarks), {
              shouldValidate: true,
              shouldDirty: false,
            });
          }
        }

        const permittedInvestmentAllowedId = getDtoId(
          agreementParameter?.permittedInvestmentAllowedDTO
        );
        if (permittedInvestmentAllowedId !== undefined) {
          const currentPermittedInvestment = watch(
            "permittedInvestmentAllowedDTO"
          );
          if (!currentPermittedInvestment) {
            setValue("permittedInvestmentAllowedDTO", { id: permittedInvestmentAllowedId }, {
              shouldValidate: false,
              shouldDirty: false,
            });
          }
        }

        const amendmentAllowedId = getDtoId(agreementParameter?.amendmentAllowedDTO);
        if (amendmentAllowedId !== undefined) {
          const currentAmendment = watch("amendmentAllowedDTO");
          if (!currentAmendment) {
            setValue("amendmentAllowedDTO", { id: amendmentAllowedId }, {
              shouldValidate: false,
              shouldDirty: false,
            });
          }
        }

        const dealClosureBasisId = getDtoId(agreementParameter?.dealClosureBasisDTO);
        if (dealClosureBasisId !== undefined) {
          const currentClosureBasis = watch("dealClosureBasisDTO");
          if (!currentClosureBasis) {
            setValue("dealClosureBasisDTO", { id: dealClosureBasisId }, {
              shouldValidate: false,
              shouldDirty: false,
            });
          }
        }

        const permittedInvestmentAId = getDtoId(
          agreementParameter?.permittedInvestmentADTO
        );
        if (permittedInvestmentAId !== undefined) {
          const currentPermittedInvestmentA = watch("permittedInvestmentADTO");
          if (!currentPermittedInvestmentA) {
            setValue("permittedInvestmentADTO", { id: permittedInvestmentAId }, {
              shouldValidate: false,
              shouldDirty: false,
            });
          }
        }

        if (agreementParameter?.active !== undefined) {
          const currentActive = watch("active");
          if (currentActive === undefined || currentActive === null) {
            setValue("active", agreementParameter.active, {
              shouldValidate: true,
              shouldDirty: false,
            });
          }
        }
      } catch {
        // Error handled silently - form will remain empty
      } finally {
        isPopulating = false;
      }
    };

    populateFields();

    return () => {};
  }, [agreementParameterId, isEditMode, watch, setValue]);

  // Watch for effective date changes and validate expiry date
  const effectiveDate = watch("agreementEffectiveDate");
  useEffect(() => {
    if (effectiveDate) {
      // Trigger validation on expiry date when effective date changes
      trigger("agreementExpiryDate");
    }
  }, [effectiveDate, trigger]);

  const dropdownsErrorMessage =
    permittedInvestmentAllowedError ||
    amendmentAllowedError ||
    dealClosureBasisError ||
    permittedInvestmentAError;
  const dropdownsError = dropdownsErrorMessage
    ? new Error(dropdownsErrorMessage)
    : null;

  const permittedInvestmentAllowedSelection = useWatch({
    control,
    name: "permittedInvestmentAllowedDTO",
  });
  const isPermittedInvestmentAllowed = React.useMemo(() => {
    const isYesValue = (value: unknown) => {
      const normalized = String(value || "")
        .trim()
        .toUpperCase();
      if (!normalized) return false;
      if (["NO", "N", "FALSE", "0", "CDL_NO"].includes(normalized)) return false;
      if (["YES", "Y", "TRUE", "1", "CDL_YES"].includes(normalized)) return true;
      if (normalized.includes("YES")) return true;
      return false;
    };

    if (
      typeof permittedInvestmentAllowedSelection === "string" ||
      typeof permittedInvestmentAllowedSelection === "number" ||
      typeof permittedInvestmentAllowedSelection === "boolean"
    ) {
      return isYesValue(permittedInvestmentAllowedSelection);
    }

    if (
      permittedInvestmentAllowedSelection &&
      typeof permittedInvestmentAllowedSelection === "object"
    ) {
      if ("settingValue" in permittedInvestmentAllowedSelection) {
        return isYesValue(
          (permittedInvestmentAllowedSelection as { settingValue?: string })
            .settingValue
        );
      }
      if ("displayName" in permittedInvestmentAllowedSelection) {
        return isYesValue(
          (permittedInvestmentAllowedSelection as { displayName?: string })
            .displayName
        );
      }

      const allowedId = getDtoId(permittedInvestmentAllowedSelection);
      if (allowedId === undefined) return false;
      const option = permittedInvestmentAllowedOptions.find(
        (item) => item.id === allowedId
      );
      if (!option) {
        return false;
      }
      return isYesValue(option?.settingValue || option?.displayName || "");
    }

    return false;
  }, [permittedInvestmentAllowedSelection, permittedInvestmentAllowedOptions]);

  useEffect(() => {
    if (!isPermittedInvestmentAllowed) {
      setValue("permittedInvestmentADTO", null, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [isPermittedInvestmentAllowed, setValue]);

  const renderTextField = (
    name: string,
    label: string,
    defaultValue = "",
    gridSize: number = 6,
    disabled = false,
    required = false
  ) => (
    <Grid key={`field-${name}`} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue === undefined ? "" : defaultValue}
        rules={{
          required: required ? `${label} is required` : false,
          validate: (value: unknown) => {
            // Skip validation for optional empty fields
            if (
              !required &&
              (!value || value === "" || value === null || value === undefined)
            ) {
              return true;
            }

            // For required fields, check if empty
            if (required && (!value || value === "")) {
              return `${label} is required`;
            }

            // Only validate non-empty values
            try {
              return validateAgreementParameterField(0, name, value);
            } catch {
              return `${label} validation failed`;
            }
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label={label}
            fullWidth
            required={required}
            disabled={disabled || isReadOnly}
            error={!!errors[name]}
            helperText={errors[name]?.message?.toString()}
            InputLabelProps={{
              sx: {
                ...labelStyles,
                ...(!!errors[name] && {
                  color: theme.palette.error.main,
                  "&.Mui-focused": { color: theme.palette.error.main },
                  "&.MuiFormLabel-filled": { color: theme.palette.error.main },
                }),
              },
            }}
            InputProps={{
              sx: {
                ...valueStyles,
                ...(isReadOnly && {
                  color: textSecondary,
                }),
              },
            }}
            sx={{
              ...(typeof fieldStyles === "object" ? fieldStyles : {}),
              ...(disabled && {
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
              ...(!!errors[name] &&
                !isReadOnly && {
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: theme.palette.error.main,
                    },
                    "&:hover fieldset": {
                      borderColor: theme.palette.error.main,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.error.main,
                    },
                  },
                }),
            }}
          />
        )}
      />
    </Grid>
  );

  const renderDatePicker = (
    name: string,
    label: string,
    gridSize: number = 6,
    required = false
  ) => {
    // Get effective date value for expiry date validation
    const effectiveDateValue = watch("agreementEffectiveDate");
    const effectiveDate = effectiveDateValue ? dayjs(effectiveDateValue) : null;

    // Determine minDate and maxDate based on field name
    const isExpiryDate = name === "agreementExpiryDate";
    const minDate =
      isExpiryDate && effectiveDate ? effectiveDate.add(1, "day") : null;
    const minDateProps = minDate ? { minDate } : {};

    return (
      <Grid key={`field-${name}`} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          rules={{
            required: required ? `${label} is required` : false,
            validate: (value: unknown) => {
              try {
                // Handle empty values
                if (
                  !value ||
                  value === "" ||
                  value === null ||
                  value === undefined
                ) {
                  if (required) {
                    return `${label} is required`;
                  }
                  return true; // Optional field, no validation needed
                }

                // Date validation - handle date fields specially
                if (
                  name === "agreementEffectiveDate" ||
                  name === "agreementExpiryDate"
                ) {
                  // Handle different date value formats
                  let dateValue: dayjs.Dayjs | null = null;

                  if (typeof value === "string") {
                    dateValue = dayjs(value);
                  } else if (
                    value &&
                    typeof value === "object" &&
                    "isValid" in value
                  ) {
                    // It's already a Dayjs object
                    dateValue = value as dayjs.Dayjs;
                  } else if (value instanceof Date) {
                    dateValue = dayjs(value);
                  } else {
                    return `${label} must be a valid date`;
                  }

                  if (!dateValue || !dateValue.isValid()) {
                    return `${label} must be a valid date`;
                  }

                  // Cross-field validation for expiry date
                  if (
                    isExpiryDate &&
                    effectiveDate &&
                    effectiveDate.isValid()
                  ) {
                    if (
                      dateValue.isBefore(effectiveDate) ||
                      dateValue.isSame(effectiveDate)
                    ) {
                      return "Expiry Date must be after Effective Date";
                    }
                  }

                  return true; // Date is valid
                }

                // For non-date fields, use the schema validation
                // But skip validation for dropdown fields (they don't need field-level validation)
                if (
                  name === "permittedInvestmentAllowedDTO" ||
                  name === "permittedInvestmentADTO" ||
                  name === "amendmentAllowedDTO" ||
                  name === "dealClosureBasisDTO"
                ) {
                  return true; // Dropdowns don't need validation
                }

                return validateAgreementParameterField(0, name, value);
              } catch {
                // Return a more specific error message
                return `${label} validation failed`;
              }
            },
          }}
          render={({ field }) => {
            const value = field.value ? dayjs(field.value) : null;
            return (
              <DatePicker
                label={label}
                value={value as Dayjs | null}
                onChange={(newValue) => {
                  field.onChange(newValue ? newValue.toISOString() : "");
                  // Trigger validation for expiry date when effective date changes
                  if (name === "agreementEffectiveDate") {
                    // When effective date changes, validate expiry date
                    setTimeout(() => {
                      trigger("agreementExpiryDate");
                    }, 100);
                  } else if (isExpiryDate) {
                    // When expiry date changes, validate it
                    trigger("agreementExpiryDate");
                  }
                }}
                {...minDateProps}
                disabled={isReadOnly}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: required,
                    error: !!errors[name],
                    helperText: errors[name]?.message?.toString(),
                    InputLabelProps: {
                      sx: {
                        ...labelStyles,
                        ...(!!errors[name] && {
                          color: theme.palette.error.main,
                          "&.Mui-focused": { color: theme.palette.error.main },
                          "&.MuiFormLabel-filled": {
                            color: theme.palette.error.main,
                          },
                        }),
                      },
                    },
                    InputProps: {
                      sx: {
                        ...valueStyles,
                        ...(isReadOnly && {
                          color: textSecondary,
                        }),
                      },
                    },
                    sx: {
                      ...(typeof datePickerFieldStyles === "object"
                        ? datePickerFieldStyles
                        : {}),
                      ...(!!errors[name] &&
                        !isReadOnly && {
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: theme.palette.error.main,
                            },
                            "&:hover fieldset": {
                              borderColor: theme.palette.error.main,
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }),
                    },
                  },
                }}
                sx={calendarIconStyles}
              />
            );
          }}
        />
      </Grid>
    );
  };
  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true);
      // Generate a simple ID - can be replaced with actual service call
      const newId = `AGR-${Date.now()}`;
      setGeneratedId(newId);
      setValue("parametersRefNo", newId, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch {
      // Handle error silently
    } finally {
      setIsGeneratingId(false);
    }
  };
  const renderAgreementParameterRefNoField = (
    name: string,
    label: string,
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={`field-${name}`} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        rules={{
          required: required ? `${label} is required` : false,
        }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={label}
            required={required}
            value={field.value || generatedId}
            error={!!errors[name]}
            helperText={errors[name]?.message?.toString()}
            onChange={(e) => {
              setGeneratedId(e.target.value)
              field.onChange(e)
            }}
            disabled={isReadOnly || isEditMode}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 0 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleGenerateNewId}
                    disabled={isGeneratingId || isReadOnly || isEditMode}
                    sx={{
                      color: theme.palette.primary.contrastText,
                      borderRadius: '8px',
                      textTransform: 'none',
                      background: theme.palette.primary.main,
                      '&:hover': {
                        background: theme.palette.primary.dark,
                      },
                      minWidth: '100px',
                      height: '32px',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 500,
                      fontStyle: 'normal',
                      fontSize: '11px',
                      lineHeight: '14px',
                      letterSpacing: '0.3px',
                      px: 1,
                    }}
                  >
                    {isGeneratingId ? 'Generating...' : 'Generate ID'}
                  </Button>
                </InputAdornment>
              ),
              sx: valueStyles,
            }}
            InputLabelProps={{
              sx: {
                ...labelStyles,
                ...(!!errors[name] && {
                  color: theme.palette.error.main,
                  '&.Mui-focused': { color: theme.palette.error.main },
                  '&.MuiFormLabel-filled': { color: theme.palette.error.main },
                }),
              },
            }}
            sx={{
              ...fieldStyles,
              ...((isReadOnly || isEditMode) && {
                '& .MuiOutlinedInput-root': {
                  backgroundColor: viewModeStyles.backgroundColor,
                  color: textSecondary,
                  '& fieldset': {
                    borderColor: viewModeStyles.borderColor,
                  },
                  '&:hover fieldset': {
                    borderColor: viewModeStyles.borderColor,
                  },
                },
              }),
            }}
          />
        )}
      />
    </Grid>
  )


  const renderApiSelectField = (
    name: string,
    label: string,
    options: { id: number; displayName: string; settingValue: string }[],
    gridSize: number = 6,
    loading = false,
    required = false
  ) => {
    return (
      <Grid key={`field-${name}`} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          rules={{
            required: required ? `${label} is required` : false,
            // Removed validation - dropdowns don't need field validation
          }}
          defaultValue=""
          render={({ field, fieldState: { error } }) => {
            const fieldValue =
              typeof field.value === "object" && field.value?.id
                ? options.find((opt) => opt.id === field.value.id)?.settingValue || ""
                : field.value || "";

            return (
              <FormControl fullWidth error={!!error} required={required}>
                <InputLabel sx={labelStyles}>
                  {loading ? `Loading...` : label}
                </InputLabel>
                <Select
                  {...field}
                  label={loading ? "Loading..." : label}
                  required={required}
                  sx={{
                    ...resolveSx(selectFieldStyles),
                    ...resolveSx(valueStyles),
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: `1px solid ${neutralBorderColor}`,
                      borderRadius: "6px",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      border: `1px solid ${neutralBorderHoverColor}`,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: `2px solid ${focusBorder}`,
                    },
                    ...(isReadOnly && {
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: viewModeStyles.backgroundColor,
                        "& fieldset": {
                          borderColor: viewModeStyles.borderColor,
                        },
                        "&:hover fieldset": {
                          borderColor: viewModeStyles.borderColor,
                        },
                      },
                      "& .MuiSelect-select": {
                        color: viewModeStyles.textColor,
                      },
                    }),
                    ...(!!errors[name] &&
                      !isReadOnly && {
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: `1px solid ${theme.palette.error.main}`,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          border: `1px solid ${theme.palette.error.main}`,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          border: `1px solid ${theme.palette.error.main}`,
                        },
                      }),
                  }}
                  IconComponent={KeyboardArrowDownIcon}
                  disabled={loading || isReadOnly}
                  value={fieldValue}
                  onChange={(e) => {
                    const selectedValue = e.target.value as string;
                    const selectedOption = options.find(
                      (opt) => opt.settingValue === selectedValue
                    );
                    if (selectedOption) {
                      const nextValue =
                        name === "permittedInvestmentAllowedDTO"
                          ? {
                              id: selectedOption.id,
                              settingValue: selectedOption.settingValue,
                              displayName: selectedOption.displayName,
                            }
                          : { id: selectedOption.id };
                      setValue(name, nextValue, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    } else {
                      setValue(name, null, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }
                  }}
                >
                  {options.map((option) => (
                    <MenuItem key={option.id} value={option.settingValue}>
                      {option.displayName}
                    </MenuItem>
                  ))}
                </Select>
                {error && (
                  <FormHelperText
                    error
                    sx={{
                      fontFamily: "Outfit, sans-serif",
                      fontSize: "12px",
                      marginLeft: "14px",
                      marginRight: "14px",
                      marginTop: "4px",
                    }}
                  >
                    {error?.message?.toString()}
                  </FormHelperText>
                )}
              </FormControl>
            );
          }}
        />
      </Grid>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          ...cardBaseStyles,
          width: "84%",
          margin: "0 auto",
        }}
      >
        <CardContent sx={{ color: textPrimary }}>
          {/* Show error if dropdowns fail to load */}
          {dropdownsError && (
            <Box
              sx={{
                mb: 2,
                p: 1,
                bgcolor: isDark
                  ? alpha(theme.palette.error.main, 0.15)
                  : "#fef2f2",
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.error.main, 0.4)}`,
              }}
            >
              <Typography variant="body2" color="error">
                ⚠️ Failed to load dropdown options. Using fallback values.
              </Typography>
            </Box>
          )}

          <Grid container rowSpacing={4} columnSpacing={2}>
          {renderAgreementParameterRefNoField(
            "parametersRefNo",
            getAgreementParameterLabelDynamic("CDL_AGREEMENT_PARAMETER_REF_NO"),
            6,
            false
          )}
          {renderTextField(
              "agreementRemarks",
              getAgreementParameterLabelDynamic(
                "CDL_AGREEMENT_PARAMETER_REMARKS"
              ),
              "",
              6,
              false,
              false
            )}
            {renderDatePicker(
              "agreementEffectiveDate",
              getAgreementParameterLabelDynamic(
                "CDL_AGREEMENT_PARAMETER_EFFECTIVE_DATE"
              ),
              6,
              true
            )}
            {renderDatePicker(
              "agreementExpiryDate",
              getAgreementParameterLabelDynamic(
                "CDL_AGREEMENT_PARAMETER_EXPIRY_DATE"
              ),
              6,
              true
            )}
            {renderApiSelectField(
              "permittedInvestmentAllowedDTO",
              getAgreementParameterLabelDynamic(
                "CDL_AGREEMENT_PARAMETER_PERMITTED_INVESTMENT_ALLOWED"
              ),
              permittedInvestmentAllowedOptions,
              6,
              permittedInvestmentAllowedLoading,
              false
            )}
            {renderApiSelectField(
              "amendmentAllowedDTO",
              getAgreementParameterLabelDynamic(
                "CDL_AGREEMENT_PARAMETER_AMENDMENT_ALLOWED"
              ),
              amendmentAllowedOptions,
              6,
              amendmentAllowedLoading,
              false
            )}
            {renderApiSelectField(
              "dealClosureBasisDTO",
              getAgreementParameterLabelDynamic(
                "CDL_AGREEMENT_PARAMETER_DEAL_CLOSURE_BASIS"
              ),
              dealClosureBasisOptions,
              6,
              dealClosureBasisLoading,
              false
            )}

            {isPermittedInvestmentAllowed &&
              renderApiSelectField(
                "permittedInvestmentADTO",
                getAgreementParameterLabelDynamic(
                  "CDL_AGREEMENT_PARAMETER_PERMITTED_INVESTMENT"
                ),
                permittedInvestmentAOptions,
                6,
                permittedInvestmentALoading,
                false
              )}
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default Step1;
