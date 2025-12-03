import apiClient from './client';
import { BackendEvent, BackendSession } from '@/types/api.types';

// ============================================
// Events API Functions
// ============================================

export const eventsApi = {
  /**
   * Get all public events
   */
  getAllPublicEvents: async (): Promise<BackendEvent[]> => {
    const response = await apiClient.get<BackendEvent[]>('/api/events/public');
    return response.data;
  },

  /**
   * Get event by ID
   */
  getEventById: async (eventId: number): Promise<BackendEvent> => {
    const response = await apiClient.get<BackendEvent>(`/api/events/public/${eventId}`);
    return response.data;
  },

  /**
   * Get sessions for an event
   */
  getEventSessions: async (eventId: number): Promise<BackendSession[]> => {
    const response = await apiClient.get<BackendSession[]>(
      `/api/events/public/${eventId}/sessions`
    );
    return response.data;
  },
};

