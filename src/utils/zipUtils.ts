import JSZip from 'jszip';
import { ExtractedFile, FileTreeNode, ExtractionStats } from '../types';

export interface ProcessZipResult {
  files: ExtractedFile[];
  tree: FileTreeNode[];
  stats: ExtractionStats;
}

export async function processZipFile(file: File): Promise<ProcessZipResult> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);

  const files: ExtractedFile[] = [];
  let totalFiles = 0;
  let totalFolders = 0;
  let totalSize = 0;
  const fileTypes: Record<string, number> = {};

  const fileEntries = Object.keys(zipContent.files);

  for (const relativePath of fileEntries) {
    const zipEntry = zipContent.files[relativePath];
    const isDir = zipEntry.dir;
    const pathParts = relativePath.split('/').filter(Boolean);
    const fileName = pathParts[pathParts.length - 1] || relativePath;

    if (isDir) {
      totalFolders++;
      files.push({
        path: relativePath,
        name: fileName,
        size: 0,
        isDir: true,
      });
    } else {
      totalFiles++;
      const ext = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() || 'unknown' : 'no-ext';
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;

      let content: string | undefined;
      const isText = isTextFile(fileName);

      if (isText) {
        try {
          content = await zipEntry.async('string');
        } catch {
          content = '[Binary File]';
        }
      } else {
        content = '[Binary File]';
      }

      const size = (zipEntry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize || content?.length || 0;
      totalSize += size;

      files.push({
        path: relativePath,
        name: fileName,
        size,
        isDir: false,
        content,
        fileType: ext,
      });
    }
  }

  const tree = buildTree(files);

  const stats: ExtractionStats = {
    totalFiles,
    totalFolders,
    totalSize,
    fileTypes,
  };

  return { files, tree, stats };
}

function isTextFile(fileName: string): boolean {
  const textExtensions = [
    'txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss',
    'sql', 'xml', 'svg', 'yaml', 'yml', 'env', 'gitignore', 'example',
    'sh', 'bat', 'c', 'cpp', 'h', 'py', 'java', 'kt', 'rs', 'go', 'php',
    'rb', 'template', 'lock', 'nix'
  ];
  const nameLower = fileName.toLowerCase();
  if (textExtensions.some((ext) => nameLower.endsWith('.' + ext))) return true;
  if (nameLower.startsWith('.') || nameLower.endsWith('rc') || nameLower === 'readme' || nameLower === 'license') return true;
  return false;
}

function buildTree(files: ExtractedFile[]): FileTreeNode[] {
  const rootNodes: FileTreeNode[] = [];
  const nodeMap: Record<string, FileTreeNode> = {};

  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sortedFiles) {
    const parts = file.path.replace(/\/$/, '').split('/');
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!nodeMap[currentPath]) {
        const isDirectory = !isLast || file.isDir;
        const newNode: FileTreeNode = {
          name: part,
          path: currentPath,
          isDir: isDirectory,
          children: isDirectory ? [] : undefined,
          file: isLast && !file.isDir ? file : undefined,
        };
        nodeMap[currentPath] = newNode;

        if (parentPath && nodeMap[parentPath]) {
          nodeMap[parentPath].children?.push(newNode);
        } else if (i === 0) {
          rootNodes.push(newNode);
        }
      } else if (isLast && !file.isDir && file) {
        nodeMap[currentPath].file = file;
      }
    }
  }

  const sortNodes = (nodes: FileTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children) {
        sortNodes(node.children);
      }
    }
  };

  sortNodes(rootNodes);
  return rootNodes;
}
