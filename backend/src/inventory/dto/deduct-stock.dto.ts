import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class DeductStockDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  quantity: number;
}
