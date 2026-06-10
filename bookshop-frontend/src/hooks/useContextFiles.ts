import { useState, useCallback } from 'react';
import { contextFilesApi, type TreeNode, type FileContent, type SearchResult } from '../api/contextFiles.api';

export function useContextFiles() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contextFilesApi.getTree();
      setTree(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const readFile = useCallback(async (path: string) => {
    setFileLoading(true);
    setFileContent(null);
    try {
      const data = await contextFilesApi.readFile(path);
      setFileContent(data);
    } finally {
      setFileLoading(false);
    }
  }, []);

  const search = useCallback(async (query: string) => {
    setSearching(true);
    try {
      const data = await contextFilesApi.search(query);
      setSearchResults(data);
    } finally {
      setSearching(false);
    }
  }, []);

  return { tree, loading, fetchTree, fileContent, fileLoading, readFile, searchResults, searching, search };
}
