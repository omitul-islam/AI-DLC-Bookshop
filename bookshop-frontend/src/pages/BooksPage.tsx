import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, ClockIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { useBooks } from '../hooks/useBooks';
import { useCategories } from '../hooks/useCategories';
import { useStockMovements } from '../hooks/useStockMovements';
import { useToast } from '../context/ToastContext';
import { Table, type Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { SearchInput } from '../components/common/SearchInput';
import { IconButton } from '../components/common/IconButton';
import { Card } from '../components/common/Card';
import { PageHeader } from '../layouts/PageHeader';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PageLoading } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';
import { Select } from '../components/common/Select';
import { Pagination } from '../components/common/Pagination';
import { exportApi } from '../api/export.api';
import { booksApi } from '../api/books.api';
import type { Book } from '../types';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  author: z.string().min(1, 'Author is required').max(255),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  stock: z.coerce.number().int('Must be a whole number').min(0, 'Stock must be 0 or greater'),
  categoryId: z.string().min(1, 'Category is required'),
});

type BookFormData = z.infer<typeof bookSchema>;

type ViewMode = 'list' | 'grid';

export default function BooksPage() {
  const { books, loading, page, totalPages, limit, setPage, setLimit, fetchBooks, searchBooks, createBook, updateBook, deleteBook } = useBooks();
  const { categories, fetchCategories } = useCategories();
  const { movements, loading: movLoading, page: movPage, totalPages: movTotalPages, setPage: setMovPage, fetchMovements } = useStockMovements();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stockModal, setStockModal] = useState<{ open: boolean; book: Book | null }>({ open: false, book: null });
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<BookFormData>({ resolver: zodResolver(bookSchema) });

  useEffect(() => { fetchBooks(); fetchCategories(); }, [fetchBooks, fetchCategories]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
    if (value.trim()) {
      searchBooks(value, 1);
    } else {
      fetchBooks(1);
    }
  }, [searchBooks, fetchBooks, setPage]);

  const openAddModal = () => {
    setEditingBook(null);
    reset({ title: '', author: '', price: 0, stock: 0, categoryId: '' });
    setModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    reset({ title: book.title, author: book.author, price: book.price, stock: book.stock, categoryId: book.categoryId });
    setModalOpen(true);
  };

  const openStockModal = (book: Book) => {
    setStockModal({ open: true, book });
    fetchMovements(book.id);
  };

  const onSubmit = async (data: BookFormData) => {
    setSubmitting(true);
    try {
      let bookId: string;
      if (editingBook) {
        await updateBook(editingBook.id, data);
        bookId = editingBook.id;
        showToast('success', 'Book updated successfully');
      } else {
        const created = await createBook(data);
        bookId = created.id;
        showToast('success', 'Book added successfully');
      }
      if (coverFile) {
        await booksApi.uploadCover(bookId, coverFile);
      }
      setCoverFile(null);
      setCoverPreview(null);
      setModalOpen(false);
      fetchBooks();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBook(deleteTarget.id);
      showToast('success', 'Book deleted successfully');
      setDeleteTarget(null);
      fetchBooks();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete book');
    } finally {
      setDeleting(false);
    }
  };

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const filteredBooks = categoryFilter
    ? books.filter((b) => b.categoryId === categoryFilter)
    : books;

  const columns: Column<Book>[] = [
    {
      key: 'title', label: 'Title',
      render: (b) => <span className="font-medium text-gray-900">{b.title}</span>,
    },
    {
      key: 'author', label: 'Author',
      render: (b) => <span className="text-gray-600">{b.author}</span>,
    },
    {
      key: 'categoryId', label: 'Category',
      render: (b) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {categoryMap[b.categoryId] || 'Unknown'}
        </span>
      ),
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
      key: 'actions', label: '',
      render: (b) => (
        <div className="flex justify-end gap-1">
          <IconButton
            icon={<ClockIcon className="w-4 h-4" />}
            label={`Stock history for ${b.title}`}
            variant="primary"
            onClick={(e) => { e.stopPropagation(); openStockModal(b); }}
          />
          <IconButton
            icon={<PencilIcon className="w-4 h-4" />}
            label={`Edit ${b.title}`}
            variant="primary"
            onClick={(e) => { e.stopPropagation(); openEditModal(b); }}
          />
          <IconButton
            icon={<TrashIcon className="w-4 h-4" />}
            label={`Delete ${b.title}`}
            variant="danger"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(b); }}
          />
        </div>
      ),
      className: 'text-right w-28',
    },
  ];

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  if (loading && books.length === 0) return <PageLoading />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Books"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportApi.downloadCsv('books')}>
              <ArrowDownTrayIcon className="w-4 h-4" />Export CSV
            </Button>
            <Button onClick={openAddModal}><PlusIcon className="w-4 h-4" />Add Book</Button>
          </div>
        }
      />

      <div className="mb-4 flex gap-3 items-start">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by title or author..."
          />
        </div>
        <div className="w-56">
          <Select
            label=""
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={categoryOptions}
            placeholder="All categories"
          />
        </div>
        <div className="flex items-center gap-1 pt-1.5">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title="List view"
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title="Grid view"
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {filteredBooks.length === 0 && searchQuery ? (
        <Card>
          <EmptyState
            icon={<MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />}
            title="No results found"
            message={`No books matching "${searchQuery}". Try a different search term.`}
          />
        </Card>
      ) : viewMode === 'list' ? (
        <Card>
          <Table
            columns={columns}
            data={filteredBooks}
            keyExtractor={(b) => b.id}
            emptyMessage="No books found. Add your first book to get started."
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageSize={limit} onPageSizeChange={setLimit} loading={loading} />
        </Card>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} hover className="flex flex-col">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center'); }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-300">
                        {book.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">{book.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{book.author}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {categoryMap[book.categoryId] || 'Unknown'}
                    </span>
                    <span className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      book.stock === 0 ? 'bg-red-50 text-red-700' :
                      book.stock < 5 ? 'bg-amber-50 text-amber-700' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {book.stock} {book.stock === 1 ? 'unit' : 'units'}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-lg font-bold text-gray-900">${book.price.toFixed(2)}</span>
                    <div className="flex gap-1">
                      <IconButton
                        icon={<ClockIcon className="w-4 h-4" />}
                        label={`Stock history for ${book.title}`}
                        variant="primary"
                        onClick={(e) => { e.stopPropagation(); openStockModal(book); }}
                      />
                      <IconButton
                        icon={<PencilIcon className="w-4 h-4" />}
                        label={`Edit ${book.title}`}
                        variant="primary"
                        onClick={(e) => { e.stopPropagation(); openEditModal(book); }}
                      />
                      <IconButton
                        icon={<TrashIcon className="w-4 h-4" />}
                        label={`Delete ${book.title}`}
                        variant="danger"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(book); }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageSize={limit} onPageSizeChange={setLimit} loading={loading} />
        </div>
      )}

      <Modal
        isOpen={stockModal.open}
        onClose={() => setStockModal({ open: false, book: null })}
        title={`Stock History - ${stockModal.book?.title || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          {movLoading && movements.length === 0 ? (
            <PageLoading />
          ) : movements.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No stock movements recorded.</p>
          ) : (
            <>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Change</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {movements.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">{new Date(m.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {m.reason.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-center font-mono ${m.quantity < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                        </td>
                        <td className="px-4 py-3 text-center font-mono">{m.newStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={movPage} totalPages={movTotalPages} onPageChange={setMovPage} pageSize={20} onPageSizeChange={() => {}} loading={movLoading} />
            </>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBook ? 'Edit Book' : 'Add Book'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Title" {...register('title')} error={errors.title?.message} required placeholder="Enter book title" />
          <Input label="Author" {...register('author')} error={errors.author?.message} required placeholder="Enter author name" />
          <Select label="Category" options={categoryOptions} placeholder="Select a category" {...register('categoryId')} error={errors.categoryId?.message} required />
          <Input label="Price" type="number" step="0.01" {...register('price')} error={errors.price?.message} required />
          <Input label="Stock" type="number" {...register('stock')} error={errors.stock?.message} required />
          <div className="pt-3 border-t border-gray-100 mt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cover Image</p>
            <p className="text-xs text-gray-400 mb-2">Upload a book cover image (JPEG, PNG, WebP, GIF, SVG — max 5MB).</p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        showToast('error', 'File too large. Maximum size is 5MB.');
                        return;
                      }
                      setCoverFile(file);
                      setCoverPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                Choose File
              </label>
              {coverFile && (
                <span className="text-sm text-gray-500">{coverFile.name}</span>
              )}
              {editingBook?.coverUrl && !coverFile && (
                <span className="text-sm text-gray-400">Current cover saved</span>
              )}
            </div>
            {coverPreview && (
              <div className="mt-2 w-20 h-28 rounded-lg overflow-hidden border border-gray-200">
                <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editingBook ? 'Update' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Book?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
