import { supabase } from './supabase';

interface LogoSettings {
  url: string;
  alt: string;
  width: number;
  height: number;
}

let cachedLogoUrl: string | null = null;

export async function getLogoUrl(): Promise<string> {
  if (cachedLogoUrl) {
    return cachedLogoUrl;
  }

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'site_logo')
      .maybeSingle();

    if (error) {
      console.error('Error fetching logo URL:', error);
      return '';
    }

    if (data && data.value) {
      const logoSettings = data.value as LogoSettings;
      cachedLogoUrl = logoSettings.url;
      return logoSettings.url;
    }

    return '';
  } catch (error) {
    console.error('Error in getLogoUrl:', error);
    return '';
  }
}

export async function updateLogoUrl(url: string): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .update({
      value: {
        url,
        alt: 'EasyRentCars Logo',
        width: 1200,
        height: 400
      }
    })
    .eq('key', 'site_logo');

  if (error) {
    throw new Error(`Failed to update logo URL: ${error.message}`);
  }

  cachedLogoUrl = url;
}

export function clearLogoCache(): void {
  cachedLogoUrl = null;
}
