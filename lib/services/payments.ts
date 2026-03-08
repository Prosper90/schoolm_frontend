import { api } from "../api";
import { ApiResponse, Payment, PaymentFormData } from "@/types";

interface PaymentsResponse {
  payments: Payment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  summary: {
    totalAmount: number;
  };
}

interface PaymentFilters {
  page?: number;
  limit?: number;
  studentId?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}

export const paymentsApi = {
  getAll: async (filters: PaymentFilters = {}): Promise<ApiResponse<PaymentsResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.studentId) params.append("studentId", filters.studentId);
    if (filters.paymentMethod) params.append("paymentMethod", filters.paymentMethod);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    return api.get<ApiResponse<PaymentsResponse>>(`/payments?${params.toString()}`);
  },

  getById: async (id: string): Promise<ApiResponse<Payment>> => {
    return api.get<ApiResponse<Payment>>(`/payments/${id}`);
  },

  record: async (data: PaymentFormData): Promise<ApiResponse<Payment>> => {
    return api.post<ApiResponse<Payment>>("/payments", data);
  },

  update: async (id: string, data: Partial<PaymentFormData>): Promise<ApiResponse<Payment>> => {
    return api.put<ApiResponse<Payment>>(`/payments/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/payments/${id}`);
  },

  getStudentHistory: async (studentId: string): Promise<ApiResponse<any>> => {
    return api.get<ApiResponse<any>>(`/payments/student/${studentId}`);
  },

  getReport: async (filters?: { startDate?: string; endDate?: string; classId?: string }): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.classId) params.append("classId", filters.classId);

    return api.get<ApiResponse<any>>(`/payments/report?${params.toString()}`);
  },
};
