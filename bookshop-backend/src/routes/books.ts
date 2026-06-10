import { Router, Request, Response } from 'express';
import { bookService } from '../services/book.service';
import {
  CreateBookSchema,
  UpdateBookSchema,
  SearchQuerySchema,
} from '../validators/book.validator';
import { PaginationSchema } from '../validators/pagination.validator';

// Reference: context/06-contracts/01-apis/rest/books.yaml

const router = Router();

// POST /api/v1/books - US-001: Add Book
router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = CreateBookSchema.parse(req.body);
    const book = await bookService.addBook(validated);
    res.status(201).json(book);
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

// GET /api/v1/books - US-002: View All Books (paginated)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    const result = await bookService.listBooks(page, limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/books/search - US-005: Search Books (paginated)
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = SearchQuerySchema.parse(req.query);
    const { page, limit } = PaginationSchema.parse(req.query);
    const result = await bookService.searchBooks(q, page, limit);
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Search query cannot be empty',
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/books/:id - Get Book by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const book = await bookService.getBook(req.params.id);
    res.json(book);
  } catch (error: any) {
    if (error.message === 'Book not found') {
      return res.status(404).json({ error: error.message, bookId: req.params.id });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/books/:id - US-003: Update Book
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validated = UpdateBookSchema.parse(req.body);
    const book = await bookService.updateBook(req.params.id, validated);
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
    if (error.message === 'Book not found') {
      return res.status(404).json({ error: error.message, bookId: req.params.id });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/books/:id - US-004: Delete Book
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await bookService.deleteBook(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Book not found') {
      return res.status(404).json({ error: error.message, bookId: req.params.id });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
