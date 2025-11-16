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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantId } from '../auth/decorators/tenant-id.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('payments')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(UserRole.MANAGER, UserRole.CASHIER)
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() createDto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(tenantId, user.userId, createDto);
  }

  @Get()
  @Roles(UserRole.MANAGER, UserRole.CASHIER)
  findAll(
    @TenantId() tenantId: string,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.findAll(tenantId, {
      status,
      method,
      startDate,
      endDate,
    });
  }

  @Get('daily-total')
  @Roles(UserRole.MANAGER, UserRole.CASHIER)
  getDailyTotal(
    @TenantId() tenantId: string,
    @Query('date') date?: string,
  ) {
    return this.paymentsService.getDailyTotal(tenantId, date);
  }

  @Get('order/:orderId')
  @Roles(UserRole.MANAGER, UserRole.CASHIER, UserRole.WAITER)
  findByOrder(@TenantId() tenantId: string, @Param('orderId') orderId: string) {
    return this.paymentsService.findByOrder(tenantId, orderId);
  }

  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.CASHIER)
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.paymentsService.findOne(tenantId, id);
  }

  @Patch(':id/refund')
  @Roles(UserRole.MANAGER)
  refund(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() refundDto: RefundPaymentDto,
  ) {
    return this.paymentsService.refund(tenantId, id, refundDto);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.paymentsService.remove(tenantId, id);
  }
}
