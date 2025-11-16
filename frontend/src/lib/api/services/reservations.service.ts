import { apiClient } from '../client';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SEATED = 'seated',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no-show',
}

export interface Reservation {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerId?: string;
  date: Date;
  time: string;
  partySize: number;
  tableId?: {
    _id: string;
    tableNumber: string;
  };
  status: ReservationStatus;
  specialRequests?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReservationDto {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
}

export interface AssignTableDto {
  tableId: string;
}

export const reservationsService = {
  getAll: () =>
    apiClient.get<Reservation[]>('/reservations'),

  getToday: () =>
    apiClient.get<Reservation[]>('/reservations/today'),

  getUpcoming: () =>
    apiClient.get<Reservation[]>('/reservations/upcoming'),

  getById: (id: string) =>
    apiClient.get<Reservation>(`/reservations/${id}`),

  create: (data: CreateReservationDto) =>
    apiClient.post<Reservation>('/reservations', data),

  update: (id: string, data: Partial<CreateReservationDto>) =>
    apiClient.patch<Reservation>(`/reservations/${id}`, data),

  assignTable: (id: string, data: AssignTableDto) =>
    apiClient.patch<Reservation>(`/reservations/${id}/assign-table`, data),

  confirm: (id: string) =>
    apiClient.patch<Reservation>(`/reservations/${id}/confirm`, {}),

  seat: (id: string) =>
    apiClient.patch<any>(`/reservations/${id}/seat`, {}),

  cancel: (id: string) =>
    apiClient.patch<Reservation>(`/reservations/${id}/cancel`, {}),

  noShow: (id: string) =>
    apiClient.patch<Reservation>(`/reservations/${id}/no-show`, {}),

  delete: (id: string) =>
    apiClient.delete<void>(`/reservations/${id}`),
};
