'use client'

import React, { createContext, useContext, ReactNode, useMemo } from 'react'
import { useApplicationSettings } from '@/hooks/useApplicationSettings'
import { useRealEstateAssets } from '@/hooks/useRealEstateAssets'
import { useBuildPartners } from '@/hooks/useBuildPartners'
import { useMultipleAccountBalances } from '@/hooks/useAccountBalance'
import { useBoolYnOptions } from '@/hooks/useApplicationSettings'

// Types for the shared data
export interface ManualPaymentSharedData {
    // Application Settings
    paymentTypes: { data: any[]; loading: boolean; error: string | null }
    paymentSubTypes: { data: any[]; loading: boolean; error: string | null }
    currencies: { data: any[]; loading: boolean; error: string | null }
    depositModes: { data: any[]; loading: boolean; error: string | null }
    paymentModes: { data: any[]; loading: boolean; error: string | null }
    transferTypes: { data: any[]; loading: boolean; error: string | null }
    buildAssetAccountStatuses: { data: any[]; loading: boolean; error: string | null }
    boolYnOptions: { data: any[]; loading: boolean; error: string | null }

    // Real Estate Assets
    realEstateAssets: { data: any[]; loading: boolean; error: string | null }

    // Build Partners
    buildPartners: { data: any[]; loading: boolean; error: string | null }

    // Account Balances
    accountBalances: {
        balances: any
        loadingStates: any
        errors: any
        fetchBalance: (accountKey: string, accountNumber: string, bankCode?: string) => Promise<void>
        clearBalance: (accountKey: string) => void
        clearAllBalances: () => void
    }

    // Overall loading state
    isInitialLoading: boolean
    hasErrors: boolean
}

// Create context
const ManualPaymentDataContext = createContext<ManualPaymentSharedData | null>(null)

// Provider component
interface ManualPaymentDataProviderProps {
    children: ReactNode
}

export const ManualPaymentDataProvider: React.FC<ManualPaymentDataProviderProps> = ({
    children
}) => {
    // Application Settings hooks
    const paymentTypes = useApplicationSettings('PAYMENT_EXPENSE_TYPE')
    const paymentSubTypes = useApplicationSettings('PAYMENT_EXPENSE_SUB_TYPE')
    const currencies = useApplicationSettings('CURRENCY')
    const depositModes = useApplicationSettings('DEPOSIT_MODE')
    const paymentModes = useApplicationSettings('PAYMENT_MODE')
    const transferTypes = useApplicationSettings('TRANSFER_TYPE')
    const buildAssetAccountStatuses = useApplicationSettings('BUILD_ASSEST_ACCOUNT_STATUS')
    const boolYnOptions = useBoolYnOptions()

    // Real Estate Assets hook
    const realEstateAssetsQuery = useRealEstateAssets(0, 20)

    // Build Partners hook
    const buildPartnersQuery = useBuildPartners(0, 100)

    // Account Balance hooks
    const accountBalances = useMultipleAccountBalances()

    // Calculate overall loading and error states
    const isInitialLoading =
        paymentTypes.loading ||
        paymentSubTypes.loading ||
        currencies.loading ||
        depositModes.loading ||
        paymentModes.loading ||
        transferTypes.loading ||
        buildAssetAccountStatuses.loading ||
        boolYnOptions.loading ||
        realEstateAssetsQuery.loading ||
        buildPartnersQuery.isLoading

    const hasErrors = !!(
        paymentTypes.error ||
        paymentSubTypes.error ||
        currencies.error ||
        depositModes.error ||
        paymentModes.error ||
        transferTypes.error ||
        buildAssetAccountStatuses.error ||
        boolYnOptions.error ||
        realEstateAssetsQuery.error ||
        buildPartnersQuery.error
    )

    // Memoize build partners data to prevent unnecessary re-computations
    const buildPartnersData = useMemo(() => ({
        data: buildPartnersQuery.data?.content || [],
        loading: buildPartnersQuery.isLoading,
        error: buildPartnersQuery.error ? (buildPartnersQuery.error as Error).message : null,
    }), [buildPartnersQuery.data?.content, buildPartnersQuery.isLoading, buildPartnersQuery.error])

    // Memoize real estate assets data
    const realEstateAssetsData = useMemo(() => ({
        data: realEstateAssetsQuery.assets || [],
        loading: realEstateAssetsQuery.loading,
        error: realEstateAssetsQuery.error,
    }), [realEstateAssetsQuery.assets, realEstateAssetsQuery.loading, realEstateAssetsQuery.error])

    // Memoize the entire context value to prevent unnecessary re-renders
    const contextValue: ManualPaymentSharedData = useMemo(() => ({
        // Application Settings
        paymentTypes,
        paymentSubTypes,
        currencies,
        depositModes,
        paymentModes,
        transferTypes,
        buildAssetAccountStatuses,
        boolYnOptions,

        // Real Estate Assets
        realEstateAssets: realEstateAssetsData,

        // Build Partners
        buildPartners: buildPartnersData,

        // Account Balances
        accountBalances,

        // Overall states
        isInitialLoading,
        hasErrors,
    }), [
        paymentTypes,
        paymentSubTypes,
        currencies,
        depositModes,
        paymentModes,
        transferTypes,
        buildAssetAccountStatuses,
        boolYnOptions,
        realEstateAssetsData,
        buildPartnersData,
        accountBalances,
        isInitialLoading,
        hasErrors,
    ])

    return (
        <ManualPaymentDataContext.Provider value={contextValue}>
            {children}
        </ManualPaymentDataContext.Provider>
    )
}

// Custom hook to use the context
export const useManualPaymentData = (): ManualPaymentSharedData => {
    const context = useContext(ManualPaymentDataContext)
    if (!context) {
        throw new Error('useManualPaymentData must be used within ManualPaymentDataProvider')
    }
    return context
}

// Individual hooks for specific data (optional convenience hooks)
export const useManualPaymentSettings = () => {
    const context = useManualPaymentData()
    return {
        paymentTypes: context.paymentTypes,
        paymentSubTypes: context.paymentSubTypes,
        currencies: context.currencies,
        depositModes: context.depositModes,
        paymentModes: context.paymentModes,
        transferTypes: context.transferTypes,
        buildAssetAccountStatuses: context.buildAssetAccountStatuses,
        boolYnOptions: context.boolYnOptions,
    }
}

export const useManualPaymentAssets = () => {
    const context = useManualPaymentData()
    return {
        realEstateAssets: context.realEstateAssets,
        buildPartners: context.buildPartners,
    }
}
