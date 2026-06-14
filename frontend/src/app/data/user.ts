export interface User {
  userID: string | number | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'common' | 'owner' | 'admin';
}

export type RegistrationPayload = Omit<User, 'userID'> & {
  password?: string;
  bankAccountNumber?: string;
};

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  user?: T;
}
