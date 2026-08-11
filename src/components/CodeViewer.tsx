import React, { useState } from 'react';
import { Copy, Check, FileCode, FileBox } from 'lucide-react';
import { ExtractedFile } from '../types';

interface CodeViewerProps {
  file?: ExtractedFile;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ file }) => {
  const [copied, setCopied] = useState(false);

  if (!file) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <FileCode className="h-10 w-10 text-slate-300 dark:text-slate-700" />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Select a file from the explorer on the left to view its source code.
        </p>
      </div>
    );
  }

  const isBinary = file.content === '[Binary File]' || file.isDir;

  const handleCopy = () => {
    if (file.content && !isBinary) {
      navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lineCount = file.content && !isBinary ? file.content.split('\n').length : 0;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 shadow-xs dark:border-slate-800 overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="truncate font-mono text-xs font-semibold text-slate-200">
            {file.path}
          </span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
            {formatBytes(file.size)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isBinary && (
            <span className="font-mono text-[10px] text-slate-500">
              {lineCount} lines
            </span>
          )}
          {!isBinary && (
            <button
              onClick={handleCopy}
              id="copy-code-btn"
              className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              title="Copy File Content"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
        {isBinary ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-500">
            <FileBox className="h-12 w-12 mb-3 text-slate-600" />
            <p className="font-semibold text-slate-300 text-sm">Binary or Non-Text File</p>
            <p className="text-xs mt-1 text-slate-500">
              This file cannot be displayed directly as text inside the web code viewer.
            </p>
          </div>
        ) : (
          <pre className="whitespace-pre text-slate-200 selection:bg-indigo-950 selection:text-indigo-200">
            <code>{file.content}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
