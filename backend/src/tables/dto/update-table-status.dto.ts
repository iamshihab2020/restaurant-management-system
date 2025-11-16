import { IsNotEmpty, IsEnum } from 'class-validator';
import { TableStatus } from '../schemas/table.schema';

export class UpdateTableStatusDto {
  @IsNotEmpty()
  @IsEnum(TableStatus)
  status: TableStatus;
}
