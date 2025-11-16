import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderStatus,
  OrderItemStatus,
} from '../orders/schemas/order.schema';
import { KitchenGateway } from './kitchen.gateway';

@Injectable()
export class KitchenService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private kitchenGateway: KitchenGateway,
  ) {}

  /**
   * Get all orders in kitchen queue (confirmed, preparing)
   */
  async getKitchenQueue(tenantId: string): Promise<Order[]> {
    return this.orderModel
      .find({
        tenantId,
        status: { $in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING] },
      })
      .populate('tableId', 'tableNumber')
      .populate('createdBy', 'name')
      .sort({ createdAt: 1 }) // Oldest first (FIFO)
      .exec();
  }

  /**
   * Get pending orders (confirmed but not started)
   */
  async getPendingOrders(tenantId: string): Promise<Order[]> {
    return this.orderModel
      .find({
        tenantId,
        status: OrderStatus.CONFIRMED,
      })
      .populate('tableId', 'tableNumber')
      .populate('createdBy', 'name')
      .sort({ createdAt: 1 })
      .exec();
  }

  /**
   * Get orders currently being prepared
   */
  async getPreparingOrders(tenantId: string): Promise<Order[]> {
    return this.orderModel
      .find({
        tenantId,
        status: OrderStatus.PREPARING,
      })
      .populate('tableId', 'tableNumber')
      .populate('createdBy', 'name')
      .sort({ createdAt: 1 })
      .exec();
  }

  /**
   * Start preparing an order
   */
  async startOrder(
    tenantId: string,
    orderId: string,
    userId: string,
  ): Promise<Order> {
    const order = await this.orderModel
      .findOne({ _id: orderId, tenantId })
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException(
        'Only confirmed orders can be started in kitchen',
      );
    }

    // Update order status to preparing
    order.status = OrderStatus.PREPARING;

    // Mark all items as preparing
    order.items.forEach((item) => {
      if (item.status === OrderItemStatus.PENDING) {
        item.status = OrderItemStatus.PREPARING;
      }
    });

    await order.save();

    // Broadcast update via WebSocket
    this.kitchenGateway.broadcastOrderUpdate(tenantId, order);

    return order;
  }

  /**
   * Mark an order item as ready
   */
  async markItemReady(
    tenantId: string,
    orderId: string,
    itemId: string,
    userId: string,
  ): Promise<Order> {
    const order = await this.orderModel
      .findOne({ _id: orderId, tenantId })
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Find the item
    const item = order.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    if (item.status === OrderItemStatus.READY) {
      throw new BadRequestException('Item is already marked as ready');
    }

    // Mark item as ready
    item.status = OrderItemStatus.READY;
    item.preparedBy = userId as any;
    item.preparedAt = new Date();

    // Check if all items are ready
    const allItemsReady = order.items.every(
      (i) => i.status === OrderItemStatus.READY,
    );

    // If all items ready, update order status
    if (allItemsReady) {
      order.status = OrderStatus.READY;
    }

    await order.save();

    // Broadcast update via WebSocket
    this.kitchenGateway.broadcastItemReady(tenantId, order, itemId);

    // If order is ready, notify waiters
    if (allItemsReady) {
      this.kitchenGateway.broadcastOrderReady(tenantId, order);
    }

    return order;
  }

  /**
   * Complete an order (mark as ready)
   */
  async completeOrder(tenantId: string, orderId: string): Promise<Order> {
    const order = await this.orderModel
      .findOne({ _id: orderId, tenantId })
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      order.status !== OrderStatus.PREPARING &&
      order.status !== OrderStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Only preparing or confirmed orders can be completed',
      );
    }

    // Mark all items as ready
    const now = new Date();
    order.items.forEach((item) => {
      if (item.status !== OrderItemStatus.READY) {
        item.status = OrderItemStatus.READY;
        item.preparedAt = now;
      }
    });

    // Update order status
    order.status = OrderStatus.READY;

    await order.save();

    // Broadcast update via WebSocket
    this.kitchenGateway.broadcastOrderReady(tenantId, order);

    return order;
  }
}
