import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { DateRangeDto } from './dto/date-range.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantId } from '../auth/decorators/tenant-id.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('reports')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @Roles(UserRole.MANAGER)
  getDashboardStats(@TenantId() tenantId: string) {
    return this.reportsService.getDashboardStats(tenantId);
  }

  @Get('sales')
  @Roles(UserRole.MANAGER)
  getSalesReport(
    @TenantId() tenantId: string,
    @Query() dateRange: DateRangeDto,
  ) {
    return this.reportsService.getSalesReport(tenantId, dateRange);
  }

  @Get('revenue')
  @Roles(UserRole.MANAGER)
  getRevenueReport(
    @TenantId() tenantId: string,
    @Query() dateRange: DateRangeDto,
  ) {
    return this.reportsService.getRevenueReport(tenantId, dateRange);
  }

  @Get('popular-items')
  @Roles(UserRole.MANAGER)
  getPopularItems(
    @TenantId() tenantId: string,
    @Query() dateRange: DateRangeDto,
  ) {
    return this.reportsService.getPopularItems(tenantId, dateRange);
  }

  @Get('orders-by-status')
  @Roles(UserRole.MANAGER)
  getOrdersByStatus(@TenantId() tenantId: string) {
    return this.reportsService.getOrdersByStatus(tenantId);
  }

  @Get('payment-methods')
  @Roles(UserRole.MANAGER)
  getPaymentMethodsBreakdown(
    @TenantId() tenantId: string,
    @Query() dateRange: DateRangeDto,
  ) {
    return this.reportsService.getPaymentMethodsBreakdown(tenantId, dateRange);
  }

  @Get('table-utilization')
  @Roles(UserRole.MANAGER)
  getTableUtilization(@TenantId() tenantId: string) {
    return this.reportsService.getTableUtilization(tenantId);
  }

  @Get('reservations-stats')
  @Roles(UserRole.MANAGER)
  getReservationsStats(
    @TenantId() tenantId: string,
    @Query() dateRange: DateRangeDto,
  ) {
    return this.reportsService.getReservationsStats(tenantId, dateRange);
  }

  @Get('inventory-alerts')
  @Roles(UserRole.MANAGER)
  getInventoryAlerts(@TenantId() tenantId: string) {
    return this.reportsService.getInventoryAlerts(tenantId);
  }
}
