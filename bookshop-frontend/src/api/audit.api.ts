import apiClient from './client';
import type { AuditEntry, PaginatedResponse } from '../types';

export interface AuditFilters {
  entityType?: string;
  entityId?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export const auditApi = {
  getAll: (filters: AuditFilters = {}): Promise<PaginatedResponse<AuditEntry>> =>
    apiClient.get('/audit-log', { params: filters }),
};
