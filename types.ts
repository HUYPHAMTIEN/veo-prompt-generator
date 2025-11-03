
export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  description: string;
  generatedPrompt?: string;
  isLoading: boolean;
  error?: string;
}
