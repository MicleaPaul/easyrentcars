import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadVehicleImage(
  vehicleId: string,
  file: File
): Promise<UploadResult> {
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${vehicleId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('vehicle-images')
    .upload(filePath, file, {
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('vehicle-images')
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

export async function deleteVehicleImage(imagePath: string): Promise<void> {
  const path = extractPathFromUrl(imagePath, 'vehicle-images');

  if (!path) {
    console.warn('Could not extract path from URL:', imagePath);
    return;
  }

  const { error } = await supabase.storage
    .from('vehicle-images')
    .remove([path]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

export async function deleteMultipleVehicleImages(imagePaths: string[]): Promise<void> {
  const paths = imagePaths
    .map(path => extractPathFromUrl(path, 'vehicle-images'))
    .filter((path): path is string => path !== null);

  if (paths.length === 0) {
    return;
  }

  const { error } = await supabase.storage
    .from('vehicle-images')
    .remove(paths);

  if (error) {
    console.error('Delete multiple error:', error);
    throw new Error(`Failed to delete images: ${error.message}`);
  }
}

export async function updateVehicleImages(
  vehicleId: string,
  imageUrls: string[]
): Promise<void> {
  const { error } = await supabase
    .from('vehicles')
    .update({ images: imageUrls })
    .eq('id', vehicleId);

  if (error) {
    console.error('Update vehicle images error:', error);
    throw new Error(`Failed to update vehicle images: ${error.message}`);
  }
}

export async function uploadSiteAsset(
  file: File,
  folder: string = 'logos'
): Promise<UploadResult> {
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('site-assets')
    .upload(filePath, file, {
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload site asset: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('site-assets')
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

export async function deleteSiteAsset(assetPath: string): Promise<void> {
  const path = extractPathFromUrl(assetPath, 'site-assets');

  if (!path) {
    console.warn('Could not extract path from URL:', assetPath);
    return;
  }

  const { error } = await supabase.storage
    .from('site-assets')
    .remove([path]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete site asset: ${error.message}`);
  }
}

function extractPathFromUrl(url: string, bucketName: string = 'vehicle-images'): string | null {
  try {
    const bucketPath = `/storage/v1/object/public/${bucketName}/`;
    const index = url.indexOf(bucketPath);

    if (index !== -1) {
      return url.substring(index + bucketPath.length);
    }

    if (url.includes(bucketName + '/')) {
      const parts = url.split(bucketName + '/');
      return parts[1];
    }

    return null;
  } catch (error) {
    console.error('Error extracting path:', error);
    return null;
  }
}
