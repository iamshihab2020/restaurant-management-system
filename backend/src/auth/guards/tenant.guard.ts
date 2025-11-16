import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Inject tenantId from authenticated user into request
    // Staff users will have tenantId in their JWT payload
    // Tenants will use their own ID as tenantId
    if (user.type === 'tenant') {
      request.tenantId = user.userId;
    } else if (user.type === 'staff') {
      request.tenantId = user.tenantId;
    } else {
      throw new UnauthorizedException('Invalid user type');
    }

    return true;
  }
}
