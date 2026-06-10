import { useState, useEffect } from 'react';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { useAuditLog } from '../hooks/useAuditLog';
import { PageHeader } from '../layouts/PageHeader';
import { Card } from '../components/common/Card';
import { Table, type Column } from '../components/common/Table';
import { Select } from '../components/common/Select';
import { Input } from '../components/common/Input';
import { PageLoading } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import type { AuditEntry } from '../types';

export default function AuditLogPage() {
  const { entries, loading, page, totalPages, setPage, fetchEntries } = useAuditLog();
  const [filters, setFilters] = useState<{ entityType: string; entityId: string; action: string }>({
    entityType: '', entityId: '', action: '',
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const activeFilters: any = {};
    if (filters.entityType) activeFilters.entityType = filters.entityType;
    if (filters.entityId) activeFilters.entityId = filters.entityId;
    if (filters.action) activeFilters.action = filters.action;
    fetchEntries(activeFilters);
  }, [fetchEntries, page, filters]);

  const columns: Column<AuditEntry>[] = [
    {
      key: 'createdAt', label: 'Timestamp',
      render: (e) => <span className="font-mono text-xs text-gray-500">{new Date(e.createdAt).toLocaleString()}</span>,
    },
    {
      key: 'entityType', label: 'Entity',
      render: (e) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {e.entityType}
        </span>
      ),
    },
    { key: 'entityId', label: 'Entity ID', render: (e) => <span className="font-mono text-xs text-gray-500">{e.entityId}</span> },
    {
      key: 'action', label: 'Action',
      render: (e) => {
        const colors: Record<string, string> = {
          created: 'bg-green-100 text-green-700',
          updated: 'bg-blue-100 text-blue-700',
          deleted: 'bg-red-100 text-red-700',
        };
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[e.action] || ''}`}>
            {e.action}
          </span>
        );
      },
    },
    { key: 'performedBy', label: 'Performed By', render: (e) => <span className="text-sm text-gray-700">{e.performedBy}</span> },
    {
      key: 'actions', label: '',
      render: (e) => (
        <div className="text-right">
          <button
            onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {expandedId === e.id ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      ),
      className: 'text-right w-24',
    },
  ];

  const entityTypeOptions = [
    { value: 'book', label: 'Book' },
    { value: 'customer', label: 'Customer' },
    { value: 'order', label: 'Order' },
  ];

  const actionOptions = [
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deleted', label: 'Deleted' },
  ];

  if (loading && entries.length === 0) return <PageLoading />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Audit Log"
        subtitle="Track all changes made to books, customers, and orders"
      />

      <Card className="mb-4">
        <div className="flex gap-3 items-end">
          <Select
            label="Entity Type"
            value={filters.entityType}
            onChange={(e) => { setFilters(f => ({ ...f, entityType: e.target.value })); setPage(1); }}
            options={entityTypeOptions}
            placeholder="All entities"
          />
          <Select
            label="Action"
            value={filters.action}
            onChange={(e) => { setFilters(f => ({ ...f, action: e.target.value })); setPage(1); }}
            options={actionOptions}
            placeholder="All actions"
          />
          <Input
            label="Entity ID"
            value={filters.entityId}
            onChange={(e) => { setFilters(f => ({ ...f, entityId: e.target.value })); setPage(1); }}
            placeholder="Filter by UUID"
          />
        </div>
      </Card>

      {entries.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ClipboardDocumentCheckIcon className="w-8 h-8 text-gray-400" />}
            title="No audit entries"
            message="Changes to books, customers, and orders will appear here."
          />
        </Card>
      ) : (
        <Card>
          <Table
            columns={columns}
            data={entries}
            keyExtractor={(e) => e.id}
            emptyMessage="No entries match your filters."
          />
          {expandedId && entries.find(e => e.id === expandedId) && (
            <AuditEntryDetails entry={entries.find(e => e.id === expandedId)!} onClose={() => setExpandedId(null)} />
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={20}
            onPageSizeChange={() => {}}
            loading={loading}
          />
        </Card>
      )}
    </div>
  );
}

function AuditEntryDetails({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  return (
    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
      <div className="flex justify-end mb-2">
        <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Close</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {entry.previousState && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Previous State</p>
            <pre className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 overflow-x-auto max-h-40">
              {JSON.stringify(entry.previousState, null, 2)}
            </pre>
          </div>
        )}
        {entry.newState && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">New State</p>
            <pre className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 overflow-x-auto max-h-40">
              {JSON.stringify(entry.newState, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
