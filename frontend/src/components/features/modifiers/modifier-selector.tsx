import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ModifierGroup, ModifierOption } from "@/lib/mock-data/modifiers";
import { Check } from "lucide-react";

interface ModifierSelectorProps {
  modifierGroups: ModifierGroup[];
  selectedModifiers: Record<string, string[]>;
  onModifierChange: (groupId: string, optionIds: string[]) => void;
}

export function ModifierSelector({
  modifierGroups,
  selectedModifiers,
  onModifierChange,
}: ModifierSelectorProps) {
  const handleSingleSelection = (groupId: string, optionId: string) => {
    onModifierChange(groupId, [optionId]);
  };

  const handleMultipleSelection = (groupId: string, optionId: string, maxSelections?: number) => {
    const currentSelections = selectedModifiers[groupId] || [];
    let newSelections: string[];

    if (currentSelections.includes(optionId)) {
      newSelections = currentSelections.filter((id) => id !== optionId);
    } else {
      if (maxSelections && currentSelections.length >= maxSelections) {
        return;
      }
      newSelections = [...currentSelections, optionId];
    }

    onModifierChange(groupId, newSelections);
  };

  const isSelected = (groupId: string, optionId: string) => {
    return selectedModifiers[groupId]?.includes(optionId) || false;
  };

  const getAdditionalPrice = () => {
    let total = 0;
    modifierGroups.forEach((group) => {
      const selections = selectedModifiers[group.id] || [];
      selections.forEach((optionId) => {
        const option = group.options.find((opt) => opt.id === optionId);
        if (option) {
          total += option.price;
        }
      });
    });
    return total;
  };

  return (
    <div className="space-y-4">
      {modifierGroups.map((group) => (
        <Card key={group.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {group.name}
                {group.required && <span className="text-destructive ml-1">*</span>}
              </CardTitle>
              <div className="flex gap-2">
                {group.type === "multiple" && group.maxSelections && (
                  <Badge variant="outline" className="text-xs">
                    Max {group.maxSelections}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {group.type}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {group.options.map((option) => {
                const selected = isSelected(group.id, option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      group.type === "single"
                        ? handleSingleSelection(group.id, option.id)
                        : handleMultipleSelection(group.id, option.id, group.maxSelections)
                    }
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{option.name}</p>
                          {option.isDefault && (
                            <p className="text-xs text-muted-foreground">Default</p>
                          )}
                        </div>
                      </div>
                      {option.price > 0 && (
                        <Badge variant="outline" className="text-primary">
                          +${option.price.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {getAdditionalPrice() > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">Additional Charges</p>
              <p className="text-xl font-bold text-primary">
                +${getAdditionalPrice().toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
