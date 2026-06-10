import { Router, Request, Response } from 'express';
import { customerService } from '../services/customer.service';
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
} from '../validators/customer.validator';
import { PaginationSchema } from '../validators/pagination.validator';

// Reference: context/06-contracts/01-apis/rest/customers.yaml

const router = Router();

// POST /api/v1/customers - US-006: Add Customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = CreateCustomerSchema.parse(req.body);
    const customer = await customerService.addCustomer(validated);
    res.status(201).json(customer);
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
    if (error.message === 'Email is already registered') {
      return res.status(400).json({
        error: 'Validation failed',
        details: { email: error.message },
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/customers/search - Search customers by name, email, or phone
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query cannot be empty' });
    }
    const { page, limit } = PaginationSchema.parse(req.query);
    const result = await customerService.searchCustomers(q, page, limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/customers - US-007: View Customers (paginated)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    const result = await customerService.listCustomers(page, limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/customers/:id - Get Customer by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const customer = await customerService.getCustomer(req.params.id);
    res.json(customer);
  } catch (error: any) {
    if (error.message === 'Customer not found') {
      return res.status(404).json({ error: error.message, customerId: req.params.id });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/customers/:id - Update Customer
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validated = UpdateCustomerSchema.parse(req.body);
    const customer = await customerService.updateCustomer(req.params.id, validated);
    res.json(customer);
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
    if (error.message === 'Customer not found') {
      return res.status(404).json({ error: error.message, customerId: req.params.id });
    }
    if (error.message === 'Email is already registered') {
      return res.status(400).json({
        error: 'Validation failed',
        details: { email: error.message },
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/customers/:id - Delete Customer
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await customerService.deleteCustomer(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Customer not found') {
      return res.status(404).json({ error: error.message, customerId: req.params.id });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
