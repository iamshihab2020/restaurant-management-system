import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ModifierGroupDocument = ModifierGroup & Document;

export enum ModifierType {
  SINGLE = 'single',     // Radio button - select one
  MULTIPLE = 'multiple', // Checkbox - select multiple
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
  sortOrder: number;
}

@Schema({ timestamps: true })
export class ModifierGroup {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, enum: ModifierType, required: true })
  type: ModifierType;

  @Prop({ default: false })
  required: boolean;

  @Prop({ min: 1 })
  maxSelections?: number; // For multiple type - max selections allowed

  @Prop({ type: [Object], required: true })
  options: ModifierOption[];

  @Prop({ type: [String], default: [] })
  applicableCategories: string[]; // MenuCategory enum values

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number; // Display order
}

export const ModifierGroupSchema = SchemaFactory.createForClass(ModifierGroup);

// Indexes
ModifierGroupSchema.index({ tenantId: 1, isActive: 1, sortOrder: 1 });
ModifierGroupSchema.index({ tenantId: 1, applicableCategories: 1 });
