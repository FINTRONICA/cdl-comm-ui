"use client";

import { Suspense } from "react";
import AgreementSignatoryStepperWrapper from "@/components/organisms/Master/AgreementSignatoryStepper";
import { DashboardLayout } from "@/components/templates/DashboardLayout";

function AgreementSignatoryStepperWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading...</div>
      }
    >
      <AgreementSignatoryStepperWrapper />
    </Suspense>
  );
}

export default function NewAgreementSignatoryPage() {
  return (
    <DashboardLayout
      title="Agreement Signatory Details"
      subtitle="Register your agreement signatory step by step, non-mandatory fields and steps are easy to skip."
    >
      <div className="px-3">
        <AgreementSignatoryStepperWithSuspense />
      </div>
    </DashboardLayout>
  );
}
