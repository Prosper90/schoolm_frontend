import { api } from "../api";
import { ApiResponse, Guardian, GuardianFormData } from "@/types";

interface GuardiansResponse {
  guardians: Guardian[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface GuardianFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const guardiansApi = {
  getAll: async (filters: GuardianFilters = {}): Promise<ApiResponse<GuardiansResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);

    return api.get<ApiResponse<GuardiansResponse>>(`/guardians?${params.toString()}`);
  },

  getById: async (id: string): Promise<ApiResponse<Guardian>> => {
    return api.get<ApiResponse<Guardian>>(`/guardians/${id}`);
  },

  create: async (data: GuardianFormData): Promise<ApiResponse<Guardian>> => {
    return api.post<ApiResponse<Guardian>>("/guardians", data);
  },

  update: async (id: string, data: Partial<GuardianFormData>): Promise<ApiResponse<Guardian>> => {
    return api.put<ApiResponse<Guardian>>(`/guardians/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/guardians/${id}`);
  },
};
