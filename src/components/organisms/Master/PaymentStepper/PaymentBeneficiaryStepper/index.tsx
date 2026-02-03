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
import { FormProvider, type FieldErrors } from "react-hook-form";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import {
  usePaymentBeneficiaryStepStatus,
  usePaymentBeneficiaryStepManager,
} from "@/hooks/master/PaymentHook";
import { useCreateWorkflowRequest } from "@/hooks/workflow";
import { usePaymentBeneficiaryLabelsWithCache } from "@/hooks/master/PaymentHook";
import { getPaymentBeneficiaryLabel } from "@/constants/mappings/master/paymentMapping";
import { useAppStore } from "@/store";
import type {
  PaymentBeneficiaryDetailsData,
  PaymentBeneficiary,
  StepSaveResponse,
} from "@/services/api/masterApi/Payment/paymentBeneficiaryService";
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
  paymentBeneficiaryId?: string;
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

export default function PaymentBeneficiaryStepperWrapper({
  paymentBeneficiaryId: propPaymentBeneficiaryId,
  initialStep = 0,
  isViewMode: propIsViewMode,
}: StepperProps = {}) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDarkMode = useIsDarkMode();

  const paymentBeneficiaryId =
    propPaymentBeneficiaryId || (params.id as string) || "";

  const [activeStep, setActiveStep] = useState(initialStep);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStepValidating, setIsStepValidating] = useState(false);

  const mode = searchParams.get("mode");
  const isViewMode =
    propIsViewMode !== undefined ? propIsViewMode : mode === "view";

  const notifications = useStepNotifications();
  const dataProcessing = useStepDataProcessing();
  const { methods, formState, setShouldResetForm } = useStepForm(
    paymentBeneficiaryId,
    activeStep
  );
  const stepManager = usePaymentBeneficiaryStepManager();
  const validation = useStepValidation();
  const createWorkflowRequest = useCreateWorkflowRequest();

  const { data: paymentBeneficiaryLabels, getLabel } =
    usePaymentBeneficiaryLabelsWithCache();
  const currentLanguage = useAppStore((state) => state.language) || "EN";

  const getPaymentBeneficiaryLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getPaymentBeneficiaryLabel(configId);
      if (paymentBeneficiaryLabels) {
        return getLabel(configId, currentLanguage, fallback);
      }
      return fallback;
    },
    [paymentBeneficiaryLabels, currentLanguage, getLabel]
  );

  const steps = useMemo(
    () => [
      getPaymentBeneficiaryLabelDynamic("CDL_PAYMENT_BENEFICIARY"),
      "Documents (Optional)",
      "Review",
    ],
    [getPaymentBeneficiaryLabelDynamic]
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

  const { data: stepStatus } = usePaymentBeneficiaryStepStatus(
    paymentBeneficiaryId && paymentBeneficiaryId.trim() !== ""
      ? paymentBeneficiaryId
      : ""
  );

  const handleDocumentsChange = useCallback(
    (documents: DocumentItem[]) => {
      methods.setValue("documents", documents);
    },
    [methods]
  );

  useEffect(() => {
    setActiveStep(initialStep);
  }, [initialStep]);

  const getStepContent = useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return (
            <Step1
              isReadOnly={isViewMode}
              paymentBeneficiaryId={paymentBeneficiaryId}
            />
          );
        case 1:
          return (
            <DocumentUploadFactory
              type="PAYMENT_BENEFICIARY"
              entityId={paymentBeneficiaryId || ""}
              isOptional={true}
              onDocumentsChange={handleDocumentsChange}
              formFieldName="documents"
              isReadOnly={isViewMode}
            />
          );
        case 2:
          return (
            <Step2
              key={`review-${paymentBeneficiaryId}-${activeStep}`}
              paymentBeneficiaryId={paymentBeneficiaryId}
              onEditStep={handleEditStep}
              isReadOnly={isViewMode}
            />
          );
        default:
          return null;
      }
    },
    [
      paymentBeneficiaryId,
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
    } else if (paymentBeneficiaryId && !isViewMode) {
      setIsEditingMode(true);
    } else if (!paymentBeneficiaryId) {
      setIsEditingMode(false);
    }
  }, [searchParams, paymentBeneficiaryId, isViewMode]);

  const getModeParam = useCallback(() => {
    if (isViewMode) return "?mode=view";
    if (isEditingMode) return "?editing=true";
    return "";
  }, [isViewMode, isEditingMode]);

  const getErrorByPath = useCallback((errors: FieldErrors, path: string) => {
    return path.split(".").reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, errors);
  }, []);

  const findFirstErrorPath = useCallback(
    (errors: FieldErrors, prefix = ""): string | null => {
      for (const [key, value] of Object.entries(errors)) {
        const currentPath = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === "object") {
          if ("message" in value || "type" in value) {
            return currentPath;
          }
          const nested = findFirstErrorPath(value as FieldErrors, currentPath);
          if (nested) return nested;
        }
      }
      return null;
    },
    []
  );

  const scrollToFirstError = useCallback(() => {
    const errors = methods.formState.errors as FieldErrors;
    const firstError = findFirstErrorPath(errors);
    if (!firstError || typeof document === "undefined") return;
    methods.setFocus(firstError as never);
    const fieldElement = document.querySelector(
      `[name="${firstError}"]`
    ) as HTMLElement | null;
    fieldElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [methods, findFirstErrorPath]);

  const validateFormFields = useCallback(async () => {
    const isFormValid = await methods.trigger(undefined, { shouldFocus: false });
    if (!isFormValid) {
      notifications.showError(
        "Please fill in all required fields correctly before proceeding."
      );
      scrollToFirstError();
    }
    return isFormValid;
  }, [methods, notifications, scrollToFirstError]);

  const stepConfigs = useMemo(
    () => ({
      0: {
        validateStep: async () => validateFormFields(),
      },
      1: {
        validateStep: async () => {
          if (!paymentBeneficiaryId) {
            notifications.showError(
              "Payment Beneficiary ID is required to proceed to Review step."
            );
            return false;
          }
          return true;
        },
      },
      2: {
        validateStep: async () => {
          if (!stepStatus?.step1) {
            notifications.showError(
              "Please complete Payment Beneficiary details before continuing."
            );
            return false;
          }
          return true;
        },
      },
    }),
    [validateFormFields, notifications, paymentBeneficiaryId, stepStatus?.step1]
  );

  const validateCurrentStep = useCallback(async () => {
    const stepConfig = stepConfigs[activeStep as keyof typeof stepConfigs];
    const validator = stepConfig?.validateStep;
    if (!validator) return true;
    setIsStepValidating(true);
    try {
      return await validator();
    } finally {
      setIsStepValidating(false);
    }
  }, [activeStep, stepConfigs]);

  useEffect(() => {
    if (!paymentBeneficiaryId || !stepStatus) return;
    const maxAllowedStep = stepStatus.step1 ? 2 : 0;
    if (activeStep <= maxAllowedStep) return;
    const querySuffix = isViewMode
      ? "?mode=view"
      : isEditingMode
        ? "?editing=true"
        : "";
    router.replace(
      `/payment-beneficiary/${paymentBeneficiaryId}/step/${maxAllowedStep + 1}${querySuffix}`
    );
    setActiveStep(maxAllowedStep);
    notifications.showError("Please complete previous steps before continuing.");
  }, [
    activeStep,
    paymentBeneficiaryId,
    stepStatus,
    router,
    isViewMode,
    isEditingMode,
    notifications,
  ]);

  useEffect(() => {
    if (
      activeStep !== 2 &&
      paymentBeneficiaryId &&
      paymentBeneficiaryId.trim() !== "" &&
      dataProcessing.shouldProcessStepData(
        stepStatus,
        paymentBeneficiaryId,
        formState.shouldResetForm
      )
    ) {
      try {
        const processedData = dataProcessing.processStepDataForForm({
          activeStep,
          stepStatus,
        });
        methods.reset(processedData);
        setShouldResetForm(false);
      } catch (error) {
        // Don't throw - allow component to continue rendering
      }
    }
  }, [
    activeStep,
    stepStatus,
    paymentBeneficiaryId,
    setShouldResetForm,
    dataProcessing,
    formState.shouldResetForm,
    methods,
  ]);

  const handleSaveAndNext = async () => {
    try {
      notifications.clearNotifications();

      const canProceed = await validateCurrentStep();
      if (!canProceed) {
        return;
      }

      setIsSaving(true);

      if (isViewMode) {
        const nextStep = activeStep + 1;
        if (nextStep < steps.length) {
          const nextUrlStep = nextStep + 1;
          router.push(
            `/payment-beneficiary/${paymentBeneficiaryId}/step/${nextUrlStep}?mode=view`
          );
        } else {
          router.push("/payment-beneficiary");
        }
        return;
      }

      if (activeStep === 1) {
        const nextStep = activeStep + 1;
        if (nextStep < steps.length) {
          const nextUrlStep = nextStep + 1;
          const modeParam = getModeParam();

          if (!paymentBeneficiaryId) {
            notifications.showError(
              "Payment Beneficiary ID is required to proceed to Review step."
            );
            setIsSaving(false);
            return;
          }

          const nextUrl = `/payment-beneficiary/${paymentBeneficiaryId}/step/${nextUrlStep}${modeParam}`;
          router.push(nextUrl);
          setActiveStep(nextStep);
        } else {
          router.push("/payment-beneficiary");
        }
        setIsSaving(false);
        return;
      }

      if (activeStep === 2) {
        if (isViewMode) {
          router.push("/payment-beneficiary");
          setIsSaving(false);
          return;
        }

        try {
          const paymentBeneficiaryIdFromStatus =
            stepStatus?.stepData?.step1?.id?.toString();
          const finalPaymentBeneficiaryId =
            paymentBeneficiaryId || paymentBeneficiaryIdFromStatus;

          if (!finalPaymentBeneficiaryId) {
            notifications.showError(
              "Payment Beneficiary ID not found. Please complete Step 1 first."
            );
            setIsSaving(false);
            return;
          }

          const step1Data = stepStatus?.stepData?.step1;

          if (!step1Data) {
            notifications.showError(
              "Payment Beneficiary data not found. Please complete Step 1 first."
            );
            setIsSaving(false);
            return;
          }

          await createWorkflowRequest.mutateAsync({
            referenceId: finalPaymentBeneficiaryId,
            referenceType: "PAYMENT_BENEFICIARY",
            moduleName: "PAYMENT_BENEFICIARY",
            actionKey: "APPROVE",
            payloadJson: step1Data as unknown as Record<string, unknown>,
          });

          notifications.showSuccess(
            "Payment Beneficiary registration submitted successfully! Workflow request created."
          );
          setIsSaving(false);
          setTimeout(() => {
            router.push("/payment/payment-beneficiary");
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

      const currentFormData = methods.getValues() as unknown as Record<
        string,
        unknown
      >;

      let stepSpecificData: unknown = currentFormData;

      if (activeStep === 0) {
        const step1Data: PaymentBeneficiaryDetailsData = {
          beneficiaryAccountNumber:
            currentFormData.beneficiaryAccountNumber as string,
          beneficiaryBankIfscCode:
            currentFormData.beneficiaryBankIfscCode as string,
          creditAmountCap: currentFormData.creditAmountCap as number,
          creditAmount: currentFormData.creditAmount as number,
          transferPriorityLevel:
            currentFormData.transferPriorityLevel as number,
          creditSharePercentage:
            currentFormData.creditSharePercentage as number,
          currencyCode: currentFormData.currencyCode as string,
          paymentModeCode: currentFormData.paymentModeCode as string,
          beneficiaryNameDTO: currentFormData.beneficiaryNameDTO as
            | { id: number }
            | number
            | null
            | undefined,
          paymentModeDTO: currentFormData.paymentModeDTO as
            | { id: number }
            | number
            | null
            | undefined,
          currencyDTO: currentFormData.currencyDTO as
            | { id: number }
            | number
            | null
            | undefined,
          standingInstructionDTO: currentFormData.standingInstructionDTO as
            | { id: number }
            | number
            | null
            | undefined,
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
        paymentBeneficiaryId
      );

      notifications.showSuccess("Step saved successfully!");

      if (activeStep < steps.length - 1) {
        if (activeStep === 0) {
          const saveResponseData = saveResponse as
            | PaymentBeneficiary
            | StepSaveResponse;

          let savedPaymentBeneficiaryId: string | number | undefined;

          if (
            "id" in saveResponseData &&
            saveResponseData.id !== undefined &&
            saveResponseData.id !== null
          ) {
            savedPaymentBeneficiaryId = String(saveResponseData.id);
          } else if ("data" in saveResponseData && saveResponseData.data) {
            const data = saveResponseData.data;
            if (typeof data === "object" && data !== null && "id" in data) {
              const idValue = (data as PaymentBeneficiary).id;
              if (idValue !== undefined && idValue !== null) {
                savedPaymentBeneficiaryId = String(idValue);
              }
            }
          }

          if (savedPaymentBeneficiaryId) {
            const nextUrl = `/payment-beneficiary/${savedPaymentBeneficiaryId}/step/2${getModeParam()}`;
            router.push(nextUrl);
            setActiveStep(1);
          } else {
            if (paymentBeneficiaryId) {
              const nextUrl = `/payment-beneficiary/${paymentBeneficiaryId}/step/2${getModeParam()}`;
              router.push(nextUrl);
              setActiveStep(1);
            } else {
              setActiveStep((prev: number) => prev + 1);
            }
          }
        } else if (paymentBeneficiaryId) {
          const nextStep = activeStep + 1;
          const nextUrl = `/payment-beneficiary/${paymentBeneficiaryId}/step/${nextStep + 1}${getModeParam()}`;
          router.push(nextUrl);
          setActiveStep(nextStep);
        } else {
          setActiveStep((prev) => prev + 1);
        }
      } else {
        router.push("/payment-beneficiary");
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
    if (activeStep > 0 && paymentBeneficiaryId) {
      const previousStep = activeStep - 1;
      setActiveStep(previousStep);
      router.push(
        `/payment-beneficiary/${paymentBeneficiaryId}/step/${previousStep + 1}${getModeParam()}`
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
              onClick={() => router.push("/payment-beneficiary")}
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
                disabled={isSaving || isStepValidating}
                startIcon={
                  isSaving || isStepValidating ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
                sx={{
                  width: isSaving || isStepValidating ? "140px" : "114px",
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
                {isSaving || isStepValidating
                  ? isSaving
                    ? "Saving..."
                    : "Validating..."
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
