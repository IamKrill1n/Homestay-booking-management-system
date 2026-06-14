import { User, ApiResponse, RegistrationPayload } from '../app/data/user';
import { apiRequest } from './api';

export const userService = {
  async register(userData: RegistrationPayload): Promise<ApiResponse<User>> {
    return apiRequest<ApiResponse<User>>('/guest/register', {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async login(email: string, password: string): Promise<ApiResponse<User>> {
    return apiRequest<ApiResponse<User>>('/guest/login', {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async getProfile(userId: string): Promise<User> {
    return apiRequest<User>(`/guest/profile/${userId}`);
  }
};
