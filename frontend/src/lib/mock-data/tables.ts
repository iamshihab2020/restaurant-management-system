import { Table } from "@/types";

/**
 * Mock table data for the restaurant
 * Includes various table sizes and locations
 */
export const mockTables: Table[] = [
  {
    id: "table-1",
    tableNumber: 1,
    capacity: 2,
    status: "available",
    location: "Indoor",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "table-2",
    tableNumber: 2,
    capacity: 2,
    status: "available",
    location: "Indoor",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "table-3",
    tableNumber: 3,
    capacity: 4,
    status: "occupied",
    location: "Indoor",
    currentOrderId: "order-1",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2025-11-01T12:30:00"),
  },
  {
    id: "table-4",
    tableNumber: 4,
    capacity: 4,
    status: "available",
    location: "Indoor",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "table-5",
    tableNumber: 5,
    capacity: 6,
    status: "occupied",
    location: "Indoor",
    currentOrderId: "order-2",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2025-11-01T13:00:00"),
  },
  {
    id: "table-6",
    tableNumber: 6,
    capacity: 6,
    status: "reserved",
    location: "VIP",
    reservedFor: "Johnson Party",
    reservedAt: new Date("2025-11-01T19:00:00"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2025-11-01T10:00:00"),
  },
  {
    id: "table-7",
    tableNumber: 7,
    capacity: 2,
    status: "available",
    location: "Outdoor",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "table-8",
    tableNumber: 8,
    capacity: 4,
    status: "cleaning",
    location: "Outdoor",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2025-11-01T13:45:00"),
  },
  {
    id: "table-9",
    tableNumber: 9,
    capacity: 8,
    status: "available",
    location: "VIP",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "table-10",
    tableNumber: 10,
    capacity: 4,
    status: "available",
    location: "Outdoor",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

/**
 * Get table by ID
 */
export function getTableById(id: string): Table | undefined {
  return mockTables.find((table) => table.id === id);
}

/**
 * Get tables by status
 */
export function getTablesByStatus(status: Table["status"]): Table[] {
  return mockTables.filter((table) => table.status === status);
}

/**
 * Get tables by location
 */
export function getTablesByLocation(location: string): Table[] {
  return mockTables.filter((table) => table.location === location);
}

/**
 * Get available tables with minimum capacity
 */
export function getAvailableTablesByCapacity(minCapacity: number): Table[] {
  return mockTables.filter(
    (table) => table.status === "available" && table.capacity >= minCapacity
  );
}
