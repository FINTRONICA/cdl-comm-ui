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
  OutlinedInput,
  Select,
  TextField,
  Typography,
  useTheme,
  SxProps,
  Theme,
  alpha,
} from "@mui/material";
import { KeyboardArrowDown as KeyboardArrowDownIcon } from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { getAgreementParameterLabel } from "@/constants/mappings/master/Entity/agreementParameterMapping";
import { useAgreementParameterLabelsWithCache } from "@/hooks";
import { useAppStore } from "@/store";
import { agreementParameterService } from "@/services/api/masterApi/Entitie/agreementParameterService";
import { validateAgreementParameterField } from "@/lib/validation/masterValidation/agreementParameterSchemasSchemas";
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

  // Populate fields when agreement parameter data is loaded (for edit mode)
  useEffect(() => {
    if (!agreementParameterId || !isEditMode) {
      return;
    }

    let isPopulating = false;
    let timeoutId: NodeJS.Timeout | null = null;

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

        if (agreementParameter?.agreementRemarks) {
          const currentRemarks = watch("agreementRemarks");
          if (!currentRemarks || currentRemarks.trim() === "") {
            setValue("agreementRemarks", agreementParameter.agreementRemarks, {
              shouldValidate: true,
              shouldDirty: false,
            });
          }
        }

        if (agreementParameter?.permittedInvestmentAllowedDTO) {
          const currentPermittedInvestment = watch(
            "permittedInvestmentAllowedDTO"
          );
          if (!currentPermittedInvestment) {
            const dtoId =
              typeof agreementParameter.permittedInvestmentAllowedDTO ===
              "object"
                ? agreementParameter.permittedInvestmentAllowedDTO.id
                : agreementParameter.permittedInvestmentAllowedDTO;
            setValue(
              "permittedInvestmentAllowedDTO",
              { id: dtoId },
              {
                shouldValidate: true,
                shouldDirty: false,
              }
            );
          }
        }

        if (agreementParameter?.amendmentAllowedDTO) {
          const currentAmendment = watch("amendmentAllowedDTO");
          if (!currentAmendment) {
            const dtoId =
              typeof agreementParameter.amendmentAllowedDTO === "object"
                ? agreementParameter.amendmentAllowedDTO.id
                : agreementParameter.amendmentAllowedDTO;
            setValue(
              "amendmentAllowedDTO",
              { id: dtoId },
              {
                shouldValidate: true,
                shouldDirty: false,
              }
            );
          }
        }

        if (agreementParameter?.dealClosureBasisDTO) {
          const currentClosureBasis = watch("dealClosureBasisDTO");
          if (!currentClosureBasis) {
            const dtoId =
              typeof agreementParameter.dealClosureBasisDTO === "object"
                ? agreementParameter.dealClosureBasisDTO.id
                : agreementParameter.dealClosureBasisDTO;
            setValue(
              "dealClosureBasisDTO",
              { id: dtoId },
              {
                shouldValidate: true,
                shouldDirty: false,
              }
            );
          }
        }

        if (agreementParameter?.escrowAgreementDTO) {
          const currentEscrowAgreement = watch("escrowAgreementDTO");
          if (!currentEscrowAgreement) {
            setValue(
              "escrowAgreementDTO",
              agreementParameter.escrowAgreementDTO,
              {
                shouldValidate: true,
                shouldDirty: false,
              }
            );
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
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

    populateFields();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [agreementParameterId, isEditMode, watch, setValue]);

  // Watch for effective date changes and validate expiry date
  const effectiveDate = watch("agreementEffectiveDate");
  useEffect(() => {
    if (effectiveDate) {
      // Trigger validation on expiry date when effective date changes
      trigger("agreementExpiryDate");
    }
  }, [effectiveDate, trigger]);

  // Placeholder for dropdown data - to be implemented
  const getDisplayLabel = (option: unknown, fallback: string) => {
    if (option && typeof option === "object" && "settingValue" in option) {
      return String((option as { settingValue: string }).settingValue);
    }
    if (
      option &&
      typeof option === "object" &&
      "languageTranslationId" in option
    ) {
      const translation = (
        option as { languageTranslationId?: { configValue?: string } }
      ).languageTranslationId;
      return translation?.configValue || fallback;
    }
    return fallback;
  };

  // Placeholder for dropdown error state - to be implemented when dropdown hooks are added
  const dropdownsError: Error | null = null;
  const dropdownsLoading = false;

  // Placeholder dropdown options - these should be fetched from API
  const permittedInvestmentAllowedOptions: unknown[] = [];
  const amendmentAllowedOptions: unknown[] = [];
  const dealClosureBasisOptions: unknown[] = [];

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
                minDate={minDate || undefined}
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

  const renderApiSelectField = (
    name: string,
    label: string,
    options: unknown[],
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
            // Handle both object and number values
            const fieldValue =
              typeof field.value === "object" &&
              field.value !== null &&
              "id" in field.value
                ? String(field.value.id)
                : field.value
                  ? String(field.value)
                  : "";

            return (
              <FormControl fullWidth error={!!error} required={required}>
                <InputLabel sx={labelStyles}>
                  {loading ? `Loading...` : label}
                </InputLabel>
                <Select
                  {...field}
                  value={fieldValue}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    // Store as object with id
                    field.onChange({ id: Number(selectedValue) });
                  }}
                  input={
                    <OutlinedInput label={loading ? `Loading...` : label} />
                  }
                  label={loading ? `Loading...` : label}
                  IconComponent={KeyboardArrowDownIcon}
                  disabled={loading || isReadOnly}
                  sx={
                    typeof selectFieldStyles === "object" &&
                    typeof valueStyles === "object"
                      ? ({
                          ...selectFieldStyles,
                          ...valueStyles,
                          ...(isReadOnly && {
                            backgroundColor: viewModeStyles.backgroundColor,
                            color: textSecondary,
                          }),
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: `1px solid ${neutralBorderColor}`,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            border: `1px solid ${neutralBorderHoverColor}`,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            border: `2px solid ${focusBorder}`,
                          },
                        } as SxProps<Theme>)
                      : ({
                          ...(isReadOnly && {
                            backgroundColor: viewModeStyles.backgroundColor,
                            color: textSecondary,
                          }),
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: `1px solid ${neutralBorderColor}`,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            border: `1px solid ${neutralBorderHoverColor}`,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            border: `2px solid ${focusBorder}`,
                          },
                        } as SxProps<Theme>)
                  }
                >
                  {options.map((option, index) => {
                    const optionObj = option as {
                      id?: string | number;
                      settingValue?: string;
                      languageTranslationId?: { configValue?: string };
                    };
                    return (
                      <MenuItem
                        key={optionObj.id || index}
                        value={String(optionObj.id || "")}
                      >
                        {getDisplayLabel(
                          option,
                          optionObj.settingValue ||
                            optionObj.languageTranslationId?.configValue ||
                            "Option"
                        )}
                      </MenuItem>
                    );
                  })}
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
              dropdownsLoading,
              false
            )}
            {renderApiSelectField(
              "amendmentAllowedDTO",
              getAgreementParameterLabelDynamic(
                "CDL_AGREEMENT_PARAMETER_AMENDMENT_ALLOWED"
              ),
              amendmentAllowedOptions,
              6,
              dropdownsLoading,
              false
            )}
            {renderApiSelectField(
              "dealClosureBasisDTO",
              getAgreementParameterLabelDynamic(
                "CDL_AGREEMENT_PARAMETER_DEAL_CLOSURE_BASIS"
              ),
              dealClosureBasisOptions,
              6,
              dropdownsLoading,
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
            {renderTextField(
              "escrowAgreementDTO",
              getAgreementParameterLabelDynamic(
                "CDL_AGREEMENT_PARAMETER_ESCROW_AGREEMENT"
              ),
              "",
              6,
              false,
              false
            )}
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default Step1;
