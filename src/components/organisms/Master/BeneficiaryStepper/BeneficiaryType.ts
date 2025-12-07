
export interface BeneficiaryData {
   
   
    id: number,
    beneficiaryFullName: string | null,
    beneficiaryAddressLine1: string | null,
    telephoneNumber: string | null,
    mobileNumber: string | null,
    beneficiaryAccountNumber: string | null,
    bankIfscCode: string | null,
    beneficiaryBankName: string | null,
    bankRoutingCode: string | null,
    additionalRemarks: string | null,
    active: boolean | null,
    accountTypeDTO: {
      id: number,
      settingKey: string | null,
        settingValue: string | null,
      languageTranslationId: {
      id: number,
      configId: string | null,
      configValue: string | null,
      content: string | null,
      applicationModuleDTO: {
        id: number,
        moduleName: string | null,
        moduleCode: string | null,
        moduleDescription: string | null,
        deleted: boolean | null,
        enabled: boolean | null,
        active: boolean | null
      },
      status: string | null,
      enabled: boolean | null,
      deleted: boolean | null
    },
    transferTypeDTO: {
      id: number,
                settingKey: string | null,
      settingValue: string | null,
      languageTranslationId: {
        id: number,
        configId: string | null,
        configValue: string | null,
        content: string | null,
        appLanguageCode: {
          id: number,
          languageCode: string | null,
          nameKey: string | null,
          nameNativeValue: string | null,
          deleted: boolean | null,
          enabled: boolean | null,
          rtl: boolean | null
        },
        applicationModuleDTO: {
            id: number,
          moduleName: string | null,
          moduleCode: string | null,
          moduleDescription: string | null,
          deleted: boolean | null,
          enabled: boolean | null,
          active: boolean | null
        },
        status: string | null,
        enabled: boolean | null,
        deleted: boolean | null
      },
      remarks: string | null,
      status: string | null,
      enabled: boolean | null,
      deleted: boolean | null
    },
    roleDTO: {
      id: number,
      settingKey: string | null,
      settingValue: string | null,
      languageTranslationId: {
        id: number,
        configId: string | null,
        configValue: string | null,
        content: string | null,
        "appLanguageCode": {
          id: number,
          languageCode: string | null,
          nameKey: string | null,
          nameNativeValue: string | null,
          deleted: boolean | null,
          enabled: boolean | null,
          rtl: boolean | null
        },
            applicationModuleDTO: {
          id: number,
          moduleName: string | null,
          moduleCode: string | null,
          moduleDescription: string | null,
          deleted: boolean | null,
          enabled: boolean | null,
          active: boolean | null
        },
        status: string | null,
        enabled: boolean | null,
        deleted: boolean | null
      },
      remarks: string | null,
      status: string | null,
      enabled: boolean | null,
      deleted: boolean | null
    },
    taskStatusDTO: {
      id: number,
      code: string | null,
      name: string | null,
      description: string | null,
      createdAt: string | null,
      updatedAt: string | null,
      deleted: boolean | null,
      enabled: boolean | null
    },
    enabled: boolean | null,
        deleted: boolean | null,
    uuid: string | null
    status: string | null,
    actions: string | null,
    document: string | null,
    createdAt: Dayjs | null,
    updatedAt: Dayjs | null,
    createdBy: string | null,
    updatedBy: string | null,
  }
}  
