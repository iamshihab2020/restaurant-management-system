"use client";

import { Card } from "@/components/ui/card";
import { ShoppingCart, Clock } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const orderStatusData = [
  { name: "Pending", value: 5, color: "hsl(var(--muted-foreground))" },
  { name: "Preparing", value: 8, color: "hsl(30, 100%, 50%)" },
  { name: "Ready", value: 3, color: "hsl(141, 73%, 42%)" },
  { name: "Served", value: 12, color: "hsl(262, 83%, 58%)" },
];

const peakHoursData = [
  { hour: "9am", orders: 8 },
  { hour: "12pm", orders: 25 },
  { hour: "3pm", orders: 12 },
  { hour: "6pm", orders: 32 },
  { hour: "9pm", orders: 18 },
];

export function OrderAnalytics() {
  const totalOrders = orderStatusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-5 h-full min-h-[450px] flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Order Analytics</h3>
          <p className="text-sm text-muted-foreground">Distribution and trends</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Order Status Distribution */}
        <div>
          <h4 className="text-sm font-medium mb-4">Status Distribution</h4>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Peak Hours Today
          </h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="hour"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <Bar
                dataKey="orders"
                fill="hsl(141, 73%, 42%)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Today</p>
            <p className="text-2xl font-bold mt-1">{totalOrders}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Time</p>
            <p className="text-2xl font-bold mt-1">18m</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Completion</p>
            <p className="text-2xl font-bold mt-1">94%</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
