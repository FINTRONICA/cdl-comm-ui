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
export interface CriticalityDTO {
  id: number;
  settingKey?: string;
  settingValue?: string;
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
      moduleCode?: string;
      moduleDescription: string;
      deleted: boolean;
      enabled: boolean;
      active: boolean;
    };
    status: string | null;
    enabled: boolean;
    deleted: boolean;
  };
  remarks?: string;
  status?: string;
  enabled: boolean;
  deleted: boolean;
}

export interface AccountPurpose {
  id: number;
  accountPurposeCode: string;
  accountPurposeName: string;
  active: boolean;
  criticalityDTO?: CriticalityDTO | null;
  taskStatusDTO?: TaskStatusDTO | null;
  enabled: boolean;
  deleted: boolean;
  uuid?: string;
}

export interface CreateAccountPurposeRequest {
  accountPurposeCode: string;
  accountPurposeName: string;
  active: boolean;
  enabled?: boolean;
  deleted?: boolean;
  uuid?: string;
  criticalityDTO?: {
    id: number;
  } | null;
  taskStatusDTO?: {
    id: number;
  } | null;
}

export interface UpdateAccountPurposeRequest {
  id?: number;
  accountPurposeCode: string;
  accountPurposeName: string;
  active?: boolean;
  enabled?: boolean;
  deleted?: boolean;
  uuid?: string;
  criticalityDTO?: {
    id: number;
  } | null;
  taskStatusDTO?: {
    id: number;
  } | null;
}

export interface AccountPurposeFilters {
  name?: string;
}

export class AccountPurposeService {
  async getAccountPurposes(
    page = 0,
    size = 20,
    filters?: AccountPurposeFilters
  ): Promise<PaginatedResponse<AccountPurpose>> {
    const apiFilters: Record<string, string> = {};
    if (filters) {
      if (filters.name) {
        apiFilters["accountPurposeName.contains"] = filters.name;
      }
    }

    // Build URL - Use base endpoint and add all params
    const baseUrl = buildApiUrl("/account-purpose");
    const allParams = {
      "deleted.equals": "false",
      "enabled.equals": "true",
      ...buildPaginationParams(page, size),
      ...apiFilters,
    };
    const url = `${baseUrl}?${new URLSearchParams(allParams).toString()}`;

    try {
      const result =
        await apiClient.get<PaginatedResponse<AccountPurpose>>(url);
      // Ensure response structure matches expected format
      if (result && "content" in result && "page" in result) {
        return result;
      }
      // Fallback for unexpected response structure
      const contentArray = Array.isArray(result) ? result : [];
      return {
        content: contentArray,
        page: {
          size: size,
          number: page,
          totalElements: contentArray.length,
          totalPages: Math.ceil(contentArray.length / size) || 0,
        },
      };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching account purposes:", error);
      }
      throw error;
    }
  }

  async getAccountPurpose(id: string): Promise<AccountPurpose> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.MASTER_ACCOUNT_PURPOSE.GET_BY_ID(id)
      );
      const result = await apiClient.get<AccountPurpose>(url);
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Error fetching account purpose with id ${id}:`, error);
      }
      throw error;
    }
  }

  async createAccountPurpose(
    data: CreateAccountPurposeRequest
  ): Promise<AccountPurpose> {
    try {
      const result = await apiClient.post<AccountPurpose>(
        buildApiUrl(API_ENDPOINTS.MASTER_ACCOUNT_PURPOSE.SAVE),
        data
      );
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error creating account purpose:", error);
      }
      throw error;
    }
  }

  async updateAccountPurpose(
    id: string,
    updates: UpdateAccountPurposeRequest
  ): Promise<AccountPurpose> {
    try {
      const result = await apiClient.put<AccountPurpose>(
        buildApiUrl(API_ENDPOINTS.MASTER_ACCOUNT_PURPOSE.UPDATE(id)),
        updates
      );
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Error updating account purpose with id ${id}:`, error);
      }
      throw error;
    }
  }

  async deleteAccountPurpose(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.MASTER_ACCOUNT_PURPOSE.SOFT_DELETE(id))
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Error deleting account purpose with id ${id}:`, error);
      }
      throw error;
    }
  }

  async getAllAccountPurposes(): Promise<AccountPurpose[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_ACCOUNT_PURPOSE.FIND_ALL);
      const result = await apiClient.get<
        AccountPurpose[] | PaginatedResponse<AccountPurpose>
      >(url);

      // Handle different response structures
      if (Array.isArray(result)) {
        return result;
      } else if (
        result &&
        typeof result === "object" &&
        "content" in result &&
        Array.isArray((result as PaginatedResponse<AccountPurpose>).content)
      ) {
        return (result as PaginatedResponse<AccountPurpose>).content;
      }

      return [];
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching all account purposes:", error);
      }
      return [];
    }
  }
}

export const accountPurposeService = new AccountPurposeService();
