import apiClient from './client';
import {
  AuthResponse,
  CompleteParticipantProfileRequest,
  CompleteOrganizerProfileRequest,
  ParticipantProfile,
  OrganizerProfile,
} from '@/types/api.types';

// ============================================
// Profile API Functions
// ============================================

export const profilesApi = {
  /**
   * Get current user's participant profile
   */
  getParticipantProfile: async (): Promise<ParticipantProfile> => {
    const response = await apiClient.get<ParticipantProfile>('/api/users/me/profiles/participant');
    return response.data;
  },

  /**
   * Complete participant profile (POST - fills empty profile created during registration)
   * Returns new JWT token (roles unchanged, but profile now has data)
   */
  completeParticipantProfile: async (
    data: CompleteParticipantProfileRequest
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/profiles/participant', data);
    return response.data;
  },

  /**
   * Complete organizer profile (POST - creates organizer profile + adds ROLE_ORGANIZER)
   * Returns new JWT token with ROLE_ORGANIZER added
   */
  completeOrganizerProfile: async (
    data: CompleteOrganizerProfileRequest
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/profiles/organizer', data);
    return response.data;
  },

  /**
   * Update participant profile (PUT - updates existing profile)
   * Returns updated participant profile entity
   */
  updateParticipantProfile: async (
    data: CompleteParticipantProfileRequest
  ): Promise<ParticipantProfile> => {
    const response = await apiClient.put<ParticipantProfile>('/api/profiles/participant', data);
    return response.data;
  },

  /**
   * Update organizer profile (PUT - updates existing profile)
   * Returns updated organizer profile entity
   */
  updateOrganizerProfile: async (
    data: CompleteOrganizerProfileRequest
  ): Promise<OrganizerProfile> => {
    const response = await apiClient.put<OrganizerProfile>('/api/profiles/organizer', data);
    return response.data;
  },
};

