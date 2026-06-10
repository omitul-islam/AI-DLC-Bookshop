import { v4 as uuidv4 } from 'uuid';
import { db, AuditEntry } from '../db/database';
import { buildPagination } from '../utils/pagination';

export class AuditService {
  async log(
    entityType: string,
    entityId: string,
    action: 'created' | 'updated' | 'deleted',
    previousState?: any,
    newState?: any,
    performedBy?: string
  ) {
    const entry: AuditEntry = {
      id: uuidv4(),
      entityType,
      entityId,
      action,
      previousState,
      newState,
      performedBy: performedBy || 'system',
      createdAt: new Date(),
    };
    await db.createAuditLog(entry);
  }

  async getLogs(filters: {
    entityType?: string;
    entityId?: string;
    action?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const { data, total } = await db.getAuditLog({ ...filters, page, limit });
    return { data, pagination: buildPagination(page, limit, total) };
  }
}

export const auditService = new AuditService();
