import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TableDocument = Table & Document;

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
}

@Schema({ timestamps: true })
export class Table {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  tableNumber: string;

  @Prop({ required: true, min: 1 })
  capacity: number;

  @Prop({ type: String, enum: TableStatus, default: TableStatus.AVAILABLE })
  status: TableStatus;

  @Prop({ trim: true })
  location?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  position?: {
    x: number;
    y: number;
  };

  @Prop()
  shape?: string; // 'square', 'circle', 'rectangle'

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  currentOrderId?: Types.ObjectId;
}

export const TableSchema = SchemaFactory.createForClass(Table);

// Indexes
TableSchema.index({ tenantId: 1, tableNumber: 1 }, { unique: true });
TableSchema.index({ tenantId: 1, status: 1 });
