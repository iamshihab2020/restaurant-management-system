import { IsNotEmpty, IsString } from 'class-validator';

export class AssignTableDto {
  @IsNotEmpty()
  @IsString()
  tableId: string;
}
