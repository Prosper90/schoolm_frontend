import { api } from "../api";
import {
  ApiResponse,
  IncomeHead,
  ExpenseHead,
  Income,
  Expense,
  IncomeFormData,
  ExpenseFormData,
} from "@/types";

interface IncomeResponse {
  income: Income[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  summary: {
    totalIncome: number;
  };
}

interface ExpenseResponse {
  expenses: Expense[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  summary: {
    totalExpense: number;
  };
}

interface FinancialReportResponse {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    incomeTransactions: number;
    expenseTransactions: number;
  };
  incomeBreakdown: { name: string; amount: number; count: number }[];
  expenseBreakdown: { name: string; amount: number; count: number }[];
}

interface TransactionFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

interface HeadFormData {
  name: string;
  description?: string;
}

export const accountsApi = {
  // Income Heads
  getIncomeHeads: async (): Promise<ApiResponse<IncomeHead[]>> => {
    return api.get<ApiResponse<IncomeHead[]>>("/accounts/income-heads");
  },

  createIncomeHead: async (data: HeadFormData): Promise<ApiResponse<IncomeHead>> => {
    return api.post<ApiResponse<IncomeHead>>("/accounts/income-heads", data);
  },

  updateIncomeHead: async (id: string, data: Partial<HeadFormData>): Promise<ApiResponse<IncomeHead>> => {
    return api.put<ApiResponse<IncomeHead>>(`/accounts/income-heads/${id}`, data);
  },

  deleteIncomeHead: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/accounts/income-heads/${id}`);
  },

  // Expense Heads
  getExpenseHeads: async (): Promise<ApiResponse<ExpenseHead[]>> => {
    return api.get<ApiResponse<ExpenseHead[]>>("/accounts/expense-heads");
  },

  createExpenseHead: async (data: HeadFormData): Promise<ApiResponse<ExpenseHead>> => {
    return api.post<ApiResponse<ExpenseHead>>("/accounts/expense-heads", data);
  },

  updateExpenseHead: async (id: string, data: Partial<HeadFormData>): Promise<ApiResponse<ExpenseHead>> => {
    return api.put<ApiResponse<ExpenseHead>>(`/accounts/expense-heads/${id}`, data);
  },

  deleteExpenseHead: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/accounts/expense-heads/${id}`);
  },

  // Income
  getAllIncome: async (filters: TransactionFilters = {}): Promise<ApiResponse<IncomeResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    return api.get<ApiResponse<IncomeResponse>>(`/accounts/income?${params.toString()}`);
  },

  getIncomeById: async (id: string): Promise<ApiResponse<Income>> => {
    return api.get<ApiResponse<Income>>(`/accounts/income/${id}`);
  },

  recordIncome: async (data: IncomeFormData): Promise<ApiResponse<Income>> => {
    return api.post<ApiResponse<Income>>("/accounts/income", data);
  },

  updateIncome: async (id: string, data: Partial<IncomeFormData>): Promise<ApiResponse<Income>> => {
    return api.put<ApiResponse<Income>>(`/accounts/income/${id}`, data);
  },

  deleteIncome: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/accounts/income/${id}`);
  },

  // Expenses
  getAllExpenses: async (filters: TransactionFilters = {}): Promise<ApiResponse<ExpenseResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    return api.get<ApiResponse<ExpenseResponse>>(`/accounts/expenses?${params.toString()}`);
  },

  getExpenseById: async (id: string): Promise<ApiResponse<Expense>> => {
    return api.get<ApiResponse<Expense>>(`/accounts/expenses/${id}`);
  },

  recordExpense: async (data: ExpenseFormData): Promise<ApiResponse<Expense>> => {
    return api.post<ApiResponse<Expense>>("/accounts/expenses", data);
  },

  updateExpense: async (id: string, data: Partial<ExpenseFormData>): Promise<ApiResponse<Expense>> => {
    return api.put<ApiResponse<Expense>>(`/accounts/expenses/${id}`, data);
  },

  deleteExpense: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/accounts/expenses/${id}`);
  },

  // Financial Report
  getFinancialReport: async (filters?: { startDate?: string; endDate?: string; schoolId?: string }): Promise<ApiResponse<FinancialReportResponse>> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.schoolId) params.append("schoolId", filters.schoolId);

    return api.get<ApiResponse<FinancialReportResponse>>(`/accounts/report?${params.toString()}`);
  },
};
