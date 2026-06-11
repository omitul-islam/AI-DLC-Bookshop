import { Router, Request, Response } from 'express';
import { orderService } from '../services/order.service';
import {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
} from '../validators/order.validator';
import { PaginationSchema } from '../validators/pagination.validator';

// Reference: context/06-contracts/01-apis/rest/orders.yaml

const router = Router();

// POST /api/v1/orders - US-008: Create Order
router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = CreateOrderSchema.parse(req.body);
    const order = await orderService.createOrder(validated);
    res.status(201).json(order);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.reduce((acc: any, err: any) => {
          acc[err.path[0]] = err.message;
          return acc
        }, {}),
      });
    }
    if (error.message === 'Customer not found' || error.message === 'Book not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Insufficient stock available') {
      return res.status(400).json({
        error: error.message,
        details: error.details,
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/orders - List Orders (paginated, with optional filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    const filters: any = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.customerId) filters.customerId = req.query.customerId;
    if (req.query.month) filters.month = req.query.month;

    const result = await orderService.listOrders(page, limit, filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/orders/:id - Get Order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await orderService.getOrder(req.params.id);
    res.json(order);
  } catch (error: any) {
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: error.message, orderId: req.params.id });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/orders/:id/status - US-009: Update Order Status
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const validated = UpdateOrderStatusSchema.parse(req.body);
    const order = await orderService.updateOrderStatus(req.params.id, validated);
    res.json(order);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.reduce((acc: any, err: any) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {}),
      });
    }
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: error.message, orderId: req.params.id });
    }
    if (error.message === 'Invalid status transition') {
      return res.status(400).json({
        error: error.message,
        details: error.details,
      });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
