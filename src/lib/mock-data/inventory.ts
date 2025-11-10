/**
 * Mock inventory data for the restaurant
 * Tracks stock levels of ingredients and supplies
 */

export interface InventoryItem {
  id: string;
  name: string;
  category: "ingredient" | "beverage" | "supply";
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  cost: number;
  supplier?: string;
  lastRestocked?: Date;
  expiryDate?: Date;
}

export const mockInventory: InventoryItem[] = [
  // Ingredients
  {
    id: "inv-1",
    name: "Chicken Breast",
    category: "ingredient",
    quantity: 25,
    unit: "kg",
    lowStockThreshold: 10,
    cost: 8.50,
    supplier: "Fresh Farms Co.",
    lastRestocked: new Date("2025-10-30"),
    expiryDate: new Date("2025-11-05"),
  },
  {
    id: "inv-2",
    name: "Salmon Fillet",
    category: "ingredient",
    quantity: 8,
    unit: "kg",
    lowStockThreshold: 5,
    cost: 18.00,
    supplier: "Ocean Fresh",
    lastRestocked: new Date("2025-10-31"),
    expiryDate: new Date("2025-11-03"),
  },
  {
    id: "inv-3",
    name: "Ribeye Steak",
    category: "ingredient",
    quantity: 12,
    unit: "kg",
    lowStockThreshold: 8,
    cost: 22.00,
    supplier: "Prime Meats Ltd.",
    lastRestocked: new Date("2025-10-29"),
    expiryDate: new Date("2025-11-04"),
  },
  {
    id: "inv-4",
    name: "Fresh Mozzarella",
    category: "ingredient",
    quantity: 5,
    unit: "kg",
    lowStockThreshold: 3,
    cost: 12.00,
    supplier: "Italian Imports",
    lastRestocked: new Date("2025-10-31"),
    expiryDate: new Date("2025-11-07"),
  },
  {
    id: "inv-5",
    name: "Tomatoes",
    category: "ingredient",
    quantity: 30,
    unit: "kg",
    lowStockThreshold: 15,
    cost: 3.50,
    supplier: "Fresh Farms Co.",
    lastRestocked: new Date("2025-11-01"),
    expiryDate: new Date("2025-11-06"),
  },
  {
    id: "inv-6",
    name: "Lettuce",
    category: "ingredient",
    quantity: 20,
    unit: "heads",
    lowStockThreshold: 10,
    cost: 1.50,
    supplier: "Fresh Farms Co.",
    lastRestocked: new Date("2025-11-01"),
    expiryDate: new Date("2025-11-05"),
  },
  {
    id: "inv-7",
    name: "Pasta (Fettuccine)",
    category: "ingredient",
    quantity: 15,
    unit: "kg",
    lowStockThreshold: 10,
    cost: 4.00,
    supplier: "Italian Imports",
    lastRestocked: new Date("2025-10-25"),
  },
  {
    id: "inv-8",
    name: "Olive Oil",
    category: "ingredient",
    quantity: 8,
    unit: "liters",
    lowStockThreshold: 5,
    cost: 15.00,
    supplier: "Italian Imports",
    lastRestocked: new Date("2025-10-20"),
  },
  {
    id: "inv-9",
    name: "Flour",
    category: "ingredient",
    quantity: 40,
    unit: "kg",
    lowStockThreshold: 20,
    cost: 2.50,
    supplier: "Bulk Supplies Inc.",
    lastRestocked: new Date("2025-10-28"),
  },
  {
    id: "inv-10",
    name: "Sugar",
    category: "ingredient",
    quantity: 25,
    unit: "kg",
    lowStockThreshold: 15,
    cost: 1.80,
    supplier: "Bulk Supplies Inc.",
    lastRestocked: new Date("2025-10-28"),
  },

  // Beverages
  {
    id: "inv-11",
    name: "Orange Juice",
    category: "beverage",
    quantity: 40,
    unit: "liters",
    lowStockThreshold: 20,
    cost: 3.00,
    supplier: "Fresh Juice Co.",
    lastRestocked: new Date("2025-10-31"),
    expiryDate: new Date("2025-11-07"),
  },
  {
    id: "inv-12",
    name: "Coffee Beans",
    category: "beverage",
    quantity: 12,
    unit: "kg",
    lowStockThreshold: 5,
    cost: 25.00,
    supplier: "Premium Coffee Roasters",
    lastRestocked: new Date("2025-10-25"),
  },
  {
    id: "inv-13",
    name: "Milk",
    category: "beverage",
    quantity: 60,
    unit: "liters",
    lowStockThreshold: 30,
    cost: 2.00,
    supplier: "Dairy Fresh",
    lastRestocked: new Date("2025-11-01"),
    expiryDate: new Date("2025-11-05"),
  },
  {
    id: "inv-14",
    name: "Craft Beer (Assorted)",
    category: "beverage",
    quantity: 120,
    unit: "bottles",
    lowStockThreshold: 50,
    cost: 3.50,
    supplier: "Local Brewery",
    lastRestocked: new Date("2025-10-30"),
  },
  {
    id: "inv-15",
    name: "Red Wine",
    category: "beverage",
    quantity: 36,
    unit: "bottles",
    lowStockThreshold: 20,
    cost: 12.00,
    supplier: "Wine Merchants",
    lastRestocked: new Date("2025-10-28"),
  },

  // Supplies
  {
    id: "inv-16",
    name: "Paper Napkins",
    category: "supply",
    quantity: 2000,
    unit: "pieces",
    lowStockThreshold: 500,
    cost: 0.02,
    supplier: "Restaurant Supplies Co.",
    lastRestocked: new Date("2025-10-20"),
  },
  {
    id: "inv-17",
    name: "Plastic Gloves",
    category: "supply",
    quantity: 800,
    unit: "pairs",
    lowStockThreshold: 300,
    cost: 0.15,
    supplier: "Restaurant Supplies Co.",
    lastRestocked: new Date("2025-10-20"),
  },
  {
    id: "inv-18",
    name: "Aluminum Foil",
    category: "supply",
    quantity: 15,
    unit: "rolls",
    lowStockThreshold: 5,
    cost: 8.00,
    supplier: "Restaurant Supplies Co.",
    lastRestocked: new Date("2025-10-22"),
  },
  {
    id: "inv-19",
    name: "Cleaning Supplies",
    category: "supply",
    quantity: 25,
    unit: "units",
    lowStockThreshold: 10,
    cost: 5.00,
    supplier: "Cleaning Solutions Ltd.",
    lastRestocked: new Date("2025-10-25"),
  },
  {
    id: "inv-20",
    name: "Dishwasher Detergent",
    category: "supply",
    quantity: 8,
    unit: "bottles",
    lowStockThreshold: 3,
    cost: 12.00,
    supplier: "Cleaning Solutions Ltd.",
    lastRestocked: new Date("2025-10-27"),
  },
];

/**
 * Get low stock items
 */
export function getLowStockItems(): InventoryItem[] {
  return mockInventory.filter((item) => item.quantity <= item.lowStockThreshold);
}

/**
 * Get items by category
 */
export function getItemsByCategory(category: InventoryItem["category"]): InventoryItem[] {
  return mockInventory.filter((item) => item.category === category);
}

/**
 * Get items expiring soon (within 3 days)
 */
export function getExpiringSoonItems(): InventoryItem[] {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  return mockInventory.filter(
    (item) => item.expiryDate && item.expiryDate <= threeDaysFromNow
  );
}
