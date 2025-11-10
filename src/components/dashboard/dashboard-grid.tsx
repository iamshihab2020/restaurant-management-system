"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GripVertical, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Widget {
  id: string;
  component: React.ReactNode;
  gridClass?: string;
}

interface DashboardGridProps {
  widgets: Widget[];
  onLayoutChange?: (widgets: Widget[]) => void;
}

function SortableWidget({ id, children, isCustomizing }: { id: string; children: React.ReactNode; isCustomizing: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {isCustomizing && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 z-10 cursor-grab active:cursor-grabbing bg-background/80 backdrop-blur-sm rounded-lg p-2 border border-border shadow-sm hover:bg-accent transition-colors"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      <div className={isCustomizing ? "ring-2 ring-primary/20 rounded-lg" : ""}>
        {children}
      </div>
    </div>
  );
}

export function DashboardGrid({ widgets: initialWidgets, onLayoutChange }: DashboardGridProps) {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        onLayoutChange?.(newItems);
        return newItems;
      });
    }
  };

  const toggleCustomize = () => {
    setIsCustomizing(!isCustomizing);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            {isCustomizing ? "Drag widgets to rearrange" : "Welcome back! Here's your overview"}
          </p>
        </div>
        <Button
          variant={isCustomizing ? "default" : "outline"}
          onClick={toggleCustomize}
          className="gap-2"
        >
          <Settings2 className="w-4 h-4" />
          {isCustomizing ? "Done" : "Customize"}
          {isCustomizing && (
            <Badge variant="secondary" className="ml-1">
              Editing
            </Badge>
          )}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className={widget.gridClass || ""}
              >
                <SortableWidget id={widget.id} isCustomizing={isCustomizing}>
                  {widget.component}
                </SortableWidget>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
