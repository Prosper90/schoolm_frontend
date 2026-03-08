import { api } from "../api";
import { ApiResponse, Class, ClassFormData } from "@/types";

interface ClassesResponse {
  classes: Class[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const classesApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<ClassesResponse>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);

    return api.get<ApiResponse<ClassesResponse>>(`/classes?${searchParams.toString()}`);
  },

  getById: async (id: string): Promise<ApiResponse<Class>> => {
    return api.get<ApiResponse<Class>>(`/classes/${id}`);
  },

  create: async (data: ClassFormData): Promise<ApiResponse<Class>> => {
    return api.post<ApiResponse<Class>>("/classes", data);
  },

  update: async (id: string, data: Partial<ClassFormData>): Promise<ApiResponse<Class>> => {
    return api.put<ApiResponse<Class>>(`/classes/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/classes/${id}`);
  },

  getStudents: async (classId: string): Promise<ApiResponse<any>> => {
    return api.get<ApiResponse<any>>(`/classes/${classId}/students`);
  },
};
