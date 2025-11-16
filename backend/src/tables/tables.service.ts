import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Table, TableDocument, TableStatus } from './schemas/table.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(tenantId: string, createDto: CreateTableDto): Promise<Table> {
    // Check if table number already exists
    const existing = await this.tableModel.findOne({
      tenantId,
      tableNumber: createDto.tableNumber,
    });

    if (existing) {
      throw new ConflictException(
        `Table ${createDto.tableNumber} already exists`,
      );
    }

    const table = new this.tableModel({
      ...createDto,
      tenantId,
      status: TableStatus.AVAILABLE,
      isActive: true,
    });

    return table.save();
  }

  async findAll(tenantId: string): Promise<Table[]> {
    return this.tableModel
      .find({ tenantId, isActive: true })
      .sort({ tableNumber: 1 })
      .exec();
  }

  async findByStatus(tenantId: string, status: string): Promise<Table[]> {
    return this.tableModel
      .find({ tenantId, status, isActive: true })
      .sort({ tableNumber: 1 })
      .exec();
  }

  async findAvailable(tenantId: string): Promise<Table[]> {
    return this.tableModel
      .find({ tenantId, status: TableStatus.AVAILABLE, isActive: true })
      .sort({ tableNumber: 1 })
      .exec();
  }

  async findOne(tenantId: string, id: string): Promise<Table> {
    const table = await this.tableModel
      .findOne({ _id: id, tenantId })
      .populate('currentOrderId')
      .exec();

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return table;
  }

  async getCurrentOrder(tenantId: string, id: string): Promise<Order | null> {
    const table = await this.tableModel
      .findOne({ _id: id, tenantId })
      .exec();

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    if (!table.currentOrderId) {
      return null;
    }

    const order = await this.orderModel
      .findOne({ _id: table.currentOrderId, tenantId })
      .populate('createdBy', 'name email')
      .exec();

    return order;
  }

  async update(
    tenantId: string,
    id: string,
    updateDto: UpdateTableDto,
  ): Promise<Table> {
    // Check if table number is being updated and already exists
    if (updateDto.tableNumber) {
      const existing = await this.tableModel.findOne({
        tenantId,
        tableNumber: updateDto.tableNumber,
        _id: { $ne: id },
      });

      if (existing) {
        throw new ConflictException(
          `Table ${updateDto.tableNumber} already exists`,
        );
      }
    }

    const table = await this.tableModel
      .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
      .exec();

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return table;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: TableStatus,
  ): Promise<Table> {
    const table = await this.tableModel
      .findOne({ _id: id, tenantId })
      .exec();

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Validation: Cannot set to available if there's a current order
    if (status === TableStatus.AVAILABLE && table.currentOrderId) {
      throw new BadRequestException(
        'Cannot set table to available while there is an active order',
      );
    }

    table.status = status;
    return table.save();
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const table = await this.tableModel
      .findOne({ _id: id, tenantId })
      .exec();

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Cannot delete table with active order
    if (table.currentOrderId) {
      throw new BadRequestException(
        'Cannot delete table with an active order',
      );
    }

    await this.tableModel.findByIdAndDelete(id).exec();
  }

  /**
   * Set table as occupied with order
   * Called by OrdersService when order is created
   */
  async setOccupied(
    tenantId: string,
    tableId: string,
    orderId: string,
  ): Promise<Table> {
    const table = await this.tableModel
      .findOne({ _id: tableId, tenantId })
      .exec();

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    table.status = TableStatus.OCCUPIED;
    table.currentOrderId = new Types.ObjectId(orderId) as any;

    return table.save();
  }

  /**
   * Clear table and set to cleaning
   * Called by OrdersService when order is completed
   */
  async clearTable(tenantId: string, tableId: string): Promise<Table> {
    const table = await this.tableModel
      .findOne({ _id: tableId, tenantId })
      .exec();

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    table.status = TableStatus.CLEANING;
    table.currentOrderId = null;

    return table.save();
  }

  /**
   * Set table as reserved
   * Called by ReservationsService when reservation is confirmed
   */
  async setReserved(tenantId: string, tableId: string): Promise<Table> {
    const table = await this.tableModel
      .findOne({ _id: tableId, tenantId })
      .exec();

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    if (table.status !== TableStatus.AVAILABLE) {
      throw new BadRequestException('Table is not available for reservation');
    }

    table.status = TableStatus.RESERVED;

    return table.save();
  }
}
