import { User } from "@/types";

/**
 * Mock user data for development and testing
 * Password for all users: "password123"
 */
export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "John Admin",
    email: "admin@restaurant.com",
    role: "admin",
    phone: "+1234567890",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "user-2",
    name: "Sarah Manager",
    email: "manager@restaurant.com",
    role: "manager",
    phone: "+1234567891",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "user-3",
    name: "Mike Waiter",
    email: "waiter@restaurant.com",
    role: "waiter",
    phone: "+1234567892",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    isActive: true,
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
  {
    id: "user-4",
    name: "Emma Kitchen",
    email: "kitchen@restaurant.com",
    role: "kitchen",
    phone: "+1234567893",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    isActive: true,
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
  {
    id: "user-5",
    name: "David Cashier",
    email: "cashier@restaurant.com",
    role: "cashier",
    phone: "+1234567894",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    isActive: true,
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
  {
    id: "user-6",
    name: "Lisa Waiter",
    email: "waiter2@restaurant.com",
    role: "waiter",
    phone: "+1234567895",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    isActive: true,
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
  },
];

/**
 * Find user by email
 */
export function findUserByEmail(email: string): User | undefined {
  return mockUsers.find((user) => user.email === email);
}

/**
 * Find user by ID
 */
export function findUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id);
}

/**
 * Get users by role
 */
export function getUsersByRole(role: User["role"]): User[] {
  return mockUsers.filter((user) => user.role === role);
}
