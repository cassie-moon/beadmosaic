import { useState, useRef, useCallback } from 'react';
import { Upload, X, Settings2, ImageIcon } from 'lucide-react';

interface UploadPanelProps {
  selectedImage: string | null;
  exportSize: number;
  showColorId: boolean;
  removeBackground: boolean;
  backgroundMethod: 'corner' | 'edge' | 'brightest';
  isProcessing: boolean;
  onFileSelect: (file: File) => void;
  onExportSizeChange: (size: number) => void;
  onShowColorIdChange: (show: boolean) => void;
  onRemoveBackgroundChange: (remove: boolean) => void;
  onBackgroundMethodChange: (method: 'corner' | 'edge' | 'brightest') => void;
  onGenerate: () => void;
  onRemoveImage: () => void;
}

const SIZE_OPTIONS = [
  { value: 24, label: '24 x 24' },
  { value: 32, label: '32 x 32' },
  { value: 40, label: '40 x 40' },
  { value: 48, label: '48 x 48' },
  { value: 64, label: '64 x 64' },
  { value: 80, label: '80 x 80' },
  { value: 96, label: '96 x 96' },
  { value: 128, label: '128 x 128' },
];

export const UploadPanel = ({
  selectedImage,
  exportSize,
  showColorId,
  removeBackground,
  backgroundMethod,
  isProcessing,
  onFileSelect,
  onExportSizeChange,
  onShowColorIdChange,
  onRemoveBackgroundChange,
  onBackgroundMethodChange,
  onGenerate,
  onRemoveImage,
}: UploadPanelProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-gray-800">上传图片</h2>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50 scale-[1.02]'
              : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
          } ${selectedImage ? 'border-emerald-500 bg-emerald-50' : ''}`}
        >
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="预览"
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-gray-700 text-sm font-medium">拖拽图片到这里</p>
              <p className="text-gray-500 text-xs mt-1">或点击上传</p>
              <p className="text-gray-400 text-xs mt-2">支持 JPG, PNG, GIF, WEBP</p>
            </div>
          )}
        </label>

        {selectedImage && (
          <button
            onClick={() => {
              // 清除 file input 的值，确保可以重新上传
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
              onRemoveImage();
            }}
            className="w-full mt-3 py-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            移除图片
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-gray-800">参数设置</h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">导出尺寸</label>
            <select
              value={exportSize}
              onChange={(e) => onExportSizeChange(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all appearance-none cursor-pointer"
            >
              {SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-700 text-sm font-medium">显示颜色编号</span>
            <button
              onClick={() => onShowColorIdChange(!showColorId)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                showColorId ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                  showColorId ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-700 text-sm font-medium">移除背景</span>
            <button
              onClick={() => onRemoveBackgroundChange(!removeBackground)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                removeBackground ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                  removeBackground ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {removeBackground && (
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">背景检测方式</label>
              <select
                value={backgroundMethod}
                onChange={(e) => onBackgroundMethodChange(e.target.value as 'corner' | 'edge' | 'brightest')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all appearance-none cursor-pointer"
              >
                <option value="corner" className="bg-white">四角颜色 (适合纯色背景)</option>
                <option value="edge" className="bg-white">边缘颜色 (适合渐变背景)</option>
                <option value="brightest" className="bg-white">最亮颜色 (适合浅色背景)</option>
              </select>
            </div>
          )}

          <button
            onClick={onGenerate}
            disabled={!selectedImage || isProcessing}
            className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
              selectedImage && !isProcessing
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                生成中...
              </span>
            ) : (
              '生成图纸'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};