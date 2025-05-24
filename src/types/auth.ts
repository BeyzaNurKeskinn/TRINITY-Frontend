export interface LoginRequest{
    username: string;
    password:string;
}

export interface RegisterRequest{
    username:string;
    password:string;
    email:string;
    phone:string;
}
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ErrorResponse {
  error?: string;
}