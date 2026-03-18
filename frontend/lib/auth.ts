// frontend/lib/auth.ts
import { api } from './api';
import { useAuthStore } from '@/stores/authStore';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role?: string;
  studentData?: any;
}

export interface User {
  id: string;
  email: string;
  role: 'student' | 'admin' | 'staff';
  studentProfile?: any;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { token, user } = response.data;
    
    // Store auth data
    useAuthStore.getState().setAuth(token, user);
    
    // Set default authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    const { token, user } = response.data;
    
    // Store auth data
    useAuthStore.getState().setAuth(token, user);
    
    // Set default authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return response.data;
  }

  async logout(): Promise<void> {
    // Clear auth store
    useAuthStore.getState().logout();
    
    // Remove authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Optionally call logout endpoint
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors as we're logging out anyway
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }

  async refreshToken(): Promise<string> {
    const response = await api.post<{ token: string }>('/auth/refresh');
    const { token } = response.data;
    
    // Update token in store
    const user = useAuthStore.getState().user;
    if (user) {
      useAuthStore.getState().setAuth(token, user);
    }
    
    // Update authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return token;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  async resetPassword(email: string): Promise<void> {
    await api.post('/auth/reset-password', { email });
  }

  async verifyResetToken(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/verify-reset-token', {
      token,
      newPassword
    });
  }

  isAuthenticated(): boolean {
    return useAuthStore.getState().isAuthenticated;
  }

  getToken(): string | null {
    return useAuthStore.getState().token;
  }

  getUser(): User | null {
    // Type assertion to ensure compatibility
    return useAuthStore.getState().user as User | null;
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isStudent(): boolean {
    return this.hasRole('student');
  }

  isStaff(): boolean {
    return this.hasRole('staff');
  }
}

export const authService = new AuthService();