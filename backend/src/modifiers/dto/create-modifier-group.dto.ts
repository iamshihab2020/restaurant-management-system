import { IsString, IsEnum, IsBoolean, IsArray, IsNumber, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ModifierType } from '../schemas/modifier-group.schema';

export class ModifierOptionDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsBoolean()
  isDefault: boolean;

  @IsNumber()
  @Min(0)
  sortOrder: number;
}

export class CreateModifierGroupDto {
  @IsString()
  name: string;

  @IsEnum(ModifierType)
  type: ModifierType;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxSelections?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModifierOptionDto)
  options: ModifierOptionDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableCategories?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}
