import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OrderType {
  DINE_IN = 'dine-in',
  TAKEOUT = 'takeout',
  DELIVERY = 'delivery',
}

export enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItemId: Types.ObjectId;
  menuItemSnapshot: {
    name: string;
    price: number;
    category: string;
  };
  quantity: number;
  basePrice: number;
  selectedModifiers: SelectedModifier[];
  totalPrice: number; // basePrice * quantity + modifiers total
  status: OrderItemStatus;
  specialInstructions?: string;
  preparedBy?: Types.ObjectId;
  preparedAt?: Date;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: String, enum: OrderType, default: OrderType.DINE_IN })
  type: OrderType;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: Types.ObjectId, ref: 'Table', required: true })
  tableId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [Object], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ min: 0, default: 0 })
  tax: number;

  @Prop({ min: 0, default: 0 })
  discount: number;

  @Prop({ type: String, enum: ['percentage', 'fixed'] })
  discountType?: string;

  @Prop({ min: 0, default: 0 })
  tip: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop()
  customerName?: string;

  @Prop()
  customerCount?: number;

  @Prop()
  specialRequests?: string;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop()
  paidAt?: Date;

  @Prop()
  completedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes
OrderSchema.index({ tenantId: 1, orderNumber: 1 });
OrderSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ tenantId: 1, tableId: 1, status: 1 });
OrderSchema.index({ tenantId: 1, customerId: 1 });
OrderSchema.index({ tenantId: 1, createdBy: 1 });
