import React, { useState, useCallback, useRef } from 'react';
import { ImageFile } from './types';
import { generatePromptForImage } from './services/geminiService';
import ImageCard from './components/ImageCard';
import { ArrowUpTrayIcon } from './components/icons/ArrowUpTrayIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { DocumentArrowDownIcon } from './components/icons/DocumentArrowDownIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import { LanguageIcon } from './components/icons/LanguageIcon';
import { PhotoIcon } from './components/icons/PhotoIcon';
import { FolderIcon } from './components/icons/FolderIcon';

const LANGUAGES = ['Vietnamese', 'English', 'German', 'Spanish', 'Korean'];

function App() {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [overallPrompt, setOverallPrompt] = useState('');
  const [language, setLanguage] = useState('English');
  const filesInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const textFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageFilesOnly = Array.from(files).filter((file: File) => file.type.startsWith('image/'));

      const newImageFiles: ImageFile[] = imageFilesOnly.map((file: File) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        description: '',
        isLoading: false,
      }));
      
      setImageFiles(prev => {
          const existingFileSignatures = new Set(prev.map(f => `${f.file.name}-${f.file.size}`));
          const uniqueNewFiles = newImageFiles.filter(f => !existingFileSignatures.has(`${f.file.name}-${f.file.size}`));
          
          return [...prev, ...uniqueNewFiles].sort((a,b) => a.file.name.localeCompare(b.file.name, undefined, { numeric: true }));
      });
    }
    if (event.target) {
      event.target.value = '';
    }
  };
  
  const triggerFilesInput = () => {
    filesInputRef.current?.click();
  };

  const triggerFolderInput = () => {
    folderInputRef.current?.click();
  };
  
  const triggerTextFileInput = () => {
    textFileInputRef.current?.click();
  };

  const handleTextFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/);
      setImageFiles(prev =>
        prev.map((img, index) => ({
          ...img,
          description: lines[index]?.trim() || img.description,
        }))
      );
    };
    reader.readAsText(file);
    // Reset file input to allow uploading the same file again
    event.target.value = '';
  };


  const handleDescriptionChange = (id: string, description: string) => {
    setImageFiles(prev =>
      prev.map(img => (img.id === id ? { ...img, description } : img))
    );
  };

  const handleDelete = (id: string) => {
    setImageFiles(prev => prev.filter(img => img.id !== id));
  };
  
  const handleDeleteAll = () => {
    setImageFiles([]);
  };

  const handleExportAllPrompts = () => {
    const promptsToExport = imageFiles
      .filter(img => img.generatedPrompt)
      .map(img => `Image: ${img.file.name}\nPrompt: ${img.generatedPrompt}\n`)
      .join('\n---\n\n');

    if (!promptsToExport) {
      alert("Chưa có prompt nào được tạo để xuất file.");
      return;
    }
    
    const blob = new Blob([promptsToExport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated_prompts.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGeneratePrompt = useCallback(async (id: string) => {
    const imageToProcess = imageFiles.find(img => img.id === id);
    if (!imageToProcess) return;

    setImageFiles(prev =>
      prev.map(img =>
        img.id === id ? { ...img, isLoading: true, error: undefined } : img
      )
    );

    try {
      const prompt = await generatePromptForImage(imageToProcess, overallPrompt, language);
      setImageFiles(prev =>
        prev.map(img =>
          img.id === id
            ? { ...img, generatedPrompt: prompt, isLoading: false }
            : img
        )
      );
    } catch (error) {
      console.error(`Error generating prompt for ${id}:`, error);
      setImageFiles(prev =>
        prev.map(img =>
          img.id === id
            ? { ...img, isLoading: false, error: error instanceof Error ? error.message : 'An unknown error occurred.' }
            : img
        )
      );
    }
  }, [imageFiles, overallPrompt, language]);

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    const promises = imageFiles
      .filter(img => !img.generatedPrompt)
      .map(img => handleGeneratePrompt(img.id));
    await Promise.all(promises);
    setIsGeneratingAll(false);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-10 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-400">AI Prompt Generator</h1>
          <div className="flex items-center gap-3">
              <LanguageIcon className="w-6 h-6 text-gray-300" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md py-1.5 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                aria-label="Chọn ngôn ngữ prompt"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
           <h2 className="text-lg font-semibold mb-3 flex items-center"><SparklesIcon className="w-6 h-6 mr-2 text-cyan-400"/> Hướng dẫn tạo Prompt</h2>
           <p className="text-gray-400 text-sm mb-4">
            Thêm hướng dẫn chung hoặc phong cách bạn muốn AI tuân theo khi tạo tất cả các prompt. Ví dụ: "phong cách nghệ thuật Ghibli, màu sắc sống động"
           </p>
           <textarea
             value={overallPrompt}
             onChange={e => setOverallPrompt(e.target.value)}
             placeholder="Ví dụ: phong cách phim hoạt hình, ánh sáng điện ảnh, chi tiết cao..."
             className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 transition text-base"
             rows={2}
           />
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center"><ArrowUpTrayIcon className="w-6 h-6 mr-2 text-cyan-400"/> Tải ảnh lên</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={triggerFilesInput}
              className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-400 hover:bg-gray-700/50 transition flex flex-col items-center justify-center"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && triggerFilesInput()}
              aria-label="Chọn tệp ảnh để tải lên"
            >
              <input
                type="file"
                ref={filesInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept="image/*"
              />
              <PhotoIcon className="w-10 h-10 mx-auto text-gray-500 mb-2" />
              <p className="text-gray-400 font-semibold">Chọn tệp ảnh</p>
              <p className="text-gray-500 text-xs mt-1">Bạn có thể chọn một hoặc nhiều tệp ảnh.</p>
            </div>
            <div
              onClick={triggerFolderInput}
              className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-400 hover:bg-gray-700/50 transition flex flex-col items-center justify-center"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && triggerFolderInput()}
              aria-label="Chọn một thư mục để tải lên tất cả các ảnh"
            >
              <input
                type="file"
                ref={folderInputRef}
                onChange={handleFileChange}
                className="hidden"
                {...{ directory: "", webkitdirectory: "" }}
              />
              <FolderIcon className="w-10 h-10 mx-auto text-gray-500 mb-2" />
              <p className="text-gray-400 font-semibold">Chọn thư mục</p>
              <p className="text-gray-500 text-xs mt-1">Tất cả ảnh trong thư mục sẽ được tải lên.</p>
            </div>
          </div>
        </div>

        {imageFiles.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Ảnh đã tải lên ({imageFiles.length})</h2>
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={triggerTextFileInput}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
                    >
                       <ArrowUpTrayIcon className="w-5 h-5"/>
                       Nhập mô tả từ TXT
                    </button>
                     <input
                        type="file"
                        accept=".txt"
                        ref={textFileInputRef}
                        onChange={handleTextFileChange}
                        className="hidden"
                      />
                    <button 
                        onClick={handleExportAllPrompts}
                        disabled={!imageFiles.some(f => f.generatedPrompt)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DocumentArrowDownIcon className="w-5 h-5"/>
                        Xuất tất cả
                    </button>
                    <button 
                        onClick={handleGenerateAll} 
                        disabled={isGeneratingAll || imageFiles.every(f => f.generatedPrompt)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {isGeneratingAll ? (
                           <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                       ) : <SparklesIcon className="w-5 h-5"/>}
                       {isGeneratingAll ? 'Đang tạo...' : 'Tạo tất cả Prompt'}
                    </button>
                    <button
                        onClick={handleDeleteAll}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
                        >
                        <TrashIcon className="w-5 h-5"/>
                        Xóa tất cả
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {imageFiles.map(imageFile => (
                <ImageCard
                  key={imageFile.id}
                  imageFile={imageFile}
                  onDescriptionChange={handleDescriptionChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
             <div className="mt-8 text-center">
                 <p className="text-gray-500 text-sm">
                    Gợi ý: Sau khi tạo prompt, bạn có thể chỉnh sửa mô tả và tạo lại để có kết quả tốt hơn.
                 </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;