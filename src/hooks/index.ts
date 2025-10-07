// Basic hooks
export { useApi } from './useApi'
export { useDataLoader } from './useDataLoader'
export { useLogin } from './useLogin'

// Project hooks
export { 
  useProjects, 
  useProject, 
  useCreateProject, 
  useUpdateProject, 
  useDeleteProject,
  useProjectStats,
  useRefreshProjects,
  useProjectStepManager,
  useProjectStepStatus,
  useSaveProjectDetails,
  useSaveProjectAccount,
  useSaveProjectFees,
  useSaveProjectIndividualFee,
  useSaveProjectIndividualBeneficiary,
  useSaveProjectBeneficiary,
  useSaveProjectPaymentPlan,
  useSaveProjectFinancial,
  useSaveProjectClosure,
  useSaveProjectReview,
  useValidateProjectStep
} from './useProjects'

// Project Dropdown hooks
export { useProjectTypes, useProjectStatuses, useProjectCurrencies, useBankAccountStatuses } from './useProjectDropdowns'

// Bank Account hooks
export { useValidateBankAccount, useSaveBankAccount, useSaveMultipleBankAccounts } from './useBankAccount'
export { useDebounce } from './useDebounce'
export { useLocalStorage } from './useLocalStorage'
export { useIntersectionObserver } from './useIntersectionObserver'
export { useForm } from './useForm'
export { useTableState } from './useTableState'
export { useActivitiesTable } from './useActivitiesTable'
export { useConfirmationDialog } from './useConfirmationDialog'

// Sidebar hooks
export {
  useSidebarConfig,
  useSidebarConfigWithLoading,
} from './useSidebarConfig'
export { useSidebarLabels, useSidebarLabelsWithUtils } from './useSidebarLabels'

// JWT hooks
export { useJWT, useCurrentUserFromJWT } from './useJWT'
export {
  useJWTParser,
  useStoredJWTParser,
  useCurrentUserFromJWT as useCurrentUserFromJWTParser,
} from './useJWTParser'

// Enhanced API hooks (React Query)
export {
  useGetEnhanced,
  useGetWithPagination,
  usePostEnhanced,
  usePutEnhanced,
  useDeleteEnhanced,
  useAuthApi,
  useUserApi,
  useBankApi,
} from './useApiEnhanced'

// Auth Query hooks (React Query)
export {
  useLogin as useLoginMutation,
  useLogout,
  useCurrentUser,
  useIsAuthenticated,
  useRefreshToken,
  useForgotPassword,
  useResetPassword,
  useChangePassword,
  authQueryKeys,
} from './useAuthQuery'

// Build Partner hooks (React Query)
export {
  useBuildPartners,
  useBuildPartner,
  useCreateBuildPartner,
  useUpdateBuildPartner,
  useDeleteBuildPartner,
  useBuildPartnerLabels,
  useRefreshBuildPartners,
  BUILD_PARTNERS_QUERY_KEY,
} from './useBuildPartners'

// Pending Transaction hooks (React Query)
export {
  usePendingTransactions,
  usePendingTransactionsUI,
  usePendingTransaction,
  useCreatePendingTransaction,
  useUpdatePendingTransaction,
  useDeletePendingTransaction,
  usePendingTransactionLabels,
  useRefreshPendingTransactions,
  PENDING_TRANSACTIONS_QUERY_KEY,
} from './usePendingTransactions'

// Discarded Transaction hooks (React Query)
export {
  useDiscardedTransactions,
  useDiscardedTransactionsUI,
  useDiscardedTransaction,
  useCreateDiscardedTransaction,
  useUpdateDiscardedTransaction,
  useDeleteDiscardedTransaction,
  useDiscardedTransactionLabels,
  useRefreshDiscardedTransactions,
  DISCARDED_TRANSACTIONS_QUERY_KEY,
} from './useDiscardedTransactions'

// Cache hooks for labels
export { useDiscardedTransactionLabelsWithCache } from './useDiscardedTransactionLabelsWithCache'
export { useProcessedTransactionLabelsWithCache } from './useProcessedTransactionLabelsWithCache'

// Processed Transaction hooks
export { useProcessedTransactions } from './useProcessedTransactions'

// Build Partner Step hooks (React Query)
export {
  useSaveBuildPartnerDetails,
  useSaveBuildPartnerContact,
  useSaveBuildPartnerFees,
  useSaveBuildPartnerBeneficiary,
  useBuildPartnerBeneficiaries,
  useUpdateBuildPartnerBeneficiary,
  useDeleteBuildPartnerBeneficiary,
  useSaveBuildPartnerReview,
  useBuildPartnerStepData,
  useValidateBuildPartnerStep,
  useBuildPartnerStepManager,
  useBuildPartnerStepStatus
} from './useBuildPartners'

// Validation hooks
export {
  useValidateAccount,
  useValidateBIC,
  useValidateSwift,
  useValidateIBAN,
  useValidateBeneficiaryData,
  useValidationStatus,
} from './useValidation'

// Label Configuration hooks
export {
  useLabelConfigApi,
  useLabelConfigQuery,
  useLabelQuery,
  useLabelsByModuleQuery,
  useLabelsByLanguageQuery,
} from './useLabelConfigApi'
// Pending Transaction Label Configuration hooks
export {
  usePendingTransactionLabelApi,
  usePendingTransactionLabelsQuery,
  usePendingTransactionLabelQuery,
  usePendingTransactionLabelsByModuleQuery,
  usePendingTransactionLabelsByLanguageQuery,
} from './usePendingTransactionLabelApi'
// User Management Label Configuration hooks
export {
  useUserManagementLabelApi,
  useUserManagementLabelsQuery,
  useUserManagementLabelQuery,
  useUserManagementLabelsByModuleQuery,
  useUserManagementLabelsByLanguageQuery,
} from './useUserManagementLabelApi'
// Role Management Label Configuration hooks
export {
  useRoleManagementLabelApi,
  useRoleManagementLabelsQuery,
  useRoleManagementLabelQuery,
  useRoleManagementLabelsByModuleQuery,
  useRoleManagementLabelsByLanguageQuery,
} from './useRoleManagementLabelApi'
// Group Management Label Configuration hooks
export {
  useGroupManagementLabelApi,
  useGroupManagementLabelsQuery,
  useGroupManagementLabelQuery,
  useGroupManagementLabelsByModuleQuery,
  useGroupManagementLabelsByLanguageQuery,
} from './useGroupManagementLabelApi'

// Real Estate Document Template hooks
export {
  useTemplateDownload,
  useTemplateList,
  useTemplateDownloadWithProgress,
  useTemplateDownloadByCategory,
  type UseTemplateDownloadReturn,
  type UseTemplateListReturn,
  type UseTemplateDownloadWithProgressReturn,
} from './useRealEstateDocumentTemplate'
