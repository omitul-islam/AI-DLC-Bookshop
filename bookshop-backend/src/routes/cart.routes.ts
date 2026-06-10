import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db, type Order } from '../db/database';

const router = Router();

const CartValidateSchema = z.object({
  items: z.array(z.object({
    bookId: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).min(1),
});

const CheckoutSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    bookId: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).min(1),
});

router.post('/cart/validate', async (req: Request, res: Response) => {
  try {
    const { items } = CartValidateSchema.parse(req.body);
    const errors: { bookId: string; title: string; requested: number; available: number }[] = [];

    for (const item of items) {
      const book = await db.findBookById(item.bookId);
      if (!book) {
        errors.push({ bookId: item.bookId, title: 'Unknown', requested: item.quantity, available: 0 });
      } else if (book.stock < item.quantity) {
        errors.push({ bookId: item.bookId, title: book.title, requested: item.quantity, available: book.stock });
      }
    }

    res.json({ valid: errors.length === 0, errors });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

router.post('/cart/checkout', async (req: Request, res: Response) => {
  try {
    const { customerId, items } = CheckoutSchema.parse(req.body);

    const result = await db.transaction(async (txDb) => {
      const customer = await txDb.findCustomerById(customerId);
      if (!customer) throw new Error('Customer not found');

      const checkoutItems: { bookId: string; title: string; quantity: number; unitPrice: number; subtotal: number }[] = [];
      let totalPrice = 0;

      for (const item of items) {
        const book = await txDb.findBookById(item.bookId);
        if (!book) throw new Error(`Book not found: ${item.bookId}`);
        if (book.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${book.title}": requested ${item.quantity}, available ${book.stock}`);
        }

        const unitPrice = book.price;
        const subtotal = unitPrice * item.quantity;
        totalPrice += subtotal;

        const oldStock = book.stock;
        const newStock = oldStock - item.quantity;

        const order: Order = {
          id: uuidv4(),
          customerId,
          bookId: item.bookId,
          quantity: item.quantity,
          totalPrice: subtotal,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await txDb.createOrder(order);

        await txDb.updateBook(item.bookId, { stock: newStock });

        await txDb.recordStockMovement({
          id: uuidv4(),
          bookId: item.bookId,
          oldStock,
          newStock,
          quantity: -item.quantity,
          reason: 'order_deduction',
          referenceId: order.id,
          createdAt: new Date(),
        });

        await txDb.createAuditLog({
          id: uuidv4(),
          entityType: 'order',
          entityId: order.id,
          action: 'created',
          previousState: null,
          newState: { ...order },
          performedBy: 'system',
          createdAt: new Date(),
        });

        checkoutItems.push({
          bookId: item.bookId,
          title: book.title,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        });
      }

      return { items: checkoutItems, totalPrice };
    });

    res.status(201).json({
      checkoutId: uuidv4(),
      status: 'pending',
      totalPrice: result.totalPrice,
      items: result.items,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
    if (error.message.includes('Insufficient stock')) return res.status(400).json({ error: error.message });
    res.status(500).json({ error: error.message });
  }
});

export default router;
