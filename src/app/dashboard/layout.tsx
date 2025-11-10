"use client";

import { ProtectedRoute } from "@/components/features/auth/protected-route";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Rows,
  ShoppingCart,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChefHat,
  Package,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";

/**
 * Dashboard Layout
 * Provides consistent navigation and layout for all dashboard pages
 * Includes sidebar with role-based menu items
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // TODO: Re-enable authentication after development
    // <ProtectedRoute>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    // </ProtectedRoute>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user: authUser, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // TODO: Remove mock user after re-enabling authentication
  const user = authUser || {
    id: "dev-user",
    name: "Dev User",
    email: "dev@restaurant.com",
    role: "admin" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapse state to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  /**
   * Navigation items based on user role
   */
  const getNavItems = () => {
    const baseItems = [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "manager", "waiter", "kitchen", "cashier"],
      },
    ];

    const roleSpecificItems = [
      {
        label: "POS",
        href: "/dashboard/pos",
        icon: DollarSign,
        roles: ["admin", "manager", "waiter", "cashier"],
      },
      {
        label: "Tables",
        href: "/dashboard/tables",
        icon: Rows,
        roles: ["admin", "manager", "waiter"],
      },
      {
        label: "Menu",
        href: "/dashboard/menu",
        icon: UtensilsCrossed,
        roles: ["admin", "manager"],
      },
      {
        label: "Orders",
        href: "/dashboard/orders",
        icon: ShoppingCart,
        roles: ["admin", "manager", "waiter"],
      },
      {
        label: "Kitchen Display",
        href: "/dashboard/kitchen",
        icon: ChefHat,
        roles: ["admin", "manager", "kitchen"],
      },
      {
        label: "Payments",
        href: "/dashboard/payments",
        icon: CreditCard,
        roles: ["admin", "manager", "cashier"],
      },
      {
        label: "Reservations",
        href: "/dashboard/reservations",
        icon: Calendar,
        roles: ["admin", "manager", "waiter"],
      },
      {
        label: "Inventory",
        href: "/dashboard/inventory",
        icon: Package,
        roles: ["admin", "manager"],
      },
      {
        label: "Customers",
        href: "/dashboard/customers",
        icon: Heart,
        roles: ["admin", "manager", "waiter"],
      },
      {
        label: "Users",
        href: "/dashboard/users",
        icon: Users,
        roles: ["admin"],
      },
      {
        label: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
        roles: ["admin", "manager"],
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        roles: ["admin", "manager"],
      },
    ];

    // Filter items based on user role
    const allItems = [...baseItems, ...roleSpecificItems];
    return allItems.filter((item) => user && item.roles.includes(user.role));
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-foreground transition-opacity duration-300">
              Restaurant POS
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 py-4 border-b border-border">
            <div className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "space-x-3"
            )}>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold"
                title={isCollapsed ? user.name : undefined}
              >
                {user.name.charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 transition-opacity duration-300">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <TooltipProvider delayDuration={0}>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md transition-all duration-200",
                      isCollapsed ? "justify-center" : "space-x-3",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium transition-opacity duration-300">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );

                return (
                  <li key={item.href}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      linkContent
                    )}
                  </li>
                );
              })}
            </ul>
          </TooltipProvider>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-border">
          <TooltipProvider delayDuration={0}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center px-3 py-2 w-full text-destructive rounded-md hover:bg-destructive/10 transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-2 w-full text-destructive rounded-md hover:bg-destructive/10 transition-all duration-200"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium transition-opacity duration-300">
                  Logout
                </span>
              </button>
            )}
          </TooltipProvider>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn(
        "min-h-screen transition-all duration-300 ease-in-out",
        isCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Welcome back, {user?.name.split(" ")[0]}!
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
