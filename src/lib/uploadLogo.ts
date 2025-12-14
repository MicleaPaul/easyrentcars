import { supabase } from './supabase';
import { uploadSiteAsset } from './storageService';

export async function uploadLogoToSupabase() {
  try {
    const response = await fetch('/logoeasyrentcars.png');
    const blob = await response.blob();
    const file = new File([blob], 'logoeasyrentcars.png', { type: 'image/png' });

    console.log('Uploading logo to Supabase...');
    const result = await uploadSiteAsset(file, 'assets');
    console.log('Logo uploaded successfully:', result.url);

    const { error } = await supabase
      .from('settings')
      .update({
        value: {
          url: result.url,
          alt: 'EasyRentCars Logo',
          width: 500,
          height: 500
        }
      })
      .eq('key', 'site_logo');

    if (error) {
      throw error;
    }

    console.log('Logo URL saved to settings successfully!');
    return result.url;
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
}
