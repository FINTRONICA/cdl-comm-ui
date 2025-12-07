import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BankAccountService } from '@/services/api/bankAccountService'
import { BankAccountData } from '@/types/bankAccount'

// Hook for validating bank account
export function useValidateBankAccount() {
  return useMutation({
    mutationFn: (accountNumber: string) =>
      BankAccountService.validateAccount(accountNumber),
    onSuccess: (data, accountNumber) => {
      //  success message
    },
    onError: (error, accountNumber) => {
      throw error
    },
  })
}

// Hook for saving single bank account
export function useSaveBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bankAccountData: BankAccountData) =>
      BankAccountService.saveBankAccount(bankAccountData),
    onSuccess: (data, bankAccountData) => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] })
    },
    onError: (error, bankAccountData) => {
      throw error
    },
  })
}

// Hook for updating bank account
export function useUpdateBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bankAccountData: BankAccountData) =>
      BankAccountService.updateBankAccount(bankAccountData),
    onSuccess: (data, bankAccountData) => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] })
    },
    onError: (error, bankAccountData) => {
      throw error
    },
  })
}

// Hook for saving or updating bank account (decides between POST and PUT based on ID)
export function useSaveOrUpdateBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bankAccountData: BankAccountData) => {
      // If account has an ID, update it (PUT), otherwise create new (POST)
      if (bankAccountData.id && bankAccountData.id !== 9007199254740991) {
        return BankAccountService.updateBankAccount(bankAccountData)
      } else {
        return BankAccountService.saveBankAccount(bankAccountData)
      }
    },
    onSuccess: (data, bankAccountData) => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] })
    },
    onError: (error, bankAccountData) => {
      throw error
    },
  })
}

// Hook for saving multiple bank accounts
export function useSaveMultipleBankAccounts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bankAccounts: BankAccountData[]) =>
      BankAccountService.saveMultipleBankAccounts(bankAccounts),
    onSuccess: (data, bankAccounts) => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] })
    },
    onError: (error, bankAccounts) => {
      throw error
    },
  })
}
