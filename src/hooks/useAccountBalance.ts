import { useState } from 'react';
import { accountBalanceService, type AccountBalanceResponse, type AccountBalanceRequest } from '@/services/api/accountBalanceService';

// Hook return type
export interface UseAccountBalanceReturn {
  data: AccountBalanceResponse | null;
  loading: boolean;
  error: string | null;
  fetchBalance: (accountNumber: string, bankCode?: string) => Promise<void>;
  clearData: () => void;
}

/**
 * Hook to fetch account balance by account number
 * @returns Object containing data, loading state, error, and fetch function
 */
export function useAccountBalance(): UseAccountBalanceReturn {
  const [data, setData] = useState<AccountBalanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async (accountNumber: string, bankCode?: string) => {
    try {
      setLoading(true);
      setError(null);
      
    
      
      const result = await accountBalanceService.getAccountBalance(accountNumber, bankCode);
      
      setData(result);
      
     
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setData(null);
      
     
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setData(null);
    setError(null);
  };

  return {
    data,
    loading,
    error,
    fetchBalance,
    clearData
  };
}

// Convenience hook for multiple account balances
export function useMultipleAccountBalances() {
  const [balances, setBalances] = useState<Record<string, AccountBalanceResponse | null>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const fetchBalance = async (accountKey: string, accountNumber: string, bankCode?: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [accountKey]: true }));
      setErrors(prev => ({ ...prev, [accountKey]: null }));
      
      
      
      const result = await accountBalanceService.getAccountBalance(accountNumber, bankCode);
      
      setBalances(prev => ({ ...prev, [accountKey]: result }));
      
     
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setErrors(prev => ({ ...prev, [accountKey]: errorMessage }));
      setBalances(prev => ({ ...prev, [accountKey]: null }));
   
    } finally {
      setLoadingStates(prev => ({ ...prev, [accountKey]: false }));
    }
  };

  const clearBalance = (accountKey: string) => {
    setBalances(prev => ({ ...prev, [accountKey]: null }));
    setErrors(prev => ({ ...prev, [accountKey]: null }));
  };

  const clearAllBalances = () => {
    setBalances({});
    setErrors({});
  };

  return {
    balances,
    loadingStates,
    errors,
    fetchBalance,
    clearBalance,
    clearAllBalances
  };
}
