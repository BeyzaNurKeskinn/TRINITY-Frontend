import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const login = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, { username, password });
  return response.data;
};

export const googleLogin = async (credential: string) => {
  const response = await axios.post(`${API_URL}/google-login`, { credential });
  return response.data;
};

export const facebookLogin = async (accessToken: string) => {
  const response = await axios.post(`${API_URL}/facebook-login`, { accessToken });
  return response.data;
};

export const register = async (username: string, password: string, email: string, phone: string) => {
  const response = await axios.post(`${API_URL}/register`, { username, password, email, phone });
  return response.data;
};

export const forgotPassword = async (emailOrPhone: string) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { emailOrPhone });
  return response.data;
};