import { api } from "../api";
import {
  ApiResponse,
  Exam,
  ExamFormData,
  ExamSchedule,
  ExamScheduleFormData,
  ExamResult,
  ExamResultFormData,
} from "@/types";

interface ExamsResponse {
  exams: Exam[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface ExamFilters {
  page?: number;
  limit?: number;
  term?: string;
  academicYear?: string;
  classId?: string;
}

interface ExamResultsResponse {
  results: ExamResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface ExamResultFilters {
  examId?: string;
  classId?: string;
  subjectId?: string;
  page?: number;
  limit?: number;
}

export const examsApi = {
  // Exam CRUD
  getAll: async (filters: ExamFilters = {}): Promise<ApiResponse<ExamsResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.term) params.append("term", filters.term);
    if (filters.academicYear) params.append("academicYear", filters.academicYear);
    if (filters.classId) params.append("classId", filters.classId);

    return api.get<ApiResponse<ExamsResponse>>(`/exams?${params.toString()}`);
  },

  getById: async (id: string): Promise<ApiResponse<Exam>> => {
    return api.get<ApiResponse<Exam>>(`/exams/${id}`);
  },

  create: async (data: ExamFormData): Promise<ApiResponse<Exam>> => {
    return api.post<ApiResponse<Exam>>("/exams", data);
  },

  update: async (id: string, data: Partial<ExamFormData>): Promise<ApiResponse<Exam>> => {
    return api.put<ApiResponse<Exam>>(`/exams/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/exams/${id}`);
  },

  // Exam Schedules
  createSchedule: async (data: ExamScheduleFormData): Promise<ApiResponse<ExamSchedule>> => {
    return api.post<ApiResponse<ExamSchedule>>("/exams/schedules", data);
  },

  getSchedules: async (filters?: { examId?: string; classId?: string }): Promise<ApiResponse<ExamSchedule[]>> => {
    const params = new URLSearchParams();
    if (filters?.examId) params.append("examId", filters.examId);
    if (filters?.classId) params.append("classId", filters.classId);

    return api.get<ApiResponse<ExamSchedule[]>>(`/exams/schedules/list?${params.toString()}`);
  },

  updateSchedule: async (id: string, data: Partial<ExamScheduleFormData>): Promise<ApiResponse<ExamSchedule>> => {
    return api.put<ApiResponse<ExamSchedule>>(`/exams/schedules/${id}`, data);
  },

  deleteSchedule: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/exams/schedules/${id}`);
  },

  // Exam Results
  recordResult: async (data: ExamResultFormData): Promise<ApiResponse<ExamResult>> => {
    return api.post<ApiResponse<ExamResult>>("/exams/results", data);
  },

  bulkRecordResults: async (data: { examId: string; results: Omit<ExamResultFormData, "examId">[] }): Promise<ApiResponse<{ count: number }>> => {
    return api.post<ApiResponse<{ count: number }>>("/exams/results/bulk", data);
  },

  getStudentResults: async (studentId: string, filters?: { examId?: string; academicYear?: string }): Promise<ApiResponse<ExamResult[]>> => {
    const params = new URLSearchParams();
    if (filters?.examId) params.append("examId", filters.examId);
    if (filters?.academicYear) params.append("academicYear", filters.academicYear);

    return api.get<ApiResponse<ExamResult[]>>(`/exams/results/student/${studentId}?${params.toString()}`);
  },

  getResults: async (filters: ExamResultFilters = {}): Promise<ApiResponse<ExamResultsResponse>> => {
    const params = new URLSearchParams();
    if (filters.examId) params.append("examId", filters.examId);
    if (filters.classId) params.append("classId", filters.classId);
    if (filters.subjectId) params.append("subjectId", filters.subjectId);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    return api.get<ApiResponse<ExamResultsResponse>>(`/exams/results/list?${params.toString()}`);
  },

  deleteResult: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/exams/results/${id}`);
  },
};
