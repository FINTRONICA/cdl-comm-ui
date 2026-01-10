import React, { useCallback } from "react";
import {
  Card,
  CardContent,
  Grid,
  TextField,
  useTheme,
  FormControlLabel,
  Checkbox,
  type Theme,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Controller, useFormContext } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import dayjs, { type Dayjs } from "dayjs";
import { getPaymentInstructionLabel } from "@/constants/mappings/master/paymentMapping";
import { usePaymentInstructionLabelsWithCache } from "@/hooks/master/PaymentHook";
import { useAppStore } from "@/store";
import { validateStandingInstructionField } from "@/lib/validation/masterValidation/paymentInstructionSchemas";
import {
  commonFieldStyles as sharedCommonFieldStyles,
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  cardStyles as sharedCardStyles,
  datePickerStyles as sharedDatePickerStyles,
  viewModeInputStyles,
  neutralBorder,
} from "../styles";

interface Step1Props {
  isReadOnly?: boolean;
  paymentInstructionId?: string | undefined;
}

const Step1 = ({ isReadOnly = false }: Step1Props) => {
  const theme = useTheme();
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

  const {
    control,
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
            {renderDateTimeField(
              "firstTransactionDateTime",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_FIRST_TRANSACTION_DATETIME"
              ),
              6,
              true
            )}
            {renderDateTimeField(
              "instructionExpiryDateTime",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_EXPIRY_DATETIME"
              ),
              6,
              true
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

            {renderDateTimeField(
              "nextExecutionDateTime",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_NEXT_EXECUTION_DATETIME"
              ),
              6,
              false
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
            {renderCheckboxField(
              "retryUntilMonthEndFlag",
              getPaymentInstructionLabelDynamic(
                "CDL_PAYMENT_STANDING_INSTRUCTION_RETRY_UNTIL_MONTH_END_FLAG"
              ),
              6
            )}
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default Step1;
