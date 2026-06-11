import { useNavigate } from 'react-router-dom';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';

function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatMonth(monthStr: string): string {
  const [y, m] = monthStr.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${y}`;
}

function TrendBadge({ trend, percent }: { trend: string; percent: number }) {
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600">
        <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
        {percent}%
      </span>
    );
  }
  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600">
        <ArrowTrendingDownIcon className="w-3.5 h-3.5" />
        {Math.abs(percent)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-400">
      <MinusIcon className="w-3.5 h-3.5" />
    </span>
  );
}

export function MonthlySalesPanel() {
  const { months, summary, loading, error, refetch } = useAnalytics();
  const navigate = useNavigate();

  if (error) {
    return (
      <Card>
        <Alert
          variant="error"
          title="Failed to load sales data"
          message={error}
          onClose={refetch}
        />
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <div className="h-4 shimmer w-40 mb-4" />
        <div className="h-8 shimmer w-full mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 shimmer" />)}
        </div>
      </Card>
    );
  }

  if (!summary || months.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<CurrencyDollarIcon className="w-8 h-8 text-gray-400" />}
          title="No sales data yet"
          message="Orders will appear here once customers start purchasing."
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Monthly Sales</h2>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 rounded-lg p-4 mb-4 border border-indigo-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">This Month</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.currentMonthRevenue)}</p>
            <TrendBadge trend={summary.trend} percent={summary.trendPercent} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Orders</p>
            <p className="text-lg font-bold text-gray-900">{summary.currentMonthOrders}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Books Sold</p>
            <p className="text-lg font-bold text-gray-900">{summary.currentMonthBooksSold}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">YTD Revenue</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.ytdRevenue)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sold</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg</th>
              <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Book</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {months.map((m) => (
              <tr
                key={m.month}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/orders?month=${m.month.split('T')[0].substring(0, 7)}`)}
              >
                <td className="py-2.5 pr-2 font-medium text-gray-900">{formatMonth(m.month)}</td>
                <td className="py-2.5 text-right text-gray-700">{m.totalOrders}</td>
                <td className="py-2.5 text-right text-gray-700">{m.booksSold}</td>
                <td className="py-2.5 text-right font-mono text-gray-900 font-medium">{formatCurrency(m.revenue)}</td>
                <td className="py-2.5 text-right text-gray-600">{formatCurrency(m.avgOrderValue)}</td>
                <td className="py-2.5 px-2 text-gray-700 truncate max-w-[120px]">{m.topBook || '—'}</td>
                <td className="py-2.5 text-right"><TrendBadge trend={m.trend} percent={m.trendPercent} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
