import { v4 as uuidv4 } from 'uuid';
import { db, Order } from '../db/database';
import { CreateOrderRequest, UpdateOrderStatusRequest, CancelOrderRequest } from '../validators/order.validator';
import { auditService } from './audit.service';
import { buildPagination } from '../utils/pagination';

// Reference: context/02-domain/03-business-rules/order-rules.md

export class OrderService {
  // US-008: Create Order
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    return await db.transaction(async (trx) => {
      // BR-ORDER-010: Validate customer exists
      const customer = await trx.findCustomerById(request.customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // BR-ORDER-001: Validate book exists
      const book = await trx.findBookById(request.bookId);
      if (!book) {
        throw new Error('Book not found');
      }

      // Create order — no stock impact until delivery
      const order: Order = {
        id: uuidv4(),
        customerId: request.customerId,
        bookId: request.bookId,
        quantity: request.quantity,
        totalPrice: book.price * request.quantity,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await trx.createOrder(order);
      return order;
    }).then(async (order) => {
      await auditService.log('order', order.id, 'created', null, order);
      return order;
    });
  }

  // List Orders (paginated)
  async listOrders(page = 1, limit = 20, filters?: { status?: string; customerId?: string; month?: string }) {
    const { data, total } = await db.findAllOrdersPaginated(page, limit, filters);
    return { data, pagination: buildPagination(page, limit, total) };
  }

  // Get Order by ID
  async getOrder(id: string): Promise<Order> {
    const order = await db.findOrderById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  // US-009: Update Order Status
  async updateOrderStatus(id: string, request: UpdateOrderStatusRequest): Promise<Order> {
    const order = await db.findOrderById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // BR-ORDER-005: Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed'],
      confirmed: ['shipped'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
      returned: [],
    };

    const allowedNextStatuses = validTransitions[order.status];
    if (!allowedNextStatuses.includes(request.status)) {
      const error: any = new Error('Invalid status transition');
      error.details = {
        currentStatus: order.status,
        requestedStatus: request.status,
        message: `Cannot change status from ${order.status} to ${request.status}`,
      };
      throw error;
    }

    // Deduct stock only when delivering
    if (request.status === 'delivered') {
      return await db.transaction(async (trx) => {
        const book = await trx.findBookById(order.bookId);
        if (!book) {
          throw new Error('Book not found');
        }

        if (book.stock < order.quantity) {
          const error: any = new Error('Insufficient stock available for delivery');
          error.details = {
            bookId: order.bookId,
            requested: order.quantity,
            available: book.stock,
          };
          throw error;
        }

        const newStock = book.stock - order.quantity;
        await trx.updateBook(order.bookId, { stock: newStock });

        await trx.recordStockMovement({
          id: uuidv4(),
          bookId: order.bookId,
          oldStock: book.stock,
          newStock,
          quantity: -order.quantity,
          reason: 'order_deduction',
          referenceId: order.id,
          createdAt: new Date(),
        });

        const updated = await trx.updateOrder(id, { status: request.status });
        if (!updated) {
          throw new Error('Failed to update order');
        }

        await auditService.log('order', id, 'updated', order, updated);
        return updated;
      });
    }

    // Non-delivery transitions — no stock impact
    const updated = await db.updateOrder(id, { status: request.status });
    if (!updated) {
      throw new Error('Failed to update order');
    }

    await auditService.log('order', id, 'updated', order, updated);
    return updated;
  }

  // Cancel Order — allowed from 'pending' or 'confirmed' status
  async cancelOrder(id: string, request: CancelOrderRequest): Promise<Order> {
    const order = await db.findOrderById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      const error: any = new Error('Invalid status transition');
      error.details = {
        currentStatus: order.status,
        requestedStatus: 'cancelled',
        message: `Cannot cancel order with status ${order.status}. Only pending or confirmed orders can be cancelled.`,
      };
      throw error;
    }

    // Cancel — no stock impact (stock is only deducted at delivery)
    const updated = await db.updateOrder(id, {
      status: 'cancelled',
      cancelReason: request.reason || undefined,
    });

    if (!updated) {
      throw new Error('Failed to cancel order');
    }

    await auditService.log('order', id, 'updated', order, updated);
    return updated;
  }
}

export const orderService = new OrderService();
