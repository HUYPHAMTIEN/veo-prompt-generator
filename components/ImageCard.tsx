import React, { useState } from 'react';
import { ImageFile } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface ImageCardProps {
  imageFile: ImageFile;
  onDescriptionChange: (id: string, description: string) => void;
  onDelete: (id: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
  imageFile,
  onDescriptionChange,
  onDelete,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (imageFile.generatedPrompt) {
      navigator.clipboard.writeText(imageFile.generatedPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 flex flex-col">
      <div className="relative">
        <img
          src={imageFile.previewUrl}
          alt="Preview"
          className="w-full h-48 object-cover"
        />
        <button
          onClick={() => onDelete(imageFile.id)}
          className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
          aria-label="Xóa ảnh"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <label htmlFor={`desc-${imageFile.id}`} className="text-sm font-medium text-gray-300 mb-1">
          Mô tả (Sửa)
        </label>
        <textarea
          id={`desc-${imageFile.id}`}
          value={imageFile.description}
          onChange={(e) => onDescriptionChange(imageFile.id, e.target.value)}
          placeholder="Thêm mô tả cho ảnh này..."
          className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm h-24 resize-none"
        />
        <div className="mt-4 flex-grow flex flex-col">
            <h4 className="text-sm font-medium text-gray-300 mb-1">Prompt được tạo</h4>
            <div className="bg-gray-900 p-3 rounded-md min-h-[100px] flex-grow flex items-center justify-center relative">
                {imageFile.isLoading ? (
                     <div className="flex flex-col items-center text-gray-400">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Đang tạo...</span>
                    </div>
                ) : imageFile.error ? (
                    <p className="text-red-400 text-xs">{imageFile.error}</p>
                ) : imageFile.generatedPrompt ? (
                    <div className="w-full">
                        <p className="text-cyan-300 text-xs font-mono whitespace-pre-wrap pr-8">{imageFile.generatedPrompt}</p>
                        <button 
                            onClick={handleCopy}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
                            aria-label="Sao chép prompt"
                        >
                          {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-500 text-xs text-center">Prompt sẽ xuất hiện ở đây.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;