import { apiClient } from "@/lib/apiClient";
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from "@/constants/apiEndpoints";
import type { PaginatedResponse } from "@/types";

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

export interface AgreementSegment {
  id: number;
  segmentName: string;
  segmentDescription: string;
  active: boolean;
  taskStatusDTO?: TaskStatusDTO | null;
  enabled: boolean;
  deleted: boolean;
  uuid?: string;
}

export interface CreateAgreementSegmentRequest {
  segmentName: string;
  segmentDescription: string;
  active: boolean;
  enabled?: boolean;
  deleted?: boolean;
  uuid?: string;
  taskStatusDTO?: {
    id: number;
  } | null;
}

export interface UpdateAgreementSegmentRequest {
  id?: number;
  segmentName?: string;
  segmentDescription?: string;
  active?: boolean;
  enabled?: boolean;
  deleted?: boolean;
  uuid?: string;
  taskStatusDTO?: {
    id: number;
  } | null;
}

export interface AgreementSegmentFilters {
  name?: string;
}

export class AgreementSegmentService {
  async getAgreementSegments(
    page = 0,
    size = 20,
    filters?: AgreementSegmentFilters
  ): Promise<PaginatedResponse<AgreementSegment>> {
    const apiFilters: Record<string, string> = {};
    if (filters?.name) {
      apiFilters["segmentName.contains"] = filters.name;
    }

    const baseUrl = buildApiUrl("/agreement-segment");
    const allParams = {
      "deleted.equals": "false",
      "enabled.equals": "true",
      ...buildPaginationParams(page, size),
      ...apiFilters,
    };
    const url = `${baseUrl}?${new URLSearchParams(allParams).toString()}`;

    try {
      const result =
        await apiClient.get<PaginatedResponse<AgreementSegment>>(url);
      return (
        result || {
          content: [],
          page: {
            size: 0,
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

  async getAgreementSegment(id: string): Promise<AgreementSegment> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.MASTER_AGREEMENT_SEGMENT.GET_BY_ID(id)
      );
      const result = await apiClient.get<AgreementSegment>(url);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createAgreementSegment(
    data: CreateAgreementSegmentRequest
  ): Promise<AgreementSegment> {
    try {
      const result = await apiClient.post<AgreementSegment>(
        buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_SEGMENT.SAVE),
        data
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateAgreementSegment(
    id: string,
    updates: UpdateAgreementSegmentRequest
  ): Promise<AgreementSegment> {
    try {
      const result = await apiClient.put<AgreementSegment>(
        buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_SEGMENT.UPDATE(id)),
        updates
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteAgreementSegment(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_SEGMENT.SOFT_DELETE(id))
      );
    } catch (error) {
      throw error;
    }
  }

  async getAllAgreementSegments(): Promise<AgreementSegment[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_SEGMENT.FIND_ALL);
      const result = await apiClient.get<
        AgreementSegment[] | PaginatedResponse<AgreementSegment>
      >(url);

      // Handle different response structures
      if (Array.isArray(result)) {
        return result;
      }
      if (
        result &&
        typeof result === "object" &&
        "content" in result &&
        Array.isArray((result as PaginatedResponse<AgreementSegment>).content)
      ) {
        return (result as PaginatedResponse<AgreementSegment>).content;
      }

      return [];
    } catch (error) {
      // Return empty array on error to prevent UI crashes
      // Error logging should be handled by the calling component
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching all agreement segments:", error);
      }
      return [];
    }
  }
}

export const agreementSegmentService = new AgreementSegmentService();
