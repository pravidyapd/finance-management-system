
import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  userId: number;
  name: string;
  email: string;
}

export const registerUser = async (
  user: RegisterRequest
): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/register`, user);
  return response.data;
};

export const loginUser = async (
  user: LoginRequest
): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/login`, user);
  return response.data;
};
