export * from './types/index';

export interface ExtractedFile {
  path: string;
  name: string;
  size: number;
  isDir: boolean;
  content?: string;
  fileType?: string;
}

export interface FileTreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: FileTreeNode[];
  file?: ExtractedFile;
}

export interface ExtractionStats {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  fileTypes: Record<string, number>;
}

