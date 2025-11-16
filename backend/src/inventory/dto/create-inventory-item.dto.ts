import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  IsOptional,
} from 'class-validator';
import { InventoryUnit } from '../schemas/inventory-item.schema';

export class CreateInventoryItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsEnum(InventoryUnit)
  unit: InventoryUnit;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  currentStock: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  minimumStock: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;

  @IsOptional()
  @IsString()
  supplier?: string;
}
