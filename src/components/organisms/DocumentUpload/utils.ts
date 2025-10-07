import { UploadConfig, ValidationResult, FileValidator, DEFAULT_UPLOAD_CONFIG } from './types';

/**
 * Validates a file against the upload configuration
 */
export const validateFile: FileValidator = (file: File, config: UploadConfig): ValidationResult => {
  const mergedConfig = { ...DEFAULT_UPLOAD_CONFIG, ...config };

  // File size validation
  if (mergedConfig.maxFileSize && file.size > mergedConfig.maxFileSize) {
    const maxSizeMB = Math.round(mergedConfig.maxFileSize / (1024 * 1024));
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }

  // File type validation
  if (mergedConfig.allowedTypes && !mergedConfig.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload PDF, Word, Excel, or Image files.'
    };
  }

  // File extension validation (fallback if MIME type is not reliable)
  if (mergedConfig.allowedExtensions) {
    const fileExtension = '.' + file.name.toLowerCase().split('.').pop();
    if (!mergedConfig.allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'File extension not supported. Please upload PDF, Word, Excel, or Image files.'
      };
    }
  }

  return { isValid: true };
};

/**
 * Determines file type from filename when MIME type is not available
 */
export const getFileTypeFromName = (filename: string): string => {
  if (!filename) return 'application/octet-stream';
  
  const extension = filename.toLowerCase().split('.').pop();
  const typeMap: Record<string, string> = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png'
  };
  
  return typeMap[extension || ''] || 'application/octet-stream';
};

/**
 * Formats file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formats date in a consistent format
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Generates a unique document ID
 */
export const generateDocumentId = (): string => {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Creates a blob URL for file preview/download
 */
export const createBlobUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Downloads a file using blob URL
 */
export const downloadFile = (file: File, filename?: string): void => {
  const url = createBlobUrl(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Opens a file in a new tab for preview
 */
export const previewFile = (file: File): void => {
  const url = createBlobUrl(file);
  window.open(url, '_blank');
  // Clean up the URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Checks if two files are duplicates based on name and size
 */
export const isDuplicateFile = (file: File, existingFiles: File[]): boolean => {
  return existingFiles.some(existingFile => 
    existingFile.name === file.name && existingFile.size === file.size
  );
};
