import { api } from "./api";
import Cookies from "js-cookie";
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from "@/types";

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);

    if (response.data?.accessToken) {
      Cookies.set("accessToken", response.data.accessToken, { expires: 7 });
    }
    if ((response.data as any)?.refreshToken) {
      Cookies.set("refreshToken", (response.data as any).refreshToken, { expires: 7 });
    }

    return response;
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return api.post<AuthResponse>("/auth/register", data);
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<AuthResponse>("/auth/profile");
    return response.data as User;
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/refresh");
    
    if (response.data?.accessToken) {
      Cookies.set("accessToken", response.data.accessToken, { expires: 7 });
    }
    
    return response;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      const refreshToken = Cookies.get("refreshToken");
      await api.post("/auth/logout", { refreshToken });
    } finally {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    }
  },
};
