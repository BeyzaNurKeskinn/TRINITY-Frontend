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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

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
    if (!error.response) {
      throw new Error("Ağ hatası: Sunucuya bağlanılamadı.");
    }
    if (error.response?.status === 401) {
      throw new Error("Kullanıcı Adı Veya Şifreniz Yanlış, Tekrar Girin!");
    }
    throw new Error(error.response?.data?.error || "Giriş başarısız");
  }
};

export const register = async (data: RegisterRequest): Promise<string> => {
  try {
    const response: AxiosResponse<string> = await apiClient.post("/auth/register", data);
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      throw new Error("Ağ hatası: Sunucuya bağlanılamadı.");
    }
    if (error.response?.status === 400 && error.response?.data?.includes("Validation failed")) {
      const errorMessages: string[] = [];
      if (error.response.data.includes("Kullanıcı adı 3-20 karakter olmalı")) {
        errorMessages.push("Kullanıcı adı 3-20 karakter olmalı.");
      }
      if (error.response.data.includes("Telefon numarası 10-15 karakter olmalı")) {
        errorMessages.push("Telefon numarası 10-15 karakter olmalı.");
      }
      if (error.response.data.includes("Şifre en az 8 karakter olmalı")) {
        errorMessages.push("Şifre en az 8 karakter olmalı.");
      }
      if (errorMessages.length > 0) {
        throw new Error(errorMessages.join(";"));
      }
    }
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
    if (!error.response) {
      throw new Error("Ağ hatası: Sunucuya bağlanılamadı.");
    }
    if (error.response?.status === 401) {
      throw new Error("Yetkisiz erişim: Lütfen tekrar giriş yapın.");
    }
    throw new Error(error.response?.data || "Kullanıcı bilgileri alınamadı");
  }
};

export const forgotPassword = async (emailOrPhone: string): Promise<string> => {
  try {
    const response: AxiosResponse<string> = await apiClient.post("/auth/forgot-password", { emailOrPhone });
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      throw new Error("Ağ hatası: Sunucuya bağlanılamadı.");
    }
    if (error.response?.status === 400 && error.response?.data?.includes("Validation failed")) {
      const errorMessages: string[] = [];
      if (error.response.data.includes("E-posta veya telefon numarası geçersiz")) {
        errorMessages.push("Geçerli bir e-posta veya telefon numarası girin.");
      }
      if (errorMessages.length > 0) {
        throw new Error(errorMessages.join(";"));
      }
    }
    const errorMessage = error.response?.data || "Şifre sıfırlama isteği başarısız";
    if (errorMessage.includes("No account found")) {
      throw new Error("Bu e-posta veya telefon numarası kayıtlı değil. Destek için support@trinity.com ile iletişime geçin.");
    }
    throw new Error(errorMessage);
  }
}; 

export const resetPassword = async (token: string, newPassword: string): Promise<string> => {
  try {
    const response: AxiosResponse<string> = await apiClient.post("/auth/reset-password", { token, newPassword });
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      throw new Error("Ağ hatası: Sunucuya bağlanılamadı.");
    }
    if (error.response?.status === 400 && error.response?.data?.includes("Validation failed")) {
      const errorMessages: string[] = [];
      if (error.response.data.includes("Yeni şifre en az 8 karakter olmalı")) {
        errorMessages.push("Yeni şifre en az 8 karakter olmalı.");
      }
      if (errorMessages.length > 0) {
        throw new Error(errorMessages.join(";"));
      }
    }
    const errorMessage = error.response?.data || "Şifre sıfırlama başarısız";
    if (errorMessage.includes("Geçersiz sıfırlama kodu")) {
      throw new Error("Geçersiz sıfırlama kodu");
    } else if (errorMessage.includes("Sıfırlama kodu süresi dolmuş")) {
      throw new Error("Sıfırlama kodu süresi dolmuş");
    }
    throw new Error(errorMessage);
  }
};