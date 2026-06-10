import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpenIcon, XCircleIcon, ExclamationTriangleIcon,
  ArrowRightIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useBooks } from '../hooks/useBooks';
import { Card } from '../components/common/Card';
import { Alert } from '../components/common/Alert';
import { EmptyState } from '../components/common/EmptyState';

const LOW_STOCK_THRESHOLD = 5;

function StatsCard({ icon, label, value, bgColor }: {
  icon: React.ReactNode; label: string; value: string | number;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6 transition-shadow duration-150 hover:shadow-card-hover">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${bgColor}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-4" />
          {[1, 2, 3].map((j) => (
            <div key={j} className="h-10 bg-gray-100 rounded animate-pulse mb-2 last:mb-0" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { books, loading, fetchBooks } = useBooks();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks().catch((err: any) => {
      setError(err.message || 'Failed to load dashboard data');
    });
  }, [fetchBooks]);

  const stats = useMemo(() => {
    const total = books.length;
    const outOfStock = books.filter((b) => b.stock === 0).length;
    const lowStock = books.filter((b) => b.stock > 0 && b.stock < LOW_STOCK_THRESHOLD).length;
    const totalValue = books.reduce((sum, b) => sum + b.price * b.stock, 0);
    return { total, outOfStock, lowStock, totalValue };
  }, [books]);

  const recentBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [books]);

  const lowStockBooks = useMemo(() => {
    return books
      .filter((b) => b.stock < LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.stock - b.stock);
  }, [books]);

  if (loading && books.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="text-center py-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookshop Management</h1>
          <p className="text-sm text-gray-500">Loading your dashboard...</p>
        </div>
        <SkeletonStats />
        <SkeletonSection />
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="text-center py-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookshop Management</h1>
        </div>
        <Alert
          variant="error"
          title="Failed to load dashboard"
          message={error}
          onClose={() => { setError(null); fetchBooks(); }}
        />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="text-center py-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookshop Management</h1>
        </div>
        <EmptyState
          icon={<BookOpenIcon className="w-8 h-8 text-gray-400" />}
          title="No books yet"
          message="Add your first book to start managing your inventory."
          action={{ label: 'Add Book', onClick: () => navigate('/books') }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center py-8 mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-white mb-4 shadow-lg shadow-primary/25">
          <BookOpenIcon className="w-5 h-5" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookshop Management</h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Manage your inventory, customers, and orders all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          icon={<BookOpenIcon className="w-6 h-6 text-blue-600" />}
          label="Total Books"
          value={stats.total}
          bgColor="bg-blue-50"
        />
        <StatsCard
          icon={<XCircleIcon className="w-6 h-6 text-red-500" />}
          label="Out of Stock"
          value={stats.outOfStock}
          bgColor="bg-red-50"
        />
        <StatsCard
          icon={<ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />}
          label="Low Stock"
          value={stats.lowStock}
          bgColor="bg-amber-50"
        />
        <StatsCard
          icon={
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Total Value"
          value={`$${stats.totalValue.toFixed(2)}`}
          bgColor="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Books</h2>
            <Link to="/books" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1">
              View All <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="text-right pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-right pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-2 font-medium text-gray-900 truncate max-w-[140px]">{book.title}</td>
                    <td className="py-2.5 pr-2 text-gray-600 truncate max-w-[120px]">{book.author}</td>
                    <td className="py-2.5 text-right font-mono text-gray-700">${book.price.toFixed(2)}</td>
                    <td className="py-2.5 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        book.stock === 0 ? 'bg-red-50 text-red-700' :
                        book.stock < 5 ? 'bg-amber-50 text-amber-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {book.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Low Stock Alerts</h2>
            <Link to="/books" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1">
              View All <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          {lowStockBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-0.5">All well-stocked</p>
              <p className="text-xs text-gray-500">All books have {LOW_STOCK_THRESHOLD}+ units in stock.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockBooks.map((book) => (
                <div key={book.id} className="flex items-center justify-between py-2.5 px-3.5 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-amber-800 truncate">{book.title}</p>
                      <p className="text-xs text-amber-600">Stock: {book.stock} {book.stock === 1 ? 'unit' : 'units'}</p>
                    </div>
                  </div>
                  <Link
                    to={`/books`}
                    className="text-xs font-medium text-amber-700 hover:text-amber-800 underline shrink-0 ml-3"
                  >
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}