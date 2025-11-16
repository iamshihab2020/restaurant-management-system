import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsService, type CreateReservationDto, type AssignTableDto } from '../api/services/reservations.service';
import { toast } from 'sonner';

// Query hooks
export const useReservations = () => {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: () => reservationsService.getAll(),
  });
};

export const useTodaysReservations = () => {
  return useQuery({
    queryKey: ['reservations', 'today'],
    queryFn: () => reservationsService.getToday(),
  });
};

export const useUpcomingReservations = () => {
  return useQuery({
    queryKey: ['reservations', 'upcoming'],
    queryFn: () => reservationsService.getUpcoming(),
  });
};

export const useReservation = (id: string) => {
  return useQuery({
    queryKey: ['reservations', id],
    queryFn: () => reservationsService.getById(id),
    enabled: !!id,
  });
};

// Mutation hooks
export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationDto) => reservationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create reservation');
    },
  });
};

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateReservationDto> }) =>
      reservationsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update reservation');
    },
  });
};

export const useAssignTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignTableDto }) =>
      reservationsService.assignTable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign table');
    },
  });
};

export const useConfirmReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationsService.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation confirmed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm reservation');
    },
  });
};

export const useSeatReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationsService.seat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Guests seated - Order created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to seat guests');
    },
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Reservation cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel reservation');
    },
  });
};

export const useNoShowReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationsService.noShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Marked as no-show');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark as no-show');
    },
  });
};

export const useDeleteReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete reservation');
    },
  });
};
