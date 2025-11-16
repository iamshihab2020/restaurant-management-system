import { IsNotEmpty, IsString } from 'class-validator';

export class RefundPaymentDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}
