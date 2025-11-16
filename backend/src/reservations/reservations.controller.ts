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
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { AssignTableDto } from './dto/assign-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantId } from '../auth/decorators/tenant-id.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('reservations')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() createDto: CreateReservationDto,
  ) {
    return this.reservationsService.create(tenantId, user.userId, createDto);
  }

  @Get()
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  findAll(
    @TenantId() tenantId: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    return this.reservationsService.findAll(tenantId, { status, date });
  }

  @Get('today')
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  findToday(@TenantId() tenantId: string) {
    return this.reservationsService.findToday(tenantId);
  }

  @Get('upcoming')
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  findUpcoming(@TenantId() tenantId: string) {
    return this.reservationsService.findUpcoming(tenantId);
  }

  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.reservationsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(tenantId, id, updateDto);
  }

  @Patch(':id/assign-table')
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  assignTable(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() assignDto: AssignTableDto,
  ) {
    return this.reservationsService.assignTable(
      tenantId,
      id,
      assignDto.tableId,
    );
  }

  @Patch(':id/confirm')
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  confirm(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.reservationsService.updateStatus(tenantId, id, 'confirmed');
  }

  @Patch(':id/seat')
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  seat(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.reservationsService.seatReservation(tenantId, id, user.userId);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  cancel(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.reservationsService.updateStatus(tenantId, id, 'cancelled');
  }

  @Patch(':id/no-show')
  @Roles(UserRole.MANAGER, UserRole.WAITER)
  noShow(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.reservationsService.updateStatus(tenantId, id, 'no-show');
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.reservationsService.remove(tenantId, id);
  }
}
