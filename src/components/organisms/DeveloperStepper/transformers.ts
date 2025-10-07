import { useMemo } from 'react'
import { convertDatePickerToZonedDateTime } from '@/utils'
import { ProjectData } from './developerTypes'
import { safeParseInt } from './utils'


export const useStepDataTransformers = () => {
  return useMemo(() => ({
    1: (formData: ProjectData) => ({
      bpDeveloperId: formData.bpDeveloperId,
      bpCifrera: formData.bpCifrera,
      bpDeveloperRegNo: formData.bpDeveloperRegNo,
      bpName: formData.bpName,
      bpMasterName: formData.bpMasterName,
      bpNameLocal: formData.bpNameLocal,
      bpOnboardingDate: formData.bpOnboardingDate
        ? typeof formData.bpOnboardingDate === 'string'
          ? formData.bpOnboardingDate
          : convertDatePickerToZonedDateTime(formData.bpOnboardingDate.format('YYYY-MM-DD'))
        : null,
      bpContactAddress: formData.bpContactAddress,
      bpContactTel: formData.bpContactTel,
      bpPoBox: formData.bpPoBox,
      bpMobile: formData.bpMobile,
      bpFax: formData.bpFax,
      bpEmail: formData.bpEmail,
      bpLicenseNo: formData.bpLicenseNo,
      bpLicenseExpDate: formData.bpLicenseExpDate
        ? typeof formData.bpLicenseExpDate === 'string'
          ? formData.bpLicenseExpDate
          : convertDatePickerToZonedDateTime(formData.bpLicenseExpDate.format('YYYY-MM-DD'))
        : null,
      bpWorldCheckFlag: formData.bpWorldCheckFlag,
      bpWorldCheckRemarks: formData.bpWorldCheckRemarks,
      bpMigratedData: formData.bpMigratedData,
      bpremark: formData.bpremark,
      bpRegulatorDTO: {
        id: safeParseInt(formData.bpRegulatorDTO?.id),
      },
    }),
    2: (formData: ProjectData) => {
      const contact = formData.contactData?.[0]
      if (!contact) {
        throw new Error('Contact data is required for step 2')
      }
      
      return {
        bpcFirstName: contact.name?.split(' ')[0] || '',
        bpcLastName: contact.name?.split(' ').slice(1).join(' ') || '',
        bpcContactEmail: contact.email || '',
        bpcContactAddressLine1: contact.address || '',
        bpcContactAddressLine2: '', 
        bpcContactPoBox: contact.pobox || '',
        bpcCountryMobCode: contact.countrycode || '',
        bpcContactTelNo: contact.telephoneno || '',
        bpcContactMobNo: contact.mobileno || '',
        bpcContactFaxNo: contact.fax || '',
        buildPartnerDTO: {
          id: formData.bpDeveloperId ? parseInt(formData.bpDeveloperId) : undefined
        }
      }
    },
    3: (formData: ProjectData) => ({
      feeStructure: {
        setupFee: parseFloat(formData.fees?.[0]?.amount || '0'),
        transactionFee: parseFloat(formData.fees?.[0]?.feePercentage || '0'),
        monthlyFee: parseFloat(formData.fees?.[0]?.debitAmount || '0'),
      },
      collectionMethod: formData.paymentType || 'manual',
      paymentTerms: formData.fees?.[0]?.frequency || '',
    }),
    4: (formData: ProjectData) => ({
      bpbBeneficiaryId: formData.beneficiaries?.[0]?.id || '',
      bpbBeneficiaryType: formData.beneficiaries?.[0]?.transferType || 'RTGS',
      bpbName: formData.beneficiaries?.[0]?.name || '',
      bpbBankName: formData.beneficiaries?.[0]?.bankName || '',
      bpbSwiftCode: formData.beneficiaries?.[0]?.swiftCode || '',
      bpbRoutingCode: formData.beneficiaries?.[0]?.routingCode || '',
      bpbAccountNumber: formData.beneficiaries?.[0]?.account || '',
      enabled: true,
    }),
    5: (formData: ProjectData) => ({
      reviewData: formData,
      termsAccepted: true,
    }),
  }), [])
}


export const transformStepData = (
  step: number, 
  formData: ProjectData, 
  transformers: ReturnType<typeof useStepDataTransformers>
) => {
  const transformer = transformers[step as keyof typeof transformers]
  if (!transformer) {
    throw new Error(`Invalid step: ${step}`)
  }
  return transformer(formData)
}
