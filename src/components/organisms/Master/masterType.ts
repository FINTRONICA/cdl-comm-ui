import { Dayjs } from "dayjs";

export interface AccountPurposeData {
    id: number
    sortName: string | null,
    fullName: string | null,
    criticality: string | null,
    active: boolean | null,
    enabled: boolean | null,
    deleted: boolean | null,
    createdAt: Dayjs | null,
    updatedAt: Dayjs | null,
    createdBy: string | null,
    updatedBy: string | null,
}

export interface InvestmentData {
    id: number
    name: string | null,
    description: string | null,
    active: boolean | null,
    enabled: boolean | null,
    deleted: boolean | null,
    createdAt: Dayjs | null,
    updatedAt: Dayjs | null,
    createdBy: string | null,
    updatedBy: string | null,
}   

export interface BusinessSegmentData {
    id: number
    name: string | null,
    description: string | null,
    active: boolean | null,
    enabled: boolean | null,
    deleted: boolean | null,    
    createdAt: Dayjs | null,
    updatedAt: Dayjs | null,
    createdBy: string | null,
    updatedBy: string | null,
}   

export interface BusinessSubSegmentData {
    id: number
    name: string | null,
    description: string | null,
    active: boolean | null,
    enabled: boolean | null,
    deleted: boolean | null,
    createdAt: Dayjs | null,
    updatedAt: Dayjs | null,
    createdBy: string | null,
    updatedBy: string | null,
}   

export interface AgreementTypeData {
    id: number
    name: string | null,
    description: string | null,
    active: boolean | null,
    enabled: boolean | null,
    deleted: boolean | null,
    createdAt: Dayjs | null,
    updatedAt: Dayjs | null,
    createdBy: string | null,
    updatedBy: string | null,
}   

export interface AgreementSubTypeData {
    id: number
    name: string | null,
    description: string | null,
    active: boolean | null,
    enabled: boolean | null,
    deleted: boolean | null,
    createdAt: Dayjs | null,
    updatedAt: Dayjs | null,
    createdBy: string | null,
    updatedBy: string | null,
}

export interface ProductProgramData {
    id: number
    name: string | null,
    description: string | null,
    active: boolean | null,
    enabled: boolean | null,
    deleted: boolean | null,
    createdAt: Dayjs | null,
    updatedAt: Dayjs | null,
    createdBy: string | null,
    updatedBy: string | null,
}   

export interface AgreementSegmentData {
    id: number
    name: string | null,
    description: string | null,
    active: boolean | null,
    enabled: boolean | null,
    deleted: boolean | null,
    createdAt: Dayjs | null,
    updatedAt: Dayjs | null,
    createdBy: string | null,
    updatedBy: string | null,
}       

export interface GeneralLedgerAccountData {
    id: number
    accountNumber: string | null,
    branchCode: string | null,
    description: string | null,
    active: boolean | null,
    enabled: boolean | null,
    deleted: boolean | null,
    createdAt: Dayjs | null,
    updatedAt: Dayjs | null,
    createdBy: string | null,
    updatedBy: string | null,
}  

export interface CountryData {
    id: number
    name: string | null,
    description: string | null,
    active: boolean | null,
    enabled: boolean | null,
    deleted: boolean | null,
    createdAt: Dayjs | null,
    updatedAt: Dayjs | null,
    createdBy: string | null,
    updatedBy: string | null,
}   

export interface CurrencyData {
    id: number
    name: string | null,
    description: string | null,
    active: boolean | null,
    enabled: boolean | null,
    deleted: boolean | null,
    createdAt: Dayjs | null,
    updatedAt: Dayjs | null,
    createdBy: string | null,
    updatedBy: string | null,
}       

