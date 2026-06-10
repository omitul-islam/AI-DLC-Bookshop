import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import type { FileContent } from '../../api/contextFiles.api';

interface DocViewerProps {
  file: FileContent | null;
  loading: boolean;
}

function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
  const language = className?.replace('language-', '') || '';
  return (
    <div className="relative group">
      {language && (
        <div className="absolute top-0 right-0 px-2 py-0.5 text-xs text-gray-400 bg-gray-800 rounded-bl-md rounded-tr-lg font-mono select-none">
          {language}
        </div>
      )}
      <pre className="bg-gray-900 text-gray-100 rounded-lg overflow-x-auto p-4 text-sm leading-relaxed">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export function DocViewer({ file, loading }: DocViewerProps) {

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3">
            <DocumentTextIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Select a document</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Choose a file from the sidebar to view its contents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">{file.name}</h1>
        <p className="text-xs text-gray-400 mt-1">
          {file.path} &middot; {file.size > 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${file.size} B`}
        </p>
      </div>

      <div className="prose prose-sm prose-gray max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const isInline = !className;
              if (isInline) {
                return <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
              }
              return <CodeBlock className={className}>{children}</CodeBlock>;
            },
            pre({ children }) {
              return <>{children}</>;
            },
            table({ children }) {
              return (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full text-sm">{children}</table>
                </div>
              );
            },
            th({ children }) {
              return <th className="px-4 py-2.5 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">{children}</th>;
            },
            td({ children }) {
              return <td className="px-4 py-2.5 border-b border-gray-100">{children}</td>;
            },
          }}
        >
          {file.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
