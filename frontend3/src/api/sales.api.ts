import apiClient from './client';

// ============================================
// Sales API Types (matches backend DTOs)
// ============================================

export interface CategorySalesDTO {
  categoryId: number;
  categoryName: string;
  price: number;
  totalCapacity: number;
  ticketsSold: number;
  ticketsAvailable: number;
  revenue: number;
  soldPercentage: number;
  checkedInCount: number;
}

export interface DailySalesDTO {
  saleDate: string; // ISO date string
  orderCount: number;
  ticketsSold: number;
  dailyRevenue: number;
}

export interface RecentOrderDTO {
  orderId: number;
  customerName: string;
  customerEmail: string;
  ticketCategory: string;
  quantity: number;
  amount: number;
  status: string;
  purchaseDate: string; // ISO datetime string
}

export interface EventSalesSummaryDTO {
  eventId: number;
  eventTitle: string;
  totalRevenue: number;
  totalTicketsSold: number;
  totalCapacity: number;
  capacityPercentage: number;
  categoryBreakdown: CategorySalesDTO[];
  dailySales: DailySalesDTO[];
  recentOrders: RecentOrderDTO[];
}

export interface EventRevenueDTO {
  eventId: number;
  eventTitle: string;
  eventStatus: string;
  startDateTime: string;
  totalOrders: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalCapacity: number;
  capacityPercentage: number;
}

export interface OrganizerRevenueReportDTO {
  organizerId: number;
  organizerName: string;
  totalEvents: number;
  totalTicketsSold: number;
  grandTotalRevenue: number;
  events: EventRevenueDTO[];
}

// ============================================
// Sales API Functions
// ============================================

export const salesApi = {
  /**
   * Get complete sales summary for an event
   * Calls multiple stored procedures: sp_GetEventSalesSummary, sp_GetEventDailySales, sp_GetEventRecentOrders
   * Calls function: fn_CalculateEventRevenue
   */
  getEventSalesSummary: async (eventId: number): Promise<EventSalesSummaryDTO> => {
    const response = await apiClient.get<EventSalesSummaryDTO>(`/api/sales/events/${eventId}/summary`);
    return response.data;
  },

  /**
   * Get event revenue using database function fn_CalculateEventRevenue
   */
  getEventRevenue: async (eventId: number): Promise<{ eventId: number; totalRevenue: number; message: string }> => {
    const response = await apiClient.get(`/api/sales/events/${eventId}/revenue`);
    return response.data;
  },

  /**
   * Get available tickets using database function fn_GetAvailableTickets
   */
  getAvailableTickets: async (categoryId: number): Promise<{ categoryId: number; availableTickets: number; message: string }> => {
    const response = await apiClient.get(`/api/sales/categories/${categoryId}/available`);
    return response.data;
  },

  /**
   * Get category sales breakdown using sp_GetEventSalesSummary stored procedure
   */
  getEventCategorySales: async (eventId: number, minTicketsSold: number = 0): Promise<{ eventId: number; categories: CategorySalesDTO[]; message: string }> => {
    const response = await apiClient.get(`/api/sales/events/${eventId}/categories`, {
      params: { minTicketsSold }
    });
    return response.data;
  },

  /**
   * Get daily sales using sp_GetEventDailySales stored procedure
   */
  getEventDailySales: async (eventId: number, days: number = 30): Promise<{ eventId: number; dailySales: DailySalesDTO[]; message: string }> => {
    const response = await apiClient.get(`/api/sales/events/${eventId}/daily`, {
      params: { days }
    });
    return response.data;
  },

  /**
   * Get recent orders using sp_GetEventRecentOrders stored procedure
   */
  getEventRecentOrders: async (eventId: number, limit: number = 10): Promise<{ eventId: number; recentOrders: RecentOrderDTO[]; message: string }> => {
    const response = await apiClient.get(`/api/sales/events/${eventId}/orders`, {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get organizer's revenue report using sp_GetOrganizerRevenueReport stored procedure
   */
  getOrganizerRevenueReport: async (startDate?: string, endDate?: string): Promise<OrganizerRevenueReportDTO> => {
    const response = await apiClient.get<OrganizerRevenueReportDTO>('/api/sales/organizer/report', {
      params: { startDate, endDate }
    });
    return response.data;
  },
};
