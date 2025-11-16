import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OperatingHours {
  monday: { open: string; close: string; isClosed: boolean };
  tuesday: { open: string; close: string; isClosed: boolean };
  wednesday: { open: string; close: string; isClosed: boolean };
  thursday: { open: string; close: string; isClosed: boolean };
  friday: { open: string; close: string; isClosed: boolean };
  saturday: { open: string; close: string; isClosed: boolean };
  sunday: { open: string; close: string; isClosed: boolean };
}

export interface TenantSettings {
  defaultTipPercentages: number[];
  autoAcceptOrders: boolean;
  enableReservations: boolean;
  tablePrefix: string;
  receiptFooterMessage?: string;
}

export interface Subscription {
  plan: 'trial' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  expiryDate?: Date;
  maxUsers: number;
  maxTables: number;
}

@Schema({ timestamps: true })
export class Tenant {
  // Owner Account Info
  @Prop({ required: true, trim: true })
  ownerName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  ownerEmail: string;

  @Prop({ required: true })
  ownerPhone: string;

  @Prop({ required: true })
  password: string;

  // Restaurant Business Profile (REQUIRED after onboarding)
  @Prop({ trim: true })
  restaurantName?: string;

  @Prop({ type: Object })
  address?: Address;

  @Prop()
  businessPhone?: string;

  @Prop()
  businessEmail?: string;

  // Optional Business Details
  @Prop()
  website?: string;

  @Prop()
  logo?: string;

  @Prop()
  businessType?: string;

  @Prop({ type: [String], default: [] })
  cuisine: string[];

  // Tax & Financial
  @Prop({ default: 10 })
  taxRate: number;

  @Prop()
  taxId?: string;

  @Prop({ default: 'USD' })
  currency: string;

  // Operating Hours
  @Prop({ type: Object })
  operatingHours?: OperatingHours;

  // System Settings
  @Prop({
    type: Object,
    default: {
      defaultTipPercentages: [15, 18, 20],
      autoAcceptOrders: true,
      enableReservations: true,
      tablePrefix: 'Table',
    },
  })
  settings: TenantSettings;

  // Subscription
  @Prop({
    type: Object,
    default: {
      plan: 'trial',
      status: 'active',
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      maxUsers: 5,
      maxTables: 20,
    },
  })
  subscription: Subscription;

  // Auth Tokens
  @Prop({ type: [String], default: [] })
  refreshTokens: string[];

  // Status
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  onboardingCompleted: boolean;

  @Prop()
  lastLogin?: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

// Indexes
TenantSchema.index({ isActive: 1 });
TenantSchema.index({ 'subscription.status': 1 });
