import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'tenant' | 'staff';
  tenantId?: string; // Only for staff users
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    console.log('[JWT Strategy] Validating token payload:', payload);

    // For staff users, validate they exist
    if (payload.type === 'staff') {
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        console.error('[JWT Strategy] Staff user not found:', payload.email);
        throw new UnauthorizedException('Invalid token');
      }
      console.log('[JWT Strategy] Staff user validated');
    } else if (payload.type === 'tenant') {
      console.log('[JWT Strategy] Tenant user validated');
    }

    // For tenant users, we don't need to check UsersService
    // Tenant validation happens in their own service

    const user = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      type: payload.type,
      tenantId: payload.tenantId, // Will be undefined for tenants
    };

    console.log('[JWT Strategy] Returning user object:', user);
    return user;
  }
}
