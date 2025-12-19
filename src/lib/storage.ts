import { supabase } from './supabase';

/**
 * Upload an image file to Supabase Storage
 * @param bucket - Storage bucket name (e.g., 'site-assets')
 * @param file - File to upload
 * @param path - Path within bucket (e.g., 'projects/project-123/image.jpg')
 * @returns Public URL of uploaded file
 */
export async function uploadImage(
  bucket: string,
  file: File,
  path: string
): Promise<string> {
  try {
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      // If file already exists, try with timestamp prefix
      if (error.message.includes('already exists')) {
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        const newPath = `${path.split('/').slice(0, -1).join('/')}/${fileName}-${timestamp}.${fileExt}`;
        
        const { data: retryData, error: retryError } = await supabase.storage
          .from(bucket)
          .upload(newPath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (retryError) throw retryError;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(newPath);
        
        return urlData.publicUrl;
      }
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image to Supabase Storage:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete an image from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - Path to file within bucket
 */
export async function deleteImage(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image from Supabase Storage:', error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}



