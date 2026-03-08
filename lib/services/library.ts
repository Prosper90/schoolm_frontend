import { api } from "../api";
import { ApiResponse, Book, BookFormData, BookIssue, BookIssueFormData } from "@/types";

interface BooksResponse {
  books: Book[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface BookIssuesResponse {
  issues: BookIssue[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface LibraryReportResponse {
  totalBooks: number;
  totalIssued: number;
  totalAvailable: number;
  overdueBooks: number;
  totalFines: number;
}

interface BookFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

interface BookIssueFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export const libraryApi = {
  // Books
  getBooks: async (filters: BookFilters = {}): Promise<ApiResponse<BooksResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.category) params.append("category", filters.category);

    return api.get<ApiResponse<BooksResponse>>(`/library/books?${params.toString()}`);
  },

  getBookById: async (id: string): Promise<ApiResponse<Book>> => {
    return api.get<ApiResponse<Book>>(`/library/books/${id}`);
  },

  addBook: async (data: BookFormData): Promise<ApiResponse<Book>> => {
    return api.post<ApiResponse<Book>>("/library/books", data);
  },

  updateBook: async (id: string, data: Partial<BookFormData>): Promise<ApiResponse<Book>> => {
    return api.put<ApiResponse<Book>>(`/library/books/${id}`, data);
  },

  deleteBook: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/library/books/${id}`);
  },

  // Book Issues
  issueBook: async (data: BookIssueFormData): Promise<ApiResponse<BookIssue>> => {
    return api.post<ApiResponse<BookIssue>>("/library/issues", data);
  },

  returnBook: async (issueId: string): Promise<ApiResponse<BookIssue>> => {
    return api.patch<ApiResponse<BookIssue>>(`/library/issues/${issueId}/return`);
  },

  getIssues: async (filters: BookIssueFilters = {}): Promise<ApiResponse<BookIssuesResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.status) params.append("status", filters.status);

    return api.get<ApiResponse<BookIssuesResponse>>(`/library/issues?${params.toString()}`);
  },

  getStudentIssues: async (studentId: string): Promise<ApiResponse<BookIssue[]>> => {
    return api.get<ApiResponse<BookIssue[]>>(`/library/issues/student/${studentId}`);
  },

  getReport: async (): Promise<ApiResponse<LibraryReportResponse>> => {
    return api.get<ApiResponse<LibraryReportResponse>>("/library/report");
  },
};
