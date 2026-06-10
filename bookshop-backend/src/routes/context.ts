import { Router, Request, Response } from 'express';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';

const CONTEXT_DIR = join(__dirname, '..', '..', '..', 'bookshop-product-context');

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
}

function buildTree(dirPath: string, basePath: string = ''): TreeNode[] {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const nodes: TreeNode[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

    const fullPath = join(dirPath, entry.name);
    const relPath = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const children = buildTree(fullPath, relPath);
      if (children.length > 0) {
        nodes.push({ name: entry.name, path: relPath, type: 'directory', children });
      }
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.yaml') || entry.name.endsWith('.json'))) {
      nodes.push({ name: entry.name, path: relPath, type: 'file' });
    }
  }

  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return nodes;
}

const router = Router();

router.get('/tree', (_req: Request, res: Response) => {
  try {
    const tree = buildTree(CONTEXT_DIR);
    res.json(tree);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/read', (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) {
      return res.status(400).json({ error: 'path query parameter is required' });
    }

    const fullPath = join(CONTEXT_DIR, filePath);

    if (!fullPath.startsWith(CONTEXT_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!statSync(fullPath).isFile()) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = readFileSync(fullPath, 'utf-8');
    const ext = extname(filePath).slice(1);

    res.json({
      name: filePath.split('/').pop(),
      path: filePath,
      content,
      extension: ext,
      size: Buffer.byteLength(content, 'utf-8'),
    });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || '').toLowerCase();
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results: { path: string; name: string; match: string }[] = [];

    function searchDir(dirPath: string, basePath: string = '') {
      const entries = readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        const fullPath = join(dirPath, entry.name);
        const relPath = basePath ? `${basePath}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          searchDir(fullPath, relPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const content = readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(query)) {
              results.push({
                path: relPath,
                name: entry.name,
                match: lines[i].trim().slice(0, 150),
              });
              break;
            }
          }
        }
      }
    }

    searchDir(CONTEXT_DIR);
    res.json(results.slice(0, 50));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
