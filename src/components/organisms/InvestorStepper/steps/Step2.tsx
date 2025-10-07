'use client'

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import {
  useUnitStatuses,
  usePropertyIds,
} from '../../../../hooks/useApplicationSettings1'
import { useCapitalPartnerLabelsApi } from '@/hooks/useCapitalPartnerLabelsApi'
import { useAppStore } from '@/store'
import {
  useRealEstateAssets,
  transformRealEstateAssetsForDropdown,
} from '../../../../hooks/useRealEstateAssets1'
import { useGetEnhanced } from '@/hooks/useApiEnhanced'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import {
  CapitalPartnerUnitResponse,
  CapitalPartnerUnitPurchaseResponse,
} from '@/types/capitalPartner'
import { capitalPartnerUnitService } from '../../../../services/api/capitalPartnerUnitService'
import { capitalPartnerUnitBookingService } from '../../../../services/api/capitalPartnerUnitBookingService'
import { capitalPartnerUnitPurchaseService } from '../../../../services/api/capitalPartnerUnitPurchaseService'
import {
  mapStep2ToCapitalPartnerUnitPayload,
  validateStep2Data,
  type Step2FormData,
} from '../../../../utils/capitalPartnerUnitMapper'

import {
  Box,
  Button,
  Card,
  CardContent,
  FormHelperText,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  InputAdornment,
} from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { Controller, useFormContext } from 'react-hook-form'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

interface Step2Props {
  onSaveAndNext?: (data: any) => void
  capitalPartnerId?: number | null
  isEditMode?: boolean
  isViewMode?: boolean
}

export interface Step2Ref {
  handleSaveAndNext: () => Promise<void>
}

const Step2 = forwardRef<Step2Ref, Step2Props>(
  (
    { onSaveAndNext, capitalPartnerId, isEditMode, isViewMode = false },
    ref
  ) => {
    const {
      control,
      watch,
      setValue,
      formState: { errors },
    } = useFormContext()

    // Get labels from API
    const { getLabel } = useCapitalPartnerLabelsApi()
    const currentLanguage = useAppStore((state) => state.language)

    const [saveError, setSaveError] = useState<string | null>(null)
    const [selectedProject, setSelectedProject] = useState<any>(null)
    const [isFormInitialized, setIsFormInitialized] = useState<boolean>(false)

    useEffect(() => {
      setIsFormInitialized(false)
      setSelectedProject(null)
    }, [isEditMode, capitalPartnerId])
    const {
      data: unitStatuses,
      loading: loadingUnitStatuses,
      error: unitStatusesError,
    } = useUnitStatuses()
    const {
      data: propertyIds,
      loading: loadingPropertyIds,
      error: propertyIdsError,
    } = usePropertyIds()
    const {
      data: realEstateAssets,
      loading: loadingProjects,
      error: projectsError,
    } = useRealEstateAssets()

    const projectOptions =
      transformRealEstateAssetsForDropdown(realEstateAssets)

    const {
      data: existingUnitData,
      isLoading: isLoadingExistingUnit,
      error: errorLoadingUnit,
    } = useGetEnhanced<CapitalPartnerUnitResponse[]>(
      `${API_ENDPOINTS.CAPITAL_PARTNER_UNIT.GET_ALL}?capitalPartnerId.equals=${capitalPartnerId || 0}`,
      {},
      {
        enabled: Boolean(isEditMode && capitalPartnerId),
      }
    )

    const unitId =
      existingUnitData && existingUnitData.length > 0
        ? existingUnitData[0]?.id
        : null
    const isUnitDataReady =
      !isLoadingExistingUnit && !errorLoadingUnit && !!unitId

    const {
      data: existingUnitPurchaseData,
      isLoading: isLoadingExistingPurchase,
      error: errorPurchase,
    } = useGetEnhanced<CapitalPartnerUnitPurchaseResponse[]>(
      `${API_ENDPOINTS.CAPITAL_PARTNER_UNIT_PURCHASE.GET_ALL}?capitalPartnerUnitId.equals=${unitId || 0}`,
      {},
      {
        enabled: Boolean(isEditMode && isUnitDataReady && unitId),
      }
    )

    const {
      data: existingUnitBookingData,
      isLoading: isLoadingExistingBooking,
      error: errorBooking,
    } = useGetEnhanced<any[]>(
      `${API_ENDPOINTS.CAPITAL_PARTNER_UNIT_BOOKING.GET_ALL}?capitalPartnerUnitId.equals=${unitId || 0}`,
      {},
      {
        enabled: Boolean(isEditMode && isUnitDataReady && unitId),
      }
    )

    useEffect(() => {
      if (
        isEditMode &&
        existingUnitData &&
        existingUnitData.length > 0 &&
        !isLoadingExistingUnit &&
        !isLoadingExistingPurchase &&
        !isLoadingExistingBooking &&
        !isFormInitialized &&
        projectOptions.length > 0 &&
        propertyIds &&
        propertyIds.length > 0
      ) {
        const unitData = existingUnitData[0]
        if (!unitData) return

        const purchaseData =
          existingUnitPurchaseData && existingUnitPurchaseData.length > 0
            ? existingUnitPurchaseData[0]
            : null

        const projectOption = projectOptions.find(
          (project) => project.projectId === unitData.realEstateAssestDTO?.reaId
        )

        if (projectOption) {
          setSelectedProject(projectOption)
          setValue('projectNameDropdown', projectOption.settingValue)
          setValue('projectId', projectOption.projectId)
          setValue('developerIdInput', projectOption.developerId)
          setValue('developerNameInput', projectOption.developerName)
        }

        setValue('floor', unitData.floor || '')
        setValue('bedroomCount', unitData.noofBedroom || '')
        setValue('unitNoQaqood', unitData.unitRefId || '')
        setValue('unitStatus', unitData.unitStatusDTO?.settingValue || '')
        setValue('buildingName', unitData.towerName || '')
        setValue('plotSize', unitData.unitPlotSize || '')
        const propertyIdOption = propertyIds?.find(
          (property) => property.id === unitData.propertyIdDTO?.id
        )
        setValue('propertyId', propertyIdOption?.settingValue || '')
        setValue('unitIban', unitData.virtualAccNo || '')

        if (purchaseData) {
          setValue(
            'registrationFees',
            purchaseData.cpupUnitRegistrationFee?.toString() || ''
          )
          setValue('agentName', purchaseData.cpupAgentName || '')
          setValue('agentNationalId', purchaseData.cpupAgentId || '')
          setValue(
            'grossSalePrice',
            purchaseData.cpupGrossSaleprice?.toString() || ''
          )
          setValue('VatApplicable', purchaseData.cpupVatApplicable || false)
          setValue(
            'SalesPurchaseAgreement',
            purchaseData.cpupSalePurchaseAgreement || false
          )
          setValue(
            'ProjectPaymentPlan',
            purchaseData.cpupProjectPaymentPlan || false
          )
          setValue('salePrice', purchaseData.cpupSalePrice?.toString() || '')
          setValue('deedNo', purchaseData.cpupDeedNo || '')
          setValue('contractNo', purchaseData.cpupAgreementNo || '')
          setValue(
            'agreementDate',
            purchaseData.cpupAgreementDate
              ? dayjs(purchaseData.cpupAgreementDate)
              : null
          )
          setValue(
            'ModificationFeeNeeded',
            purchaseData.cpupModificationFeeNeeded || false
          )
          setValue(
            'ReservationBookingForm',
            purchaseData.cpupReservationBookingForm || false
          )
          setValue('OqoodPaid', purchaseData.cpupOqoodPaid || false)
          setValue('worldCheck', purchaseData.cpupWorldCheck || false)
          setValue(
            'paidInEscrow',
            purchaseData.cpupAmtPaidToDevInEscorw?.toString() || ''
          )
          setValue(
            'paidOutEscrow',
            purchaseData.cpupAmtPaidToDevOutEscorw?.toString() || ''
          )
          setValue(
            'totalPaid',
            purchaseData.cpupTotalAmountPaid?.toString() || ''
          )
          setValue('qaqoodAmount', purchaseData.cpupOqoodAmountPaid || '')
          setValue('unitAreaSize', purchaseData.cpupUnitAreaSize || '')
          setValue('forfeitAmount', purchaseData.cpupForfeitAmount || '')
          setValue('dldAmount', purchaseData.cpupDldAmount || '')
          setValue('refundAmount', purchaseData.cpupRefundAmount || '')
          setValue(
            'transferredAmount',
            purchaseData.cpupTransferredAmount || ''
          )
          setValue('unitRemarks', purchaseData.cpupRemarks || '')
        }

        setIsFormInitialized(true)
      }
    }, [
      existingUnitData,
      existingUnitPurchaseData,
      existingUnitBookingData,
      isLoadingExistingUnit,
      isLoadingExistingPurchase,
      isLoadingExistingBooking,
      isEditMode,
      setValue,
      projectOptions,
      propertyIds,
      isFormInitialized,
    ])
    const handleProjectSelection = (projectId: string) => {
      const selectedProjectData = projectOptions.find(
        (project) => project.settingValue === projectId
      )

      if (selectedProjectData) {
        setSelectedProject(selectedProjectData)
        setValue('projectId', selectedProjectData.projectId)
        setValue('developerIdInput', selectedProjectData.developerId)
        setValue('developerNameInput', selectedProjectData.developerName)
      }
    }
    const handleSaveAndNext = async () => {
      try {
        setSaveError(null)
        if (!capitalPartnerId) {
          setSaveError('Capital Partner ID is required from Step1')
          throw new Error('Capital Partner ID is required from Step1')
        }
        const formData: Step2FormData = {
          projectNameDropdown: watch('projectNameDropdown'),
          projectId: watch('projectId'),
          developerIdInput: watch('developerIdInput'),
          developerNameInput: watch('developerNameInput'),
          floor: watch('floor'),
          bedroomCount: watch('bedroomCount'),
          unitNoQaqood: watch('unitNoQaqood'),
          unitStatus: watch('unitStatus'),
          buildingName: watch('buildingName'),
          plotSize: watch('plotSize'),
          propertyId: watch('propertyId'),
          unitIban: watch('unitIban'),
          registrationFees: watch('registrationFees'),
          agentName: watch('agentName'),
          agentNationalId: watch('agentNationalId'),
          grossSalePrice: watch('grossSalePrice'),
          VatApplicable: watch('VatApplicable'),
          SalesPurchaseAgreement: watch('SalesPurchaseAgreement'),
          ProjectPaymentPlan: watch('ProjectPaymentPlan'),
          salePrice: watch('salePrice'),
          deedNo: watch('deedNo'),
          contractNo: watch('contractNo'),
          agreementDate: watch('agreementDate'),
          ModificationFeeNeeded: watch('ModificationFeeNeeded'),
          ReservationBookingForm: watch('ReservationBookingForm'),
          OqoodPaid: watch('OqoodPaid'),
          worldCheck: watch('worldCheck'),
          paidInEscrow: watch('paidInEscrow'),
          paidOutEscrow: watch('paidOutEscrow'),
          totalPaid: watch('totalPaid'),
          qaqoodAmount: watch('qaqoodAmount'),
          unitAreaSize: watch('unitAreaSize'),
          forfeitAmount: watch('forfeitAmount'),
          dldAmount: watch('dldAmount'),
          refundAmount: watch('refundAmount'),
          transferredAmount: watch('transferredAmount'),
          unitRemarks: watch('unitRemarks'),
        }
        const validationErrors = validateStep2Data(formData)
        if (validationErrors.length > 0) {
          setSaveError(validationErrors.join(', '))
          throw new Error(validationErrors.join(', '))
        }
        const { unitPayload, bookingPayload, purchasePayload } =
          mapStep2ToCapitalPartnerUnitPayload(
            formData,
            capitalPartnerId,
            unitStatuses,
            selectedProject,
            propertyIds
          )
        let unitResponse
        let existingUnitId = null

        if (isEditMode && existingUnitData && existingUnitData.length > 0) {
          existingUnitId = existingUnitData[0]?.id
          if (existingUnitId) {
            const updateUnitPayload = {
              ...unitPayload,
              id: existingUnitId,
            }
            unitResponse =
              await capitalPartnerUnitService.updateCapitalPartnerUnit(
                existingUnitId,
                updateUnitPayload
              )
          } else {
            unitResponse =
              await capitalPartnerUnitService.createCapitalPartnerUnit(
                unitPayload
              )
          }
        } else {
          unitResponse =
            await capitalPartnerUnitService.createCapitalPartnerUnit(
              unitPayload
            )
        }

        const finalUnitId = existingUnitId || unitResponse.id

        let bookingResponse = null
        let purchaseResponse = null
        if (Object.keys(bookingPayload).length > 0) {
          const bookingPayloadWithId = {
            ...bookingPayload,
            capitalPartnerUnitDTOS: [
              {
                id: finalUnitId,
              },
            ],
          }

          try {
            bookingResponse =
              await capitalPartnerUnitBookingService.createCapitalPartnerUnitBooking(
                bookingPayloadWithId
              )
          } catch (error) {}
        }
        if (Object.keys(purchasePayload).length > 0) {
          const purchasePayloadWithId = {
            ...purchasePayload,
            capitalPartnerUnitDTO: {
              id: finalUnitId,
              capitalPartnerDTOS: [
                {
                  id: capitalPartnerId,
                },
              ],
            },
          }

          try {
            if (
              isEditMode &&
              existingUnitPurchaseData &&
              existingUnitPurchaseData.length > 0
            ) {
              const existingPurchaseId = existingUnitPurchaseData[0]?.id
              if (existingPurchaseId) {
                const updatePurchasePayload = {
                  ...purchasePayloadWithId,
                  id: existingPurchaseId,
                }
                purchaseResponse =
                  await capitalPartnerUnitPurchaseService.updateCapitalPartnerUnitPurchase(
                    existingPurchaseId,
                    updatePurchasePayload
                  )
              } else {
                purchaseResponse =
                  await capitalPartnerUnitPurchaseService.createCapitalPartnerUnitPurchase(
                    purchasePayloadWithId
                  )
              }
            } else {
              purchaseResponse =
                await capitalPartnerUnitPurchaseService.createCapitalPartnerUnitPurchase(
                  purchasePayloadWithId
                )
            }
          } catch (error) {}
        }
        if (onSaveAndNext) {
          onSaveAndNext({ unitResponse, bookingResponse, purchaseResponse })
        }
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : 'Failed to save data'
        )
        throw error
      }
    }
    useImperativeHandle(
      ref,
      () => ({
        handleSaveAndNext,
      }),
      [handleSaveAndNext]
    )
    const commonFieldStyles = {
      '& .MuiOutlinedInput-root': {
        height: '46px',
        borderRadius: '8px',
        '& fieldset': {
          borderColor: '#CAD5E2',
          borderWidth: '1px',
        },
        '&:hover fieldset': {
          borderColor: '#CAD5E2',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#2563EB',
        },
      },
    }

    const selectStyles = {
      height: '46px',
      '& .MuiOutlinedInput-root': {
        height: '46px',
        borderRadius: '8px',
        '& fieldset': {
          borderColor: '#CAD5E2',
          borderWidth: '1px',
        },
        '&:hover fieldset': {
          borderColor: '#CAD5E2',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#2563EB',
        },
      },
      '& .MuiSelect-icon': {
        color: '#666',
      },
    }

    const datePickerStyles = {
      height: '46px',
      '& .MuiOutlinedInput-root': {
        height: '46px',
        borderRadius: '8px',
        '& fieldset': {
          borderColor: '#CAD5E2',
          borderWidth: '1px',
        },
        '&:hover fieldset': {
          borderColor: '#CAD5E2',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#2563EB',
        },
      },
    }

    const labelSx = {
      color: '#6A7282',
      fontFamily: 'Outfit',
      fontWeight: 400,
      fontStyle: 'normal',
      fontSize: '12px',
      letterSpacing: 0,
    }

    const valueSx = {
      color: '#1E2939',
      fontFamily: 'Outfit',
      fontWeight: 400,
      fontStyle: 'normal',
      fontSize: '14px',
      letterSpacing: 0,
      wordBreak: 'break-word',
    }

    const StyledCalendarIcon = (
      props: React.ComponentProps<typeof CalendarTodayOutlinedIcon>
    ) => (
      <CalendarTodayOutlinedIcon
        {...props}
        sx={{
          width: '18px',
          height: '20px',
          position: 'relative',
          top: '2px',
          left: '3px',
          transform: 'rotate(0deg)',
          opacity: 1,
        }}
      />
    )

    const renderTextField = (
      name: string,
      configId: string,
      fallbackLabel: string,
      defaultValue = '',
      gridMd = 6,
      disabled = false
    ) => {
      const label = getLabel(configId, currentLanguage, fallbackLabel)
      return (
        <Grid size={{ xs: 12, md: gridMd }}>
          <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            render={({ field }) => (
              <TextField
                {...field}
                label={label}
                fullWidth
                disabled={disabled || isViewMode}
                InputLabelProps={{ sx: labelSx }}
                InputProps={{ sx: valueSx }}
                sx={commonFieldStyles}
                value={field.value || ''}
                onChange={field.onChange}
              />
            )}
          />
        </Grid>
      )
    }

    const renderApiSelectField = (
      name: string,
      configId: string,
      fallbackLabel: string,
      options: { id: number; displayName: string; settingValue: string }[],
      gridMd: number = 6,
      required = false,
      loading = false
    ) => {
      const label = getLabel(configId, currentLanguage, fallbackLabel)
      return (
        <Grid size={{ xs: 12, md: gridMd }}>
          <Controller
            name={name}
            control={control}
            rules={required ? { required: `${label} is required` } : {}}
            defaultValue={''}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors[name]}>
                <InputLabel sx={labelSx}>
                  {loading ? `Loading ${label}...` : label}
                </InputLabel>
                <Select
                  {...field}
                  label={loading ? `Loading ${label}...` : label}
                  sx={{
                    ...selectStyles,
                    ...valueSx,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid #9ca3af',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: '2px solid #2563eb',
                    },
                  }}
                  IconComponent={KeyboardArrowDownIcon}
                  disabled={loading || isViewMode}
                  value={field.value || ''}
                  onChange={field.onChange}
                >
                  {options.map((option) => (
                    <MenuItem key={option.id} value={option.settingValue}>
                      {option.displayName}
                    </MenuItem>
                  ))}
                </Select>
                {errors[name] && (
                  <FormHelperText error>
                    {errors[name]?.message?.toString()}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
      )
    }

    const renderProjectSelectField = (
      name: string,
      configId: string,
      fallbackLabel: string,
      options: { id: number; displayName: string; settingValue: string }[],
      gridMd: number = 6,
      required = false,
      loading = false
    ) => {
      const label = getLabel(configId, currentLanguage, fallbackLabel)
      return (
        <Grid size={{ xs: 12, md: gridMd }}>
          <Controller
            name={name}
            control={control}
            rules={required ? { required: `${label} is required` } : {}}
            defaultValue={''}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors[name]}>
                <InputLabel sx={labelSx}>
                  {loading ? `Loading ${label}...` : label}
                </InputLabel>
                <Select
                  {...field}
                  label={loading ? `Loading ${label}...` : label}
                  sx={{
                    ...selectStyles,
                    ...valueSx,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid #9ca3af',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: '2px solid #2563eb',
                    },
                  }}
                  IconComponent={KeyboardArrowDownIcon}
                  disabled={loading || isViewMode}
                  value={field.value || ''}
                  onChange={(e) => {
                    field.onChange(e)
                    handleProjectSelection(e.target.value as string)
                  }}
                >
                  {options.map((option) => (
                    <MenuItem key={option.id} value={option.settingValue}>
                      {option.displayName}
                    </MenuItem>
                  ))}
                </Select>
                {errors[name] && (
                  <FormHelperText error>
                    {errors[name]?.message?.toString()}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
      )
    }

    const getFallbackOptions = (key: string) => {
      switch (key) {
        case 'unitStatus':
          return [
            { id: 1, displayName: 'Active', settingValue: 'ACTIVE' },
            { id: 2, displayName: 'Inactive', settingValue: 'INACTIVE' },
          ]
        case 'propertyId':
          return [
            { id: 1, displayName: 'Property 1', settingValue: '1' },
            { id: 2, displayName: 'Property 2', settingValue: '2' },
          ]
        default:
          return []
      }
    }
    const renderCheckboxField = (
      name: string,
      configId: string,
      fallbackLabel: string,
      gridSize: number = 6
    ) => {
      const label = getLabel(configId, currentLanguage, fallbackLabel)
      return (
        <Grid key={name} size={{ xs: 12, md: gridSize }}>
          <Controller
            name={name}
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={!!field.value}
                    disabled={isViewMode}
                    onChange={(e) => field.onChange(e.target.checked)}
                    sx={{
                      color: '#CAD5E2',
                      '&.Mui-checked': {
                        color: '#2563EB',
                      },
                    }}
                  />
                }
                label={label}
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontFamily: 'Outfit, sans-serif',
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '24px',
                    letterSpacing: '0.5px',
                    verticalAlign: 'middle',
                  },
                }}
              />
            )}
          />
        </Grid>
      )
    }

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card
          sx={{
            boxShadow: 'none',
            backgroundColor: '#FFFFFFBF',
            width: '84%',
            margin: '0 auto',
          }}
        >
          <CardContent>
            {(unitStatusesError || projectsError || propertyIdsError) && (
              <Box
                sx={{
                  mb: 2,
                  p: 1,
                  bgcolor: '#fef2f2',
                  borderRadius: 1,
                  border: '1px solid #ef4444',
                }}
              >
                <Typography variant="body2" color="error">
                  ⚠️ Failed to load dropdown options.
                  {unitStatusesError && ' Unit statuses failed to load.'}
                  {projectsError && ' Projects failed to load.'}
                  {propertyIdsError && ' Property IDs failed to load.'}
                </Typography>
              </Box>
            )}
            {(errorLoadingUnit || errorPurchase || errorBooking) && (
              <Box
                sx={{
                  mb: 2,
                  p: 1,
                  bgcolor: '#fef2f2',
                  borderRadius: 1,
                  border: '1px solid #ef4444',
                }}
              >
                <Typography variant="body2" color="error">
                  ⚠️ Failed to load existing data.
                  {errorLoadingUnit && ' Unit data failed to load.'}
                  {errorPurchase && ' Purchase data failed to load.'}
                  {errorBooking && ' Booking data failed to load.'}
                </Typography>
              </Box>
            )}
            {saveError && (
              <Box
                sx={{
                  mb: 2,
                  p: 1,
                  bgcolor: '#fef2f2',
                  borderRadius: 1,
                  border: '1px solid #ef4444',
                }}
              >
                <Typography variant="body2" color="error">
                  ⚠️ {saveError}
                </Typography>
              </Box>
            )}

            <Grid container rowSpacing={4} columnSpacing={2}>
              {renderProjectSelectField(
                'projectNameDropdown',
                'CDL_CP_PROJECT_NAME',
                'Project Name*',
                projectOptions,
                6,
                true,
                loadingProjects
              )}
              {renderTextField(
                'projectId',
                'CDL_CP_PROP_NUMBER',
                'Project ID*',
                '',
                6,
                !selectedProject
              )}
              {renderTextField(
                'developerIdInput',
                'CDL_CP_BP_ID',
                'Developer ID*',
                '',
                6,
                !selectedProject
              )}
              {renderTextField(
                'developerNameInput',
                'CDL_CP_BP_NAME',
                'Developer Name*',
                '',
                6,
                !selectedProject
              )}
              {renderTextField('floor', 'CDL_CP_FLOOR', 'Floor', '', 3)}
              {renderTextField(
                'bedroomCount',
                'CDL_CP_NOOF_BED',
                'No. of Bedroom',
                '',
                3
              )}
              {renderTextField(
                'unitNoQaqood',
                'CDL_CP_UNIT_NUMBER',
                'Unit no. Qaqood format*',
                '',
                3
              )}
              {renderApiSelectField(
                'unitStatus',
                'CDL_CP_UNIT_STATUS',
                'Unit Status*',
                unitStatuses?.length
                  ? unitStatuses
                  : getFallbackOptions('unitStatus'),
                3,
                true,
                loadingUnitStatuses
              )}
              {renderTextField(
                'buildingName',
                'CDL_CP_BUILDING_NAME',
                'Building Name',
                '',
                6
              )}
              {renderTextField(
                'plotSize',
                'CDL_CP_PLOT_SIZE',
                'Plot Size*',
                '',
                6
              )}
              {renderApiSelectField(
                'propertyId',
                'CDL_CP_PROP_NUMBER',
                'Property ID*',
                propertyIds?.length
                  ? propertyIds
                  : getFallbackOptions('propertyId'),
                6,
                true,
                loadingPropertyIds
              )}

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="unitIban"
                  control={control}
                  defaultValue={''}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_CP_UNIT_IBAN',
                        currentLanguage,
                        'Unit IBAN'
                      )}
                      value={field.value || ''}
                      onChange={field.onChange}
                      InputProps={{
                        endAdornment: !isViewMode ? (
                          <InputAdornment position="end">
                            <Button
                              variant="contained"
                              sx={{
                                color: '#2563EB',
                                borderRadius: '24px',
                                textTransform: 'none',
                                background: 'var(--UIColors-Blue-100, #DBEAFE)',

                                boxShadow: 'none',
                                '&:hover': {
                                  background: '#D0E3FF',
                                  boxShadow: 'none',
                                },
                                minWidth: '120px',
                                height: '36px',

                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 500,
                                fontStyle: 'normal',
                                fontSize: '14px',
                                lineHeight: '24px',
                                letterSpacing: '0.5px',
                                verticalAlign: 'middle',
                              }}
                              onClick={() => {}}
                            >
                              Fetch VA Number
                            </Button>
                          </InputAdornment>
                        ) : undefined,
                        sx: valueSx,
                      }}
                      InputLabelProps={{ sx: labelSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              {renderTextField(
                'registrationFees',
                'CDL_CP_REG_FEE',
                'Unit Registration Fees',
                '',
                3
              )}
              {renderTextField(
                'agentName',
                'CDL_CP_AGENT_NAME',
                'Agent Name',
                '',
                3
              )}
              {renderTextField(
                'agentNationalId',
                'CDL_CP_AGENT_ID',
                'Agent National ID',
                '',
                3
              )}
              {renderTextField(
                'grossSalePrice',
                'CDL_CP_GROSS_PRICE',
                'Gross Sale Price',
                '',
                3
              )}
              {renderTextField(
                'agentName',
                'CDL_CP_AGENT_NAME',
                'Agent Name',
                '',
                3
              )}
              {renderTextField(
                'agentNationalId',
                'CDL_CP_AGENT_ID',
                'Agent National ID',
                '',
                3
              )}
              {renderTextField(
                'grossSalePrice',
                'CDL_CP_GROSS_PRICE',
                'Gross Sale Price',
                '',
                3
              )}

              {[
                {
                  name: 'VatApplicable',
                  configId: 'CDL_CP_VAT_APPLICABLE',
                  fallbackLabel: 'VAT Applicable',
                },
                {
                  name: 'SalesPurchaseAgreement',
                  configId: 'CDL_CP_SALES_PURCHASE_AGREEMENT',
                  fallbackLabel: 'Sales Purchase Agreement',
                },
                {
                  name: 'ProjectPaymentPlan',
                  configId: 'CDL_CP_PROJECT_PAYMENT_PLAN',
                  fallbackLabel: 'Project Payment Plan',
                },
              ].map(({ name, configId, fallbackLabel }) => (
                <Grid size={{ xs: 12, md: 4 }} key={name}>
                  <FormControlLabel
                    control={
                      <Controller
                        name={name}
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            {...field}
                            checked={!!field.value}
                            disabled={isViewMode}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    }
                    label={getLabel(configId, currentLanguage, fallbackLabel)}
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontFamily: 'Outfit, sans-serif',
                        fontStyle: 'normal',
                        fontSize: '14px',
                        lineHeight: '24px',
                        letterSpacing: '0.5px',
                        verticalAlign: 'middle',
                      },
                    }}
                  />
                </Grid>
              ))}

              {renderTextField(
                'salePrice',
                'CDL_CP_NET_PRICE',
                'Sale Price',
                '',
                3
              )}
              {renderTextField(
                'deedNo',
                'CDL_CP_DEED_REF_NO',
                'Deed No',
                '',
                3
              )}
              {renderTextField(
                'contractNo',
                'CDL_CP_CONTRACT_NO',
                'Contract No',
                '',
                3
              )}
              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="agreementDate"
                  control={control}
                  defaultValue={null}
                  render={({ field }) => (
                    <DatePicker
                      label={getLabel(
                        'CDL_CP_AGREEMENT_DATE',
                        currentLanguage,
                        'Agreement Date'
                      )}
                      disabled={isViewMode}
                      value={field.value || null}
                      onChange={(newValue) => field.onChange(newValue)}
                      format="DD/MM/YYYY"
                      slots={{
                        openPickerIcon: StyledCalendarIcon,
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.agreementDate,
                          sx: datePickerStyles,
                          InputLabelProps: { sx: labelSx },
                          InputProps: {
                            sx: valueSx,
                            style: { height: '46px' },
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              {[
                'ModificationFeeNeeded',
                'ReservationBookingForm',
                'OqoodPaid',
              ].map((name) => (
                <Grid size={{ xs: 12, md: 4 }} key={name}>
                  <FormControlLabel
                    control={
                      <Controller
                        name={name}
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            {...field}
                            checked={!!field.value}
                            disabled={isViewMode}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    }
                    label={name.replace(/([A-Z])/g, ' $1')}
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontFamily: 'Outfit, sans-serif',
                        fontStyle: 'normal',
                        fontSize: '14px',
                        lineHeight: '24px',
                        letterSpacing: '0.5px',
                        verticalAlign: 'middle',
                      },
                    }}
                  />
                </Grid>
              ))}
              {renderCheckboxField(
                'worldCheck',
                'CDL_CP_WORLD_STATUS',
                'World Check',
                6
              )}
              {renderTextField(
                'paidInEscrow',
                'CDL_CP_WITH_ESCROW',
                'Amount Paid to Developer within Escrow',
                '',
                6
              )}
              {renderTextField(
                'paidOutEscrow',
                'CDL_CP_OUTSIDE_ESCROW',
                'Amount Paid to Developer out of Escrow',
                '',
                6
              )}
              {renderTextField(
                'totalPaid',
                'CDL_CP_PARTNER_PAYMENT',
                'Total Amount Paid',
                '',
                6
              )}
              {renderTextField(
                'qaqoodAmount',
                'CDL_CP_OQOOD_PAID',
                'Qaqood Amount Paid',
                '',
                3
              )}
              {renderTextField(
                'unitAreaSize',
                'CDL_CP_UNIT_AREA',
                'Unit Area Size',
                '',
                3
              )}
              {renderTextField(
                'forfeitAmount',
                'CDL_CP_FROFEIT_AMT',
                'Forfeit Amount',
                '',
                3
              )}
              {renderTextField(
                'dldAmount',
                'CDL_CP_DLD_FEE',
                'Dld Amount',
                '',
                3
              )}
              {renderTextField(
                'refundAmount',
                'CDL_CP_REFUND_AMOUNT',
                'Refund Amount',
                '',
                6
              )}
              {renderTextField(
                'transferredAmount',
                'CDL_CP_TRANS_AMT',
                'Transferred Amount',
                '',
                6
              )}
              {renderTextField(
                'unitRemarks',
                'CDL_CP_REMARKS',
                'Remarks',
                '',
                12
              )}
            </Grid>
          </CardContent>
        </Card>
      </LocalizationProvider>
    )
  }
)

Step2.displayName = 'Step2'

export default Step2
