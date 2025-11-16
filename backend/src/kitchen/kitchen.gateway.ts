import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

/**
 * Kitchen Display WebSocket Gateway
 * Provides real-time updates for kitchen staff
 */
@WebSocketGateway({
  namespace: '/kitchen',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class KitchenGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('KitchenGateway');

  /**
   * Handle client connection
   */
  handleConnection(client: Socket) {
    this.logger.log(`Kitchen client connected: ${client.id}`);
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Kitchen client disconnected: ${client.id}`);
  }

  /**
   * Subscribe to tenant's kitchen updates
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tenantId: string },
  ) {
    const { tenantId } = data;
    client.join(`kitchen:${tenantId}`);
    this.logger.log(`Client ${client.id} subscribed to kitchen:${tenantId}`);
    return { event: 'subscribed', data: { tenantId } };
  }

  /**
   * Unsubscribe from tenant's kitchen updates
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tenantId: string },
  ) {
    const { tenantId } = data;
    client.leave(`kitchen:${tenantId}`);
    this.logger.log(`Client ${client.id} unsubscribed from kitchen:${tenantId}`);
    return { event: 'unsubscribed', data: { tenantId } };
  }

  /**
   * Broadcast new order to kitchen
   */
  broadcastNewOrder(tenantId: string, order: Order) {
    this.server.to(`kitchen:${tenantId}`).emit('order:new', {
      order,
      timestamp: new Date(),
    });
    this.logger.log(
      `Broadcasting new order ${order.orderNumber} to kitchen:${tenantId}`,
    );
  }

  /**
   * Broadcast order update
   */
  broadcastOrderUpdate(tenantId: string, order: Order) {
    this.server.to(`kitchen:${tenantId}`).emit('order:updated', {
      order,
      timestamp: new Date(),
    });
    this.logger.log(
      `Broadcasting order update ${order.orderNumber} to kitchen:${tenantId}`,
    );
  }

  /**
   * Broadcast item ready notification
   */
  broadcastItemReady(tenantId: string, order: OrderDocument, itemId: string) {
    this.server.to(`kitchen:${tenantId}`).emit('item:ready', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      itemId,
      timestamp: new Date(),
    });
    this.logger.log(
      `Broadcasting item ${itemId} ready for order ${order.orderNumber}`,
    );
  }

  /**
   * Broadcast order ready notification (all items ready)
   */
  broadcastOrderReady(tenantId: string, order: Order) {
    this.server.to(`kitchen:${tenantId}`).emit('order:ready', {
      order,
      timestamp: new Date(),
    });
    this.logger.log(
      `Broadcasting order ready ${order.orderNumber} to kitchen:${tenantId}`,
    );
  }

  /**
   * Broadcast order cancelled
   */
  broadcastOrderCancelled(tenantId: string, order: OrderDocument) {
    this.server.to(`kitchen:${tenantId}`).emit('order:cancelled', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      timestamp: new Date(),
    });
    this.logger.log(
      `Broadcasting order cancelled ${order.orderNumber} to kitchen:${tenantId}`,
    );
  }
}
