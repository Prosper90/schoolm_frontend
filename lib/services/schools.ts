import { api } from "../api";
import { ApiResponse, School, SchoolFormData } from "@/types";

interface SchoolsResponse {
  schools: School[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface SchoolFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const schoolsApi = {
  getAll: async (filters: SchoolFilters = {}): Promise<ApiResponse<SchoolsResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);

    return api.get<ApiResponse<SchoolsResponse>>(`/schools?${params.toString()}`);
  },

  getById: async (id: string): Promise<ApiResponse<School>> => {
    return api.get<ApiResponse<School>>(`/schools/${id}`);
  },

  create: async (data: SchoolFormData): Promise<ApiResponse<School>> => {
    return api.post<ApiResponse<School>>("/schools", data);
  },

  update: async (id: string, data: Partial<SchoolFormData>): Promise<ApiResponse<School>> => {
    return api.put<ApiResponse<School>>(`/schools/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/schools/${id}`);
  },

  toggleStatus: async (id: string): Promise<ApiResponse<School>> => {
    return api.patch<ApiResponse<School>>(`/schools/${id}/toggle-status`);
  },
};
