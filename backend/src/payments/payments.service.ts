import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from './schemas/payment.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(
    tenantId: string,
    processedBy: string,
    createDto: CreatePaymentDto,
  ): Promise<Payment> {
    // Verify order exists and belongs to tenant
    const order = await this.orderModel
      .findOne({ _id: createDto.orderId, tenantId })
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order is already paid
    if (order.isPaid) {
      throw new BadRequestException('Order is already paid');
    }

    // Validate payment amount
    const totalPaid = await this.getTotalPaidForOrder(tenantId, createDto.orderId);
    const remainingAmount = order.total - totalPaid;

    if (createDto.amount > remainingAmount) {
      throw new BadRequestException(
        `Payment amount exceeds remaining balance. Remaining: ${remainingAmount}`,
      );
    }

    // Create payment
    const payment = new this.paymentModel({
      ...createDto,
      tenantId,
      processedBy,
      status: PaymentStatus.COMPLETED,
    });

    await payment.save();

    // Check if order is fully paid
    const newTotalPaid = totalPaid + createDto.amount;
    if (newTotalPaid >= order.total) {
      await this.orderModel.findByIdAndUpdate(order._id, {
        isPaid: true,
        paidAt: new Date(),
      });
    }

    return payment;
  }

  async findAll(
    tenantId: string,
    filters: {
      status?: string;
      method?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<Payment[]> {
    const query: any = { tenantId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.method) {
      query.method = filters.method;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    return this.paymentModel
      .find(query)
      .populate('orderId', 'orderNumber total')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(tenantId: string, id: string): Promise<Payment> {
    const payment = await this.paymentModel
      .findOne({ _id: id, tenantId })
      .populate('orderId', 'orderNumber total customerName')
      .populate('processedBy', 'name email')
      .exec();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async findByOrder(tenantId: string, orderId: string): Promise<Payment[]> {
    return this.paymentModel
      .find({ tenantId, orderId })
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getDailyTotal(
    tenantId: string,
    date?: string,
  ): Promise<{ total: number; count: number; byMethod: any }> {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const payments = await this.paymentModel
      .find({
        tenantId,
        status: PaymentStatus.COMPLETED,
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .exec();

    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const count = payments.length;

    // Group by payment method
    const byMethod = payments.reduce((acc, payment) => {
      if (!acc[payment.method]) {
        acc[payment.method] = { total: 0, count: 0 };
      }
      acc[payment.method].total += payment.amount;
      acc[payment.method].count += 1;
      return acc;
    }, {});

    return { total, count, byMethod };
  }

  async refund(
    tenantId: string,
    id: string,
    refundDto: RefundPaymentDto,
  ): Promise<Payment> {
    const payment = await this.paymentModel
      .findOne({ _id: id, tenantId })
      .exec();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Payment is already refunded');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    // Update payment status
    payment.status = PaymentStatus.REFUNDED;
    payment.refundReason = refundDto.reason;
    payment.refundedAt = new Date();

    await payment.save();

    // Update order isPaid status
    const order = await this.orderModel.findById(payment.orderId).exec();
    if (order) {
      const totalPaid = await this.getTotalPaidForOrder(
        tenantId,
        payment.orderId.toString(),
      );
      if (totalPaid < order.total) {
        await this.orderModel.findByIdAndUpdate(order._id, {
          isPaid: false,
          paidAt: null,
        });
      }
    }

    return payment;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const payment = await this.paymentModel
      .findOne({ _id: id, tenantId })
      .exec();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Only allow deletion of failed payments
    if (payment.status !== PaymentStatus.FAILED) {
      throw new BadRequestException(
        'Only failed payments can be deleted. Use refund for completed payments.',
      );
    }

    await this.paymentModel.findByIdAndDelete(id).exec();
  }

  /**
   * Helper method to calculate total paid amount for an order
   */
  private async getTotalPaidForOrder(
    tenantId: string,
    orderId: string,
  ): Promise<number> {
    const payments = await this.paymentModel
      .find({
        tenantId,
        orderId,
        status: PaymentStatus.COMPLETED,
      })
      .exec();

    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  }
}
