import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesService, type CreateTableDto, type UpdateTableStatusDto } from '../api/services/tables.service';
import { toast } from 'sonner';

// Query hooks
export const useTables = () => {
  return useQuery({
    queryKey: ['tables'],
    queryFn: () => tablesService.getAll(),
  });
};

export const useAvailableTables = () => {
  return useQuery({
    queryKey: ['tables', 'available'],
    queryFn: () => tablesService.getAvailable(),
  });
};

export const useTable = (id: string) => {
  return useQuery({
    queryKey: ['tables', id],
    queryFn: () => tablesService.getById(id),
    enabled: !!id,
  });
};

export const useTableCurrentOrder = (id: string) => {
  return useQuery({
    queryKey: ['tables', id, 'order'],
    queryFn: () => tablesService.getCurrentOrder(id),
    enabled: !!id,
  });
};

// Mutation hooks
export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTableDto) => tablesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create table');
    },
  });
};

export const useUpdateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTableDto> }) =>
      tablesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update table');
    },
  });
};

export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTableStatusDto }) =>
      tablesService.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update table status');
    },
  });
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tablesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete table');
    },
  });
};
