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
import { useAccountStepStatus, useAccountStepManager } from "@/hooks";
import { useCreateWorkflowRequest } from "@/hooks/workflow";
import { useAccountLabelsWithCache } from "@/hooks";
import { getAccountLabel } from "@/constants/mappings/master/Entity/accountMapping";
import { useAppStore } from "@/store";
import type {
  AccountDetailsData,
  Account,
  StepSaveResponse,
} from "@/services/api/masterApi/Entitie/accountService";

interface StepperProps {
  accountId?: string;
  initialStep?: number;
  isViewMode?: boolean;
}
import {
  useStepNotifications,
  useStepDataProcessing,
  useStepForm,
} from "../PartyStepper/hooks";
import { useStepValidation } from "./hooks/useStepValidation";
import { Step1, Step2 } from "./steps";
import DocumentUploadFactory from "../../DocumentUpload/DocumentUploadFactory";
import { DocumentItem } from "../PartyStepper/partyTypes";

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

export default function AccountStepperWrapper({
  accountId: propAccountId,
  initialStep = 0,
  isViewMode: propIsViewMode,
}: StepperProps = {}) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDarkMode = useIsDarkMode();
  const accountId = propAccountId || (params.id as string) || "";
  const [activeStep, setActiveStep] = useState(initialStep);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const mode = searchParams.get("mode");
  const isViewMode =
    propIsViewMode !== undefined ? propIsViewMode : mode === "view";
  const notifications = useStepNotifications();
  const dataProcessing = useStepDataProcessing();
  const { methods, formState, setShouldResetForm } = useStepForm(
    accountId,
    activeStep
  );
  const stepManager = useAccountStepManager();
  const validation = useStepValidation();
  const createWorkflowRequest = useCreateWorkflowRequest();

  const { data: accountLabels, getLabel } = useAccountLabelsWithCache();
  const currentLanguage = useAppStore((state) => state.language) || "EN";

  const getAccountLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAccountLabel(configId);
      if (accountLabels) {
        return getLabel(configId, currentLanguage, fallback);
      }
      return fallback;
    },
    [accountLabels, currentLanguage, getLabel]
  );

  // Define steps array (direct mapping for clarity)
  const steps = useMemo(
    () => [
      getAccountLabelDynamic("CDL_ACCOUNT_DETAILS"),
      "Documents (Optional)",
      "Review",
    ],
    [getAccountLabelDynamic]
  );

  // Edit navigation handler
  const handleEditStep = useCallback(
    (stepNumber: number) => {
      setActiveStep(stepNumber);
      setIsEditingMode(true);
      setShouldResetForm(true);
      notifications.showSuccess(`Now editing step ${stepNumber + 1} data`);
    },
    [setShouldResetForm, notifications]
  );

  const { data: stepStatus } = useAccountStepStatus(
    accountId && accountId.trim() !== "" ? accountId : ""
  );

  const handleDocumentsChange = useCallback(
    (documents: DocumentItem[]) => {
      methods.setValue("documents", documents);
    },
    [methods]
  );

  // Step content renderer
  const getStepContent = useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return <Step1 isReadOnly={isViewMode} accountId={accountId} />;
        case 1:
          return (
            <DocumentUploadFactory
              type="ACCOUNT"
              entityId={accountId || ""}
              isOptional={true}
              onDocumentsChange={handleDocumentsChange}
              formFieldName="documents"
              isReadOnly={isViewMode}
            />
          );
        case 2:
          return (
            <Step2
              key={`review-${accountId}-${activeStep}`}
              accountId={accountId}
              onEditStep={handleEditStep}
              isReadOnly={isViewMode}
            />
          );
        default:
          return null;
      }
    },
    [accountId, isViewMode, handleEditStep, handleDocumentsChange, activeStep]
  );

  // Set editing mode based on URL parameter or accountId
  useEffect(() => {
    const editing = searchParams.get("editing");
    if (editing === "true") {
      setIsEditingMode(true);
    } else if (accountId && !isViewMode) {
      setIsEditingMode(true);
    } else if (!accountId) {
      setIsEditingMode(false);
    }
  }, [searchParams, accountId, isViewMode]);

  // Helper function to build mode parameter for navigation (matching capital partner pattern)
  const getModeParam = useCallback(() => {
    if (isViewMode) return "?mode=view";
    if (isEditingMode) return "?editing=true";
    return "";
  }, [isViewMode, isEditingMode]);

  useEffect(() => {
    if (
      activeStep !== 2 &&
      accountId &&
      accountId.trim() !== "" &&
      dataProcessing.shouldProcessStepData(
        stepStatus,
        accountId,
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
      } catch {}
    }
  }, [
    activeStep,
    stepStatus,
    accountId,
    setShouldResetForm,
    dataProcessing,
    formState.shouldResetForm,
    methods,
  ]);

  const handleSaveAndNext = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      setIsSaving(true);
      notifications.clearNotifications();
      if (isViewMode) {
        const nextStep = activeStep + 1;
        if (nextStep < steps.length) {
          const nextUrlStep = nextStep + 1;
          router.push(
            `/escrow-account/${accountId}/step/${nextUrlStep}?mode=view`
          );
        } else {
          router.push("/escrow-account");
        }
        return;
      }

      // Documents (Optional) step doesn't need API call here - items are saved when "Add" is clicked
      // This step should skip ALL validation and just navigate
      if (activeStep === 1) {
        const nextStep = activeStep + 1;
        if (nextStep < steps.length) {
          const nextUrlStep = nextStep + 1;
          const modeParam = getModeParam();
          if (!accountId) {
            notifications.showError(
              "Account ID is required to proceed to Review step."
            );
            setIsSaving(false);
            return;
          }
          const nextUrl = `/escrow-account/${accountId}/step/${nextUrlStep}${modeParam}`;
          router.push(nextUrl);
          setActiveStep(nextStep);
        } else {
          router.push("/escrow-account");
        }
        setIsSaving(false);
        return;
      }

      // Review step (step 3) - complete the process and submit workflow request
      // This should ONLY run when clicking "Save and Next" ON the Review step itself
      if (activeStep === 2) {
        if (isViewMode) {
          router.push("/escrow-account");
          setIsSaving(false);
          return;
        }
        try {
          const accountIdFromStatus =
            stepStatus?.stepData?.step1?.id?.toString();
          const finalAccountId = accountId || accountIdFromStatus;

          if (!finalAccountId) {
            notifications.showError(
              "Account ID not found. Please complete Step 1 first."
            );
            setIsSaving(false);
            return;
          }
          const step1Data = stepStatus?.stepData?.step1;
          if (!step1Data) {
            notifications.showError(
              "Account data not found. Please complete Step 1 first."
            );
            setIsSaving(false);
            return;
          }

          // Submit workflow request with only step1 data
          await createWorkflowRequest.mutateAsync({
            referenceId: finalAccountId,
            referenceType: "ACCOUNT",
            moduleName: "ACCOUNT",
            actionKey: "APPROVE",
            payloadJson: step1Data as unknown as Record<string, unknown>,
          });

          notifications.showSuccess(
            "Account registration submitted successfully! Workflow request created."
          );
          setIsSaving(false);
          setTimeout(() => {
            router.push("/escrow-account");
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
        const step1Data: AccountDetailsData = {
          accountNumber: currentFormData.accountNumber as string,
          productCode: currentFormData.productCode as string,
          accountDisplayName: currentFormData.accountDisplayName as string,
          ibanNumber: currentFormData.ibanNumber as string,
          officialAccountTitle: currentFormData.officialAccountTitle as string,
          virtualAccountNumber: currentFormData.virtualAccountNumber as
            | string
            | undefined,
          accountTypeCode: currentFormData.accountTypeCode as string,
          assignmentStatus: currentFormData.assignmentStatus as string,
          assignedToReference: currentFormData.assignedToReference as
            | string
            | undefined,
          accountOpenDateTime: currentFormData.accountOpenDateTime as string,
          referenceField1: currentFormData.referenceField1 as
            | string
            | undefined,
          referenceField2: currentFormData.referenceField2 as
            | string
            | undefined,
          active:
            currentFormData.active !== undefined
              ? typeof currentFormData.active === "boolean"
                ? currentFormData.active
                : currentFormData.active === "true" ||
                  currentFormData.active === true
              : true,
          taxPaymentDTO: currentFormData.taxPaymentDTO as
            | { id: number }
            | number
            | null
            | undefined,
          currencyDTO: currentFormData.currencyDTO as
            | { id: number }
            | number
            | null
            | undefined,
          accountPurposeDTO: currentFormData.accountPurposeDTO as
            | { id: number }
            | number
            | null
            | undefined,
          accountCategoryDTO: currentFormData.accountCategoryDTO as
            | { id: number }
            | number
            | null
            | undefined,
          primaryAccountDTO: currentFormData.primaryAccountDTO as
            | { id: number }
            | number
            | null
            | undefined,
          bulkUploadProcessingDTO: currentFormData.bulkUploadProcessingDTO as
            | { id: number }
            | number
            | null
            | undefined,
          unitaryPaymentDTO: currentFormData.unitaryPaymentDTO as
            | { id: number }
            | number
            | null
            | undefined,
          accountTypeDTO: currentFormData.accountTypeDTO as
            | { id: number }
            | number
            | null
            | undefined,
          accountTypeCategoryDTO: currentFormData.accountTypeCategoryDTO as
            | { id: number }
            | number
            | null
            | undefined,
          escrowAgreementDTO: currentFormData.escrowAgreementDTO as
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
        accountId
      );

      notifications.showSuccess("Step saved successfully!");

      if (activeStep < steps.length - 1) {
        if (activeStep === 0) {
          const saveResponseData = saveResponse as Account | StepSaveResponse;

          let savedAccountId: string | number | undefined;

          if (
            "id" in saveResponseData &&
            saveResponseData.id !== undefined &&
            saveResponseData.id !== null
          ) {
            savedAccountId = String(saveResponseData.id);
          } else if ("data" in saveResponseData && saveResponseData.data) {
            const data = saveResponseData.data;
            if (typeof data === "object" && data !== null && "id" in data) {
              const idValue = (data as Account).id;
              if (idValue !== undefined && idValue !== null) {
                savedAccountId = String(idValue);
              }
            }
          }

          if (savedAccountId) {
            const nextUrl = `/escrow-account/${savedAccountId}/step/2${getModeParam()}`;
            router.push(nextUrl);
            setActiveStep(1);
          } else {
            if (accountId) {
              const nextUrl = `/escrow-account/${accountId}/step/2${getModeParam()}`;
              router.push(nextUrl);
              setActiveStep(1);
            } else {
              setActiveStep((prev: number) => prev + 1);
            }
          }
        } else if (accountId) {
          const nextStep = activeStep + 1;
          const nextUrl = `/escrow-account/${accountId}/step/${nextStep + 1}${getModeParam()}`;
          router.push(nextUrl);
          setActiveStep(nextStep);
        } else {
          setActiveStep((prev) => prev + 1);
        }
      } else {
        router.push("/escrow-account");
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
    if (activeStep > 0 && accountId) {
      const previousStep = activeStep - 1;
      setActiveStep(previousStep);
      router.push(
        `/escrow-account/${accountId}/step/${previousStep + 1}${getModeParam()}`
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
              type="button"
              variant="outlined"
              onClick={() => router.push("/escrow-account")}
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
                  type="button"
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
                type="button"
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
                      : "Save and Next"}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Error and Success Notifications */}
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
