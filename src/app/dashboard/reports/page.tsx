"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockOrders } from "@/lib/mock-data/orders";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Star,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";


// Date range presets
type DateRange = {
  from: Date;
  to: Date;
  label: string;
};

const DATE_RANGES: DateRange[] = [
  { from: startOfDay(new Date()), to: endOfDay(new Date()), label: "Today" },
  { from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)), label: "Yesterday" },
  { from: startOfDay(subDays(new Date(), 7)), to: endOfDay(new Date()), label: "Last 7 Days" },
  { from: startOfDay(subDays(new Date(), 30)), to: endOfDay(new Date()), label: "Last 30 Days" },
];

export default function ReportsPage() {
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(2); // Default to "Last 7 Days"
  const selectedRange = DATE_RANGES[selectedRangeIndex];

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        order.status === "completed" &&
        isWithinInterval(orderDate, { start: selectedRange.from, end: selectedRange.to })
      );
    });
  }, [selectedRange]);

  // Calculate previous period for comparison
  const previousPeriodOrders = useMemo(() => {
    const daysDiff = Math.ceil(
      (selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24)
    );
    const previousFrom = subDays(selectedRange.from, daysDiff);
    const previousTo = selectedRange.from;

    return mockOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        order.status === "completed" &&
        isWithinInterval(orderDate, { start: previousFrom, end: previousTo })
      );
    });
  }, [selectedRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const currentRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.total, 0);
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const currentOrders = filteredOrders.length;
    const previousOrders = previousPeriodOrders.length;
    const ordersChange = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;

    const currentAvgOrder = currentOrders > 0 ? currentRevenue / currentOrders : 0;
    const previousAvgOrder = previousOrders > 0 ? previousRevenue / previousOrders : 0;
    const avgOrderChange = previousAvgOrder > 0 ? ((currentAvgOrder - previousAvgOrder) / previousAvgOrder) * 100 : 0;

    return {
      revenue: currentRevenue,
      revenueChange,
      orders: currentOrders,
      ordersChange,
      avgOrder: currentAvgOrder,
      avgOrderChange,
    };
  }, [filteredOrders, previousPeriodOrders]);

  // Revenue trend data (daily aggregation)
  const revenueTrendData = useMemo(() => {
    const dailyData: Record<string, number> = {};

    filteredOrders.forEach((order) => {
      const date = format(new Date(order.createdAt), "MMM dd");
      dailyData[date] = (dailyData[date] || 0) + order.total;
    });

    return Object.entries(dailyData)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredOrders]);

  // Orders by hour data
  const ordersByHourData = useMemo(() => {
    const hourlyData: Record<number, number> = {};

    filteredOrders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });

    return Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      orders: hourlyData[hour] || 0,
    }));
  }, [filteredOrders]);

  const paymentMethodsData = useMemo(() => {
    const methods: Record<string, number> = {};

    filteredOrders.forEach((order) => {
      const method = parseInt(order.id.slice(-1)) % 3;
      const methodName = method === 0 ? "Cash" : method === 1 ? "Credit Card" : "Mobile Payment";
      methods[methodName] = (methods[methodName] || 0) + 1;
    });

    const total = filteredOrders.length || 1;
    return Object.entries(methods).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / total) * 100).toFixed(1),
    }));
  }, [filteredOrders]);

  // Peak hours data
  const peakHoursData = useMemo(() => {
    const periods = {
      "Breakfast (6-11 AM)": 0,
      "Lunch (12-2 PM)": 0,
      "Dinner (6-9 PM)": 0,
      Other: 0,
    };

    filteredOrders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      if (hour >= 6 && hour < 12) periods["Breakfast (6-11 AM)"]++;
      else if (hour >= 12 && hour < 15) periods["Lunch (12-2 PM)"]++;
      else if (hour >= 18 && hour < 22) periods["Dinner (6-9 PM)"]++;
      else periods.Other++;
    });

    const total = filteredOrders.length || 1;
    return Object.entries(periods).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / total) * 100).toFixed(1),
    }));
  }, [filteredOrders]);

  // Popular items
  const popularItems = useMemo(() => {
    const itemCounts: Record<string, { item: any; count: number; revenue: number }> = {};

    filteredOrders.forEach((order) => {
      order.items.forEach((orderItem) => {
        if (!itemCounts[orderItem.menuItemId]) {
          itemCounts[orderItem.menuItemId] = {
            item: orderItem.menuItem,
            count: 0,
            revenue: 0,
          };
        }
        itemCounts[orderItem.menuItemId].count += orderItem.quantity;
        itemCounts[orderItem.menuItemId].revenue += orderItem.price * orderItem.quantity;
      });
    });

    return Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredOrders]);

  // Trend indicator component
  const TrendIndicator = ({ value, inverse = false }: { value: number; inverse?: boolean }) => {
    const isPositive = inverse ? value < 0 : value > 0;
    const isNeutral = Math.abs(value) < 0.1;

    if (isNeutral) {
      return (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Minus className="w-3 h-3" />
          No change
        </p>
      );
    }

    return (
      <p
        className={`text-xs mt-1 flex items-center gap-1 ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <ArrowUpRight className="w-3 h-3" />
        ) : (
          <ArrowDownRight className="w-3 h-3" />
        )}
        {Math.abs(value).toFixed(1)}% vs previous period
      </p>
    );
  };

  // Chart colors
  const COLORS = {
    primary: "#1DB954",
    secondary: "#1ed760",
    tertiary: "#191414",
    payment: ["#1DB954", "#1ed760", "#535353"],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Sales performance and insights for {selectedRange.label.toLowerCase()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-5 h-5 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium mr-4">Time Period:</span>
            <div className="flex gap-2">
              {DATE_RANGES.map((range, index) => (
                <Button
                  key={range.label}
                  variant={selectedRangeIndex === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRangeIndex(index)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">${metrics.revenue.toFixed(2)}</p>
                <TrendIndicator value={metrics.revenueChange} />
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold text-foreground">{metrics.orders}</p>
                <TrendIndicator value={metrics.ordersChange} />
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-3xl font-bold text-foreground">${metrics.avgOrder.toFixed(2)}</p>
                <TrendIndicator value={metrics.avgOrderChange} />
              </div>
              <div className="p-3 bg-purple-500/10 rounded-full">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customer Rating</p>
                <p className="text-3xl font-bold text-foreground">4.8</p>
                <p className="text-xs text-muted-foreground mt-1">Based on 24 reviews</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueTrendData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.primary}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Orders by Time & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Orders by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersByHourData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis
                  dataKey="hour"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [value, "Orders"]}
                />
                <Bar dataKey="orders" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.payment[index % COLORS.payment.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularItems.length > 0 ? (
              popularItems.map((item, index) => (
                <div
                  key={item.item.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.count} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-foreground">${item.revenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">revenue</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No sales data available for this period
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Hours Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={peakHoursData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={150}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value} orders (${props.payload.percentage}%)`,
                  "Orders",
                ]}
              />
              <Bar dataKey="value" fill={COLORS.secondary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
