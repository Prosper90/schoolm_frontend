import { api } from "../api";
import { ApiResponse } from "@/types";

export interface DashboardStatsResponse {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  totalClasses: number;
  recentPayments: any[];
  recentStudents: any[];
  financialSummary: {
    totalRevenue: number;
    totalExpenses: number;
    balance: number;
  };
  attendanceSummary: {
    present: number;
    absent: number;
    late: number;
    rate: number;
  };
}

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStatsResponse>> => {
    return api.get<ApiResponse<DashboardStatsResponse>>("/dashboard/stats");
  },

  getSchoolStats: async (schoolId: string): Promise<ApiResponse<DashboardStatsResponse>> => {
    return api.get<ApiResponse<DashboardStatsResponse>>(`/dashboard/stats?schoolId=${schoolId}`);
  },
};
