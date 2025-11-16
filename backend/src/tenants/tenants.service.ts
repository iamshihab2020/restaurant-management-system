import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { OnboardingDto } from './dto/onboarding.dto';
import {
  UpdateProfileDto,
  UpdateSettingsDto,
  UpdateAccountDto,
  ChangePasswordDto,
} from './dto/update-profile.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterTenantDto): Promise<any> {
    const existing = await this.tenantModel.findOne({
      ownerEmail: registerDto.ownerEmail,
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const tenant = new this.tenantModel({
      ...registerDto,
      password: hashedPassword,
      onboardingCompleted: false,
    });

    await tenant.save();

    // Generate tokens for tenant
    const tokens = await this.generateTokens(
      (tenant as any)._id.toString(),
      tenant.ownerEmail,
      'admin', // tenant role - owners have admin access
    );

    // Store refresh token
    await this.updateRefreshTokens(
      (tenant as any)._id.toString(),
      [tokens.refreshToken],
    );

    return {
      tenant: this.sanitizeTenant(tenant),
      needsOnboarding: !tenant.onboardingCompleted,
      ...tokens,
    };
  }

  async login(email: string, password: string): Promise<any> {
    const tenant = await this.tenantModel.findOne({ ownerEmail: email });

    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, tenant.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(
      (tenant as any)._id.toString(),
      tenant.ownerEmail,
      'admin', // tenant role - owners have admin access
    );

    // Update refresh tokens (add to existing tokens, keep last 5)
    const existingTokens = tenant.refreshTokens || [];
    const updatedTokens = [...existingTokens, tokens.refreshToken].slice(-5);
    await this.updateRefreshTokens(
      (tenant as any)._id.toString(),
      updatedTokens,
    );

    // Update last login
    await this.updateLastLogin((tenant as any)._id.toString());

    return {
      tenant: this.sanitizeTenant(tenant),
      needsOnboarding: !tenant.onboardingCompleted,
      ...tokens,
    };
  }

  async findByEmail(email: string): Promise<TenantDocument | null> {
    return this.tenantModel.findOne({ ownerEmail: email }).exec();
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantModel
      .findById(id)
      .select('-password -refreshTokens')
      .exec();

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async findOneWithPassword(id: string): Promise<TenantDocument> {
    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async completeOnboarding(
    tenantId: string,
    onboardingDto: OnboardingDto,
  ): Promise<any> {
    const tenant = await this.tenantModel.findById(tenantId);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.onboardingCompleted) {
      throw new BadRequestException('Onboarding already completed');
    }

    // Update with onboarding data
    Object.assign(tenant, onboardingDto);
    tenant.onboardingCompleted = true;

    // Merge settings if provided
    if (onboardingDto.settings) {
      tenant.settings = { ...tenant.settings, ...onboardingDto.settings };
    }

    await tenant.save();

    const profileCompleteness = this.calculateProfileCompleteness(tenant);
    const missingFields = this.getMissingFields(tenant);

    return {
      tenant: this.sanitizeTenant(tenant),
      profileCompleteness,
      missingFields,
    };
  }

  async getMyProfile(tenantId: string): Promise<any> {
    const tenant = await this.findOne(tenantId);

    const profileCompleteness = this.calculateProfileCompleteness(tenant as any);
    const missingFields = this.getMissingFields(tenant as any);

    return {
      tenant,
      profileCompleteness,
      missingFields,
    };
  }

  async updateProfile(
    tenantId: string,
    updateDto: UpdateProfileDto,
  ): Promise<any> {
    const tenant = await this.tenantModel
      .findByIdAndUpdate(tenantId, updateDto, { new: true })
      .select('-password -refreshTokens')
      .exec();

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const profileCompleteness = this.calculateProfileCompleteness(tenant);
    const missingFields = this.getMissingFields(tenant);

    return {
      tenant,
      profileCompleteness,
      missingFields,
    };
  }

  async updateSettings(
    tenantId: string,
    settingsDto: UpdateSettingsDto,
  ): Promise<Tenant> {
    const tenant = await this.tenantModel.findById(tenantId);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    tenant.settings = { ...tenant.settings, ...settingsDto };
    await tenant.save();

    return this.sanitizeTenant(tenant);
  }

  async updateAccount(
    tenantId: string,
    updateDto: UpdateAccountDto,
  ): Promise<Tenant> {
    const tenant = await this.tenantModel
      .findByIdAndUpdate(
        tenantId,
        {
          ownerName: updateDto.ownerName,
          ownerEmail: updateDto.ownerEmail,
          ownerPhone: updateDto.ownerPhone,
        },
        { new: true },
      )
      .select('-password -refreshTokens')
      .exec();

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async changePassword(
    tenantId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const tenant = await this.tenantModel.findById(tenantId);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const isMatch = await bcrypt.compare(
      changePasswordDto.currentPassword,
      tenant.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    tenant.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await tenant.save();
  }

  async updateRefreshTokens(
    tenantId: string,
    refreshTokens: string[],
  ): Promise<void> {
    await this.tenantModel
      .findByIdAndUpdate(tenantId, { refreshTokens })
      .exec();
  }

  async updateLastLogin(tenantId: string): Promise<void> {
    await this.tenantModel
      .findByIdAndUpdate(tenantId, { lastLogin: new Date() })
      .exec();
  }

  // Calculate profile completeness (0-100%)
  calculateProfileCompleteness(tenant: TenantDocument): number {
    const fields = {
      // Required account fields (auto-complete on signup) - 20%
      ownerName: 5,
      ownerEmail: 5,
      ownerPhone: 5,
      password: 5,

      // Required onboarding fields - 40%
      restaurantName: 10,
      address: 10,
      businessPhone: 10,
      businessEmail: 10,

      // Optional fields - 40%
      website: 5,
      logo: 5,
      businessType: 5,
      cuisine: 5,
      taxId: 5,
      operatingHours: 10,
      receiptFooterMessage: 5,
    };

    let score = 0;

    // Account fields (always complete after signup)
    if (tenant.ownerName) score += fields.ownerName;
    if (tenant.ownerEmail) score += fields.ownerEmail;
    if (tenant.ownerPhone) score += fields.ownerPhone;
    if (tenant.password) score += fields.password;

    // Required onboarding
    if (tenant.restaurantName) score += fields.restaurantName;
    if (tenant.address?.street) score += fields.address;
    if (tenant.businessPhone) score += fields.businessPhone;
    if (tenant.businessEmail) score += fields.businessEmail;

    // Optional fields
    if (tenant.website) score += fields.website;
    if (tenant.logo) score += fields.logo;
    if (tenant.businessType) score += fields.businessType;
    if (tenant.cuisine && tenant.cuisine.length > 0) score += fields.cuisine;
    if (tenant.taxId) score += fields.taxId;
    if (tenant.operatingHours) score += fields.operatingHours;
    if (tenant.settings?.receiptFooterMessage)
      score += fields.receiptFooterMessage;

    return Math.min(score, 100);
  }

  // Get list of missing optional fields
  getMissingFields(tenant: TenantDocument): string[] {
    const missing = [];

    if (!tenant.website) missing.push('website');
    if (!tenant.logo) missing.push('logo');
    if (!tenant.businessType) missing.push('businessType');
    if (!tenant.cuisine || tenant.cuisine.length === 0)
      missing.push('cuisine');
    if (!tenant.taxId) missing.push('taxId');
    if (!tenant.operatingHours) missing.push('operatingHours');
    if (!tenant.settings?.receiptFooterMessage)
      missing.push('receiptFooterMessage');

    return missing;
  }

  // Remove sensitive fields from response
  private sanitizeTenant(tenant: TenantDocument): any {
    const obj = tenant.toObject();
    delete obj.password;
    delete obj.refreshTokens;
    return obj;
  }

  // JWT token generation for tenants
  private async generateTokens(userId: string, email: string, role: string) {
    const payload = {
      sub: userId,
      email,
      role,
      type: 'tenant' as const,
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

    return { accessToken, refreshToken };
  }
}
