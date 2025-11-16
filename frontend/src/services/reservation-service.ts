/**
 * Reservation Service
 * Backend-ready service layer for reservation operations
 * Currently uses localStorage, easily replaceable with API calls
 */

import { Reservation, ReservationStatus, CreateReservationInput } from "@/types";
import { mockReservations } from "@/lib/mock-data/reservations";

const STORAGE_KEY = "reservations";

/**
 * Initialize storage with mock data if empty
 */
function initializeStorage(): void {
  if (typeof window === "undefined") return;

  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockReservations));
  }
}

/**
 * Get reservations from storage
 */
function getStoredReservations(): Reservation[] {
  if (typeof window === "undefined") return mockReservations;

  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return mockReservations;

  const parsed = JSON.parse(stored);
  // Convert date strings back to Date objects
  return parsed.map((reservation: any) => ({
    ...reservation,
    reservationDate: new Date(reservation.reservationDate),
    createdAt: new Date(reservation.createdAt),
    updatedAt: new Date(reservation.updatedAt),
  }));
}

/**
 * Save reservations to storage
 */
function saveReservations(reservations: Reservation[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

/**
 * Fetch all reservations
 * Simulates API call with delay
 */
export async function fetchReservations(): Promise<Reservation[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // TODO: Replace with actual API call
  // const response = await fetch('/api/reservations');
  // return response.json();

  return getStoredReservations();
}

/**
 * Fetch reservations by status
 */
export async function fetchReservationsByStatus(
  status: ReservationStatus
): Promise<Reservation[]> {
  const reservations = await fetchReservations();
  return reservations.filter((reservation) => reservation.status === status);
}

/**
 * Fetch reservations by date range
 */
export async function fetchReservationsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Reservation[]> {
  const reservations = await fetchReservations();
  return reservations.filter((reservation) => {
    const reservationDate = new Date(reservation.reservationDate);
    return reservationDate >= startDate && reservationDate <= endDate;
  });
}

/**
 * Fetch today's reservations
 */
export async function fetchTodaysReservations(): Promise<Reservation[]> {
  const reservations = await fetchReservations();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return reservations.filter((reservation) => {
    const reservationDate = new Date(reservation.reservationDate);
    reservationDate.setHours(0, 0, 0, 0);
    return reservationDate.getTime() === today.getTime();
  });
}

/**
 * Fetch single reservation by ID
 */
export async function fetchReservationById(
  id: string
): Promise<Reservation | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/reservations/${id}`);
  // return response.json();

  const reservations = getStoredReservations();
  return reservations.find((reservation) => reservation.id === id) || null;
}

/**
 * Create a new reservation
 */
export async function createReservation(
  input: CreateReservationInput,
  createdBy: string
): Promise<Reservation> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Replace with actual API call
  // const response = await fetch('/api/reservations', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ...input, createdBy }),
  // });
  // return response.json();

  const reservations = getStoredReservations();

  const newReservation: Reservation = {
    id: `reservation-${Date.now()}`,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail,
    partySize: input.partySize,
    reservationDate: input.reservationDate,
    reservationTime: input.reservationTime,
    tableId: input.tableId,
    status: "pending",
    specialRequests: input.specialRequests,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  reservations.push(newReservation);
  saveReservations(reservations);

  return newReservation;
}

/**
 * Update reservation status
 */
export async function updateReservationStatus(
  id: string,
  newStatus: ReservationStatus
): Promise<Reservation> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/reservations/${id}/status`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ status: newStatus }),
  // });
  // return response.json();

  const reservations = getStoredReservations();
  const index = reservations.findIndex((r) => r.id === id);

  if (index === -1) {
    throw new Error("Reservation not found");
  }

  reservations[index] = {
    ...reservations[index],
    status: newStatus,
    updatedAt: new Date(),
  };

  saveReservations(reservations);
  return reservations[index];
}

/**
 * Update reservation details
 */
export async function updateReservation(
  id: string,
  updates: Partial<Omit<Reservation, "id" | "createdAt" | "createdBy">>
): Promise<Reservation> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/reservations/${id}`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(updates),
  // });
  // return response.json();

  const reservations = getStoredReservations();
  const index = reservations.findIndex((r) => r.id === id);

  if (index === -1) {
    throw new Error("Reservation not found");
  }

  reservations[index] = {
    ...reservations[index],
    ...updates,
    updatedAt: new Date(),
  };

  saveReservations(reservations);
  return reservations[index];
}

/**
 * Assign table to reservation
 */
export async function assignTableToReservation(
  reservationId: string,
  tableId: string
): Promise<Reservation> {
  return updateReservation(reservationId, { tableId });
}

/**
 * Delete reservation
 */
export async function deleteReservation(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // TODO: Replace with actual API call
  // await fetch(`/api/reservations/${id}`, { method: 'DELETE' });

  const reservations = getStoredReservations();
  const filtered = reservations.filter((r) => r.id !== id);
  saveReservations(filtered);
}

/**
 * Search reservations by customer name or phone
 */
export async function searchReservations(query: string): Promise<Reservation[]> {
  const reservations = await fetchReservations();
  const lowerQuery = query.toLowerCase();

  return reservations.filter(
    (reservation) =>
      reservation.customerName.toLowerCase().includes(lowerQuery) ||
      reservation.customerPhone.includes(query)
  );
}
