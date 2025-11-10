/**
 * Table Service
 * Backend-ready service layer for table operations
 * Currently uses mock data, easily replaceable with API calls
 */

import { Table, TableStatus } from "@/types";
import { mockTables } from "@/lib/mock-data/tables";

/**
 * Fetch all tables
 * Simulates API call with delay
 */
export async function fetchTables(): Promise<Table[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // TODO: Replace with actual API call
  // const response = await fetch('/api/tables');
  // return response.json();

  return mockTables;
}

/**
 * Fetch available tables only
 */
export async function fetchAvailableTables(): Promise<Table[]> {
  const tables = await fetchTables();
  return tables.filter((table) => table.status === "available");
}

/**
 * Fetch tables by status
 */
export async function fetchTablesByStatus(status: TableStatus): Promise<Table[]> {
  const tables = await fetchTables();
  return tables.filter((table) => table.status === status);
}

/**
 * Fetch single table by ID
 */
export async function fetchTableById(id: string): Promise<Table | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/tables/${id}`);
  // return response.json();

  return mockTables.find((table) => table.id === id) || null;
}

/**
 * Fetch tables by location
 */
export async function fetchTablesByLocation(location: string): Promise<Table[]> {
  const tables = await fetchTables();
  return tables.filter((table) => table.location === location);
}
