import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Reservation,
  ReservationDocument,
  ReservationStatus,
} from './schemas/reservation.schema';
import { Table, TableDocument, TableStatus } from '../tables/schemas/table.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/order.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(
    tenantId: string,
    createdBy: string,
    createDto: CreateReservationDto,
  ): Promise<Reservation> {
    // Link to existing customer if phone matches
    let customerId = createDto.customerId;
    if (!customerId && createDto.customerPhone) {
      const existingCustomer = await this.customerModel.findOne({
        tenantId,
        phone: createDto.customerPhone,
      });
      if (existingCustomer) {
        customerId = existingCustomer._id.toString();
      }
    }

    const reservation = new this.reservationModel({
      ...createDto,
      tenantId,
      customerId,
      createdBy,
      status: ReservationStatus.PENDING,
    });

    return reservation.save();
  }

  async findAll(
    tenantId: string,
    filters: { status?: string; date?: string },
  ): Promise<Reservation[]> {
    const query: any = { tenantId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.date) {
      const targetDate = new Date(filters.date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    return this.reservationModel
      .find(query)
      .populate('customerId', 'name phone email')
      .populate('tableId', 'tableNumber capacity')
      .populate('createdBy', 'name email')
      .sort({ date: 1, time: 1 })
      .exec();
  }

  async findToday(tenantId: string): Promise<Reservation[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return this.reservationModel
      .find({
        tenantId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: {
          $in: [
            ReservationStatus.PENDING,
            ReservationStatus.CONFIRMED,
            ReservationStatus.SEATED,
          ],
        },
      })
      .populate('customerId', 'name phone email')
      .populate('tableId', 'tableNumber capacity')
      .sort({ time: 1 })
      .exec();
  }

  async findUpcoming(tenantId: string): Promise<Reservation[]> {
    const now = new Date();

    return this.reservationModel
      .find({
        tenantId,
        date: { $gte: now },
        status: {
          $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
      })
      .populate('customerId', 'name phone email')
      .populate('tableId', 'tableNumber capacity')
      .sort({ date: 1, time: 1 })
      .limit(50)
      .exec();
  }

  async findOne(tenantId: string, id: string): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findOne({ _id: id, tenantId })
      .populate('customerId', 'name phone email')
      .populate('tableId', 'tableNumber capacity location')
      .populate('createdBy', 'name email')
      .exec();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  async update(
    tenantId: string,
    id: string,
    updateDto: UpdateReservationDto,
  ): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
      .populate('customerId', 'name phone email')
      .populate('tableId', 'tableNumber capacity')
      .exec();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: string,
  ): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findOne({ _id: id, tenantId })
      .exec();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    reservation.status = status as ReservationStatus;
    await reservation.save();

    return reservation.populate([
      { path: 'customerId', select: 'name phone email' },
      { path: 'tableId', select: 'tableNumber capacity' },
    ]);
  }

  async assignTable(
    tenantId: string,
    reservationId: string,
    tableId: string,
  ): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findOne({ _id: reservationId, tenantId })
      .exec();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Check if table exists and is available
    const table = await this.tableModel
      .findOne({ _id: tableId, tenantId })
      .exec();

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Check table capacity
    if (table.capacity < reservation.partySize) {
      throw new BadRequestException(
        `Table capacity (${table.capacity}) is less than party size (${reservation.partySize})`,
      );
    }

    // Check for conflicting reservations
    const conflictingReservation = await this.reservationModel
      .findOne({
        tenantId,
        tableId,
        date: reservation.date,
        time: reservation.time,
        status: {
          $in: [ReservationStatus.CONFIRMED, ReservationStatus.SEATED],
        },
        _id: { $ne: reservationId },
      })
      .exec();

    if (conflictingReservation) {
      throw new ConflictException(
        'Table is already reserved for this time slot',
      );
    }

    reservation.tableId = new Types.ObjectId(tableId) as any;
    if (reservation.status === ReservationStatus.PENDING) {
      reservation.status = ReservationStatus.CONFIRMED;
    }

    await reservation.save();

    // Update table status to reserved
    table.status = TableStatus.RESERVED;
    await table.save();

    return reservation.populate([
      { path: 'customerId', select: 'name phone email' },
      { path: 'tableId', select: 'tableNumber capacity location' },
    ]);
  }

  async seatReservation(
    tenantId: string,
    reservationId: string,
    userId: string,
  ): Promise<{ reservation: Reservation; order: Order }> {
    const reservation = await this.reservationModel
      .findOne({ _id: reservationId, tenantId })
      .exec();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (!reservation.tableId) {
      throw new BadRequestException(
        'Please assign a table before seating the reservation',
      );
    }

    // Update reservation status
    reservation.status = ReservationStatus.SEATED;
    await reservation.save();

    // Create order for the reservation
    const order = new this.orderModel({
      tenantId,
      orderNumber: await this.generateOrderNumber(tenantId),
      type: 'dine-in',
      status: OrderStatus.PENDING,
      tableId: reservation.tableId,
      customerId: reservation.customerId,
      createdBy: userId,
      customerName: reservation.customerName,
      customerCount: reservation.partySize,
      specialRequests: reservation.specialRequests,
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      tip: 0,
      total: 0,
      isPaid: false,
    });

    await order.save();

    // Update table status
    const table = await this.tableModel.findById(reservation.tableId);
    if (table) {
      table.status = TableStatus.OCCUPIED;
      table.currentOrderId = order._id as any;
      await table.save();
    }

    return {
      reservation: await reservation.populate([
        { path: 'customerId', select: 'name phone email' },
        { path: 'tableId', select: 'tableNumber capacity location' },
      ]),
      order,
    };
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const result = await this.reservationModel
      .findOneAndDelete({ _id: id, tenantId })
      .exec();

    if (!result) {
      throw new NotFoundException('Reservation not found');
    }
  }

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.orderModel.countDocuments({
      tenantId,
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    });
    const orderNum = (count + 1).toString().padStart(3, '0');
    return `ORD${dateStr}${orderNum}`;
  }
}
