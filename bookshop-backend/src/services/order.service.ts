import { v4 as uuidv4 } from 'uuid';
import { db, Order } from '../db/database';
import { CreateOrderRequest, UpdateOrderStatusRequest } from '../validators/order.validator';
import { auditService } from './audit.service';
import { buildPagination } from '../utils/pagination';

// Reference: context/02-domain/03-business-rules/order-rules.md

export class OrderService {
  // US-008: Create Order (Most Complex - with stock validation and deduction)
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    // Use transaction for atomic operation
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

      // BR-ORDER-001: Check stock availability
      if (book.stock < request.quantity) {
        const error: any = new Error('Insufficient stock available');
        error.details = {
          bookId: request.bookId,
          requested: request.quantity,
          available: book.stock,
        };
        throw error;
      }

      // BR-ORDER-003: Ensure stock won't go negative (already checked above)
      const newStock = book.stock - request.quantity;

      // Create order
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

      // BR-ORDER-002: Automatic stock deduction
      await trx.updateBook(request.bookId, { stock: newStock });

      // Record stock movement
      await trx.recordStockMovement({
        id: uuidv4(),
        bookId: request.bookId,
        oldStock: book.stock,
        newStock,
        quantity: -request.quantity,
        reason: 'order_deduction',
        referenceId: order.id,
        createdAt: new Date(),
      });

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
    // Verify order exists
    const order = await db.findOrderById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // BR-ORDER-005: Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ['shipped'],
      shipped: ['delivered'],
      delivered: [], // Final status
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

    // Update status
    const updated = await db.updateOrder(id, { status: request.status });
    if (!updated) {
      throw new Error('Failed to update order');
    }

    await auditService.log('order', id, 'updated', order, updated);
    return updated;
  }
}

export const orderService = new OrderService();
