// import { useCallback, useEffect } from 'react'
// import { UseFormReturn } from 'react-hook-form'
// import {
//   Step1,
//   Step2,
//   Step3,
//   Step4,
//   Step5,
//   Step6,
//   Step7,
//   Step8,
//   LazyStepWrapper,
//   preloadNextStep,
// } from './lazyComponents'
// import { ProjectData } from './types'
// import DocumentUploadFactory from '../DocumentUpload/DocumentUploadFactory'
// import { DocumentItem } from '../DeveloperStepper/developerTypes'

// interface StepContentProps {
//   activeStep: number
//   projectId?: string
//   methods: UseFormReturn<ProjectData>
//   isViewMode?: boolean
//   onEditStep?: (stepNumber: number) => void
// }

// export const useStepContentRenderer = ({
//   activeStep,
//   projectId,
//   methods,
//   isViewMode = false,
//   onEditStep,
// }: StepContentProps) => {
//   // Preload next step for better performance
//   useEffect(() => {
//     if (activeStep !== undefined) {
//       preloadNextStep(activeStep)
//     }
//   }, [activeStep])

//   // Memoized callbacks to prevent infinite re-renders
//   const handleAccountsChange = useCallback(
//     (accounts: any[]) => {
//       methods.setValue('accounts', accounts)
//     },
//     [methods]
//   )

//   const handleFeesChange = useCallback(
//     (fees: any[]) => {
//       methods.setValue('fees', fees)
//     },
//     [methods]
//   )

//   const handleBeneficiariesChange = useCallback(
//     (beneficiaries: any[]) => {
//       methods.setValue('beneficiaries', beneficiaries)
//     },
//     [methods]
//   )

//   const handlePaymentPlanChange = useCallback(
//     (paymentPlan: any[]) => {
//       methods.setValue('paymentPlan', paymentPlan)
//     },
//     [methods]
//   )

//   const handleFinancialDataChange = useCallback(
//     (financialData: any) => {
//       methods.setValue('financialData', financialData)
//     },
//     [methods]
//   )

//   const handleClosureDataChange = useCallback(
//     (closureData: any) => {
//       methods.setValue('closureData', closureData)
//     },
//     [methods]
//   )

//   const handleDocumentsChange = useCallback(
//     (documents: DocumentItem[]) => {
//       methods.setValue('documents', documents)
//     },
//     [methods]
//   )

//   const getStepContent = useCallback(
//     (step: number) => {
//       const stepComponents = {
//         0: () => (
//           <LazyStepWrapper>
//             <Step1 isViewMode={isViewMode} projectId={projectId} />
//           </LazyStepWrapper>
//         ),
//         1: () => (
//           <LazyStepWrapper>
//             <DocumentUploadFactory
//               type="BUILD_PARTNER_ASSET"
//               entityId={projectId || 'temp_project_id'}
//               isOptional={true}
//               onDocumentsChange={handleDocumentsChange}
//               formFieldName="documents"
//             />
//           </LazyStepWrapper>
//         ),
//         2: () => {
//           const watchedAccounts = methods.watch('accounts')
//           return (
//             <LazyStepWrapper>
//               <Step2
//                 accounts={watchedAccounts}
//                 onAccountsChange={(accounts) => {
//                   handleAccountsChange(accounts)
//                 }}
//                 projectId={projectId || ''}
//                 isViewMode={isViewMode}
//               />
//             </LazyStepWrapper>
//           )
//         },
//         3: () => {
//           const watchedFees = methods.watch('fees')
//           const buildPartnerIdForFees = methods
//             .watch('buildPartnerDTO.id')
//             ?.toString()
//           return (
//             <LazyStepWrapper>
//               <Step3
//                 fees={watchedFees}
//                 onFeesChange={handleFeesChange}
//                 projectId={projectId || ''}
//                 buildPartnerId={buildPartnerIdForFees}
//                 isViewMode={isViewMode}
//               />
//             </LazyStepWrapper>
//           )
//         },
//         4: () => {
//           const buildPartnerIdForBeneficiaries = methods
//             .watch('buildPartnerDTO.id')
//             ?.toString()
//           const watchedBeneficiaries = methods.watch('beneficiaries')
//           return (
//             <LazyStepWrapper>
//               <Step4
//                 beneficiaries={watchedBeneficiaries}
//                 onBeneficiariesChange={handleBeneficiariesChange}
//                 projectId={projectId || ''}
//                 buildPartnerId={buildPartnerIdForBeneficiaries}
//                 isViewMode={isViewMode}
//               />
//             </LazyStepWrapper>
//           )
//         },
//         5: () => {
//           const watchedPaymentPlan = methods.watch('paymentPlan')
//           return (
//             <LazyStepWrapper>
//               <Step5
//                 paymentPlan={watchedPaymentPlan}
//                 onPaymentPlanChange={handlePaymentPlanChange}
//                 projectId={projectId}
//                 isViewMode={isViewMode}
//               />
//             </LazyStepWrapper>
//           )
//         },
//         6: () => {
//           const watchedFinancialData = methods.watch('financialData')
//           return (
//             <LazyStepWrapper>
//               <Step6
//                 financialData={watchedFinancialData}
//                 onFinancialDataChange={handleFinancialDataChange}
//                 isViewMode={isViewMode}
//               />
//             </LazyStepWrapper>
//           )
//         },
//         7: () => {
//           const watchedClosureData = methods.watch('closureData')
//           return (
//             <LazyStepWrapper>
//               <Step7
//                 projectId={projectId || 'temp_project_id'}
//                 isViewMode={isViewMode}
//               />
//             </LazyStepWrapper>
//           )
//         },
//         8: () => {
//           const projectData = methods.getValues()
//           return (
//             <LazyStepWrapper>
//               <Step8
//                 projectData={projectData}
//                 onEditStep={onEditStep}
//                 projectId={projectId || ''}
//                 isViewMode={isViewMode}
//               />
//             </LazyStepWrapper>
//           )
//         },
//       }

//       const StepComponent = stepComponents[step as keyof typeof stepComponents]
//       return StepComponent ? StepComponent() : null
//     },
//     [
//       projectId,
//       methods,
//       isViewMode,
//       onEditStep,
//       handleAccountsChange,
//       handleFeesChange,
//       handleBeneficiariesChange,
//       handlePaymentPlanChange,
//       handleFinancialDataChange,
//       handleClosureDataChange,
//       handleDocumentsChange,
//     ]
//   )

//   return {
//     getStepContent,
//   }
// }
