import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService, type CreateMenuItemDto, type UpdateMenuItemDto } from '../api/services/menu.service';
import { toast } from 'sonner';

// Query hooks
export const useMenuItems = (category?: string) => {
  return useQuery({
    queryKey: ['menu', category],
    queryFn: () => menuService.getAll(category),
  });
};

export const useMenuItem = (id: string) => {
  return useQuery({
    queryKey: ['menu', id],
    queryFn: () => menuService.getById(id),
    enabled: !!id,
  });
};

// Mutation hooks
export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMenuItemDto) => menuService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Menu item created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create menu item');
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuItemDto }) =>
      menuService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Menu item updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update menu item');
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => menuService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Menu item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete menu item');
    },
  });
};
