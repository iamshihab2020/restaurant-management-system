import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ModifiersService } from './modifiers.service';
import { CreateModifierGroupDto } from './dto/create-modifier-group.dto';
import { UpdateModifierGroupDto } from './dto/update-modifier-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantId } from '../auth/decorators/tenant-id.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { Public } from '../auth/decorators/public.decorator';

@Controller('modifiers')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ModifiersController {
  constructor(private readonly modifiersService: ModifiersService) {}

  @Post()
  @Roles(UserRole.MANAGER)
  create(
    @TenantId() tenantId: string,
    @Body() createDto: CreateModifierGroupDto,
  ) {
    return this.modifiersService.create(tenantId, createDto);
  }

  @Public()
  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('category') category?: string,
  ) {
    if (category) {
      return this.modifiersService.findByCategory(tenantId, category);
    }
    return this.modifiersService.findAll(tenantId);
  }

  @Public()
  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.modifiersService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateModifierGroupDto,
  ) {
    return this.modifiersService.update(tenantId, id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.modifiersService.remove(tenantId, id);
  }
}
