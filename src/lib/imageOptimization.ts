import imageCompression from 'browser-image-compression';

export interface OptimizedImage {
  file: File;
  preview: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export async function optimizeImage(file: File): Promise<OptimizedImage> {
  const originalSize = file.size;

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
  };

  try {
    const compressedFile = await imageCompression(file, options);

    const webpFile = new File(
      [compressedFile],
      file.name.replace(/\.[^/.]+$/, '.webp'),
      { type: 'image/webp' }
    );

    const preview = await imageCompression.getDataUrlFromFile(webpFile);
    const compressedSize = webpFile.size;
    const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

    return {
      file: webpFile,
      preview,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  } catch (error) {
    throw new Error('Failed to optimize image');
  }
}

export async function generateThumbnail(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 400,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.75,
  };

  try {
    const thumbnailBlob = await imageCompression(file, options);
    const thumbnailFile = new File(
      [thumbnailBlob],
      `thumb_${file.name.replace(/\.[^/.]+$/, '.webp')}`,
      { type: 'image/webp' }
    );
    return thumbnailFile;
  } catch (error) {
    throw new Error('Failed to generate thumbnail');
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.',
    };
  }

  return { valid: true };
}
