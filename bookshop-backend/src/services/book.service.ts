import { v4 as uuidv4 } from 'uuid';
import { db, Book } from '../db/database';
import { CreateBookRequest, UpdateBookRequest } from '../validators/book.validator';
import { auditService } from './audit.service';
import { buildPagination } from '../utils/pagination';

// Reference: context/05-modules/02-book-management/book-management.md

export class BookService {
  // US-001: Add Book
  async addBook(request: CreateBookRequest): Promise<Book> {
    const category = await db.findCategoryById(request.categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    const book: Book = {
      id: uuidv4(),
      title: request.title,
      author: request.author,
      price: request.price,
      stock: request.stock,
      categoryId: request.categoryId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await db.createBook(book);
    await auditService.log('book', created.id, 'created', null, created);
    return created;
  }

  // US-002: View All Books (paginated)
  async listBooks(page = 1, limit = 20) {
    const { data, total } = await db.findAllBooksPaginated(page, limit);
    return { data, pagination: buildPagination(page, limit, total) };
  }

  // Get Book by ID
  async getBook(id: string): Promise<Book> {
    const book = await db.findBookById(id);
    if (!book) {
      throw new Error('Book not found');
    }
    return book;
  }

  // US-003: Update Book
  async updateBook(id: string, request: UpdateBookRequest): Promise<Book> {
    // BR-BOOK-004: Verify book exists
    const existing = await db.findBookById(id);
    if (!existing) {
      throw new Error('Book not found');
    }

    // Merge updates with existing data
    const updated = await db.updateBook(id, request);
    if (!updated) {
      throw new Error('Failed to update book');
    }

    await auditService.log('book', id, 'updated', existing, updated);
    return updated;
  }

  // US-004: Delete Book
  async deleteBook(id: string): Promise<void> {
    // BR-BOOK-005: Verify book exists
    const existing = await db.findBookById(id);
    if (!existing) {
      throw new Error('Book not found');
    }

    const deleted = await db.deleteBook(id);
    if (!deleted) {
      throw new Error('Failed to delete book');
    }

    await auditService.log('book', id, 'deleted', existing, null);
  }

  // US-005: Search Books (paginated)
  async searchBooks(query: string, page = 1, limit = 20) {
    // BR-BOOK-007: Search by title OR author (case-insensitive, partial match)
    const { data, total } = await db.searchBooksPaginated(query, page, limit);
    return { data, pagination: buildPagination(page, limit, total) };
  }
}

export const bookService = new BookService();
