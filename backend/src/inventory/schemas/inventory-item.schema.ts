import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryItemDocument = InventoryItem & Document;

export enum InventoryUnit {
  KG = 'kg',
  G = 'g',
  L = 'l',
  ML = 'ml',
  PIECE = 'piece',
  BOX = 'box',
  PACK = 'pack',
}

@Schema({ timestamps: true })
export class InventoryItem {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  sku: string;

  @Prop()
  description?: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ type: String, enum: InventoryUnit, required: true })
  unit: InventoryUnit;

  @Prop({ required: true, min: 0 })
  currentStock: number;

  @Prop({ required: true, min: 0 })
  minimumStock: number;

  @Prop({ min: 0 })
  reorderQuantity?: number;

  @Prop({ min: 0 })
  costPerUnit: number;

  @Prop({ trim: true })
  supplier?: string;

  @Prop()
  lastRestocked?: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);

// Indexes
InventoryItemSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
InventoryItemSchema.index({ tenantId: 1, category: 1, isActive: 1 });
InventoryItemSchema.index({ tenantId: 1, currentStock: 1, minimumStock: 1 });
