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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { TenantId } from '../auth/decorators/tenant-id.decorator';
import { OrderStatus, OrderItemStatus } from './schemas/order.schema';

@Controller('orders')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: CurrentUserData,
    @TenantId() tenantId: string,
  ) {
    return this.ordersService.create(createOrderDto, user.userId, tenantId);
  }

  @Get()
  findAll(@Query('status') status: OrderStatus, @TenantId() tenantId: string) {
    if (status) {
      return this.ordersService.findByStatus(status, tenantId);
    }
    return this.ordersService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.ordersService.findOne(id, tenantId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @TenantId() tenantId: string,
  ) {
    return this.ordersService.updateStatus(id, status, tenantId);
  }

  @Patch(':id/items/:itemId/status')
  updateItemStatus(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body('status') status: OrderItemStatus,
    @CurrentUser() user: CurrentUserData,
    @TenantId() tenantId: string,
  ) {
    return this.ordersService.updateItemStatus(id, itemId, status, user.userId, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.ordersService.remove(id, tenantId);
  }
}
