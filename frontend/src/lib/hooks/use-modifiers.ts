import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modifiersService, type CreateModifierGroupDto } from '../api/services/modifiers.service';
import { toast } from 'sonner';

// Query hooks
export const useModifierGroups = () => {
  return useQuery({
    queryKey: ['modifiers'],
    queryFn: () => modifiersService.getAll(),
  });
};

export const useModifierGroup = (id: string) => {
  return useQuery({
    queryKey: ['modifiers', id],
    queryFn: () => modifiersService.getById(id),
    enabled: !!id,
  });
};

// Mutation hooks
export const useCreateModifierGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateModifierGroupDto) => modifiersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifiers'] });
      toast.success('Modifier group created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create modifier group');
    },
  });
};

export const useUpdateModifierGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateModifierGroupDto> }) =>
      modifiersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifiers'] });
      toast.success('Modifier group updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update modifier group');
    },
  });
};

export const useDeleteModifierGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => modifiersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifiers'] });
      toast.success('Modifier group deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete modifier group');
    },
  });
};
