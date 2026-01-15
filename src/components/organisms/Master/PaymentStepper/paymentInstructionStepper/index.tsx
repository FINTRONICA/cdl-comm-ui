"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  Typography,
} from "@mui/material";
import { FormProvider } from "react-hook-form";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import dayjs from "dayjs";
import {
  usePaymentInstructionStepStatus,
  usePaymentInstructionStepManager,
} from "@/hooks/master/PaymentHook";
import { useCreateWorkflowRequest } from "@/hooks/workflow";
import { usePaymentInstructionLabelsWithCache } from "@/hooks/master/PaymentHook";
import { getPaymentInstructionLabel } from "@/constants/mappings/master/paymentMapping";
import { useAppStore } from "@/store";
import type {
  PaymentInstructionDetailsData,
  PaymentInstruction,
  StepSaveResponse,
} from "@/services/api/masterApi/Payment/paymentInstructionService";
import {
  useStepNotifications,
  useStepDataProcessing,
  useStepForm,
} from "../../PartyStepper/hooks";
import { useStepValidation } from "./hooks/useStepValidation";
import { Step1, Step2 } from "./steps";
import DocumentUploadFactory from "../../../DocumentUpload/DocumentUploadFactory";
import { DocumentItem } from "../../PartyStepper/partyTypes";

interface StepperProps {
  paymentInstructionId?: string;
  standingInstructionId?: string;
  initialStep?: number;
  isViewMode?: boolean;
}

// Hook to detect dark mode
const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
};

export default function PaymentInstructionStepperWrapper({
  paymentInstructionId: propPaymentInstructionId,
  standingInstructionId,
  initialStep = 0,
  isViewMode: propIsViewMode,
}: StepperProps = {}) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDarkMode = useIsDarkMode();

  const paymentInstructionId =
    propPaymentInstructionId ||
    standingInstructionId ||
    (params.id as string) ||
    "";

  const [activeStep, setActiveStep] = useState(initialStep);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const mode = searchParams.get("mode");
  const isViewMode =
    propIsViewMode !== undefined ? propIsViewMode : mode === "view";

  const notifications = useStepNotifications();
  const dataProcessing = useStepDataProcessing();
  const { methods, formState, setShouldResetForm } = useStepForm(
    paymentInstructionId,
    activeStep
  );
  const stepManager = usePaymentInstructionStepManager();
  const validation = useStepValidation();
  const createWorkflowRequest = useCreateWorkflowRequest();

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

  const steps = useMemo(
    () => [
      getPaymentInstructionLabelDynamic("CDL_PAYMENT_INSTRUCTION"),
      "Documents (Optional)",
      "Review",
    ],
    [getPaymentInstructionLabelDynamic]
  );

  const handleEditStep = useCallback(
    (stepNumber: number) => {
      setActiveStep(stepNumber);
      setIsEditingMode(true);
      setShouldResetForm(true);
      notifications.showSuccess(`Now editing step ${stepNumber + 1} data`);
    },
    [setShouldResetForm, notifications]
  );

  const { data: stepStatus } = usePaymentInstructionStepStatus(
    paymentInstructionId && paymentInstructionId.trim() !== ""
      ? paymentInstructionId
      : ""
  );

  const handleDocumentsChange = useCallback(
    (documents: DocumentItem[]) => {
      methods.setValue("documents", documents);
    },
    [methods]
  );

  const getStepContent = useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return (
            <Step1
              isReadOnly={isViewMode}
              paymentInstructionId={paymentInstructionId}
            />
          );
        case 1:
          return (
            <DocumentUploadFactory
              type="PAYMENT_INSTRUCTION"
              entityId={paymentInstructionId || ""}
              isOptional={true}
              onDocumentsChange={handleDocumentsChange}
              formFieldName="documents"
              isReadOnly={isViewMode}
            />
          );
        case 2:
          return (
            <Step2
              key={`review-${paymentInstructionId}-${activeStep}`}
              paymentInstructionId={paymentInstructionId}
              onEditStep={handleEditStep}
              isReadOnly={isViewMode}
            />
          );
        default:
          return null;
      }
    },
    [
      paymentInstructionId,
      isViewMode,
      handleEditStep,
      handleDocumentsChange,
      activeStep,
    ]
  );

  useEffect(() => {
    const editing = searchParams.get("editing");
    if (editing === "true") {
      setIsEditingMode(true);
    } else if (paymentInstructionId && !isViewMode) {
      setIsEditingMode(true);
    } else if (!paymentInstructionId) {
      setIsEditingMode(false);
    }
  }, [searchParams, paymentInstructionId, isViewMode]);

  const getModeParam = useCallback(() => {
    if (isViewMode) return "?mode=view";
    if (isEditingMode) return "?editing=true";
    return "";
  }, [isViewMode, isEditingMode]);

  useEffect(() => {
    if (
      activeStep !== 2 &&
      paymentInstructionId &&
      paymentInstructionId.trim() !== "" &&
      dataProcessing.shouldProcessStepData(
        stepStatus,
        paymentInstructionId,
        formState.shouldResetForm
      )
    ) {
      try {
        const processedData = dataProcessing.processStepDataForForm({
          activeStep,
          stepStatus,
        });

        // Convert string dates to dayjs objects for DatePicker compatibility
        if (activeStep === 0 && processedData) {
          const dateFields = [
            "firstTransactionDateTime",
            "instructionExpiryDateTime",
            "nextExecutionDateTime",
          ];
          dateFields.forEach((field) => {
            const value = (processedData as Record<string, unknown>)[field];
            if (value && typeof value === "string" && value.trim() !== "") {
              const parsed = dayjs(value);
              if (parsed.isValid()) {
                (processedData as Record<string, unknown>)[field] = parsed;
              } else {
                (processedData as Record<string, unknown>)[field] = null;
              }
            } else if (value === null || value === undefined || value === "") {
              (processedData as Record<string, unknown>)[field] = null;
            }
          });
        }

        methods.reset(processedData);
        setShouldResetForm(false);
      } catch (error) {
        // Don't throw - allow component to continue rendering
      }
    }
  }, [
    activeStep,
    stepStatus,
    paymentInstructionId,
    setShouldResetForm,
    dataProcessing,
    formState.shouldResetForm,
    methods,
  ]);

  const handleSaveAndNext = async () => {
    try {
      setIsSaving(true);
      notifications.clearNotifications();

      if (isViewMode) {
        const nextStep = activeStep + 1;
        if (nextStep < steps.length) {
          const nextUrlStep = nextStep + 1;
          router.push(
            `/payment-instruction/${paymentInstructionId}/step/${nextUrlStep}?mode=view`
          );
        } else {
          router.push("/payment-instruction");
        }
        return;
      }

      if (activeStep === 1) {
        const nextStep = activeStep + 1;
        if (nextStep < steps.length) {
          const nextUrlStep = nextStep + 1;
          const modeParam = getModeParam();

          if (!paymentInstructionId) {
            notifications.showError(
              "Payment Instruction ID is required to proceed to Review step."
            );
            setIsSaving(false);
            return;
          }

          const nextUrl = `/payment-instruction/${paymentInstructionId}/step/${nextUrlStep}${modeParam}`;
          router.push(nextUrl);
          setActiveStep(nextStep);
        } else {
          router.push("/payment-instruction");
        }
        setIsSaving(false);
        return;
      }

      if (activeStep === 2) {
        if (isViewMode) {
          router.push("/payment-instruction");
          setIsSaving(false);
          return;
        }

        try {
          const paymentInstructionIdFromStatus =
            stepStatus?.stepData?.step1?.id?.toString();
          const finalPaymentInstructionId =
            paymentInstructionId || paymentInstructionIdFromStatus;

          if (!finalPaymentInstructionId) {
            notifications.showError(
              "Payment Instruction ID not found. Please complete Step 1 first."
            );
            setIsSaving(false);
            return;
          }

          const step1Data = stepStatus?.stepData?.step1;

          if (!step1Data) {
            notifications.showError(
              "Payment Instruction data not found. Please complete Step 1 first."
            );
            setIsSaving(false);
            return;
          }

          await createWorkflowRequest.mutateAsync({
            referenceId: finalPaymentInstructionId,
            referenceType: "STANDING_INSTRUCTION",
            moduleName: "STANDING_INSTRUCTION",
            actionKey: "APPROVE",
            payloadJson: step1Data as unknown as Record<string, unknown>,
          });

          notifications.showSuccess(
            "Payment Instruction registration submitted successfully! Workflow request created."
          );
          setIsSaving(false);
          setTimeout(() => {
            router.push("/payment-instruction");
          }, 500);
          return;
        } catch (error) {
          const errorData = error as {
            response?: { data?: { message?: string } };
            message?: string;
          };
          const errorMessage =
            errorData?.response?.data?.message ||
            errorData?.message ||
            "Failed to submit workflow request. Please try again.";
          notifications.showError(errorMessage);
          setIsSaving(false);
          return;
        }
      }

      const isFormValid = await methods.trigger();

      if (!isFormValid) {
        const formErrors = methods.formState.errors;
        const errorFields = Object.keys(formErrors);
        const errorMessages = errorFields.map((field) => {
          const error = formErrors[field as keyof typeof formErrors];
          return error?.message || `${field} is invalid`;
        });

        notifications.showError(
          errorMessages.length > 0
            ? `Please fix the following errors: ${errorMessages.join(", ")}`
            : "Please fill in all required fields correctly before proceeding."
        );
        setIsSaving(false);
        return;
      }

      const currentFormData = methods.getValues() as unknown as Record<
        string,
        unknown
      >;

      let stepSpecificData: unknown = currentFormData;

      if (activeStep === 0) {
        // Helper function to convert date to string
        const convertDateToString = (
          dateValue: unknown
        ): string | null | undefined => {
          if (!dateValue || dateValue === null || dateValue === "")
            return undefined;
          if (dateValue instanceof Date) {
            return dateValue.toISOString();
          }
          if (typeof dateValue === "string") {
            return dateValue;
          }
          // Handle dayjs objects
          if (
            dateValue &&
            typeof dateValue === "object" &&
            "toISOString" in dateValue
          ) {
            return (dateValue as { toISOString: () => string }).toISOString();
          }
          if (
            dateValue &&
            typeof dateValue === "object" &&
            "format" in dateValue
          ) {
            return (dateValue as { format: (format: string) => string }).format(
              "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
            );
          }
          return undefined;
        };

        const firstTransactionDateTime = convertDateToString(
          currentFormData.firstTransactionDateTime
        );
        const instructionExpiryDateTime = convertDateToString(
          currentFormData.instructionExpiryDateTime
        );
        const nextExecutionDateTime = convertDateToString(
          currentFormData.nextExecutionDateTime
        );

        const step1Data: PaymentInstructionDetailsData = {
          standingInstructionReferenceNumber:
            currentFormData.standingInstructionReferenceNumber as string,
          clientFullName: currentFormData.clientFullName as string,
          debitAmountCap: currentFormData.debitAmountCap as number,
          debitAmount: currentFormData.debitAmount as number,
          minimumBalanceAmount: currentFormData.minimumBalanceAmount as number,
          thresholdAmount: currentFormData.thresholdAmount as number,
          ...(firstTransactionDateTime !== undefined && {
            firstTransactionDateTime: firstTransactionDateTime ?? null,
          }),
          ...(instructionExpiryDateTime !== undefined && {
            instructionExpiryDateTime: instructionExpiryDateTime ?? null,
          }),
          retryIntervalDays: currentFormData.retryIntervalDays as number,
          retryUntilMonthEndFlag:
            currentFormData.retryUntilMonthEndFlag as boolean,
          ...(currentFormData.instructionRemarks !== undefined && {
            instructionRemarks: currentFormData.instructionRemarks as string,
          }),
          ...(nextExecutionDateTime !== undefined && {
            nextExecutionDateTime: nextExecutionDateTime ?? null,
          }),
          ...(currentFormData.dealNoDTO !== undefined && {
            dealNoDTO: currentFormData.dealNoDTO as
              | { id: number }
              | number
              | null,
          }),
          ...(currentFormData.statusDTO !== undefined && {
            statusDTO: currentFormData.statusDTO as
              | { id: number }
              | number
              | null,
          }),
          ...(currentFormData.transferTypeDTO !== undefined && {
            transferTypeDTO: currentFormData.transferTypeDTO as
              | { id: number }
              | number
              | null,
          }),
          ...(currentFormData.occurrenceDTO !== undefined && {
            occurrenceDTO: currentFormData.occurrenceDTO as
              | { id: number }
              | number
              | null,
          }),
          ...(currentFormData.recurringFrequencyDTO !== undefined && {
            recurringFrequencyDTO: currentFormData.recurringFrequencyDTO as
              | { id: number }
              | number
              | null,
          }),
          ...(currentFormData.holidaySetupDTO !== undefined && {
            holidaySetupDTO: currentFormData.holidaySetupDTO as
              | { id: number }
              | number
              | null,
          }),
          ...(currentFormData.dependentScenarioDTO !== undefined && {
            dependentScenarioDTO: currentFormData.dependentScenarioDTO as
              | { id: number }
              | number
              | null,
          }),
          ...(currentFormData.formAccountDrDTO !== undefined && {
            formAccountDrDTO: currentFormData.formAccountDrDTO as
              | { id: number }
              | number
              | null,
          }),
          ...(currentFormData.dependenceDTO !== undefined && {
            dependenceDTO: currentFormData.dependenceDTO as string | null,
          }),
          ...(currentFormData.paymentTypeDTO !== undefined && {
            paymentTypeDTO: currentFormData.paymentTypeDTO as
              | { id: number }
              | number
              | null,
          }),
          ...(currentFormData.toAccountDTO !== undefined && {
            toAccountDTO: currentFormData.toAccountDTO as
              | { id: number }
              | number
              | null,
          }),
          ...(currentFormData.swiftCode !== undefined && {
            swiftCode: currentFormData.swiftCode as string | null,
          }),
          ...(currentFormData.creditAmountCap !== undefined && {
            creditAmountCap: currentFormData.creditAmountCap as number,
          }),
          ...(currentFormData.creditAmount !== undefined && {
            creditAmount: currentFormData.creditAmount as number,
          }),
          ...(currentFormData.priority !== undefined && {
            priority: currentFormData.priority as number,
          }),
          ...(currentFormData.recentPercentage !== undefined && {
            recentPercentage: currentFormData.recentPercentage as number,
          }),
          ...(currentFormData.beneficiaryNameDTO !== undefined && {
            beneficiaryNameDTO: currentFormData.beneficiaryNameDTO as
              | { id: number }
              | number
              | null,
          }),
          ...(currentFormData.resetCounterDTO !== undefined && {
            resetCounterDTO: currentFormData.resetCounterDTO as
              | { id: number }
              | number
              | null,
          }),
        };

        stepSpecificData = {
          ...step1Data,
          enabled: true,
          deleted: false,
        };
      }

      const validationResult = await validation.validateStepData(
        activeStep,
        stepSpecificData
      );

      if (!validationResult.isValid) {
        const errorPrefix =
          validationResult.source === "client"
            ? "Validation failed"
            : "Server validation failed";
        const errorMessage = validationResult.errors?.length
          ? `${errorPrefix}: ${validationResult.errors.join(", ")}`
          : `${errorPrefix}. Please check the form for errors.`;
        notifications.showError(errorMessage);
        setIsSaving(false);
        return;
      }

      const saveResponse = await stepManager.saveStep(
        activeStep + 1,
        stepSpecificData,
        isEditingMode,
        paymentInstructionId
      );

      notifications.showSuccess("Step saved successfully!");

      if (activeStep < steps.length - 1) {
        if (activeStep === 0) {
          const saveResponseData = saveResponse as
            | PaymentInstruction
            | StepSaveResponse;

          let savedPaymentInstructionId: string | number | undefined;

          if (
            "id" in saveResponseData &&
            saveResponseData.id !== undefined &&
            saveResponseData.id !== null
          ) {
            savedPaymentInstructionId = String(saveResponseData.id);
          } else if ("data" in saveResponseData && saveResponseData.data) {
            const data = saveResponseData.data;
            if (typeof data === "object" && data !== null && "id" in data) {
              const idValue = (data as PaymentInstruction).id;
              if (idValue !== undefined && idValue !== null) {
                savedPaymentInstructionId = String(idValue);
              }
            }
          }

          if (savedPaymentInstructionId) {
            const nextUrl = `/payment-instruction/${savedPaymentInstructionId}/step/2${getModeParam()}`;
            router.push(nextUrl);
            setActiveStep(1);
          } else {
            if (paymentInstructionId) {
              const nextUrl = `/payment-instruction/${paymentInstructionId}/step/2${getModeParam()}`;
              router.push(nextUrl);
              setActiveStep(1);
            } else {
              setActiveStep((prev: number) => prev + 1);
            }
          }
        } else if (paymentInstructionId) {
          const nextStep = activeStep + 1;
          const nextUrl = `/payment-instruction/${paymentInstructionId}/step/${nextStep + 1}${getModeParam()}`;
          router.push(nextUrl);
          setActiveStep(nextStep);
        } else {
          setActiveStep((prev) => prev + 1);
        }
      } else {
        router.push("/payment-instruction");
        notifications.showSuccess("All steps completed successfully!");
      }

      setIsSaving(false);
    } catch (error: unknown) {
      const errorData = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        errorData?.response?.data?.message ||
        errorData?.message ||
        "Failed to save step. Please try again.";
      notifications.showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (activeStep > 0 && paymentInstructionId) {
      const previousStep = activeStep - 1;
      setActiveStep(previousStep);
      router.push(
        `/payment-instruction/${paymentInstructionId}/step/${previousStep + 1}${getModeParam()}`
      );
    }
  };

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          width: "100%",
          backgroundColor: isDarkMode ? "#101828" : "rgba(255, 255, 255, 0.75)",
          borderRadius: "16px",
          paddingTop: "16px",
          border: isDarkMode
            ? "1px solid rgba(51, 65, 85, 1)"
            : "1px solid #FFFFFF",
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 400,
                    fontStyle: "normal",
                    fontSize: "12px",
                    lineHeight: "100%",
                    letterSpacing: "0.36px",
                    textAlign: "center",
                    verticalAlign: "middle",
                    textTransform: "uppercase",
                    color: isDarkMode ? "#CBD5E1" : "#4A5565",
                  }}
                >
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box
          sx={{
            my: 4,
            backgroundColor: isDarkMode
              ? "#101828"
              : "rgba(255, 255, 255, 0.75)",
            boxShadow: "none",
          }}
        >
          {getStepContent(activeStep)}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 3,
              mx: 6,
              mb: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => router.push("/payment-instruction")}
              sx={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 500,
                fontStyle: "normal",
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: 0,
                color: isDarkMode ? "#93C5FD" : "#155DFC",
                borderColor: isDarkMode ? "#334155" : "#CAD5E2",
                "&:hover": {
                  borderColor: isDarkMode ? "#475569" : "#93C5FD",
                  backgroundColor: isDarkMode
                    ? "rgba(51, 65, 85, 0.3)"
                    : "rgba(219, 234, 254, 0.3)",
                },
              }}
            >
              Cancel
            </Button>
            <Box>
              {activeStep !== 0 && (
                <Button
                  onClick={handleBack}
                  variant="outlined"
                  sx={{
                    width: "114px",
                    height: "36px",
                    gap: "6px",
                    opacity: 1,
                    paddingTop: "2px",
                    paddingRight: "3px",
                    paddingBottom: "2px",
                    paddingLeft: "3px",
                    borderRadius: "6px",
                    backgroundColor: isDarkMode
                      ? "rgba(30, 58, 138, 0.5)"
                      : "#DBEAFE",
                    color: isDarkMode ? "#93C5FD" : "#155DFC",
                    border: "none",
                    mr: 2,
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 500,
                    fontStyle: "normal",
                    fontSize: "14px",
                    lineHeight: "20px",
                    letterSpacing: 0,
                    "&:hover": {
                      backgroundColor: isDarkMode
                        ? "rgba(30, 58, 138, 0.7)"
                        : "#BFDBFE",
                    },
                  }}
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleSaveAndNext}
                variant="contained"
                disabled={isSaving}
                startIcon={
                  isSaving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
                sx={{
                  width: isSaving ? "140px" : "114px",
                  height: "36px",
                  gap: "6px",
                  opacity: 1,
                  paddingTop: "2px",
                  paddingRight: "3px",
                  paddingBottom: "2px",
                  paddingLeft: "3px",
                  borderRadius: "6px",
                  backgroundColor: "#2563EB",
                  color: "#FFFFFF",
                  boxShadow: "none",
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 500,
                  fontStyle: "normal",
                  fontSize: "14px",
                  lineHeight: "20px",
                  letterSpacing: 0,
                  "&.Mui-disabled": {
                    backgroundColor: "#93C5FD",
                    color: "#FFFFFF",
                  },
                  "&:hover": {
                    backgroundColor: "#1E40AF",
                  },
                }}
              >
                {isSaving
                  ? "Saving..."
                  : isViewMode
                    ? activeStep === steps.length - 1
                      ? "Done"
                      : "Next"
                    : activeStep === steps.length - 1
                      ? "Complete"
                      : "Save & Next"}
              </Button>
            </Box>
          </Box>
        </Box>

        <Snackbar
          open={!!notifications.notifications.error}
          autoHideDuration={6000}
          onClose={notifications.clearNotifications}
        >
          <Alert
            onClose={notifications.clearNotifications}
            severity="error"
            sx={{ width: "100%" }}
          >
            {notifications.notifications.error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!notifications.notifications.success}
          autoHideDuration={6000}
          onClose={notifications.clearNotifications}
        >
          <Alert
            onClose={notifications.clearNotifications}
            severity="success"
            sx={{ width: "100%" }}
          >
            {notifications.notifications.success}
          </Alert>
        </Snackbar>
      </Box>
    </FormProvider>
  );
}
