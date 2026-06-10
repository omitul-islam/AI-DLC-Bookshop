import apiClient from './client';

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
}

export interface FileContent {
  name: string;
  path: string;
  content: string;
  extension: string;
  size: number;
}

export interface SearchResult {
  path: string;
  name: string;
  match: string;
}

export const contextFilesApi = {
  getTree: (): Promise<TreeNode[]> =>
    apiClient.get('/context/tree'),

  readFile: (path: string): Promise<FileContent> =>
    apiClient.get(`/context/read?path=${encodeURIComponent(path)}`),

  search: (query: string): Promise<SearchResult[]> =>
    apiClient.get(`/context/search?q=${encodeURIComponent(query)}`),
};
