"use client";

import { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import AgreementStepperWrapper from "@/components/organisms/Master/AgreementStepper";
import { GlobalLoading } from "@/components/atoms";
import {
  agreementService,
  type Agreement,
} from "@/services/api/masterApi/Entitie/agreementService";

function AgreementStepPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [agreementData, setAgreementData] = useState<Agreement | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const agreementId = params.id as string;
  const stepNumber = parseInt(params.stepNumber as string);

  const mode = searchParams.get("mode");
  const editing = searchParams.get("editing");
  const isViewMode = mode === "view";
  const isEditingMode = editing === "true";
  useEffect(() => {
    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 3) {
      router.push("/agreement");
      return;
    }
    setIsValidating(false);
  }, [stepNumber, router]);

  useEffect(() => {
    const fetchAgreementData = async () => {
      try {
        setIsLoadingData(true);
        setError(null);
        const data = await agreementService.getAgreement(agreementId);
        setAgreementData(data);
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || "Failed to fetch agreement data");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (agreementId && !isValidating) {
      fetchAgreementData();
    }
  }, [agreementId, isValidating]);

  if (isValidating || isLoadingData) {
    return (
      <DashboardLayout title="Agreement Details" subtitle="">
        <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Agreement Details"
        subtitle="Error loading agreement details"
      >
        <div className="p-6 text-red-600 dark:text-red-400">
          <p>Error: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Agreement Details"
      subtitle={
        isViewMode
          ? "View agreement details and configuration (Read-only)"
          : isEditingMode
            ? "Edit agreement details and configuration"
            : "Register your agreement step by step, non-mandatory fields and steps are easy to skip."
      }
    >
      <div className="flex items-start py-2 gap-7 px-7">
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Agreement Name
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {agreementData?.productManagerName || "N/A"}
          </span>
        </div>
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Agreement CIF
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {agreementData?.primaryEscrowCifNumber || "N/A"}
          </span>
        </div>
      </div>
      <div className="px-3 mt-[10px] bg-white/75 dark:bg-[#101828] p-2 border-radius-md">
        <AgreementStepperWrapper
          agreementId={agreementId}
          initialStep={stepNumber - 1}
          isViewMode={isViewMode}
        />
      </div>
    </DashboardLayout>
  );
}

export default function AgreementStepPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Agreement Details" subtitle="">
          <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
            <GlobalLoading fullHeight />
          </div>
        </DashboardLayout>
      }
    >
      <AgreementStepPageContent />
    </Suspense>
  );
}
