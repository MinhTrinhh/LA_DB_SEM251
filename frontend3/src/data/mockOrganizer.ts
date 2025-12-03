export interface OrderData {
  id: string;
  customerName: string;
  customerEmail: string;
  eventId: string;
  ticketCategory: string;
  quantity: number;
  amount: number;
  purchaseDate: string;
  status: 'completed' | 'pending' | 'refunded';
}

export interface SalesData {
  eventId: string;
  totalRevenue: number;
  ticketsSold: number;
  totalCapacity: number;
  categoryBreakdown: Array<{
    name: string;
    sold: number;
    total: number;
    revenue: number;
  }>;
  recentOrders: OrderData[];
  dailySales: Array<{
    date: string;
    revenue: number;
    tickets: number;
  }>;
}

export interface OrganizerStats {
  totalEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  growthPercentage: number;
}

export const mockOrganizerStats: OrganizerStats = {
  totalEvents: 12,
  totalRevenue: 48750,
  totalAttendees: 8456,
  growthPercentage: 23.5
};

export const mockOrders: OrderData[] = [
  {
    id: "ORD001",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    eventId: "1",
    ticketCategory: "VIP Pass",
    quantity: 2,
    amount: 598,
    purchaseDate: "2025-06-15T14:30:00",
    status: "completed"
  },
  {
    id: "ORD002",
    customerName: "Michael Chen",
    customerEmail: "m.chen@email.com",
    eventId: "1",
    ticketCategory: "General Admission",
    quantity: 4,
    amount: 596,
    purchaseDate: "2025-06-15T10:15:00",
    status: "completed"
  },
  {
    id: "ORD003",
    customerName: "Emily Rodriguez",
    customerEmail: "emily.r@email.com",
    eventId: "1",
    ticketCategory: "Premium Experience",
    quantity: 1,
    amount: 499,
    purchaseDate: "2025-06-14T16:45:00",
    status: "completed"
  },
  {
    id: "ORD004",
    customerName: "David Kim",
    customerEmail: "d.kim@email.com",
    eventId: "1",
    ticketCategory: "General Admission",
    quantity: 2,
    amount: 298,
    purchaseDate: "2025-06-14T09:20:00",
    status: "completed"
  },
  {
    id: "ORD005",
    customerName: "Lisa Anderson",
    customerEmail: "lisa.a@email.com",
    eventId: "1",
    ticketCategory: "VIP Pass",
    quantity: 1,
    amount: 299,
    purchaseDate: "2025-06-13T18:00:00",
    status: "pending"
  }
];

export const mockSalesData: Record<string, SalesData> = {
  "1": {
    eventId: "1",
    totalRevenue: 87450,
    ticketsSold: 5000,
    totalCapacity: 10000,
    categoryBreakdown: [
      {
        name: "General Admission",
        sold: 4000,
        total: 8000,
        revenue: 59600
      },
      {
        name: "VIP Pass",
        sold: 800,
        total: 1500,
        revenue: 23920
      },
      {
        name: "Premium Experience",
        sold: 200,
        total: 500,
        revenue: 9980
      }
    ],
    recentOrders: mockOrders,
    dailySales: [
      { date: "2025-06-10", revenue: 8950, tickets: 450 },
      { date: "2025-06-11", revenue: 12400, tickets: 620 },
      { date: "2025-06-12", revenue: 10200, tickets: 510 },
      { date: "2025-06-13", revenue: 15800, tickets: 790 },
      { date: "2025-06-14", revenue: 18600, tickets: 930 },
      { date: "2025-06-15", revenue: 21500, tickets: 1075 }
    ]
  },
  "2": {
    eventId: "2",
    totalRevenue: 134700,
    ticketsSold: 1800,
    totalCapacity: 2500,
    categoryBreakdown: [
      {
        name: "Standard Pass",
        sold: 1200,
        total: 1500,
        revenue: 35880
      },
      {
        name: "Professional Pass",
        sold: 450,
        total: 700,
        revenue: 22455
      },
      {
        name: "Enterprise Pass",
        sold: 150,
        total: 300,
        revenue: 13485
      }
    ],
    recentOrders: [],
    dailySales: [
      { date: "2025-06-10", revenue: 18950, tickets: 250 },
      { date: "2025-06-11", revenue: 22400, tickets: 310 },
      { date: "2025-06-12", revenue: 25200, tickets: 380 },
      { date: "2025-06-13", revenue: 20800, tickets: 290 },
      { date: "2025-06-14", revenue: 23600, tickets: 325 },
      { date: "2025-06-15", revenue: 23750, tickets: 245 }
    ]
  }
};

export interface CheckInRecord {
  ticketId: string;
  customerName: string;
  ticketCategory: string;
  quantity: number;
  checkInTime: string;
  status: 'valid' | 'used' | 'invalid';
}

export const mockCheckInRecords: CheckInRecord[] = [
  {
    ticketId: "TKT-001-2547",
    customerName: "Sarah Johnson",
    ticketCategory: "VIP Pass",
    quantity: 2,
    checkInTime: "2025-07-15T14:35:00",
    status: "valid"
  },
  {
    ticketId: "TKT-001-2548",
    customerName: "Michael Chen",
    ticketCategory: "General Admission",
    quantity: 4,
    checkInTime: "2025-07-15T14:42:00",
    status: "valid"
  },
  {
    ticketId: "TKT-001-2549",
    customerName: "Emily Rodriguez",
    ticketCategory: "Premium Experience",
    quantity: 1,
    checkInTime: "2025-07-15T15:10:00",
    status: "valid"
  }
];
