import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService, type CreatePaymentDto } from '../api/services/payments.service';
import { toast } from 'sonner';

// Query hooks
export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsService.getAll(),
  });
};

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentsService.getById(id),
    enabled: !!id,
  });
};

export const usePaymentsByOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['payments', 'order', orderId],
    queryFn: () => paymentsService.getByOrder(orderId),
    enabled: !!orderId,
  });
};

export const useDailyTotal = () => {
  return useQuery({
    queryKey: ['payments', 'daily-total'],
    queryFn: () => paymentsService.getDailyTotal(),
  });
};

// Mutation hooks
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentDto) => paymentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Payment processed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process payment');
    },
  });
};

export const useRefundPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      paymentsService.refund(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Payment refunded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to refund payment');
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete payment');
    },
  });
};
