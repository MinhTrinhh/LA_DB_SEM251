import apiClient from './client';
import { ParticipantProfile, OrganizerProfile } from '@/types/api.types';

// ============================================
// User Profile API Functions
// ============================================


export const usersApi = {
  /**
   * Get participant profile
   */
  getParticipantProfile: async (): Promise<ParticipantProfile> => {
    const response = await apiClient.get<ParticipantProfile>('/api/users/me/profiles/participant');
    return response.data;
  },

  /**
   * Get organizer profile
   */
  getOrganizerProfile: async (): Promise<OrganizerProfile> => {
    const response = await apiClient.get<OrganizerProfile>('/api/users/me/profiles/organizer');
    return response.data;
  },
};

