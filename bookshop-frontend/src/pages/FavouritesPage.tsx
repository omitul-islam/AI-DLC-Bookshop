import { useState, useMemo, useEffect } from 'react';
import { HeartIcon, ShoppingBagIcon, TrashIcon } from '@heroicons/react/24/outline';
import { booksApi } from '../api/books.api';
import { useFavoritesContext } from '../context/FavoritesContext';
import { useCartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../layouts/PageHeader';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { Table, type Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import type { Book } from '../types';

interface FavoriteBook {
  id: string;
  title: string;
  author: string;
  price: number;
  coverUrl?: string | null;
  stock: number;
  categoryName?: string;
}

export function FavouritesPage() {
  const { favorites, toggleFavorite, removeFavorite, clearFavorites } = useFavoritesContext();
  const { addItem } = useCartContext();
  const toast = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) {
      setBooks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    booksApi.getAll(1, 100)
      .then(({ data }) => setBooks(data))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [favorites.length]);

  const favBooks: FavoriteBook[] = useMemo(() => {
    return books
      .filter(b => favorites.includes(b.id))
      .map(b => ({ ...b, categoryName: '' }));
  }, [books, favorites]);

  const allSelected = favBooks.length > 0 && selected.length === favBooks.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : favBooks.map(b => b.id));
  };

  const toggleOne = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const addSelectedToCart = () => {
    const count = selected.length;
    if (count === 0) return;
    for (const book of favBooks) {
      if (selected.includes(book.id)) {
        addItem({
          bookId: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          coverUrl: book.coverUrl ?? undefined,
          categoryName: book.categoryName || '',
        });
      }
    }
    toast.showToast('success', `Added ${count} ${count === 1 ? 'book' : 'books'} to cart`);
  };

  const removeSelected = () => {
    const count = selected.length;
    if (count === 0) return;
    for (const id of selected) {
      removeFavorite(id);
    }
    setSelected([]);
    toast.showToast('success', `Removed ${count} ${count === 1 ? 'book' : 'books'} from favourites`);
  };

  const handleClearAll = () => {
    const count = favorites.length;
    if (count === 0) return;
    clearFavorites();
    setSelected([]);
    toast.showToast('success', 'All favourites cleared');
  };

  const columns: Column<FavoriteBook>[] = [
    {
      key: 'select', label: '',
      render: (b) => (
        <input
          type="checkbox"
          checked={selected.includes(b.id)}
          onChange={() => toggleOne(b.id)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      ),
    },
    {
      key: 'title', label: 'Title',
      render: (b) => <span className="font-medium text-gray-900">{b.title}</span>,
    },
    {
      key: 'author', label: 'Author',
      render: (b) => <span className="text-gray-600">{b.author}</span>,
    },
    {
      key: 'price', label: 'Price',
      render: (b) => <span className="font-mono font-medium">${b.price.toFixed(2)}</span>,
      className: 'text-right',
    },
    {
      key: 'stock', label: 'Stock',
      render: (b) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          b.stock === 0 ? 'bg-red-50 text-red-700' :
          b.stock < 5 ? 'bg-amber-50 text-amber-700' :
          'bg-emerald-50 text-emerald-700'
        }`}>
          {b.stock} {b.stock === 1 ? 'unit' : 'units'}
        </span>
      ),
    },
    {
      key: 'fav', label: '',
      render: (b) => (
        <button
          onClick={() => toggleFavorite(b.id)}
          className="p-1 transition-colors"
          aria-label="Remove from favourites"
        >
          <HeartIcon className="w-4 h-4 text-red-400 fill-red-400" />
        </button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Favourites"
        action={
          selected.length > 0 ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={removeSelected}>
                <TrashIcon className="w-4 h-4" />
                Remove Selected ({selected.length})
              </Button>
              <Button onClick={addSelectedToCart}>
                <ShoppingBagIcon className="w-4 h-4" />
                Add Selected to Cart ({selected.length})
              </Button>
            </div>
          ) : (
            favBooks.length > 0 && (
              <Button variant="secondary" onClick={handleClearAll}>
                <TrashIcon className="w-4 h-4" />
                Clear All
              </Button>
            )
          )
        }
      />

      {loading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full w-6 h-6 border-2 border-blue-600 border-t-transparent" role="status" aria-label="Loading" />
            <span className="ml-3 text-sm text-gray-500">Loading favourites...</span>
          </div>
        </Card>
      ) : favBooks.length === 0 ? (
        <Card>
          <EmptyState
            icon={<HeartIcon className="w-8 h-8 text-gray-400" />}
            title="No favourites yet"
            message="Browse books and tap the heart icon to save your favourites here."
          />
        </Card>
      ) : (
        <Card>
          <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">
              {allSelected ? 'Deselect all' : 'Select all'} ({favBooks.length} {favBooks.length === 1 ? 'book' : 'books'})
            </span>
          </div>
          <Table columns={columns} data={favBooks} keyExtractor={(b) => b.id} />
        </Card>
      )}
    </div>
  );
}
