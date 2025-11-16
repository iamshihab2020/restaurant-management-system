import { Reservation } from "@/types";
import { mockTables } from "./tables";
import { mockUsers } from "./users";

/**
 * Mock reservations data
 */
export const mockReservations: Reservation[] = [
  {
    id: "res-1",
    customerName: "John Smith",
    customerPhone: "+1234567890",
    customerEmail: "john.smith@email.com",
    partySize: 4,
    reservationDate: new Date("2025-11-01"),
    reservationTime: "19:00",
    tableId: "table-6",
    table: mockTables.find((t) => t.id === "table-6"),
    status: "confirmed",
    specialRequests: "Window seat if possible",
    createdBy: "user-3",
    createdAt: new Date("2025-10-30T10:00:00"),
    updatedAt: new Date("2025-10-30T10:00:00"),
  },
  {
    id: "res-2",
    customerName: "Sarah Johnson",
    customerPhone: "+1234567891",
    customerEmail: "sarah.j@email.com",
    partySize: 2,
    reservationDate: new Date("2025-11-01"),
    reservationTime: "20:30",
    status: "pending",
    specialRequests: "Anniversary celebration",
    createdBy: "user-3",
    createdAt: new Date("2025-11-01T09:00:00"),
    updatedAt: new Date("2025-11-01T09:00:00"),
  },
  {
    id: "res-3",
    customerName: "Michael Brown",
    customerPhone: "+1234567892",
    partySize: 6,
    reservationDate: new Date("2025-11-02"),
    reservationTime: "18:30",
    tableId: "table-5",
    table: mockTables.find((t) => t.id === "table-5"),
    status: "confirmed",
    createdBy: "user-6",
    createdAt: new Date("2025-10-29T14:00:00"),
    updatedAt: new Date("2025-10-29T14:00:00"),
  },
  {
    id: "res-4",
    customerName: "Emily Davis",
    customerPhone: "+1234567893",
    customerEmail: "emily.davis@email.com",
    partySize: 8,
    reservationDate: new Date("2025-11-03"),
    reservationTime: "19:30",
    tableId: "table-9",
    table: mockTables.find((t) => t.id === "table-9"),
    status: "confirmed",
    specialRequests: "Birthday celebration, need cake service",
    createdBy: "user-3",
    createdAt: new Date("2025-10-28T11:00:00"),
    updatedAt: new Date("2025-10-28T11:00:00"),
  },
  {
    id: "res-5",
    customerName: "Robert Wilson",
    customerPhone: "+1234567894",
    partySize: 3,
    reservationDate: new Date("2025-10-31"),
    reservationTime: "19:00",
    status: "no_show",
    createdBy: "user-6",
    createdAt: new Date("2025-10-30T16:00:00"),
    updatedAt: new Date("2025-10-31T19:30:00"),
  },
];

/**
 * Get reservations by status
 */
export function getReservationsByStatus(status: Reservation["status"]): Reservation[] {
  return mockReservations.filter((res) => res.status === status);
}

/**
 * Get reservations by date
 */
export function getReservationsByDate(date: Date): Reservation[] {
  return mockReservations.filter((res) => {
    const resDate = new Date(res.reservationDate);
    return (
      resDate.getFullYear() === date.getFullYear() &&
      resDate.getMonth() === date.getMonth() &&
      resDate.getDate() === date.getDate()
    );
  });
}

/**
 * Get today's reservations
 */
export function getTodaysReservations(): Reservation[] {
  return getReservationsByDate(new Date());
}
