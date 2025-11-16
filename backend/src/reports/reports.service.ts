import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/order.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { Table, TableDocument, TableStatus } from '../tables/schemas/table.schema';
import { Reservation, ReservationDocument } from '../reservations/schemas/reservation.schema';
import { InventoryItem, InventoryItemDocument } from '../inventory/schemas/inventory-item.schema';
import { DateRangeDto } from './dto/date-range.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(InventoryItem.name) private inventoryModel: Model<InventoryItemDocument>,
  ) {}

  async getDashboardStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      todayRevenue,
      activeOrders,
      totalTables,
      occupiedTables,
      todayReservations,
      lowStockItems,
    ] = await Promise.all([
      // Today's orders count
      this.orderModel.countDocuments({
        tenantId: new Types.ObjectId(tenantId),
        createdAt: { $gte: today },
      }),

      // Today's revenue
      this.paymentModel.aggregate([
        {
          $match: {
            tenantId: new Types.ObjectId(tenantId),
            createdAt: { $gte: today },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            tips: { $sum: '$tip' },
          },
        },
      ]),

      // Active orders (pending, confirmed, preparing)
      this.orderModel.countDocuments({
        tenantId: new Types.ObjectId(tenantId),
        status: { $in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING] },
      }),

      // Total tables
      this.tableModel.countDocuments({
        tenantId: new Types.ObjectId(tenantId),
        isActive: true,
      }),

      // Occupied tables
      this.tableModel.countDocuments({
        tenantId: new Types.ObjectId(tenantId),
        status: TableStatus.OCCUPIED,
      }),

      // Today's reservations
      this.reservationModel.countDocuments({
        tenantId: new Types.ObjectId(tenantId),
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      }),

      // Low stock items
      this.inventoryModel.countDocuments({
        tenantId: new Types.ObjectId(tenantId),
        isActive: true,
        $expr: { $lte: ['$currentStock', '$minimumStock'] },
      }),
    ]);

    const revenue = todayRevenue[0] || { total: 0, tips: 0 };

    return {
      todayOrders,
      todayRevenue: revenue.total,
      todayTips: revenue.tips,
      activeOrders,
      totalTables,
      occupiedTables,
      tableOccupancyRate: totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0,
      todayReservations,
      lowStockItems,
    };
  }

  async getSalesReport(tenantId: string, dateRange: DateRangeDto) {
    const match: any = { tenantId: new Types.ObjectId(tenantId) };

    if (dateRange.startDate || dateRange.endDate) {
      match.createdAt = {};
      if (dateRange.startDate) match.createdAt.$gte = new Date(dateRange.startDate);
      if (dateRange.endDate) match.createdAt.$lte = new Date(dateRange.endDate);
    }

    const salesData = await this.orderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return salesData;
  }

  async getRevenueReport(tenantId: string, dateRange: DateRangeDto) {
    const match: any = {
      tenantId: new Types.ObjectId(tenantId),
      status: 'completed',
    };

    if (dateRange.startDate || dateRange.endDate) {
      match.createdAt = {};
      if (dateRange.startDate) match.createdAt.$gte = new Date(dateRange.startDate);
      if (dateRange.endDate) match.createdAt.$lte = new Date(dateRange.endDate);
    }

    const revenueData = await this.paymentModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            method: '$method',
          },
          totalAmount: { $sum: '$amount' },
          totalTips: { $sum: '$tip' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    return revenueData;
  }

  async getPopularItems(tenantId: string, dateRange: DateRangeDto) {
    const match: any = {
      tenantId: new Types.ObjectId(tenantId),
      status: { $in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.COMPLETED] },
    };

    if (dateRange.startDate || dateRange.endDate) {
      match.createdAt = {};
      if (dateRange.startDate) match.createdAt.$gte = new Date(dateRange.startDate);
      if (dateRange.endDate) match.createdAt.$lte = new Date(dateRange.endDate);
    }

    const popularItems = await this.orderModel.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          itemName: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 20 },
    ]);

    return popularItems;
  }

  async getOrdersByStatus(tenantId: string) {
    const ordersByStatus = await this.orderModel.aggregate([
      { $match: { tenantId: new Types.ObjectId(tenantId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return ordersByStatus;
  }

  async getPaymentMethodsBreakdown(tenantId: string, dateRange: DateRangeDto) {
    const match: any = {
      tenantId: new Types.ObjectId(tenantId),
      status: 'completed',
    };

    if (dateRange.startDate || dateRange.endDate) {
      match.createdAt = {};
      if (dateRange.startDate) match.createdAt.$gte = new Date(dateRange.startDate);
      if (dateRange.endDate) match.createdAt.$lte = new Date(dateRange.endDate);
    }

    const paymentBreakdown = await this.paymentModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$method',
          totalAmount: { $sum: '$amount' },
          totalTips: { $sum: '$tip' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    return paymentBreakdown;
  }

  async getTableUtilization(tenantId: string) {
    const tables = await this.tableModel.find({
      tenantId: new Types.ObjectId(tenantId),
      isActive: true,
    });

    const statusBreakdown = tables.reduce((acc, table) => {
      acc[table.status] = (acc[table.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const capacityUtilization = await this.tableModel.aggregate([
      {
        $match: {
          tenantId: new Types.ObjectId(tenantId),
          isActive: true,
          status: TableStatus.OCCUPIED,
        },
      },
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$capacity' },
          occupiedTables: { $sum: 1 },
        },
      },
    ]);

    return {
      totalTables: tables.length,
      statusBreakdown,
      capacityUtilization: capacityUtilization[0] || { totalCapacity: 0, occupiedTables: 0 },
    };
  }

  async getReservationsStats(tenantId: string, dateRange: DateRangeDto) {
    const match: any = { tenantId: new Types.ObjectId(tenantId) };

    if (dateRange.startDate || dateRange.endDate) {
      match.date = {};
      if (dateRange.startDate) match.date.$gte = new Date(dateRange.startDate);
      if (dateRange.endDate) match.date.$lte = new Date(dateRange.endDate);
    }

    const reservationStats = await this.reservationModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalGuests: { $sum: '$partySize' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return reservationStats;
  }

  async getInventoryAlerts(tenantId: string) {
    const lowStockItems = await this.inventoryModel.find({
      tenantId: new Types.ObjectId(tenantId),
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minimumStock'] },
    }).sort({ currentStock: 1 });

    const outOfStock = lowStockItems.filter(item => item.currentStock === 0);
    const criticalStock = lowStockItems.filter(
      item => item.currentStock > 0 && item.currentStock <= item.minimumStock * 0.5,
    );
    const lowStock = lowStockItems.filter(
      item => item.currentStock > item.minimumStock * 0.5 && item.currentStock <= item.minimumStock,
    );

    return {
      outOfStock,
      criticalStock,
      lowStock,
      totalAlerts: lowStockItems.length,
    };
  }
}
