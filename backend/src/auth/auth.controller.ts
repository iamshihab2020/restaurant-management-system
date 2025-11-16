import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // STAFF AUTH ENDPOINTS
  @Public()
  @Post('staff/login')
  loginStaff(@Body() loginDto: LoginDto) {
    return this.authService.loginStaff(loginDto);
  }

  // LEGACY ENDPOINTS - Deprecated, use /tenants/register and /tenants/login instead
  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.loginStaff(loginDto);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refreshTokens(@CurrentUser() user: CurrentUserData & { refreshToken: string }) {
    return this.authService.refreshTokens(user.userId, user.refreshToken, user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: CurrentUserData & { refreshToken: string }) {
    return this.authService.logout(user.userId, user.refreshToken, user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: CurrentUserData) {
    return user;
  }
}
