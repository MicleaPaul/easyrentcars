import { supabase } from './supabase';

export async function uploadAsset(
  file: File | Blob,
  fileName: string,
  bucket: string = 'assets'
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: 'image/png',
        upsert: true,
        cacheControl: '31536000',
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl, path: data.path };
  } catch (error) {
    console.error('Upload failed:', error);
    return { success: false, error };
  }
}

export async function getAssetUrl(
  fileName: string,
  bucket: string = 'assets'
): Promise<string> {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return data.publicUrl;
}
