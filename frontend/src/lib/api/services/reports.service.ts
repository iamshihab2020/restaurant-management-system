import { apiClient } from '../client';

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  todayTips: number;
  activeOrders: number;
  totalTables: number;
  occupiedTables: number;
  tableOccupancyRate: number;
  todayReservations: number;
  lowStockItems: number;
}

export interface SalesData {
  _id: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface RevenueData {
  _id: {
    date: string;
    method: string;
  };
  totalAmount: number;
  totalTips: number;
  count: number;
}

export interface PopularItem {
  _id: string;
  itemName: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

export interface OrdersByStatus {
  _id: string;
  count: number;
  totalValue: number;
}

export interface PaymentMethodBreakdown {
  _id: string;
  totalAmount: number;
  totalTips: number;
  count: number;
  avgAmount: number;
}

export interface TableUtilization {
  totalTables: number;
  statusBreakdown: Record<string, number>;
  capacityUtilization: {
    totalCapacity: number;
    occupiedTables: number;
  };
}

export interface ReservationStats {
  _id: string;
  count: number;
  totalGuests: number;
}

export interface InventoryAlerts {
  outOfStock: any[];
  criticalStock: any[];
  lowStock: any[];
  totalAlerts: number;
}

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export const reportsService = {
  getDashboardStats: () =>
    apiClient.get<DashboardStats>('/reports/dashboard'),

  getSalesReport: (dateRange?: DateRange) => {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<SalesData[]>(`/reports/sales${query}`);
  },

  getRevenueReport: (dateRange?: DateRange) => {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<RevenueData[]>(`/reports/revenue${query}`);
  },

  getPopularItems: (dateRange?: DateRange) => {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<PopularItem[]>(`/reports/popular-items${query}`);
  },

  getOrdersByStatus: () =>
    apiClient.get<OrdersByStatus[]>('/reports/orders-by-status'),

  getPaymentMethods: (dateRange?: DateRange) => {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<PaymentMethodBreakdown[]>(`/reports/payment-methods${query}`);
  },

  getTableUtilization: () =>
    apiClient.get<TableUtilization>('/reports/table-utilization'),

  getReservationsStats: (dateRange?: DateRange) => {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<ReservationStats[]>(`/reports/reservations-stats${query}`);
  },

  getInventoryAlerts: () =>
    apiClient.get<InventoryAlerts>('/reports/inventory-alerts'),
};
