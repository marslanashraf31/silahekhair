import React from 'react';
import { BookOpen, CheckCircle, FolderTree, Shield, Terminal } from 'lucide-react';

export const WorkspaceGuide: React.FC = () => {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Silah-e-Khair Foundation - Archive Extractor & Workspace Guide
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            How to use this tool to unpack, inspect, and analyze project archives.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            <FolderTree className="h-4 w-4" />
            1. Unpack Any .ZIP
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Drag and drop your project archive or Silah-e-Khair foundation backup file.
            All client-side unpacking happens instantly without server uploading.
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            <Terminal className="h-4 w-4" />
            2. Code Inspection
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Browse through folder trees, filter files by extension or name, and copy source code cleanly with one click.
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            <Shield className="h-4 w-4" />
            3. Privacy & Security
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            ZIP extraction operates completely within browser memory using JSZip.
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-xl bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
          Key Features & Workflow Capabilities
        </h3>
        <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Interactive nested tree navigation with automatic expand/collapse.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Real-time file extension breakdown and uncompressed size metrics.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Fast search filtering across directory trees.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
