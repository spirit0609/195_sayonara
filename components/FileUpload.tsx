import React, { useCallback, useState } from 'react';
import { Upload, FileType, Loader2, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndProcessFile = (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('対応していないファイル形式です。PDF, JPG, PNGのみアップロード可能です。');
      return;
    }
    setError(null);
    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ease-in-out
          ${isDragging 
            ? 'border-royal-500 bg-royal-50 shadow-inner' 
            : 'border-slate-300 bg-white hover:border-royal-400 hover:bg-slate-50'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileInput}
          disabled={isLoading}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center animate-pulse">
              <Loader2 className="w-12 h-12 text-royal-600 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-royal-800">解析中...</h3>
              <p className="text-sm text-slate-500">AIが明細を読み取っています。これには数秒かかります。</p>
            </div>
          ) : (
            <>
              <div className={`p-4 rounded-full ${isDragging ? 'bg-royal-200 text-royal-700' : 'bg-slate-100 text-slate-400'}`}>
                {isDragging ? <FileType size={32} /> : <Upload size={32} />}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium text-slate-700">
                  ファイルをここにドラッグ＆ドロップ
                </p>
                <p className="text-sm text-slate-500">
                  または <label htmlFor="file-upload" className="text-royal-600 font-semibold hover:underline cursor-pointer">ファイルを選択</label>
                </p>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                対応フォーマット: PDF, JPEG, PNG (複数ページ対応)
              </p>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;