import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterTenantDto {
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsEmail()
  ownerEmail: string;

  @IsString()
  @IsNotEmpty()
  ownerPhone: string;

  @IsString()
  @MinLength(6)
  password: string;
}
