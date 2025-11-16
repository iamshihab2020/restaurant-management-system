"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Plus,
  ChefHat,
  QrCode,
  Calendar,
  Package,
  Users,
  FileText,
  Settings,
  Zap,
} from "lucide-react";

const actions = [
  {
    label: "New Order",
    href: "/dashboard/pos",
    icon: Plus,
    color: "bg-primary hover:bg-primary/90",
    textColor: "text-primary-foreground",
  },
  {
    label: "Kitchen View",
    href: "/dashboard/kitchen",
    icon: ChefHat,
    color: "bg-orange-500 hover:bg-orange-600",
    textColor: "text-white",
  },
  {
    label: "QR Menu",
    href: "/dashboard/menu",
    icon: QrCode,
    color: "bg-blue-500 hover:bg-blue-600",
    textColor: "text-white",
  },
  {
    label: "Reservation",
    href: "/dashboard/reservations",
    icon: Calendar,
    color: "bg-purple-500 hover:bg-purple-600",
    textColor: "text-white",
  },
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
    color: "bg-teal-500 hover:bg-teal-600",
    textColor: "text-white",
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: Users,
    color: "bg-pink-500 hover:bg-pink-600",
    textColor: "text-white",
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
    color: "bg-indigo-500 hover:bg-indigo-600",
    textColor: "text-white",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    color: "bg-gray-500 hover:bg-gray-600",
    textColor: "text-white",
  },
];

export function QuickActions() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
          <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Common tasks and shortcuts</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Button
              variant="outline"
              className={`w-full h-auto flex flex-col items-center gap-2 p-4 ${action.color} ${action.textColor} border-0 shadow-sm hover:shadow-md transition-all`}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  );
}
