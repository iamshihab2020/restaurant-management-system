import { apiClient } from '../client';

export interface ModifierOption {
  name: string;
  price: number;
}

export interface ModifierGroup {
  _id: string;
  name: string;
  options: ModifierOption[];
  isRequired: boolean;
  allowMultiple: boolean;
  minSelections?: number;
  maxSelections?: number;
}

export interface CreateModifierGroupDto {
  name: string;
  options: ModifierOption[];
  isRequired?: boolean;
  allowMultiple?: boolean;
  minSelections?: number;
  maxSelections?: number;
}

export const modifiersService = {
  getAll: () =>
    apiClient.get<ModifierGroup[]>('/modifiers'),

  getById: (id: string) =>
    apiClient.get<ModifierGroup>(`/modifiers/${id}`),

  create: (data: CreateModifierGroupDto) =>
    apiClient.post<ModifierGroup>('/modifiers', data),

  update: (id: string, data: Partial<CreateModifierGroupDto>) =>
    apiClient.patch<ModifierGroup>(`/modifiers/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/modifiers/${id}`),
};
