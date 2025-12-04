import apiClient from './client';

// ============================================
// Request/Response Types
// ============================================

export interface CreateOrderRequest {
  eventId: number;
  sessionId: number;
  ticketQuantities: Record<number, number>; // ticketCategoryId -> quantity
  currency: string;
  paymentMethod?: string;
}

export interface TicketCategoryDTO {
  ticketCategoryId: number;
  name: string;
  price: number;
  quantity: number;
  sessionId: number;
}

export interface TicketDTO {
  ticketId: number;
  qrCodeUrl: string;
  usedFlag: boolean;
  orderId: number;
  ticketCategory: TicketCategoryDTO;
  createdAt: string;
  updatedAt: string;
}

export interface EventDTO {
  eventId: number;
  title: string;
  generalIntroduction: string;
  eventStatus: string;
  organizerId: number;
  startDateTime: string;
  endDateTime: string;
  posterUrl?: string;
  location?: string;
}

export interface OrderDTO {
  orderId: number;
  orderStatus: string;
  currency: string;
  amountOfMoney: number;
  userId: number;
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  tickets: TicketDTO[];
  event?: EventDTO; // Included in My Tickets response
}

// ============================================
// Orders API Functions
// ============================================

export const ordersApi = {
  /**
   * Create a new order (requires ROLE_PARTICIPANT)
   */
  createOrder: async (request: CreateOrderRequest): Promise<OrderDTO> => {
    const response = await apiClient.post<OrderDTO>('/api/orders', request);
    return response.data;
  },

  /**
   * Get all orders for the authenticated user (requires ROLE_PARTICIPANT)
   */
  getMyOrders: async (): Promise<OrderDTO[]> => {
    const response = await apiClient.get<OrderDTO[]>('/api/orders/my-orders');
    return response.data;
  },
};
