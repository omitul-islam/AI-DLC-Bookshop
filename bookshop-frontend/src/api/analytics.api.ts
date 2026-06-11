import apiClient from './client';

export interface MonthlySales {
  month: string;
  totalOrders: number;
  booksSold: number;
  revenue: number;
  avgOrderValue: number;
  topBook: string | null;
  trend: 'up' | 'down' | 'flat';
  trendPercent: number;
}

export interface AnalyticsSummary {
  currentMonthRevenue: number;
  currentMonthOrders: number;
  currentMonthBooksSold: number;
  trend: string;
  trendPercent: number;
  ytdRevenue: number;
}

export const analyticsApi = {
  getSalesByMonth: (): Promise<{ summary: AnalyticsSummary; months: MonthlySales[] }> =>
    apiClient.get('/analytics/sales-by-month'),
};
