// src/services/api.ts
import axios, { type AxiosResponse } from "axios";
import type { LoginRequest, RegisterRequest, AuthResponse} from "../types/auth";

// Yeni tür tanımı
export interface UserInfoResponse {
  username: string;
  email: string;
  phone: string;
  role: string; // Örneğin, "ROLE_USER" veya "ROLE_ADMIN"
}

const API_BASE_URL = "http://localhost:8080/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post("/auth/login", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Giriş başarısız");
  }
};

export const register = async (data: RegisterRequest): Promise<string> => {
  try {
    const response: AxiosResponse<string> = await apiClient.post("/auth/register", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data || "Kayıt başarısız");
  }
};

export const getUserInfo = async (token: string): Promise<UserInfoResponse> => {
  try {
    const response: AxiosResponse<UserInfoResponse> = await apiClient.get("/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data || "Kullanıcı bilgileri alınamadı");
  }
};

export const forgotPassword = async (emailOrPhone: string): Promise<string> => {
  try {
    const response: AxiosResponse<string> = await apiClient.post("/auth/forgot-password", { emailOrPhone });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data || "Şifre sıfırlama isteği başarısız";
    if (errorMessage.includes("No account found")) {
      throw new Error("Bu e-posta veya telefon numarası kayıtlı değil. Destek için support@trinity.com ile iletişime geçin.");
    }
    throw new Error(errorMessage);
  }
};
// src/services/api.ts (sadece resetPassword kısmı eklendi)
export const resetPassword = async (token: string, newPassword: string): Promise<string> => {
  try {
    const response: AxiosResponse<string> = await apiClient.post("/auth/reset-password", { token, newPassword });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data || "Şifre sıfırlama başarısız";
    if (errorMessage.includes("Geçersiz sıfırlama kodu")) {
      throw new Error("Geçersiz sıfırlama kodu");
    } else if (errorMessage.includes("Sıfırlama kodu süresi dolmuş")) {
      throw new Error("Sıfırlama kodu süresi dolmuş");
    } else if (errorMessage.includes("Yeni şifre en az 8 karakter olmalı")) {
      throw new Error("Yeni şifre en az 8 karakter olmalı");
    }
    throw new Error(errorMessage);
  }
};