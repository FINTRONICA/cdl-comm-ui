import { apiClient } from "@/lib/apiClient";
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from "@/constants/apiEndpoints";
import type { PaginatedResponse } from "@/types";
import type {
  ApiDocumentResponse,
  PaginatedDocumentResponse,
} from "@/components/organisms/Master/PartyStepper/partyTypes";

export interface TaskStatusDTO {
  id: number;
  code: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  enabled: boolean;
}
export interface SettingDTO {
  id: number;
  settingKey: string;
  settingValue: string;
  languageTranslationId?: {
    id: number;
    configId: string;
    configValue: string;
    content: string | null;
    appLanguageCode: {
      id: number;
      languageCode: string;
      nameKey: string;
      nameNativeValue: string;
      deleted: boolean;
      enabled: boolean;
      rtl: boolean;
    };
    applicationModuleDTO: {
      id: number;
      moduleName: string;
      moduleCode: string;
      moduleDescription: string;
      deleted: boolean;
      enabled: boolean;
      active: boolean;
    };
    status: string;
    enabled: boolean;
    deleted: boolean;
  };
  remarks?: string;
  status: string;
  enabled: boolean;
  deleted: boolean;
}
export interface AgreementParameter {
  id: number;
  agreementEffectiveDate: string;
  agreementExpiryDate: string;
  agreementRemarks?: string | null;
  active: boolean;
  permittedInvestmentAllowedDTO?: SettingDTO | null;
  amendmentAllowedDTO?: SettingDTO | null;
  dealClosureBasisDTO?: SettingDTO | null;
  escrowAgreementDTO?: string | null;
  enabled: boolean;
  deleted: boolean;
  uuid: string;
}
export interface CreateAgreementParameterRequest {
  agreementEffectiveDate: string;
  agreementExpiryDate: string;
  agreementRemarks?: string | null;
  active?: boolean;
  permittedInvestmentAllowedDTO?: { id: number } | number | null;
  amendmentAllowedDTO?: { id: number } | number | null;
  dealClosureBasisDTO?: { id: number } | number | null;
  escrowAgreementDTO?: string | null;
  enabled?: boolean;
  deleted?: boolean;
  uuid?: string;
}
export interface UpdateAgreementParameterRequest {
  agreementEffectiveDate?: string;
  agreementExpiryDate?: string;
  agreementRemarks?: string | null;
  active?: boolean;
  permittedInvestmentAllowedDTO?: { id: number } | number | null;
  amendmentAllowedDTO?: { id: number } | number | null;
  dealClosureBasisDTO?: { id: number } | number | null;
  escrowAgreementDTO?: string | null;
  enabled?: boolean;
  deleted?: boolean;
  uuid?: string;
}
export interface AgreementParameterFilters {
  status?:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "IN_PROGRESS"
    | "DRAFT"
    | "INITIATED";
  name?: string;
  agreementId?: string;
}
export interface AgreementParameterLabel {
  id: string;
  key: string;
  value: string;
  language: string;
  category: string;
}
export interface StepSaveResponse {
  success: boolean;
  message: string;
  stepId?: string;
  nextStep?: number;
  data?: unknown;
}
export interface StepValidationResponse {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}
export interface AgreementParameterDetailsData {
  agreementEffectiveDate: string;
  agreementExpiryDate: string;
  agreementRemarks?: string | undefined;
  active?: boolean | undefined;
  permittedInvestmentAllowedDTO?: { id: number } | number | null | undefined;
  amendmentAllowedDTO?: { id: number } | number | null | undefined;
  dealClosureBasisDTO?: { id: number } | number | null | undefined;
  escrowAgreementDTO?: string | null | undefined;
  enabled?: boolean | undefined;
  deleted?: boolean | undefined;
}
export interface AgreementParameterReviewData {
  reviewData: unknown;
  termsAccepted: boolean;
}
export interface AgreementParameterUIData {
  id: string;
  agreementEffectiveDate: string;
  agreementExpiryDate: string;
  agreementRemarks: string;
  active: boolean;
  localeNames: string;
  status: string;
  registrationDate?: string | undefined;
  lastUpdated?: string | undefined;
  contactPerson?: string | undefined;
  documents?:
    | Array<{
        name: string;
        type: string;
        url: string;
      }>
    | undefined;
}

export const mapAgreementParameterToUIData = (
  apiData: AgreementParameter
): AgreementParameterUIData => {
  const mapApiStatus = (): string => {
    // Default status for agreement parameters
    return "INITIATED";
  };

  return {
    id: apiData.id.toString(),
    agreementEffectiveDate: apiData.agreementEffectiveDate || "N/A",
    agreementExpiryDate: apiData.agreementExpiryDate || "N/A",
    agreementRemarks: apiData.agreementRemarks || "N/A",
    active: apiData.active || false,
    localeNames: apiData.agreementRemarks || "---",
    status: mapApiStatus(),
  };
};

export class AgreementParameterService {
  async getAgreementParameters(
    page = 0,
    size = 20,
    filters?: AgreementParameterFilters
  ): Promise<PaginatedResponse<AgreementParameter>> {
    // Map UI filter names to API field names
    const apiFilters: Record<string, string> = {};
    if (filters) {
      if (filters.status) {
        const statusMapping: Record<string, string> = {
          Approved: "CLEAR",
          "In Review": "PENDING",
          Rejected: "REJECTED",
          Incomplete: "INCOMPLETE",
        };
        apiFilters.status = statusMapping[filters.status] || filters.status;
      }
      if (filters.name) {
        apiFilters.agreementRemarks = filters.name;
      }
      if (filters.agreementId) {
        apiFilters.escrowAgreementDTO = filters.agreementId;
      }
    }

    const params = {
      ...buildPaginationParams(page, size),
      ...apiFilters,
    };
    const queryString = new URLSearchParams(params).toString();
    const url = `${buildApiUrl(API_ENDPOINTS.AGREEMENT_PARAMETER.GET_ALL)}&${queryString}`;

    try {
      const result =
        await apiClient.get<PaginatedResponse<AgreementParameter>>(url);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAgreementParameter(id: string): Promise<AgreementParameter> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.AGREEMENT_PARAMETER.GET_BY_ID(id));
      const result = await apiClient.get<AgreementParameter>(url);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createAgreementParameter(
    data: CreateAgreementParameterRequest
  ): Promise<AgreementParameter> {
    try {
      // Ensure enabled=true and deleted=false for new agreement parameters
      const requestData: CreateAgreementParameterRequest = {
        ...data,
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
      };

      const result = await apiClient.post<AgreementParameter>(
        buildApiUrl(API_ENDPOINTS.AGREEMENT_PARAMETER.SAVE),
        requestData
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateAgreementParameter(
    id: string,
    updates: UpdateAgreementParameterRequest
  ): Promise<AgreementParameter> {
    try {
      const result = await apiClient.put<AgreementParameter>(
        buildApiUrl(API_ENDPOINTS.AGREEMENT_PARAMETER.UPDATE(id)),
        updates
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteAgreementParameter(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.AGREEMENT_PARAMETER.SOFT_DELETE(id))
      );
    } catch (error) {
      throw error;
    }
  }

  async getAgreementParameterLabels(): Promise<AgreementParameterLabel[]> {
    return apiClient.get<AgreementParameterLabel[]>(
      buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.AGREEMENT_PARAMETER)
    );
  }

  async saveAgreementParameterDetails(
    data: AgreementParameterDetailsData,
    isEditing = false,
    agreementParameterId?: string
  ): Promise<AgreementParameter | StepSaveResponse> {
    if (isEditing && agreementParameterId) {
      // Use PUT for editing existing details
      const url = buildApiUrl(
        API_ENDPOINTS.AGREEMENT_PARAMETER.UPDATE(agreementParameterId)
      );
      const requestData = {
        ...data,
        id: parseInt(agreementParameterId),
        // Ensure enabled and deleted are set for updates
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
      };

      // API returns AgreementParameter object directly
      const response = await apiClient.put<AgreementParameter>(
        url,
        requestData
      );
      return response;
    } else {
      // Use POST for creating new details
      const url = buildApiUrl(API_ENDPOINTS.AGREEMENT_PARAMETER.SAVE);

      // Ensure enabled=true and deleted=false for new agreement parameters
      const requestData = {
        ...data,
        enabled: true,
        deleted: false,
      };

      // API returns AgreementParameter object directly
      const response = await apiClient.post<AgreementParameter>(
        url,
        requestData
      );
      return response;
    }
  }

  async saveAgreementParameterReview(
    data: AgreementParameterReviewData
  ): Promise<StepSaveResponse> {
    const url = buildApiUrl(API_ENDPOINTS.PARTY_CREATE.REVIEW_SAVE);
    return apiClient.post<StepSaveResponse>(url, data);
  }

  async getAgreementParameterDocuments(
    entityId: string,
    module: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedDocumentResponse> {
    try {
      // Build URL with query parameters to filter by module and recordId, plus pagination
      const params = new URLSearchParams({
        "module.equals": module,
        "recordId.equals": entityId,
        page: page.toString(),
        size: size.toString(),
      });
      const url = `${buildApiUrl(API_ENDPOINTS.REAL_ESTATE_DOCUMENT.GET_ALL)}?${params.toString()}`;

      const result = await apiClient.get<PaginatedDocumentResponse>(url);

      // Return the full paginated response
      return (
        result || {
          content: [],
          page: {
            size: size,
            number: page,
            totalElements: 0,
            totalPages: 0,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async uploadAgreementParameterDocument(
    file: File,
    entityId: string,
    module: string,
    documentType?: string
  ): Promise<ApiDocumentResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Build URL with query parameters following the API specification
      const params = new URLSearchParams({
        module: module,
        recordId: entityId,
        storageType: "LOCAL",
      });

      // Add document type if provided
      if (documentType) {
        params.append("documentType", documentType);
      }

      const url = `${buildApiUrl(API_ENDPOINTS.REAL_ESTATE_DOCUMENT.UPLOAD)}?${params.toString()}`;

      // Override Content-Type header to let browser set it automatically for FormData
      const config = {
        headers: {
          "Content-Type": "multipart/form-data" as const,
        },
      };

      const result = await apiClient.post<ApiDocumentResponse>(
        url,
        formData,
        config
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getStepData(
    step: number,
    agreementParameterId?: string
  ): Promise<unknown> {
    let url = buildApiUrl(API_ENDPOINTS.PARTY_CREATE.GET_STEP_DATA(step));
    if (agreementParameterId) {
      url += `?agreementParameterId=${encodeURIComponent(agreementParameterId)}`;
    }
    return apiClient.get(url);
  }

  async validateStep(
    step: number,
    data: unknown
  ): Promise<StepValidationResponse> {
    const url = buildApiUrl(API_ENDPOINTS.PARTY_CREATE.VALIDATE_STEP(step));
    return apiClient.post<StepValidationResponse>(url, data);
  }

  transformToUIData(
    apiResponse: PaginatedResponse<AgreementParameter>
  ): PaginatedResponse<AgreementParameterUIData> {
    return {
      content: apiResponse.content.map((item) =>
        mapAgreementParameterToUIData(item)
      ),
      page: apiResponse.page,
    };
  }

  // Utility method to get UI-friendly data directly
  async getAgreementParametersUIData(
    page = 0,
    size = 20,
    filters?: AgreementParameterFilters
  ): Promise<PaginatedResponse<AgreementParameterUIData>> {
    const apiResponse = await this.getAgreementParameters(page, size, filters);
    return this.transformToUIData(apiResponse);
  }

  async searchAgreementParameters(
    query: string,
    page = 0,
    size = 20
  ): Promise<AgreementParameter[]> {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const params = {
        ...buildPaginationParams(page, size),
        "agreementRemarks.contains": query.trim(),
        "deleted.equals": "false",
        "enabled.equals": "true",
      };
      const url = `${buildApiUrl(API_ENDPOINTS.AGREEMENT_PARAMETER.GET_ALL)}?${new URLSearchParams(params).toString()}`;
      const response = await apiClient.get(url);
      let agreementParameters: AgreementParameter[] = [];

      if (Array.isArray(response)) {
        agreementParameters = response;
      } else if (response && typeof response === "object") {
        if ("content" in response && Array.isArray(response.content)) {
          agreementParameters = response.content;
        } else if ("id" in response || "agreementRemarks" in response) {
          agreementParameters = [response as AgreementParameter];
        }
      }

      return agreementParameters;
    } catch {
      throw new Error("Failed to search agreement parameters");
    }
  }
}

export const agreementParameterService = new AgreementParameterService();
