import { db } from '../db/database';
import { toCsv } from '../utils/csv';

export class ExportService {
  async exportBooks(): Promise<string> {
    const books = await db.findAllBooks();
    return toCsv(books, [
      { key: 'id', header: 'id' },
      { key: 'title', header: 'title' },
      { key: 'author', header: 'author' },
      { key: 'price', header: 'price' },
      { key: 'stock', header: 'stock' },
      { key: 'categoryId', header: 'categoryId' },
      { key: 'createdAt', header: 'createdAt' },
      { key: 'updatedAt', header: 'updatedAt' },
    ]);
  }

  async exportCustomers(): Promise<string> {
    const customers = await db.findAllCustomers();
    return toCsv(customers, [
      { key: 'id', header: 'id' },
      { key: 'name', header: 'name' },
      { key: 'email', header: 'email' },
      { key: 'phone', header: 'phone' },
      { key: 'address', header: 'address' },
      { key: 'createdAt', header: 'createdAt' },
    ]);
  }

  async exportOrders(): Promise<string> {
    const orders = await db.findAllOrders();
    return toCsv(orders, [
      { key: 'id', header: 'id' },
      { key: 'customerId', header: 'customerId' },
      { key: 'bookId', header: 'bookId' },
      { key: 'quantity', header: 'quantity' },
      { key: 'totalPrice', header: 'totalPrice' },
      { key: 'status', header: 'status' },
      { key: 'createdAt', header: 'createdAt' },
    ]);
  }
}

export const exportService = new ExportService();
