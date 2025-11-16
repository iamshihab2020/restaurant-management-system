import { PartialType, OmitType } from '@nestjs/mapped-types';
import { OnboardingDto } from './onboarding.dto';

// All fields optional for updates
export class UpdateProfileDto extends PartialType(OnboardingDto) {}

export class UpdateSettingsDto {
  defaultTipPercentages?: number[];
  autoAcceptOrders?: boolean;
  enableReservations?: boolean;
  tablePrefix?: string;
  receiptFooterMessage?: string;
}

export class UpdateAccountDto {
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
