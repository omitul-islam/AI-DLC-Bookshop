import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { auditService } from '../services/audit.service';

const router = Router();

const AuditLogQuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  action: z.enum(['created', 'updated', 'deleted']).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const validated = AuditLogQuerySchema.parse(req.query);
    const result = await auditService.getLogs(validated);
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

export default router;
