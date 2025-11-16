import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // STAFF AUTH METHODS
  async loginStaff(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    const tokens = await this.generateTokens(
      (user as any)._id.toString(),
      user.email,
      user.role,
      'staff',
      (user as any).tenantId.toString(),
    );

    await this.updateRefreshTokens((user as any)._id.toString(), tokens.refreshToken, (user as any).tenantId.toString());
    await this.usersService.updateLastLogin((user as any)._id.toString());

    return {
      user: {
        id: (user as any)._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: (user as any).tenantId,
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string, tenantId: string) {
    const user = await this.usersService.findOne(tenantId, userId);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Remove old refresh token
    const updatedTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken,
    );

    const tokens = await this.generateTokens(
      (user as any)._id.toString(),
      user.email,
      user.role,
      'staff',
      tenantId,
    );

    // Add new refresh token
    updatedTokens.push(tokens.refreshToken);
    await this.usersService.updateRefreshTokens(
      (user as any)._id.toString(),
      updatedTokens,
    );

    return tokens;
  }

  async logout(userId: string, refreshToken: string, tenantId: string) {
    const user = await this.usersService.findOne(tenantId, userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const updatedTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken,
    );

    await this.usersService.updateRefreshTokens(userId, updatedTokens);

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    type: 'tenant' | 'staff' = 'staff',
    tenantId?: string,
  ) {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
      type,
      tenantId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshTokens(userId: string, newRefreshToken: string, tenantId?: string) {
    // For backward compatibility, if tenantId is not provided, fetch user by ID
    let user;
    if (tenantId) {
      user = await this.usersService.findOne(tenantId, userId);
    } else {
      // Fallback: find by email (less efficient but works)
      const tempUser = await this.userModel.findById(userId).exec();
      if (tempUser) {
        user = await this.usersService.findOne(tempUser.tenantId.toString(), userId);
      }
    }

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Keep only the last 5 refresh tokens (allow multiple devices)
    const refreshTokens = [...user.refreshTokens, newRefreshToken].slice(-5);

    await this.usersService.updateRefreshTokens(userId, refreshTokens);
  }
}
