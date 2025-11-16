import { useQuery } from '@tanstack/react-query';
import { reportsService, type DateRange } from '../api/services/reports.service';

// Query hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: () => reportsService.getDashboardStats(),
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useSalesReport = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['reports', 'sales', dateRange],
    queryFn: () => reportsService.getSalesReport(dateRange),
  });
};

export const useRevenueReport = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['reports', 'revenue', dateRange],
    queryFn: () => reportsService.getRevenueReport(dateRange),
  });
};

export const usePopularItems = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['reports', 'popular-items', dateRange],
    queryFn: () => reportsService.getPopularItems(dateRange),
  });
};

export const useOrdersByStatus = () => {
  return useQuery({
    queryKey: ['reports', 'orders-by-status'],
    queryFn: () => reportsService.getOrdersByStatus(),
  });
};

export const usePaymentMethods = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['reports', 'payment-methods', dateRange],
    queryFn: () => reportsService.getPaymentMethods(dateRange),
  });
};

export const useTableUtilization = () => {
  return useQuery({
    queryKey: ['reports', 'table-utilization'],
    queryFn: () => reportsService.getTableUtilization(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useReservationsStats = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['reports', 'reservations-stats', dateRange],
    queryFn: () => reportsService.getReservationsStats(dateRange),
  });
};

export const useInventoryAlerts = () => {
  return useQuery({
    queryKey: ['reports', 'inventory-alerts'],
    queryFn: () => reportsService.getInventoryAlerts(),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};
