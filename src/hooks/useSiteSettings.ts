import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SiteSettings {
  business_hours?: {
    weekday: {
      opens: string;
      closes: string;
      days: string[];
    };
    weekend: {
      opens: string;
      closes: string;
      days: string[];
    };
  };
  after_hours_fee?: {
    amount: number;
    currency: string;
    description: string;
  };
  contact_info?: {
    phone: string;
    email: string;
    address: {
      street?: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
  location_fees?: Record<string, any>;
  company_info?: {
    name: string;
    description: string;
    established: string;
    languages: string[];
    social: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  cleaning_fee?: {
    amount: number;
    currency: string;
    description: string;
  };
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('*');

      if (fetchError) throw fetchError;

      const settingsMap: SiteSettings = {};
      data?.forEach((setting: any) => {
        settingsMap[setting.key as keyof SiteSettings] = setting.value;
      });

      setSettings(settingsMap);
    } catch (err: any) {
      console.error('Error fetching site settings:', err);
      setError(err.message || 'Failed to load site settings');
    } finally {
      setLoading(false);
    }
  }

  return { settings, loading, error, refetch: fetchSettings };
}
