import { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, Mail, DollarSign, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface SiteSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description: string;
}

export function SiteSettingsManagement() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      const settingsMap: Record<string, any> = {};
      data?.forEach((setting: SiteSetting) => {
        settingsMap[setting.key] = setting.value;
      });

      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function updateSetting(key: string, value: any) {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ value })
        .eq('key', key);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
      return false;
    }
  }

  async function handleSave() {
    setSaving(true);
    setSuccessMessage('');

    try {
      const updates = Object.entries(settings).map(([key, value]) =>
        updateSetting(key, value)
      );

      const results = await Promise.all(updates);

      if (results.every(r => r)) {
        setSuccessMessage('Settings saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert('Some settings failed to save');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  function updateBusinessHours(type: 'weekday' | 'weekend', field: 'opens' | 'closes', value: string) {
    setSettings({
      ...settings,
      business_hours: {
        ...settings.business_hours,
        [type]: {
          ...settings.business_hours[type],
          [field]: value,
        },
      },
    });
  }

  function updateContactInfo(field: string, value: string) {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setSettings({
        ...settings,
        contact_info: {
          ...settings.contact_info,
          address: {
            ...settings.contact_info.address,
            [addressField]: value,
          },
        },
      });
    } else {
      setSettings({
        ...settings,
        contact_info: {
          ...settings.contact_info,
          [field]: value,
        },
      });
    }
  }

  function updateAfterHoursFee(value: number) {
    setSettings({
      ...settings,
      after_hours_fee: {
        ...settings.after_hours_fee,
        amount: value,
      },
    });
  }

  function updateCleaningFee(value: number) {
    setSettings({
      ...settings,
      cleaning_fee: {
        ...settings.cleaning_fee,
        amount: value,
      },
    });
  }

  function updateUnlimitedKmFee(value: number) {
    setSettings({
      ...settings,
      unlimited_km_fee: {
        ...settings.unlimited_km_fee,
        amount_per_day: value,
      },
    });
  }

  if (loading) {
    return (
      <div className="text-center text-[#9AA0A6] py-12">
        {t('admin.loadingSettings')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('admin.siteSettings')}</h2>
          <p className="text-[#9AA0A6] mt-1">{t('admin.manageBusinessHours')}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? t('admin.saving') : t('admin.saveAllChanges')}
        </button>
      </div>

      {successMessage && (
        <div className="card-luxury p-4 bg-green-500/10 border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-500 text-xl">✓</span>
            </div>
            <p className="text-green-500 font-semibold">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="card-luxury p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center">
            <Clock className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{t('admin.businessHours')}</h3>
            <p className="text-[#9AA0A6] text-sm">{t('admin.configureHours')}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-white font-semibold">{t('admin.weekdayHours')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#9AA0A6] text-sm mb-2">{t('admin.opens')}</label>
                  <input
                    type="time"
                    value={settings.business_hours?.weekday?.opens || '09:00'}
                    onChange={(e) => updateBusinessHours('weekday', 'opens', e.target.value)}
                    className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                  />
                </div>
                <div>
                  <label className="block text-[#9AA0A6] text-sm mb-2">{t('admin.closes')}</label>
                  <input
                    type="time"
                    value={settings.business_hours?.weekday?.closes || '18:00'}
                    onChange={(e) => updateBusinessHours('weekday', 'closes', e.target.value)}
                    className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold">{t('admin.weekendHours')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#9AA0A6] text-sm mb-2">{t('admin.opens')}</label>
                  <input
                    type="time"
                    value={settings.business_hours?.weekend?.opens || '10:00'}
                    onChange={(e) => updateBusinessHours('weekend', 'opens', e.target.value)}
                    className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                  />
                </div>
                <div>
                  <label className="block text-[#9AA0A6] text-sm mb-2">{t('admin.closes')}</label>
                  <input
                    type="time"
                    value={settings.business_hours?.weekend?.closes || '16:00'}
                    onChange={(e) => updateBusinessHours('weekend', 'closes', e.target.value)}
                    className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-[#D4AF37] mt-0.5" />
              <div className="flex-1">
                <label className="block text-white font-semibold mb-2">{t('admin.afterHoursServiceFee')}</label>
                <p className="text-[#9AA0A6] text-sm mb-3">
                  {t('admin.afterHoursServiceFeeDesc')}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-white">€</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={settings.after_hours_fee?.amount || 30}
                    onChange={(e) => updateAfterHoursFee(Number(e.target.value))}
                    className="w-32 bg-[#0B0C0F] text-[#F5F7FA] px-4 py-2 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-luxury p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{t('admin.pricingSettings')}</h3>
            <p className="text-[#9AA0A6] text-sm">{t('admin.additionalFees')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-[#D4AF37] mt-0.5" />
              <div className="flex-1">
                <label className="block text-white font-semibold mb-2">{t('admin.cleaningFee')}</label>
                <p className="text-[#9AA0A6] text-sm mb-3">
                  {t('admin.cleaningFeeDesc')}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-white">€</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.cleaning_fee?.amount || 7}
                    onChange={(e) => updateCleaningFee(Number(e.target.value))}
                    className="w-32 bg-[#0B0C0F] text-[#F5F7FA] px-4 py-2 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-[#D4AF37] mt-0.5" />
              <div className="flex-1">
                <label className="block text-white font-semibold mb-2">{t('admin.unlimitedKmFee')}</label>
                <p className="text-[#9AA0A6] text-sm mb-3">
                  {t('admin.unlimitedKmFeeDesc')}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-white">€</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.unlimited_km_fee?.amount_per_day || 15}
                    onChange={(e) => updateUnlimitedKmFee(Number(e.target.value))}
                    className="w-32 bg-[#0B0C0F] text-[#F5F7FA] px-4 py-2 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                  />
                  <span className="text-[#9AA0A6] text-sm">{t('admin.perDayShort')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-luxury p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center">
            <Phone className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{t('admin.contactInformation')}</h3>
            <p className="text-[#9AA0A6] text-sm">{t('admin.primaryContactDetails')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t('admin.phoneNumber')}
              </div>
            </label>
            <input
              type="tel"
              value={settings.contact_info?.phone || ''}
              onChange={(e) => updateContactInfo('phone', e.target.value)}
              className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              placeholder="+43 664 158 4950"
            />
          </div>

          <div>
            <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('admin.emailAddress')}
              </div>
            </label>
            <input
              type="email"
              value={settings.contact_info?.email || ''}
              onChange={(e) => updateContactInfo('email', e.target.value)}
              className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              placeholder="office@easyrentgraz.at"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('admin.address')}
              </div>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={settings.contact_info?.address?.city || ''}
                onChange={(e) => updateContactInfo('address.city', e.target.value)}
                className="bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                placeholder={t('admin.city')}
              />
              <input
                type="text"
                value={settings.contact_info?.address?.postalCode || ''}
                onChange={(e) => updateContactInfo('address.postalCode', e.target.value)}
                className="bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                placeholder={t('admin.postalCode')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card-luxury p-4 bg-amber-500/10 border-amber-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <p className="text-amber-400 font-semibold mb-1">Important Note</p>
            <p className="text-amber-300/80 text-sm">
              Changes to business hours and contact information will be reflected immediately on the website
              and in structured data for search engines. Make sure all information is accurate before saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
