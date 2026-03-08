import { api } from "../api";
import { ApiResponse, Staff, StaffFormData } from "@/types";

interface StaffResponse {
  staff: Staff[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface StaffFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  departmentId?: string;
}

export const staffApi = {
  getAll: async (filters: StaffFilters = {}): Promise<ApiResponse<StaffResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.role) params.append("role", filters.role);
    if (filters.departmentId) params.append("departmentId", filters.departmentId);

    return api.get<ApiResponse<StaffResponse>>(`/staff?${params.toString()}`);
  },

  getById: async (id: string): Promise<ApiResponse<Staff>> => {
    return api.get<ApiResponse<Staff>>(`/staff/${id}`);
  },

  create: async (data: StaffFormData): Promise<ApiResponse<Staff>> => {
    return api.post<ApiResponse<Staff>>("/staff", data);
  },

  update: async (id: string, data: Partial<StaffFormData>): Promise<ApiResponse<Staff>> => {
    return api.put<ApiResponse<Staff>>(`/staff/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/staff/${id}`);
  },

  toggleStatus: async (id: string): Promise<ApiResponse<Staff>> => {
    return api.patch<ApiResponse<Staff>>(`/staff/${id}/toggle-status`);
  },
};
