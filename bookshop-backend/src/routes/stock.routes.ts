import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { stockService } from '../services/stock.service';
import { PaginationSchema } from '../validators/pagination.validator';

const router = Router();

const AdjustStockSchema = z.object({
  newStock: z.number().int().min(0),
  reason: z.enum(['manual_restock', 'manual_adjustment', 'correction']),
});

router.get('/books/:id/stock-movements', async (req: Request, res: Response) => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    const result = await stockService.getMovements(req.params.id, page, limit);
    res.json(result);
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
    res.status(500).json({ error: error.message });
  }
});

router.post('/books/:id/stock-adjust', async (req: Request, res: Response) => {
  try {
    const validated = AdjustStockSchema.parse(req.body);
    const book = await stockService.adjustStock(req.params.id, validated.newStock, validated.reason);
    res.json(book);
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
    res.status(500).json({ error: error.message });
  }
});

export default router;
