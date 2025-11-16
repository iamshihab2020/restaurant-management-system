"use client";

import { DashboardGrid, Widget } from "@/components/dashboard/dashboard-grid";
import { RevenueChart } from "@/components/dashboard/widgets/revenue-chart";
import { OrderAnalytics } from "@/components/dashboard/widgets/order-analytics";
import { PerformanceMetrics } from "@/components/dashboard/widgets/performance-metrics";
import { QuickActions } from "@/components/dashboard/widgets/quick-actions";
import { ActivityFeed } from "@/components/dashboard/widgets/activity-feed";
import { useDashboardLayout } from "@/lib/hooks/use-dashboard-layout";

const defaultWidgets: Widget[] = [
  {
    id: "quick-actions",
    component: <QuickActions />,
    gridClass: "md:col-span-2 lg:col-span-4",
  },
  {
    id: "revenue-chart",
    component: <RevenueChart />,
    gridClass: "md:col-span-2 lg:col-span-2",
  },
  {
    id: "order-analytics",
    component: <OrderAnalytics />,
    gridClass: "md:col-span-2 lg:col-span-2",
  },
  {
    id: "performance-metrics",
    component: <PerformanceMetrics />,
    gridClass: "md:col-span-2 lg:col-span-2",
  },
  {
    id: "activity-feed",
    component: <ActivityFeed />,
    gridClass: "md:col-span-2 lg:col-span-2",
  },
];

export default function DashboardPage() {
  const { widgets, isLoaded, handleLayoutChange } = useDashboardLayout(defaultWidgets);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardGrid widgets={widgets} onLayoutChange={handleLayoutChange} />
  );
}
