import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BankAccountService } from '@/services/api/bankAccountService'
import { BankAccountData } from '@/types/bankAccount'

// Hook for validating bank account
export function useValidateBankAccount() {
  return useMutation({
    mutationFn: (accountNumber: string) => BankAccountService.validateAccount(accountNumber),
    onSuccess: (data, accountNumber) => {
      console.log('✅ Bank account validation successful:', { accountNumber, data })
    },
    onError: (error, accountNumber) => {
      console.error('❌ Bank account validation failed:', { accountNumber, error })
    }
  })
}

// Hook for saving single bank account
export function useSaveBankAccount() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (bankAccountData: BankAccountData) => BankAccountService.saveBankAccount(bankAccountData),
    onSuccess: (data, bankAccountData) => {
      console.log('✅ Bank account saved successfully:', { bankAccountData, data })
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] })
    },
    onError: (error, bankAccountData) => {
      console.error('❌ Bank account save failed:', { bankAccountData, error })
    }
  })
}

// Hook for saving multiple bank accounts
export function useSaveMultipleBankAccounts() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (bankAccounts: BankAccountData[]) => BankAccountService.saveMultipleBankAccounts(bankAccounts),
    onSuccess: (data, bankAccounts) => {
      console.log('✅ Multiple bank accounts saved successfully:', { count: bankAccounts.length, data })
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] })
    },
    onError: (error, bankAccounts) => {
      console.error('❌ Multiple bank accounts save failed:', { count: bankAccounts.length, error })
    }
  })
}
