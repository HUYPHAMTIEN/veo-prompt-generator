import React, { useState, useEffect } from 'react';

interface BulkDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (description: string) => void;
}

const BulkDescriptionModal: React.FC<BulkDescriptionModalProps> = ({ isOpen, onClose, onApply }) => {
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDescription('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleApply = () => {
    onApply(description);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4">Mô tả hàng loạt</h2>
        <p className="text-gray-400 mb-4 text-sm">
          Nhập mô tả dưới đây. Mô tả này sẽ được áp dụng cho tất cả các ảnh đã được tải lên.
        </p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ví dụ: một chú chó corgi đang chơi trên bãi biển vào lúc hoàng hôn..."
          className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base h-32 resize-none"
          aria-label="Nội dung mô tả hàng loạt"
        />
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleApply}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Áp dụng cho tất cả
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkDescriptionModal;