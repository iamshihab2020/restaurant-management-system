import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus, OrderItemStatus } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { MenuItem, MenuItemDocument } from '../menu/schemas/menu-item.schema';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { KitchenGateway } from '../kitchen/kitchen.gateway';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @Inject(forwardRef(() => KitchenGateway))
    private kitchenGateway: KitchenGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string, tenantId: string): Promise<Order> {
    // Get tenant for dynamic tax rate
    const tenant = await this.tenantModel.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    const taxRate = (tenant.taxRate || 10) / 100; // Convert percentage to decimal

    // Generate order number
    const orderNumber = await this.generateOrderNumber(tenantId);

    // Fetch menu items to get prices and validate (with tenant filtering)
    const menuItemIds = createOrderDto.items.map(item => item.menuItemId);
    const menuItems = await this.menuItemModel.find({
      _id: { $in: menuItemIds },
      tenantId,
    }).exec();

    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException('Some menu items not found');
    }

    // Calculate order totals
    const orderItems = createOrderDto.items.map(item => {
      const menuItem = menuItems.find(mi => mi._id.toString() === item.menuItemId);
      if (!menuItem) {
        throw new BadRequestException(`Menu item ${item.menuItemId} not found`);
      }

      if (!menuItem.isAvailable) {
        throw new BadRequestException(`${menuItem.name} is currently unavailable`);
      }

      // Calculate modifier total
      const modifierTotal = (item.selectedModifiers || []).reduce(
        (sum, mod) => sum + mod.price,
        0
      );

      const itemBasePrice = menuItem.price;
      const itemTotalPrice = (itemBasePrice + modifierTotal) * item.quantity;

      return {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        menuItemId: menuItem._id,
        menuItemSnapshot: {
          name: menuItem.name,
          price: menuItem.price,
          category: menuItem.category,
        },
        quantity: item.quantity,
        basePrice: itemBasePrice,
        selectedModifiers: item.selectedModifiers || [],
        totalPrice: itemTotalPrice,
        status: OrderItemStatus.PENDING,
        specialInstructions: item.specialInstructions,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Calculate discount
    let discountAmount = 0;
    if (createOrderDto.discount && createOrderDto.discount > 0) {
      if (createOrderDto.discountType === 'percentage') {
        discountAmount = subtotal * (createOrderDto.discount / 100);
      } else {
        discountAmount = createOrderDto.discount;
      }
    }

    const subtotalAfterDiscount = subtotal - discountAmount;
    const tax = subtotalAfterDiscount * taxRate; // Use dynamic tax rate
    const total = subtotalAfterDiscount + tax + (createOrderDto.tip || 0);

    const order = new this.orderModel({
      tenantId,
      orderNumber,
      type: createOrderDto.type || 'dine-in',
      tableId: createOrderDto.tableId,
      customerId: createOrderDto.customerId,
      createdBy: userId,
      items: orderItems,
      subtotal,
      tax,
      discount: discountAmount,
      discountType: createOrderDto.discountType,
      tip: createOrderDto.tip || 0,
      total,
      customerName: createOrderDto.customerName,
      customerCount: createOrderDto.customerCount,
      specialRequests: createOrderDto.specialRequests,
      status: OrderStatus.PENDING,
      isPaid: false,
    });

    const savedOrder = await order.save();

    // Broadcast new order to kitchen when status is confirmed
    if (savedOrder.status === OrderStatus.CONFIRMED) {
      this.kitchenGateway.broadcastNewOrder(tenantId, savedOrder);
    }

    return savedOrder;
  }

  async findAll(tenantId: string): Promise<Order[]> {
    return this.orderModel
      .find({ tenantId })
      .populate('createdBy', 'name email role')
      .populate('tableId')
      .populate('customerId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByStatus(status: OrderStatus, tenantId: string): Promise<Order[]> {
    return this.orderModel
      .find({ status, tenantId })
      .populate('createdBy', 'name email role')
      .populate('tableId')
      .populate('customerId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, tenantId: string): Promise<Order> {
    const order = await this.orderModel
      .findOne({ _id: id, tenantId })
      .populate('createdBy', 'name email role')
      .populate('tableId')
      .populate('customerId')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus, tenantId: string): Promise<Order> {
    const updateData: any = { status };

    if (status === OrderStatus.COMPLETED) {
      updateData.completedAt = new Date();
      updateData.isPaid = true;
      updateData.paidAt = new Date();
    }

    const order = await this.orderModel
      .findOneAndUpdate({ _id: id, tenantId }, updateData, { new: true })
      .populate('createdBy', 'name email role')
      .populate('tableId')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Broadcast to kitchen when order is confirmed
    if (status === OrderStatus.CONFIRMED) {
      this.kitchenGateway.broadcastNewOrder(tenantId, order);
    }

    // Broadcast to kitchen when order is cancelled
    if (status === OrderStatus.CANCELLED) {
      this.kitchenGateway.broadcastOrderCancelled(tenantId, order);
    }

    return order;
  }

  async updateItemStatus(
    orderId: string,
    itemId: string,
    status: OrderItemStatus,
    userId: string,
    tenantId: string,
  ): Promise<Order> {
    const order = await this.orderModel.findOne({ _id: orderId, tenantId });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const item = order.items.find(i => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    item.status = status;
    if (status === OrderItemStatus.READY || status === OrderItemStatus.SERVED) {
      item.preparedBy = userId as any;
      item.preparedAt = new Date();
    }

    // Auto-update order status based on item statuses
    const allItemsReady = order.items.every(i =>
      i.status === OrderItemStatus.READY || i.status === OrderItemStatus.SERVED
    );
    const allItemsServed = order.items.every(i => i.status === OrderItemStatus.SERVED);

    if (allItemsServed && order.status !== OrderStatus.COMPLETED) {
      order.status = OrderStatus.SERVED;
    } else if (allItemsReady && order.status === OrderStatus.PREPARING) {
      order.status = OrderStatus.READY;
    }

    await order.save();

    return this.findOne(orderId, tenantId);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const order = await this.orderModel.findOne({ _id: id, tenantId });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot delete completed orders');
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();
  }

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const today = new Date();
    const prefix = `ORD${today.getFullYear()}${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;

    const lastOrder = await this.orderModel
      .findOne({ orderNumber: new RegExp(`^${prefix}`), tenantId })
      .sort({ orderNumber: -1 })
      .exec();

    if (!lastOrder) {
      return `${prefix}001`;
    }

    const lastNumber = parseInt(lastOrder.orderNumber.slice(-3));
    const newNumber = (lastNumber + 1).toString().padStart(3, '0');
    return `${prefix}${newNumber}`;
  }
}
