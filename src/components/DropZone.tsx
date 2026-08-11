import React, { useRef, useState } from 'react';
import { UploadCloud, FileArchive, Loader2, CheckCircle2 } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  fileName: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFileSelect,
  isProcessing,
  fileName,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip') || file.type.includes('zip') || file.type.includes('compressed')) {
        onFileSelect(file);
      } else {
        alert('Please select a valid .zip file');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      id="zip-dropzone"
      className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
        isDragOver
          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg scale-[1.005]'
          : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500 dark:hover:bg-slate-800/50'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept=".zip,application/zip,application/x-zip-compressed"
        className="hidden"
        id="zip-file-input"
      />

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110 dark:bg-indigo-950/50 dark:text-indigo-400">
        {isProcessing ? (
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400" />
        ) : fileName ? (
          <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <UploadCloud className="h-7 w-7" />
        )}
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          {isProcessing
            ? 'Extracting archive content...'
            : fileName
            ? `Uploaded: ${fileName}`
            : 'Drop your project ZIP file here'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          {fileName
            ? 'Click or drop a new .zip file to replace current extraction'
            : 'Supports source code, project directories, Silah-e-Khair backups, and standard ZIP archives.'}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <FileArchive className="h-3.5 w-3.5 text-indigo-500" />
        <span>Browse files on device</span>
      </div>
    </div>
  );
};
