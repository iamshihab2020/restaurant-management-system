import {
  IsString,
  IsEnum,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
  Min,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../schemas/order.schema';

export class SelectedModifierDto {
  @IsString()
  groupId: string;

  @IsString()
  groupName: string;

  @IsString()
  optionId: string;

  @IsString()
  optionName: string;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOrderItemDto {
  @IsMongoId()
  menuItemId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedModifierDto)
  @IsOptional()
  selectedModifiers?: SelectedModifierDto[];

  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

export class CreateOrderDto {
  @IsEnum(OrderType)
  @IsOptional()
  type?: OrderType;

  @IsMongoId()
  tableId: string;

  @IsMongoId()
  @IsOptional()
  customerId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  customerCount?: number;

  @IsString()
  @IsOptional()
  specialRequests?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;

  @IsString()
  @IsEnum(['percentage', 'fixed'])
  @IsOptional()
  discountType?: 'percentage' | 'fixed';

  @IsNumber()
  @IsOptional()
  @Min(0)
  tip?: number;
}
