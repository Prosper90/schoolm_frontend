import { api } from "../api";
import {
  ApiResponse,
  Leave,
  LeaveFormData,
  LeaveType,
  LeaveTypeFormData,
  LeaveStatus,
} from "@/types";

interface LeavesResponse {
  leaves: Leave[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface MyLeavesResponse {
  leaves: Leave[];
  statistics: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

interface LeaveReportResponse {
  summary: {
    totalLeaves: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  byType: { name: string; count: number }[];
  byStaff: { staffName: string; total: number; approved: number }[];
}

interface LeaveFilters {
  page?: number;
  limit?: number;
  status?: LeaveStatus;
  staffId?: string;
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
}

export const leaveApi = {
  // Leave Types
  getTypes: async (): Promise<ApiResponse<LeaveType[]>> => {
    return api.get<ApiResponse<LeaveType[]>>("/leaves/types");
  },

  createType: async (data: LeaveTypeFormData): Promise<ApiResponse<LeaveType>> => {
    return api.post<ApiResponse<LeaveType>>("/leaves/types", data);
  },

  updateType: async (id: string, data: Partial<LeaveTypeFormData>): Promise<ApiResponse<LeaveType>> => {
    return api.put<ApiResponse<LeaveType>>(`/leaves/types/${id}`, data);
  },

  deleteType: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/leaves/types/${id}`);
  },

  // Leave Applications
  apply: async (data: LeaveFormData): Promise<ApiResponse<Leave>> => {
    return api.post<ApiResponse<Leave>>("/leaves", data);
  },

  getAll: async (filters: LeaveFilters = {}): Promise<ApiResponse<LeavesResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.status) params.append("status", filters.status);
    if (filters.staffId) params.append("staffId", filters.staffId);
    if (filters.leaveTypeId) params.append("leaveTypeId", filters.leaveTypeId);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    return api.get<ApiResponse<LeavesResponse>>(`/leaves?${params.toString()}`);
  },

  getMyLeaves: async (): Promise<ApiResponse<MyLeavesResponse>> => {
    return api.get<ApiResponse<MyLeavesResponse>>("/leaves/my-leaves");
  },

  getById: async (id: string): Promise<ApiResponse<Leave>> => {
    return api.get<ApiResponse<Leave>>(`/leaves/${id}`);
  },

  updateStatus: async (id: string, status: LeaveStatus): Promise<ApiResponse<Leave>> => {
    return api.patch<ApiResponse<Leave>>(`/leaves/${id}/status`, { status });
  },

  cancel: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/leaves/${id}`);
  },

  getReport: async (filters?: { startDate?: string; endDate?: string }): Promise<ApiResponse<LeaveReportResponse>> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    return api.get<ApiResponse<LeaveReportResponse>>(`/leaves/report?${params.toString()}`);
  },
};
