import { Router, Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
} from '../validators/category.validator';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = CreateCategorySchema.parse(req.body);
    const category = await categoryService.addCategory(validated);
    res.status(201).json(category);
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
    if (error.message === 'Category with this name already exists') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.listCategories();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getCategory(req.params.id);
    res.json(category);
  } catch (error: any) {
    if (error.message === 'Category not found') {
      return res.status(404).json({ error: error.message, categoryId: req.params.id });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validated = UpdateCategorySchema.parse(req.body);
    const category = await categoryService.updateCategory(req.params.id, validated);
    res.json(category);
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
    if (error.message === 'Category not found') {
      return res.status(404).json({ error: error.message, categoryId: req.params.id });
    }
    if (error.message === 'Category with this name already exists') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Category not found') {
      return res.status(404).json({ error: error.message, categoryId: req.params.id });
    }
    if (error.message.includes('Cannot delete category')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
