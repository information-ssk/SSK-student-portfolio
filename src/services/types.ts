// Data types and interfaces for the SSK Student Portfolio system

export interface Competition {
  id?: string;
  name: string;
  level: 'school' | 'district' | 'province' | 'national' | 'international';
  date: string;
  result: 'gold' | 'silver' | 'bronze' | 'participation';
  medal?: string;
  award?: string;
  coach?: string;
  isTeam?: boolean;
  teamMembers?: string[];
}

export interface Achievement {
  id?: string;
  date: string;
  student: string;
  dept: string;
  activity: string;
  competitions: Competition[];
  fileUrl?: string;
  fileName?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  dept: string | null;
  token: string | null;
  isAdmin: boolean;
  loading: boolean;
}

export interface LoginPayload {
  email?: string;
  password: string;
  dept: string;
}

export interface LoginResponse {
  success: boolean;
  email?: string;
  dept?: string;
  token?: string;
  isAdmin?: boolean;
  message?: string;
}

export interface ValidationResponse {
  success: boolean;
  valid?: boolean;
  isAdmin?: boolean;
  message?: string;
}

export interface ListResponse {
  success: boolean;
  data?: Achievement[];
  message?: string;
}

export interface SaveResponse {
  success: boolean;
  id?: string;
  message?: string;
}

export interface DeleteResponse {
  success: boolean;
  message?: string;
}

export interface PaginatedData<T> {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
  items: T[];
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
