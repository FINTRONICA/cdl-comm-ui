// Types for bank account validation and management

export interface BankAccountValidationResponse {
  id: string;
  accountNumber: string;
  cif: string;
  currencyCode: string;
  branchCode: string;
  name: string;
  shortName: string;
  schemeType: string;
  schemeCode: string;
  transferType: string;
  bankName: string;
  swiftCode: string;
  routingCode: string;
  beneficiaryId: string;
  details: {
    genLedgerSubHeadCode: string;
    iban: string;
    lastStatementDate: number; // Unix timestamp
    lastModificationDate: number; // Unix timestamp
    interestFrequencyType: string;
    interestFrequencyStartDate: string;
    interestFrequencyWeeknumber: string;
    accruedInterest: number;
    interestRateCode: string;
    interestRate: number;
    referAllDebits: boolean;
    referAllCredits: boolean;
    transferLimits: {
      debitTransfer: number;
      creditTransfer: number;
    };
  };
}

export interface BankAccountData {
  accountType: string;
  accountNumber: string;
  ibanNumber: string;
  dateOpened: string;
  accountTitle: string;
  currencyCode: string;
  isValidated: boolean;
  realEstateAssestDTO: {
    id: number;
  };
}

export interface BankAccountFormData {
  accountNumber: string;
  ibanNumber: string;
  dateOpened: string;
  accountTitle: string;
  currencyCode: string;
}
