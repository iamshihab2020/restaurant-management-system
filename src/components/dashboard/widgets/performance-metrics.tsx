"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, ChefHat, Clock, Users, TrendingUp } from "lucide-react";

const metrics = [
  {
    label: "Kitchen Efficiency",
    value: 87,
    icon: ChefHat,
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "Orders completed on time",
    trend: "+5%",
    trendUp: true,
  },
  {
    label: "Average Wait Time",
    value: 18,
    max: 30,
    percentage: (18 / 30) * 100,
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    description: "Current avg: 18 min (Target: <20 min)",
    trend: "-3 min",
    trendUp: true,
  },
  {
    label: "Table Turnover Rate",
    value: 3.2,
    max: 5,
    percentage: (3.2 / 5) * 100,
    icon: Users,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    description: "Tables per service period",
    trend: "+0.4",
    trendUp: true,
  },
  {
    label: "Staff Productivity",
    value: 92,
    icon: Activity,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    description: "Overall efficiency score",
    trend: "+2%",
    trendUp: true,
  },
];

export function PerformanceMetrics() {
  return (
    <Card className="p-5 h-full min-h-[450px] flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Performance Metrics</h3>
          <p className="text-sm text-muted-foreground">Real-time efficiency tracking</p>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{metric.label}</p>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={metric.trendUp ? "default" : "destructive"}
                  className="gap-1"
                >
                  <TrendingUp
                    className={`w-3 h-3 ${!metric.trendUp && "rotate-180"}`}
                  />
                  {metric.trend}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Progress
                value={metric.percentage || metric.value}
                className="h-2"
              />
              <span className="text-sm font-semibold min-w-[3rem] text-right">
                {metric.percentage
                  ? `${metric.value}${typeof metric.value === 'number' && metric.value < 10 ? ' min' : ''}`
                  : `${metric.value}%`}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Overall Score</p>
            <p className="text-2xl font-bold text-primary mt-1">A+</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Ranking</p>
            <p className="text-2xl font-bold text-primary mt-1">Top 5%</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
