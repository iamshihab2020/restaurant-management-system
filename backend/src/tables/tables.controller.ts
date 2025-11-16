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
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantId } from '../auth/decorators/tenant-id.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('tables')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @Roles(UserRole.MANAGER)
  create(
    @TenantId() tenantId: string,
    @Body() createDto: CreateTableDto,
  ) {
    return this.tablesService.create(tenantId, createDto);
  }

  @Get()
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  findAll(
    @TenantId() tenantId: string,
    @Query('status') status?: string,
  ) {
    if (status) {
      return this.tablesService.findByStatus(tenantId, status);
    }
    return this.tablesService.findAll(tenantId);
  }

  @Get('available')
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  findAvailable(@TenantId() tenantId: string) {
    return this.tablesService.findAvailable(tenantId);
  }

  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.tablesService.findOne(tenantId, id);
  }

  @Get(':id/current-order')
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  getCurrentOrder(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.tablesService.getCurrentOrder(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateTableDto,
  ) {
    return this.tablesService.update(tenantId, id, updateDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  updateStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() statusDto: UpdateTableStatusDto,
  ) {
    return this.tablesService.updateStatus(tenantId, id, statusDto.status);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.tablesService.remove(tenantId, id);
  }
}
