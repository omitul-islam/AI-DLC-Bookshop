import { Router, Request, Response } from 'express';
import { ZodError } from 'zod';
import { orderService } from '../services/order.service';
import {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
  CancelOrderSchema,
  ReturnOrderSchema,
} from '../validators/order.validator';
import { PaginationSchema } from '../validators/pagination.validator';

type ErrorDetails = Record<string, string | number | undefined>;

function handleError(res: Response, error: unknown, status = 500) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.errors.reduce((acc: ErrorDetails, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {}),
    });
  }

  if (error instanceof Error) {
    const err = error as Error & { details?: ErrorDetails };

    if (err.message === 'Order not found') {
      return res.status(404).json({ error: err.message });
    }

    if (err.message === 'Customer not found' || err.message === 'Book not found') {
      return res.status(404).json({ error: err.message });
    }

    if (err.message === 'Invalid status transition') {
      return res.status(400).json({
        error: err.message,
        details: err.details,
      });
    }

    return res.status(status).json({ error: err.message });
  }

  return res.status(500).json({ error: 'An unexpected error occurred' });
}

const router = Router();

// POST /api/v1/orders - US-008: Create Order
router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = CreateOrderSchema.parse(req.body);
    const order = await orderService.createOrder(validated);
    res.status(201).json(order);
  } catch (error: unknown) {
    handleError(res, error);
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
  } catch (error: unknown) {
    handleError(res, error);
  }
});

// GET /api/v1/orders/:id - Get Order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await orderService.getOrder(req.params.id);
    res.json(order);
  } catch (error: unknown) {
    handleError(res, error);
  }
});

// PUT /api/v1/orders/:id/status - US-009: Update Order Status
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const validated = UpdateOrderStatusSchema.parse(req.body);
    const order = await orderService.updateOrderStatus(req.params.id, validated);
    res.json(order);
  } catch (error: unknown) {
    handleError(res, error);
  }
});

// PUT /api/v1/orders/:id/return — Return delivered order
router.put('/:id/return', async (req: Request, res: Response) => {
  try {
    const validated = ReturnOrderSchema.parse(req.body);
    const order = await orderService.returnOrder(req.params.id, validated);
    res.json(order);
  } catch (error: unknown) {
    handleError(res, error);
  }
});

// PUT /api/v1/orders/:id/cancel — Cancel pending order
router.put('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const validated = CancelOrderSchema.parse(req.body);
    const order = await orderService.cancelOrder(req.params.id, validated);
    res.json(order);
  } catch (error: unknown) {
    handleError(res, error);
  }
});

export default router;
