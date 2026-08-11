import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  FileImage,
  ChevronRight,
  ChevronDown,
  File
} from 'lucide-react';
import { FileTreeNode, ExtractedFile } from '../types';

interface FileTreeProps {
  nodes: FileTreeNode[];
  onSelectFile: (file: ExtractedFile) => void;
  selectedFilePath?: string;
  searchQuery?: string;
}

export const FileTree: React.FC<FileTreeProps> = ({
  nodes,
  onSelectFile,
  selectedFilePath,
  searchQuery = '',
}) => {
  return (
    <div className="space-y-0.5 text-xs font-mono select-none">
      {nodes.map((node) => (
        <TreeNodeItem
          key={node.path}
          node={node}
          onSelectFile={onSelectFile}
          selectedFilePath={selectedFilePath}
          searchQuery={searchQuery.toLowerCase().trim()}
        />
      ))}
    </div>
  );
};

interface TreeNodeItemProps {
  node: FileTreeNode;
  onSelectFile: (file: ExtractedFile) => void;
  selectedFilePath?: string;
  searchQuery: string;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  onSelectFile,
  selectedFilePath,
  searchQuery,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const matchesQuery = (item: FileTreeNode): boolean => {
    if (!searchQuery) return true;
    if (item.name.toLowerCase().includes(searchQuery)) return true;
    if (item.children) {
      return item.children.some((child) => matchesQuery(child));
    }
    return false;
  };

  if (!matchesQuery(node)) {
    return null;
  }

  const isSelected = selectedFilePath === node.path;

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'c', 'cpp', 'rs', 'go'].includes(ext || '')) {
      return <FileCode className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
    }
    if (['json', 'yaml', 'yml', 'toml'].includes(ext || '')) {
      return <FileJson className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
    }
    if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(ext || '')) {
      return <FileImage className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
    }
    if (['md', 'txt', 'html', 'css', 'sql'].includes(ext || '')) {
      return <FileText className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
    }
    return <File className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
  };

  if (node.isDir) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          )}
          {isOpen ? (
            <FolderOpen className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          ) : (
            <Folder className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          )}
          <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
            {node.name}
          </span>
        </button>

        {isOpen && node.children && node.children.length > 0 && (
          <div className="ml-3 pl-1.5 border-l border-slate-200 dark:border-slate-800 space-y-0.5 mt-0.5">
            {node.children.map((child) => (
              <TreeNodeItem
                key={child.path}
                node={child}
                onSelectFile={onSelectFile}
                selectedFilePath={selectedFilePath}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => node.file && onSelectFile(node.file)}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition-colors ${
        isSelected
          ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80'
      }`}
    >
      {getFileIcon(node.name)}
      <span className="truncate">{node.name}</span>
    </button>
  );
};
