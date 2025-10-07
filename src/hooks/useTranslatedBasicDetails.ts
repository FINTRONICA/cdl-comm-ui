import { useState, useEffect } from 'react'
import { applicationSettingService } from '@/services/api/applicationSettingService1'

export interface TranslatedBasicDetails {
  investorType: string
  investorIdType: string
  nationality: string
  unitStatus: string
  payMode: string
  loading: boolean
  error: string | null
}

export function useTranslatedBasicDetails(
  capitalPartnerData: any,
  unitDetailsData?: any[],
  bankDetailsData?: any[]
): TranslatedBasicDetails {
  const [investorType, setInvestorType] = useState<string>('-')
  const [investorIdType, setInvestorIdType] = useState<string>('-')
  const [nationality, setNationality] = useState<string>('-')
  const [unitStatus, setUnitStatus] = useState<string>('-')
  const [payMode, setPayMode] = useState<string>('-')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTranslatedValues = async () => {
      if (!capitalPartnerData) {
        setInvestorType('-')
        setInvestorIdType('-')
        setNationality('-')
        setUnitStatus('-')
        setPayMode('-')
        return
      }

      setLoading(true)
      setError(null)

      try {
        const promises = []
        if (
          capitalPartnerData.investorTypeDTO?.id &&
          capitalPartnerData.investorTypeDTO?.settingKey
        ) {
          promises.push(
            applicationSettingService
              .getApplicationSettingByIdAndKey(
                capitalPartnerData.investorTypeDTO.id,
                capitalPartnerData.investorTypeDTO.settingKey
              )
              .then((setting) => {
                const translatedValue =
                  setting.languageTranslationId?.configValue ||
                  setting.settingValue
                setInvestorType(translatedValue)
              })
              .catch(() => {
                setInvestorType(
                  capitalPartnerData.investorTypeDTO?.settingValue || '-'
                )
              })
          )
        } else {
          setInvestorType(
            capitalPartnerData.investorTypeDTO?.settingValue || '-'
          )
        }
        if (
          capitalPartnerData.documentTypeDTO?.id &&
          capitalPartnerData.documentTypeDTO?.settingKey
        ) {
          promises.push(
            applicationSettingService
              .getApplicationSettingByIdAndKey(
                capitalPartnerData.documentTypeDTO.id,
                capitalPartnerData.documentTypeDTO.settingKey
              )
              .then((setting) => {
                const translatedValue =
                  setting.languageTranslationId?.configValue ||
                  setting.settingValue
                setInvestorIdType(translatedValue)
              })
              .catch(() => {
                setInvestorIdType(
                  capitalPartnerData.documentTypeDTO?.settingValue || '-'
                )
              })
          )
        } else {
          setInvestorIdType(
            capitalPartnerData.documentTypeDTO?.settingValue || '-'
          )
        }
        if (
          capitalPartnerData.countryOptionDTO?.id &&
          capitalPartnerData.countryOptionDTO?.settingKey
        ) {
          promises.push(
            applicationSettingService
              .getApplicationSettingByIdAndKey(
                capitalPartnerData.countryOptionDTO.id,
                capitalPartnerData.countryOptionDTO.settingKey
              )
              .then((setting) => {
                const translatedValue =
                  setting.languageTranslationId?.configValue ||
                  setting.settingValue
                setNationality(translatedValue)
              })
              .catch(() => {
                setNationality(
                  capitalPartnerData.countryOptionDTO?.settingValue || '-'
                )
              })
          )
        } else {
          setNationality(
            capitalPartnerData.countryOptionDTO?.settingValue || '-'
          )
        }
        if (unitDetailsData && unitDetailsData.length > 0) {
          const unitData = unitDetailsData[0]
          if (
            unitData.unitStatusDTO?.id &&
            unitData.unitStatusDTO?.settingKey
          ) {
            promises.push(
              applicationSettingService
                .getApplicationSettingByIdAndKey(
                  unitData.unitStatusDTO.id,
                  unitData.unitStatusDTO.settingKey
                )
                .then((setting) => {
                  const translatedValue =
                    setting.languageTranslationId?.configValue ||
                    setting.settingValue
                  setUnitStatus(translatedValue)
                })
                .catch(() => {
                  setUnitStatus(unitData.unitStatusDTO?.settingValue || '-')
                })
            )
          } else {
            setUnitStatus(unitData.unitStatusDTO?.settingValue || '-')
          }
        } else {
          setUnitStatus('-')
        }
        if (bankDetailsData && bankDetailsData.length > 0) {
          const bankData = bankDetailsData[0]
          if (bankData.payModeDTO?.id && bankData.payModeDTO?.settingKey) {
            promises.push(
              applicationSettingService
                .getApplicationSettingByIdAndKey(
                  bankData.payModeDTO.id,
                  bankData.payModeDTO.settingKey
                )
                .then((setting) => {
                  const translatedValue =
                    setting.languageTranslationId?.configValue ||
                    setting.settingValue
                  setPayMode(translatedValue)
                })
                .catch(() => {
                  setPayMode(bankData.payModeDTO?.settingValue || '-')
                })
            )
          } else {
            setPayMode(bankData.payModeDTO?.settingValue || '-')
          }
        } else {
          setPayMode('-')
        }

        await Promise.all(promises)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch translations'
        )
        setInvestorType(capitalPartnerData.investorTypeDTO?.settingValue || '-')
        setInvestorIdType(
          capitalPartnerData.documentTypeDTO?.settingValue || '-'
        )
        setNationality(capitalPartnerData.countryOptionDTO?.settingValue || '-')
        setUnitStatus(unitDetailsData?.[0]?.unitStatusDTO?.settingValue || '-')
        setPayMode(bankDetailsData?.[0]?.payModeDTO?.settingValue || '-')
      } finally {
        setLoading(false)
      }
    }

    fetchTranslatedValues()
  }, [capitalPartnerData, unitDetailsData, bankDetailsData])

  return {
    investorType,
    investorIdType,
    nationality,
    unitStatus,
    payMode,
    loading,
    error,
  }
}
