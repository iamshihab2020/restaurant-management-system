/**
 * Menu Service
 * Backend-ready service layer for menu operations
 * Currently uses mock data, easily replaceable with API calls
 */

import { MenuItem, MenuCategory } from "@/types";
import { mockMenuItems } from "@/lib/mock-data/menu-items";

/**
 * Fetch all menu items
 * Simulates API call with delay
 */
export async function fetchMenuItems(): Promise<MenuItem[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // TODO: Replace with actual API call
  // const response = await fetch('/api/menu-items');
  // return response.json();

  return mockMenuItems;
}

/**
 * Fetch available menu items only
 */
export async function fetchAvailableMenuItems(): Promise<MenuItem[]> {
  const items = await fetchMenuItems();
  return items.filter((item) => item.isAvailable);
}

/**
 * Fetch menu items by category
 */
export async function fetchMenuItemsByCategory(category: MenuCategory): Promise<MenuItem[]> {
  const items = await fetchMenuItems();
  return items.filter((item) => item.category === category);
}

/**
 * Fetch single menu item by ID
 */
export async function fetchMenuItemById(id: string): Promise<MenuItem | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/menu-items/${id}`);
  // return response.json();

  return mockMenuItems.find((item) => item.id === id) || null;
}

/**
 * Search menu items by query
 */
export async function searchMenuItems(query: string): Promise<MenuItem[]> {
  const items = await fetchMenuItems();
  const lowerQuery = query.toLowerCase();

  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.ingredients?.some((ing) => ing.toLowerCase().includes(lowerQuery))
  );
}
