import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsOptional()
  country?: string;
}

class DayHoursDto {
  @IsString()
  open: string;

  @IsString()
  close: string;

  @IsBoolean()
  isClosed: boolean;
}

class OperatingHoursDto {
  @ValidateNested()
  @Type(() => DayHoursDto)
  @IsOptional()
  monday?: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  @IsOptional()
  tuesday?: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  @IsOptional()
  wednesday?: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  @IsOptional()
  thursday?: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  @IsOptional()
  friday?: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  @IsOptional()
  saturday?: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  @IsOptional()
  sunday?: DayHoursDto;
}

class SettingsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  defaultTipPercentages?: number[];

  @IsBoolean()
  @IsOptional()
  autoAcceptOrders?: boolean;

  @IsBoolean()
  @IsOptional()
  enableReservations?: boolean;

  @IsString()
  @IsOptional()
  tablePrefix?: string;

  @IsString()
  @IsOptional()
  receiptFooterMessage?: string;
}

export class OnboardingDto {
  // REQUIRED FIELDS
  @IsString()
  @IsNotEmpty()
  restaurantName: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsString()
  @IsNotEmpty()
  businessPhone: string;

  @IsEmail()
  businessEmail: string;

  // OPTIONAL FIELDS
  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  businessType?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cuisine?: string[];

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  taxRate?: number;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @ValidateNested()
  @Type(() => OperatingHoursDto)
  @IsOptional()
  operatingHours?: OperatingHoursDto;

  @ValidateNested()
  @Type(() => SettingsDto)
  @IsOptional()
  settings?: SettingsDto;
}
