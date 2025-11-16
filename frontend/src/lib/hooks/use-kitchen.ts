import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kitchenService } from '../api/services/kitchen.service';
import { toast } from 'sonner';

// Query hooks
export const useKitchenOrders = () => {
  return useQuery({
    queryKey: ['kitchen', 'orders'],
    queryFn: () => kitchenService.getOrders(),
    refetchInterval: 30000, // Refetch every 30 seconds as fallback
  });
};

export const usePendingOrders = () => {
  return useQuery({
    queryKey: ['kitchen', 'pending'],
    queryFn: () => kitchenService.getPending(),
  });
};

export const usePreparingOrders = () => {
  return useQuery({
    queryKey: ['kitchen', 'preparing'],
    queryFn: () => kitchenService.getPreparing(),
  });
};

// Mutation hooks
export const useStartOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => kitchenService.startOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Started preparing order');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start order');
    },
  });
};

export const useMarkItemReady = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      kitchenService.markItemReady(orderId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark item as ready');
    },
  });
};

export const useCompleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => kitchenService.completeOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order completed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete order');
    },
  });
};
