import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateTableDto {
  @IsNotEmpty()
  @IsString()
  tableNumber: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsObject()
  position?: { x: number; y: number };

  @IsOptional()
  @IsString()
  shape?: string;
}
