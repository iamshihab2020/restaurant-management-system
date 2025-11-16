import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantId } from '../auth/decorators/tenant-id.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('kitchen')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  /**
   * Get all orders in the kitchen queue (confirmed, preparing)
   */
  @Get('orders')
  @Roles(UserRole.MANAGER, UserRole.KITCHEN)
  getKitchenQueue(@TenantId() tenantId: string) {
    return this.kitchenService.getKitchenQueue(tenantId);
  }

  /**
   * Get pending orders (status: confirmed)
   */
  @Get('orders/pending')
  @Roles(UserRole.MANAGER, UserRole.KITCHEN)
  getPendingOrders(@TenantId() tenantId: string) {
    return this.kitchenService.getPendingOrders(tenantId);
  }

  /**
   * Get orders currently being prepared
   */
  @Get('orders/preparing')
  @Roles(UserRole.MANAGER, UserRole.KITCHEN)
  getPreparingOrders(@TenantId() tenantId: string) {
    return this.kitchenService.getPreparingOrders(tenantId);
  }

  /**
   * Start preparing an order
   */
  @Patch('orders/:orderId/start')
  @Roles(UserRole.MANAGER, UserRole.KITCHEN)
  startOrder(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Param('orderId') orderId: string,
  ) {
    return this.kitchenService.startOrder(tenantId, orderId, user.userId);
  }

  /**
   * Mark an order item as ready
   */
  @Patch('orders/:orderId/items/:itemId/ready')
  @Roles(UserRole.MANAGER, UserRole.KITCHEN)
  markItemReady(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.kitchenService.markItemReady(
      tenantId,
      orderId,
      itemId,
      user.userId,
    );
  }

  /**
   * Complete an order (all items ready)
   */
  @Patch('orders/:orderId/complete')
  @Roles(UserRole.MANAGER, UserRole.KITCHEN)
  completeOrder(
    @TenantId() tenantId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.kitchenService.completeOrder(tenantId, orderId);
  }
}
