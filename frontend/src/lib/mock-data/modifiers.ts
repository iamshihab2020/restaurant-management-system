export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string;
  type: "single" | "multiple";
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
  options: ModifierOption[];
  applicableCategories: string[];
}

export const mockModifierGroups: ModifierGroup[] = [
  {
    id: "mod-group-1",
    name: "Cooking Temperature",
    type: "single",
    required: true,
    options: [
      { id: "opt-1-1", name: "Rare", price: 0, isDefault: false },
      { id: "opt-1-2", name: "Medium Rare", price: 0, isDefault: true },
      { id: "opt-1-3", name: "Medium", price: 0, isDefault: false },
      { id: "opt-1-4", name: "Medium Well", price: 0, isDefault: false },
      { id: "opt-1-5", name: "Well Done", price: 0, isDefault: false },
    ],
    applicableCategories: ["main_course"],
  },
  {
    id: "mod-group-2",
    name: "Size",
    type: "single",
    required: true,
    options: [
      { id: "opt-2-1", name: "Small", price: 0, isDefault: true },
      { id: "opt-2-2", name: "Medium", price: 2.50, isDefault: false },
      { id: "opt-2-3", name: "Large", price: 4.50, isDefault: false },
      { id: "opt-2-4", name: "Extra Large", price: 6.50, isDefault: false },
    ],
    applicableCategories: ["beverage", "appetizer"],
  },
  {
    id: "mod-group-3",
    name: "Toppings",
    type: "multiple",
    required: false,
    maxSelections: 5,
    options: [
      { id: "opt-3-1", name: "Extra Cheese", price: 1.50 },
      { id: "opt-3-2", name: "Bacon", price: 2.00 },
      { id: "opt-3-3", name: "Mushrooms", price: 1.00 },
      { id: "opt-3-4", name: "Onions", price: 0.50 },
      { id: "opt-3-5", name: "Jalapeños", price: 0.75 },
      { id: "opt-3-6", name: "Avocado", price: 2.50 },
      { id: "opt-3-7", name: "Tomatoes", price: 0.50 },
      { id: "opt-3-8", name: "Olives", price: 0.75 },
    ],
    applicableCategories: ["main_course", "appetizer"],
  },
  {
    id: "mod-group-4",
    name: "Side Dishes",
    type: "single",
    required: true,
    options: [
      { id: "opt-4-1", name: "French Fries", price: 0, isDefault: true },
      { id: "opt-4-2", name: "Sweet Potato Fries", price: 1.50 },
      { id: "opt-4-3", name: "Onion Rings", price: 1.50 },
      { id: "opt-4-4", name: "Caesar Salad", price: 2.00 },
      { id: "opt-4-5", name: "Coleslaw", price: 1.00 },
      { id: "opt-4-6", name: "Steamed Vegetables", price: 2.00 },
    ],
    applicableCategories: ["main_course"],
  },
  {
    id: "mod-group-5",
    name: "Dressing",
    type: "single",
    required: false,
    options: [
      { id: "opt-5-1", name: "Ranch", price: 0, isDefault: true },
      { id: "opt-5-2", name: "Caesar", price: 0 },
      { id: "opt-5-3", name: "Balsamic Vinaigrette", price: 0 },
      { id: "opt-5-4", name: "Honey Mustard", price: 0 },
      { id: "opt-5-5", name: "Blue Cheese", price: 0.50 },
      { id: "opt-5-6", name: "No Dressing", price: 0 },
    ],
    applicableCategories: ["appetizer"],
  },
  {
    id: "mod-group-6",
    name: "Spice Level",
    type: "single",
    required: false,
    options: [
      { id: "opt-6-1", name: "Mild", price: 0, isDefault: true },
      { id: "opt-6-2", name: "Medium", price: 0 },
      { id: "opt-6-3", name: "Hot", price: 0 },
      { id: "opt-6-4", name: "Extra Hot", price: 0 },
    ],
    applicableCategories: ["main_course", "appetizer"],
  },
  {
    id: "mod-group-7",
    name: "Extras",
    type: "multiple",
    required: false,
    maxSelections: 3,
    options: [
      { id: "opt-7-1", name: "Add Protein (Chicken)", price: 4.00 },
      { id: "opt-7-2", name: "Add Protein (Shrimp)", price: 5.00 },
      { id: "opt-7-3", name: "Add Protein (Steak)", price: 6.00 },
      { id: "opt-7-4", name: "Extra Sauce", price: 0.50 },
      { id: "opt-7-5", name: "Gluten-Free Bun", price: 1.50 },
    ],
    applicableCategories: ["main_course", "appetizer"],
  },
];

export function getModifierGroupsForCategory(category: string): ModifierGroup[] {
  return mockModifierGroups.filter((group) =>
    group.applicableCategories.includes(category)
  );
}

export function calculateModifierPrice(selectedOptions: string[]): number {
  let total = 0;
  mockModifierGroups.forEach((group) => {
    group.options.forEach((option) => {
      if (selectedOptions.includes(option.id)) {
        total += option.price;
      }
    });
  });
  return total;
}
