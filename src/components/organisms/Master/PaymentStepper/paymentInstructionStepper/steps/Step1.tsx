import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Grid,
  TextField,
  useTheme,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  FormControlLabel,
  Checkbox,
  Button,
  InputAdornment,
  type Theme,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material'
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Controller, useFormContext } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import dayjs, { type Dayjs } from "dayjs";
import {
  getPaymentInstructionLabel,
  getPaymentLabel,
} from "@/constants/mappings/master/paymentMapping";
import { usePaymentInstructionLabelsWithCache } from "@/hooks/master/PaymentHook";
import { useAppStore } from "@/store";
import { validateStandingInstructionField } from "@/lib/validation/masterValidation/paymentInstructionSchemas";
import { useApplicationSettings } from "@/hooks/useApplicationSettings";
import {
  commonFieldStyles as sharedCommonFieldStyles,
  selectStyles as sharedSelectStyles,
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  cardStyles as sharedCardStyles,
  datePickerStyles as sharedDatePickerStyles,
  viewModeInputStyles,
  neutralBorder,
  neutralBorderHover,
} from "../styles";

interface Step1Props {
  isReadOnly?: boolean;
  paymentInstructionId?: string | undefined;
}

const Step1 = ({ isReadOnly = false, paymentInstructionId }: Step1Props) => {
  const theme = useTheme();
  const [generatedId, setGeneratedId] = useState<string>("");
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false);
  const isEditMode = !!paymentInstructionId;

  const isDark = theme.palette.mode === "dark";
  const textPrimary = isDark ? "#FFFFFF" : "#1E2939";
  const textSecondary = isDark ? "#CBD5E1" : "#6B7280";
  const fieldStyles = React.useMemo(
    () =>
      typeof sharedCommonFieldStyles === "function"
        ? sharedCommonFieldStyles(theme)
        : sharedCommonFieldStyles,
    [theme]
  );
  const dateFieldStyles = React.useMemo(
    () =>
      typeof sharedDatePickerStyles === "function"
        ? sharedDatePickerStyles(theme)
        : sharedDatePickerStyles,
    [theme]
  );
  const labelStyles = React.useMemo(
    () =>
      typeof sharedLabelSx === "function"
        ? sharedLabelSx(theme)
        : sharedLabelSx,
    [theme]
  );
  const selectFieldStyles = React.useMemo(
    () =>
      typeof sharedSelectStyles === "function"
        ? sharedSelectStyles(theme)
        : sharedSelectStyles,
    [theme]
  );
  const valueStyles = React.useMemo(
    () =>
      typeof sharedValueSx === "function"
        ? sharedValueSx(theme)
        : sharedValueSx,
    [theme]
  );
  const cardBaseStyles = React.useMemo(
    () =>
      typeof sharedCardStyles === "function"
        ? (sharedCardStyles as (theme: Theme) => unknown)(theme)
        : sharedCardStyles,
    [theme]
  );
  const viewModeStyles = viewModeInputStyles(theme);
  const neutralBorderColor = neutralBorder(theme);
  const neutralBorderHoverColor = neutralBorderHover(theme);

  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  // Dynamic label support
  const { data: paymentInstructionLabels, getLabel } =
    usePaymentInstructionLabelsWithCache();
  const currentLanguage = useAppStore((state) => state.language) || "EN";

  const getPaymentInstructionLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getPaymentInstructionLabel(configId);

      if (paymentInstructionLabels) {
        return getLabel(configId, currentLanguage, fallback);
      }
      return fallback;
    },
    [paymentInstructionLabels, currentLanguage, getLabel]
  );

  const ruleRefNoLabel = useCallback((): string => {
    const fallback = getPaymentLabel("CDL_RULE_REF_NO");
    if (paymentInstructionLabels) {
      return getLabel("CDL_RULE_REF_NO", currentLanguage, fallback);
    }
    return fallback;
  }, [paymentInstructionLabels, currentLanguage, getLabel]);

  const { data: transferTypeSettings = [], loading: transferTypeLoading } =
    useApplicationSettings("TRANSFER_TYPE");
  const { data: occurrenceSettings = [], loading: occurrenceLoading } =
    useApplicationSettings("OCCURENCE");
  const {
    data: recurringFrequencySettings = [],
    loading: recurringFrequencyLoading,
  } = useApplicationSettings("RECURRING_FREQUENCY");

  const transferTypeOptions = React.useMemo(
    () =>
      transferTypeSettings.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      })),
    [transferTypeSettings]
  );

  const occurrenceOptions = React.useMemo(
    () =>
      occurrenceSettings.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      })),
    [occurrenceSettings]
  );

  const recurringFrequencyOptions = React.useMemo(
    () =>
      recurringFrequencySettings.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      })),
    [recurringFrequencySettings]
  );

  useEffect(() => {
    const subscription = watch((value) => {
      const ruleRefNo = (value as Record<string, unknown>)?.ruleRefNo;
      if (ruleRefNo) {
        setGeneratedId(String(ruleRefNo));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

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

  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true);
      const newId = `RULE-${Date.now()}`;
      setGeneratedId(newId);
      setValue("ruleRefNo", newId, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch {
      // Handle error silently
    } finally {
      setIsGeneratingId(false);
    }
  };

  const renderTextField = (
    name: string,
    label: string,
    defaultValue = "",
    gridSize: number = 6,
    disabled = false,
    required = false,
    type: "text" | "number" = "text"
  ) => (
    <Grid key={`field-${name}`} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue === undefined ? "" : defaultValue}
        rules={{
          required: required ? `${label} is required` : false,
          validate: (value: unknown) =>
            validateStandingInstructionField(0, name, value),
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label={label}
            fullWidth
            type={type}
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

  const renderRuleRefNoField = (
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
              setGeneratedId(e.target.value);
              field.onChange(e);
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
              sx: valueStyles,
            }}
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
            sx={{
              ...fieldStyles,
              ...((isReadOnly || isEditMode) && {
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
        )}
      />
    </Grid>
  );

  const renderDateTimeField = (
    name: string,
    label: string,
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={null}
        rules={{
          required: required ? `${label} is required` : false,
          validate: (value: unknown) =>
            validateStandingInstructionField(0, name, value),
        }}
        render={({ field }) => {
          // Convert string dates to dayjs objects
          let dateValue: Dayjs | null = null;
          if (field.value) {
            if (typeof field.value === "string" && field.value.trim() !== "") {
              const parsed = dayjs(field.value);
              dateValue = parsed.isValid() ? parsed : null;
            } else if (field.value instanceof Date) {
              dateValue = dayjs(field.value);
            } else if (dayjs.isDayjs(field.value)) {
              dateValue = field.value;
            }
          }

          return (
            <DatePicker
              label={label}
              value={dateValue}
              onChange={(newValue) => {
                field.onChange(newValue);
              }}
              format="DD/MM/YYYY"
              disabled={isReadOnly}
              slots={{
                openPickerIcon: CalendarTodayOutlinedIcon,
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: required,
                  error: !!errors[name],
                  helperText: errors[name]?.message?.toString(),
                  sx: dateFieldStyles,
                  InputLabelProps: { sx: labelStyles },
                  InputProps: {
                    sx: valueStyles,
                    style: { height: "46px" },
                  },
                },
              }}
            />
          );
        }}
      />
    </Grid>
  );

  const renderCheckboxField = (
    name: string,
    label: string,
    gridSize: number = 6
  ) => (
    <Grid key={`field-${name}`} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={field.value === true}
                onChange={(e) => field.onChange(e.target.checked)}
                disabled={isReadOnly}
                sx={{
                  color: neutralBorderColor,
                  "&.Mui-checked": {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={label}
            sx={{
              "& .MuiFormControlLabel-label": {
                fontFamily: "Outfit, sans-serif",
                fontStyle: "normal",
                fontSize: "14px",
                lineHeight: "24px",
                letterSpacing: "0.5px",
                verticalAlign: "middle",
                color: textPrimary,
              },
            }}
          />
        )}
      />
    </Grid>
  );

  const renderSelectField = (
    name: string,
    configId: string,
    fallbackLabel: string,
    options: { id: number; displayName: string; settingValue: string }[],
    gridMd: number = 6,
    required = false,
    loading = false
  ) => {
    const label = getPaymentInstructionLabelDynamic(configId) || fallbackLabel;
    return (
      <Grid size={{ xs: 12, md: gridMd }}>
        <Controller
          name={name}
          control={control}
          rules={required ? { required: `${label} is required` } : {}}
          defaultValue={""}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors[name]} required={required}>
              <InputLabel sx={labelStyles} required={required}>
                {loading ? "Loading..." : label}
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
                    border: `2px solid ${theme.palette.primary.main}`,
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
                value={
                  typeof field.value === "object" && field.value?.id
                    ? options.find((opt) => opt.id === field.value.id)
                      ?.settingValue || ""
                    : field.value || ""
                }
                onChange={(e) => {
                  const selectedValue = e.target.value as string;
                  const selectedOption = options.find(
                    (opt) => opt.settingValue === selectedValue
                  );
                  if (selectedOption) {
                    setValue(
                      name,
                      { id: selectedOption.id },
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      }
                    );
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
              {errors[name] && (
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
                  {errors[name]?.message?.toString()}
                </FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          ...(typeof cardBaseStyles === "object" ? cardBaseStyles : {}),
          width: "84%",
          margin: "0 auto",
        }}
      >
        <CardContent sx={{ color: textPrimary }}>
          <Grid container rowSpacing={4} columnSpacing={2}>
            {renderRuleRefNoField(
              "ruleRefNo",
              ruleRefNoLabel(),
              6,
              false
            )}
            {renderTextField(
              "standingInstructionReferenceNumber",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_REFERENCE_NUMBER"
              ),
              "",
              6,
              false,
              true
            )}
            {renderTextField(
              "clientFullName",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_CLIENT_FULL_NAME"
              ),
              "",
              6,
              false,
              true
            )}
            {renderTextField(
              "debitAmountCap",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_DEBIT_AMOUNT_CAP"
              ),
              "",
              6,
              false,
              true,
              "number"
            )}
            {renderTextField(
              "debitAmount",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_DEBIT_AMOUNT"
              ),
              "",
              6,
              false,
              true,
              "number"
            )}
            {renderTextField(
              "minimumBalanceAmount",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_MINIMUM_BALANCE_AMOUNT"
              ),
              "",
              6,
              false,
              true,
              "number"
            )}
            {renderTextField(
              "thresholdAmount",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_THRESHOLD_AMOUNT"
              ),
              "",
              6,
              false,
              true,
              "number"
            )}
            {renderTextField(
              "retryIntervalDays",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_RETRY_INTERVAL_DAYS"
              ),
              "",
              6,
              false,
              true,
              "number"
            )}
            

            {renderTextField(
              "swiftCode",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_SWIFT_CODE"
              ),
              "",
              6,
              false,
              false
            )}
            {renderTextField(
              "creditAmountCap",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_CREDIT_AMOUNT_CAP"
              ),
              "",
              6,
              false,
              false,
              "number"
            )}
            {renderTextField(
              "creditAmount",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_CREDIT_AMOUNT"
              ),
              "",
              6,
              false,
              false,
              "number"
            )}
            {renderTextField(
              "priority",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_PRIORITY"
              ),
              "",
              6,
              false,
              false,
              "number"
            )}
            {renderTextField(
              "recentPercentage",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_RECENT_PERCENTAGE"
              ),
              "",
              6,
              false,
              false,
              "number"
            )}
            {renderTextField(
              "instructionRemarks",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_REMARKS"
              ),
              "",
              6,
              false,
              false
            )}
            {renderDateTimeField(
              "firstTransactionDateTime",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_FIRST_TRANSACTION_DATETIME"
              ),
              4,
              true
            )}
            

            {renderDateTimeField(
              "nextExecutionDateTime",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_NEXT_EXECUTION_DATETIME"
              ),
              4,
              false
            )}
            {renderDateTimeField(
              "instructionExpiryDateTime",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_EXPIRY_DATETIME"
              ),
              4,
              true
            )}

            {renderSelectField(
              "transferTypeDTO",
              "CDL_PAYMENT_STANDING_INSTRUCTION_TRANSFER_TYPE_DTO",
              "Transfer Type",
              transferTypeOptions,
              4,
              false,
              transferTypeLoading
            )}
            {renderSelectField(
              "occurrenceDTO",
              "CDL_PAYMENT_STANDING_INSTRUCTION_OCCURRENCE_DTO",
              "Occurrence",
              occurrenceOptions,
              4,
              false,
              occurrenceLoading
            )}
            {renderSelectField(
              "recurringFrequencyDTO",
              "CDL_PAYMENT_STANDING_INSTRUCTION_RECURRING_FREQUENCY_DTO",
              "Recurring Frequency",
              recurringFrequencyOptions,
              4,
              false,
              recurringFrequencyLoading
            )}
            {renderCheckboxField(
              "retryUntilMonthEndFlag",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_RETRY_UNTIL_MONTH_END_FLAG"
              ),
              12
            )}

            
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default Step1;
