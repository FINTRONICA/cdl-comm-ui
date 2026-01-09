"use client";

import { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import AgreementSignatoryStepperWrapper from "@/components/organisms/Master/AgreementSignatoryStepper";
import { GlobalLoading } from "@/components/atoms";
import {
  agreementSignatoryService,
  type AgreementSignatory,
} from "@/services/api/masterApi/Entitie/agreementSignatoryService";

function AgreementSignatoryStepPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [agreementSignatoryData, setAgreementSignatoryData] =
    useState<AgreementSignatory | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const agreementSignatoryId = params.id as string;
  const stepNumber = parseInt(params.stepNumber as string);

  // Get mode and editing from URL params
  const mode = searchParams.get("mode");
  const editing = searchParams.get("editing");
  const isViewMode = mode === "view";
  const isEditingMode = editing === "true";

  // Validate step number and fetch agreement signatory data
  useEffect(() => {
    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 3) {
      router.push("/agreement-signatory");
      return;
    }
    setIsValidating(false);
  }, [stepNumber, router]);

  // Fetch agreement signatory data
  useEffect(() => {
    const fetchAgreementSignatoryData = async () => {
      try {
        setIsLoadingData(true);
        setError(null);
        const data =
          await agreementSignatoryService.getAgreementSignatory(
            agreementSignatoryId
          );
        setAgreementSignatoryData(data);
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || "Failed to fetch agreement signatory data");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (agreementSignatoryId && !isValidating) {
      fetchAgreementSignatoryData();
    }
  }, [agreementSignatoryId, isValidating]);

  if (isValidating || isLoadingData) {
    return (
      <DashboardLayout title="Agreement Signatory Details" subtitle="">
        <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Agreement Signatory Details"
        subtitle="Error loading agreement signatory details"
      >
        <div className="p-6 text-red-600 dark:text-red-400">
          <p>Error: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Agreement Signatory Details"
      subtitle={
        isViewMode
          ? "View agreement signatory details and configuration (Read-only)"
          : isEditingMode
            ? "Edit agreement signatory details and configuration"
            : "Register your agreement signatory step by step, non-mandatory fields and steps are easy to skip."
      }
    >
      <div className="flex items-start py-2 gap-7 px-7">
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Agreement Signatory Name
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {agreementSignatoryData?.partyFullName || "N/A"}
          </span>
        </div>
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Reference Number
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {agreementSignatoryData?.partyReferenceNumber || "N/A"}
          </span>
        </div>
      </div>
      <div className="px-3 mt-[10px] bg-white/75 dark:bg-[#101828] p-2 border-radius-md">
        <AgreementSignatoryStepperWrapper
          agreementSignatoryId={agreementSignatoryId}
          initialStep={stepNumber - 1}
          isViewMode={isViewMode}
        />
      </div>
    </DashboardLayout>
  );
}

export default function AgreementSignatoryStepPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Agreement Signatory Details" subtitle="">
          <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
            <GlobalLoading fullHeight />
          </div>
        </DashboardLayout>
      }
    >
      <AgreementSignatoryStepPageContent />
    </Suspense>
  );
}
