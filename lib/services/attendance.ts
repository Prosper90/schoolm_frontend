import { api } from "../api";
import { ApiResponse, Attendance, AttendanceFormData, BulkAttendanceFormData } from "@/types";

interface ClassAttendanceResponse {
  attendance: Attendance[];
  date: string;
  classId: string;
}

interface StudentAttendanceResponse {
  attendance: Attendance[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface AttendanceReportResponse {
  summary: {
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    attendanceRate: number;
  };
  records: Attendance[];
}

interface AttendanceReportFilters {
  classId?: string;
  startDate?: string;
  endDate?: string;
  studentId?: string;
}

export const attendanceApi = {
  mark: async (data: AttendanceFormData): Promise<ApiResponse<Attendance>> => {
    return api.post<ApiResponse<Attendance>>("/attendance", data);
  },

  bulkMark: async (data: BulkAttendanceFormData): Promise<ApiResponse<{ count: number }>> => {
    return api.post<ApiResponse<{ count: number }>>("/attendance/bulk", data);
  },

  getByClass: async (classId: string, date?: string): Promise<ApiResponse<ClassAttendanceResponse>> => {
    const params = new URLSearchParams();
    if (date) params.append("date", date);

    return api.get<ApiResponse<ClassAttendanceResponse>>(`/attendance/class/${classId}?${params.toString()}`);
  },

  getByStudent: async (studentId: string, filters?: { startDate?: string; endDate?: string; page?: number; limit?: number }): Promise<ApiResponse<StudentAttendanceResponse>> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    return api.get<ApiResponse<StudentAttendanceResponse>>(`/attendance/student/${studentId}?${params.toString()}`);
  },

  getReport: async (filters: AttendanceReportFilters = {}): Promise<ApiResponse<AttendanceReportResponse>> => {
    const params = new URLSearchParams();
    if (filters.classId) params.append("classId", filters.classId);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.studentId) params.append("studentId", filters.studentId);

    return api.get<ApiResponse<AttendanceReportResponse>>(`/attendance/report?${params.toString()}`);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/attendance/${id}`);
  },
};
