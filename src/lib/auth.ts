import api from './api'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'syndic' | 'resident' | 'gardien'
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface ApiResponse<T> {
  statusCode: number
  data: T
  message: string
  success: boolean
  timestamp: string
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', { email, password }),

  register: (name: string, email: string, password: string, phone: string, role: string) =>
    api.post<ApiResponse<LoginResponse>>('/api/v1/auth/register', { name, email, password, phone, role }),

  logout: (refreshToken: string) =>
    api.post('/api/v1/auth/logout', { refreshToken }),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string }>>('/api/v1/auth/refresh-token', { refreshToken }),

  me: () =>
    api.get<ApiResponse<User>>('/api/v1/auth/me'),
}
