export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum";
  visitFrequency: number;
  lastVisit?: Date;
  dietaryPreferences?: string[];
  favoriteItems?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const mockCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Oak Street, Springfield, IL 62701",
    totalOrders: 45,
    totalSpent: 1850.50,
    loyaltyPoints: 1850,
    loyaltyTier: "gold",
    visitFrequency: 3.2,
    lastVisit: new Date("2025-11-08"),
    dietaryPreferences: ["vegetarian", "gluten-free"],
    favoriteItems: ["Margherita Pizza", "Caesar Salad"],
    notes: "Prefers outdoor seating",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2025-11-08"),
  },
  {
    id: "cust-2",
    name: "Michael Chen",
    email: "mchen@email.com",
    phone: "+1 (555) 234-5678",
    address: "456 Maple Avenue, Springfield, IL 62702",
    totalOrders: 78,
    totalSpent: 3420.75,
    loyaltyPoints: 3420,
    loyaltyTier: "platinum",
    visitFrequency: 5.8,
    lastVisit: new Date("2025-11-09"),
    dietaryPreferences: [],
    favoriteItems: ["Ribeye Steak", "Craft Beer"],
    notes: "Regular customer, always tips well",
    createdAt: new Date("2023-06-20"),
    updatedAt: new Date("2025-11-09"),
  },
  {
    id: "cust-3",
    name: "Emily Rodriguez",
    email: "emily.r@email.com",
    phone: "+1 (555) 345-6789",
    address: "789 Pine Road, Springfield, IL 62703",
    totalOrders: 23,
    totalSpent: 890.25,
    loyaltyPoints: 890,
    loyaltyTier: "silver",
    visitFrequency: 1.8,
    lastVisit: new Date("2025-11-05"),
    dietaryPreferences: ["vegan"],
    favoriteItems: ["Vegan Burger", "Green Smoothie"],
    createdAt: new Date("2024-08-10"),
    updatedAt: new Date("2025-11-05"),
  },
  {
    id: "cust-4",
    name: "David Brown",
    email: "dbrown@email.com",
    phone: "+1 (555) 456-7890",
    totalOrders: 12,
    totalSpent: 425.00,
    loyaltyPoints: 425,
    loyaltyTier: "bronze",
    visitFrequency: 0.9,
    lastVisit: new Date("2025-10-28"),
    dietaryPreferences: [],
    favoriteItems: ["Cheeseburger"],
    createdAt: new Date("2024-09-15"),
    updatedAt: new Date("2025-10-28"),
  },
  {
    id: "cust-5",
    name: "Jennifer Lee",
    email: "jlee@email.com",
    phone: "+1 (555) 567-8901",
    address: "321 Elm Street, Springfield, IL 62704",
    totalOrders: 56,
    totalSpent: 2340.80,
    loyaltyPoints: 2340,
    loyaltyTier: "gold",
    visitFrequency: 4.1,
    lastVisit: new Date("2025-11-07"),
    dietaryPreferences: ["gluten-free"],
    favoriteItems: ["Grilled Salmon", "Caesar Salad"],
    notes: "Allergic to nuts",
    createdAt: new Date("2023-11-05"),
    updatedAt: new Date("2025-11-07"),
  },
  {
    id: "cust-6",
    name: "Robert Taylor",
    email: "rtaylor@email.com",
    phone: "+1 (555) 678-9012",
    totalOrders: 34,
    totalSpent: 1450.60,
    loyaltyPoints: 1450,
    loyaltyTier: "silver",
    visitFrequency: 2.5,
    lastVisit: new Date("2025-11-06"),
    dietaryPreferences: [],
    favoriteItems: ["Pasta Carbonara", "Tiramisu"],
    createdAt: new Date("2024-03-22"),
    updatedAt: new Date("2025-11-06"),
  },
  {
    id: "cust-7",
    name: "Amanda White",
    email: "awhite@email.com",
    phone: "+1 (555) 789-0123",
    address: "654 Birch Lane, Springfield, IL 62705",
    totalOrders: 67,
    totalSpent: 2890.45,
    loyaltyPoints: 2890,
    loyaltyTier: "gold",
    visitFrequency: 4.8,
    lastVisit: new Date("2025-11-10"),
    dietaryPreferences: ["vegetarian"],
    favoriteItems: ["Veggie Pizza", "Chocolate Cake"],
    notes: "Birthday: March 15th",
    createdAt: new Date("2023-07-18"),
    updatedAt: new Date("2025-11-10"),
  },
  {
    id: "cust-8",
    name: "James Wilson",
    email: "jwilson@email.com",
    phone: "+1 (555) 890-1234",
    totalOrders: 8,
    totalSpent: 310.50,
    loyaltyPoints: 310,
    loyaltyTier: "bronze",
    visitFrequency: 0.6,
    lastVisit: new Date("2025-10-15"),
    dietaryPreferences: [],
    favoriteItems: ["Wings", "Beer"],
    createdAt: new Date("2025-02-10"),
    updatedAt: new Date("2025-10-15"),
  },
];

export function getCustomersByTier(tier: Customer["loyaltyTier"]): Customer[] {
  return mockCustomers.filter((customer) => customer.loyaltyTier === tier);
}

export function getTopCustomers(limit: number = 10): Customer[] {
  return [...mockCustomers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
}

export function getRecentCustomers(limit: number = 10): Customer[] {
  return [...mockCustomers]
    .filter((c) => c.lastVisit)
    .sort((a, b) => (b.lastVisit?.getTime() || 0) - (a.lastVisit?.getTime() || 0))
    .slice(0, limit);
}
