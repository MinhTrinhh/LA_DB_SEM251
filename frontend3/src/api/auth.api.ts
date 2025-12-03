import apiClient from './client';
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  Role,
} from '@/types/api.types';

// ============================================
// Auth Functions
// ============================================

export const authApi = {
  /**
   * Register a new user
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', userData);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },
};

// ============================================
// Local Storage Helper Functions
// ============================================

export const saveAuthData = (authData: AuthResponse): void => {
  localStorage.setItem('token', authData.token);
  localStorage.setItem('email', authData.email);
  localStorage.setItem('roles', JSON.stringify(authData.roles));
  localStorage.setItem('userId', authData.userId.toString());
  localStorage.setItem('hasParticipantProfile', authData.hasParticipantProfile.toString());
  localStorage.setItem('hasOrganizerProfile', authData.hasOrganizerProfile.toString());
};

export const getAuthData = (): AuthResponse | null => {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  const rolesStr = localStorage.getItem('roles');
  const userId = localStorage.getItem('userId');
  const hasParticipantProfile = localStorage.getItem('hasParticipantProfile');
  const hasOrganizerProfile = localStorage.getItem('hasOrganizerProfile');

  if (!token || !email || !userId) {
    return null;
  }

  const roles: Role[] = rolesStr ? JSON.parse(rolesStr) : [];

  return {
    token,
    email,
    roles,
    userId: parseInt(userId, 10),
    hasParticipantProfile: hasParticipantProfile === 'true',
    hasOrganizerProfile: hasOrganizerProfile === 'true',
  };
};

export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  localStorage.removeItem('roles');
  localStorage.removeItem('userId');
  localStorage.removeItem('hasParticipantProfile');
  localStorage.removeItem('hasOrganizerProfile');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

