import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, X, GripVertical, Loader2, AlertCircle, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { optimizeImage, validateImageFile, formatFileSize, OptimizedImage } from '../lib/imageOptimization';
import { uploadVehicleImage, deleteVehicleImage } from '../lib/storageService';

interface ImageManagerProps {
  vehicleId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
}

interface SortableImageProps {
  id: string;
  url: string;
  index: number;
  isMain: boolean;
  onDelete: (url: string) => void;
}

function SortableImage({ id, url, index, isMain, onDelete }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-video bg-[#0B0C0F] rounded-lg overflow-hidden border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
    >
      <img
        src={url}
        alt={`Vehicle ${index + 1}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#F4D03F] transition-all cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <button
          onClick={() => onDelete(url)}
          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
          title="Delete image"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {isMain && (
        <div className="absolute top-2 right-2 px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black text-xs font-bold rounded-full uppercase tracking-wide">
          Main Photo
        </div>
      )}

      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
        #{index + 1}
      </div>
    </div>
  );
}

export function ImageManager({ vehicleId, images, onImagesChange }: ImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [pendingUploads, setPendingUploads] = useState<OptimizedImage[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple: true,
    onDrop: handleFilesSelected,
  });

  async function handleFilesSelected(acceptedFiles: File[]) {
    setError('');
    setSuccess('');

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of acceptedFiles) {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const optimizedImages = await Promise.all(
        validFiles.map(file => optimizeImage(file))
      );

      setPendingUploads(optimizedImages);

      const uploadedUrls = await Promise.all(
        optimizedImages.map(async (optimized, index) => {
          const fileName = validFiles[index].name;
          setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));

          const result = await uploadVehicleImage(vehicleId, optimized.file);

          setUploadProgress(prev => ({ ...prev, [fileName]: 100 }));
          return result.url;
        })
      );

      const newImages = [...images, ...uploadedUrls];
      onImagesChange(newImages);

      setSuccess(`Successfully uploaded ${uploadedUrls.length} image(s)`);
      setPendingUploads([]);
      setUploadProgress({});

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteImage(url: string) {
    if (!confirm('Are you sure you want to delete this image?')) return;

    setError('');

    try {
      await deleteVehicleImage(url);
      const newImages = images.filter(img => img !== url);
      onImagesChange(newImages);
      setSuccess('Image deleted successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over.id as string);

      const reorderedImages = arrayMove(images, oldIndex, newIndex);
      onImagesChange(reorderedImages);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Manage Photos</h3>
        <p className="text-sm text-[#9AA0A6]">
          Upload, reorder, and delete vehicle photos. The first image will be the main photo shown in listings.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-500 text-sm whitespace-pre-line">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-500 text-sm">{success}</p>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-[#D4AF37] bg-[#D4AF37]/5'
            : 'border-[#D4AF37]/20 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-[#D4AF37]" />
            )}
          </div>
          <div>
            <p className="text-white font-semibold mb-1">
              {isDragActive ? 'Drop images here...' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-[#9AA0A6]">
              or click to browse (JPG, PNG, WebP - max 10MB each)
            </p>
          </div>
        </div>
      </div>

      {pendingUploads.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">
            Optimizing Images...
          </h4>
          {pendingUploads.map((img, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#0B0C0F] border border-[#D4AF37]/20">
              <div className="flex items-center gap-3">
                <img src={img.preview} alt="" className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium mb-1">Image {idx + 1}</p>
                  <p className="text-xs text-[#9AA0A6]">
                    {formatFileSize(img.originalSize)} → {formatFileSize(img.compressedSize)}
                    <span className="text-green-500 ml-2">(-{img.compressionRatio}%)</span>
                  </p>
                </div>
                <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#D4AF37]/20 rounded-lg">
          <ImageIcon className="w-16 h-16 text-[#9AA0A6] mx-auto mb-4" />
          <p className="text-[#9AA0A6]">No images uploaded yet</p>
          <p className="text-sm text-[#9AA0A6] mt-2">Upload some images to get started</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">
              Current Photos ({images.length})
            </h4>
            <p className="text-xs text-[#9AA0A6]">Drag images to reorder</p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={images} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((url, index) => (
                  <SortableImage
                    key={url}
                    id={url}
                    url={url}
                    index={index}
                    isMain={index === 0}
                    onDelete={handleDeleteImage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
