import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class RestockDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  quantity: number;
}
