import { useEffect, useState, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useContextFiles } from '../hooks/useContextFiles';
import { TreeNav } from '../components/context/TreeNav';
import { DocViewer } from '../components/context/DocViewer';
import { Card } from '../components/common/Card';
import { PageLoading } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';
import type { TreeNode, SearchResult } from '../api/contextFiles.api';

export default function ContextPage() {
  const { tree, loading, fetchTree, fileContent, fileLoading, readFile, searchResults, searching, search } = useContextFiles();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => { fetchTree(); }, [fetchTree]);

  const handleSelect = useCallback((node: TreeNode) => {
    if (node.type === 'file') {
      setSelectedPath(node.path);
      setShowSearchResults(false);
      readFile(node.path);
    }
  }, [readFile]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setShowSearchResults(true);
      search(value);
    } else {
      setShowSearchResults(false);
    }
  }, [search]);

  const handleSearchResultClick = useCallback((result: SearchResult) => {
    setSelectedPath(result.path);
    setSearchQuery('');
    setShowSearchResults(false);
    readFile(result.path);
  }, [readFile]);

  if (loading && tree.length === 0) return <PageLoading />;

  return (
    <div className="animate-fade-in h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">Context</h1>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">AI-DLC</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors lg:hidden"
        >
          {sidebarOpen ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {sidebarOpen && (
          <div className="w-56 flex-shrink-0 border border-gray-200 rounded-xl bg-white overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder:text-gray-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {showSearchResults ? (
                <div className="space-y-1">
                  {searching ? (
                    <p className="text-xs text-gray-400 text-center py-4">Searching...</p>
                  ) : searchResults.length === 0 ? (
                    <EmptyState
                      icon={<MagnifyingGlassIcon className="w-6 h-6" />}
                      title="No results"
                      message={`No matches for "${searchQuery}"`}
                    />
                  ) : (
                    searchResults.map((r) => (
                      <button
                        key={r.path}
                        onClick={() => handleSearchResultClick(r)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedPath === r.path ? 'bg-primary-light text-primary' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="text-xs font-mono text-gray-400 block truncate">{r.path}</span>
                        <span className="text-xs line-clamp-1">{r.match}</span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <TreeNav
                  nodes={tree}
                  selectedPath={selectedPath}
                  onSelect={handleSelect}
                />
              )}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0 overflow-y-auto">
          <Card className="min-h-full">
            <DocViewer file={fileContent} loading={fileLoading} />
          </Card>
        </div>
      </div>
    </div>
  );
}
