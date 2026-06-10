import { useState } from 'react';
import { ChevronRightIcon, DocumentTextIcon, FolderIcon } from '@heroicons/react/24/outline';
import type { TreeNode } from '../../api/contextFiles.api';

interface TreeNavProps {
  nodes: TreeNode[];
  selectedPath: string | null;
  onSelect: (node: TreeNode) => void;
}

function TreeNodeItem({ node, selectedPath, onSelect, depth = 0 }: { node: TreeNode; selectedPath: string | null; onSelect: (node: TreeNode) => void; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1);

  const isSelected = selectedPath === node.path;

  if (node.type === 'file') {
    return (
      <button
        onClick={() => onSelect(node)}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors text-left ${
          isSelected
            ? 'bg-primary-light text-primary font-medium'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <DocumentTextIcon className="w-4 h-4 flex-shrink-0 text-gray-400" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-left"
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <ChevronRightIcon
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
        />
        <FolderIcon className="w-4 h-4 flex-shrink-0 text-amber-500" />
        <span className="truncate">{node.name}</span>
      </button>
      {expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeNav({ nodes, selectedPath, onSelect }: TreeNavProps) {
  return (
    <nav className="space-y-0.5">
      {nodes.map((node) => (
        <TreeNodeItem
          key={node.path}
          node={node}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </nav>
  );
}
