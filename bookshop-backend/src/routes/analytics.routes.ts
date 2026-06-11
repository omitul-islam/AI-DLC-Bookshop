import { Router, Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';

const router = Router();

router.get('/sales-by-month', async (req: Request, res: Response) => {
  try {
    const result = await analyticsService.getSalesByMonth();
    res.json(result);
  } catch (error: any) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
