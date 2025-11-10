"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  User,
  DollarSign,
  RefreshCw,
} from "lucide-react";

type ActivityType = "order" | "payment" | "inventory" | "reservation" | "alert";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  status: "success" | "warning" | "info" | "error";
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "order",
    title: "New Order #1247",
    description: "Table 5 - 3 items - $45.50",
    time: "2 min ago",
    status: "info",
  },
  {
    id: "2",
    type: "payment",
    title: "Payment Received",
    description: "Order #1245 - $87.20 (Card)",
    time: "5 min ago",
    status: "success",
  },
  {
    id: "3",
    type: "alert",
    title: "Urgent Order",
    description: "Order #1242 waiting for 22 min",
    time: "8 min ago",
    status: "warning",
  },
  {
    id: "4",
    type: "inventory",
    title: "Low Stock Alert",
    description: "Tomatoes - Only 5 kg remaining",
    time: "15 min ago",
    status: "error",
  },
  {
    id: "5",
    type: "reservation",
    title: "New Reservation",
    description: "John Doe - Table for 4 at 7:00 PM",
    time: "23 min ago",
    status: "info",
  },
  {
    id: "6",
    type: "order",
    title: "Order Completed",
    description: "Order #1240 - Table 8",
    time: "28 min ago",
    status: "success",
  },
];

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case "order":
      return Clock;
    case "payment":
      return DollarSign;
    case "inventory":
      return Package;
    case "reservation":
      return User;
    case "alert":
      return AlertCircle;
    default:
      return Bell;
  }
};

const getStatusColor = (status: Activity["status"]) => {
  switch (status) {
    case "success":
      return "text-green-600 dark:text-green-400";
    case "warning":
      return "text-yellow-600 dark:text-yellow-400";
    case "error":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-blue-600 dark:text-blue-400";
  }
};

const getStatusBadge = (status: Activity["status"]) => {
  switch (status) {
    case "success":
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Success</Badge>;
    case "warning":
      return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Warning</Badge>;
    case "error":
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Alert</Badge>;
    default:
      return <Badge variant="secondary">New</Badge>;
  }
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setActivities([...mockActivities]);
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      setActivities([...mockActivities]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-5 h-full min-h-[450px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Activity Feed</h3>
            <p className="text-sm text-muted-foreground">Real-time updates</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <ScrollArea className="h-[350px] pr-4">
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.status === "success" ? "bg-green-100 dark:bg-green-900/30" :
                  activity.status === "warning" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                  activity.status === "error" ? "bg-red-100 dark:bg-red-900/30" :
                  "bg-blue-100 dark:bg-blue-900/30"
                }`}>
                  <Icon className={`w-4 h-4 ${getStatusColor(activity.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live updates enabled
          </span>
        </p>
        <Button variant="link" size="sm" className="text-xs">
          View All Activity
        </Button>
      </div>
    </Card>
  );
}
