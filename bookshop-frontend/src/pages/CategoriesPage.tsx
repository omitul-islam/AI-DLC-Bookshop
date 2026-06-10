import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCategories } from '../hooks/useCategories';
import { useToast } from '../context/ToastContext';
import { Table, type Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { IconButton } from '../components/common/IconButton';
import { Card } from '../components/common/Card';
import { PageHeader } from '../layouts/PageHeader';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PageLoading } from '../components/common/Spinner';
import type { Category } from '../types';

export default function CategoriesPage() {
  const { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      showToast('error', 'Name and description are required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: name.trim(), description: description.trim() });
        showToast('success', 'Category updated successfully');
      } else {
        await createCategory({ name: name.trim(), description: description.trim() });
        showToast('success', 'Category added successfully');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      showToast('success', 'Category deleted successfully');
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Category>[] = [
    {
      key: 'name', label: 'Name',
      render: (c) => <span className="font-medium text-gray-900">{c.name}</span>,
    },
    {
      key: 'description', label: 'Description',
      render: (c) => <span className="text-gray-600">{c.description}</span>,
    },
    {
      key: 'actions', label: '',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <IconButton
            icon={<PencilIcon className="w-4 h-4" />}
            label={`Edit ${c.name}`}
            variant="primary"
            onClick={(e) => { e.stopPropagation(); openEditModal(c); }}
          />
          <IconButton
            icon={<TrashIcon className="w-4 h-4" />}
            label={`Delete ${c.name}`}
            variant="danger"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }}
          />
        </div>
      ),
      className: 'text-right w-20',
    },
  ];

  if (loading && categories.length === 0) return <PageLoading />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Categories"
        action={<Button onClick={openAddModal}><PlusIcon className="w-4 h-4" />Add Category</Button>}
      />

      <Card>
        <Table
          columns={columns}
          data={categories}
          keyExtractor={(c) => c.id}
          emptyMessage="No categories found. Add your first category to get started."
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter category name"
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Enter category description"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editingCategory ? 'Update' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
