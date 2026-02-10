import React, { useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (file) {
      // Check file size (1GB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 1GB limit. Please upload a smaller file.");
        event.target.value = ''; // Clear the input so user can retry
        return;
      }
      
      onFileSelect(file);
    }
  };

  const handleDropZoneClick = () => {
      document.getElementById('file-upload')?.click();
  };

  const handleDropZoneKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleDropZoneClick();
      }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
      
      </label>
      <div 
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
        onClick={handleDropZoneClick}
        onKeyDown={handleDropZoneKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Upload file drop zone. Click or press enter to select a file."
      >
        <div className="space-y-1 text-center">
          <svg
            className={`mx-auto h-12 w-12 ${error ? 'text-red-400' : 'text-gray-400'}`}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600 justify-center">
            <div
              className="relative bg-transparent rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept="application/pdf"
                onChange={handleFileChange}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className={`text-xs ${error ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
            {error ? error : 'PDF'}
          </p>
        </div>
      </div>
      
      {selectedFile && (
        <div className="mt-4 space-y-4">
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md text-green-700" role="status" aria-label={`Selected file: ${selectedFile.name}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="text-sm font-medium truncate">{selectedFile.name}</span>
            </div>
        </div>
      )}
    </div>
  );
};