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
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantId } from '../auth/decorators/tenant-id.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { Public } from '../auth/decorators/public.decorator';

@Controller('menu')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @Roles(UserRole.MANAGER)
  create(@Body() createMenuItemDto: CreateMenuItemDto, @TenantId() tenantId: string) {
    return this.menuService.create(createMenuItemDto, tenantId);
  }

  @Public()
  @Get()
  findAll(@Query('category') category: string, @TenantId() tenantId: string) {
    if (category) {
      return this.menuService.findByCategory(category, tenantId);
    }
    return this.menuService.findAll(tenantId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.menuService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateMenuItemDto: UpdateMenuItemDto, @TenantId() tenantId: string) {
    return this.menuService.update(id, updateMenuItemDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.menuService.remove(id, tenantId);
  }
}
