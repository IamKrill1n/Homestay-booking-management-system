export interface User {
  userID: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'common' | 'owner' | 'admin';
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  user?: T;
}