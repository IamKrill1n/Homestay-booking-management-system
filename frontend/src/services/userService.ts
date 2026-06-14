import { User, ApiResponse } from '../app/data/user';

const API_BASE_URL = ((import.meta as any).env.VITE_API_BASE_URL as string) || "http://localhost:3001/api";

export const userService = {
  async register(userData: Omit<User, 'userID'> & { password?: string }): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/guest/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    
    const data: ApiResponse<User> = await response.json();
    if (!response.ok) throw new Error(data.message || "Registration failed");
    return data; 
  },

  async login(email: string, password: string): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/guest/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data: ApiResponse<User> = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");
    return data;
  },

  async getProfile(userId: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`);
    if (!response.ok) {
      const errorData: ApiResponse<never> = await response.json();
      throw new Error(errorData.message || "Failed to fetch profile");
    }
    return await response.json() as User;
  }
};