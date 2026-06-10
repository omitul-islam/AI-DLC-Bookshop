import { Router, Request, Response } from 'express';
import { exportService } from '../services/export.service';

const router = Router();

const VALID_ENTITIES = ['books', 'customers', 'orders'] as const;

router.get('/:entity', async (req: Request, res: Response) => {
  try {
    const entity = req.params.entity;

    if (!VALID_ENTITIES.includes(entity as any)) {
      return res.status(400).json({
        error: 'Invalid entity',
        details: { entity: `Must be one of: ${VALID_ENTITIES.join(', ')}` },
      });
    }

    const capitalized = entity.charAt(0).toUpperCase() + entity.slice(1);
    const csv = await (exportService as any)[`export${capitalized}`]();

    const date = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${entity}-${date}.csv"`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
