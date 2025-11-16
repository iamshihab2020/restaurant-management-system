import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { OnboardingDto } from './dto/onboarding.dto';
import {
  UpdateProfileDto,
  UpdateSettingsDto,
  UpdateAccountDto,
  ChangePasswordDto,
} from './dto/update-profile.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // PUBLIC TENANT AUTH ENDPOINTS
  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterTenantDto) {
    return this.tenantsService.register(registerDto);
  }

  @Public()
  @Post('login')
  login(@Body() loginDto: { email: string; password: string }) {
    return this.tenantsService.login(loginDto.email, loginDto.password);
  }

  // PROTECTED TENANT ENDPOINTS
  @Get('my')
  getMyProfile(@CurrentUser() user: any) {
    return this.tenantsService.getMyProfile(user.userId);
  }

  @Post('onboarding')
  completeOnboarding(
    @CurrentUser() user: any,
    @Body() onboardingDto: OnboardingDto,
  ) {
    return this.tenantsService.completeOnboarding(user.userId, onboardingDto);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.tenantsService.updateProfile(user.userId, updateDto);
  }

  @Patch('settings')
  updateSettings(
    @CurrentUser() user: any,
    @Body() settingsDto: UpdateSettingsDto,
  ) {
    return this.tenantsService.updateSettings(user.userId, settingsDto);
  }

  @Patch('account')
  updateAccount(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateAccountDto,
  ) {
    return this.tenantsService.updateAccount(user.userId, updateDto);
  }

  @Patch('password')
  changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.tenantsService.changePassword(user.userId, changePasswordDto);
  }
}
