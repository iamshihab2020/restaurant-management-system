import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { RestockDto } from './dto/restock.dto';
import { DeductStockDto } from './dto/deduct-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantId } from '../auth/decorators/tenant-id.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('inventory')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(UserRole.MANAGER)
  create(
    @TenantId() tenantId: string,
    @Body() createDto: CreateInventoryItemDto,
  ) {
    return this.inventoryService.create(tenantId, createDto);
  }

  @Get()
  @Roles(UserRole.MANAGER)
  findAll(@TenantId() tenantId: string) {
    return this.inventoryService.findAll(tenantId);
  }

  @Get('low-stock')
  @Roles(UserRole.MANAGER)
  findLowStock(@TenantId() tenantId: string) {
    return this.inventoryService.findLowStock(tenantId);
  }

  @Get(':id')
  @Roles(UserRole.MANAGER)
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.inventoryService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateInventoryItemDto,
  ) {
    return this.inventoryService.update(tenantId, id, updateDto);
  }

  @Patch(':id/restock')
  @Roles(UserRole.MANAGER)
  restock(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() restockDto: RestockDto,
  ) {
    return this.inventoryService.restock(tenantId, id, restockDto.quantity);
  }

  @Patch(':id/deduct')
  @Roles(UserRole.MANAGER)
  deduct(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() deductDto: DeductStockDto,
  ) {
    return this.inventoryService.deductStock(tenantId, id, deductDto.quantity);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.inventoryService.remove(tenantId, id);
  }
}
