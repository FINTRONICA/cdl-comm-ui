// Developer dropdown label mapping from API response
// Maps configId to configValue for easy lookup and usage in components

export const DEVELOPER_DROPDOWN_LABELS = {
  // Regulatory Authorities
  'CDL_REGULATOR_AJMAN': 'Ajman',
  'CDL_REGULATOR_DUBAI': 'Dubai',
  'CDL_REGULATOR_ABU_DHABI': 'Abu Dhabi',
  'CDL_REGULATOR_SHARJAH': 'Sharjah',
  'CDL_REGULATOR_RAK': 'Ras Al Khaimah',
  'CDL_REGULATOR_FUJAIRAH': 'Fujairah',
  'CDL_REGULATOR_UMM_AL_QUWAIN': 'Umm Al Quwain',
}

export const getDeveloperDropdownLabel = (configId: string): string => {
  return DEVELOPER_DROPDOWN_LABELS[configId as keyof typeof DEVELOPER_DROPDOWN_LABELS] || configId
}

// Utility function to get all labels for regulatory authorities
export const getRegulatoryAuthorityLabels = () => {
  const authorities = [
    'CDL_REGULATOR_AJMAN', 'CDL_REGULATOR_DUBAI', 'CDL_REGULATOR_ABU_DHABI',
    'CDL_REGULATOR_SHARJAH', 'CDL_REGULATOR_RAK', 'CDL_REGULATOR_FUJAIRAH',
    'CDL_REGULATOR_UMM_AL_QUWAIN'
  ]

  return authorities.map(configId => ({
    configId,
    label: DEVELOPER_DROPDOWN_LABELS[configId as keyof typeof DEVELOPER_DROPDOWN_LABELS]
  }))
}

// Export the full mapping object for direct access
export default DEVELOPER_DROPDOWN_LABELS
