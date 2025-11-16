"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardStats } from "@/lib/hooks/use-reports";

type TimeRange = "today" | "week" | "month";

const dataByRange = {
  today: [
    { time: "6am", revenue: 120 },
    { time: "9am", revenue: 450 },
    { time: "12pm", revenue: 890 },
    { time: "3pm", revenue: 1240 },
    { time: "6pm", revenue: 1680 },
    { time: "9pm", revenue: 1850 },
    { time: "Now", revenue: 1923 },
  ],
  week: [
    { time: "Mon", revenue: 1200 },
    { time: "Tue", revenue: 1450 },
    { time: "Wed", revenue: 1680 },
    { time: "Thu", revenue: 1890 },
    { time: "Fri", revenue: 2340 },
    { time: "Sat", revenue: 2680 },
    { time: "Sun", revenue: 1923 },
  ],
  month: [
    { time: "Week 1", revenue: 8500 },
    { time: "Week 2", revenue: 9200 },
    { time: "Week 3", revenue: 10500 },
    { time: "Week 4", revenue: 11800 },
  ],
};

export function RevenueChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("today");
  const { data: stats, isLoading } = useDashboardStats();
  const data = dataByRange[timeRange];

  // Use real revenue for today, fallback to mock data
  const currentRevenue = timeRange === "today" && stats?.todayRevenue
    ? stats.todayRevenue
    : data[data.length - 1].revenue;
  const previousRevenue = data[data.length - 2].revenue;
  const trend = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  const isPositive = trend >= 0;

  if (isLoading) {
    return (
      <Card className="p-5 h-full min-h-[450px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading revenue data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 h-full min-h-[450px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Revenue Overview</h3>
            <p className="text-sm text-muted-foreground">Track your earnings</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("today")}
          >
            Today
          </Button>
          <Button
            variant={timeRange === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("week")}
          >
            Week
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
          >
            Month
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-end gap-3">
          <p className="text-3xl font-bold">${currentRevenue.toLocaleString()}</p>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isPositive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {timeRange === "today" && "Since yesterday"}
          {timeRange === "week" && "Since last week"}
          {timeRange === "month" && "Since last month"}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(141, 73%, 42%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(141, 73%, 42%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="time"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value: number) => [`$${value}`, "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(141, 73%, 42%)"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
