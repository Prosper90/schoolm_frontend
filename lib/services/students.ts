import { api } from "../api";
import { ApiResponse, Student, StudentFormData } from "@/types";

interface StudentsResponse {
  students: Student[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  classId?: string;
  suspended?: boolean;
}

export const studentsApi = {
  getAll: async (filters: StudentFilters = {}): Promise<ApiResponse<StudentsResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.classId) params.append("classId", filters.classId);
    if (filters.suspended !== undefined) params.append("suspended", filters.suspended.toString());

    return api.get<ApiResponse<StudentsResponse>>(`/students?${params.toString()}`);
  },

  getById: async (id: string): Promise<ApiResponse<Student>> => {
    return api.get<ApiResponse<Student>>(`/students/${id}`);
  },

  create: async (data: StudentFormData): Promise<ApiResponse<Student>> => {
    return api.post<ApiResponse<Student>>("/students", data);
  },

  update: async (id: string, data: Partial<StudentFormData>): Promise<ApiResponse<Student>> => {
    return api.put<ApiResponse<Student>>(`/students/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/students/${id}`);
  },

  suspend: async (id: string, reason?: string): Promise<ApiResponse<Student>> => {
    return api.patch<ApiResponse<Student>>(`/students/${id}/suspend`, { suspensionReason: reason });
  },

  activate: async (id: string): Promise<ApiResponse<Student>> => {
    return api.patch<ApiResponse<Student>>(`/students/${id}/activate`);
  },
};
