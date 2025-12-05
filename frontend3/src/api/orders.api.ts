import apiClient from './client';

// ============================================
// Request/Response Types
// ============================================

export interface CreateOrderRequest {
  eventId: number;
  sessionId: number;
  ticketQuantities: Record<number, number>; // ticketCategoryId -> quantity
  currency: string;
  paymentMethodId: number; // Payment method ID (e.g., 6 for MB Bank)
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

export interface PaymentMethodDTO {
  methodId: number;
  chargedFee: number;
  feePayer: string;
  type: string; // "BANK" or "E_WALLET"
  name: string; // Bank name or E-wallet name
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
  qrCodeUrl?: string; // Payment QR code URL
  paymentDescription?: string; // Payment description (e.g., "ORDER123")
  paymentMethod?: PaymentMethodDTO; // Payment method info
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

  /**
   * Confirm payment for an order (requires ROLE_PARTICIPANT)
   */
  confirmPayment: async (orderId: number): Promise<OrderDTO> => {
    const response = await apiClient.post<OrderDTO>(`/api/orders/${orderId}/confirm-payment`);
    return response.data;
  },
};
