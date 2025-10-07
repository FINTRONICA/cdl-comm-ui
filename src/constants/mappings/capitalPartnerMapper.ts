import type { CapitalPartnerResponse } from '@/services/api/capitalPartnerService'
import { CapitalPartnerUIData } from '@/services/api/capitalPartnerService'

export const mapCapitalPartnerToInvestorData = (
  cp: CapitalPartnerResponse
): CapitalPartnerUIData => {
  try {
    const mapApiStatus = (taskStatusDTO: any | null): string => {
      if (!taskStatusDTO) {
        return 'INITIATED'
      }

      return taskStatusDTO.code || 'INITIATED'
    }

    // Extract build partner data from nested structure
    const buildPartnerData =
      cp.capitalPartnerUnitDTO?.realEstateAssestDTO?.buildPartnerDTO

    return {
      id: cp.id,
      investor: cp.capitalPartnerName ?? '-',
      investorId: cp.capitalPartnerId ?? '-',
      developerName: cp.capitalPartnerLocaleName ?? '-',
      developerIdRera: cp.capitalPartnerIdNo ?? '-',
      developerCif: cp.capitalPartnerOwnershipPercentage?.toString() ?? '-',
      projectName:
        cp.capitalPartnerUnitDTO?.realEstateAssestDTO?.reaName ?? '-',
      projectCIF: cp.capitalPartnerUnitDTO?.realEstateAssestDTO?.reaCif ?? '-',
      unitNumber: cp.capitalPartnerUnitDTO?.unitRefId ?? '-',
      approvalStatus: mapApiStatus(cp.taskStatusDTO),
      buildPartnerName: buildPartnerData?.bpName ?? '-',
      buildPartnerCif: buildPartnerData?.bpCifrera ?? '-',
      buildPartnerId: buildPartnerData?.bpDeveloperId ?? '-',
    }
  } catch (error) {
    console.error('Error mapping capital partner data:', error, cp)
    // Return a safe fallback object
    return {
      id: cp.id || 0,
      investor: '-',
      investorId: '-',
      developerName: '-',
      developerIdRera: '-',
      developerCif: '-',
      projectName: '-',
      projectCIF: '-',
      unitNumber: '-',
      approvalStatus: 'INITIATED',
      buildPartnerName: '-',
      buildPartnerCif: '-',
      buildPartnerId: '-',
    }
  }
}
