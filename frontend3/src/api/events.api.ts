import apiClient from './client';
import { BackendEvent, BackendSession } from '@/types/api.types';

// ============================================
// Request/Response Types
// ============================================

export interface TicketCategoryRequest {
  categoryName: string;
  price: number;
  quantity: number;
  agreementTerms?: string[];
}

export interface SessionRequest {
  startDateTime: string; // ISO 8601 format
  endDateTime: string;   // ISO 8601 format
  venueName?: string;    // For offline sessions
  venueAddress?: string; // For offline sessions
  meetingUrl?: string;   // For online sessions
  platformName?: string; // For online sessions
  ticketCategories: TicketCategoryRequest[];
}

export interface CreateEventRequest {
  title: string;
  description: string;
  posterUrl?: string;
  venueName: string;
  venueAddress: string;
  regulations?: string[];
  sessions: SessionRequest[];
}

export interface CreateEventResponse {
  eventId: number;
  title: string;
  message: string;
}

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

  /**
   * Create a new event (requires ROLE_ORGANIZER)
   */
  createEvent: async (request: CreateEventRequest): Promise<CreateEventResponse> => {
    const response = await apiClient.post<CreateEventResponse>('/api/events', request);
    return response.data;
  },

  /**
   * Get all events for the authenticated organizer
   */
  getMyEvents: async (): Promise<BackendEvent[]> => {
    const response = await apiClient.get<BackendEvent[]>('/api/events/my-events');
    return response.data;
  },

  /**
   * Get draft events for the authenticated organizer
   */
  getDraftEvents: async (): Promise<BackendEvent[]> => {
    const response = await apiClient.get<BackendEvent[]>('/api/events/my-events/drafts');
    return response.data;
  },

  /**
   * Publish a draft event (requires ROLE_ORGANIZER)
   */
  publishEvent: async (eventId: number): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(`/api/events/${eventId}/publish`);
    return response.data;
  },
};
