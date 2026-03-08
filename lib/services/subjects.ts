import { api } from "../api";
import { ApiResponse, Subject, SubjectFormData, SubjectAssignment, SubjectAssignmentFormData } from "@/types";

interface SubjectsResponse {
  subjects: Subject[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface SubjectFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const subjectsApi = {
  getAll: async (filters: SubjectFilters = {}): Promise<ApiResponse<SubjectsResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);

    return api.get<ApiResponse<SubjectsResponse>>(`/subjects?${params.toString()}`);
  },

  getById: async (id: string): Promise<ApiResponse<Subject>> => {
    return api.get<ApiResponse<Subject>>(`/subjects/${id}`);
  },

  create: async (data: SubjectFormData): Promise<ApiResponse<Subject>> => {
    return api.post<ApiResponse<Subject>>("/subjects", data);
  },

  update: async (id: string, data: Partial<SubjectFormData>): Promise<ApiResponse<Subject>> => {
    return api.put<ApiResponse<Subject>>(`/subjects/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/subjects/${id}`);
  },

  // Subject Assignments
  assign: async (data: SubjectAssignmentFormData): Promise<ApiResponse<SubjectAssignment>> => {
    return api.post<ApiResponse<SubjectAssignment>>("/subjects/assignments", data);
  },

  updateAssignment: async (id: string, data: Partial<SubjectAssignmentFormData>): Promise<ApiResponse<SubjectAssignment>> => {
    return api.put<ApiResponse<SubjectAssignment>>(`/subjects/assignments/${id}`, data);
  },

  deleteAssignment: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/subjects/assignments/${id}`);
  },
};
