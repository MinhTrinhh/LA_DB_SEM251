import apiClient from './client';

// ============================================
// Edit Event API Types
// ============================================

export interface SessionEditDTO {
  sessionId: number;
  eventId: number;
  startDateTime: string;
  endDateTime: string;
  maxCapacity: number;
  sessionType: string;
  venueName: string;
  venueAddress: string;
  meetingUrl: string;
  platformName: string;
}

export interface TicketCategoryEditDTO {
  categoryId: number;
  sessionId: number;
  categoryName: string;
  price: number;
  maximumSlot: number;
  soldCount: number;
  availableCount: number;
  soldPercentage: number;
}

export interface EventEditDetailsDTO {
  eventId: number;
  title: string;
  description: string;
  posterUrl: string;
  status: string;
  startDateTime: string;
  endDateTime: string;
  totalRevenue: number;
  totalTicketsSold: number;
  sessions: SessionEditDTO[];
  ticketCategories: TicketCategoryEditDTO[];
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  posterUrl?: string;
}

export interface UpdateSessionRequest {
  sessionId: number;
  eventId: number;
  startDateTime?: string;
  endDateTime?: string;
  venueName?: string;
  venueAddress?: string;
  meetingUrl?: string;
  platformName?: string;
}

export interface UpdateTicketCategoryRequest {
  categoryId: number;
  categoryName?: string;
  price?: number;
  maximumSlot?: number;
}

export interface AddTicketCategoryRequest {
  sessionId: number;
  eventId: number;
  categoryName: string;
  price: number;
  maximumSlot: number;
  startDateTime?: string;
  endDateTime?: string;
}

// ============================================
// Edit Event API Functions
// ============================================

export const editEventApi = {
  /**
   * Get event details for editing (requires ROLE_ORGANIZER)
   * Uses stored procedure: sp_GetEventForEdit
   */
  getEventForEdit: async (eventId: number): Promise<EventEditDetailsDTO> => {
    const response = await apiClient.get<EventEditDetailsDTO>(`/api/events/edit/${eventId}`);
    return response.data;
  },

  /**
   * Update event basic information (requires ROLE_ORGANIZER)
   * Uses stored procedure: sp_UpdateEventBasicInfo
   */
  updateEventBasicInfo: async (eventId: number, request: UpdateEventRequest): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(`/api/events/edit/${eventId}/basic-info`, request);
    return response.data;
  },

  /**
   * Update session details (requires ROLE_ORGANIZER)
   * Uses stored procedure: sp_UpdateSession
   */
  updateSession: async (request: UpdateSessionRequest): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>('/api/events/edit/session', request);
    return response.data;
  },

  /**
   * Update ticket category (requires ROLE_ORGANIZER)
   * Uses stored procedure: sp_UpdateTicketCategory
   */
  updateTicketCategory: async (request: UpdateTicketCategoryRequest): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>('/api/events/edit/ticket-category', request);
    return response.data;
  },

  /**
   * Add new ticket category (requires ROLE_ORGANIZER)
   * Uses stored procedure: sp_AddTicketCategory
   */
  addTicketCategory: async (request: AddTicketCategoryRequest): Promise<{ message: string; categoryId: number }> => {
    const response = await apiClient.post<{ message: string; categoryId: number }>('/api/events/edit/ticket-category', request);
    return response.data;
  },

  /**
   * Delete ticket category (requires ROLE_ORGANIZER)
   * Uses stored procedure: sp_DeleteTicketCategory
   */
  deleteTicketCategory: async (categoryId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/events/edit/ticket-category/${categoryId}`);
    return response.data;
  },
};
