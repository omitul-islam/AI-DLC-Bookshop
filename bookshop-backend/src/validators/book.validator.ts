import { z } from 'zod';

// Reference: context/02-domain/03-business-rules/book-rules.md

// BR-BOOK-001: Required fields
// BR-BOOK-002: Price >= 0
// BR-BOOK-003: Stock >= 0 and integer
export const CreateBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  author: z.string().min(1, 'Author is required').max(255),
  price: z.number().min(0, 'Price must be zero or greater'),
  stock: z.number().int('Stock must be a whole number').min(0, 'Stock must be zero or greater'),
  categoryId: z.string().min(1, 'Category is required'),
  coverUrl: z.string().url('Invalid URL').max(500).optional(),
});

// BR-BOOK-004: Update validation - all fields optional but must be valid if provided
export const UpdateBookSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  author: z.string().min(1).max(255).optional(),
  price: z.number().min(0, 'Price must be zero or greater').optional(),
  stock: z.number().int('Stock must be a whole number').min(0, 'Stock must be zero or greater').optional(),
  categoryId: z.string().min(1).optional(),
  coverUrl: z.string().url('Invalid URL').max(500).optional(),
});

// BR-BOOK-006: Search query validation
export const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query cannot be empty'),
});

export type CreateBookRequest = z.infer<typeof CreateBookSchema>;
export type UpdateBookRequest = z.infer<typeof UpdateBookSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
