import { db } from '../db/database';

class AnalyticsService {
  async getSalesByMonth() {
    return await db.getSalesByMonth();
  }
}

export const analyticsService = new AnalyticsService();
