import { db } from '../db/database';
import { buildPagination } from '../utils/pagination';

export class StockService {
  async getMovements(bookId: string, page: number = 1, limit: number = 20) {
    const { data, total } = await db.getStockMovements(bookId, page, limit);
    return { data, pagination: buildPagination(page, limit, total) };
  }

  async adjustStock(bookId: string, newStock: number, reason: string, referenceId?: string) {
    return await db.adjustStock(bookId, newStock, reason, referenceId);
  }
}

export const stockService = new StockService();
