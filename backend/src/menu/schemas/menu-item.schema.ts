import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuItemDocument = MenuItem & Document;

export enum MenuCategory {
  APPETIZER = 'appetizer',
  MAIN_COURSE = 'main_course',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
  SPECIAL = 'special',
}

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ type: String, enum: MenuCategory, required: true })
  category: MenuCategory;

  @Prop({ trim: true })
  image?: string;

  @Prop({ type: [Types.ObjectId], ref: 'ModifierGroup', default: [] })
  modifierGroups: Types.ObjectId[];

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ min: 0, default: 15 })
  preparationTime: number; // in minutes

  @Prop({ min: 0 })
  calories?: number;

  @Prop({ type: [String], default: [] })
  allergens: string[];

  @Prop({ type: [String], default: [] })
  ingredients: string[];

  @Prop({ default: false })
  isVegetarian: boolean;

  @Prop({ default: false })
  isVegan: boolean;

  @Prop({ default: false })
  isGlutenFree: boolean;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);

// Indexes
MenuItemSchema.index({ tenantId: 1, category: 1, available: 1 });
MenuItemSchema.index({ tenantId: 1, name: 'text', description: 'text' });
