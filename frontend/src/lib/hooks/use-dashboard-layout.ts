"use client";

import { useState, useEffect } from "react";
import { Widget } from "@/components/dashboard/dashboard-grid";

const STORAGE_KEY = "dashboard-layout";

export function useDashboardLayout(defaultWidgets: Widget[]) {
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load layout from localStorage on mount
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem(STORAGE_KEY);
      if (savedLayout) {
        const savedIds = JSON.parse(savedLayout) as string[];

        // Reorder widgets based on saved order
        const orderedWidgets = savedIds
          .map((id) => defaultWidgets.find((w) => w.id === id))
          .filter((w): w is Widget => w !== undefined);

        // Add any new widgets that weren't in saved layout
        const newWidgets = defaultWidgets.filter(
          (w) => !savedIds.includes(w.id)
        );

        setWidgets([...orderedWidgets, ...newWidgets]);
      }
    } catch (error) {
      console.error("Failed to load dashboard layout:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save layout to localStorage when it changes
  const handleLayoutChange = (newWidgets: Widget[]) => {
    setWidgets(newWidgets);
    try {
      const widgetIds = newWidgets.map((w) => w.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgetIds));
    } catch (error) {
      console.error("Failed to save dashboard layout:", error);
    }
  };

  // Reset layout to default
  const resetLayout = () => {
    setWidgets(defaultWidgets);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to reset dashboard layout:", error);
    }
  };

  return {
    widgets,
    isLoaded,
    handleLayoutChange,
    resetLayout,
  };
}
