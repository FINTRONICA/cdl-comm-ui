"use client";

import { Suspense } from "react";
import AgreementStepperWrapper from "@/components/organisms/Master/AgreementStepper";
import { DashboardLayout } from "@/components/templates/DashboardLayout";

function AgreementStepperWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading...</div>
      }
    >
      <AgreementStepperWrapper />
    </Suspense>
  );
}

export default function NewAgreementPage() {
  return (
    <DashboardLayout
      title="Agreement Details"
      subtitle="Register your agreement step by step, non-mandatory fields and steps are easy to skip."
    >
      <div className="px-3">
        <AgreementStepperWithSuspense />
      </div>
    </DashboardLayout>
  );
}
