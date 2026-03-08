import { api } from "../api";
import { ApiResponse, Department, DepartmentFormData } from "@/types";

interface DepartmentsResponse {
  departments: Department[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface DepartmentFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const departmentsApi = {
  getAll: async (filters: DepartmentFilters = {}): Promise<ApiResponse<DepartmentsResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);

    return api.get<ApiResponse<DepartmentsResponse>>(`/departments?${params.toString()}`);
  },

  getById: async (id: string): Promise<ApiResponse<Department>> => {
    return api.get<ApiResponse<Department>>(`/departments/${id}`);
  },

  create: async (data: DepartmentFormData): Promise<ApiResponse<Department>> => {
    return api.post<ApiResponse<Department>>("/departments", data);
  },

  update: async (id: string, data: Partial<DepartmentFormData>): Promise<ApiResponse<Department>> => {
    return api.put<ApiResponse<Department>>(`/departments/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/departments/${id}`);
  },
};
