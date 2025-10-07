export interface BankData {
  bankName: string
  bankIBAN: string
  swiftCode: string
  routingCode: string
  ttcCode: string
  branchCode: string
  [key: string]: unknown
}

export interface BankSearchState {
  bankName: string
  bankIBAN: string
  swiftCode: string
  routingCode: string
  ttcCode: string
  branchCode: string
} 