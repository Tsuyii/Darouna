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
    api.post<ApiResponse<LoginResponse>>('/api/auth/login', { email, password }),

  register: (name: string, email: string, password: string, phone: string, role: string) =>
    api.post<ApiResponse<LoginResponse>>('/api/auth/register', { name, email, password, phone, role }),

  logout: (refreshToken: string) =>
    api.post('/api/auth/logout', { refreshToken }),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh-token', { refreshToken }),

  me: () =>
    api.get<ApiResponse<User>>('/api/auth/me'),
}
