import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Save, X, Package, Navigation, Users, Fuel, Baby, Globe, Wifi, Shield, Car } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface BookingExtra {
  id: string;
  name_de: string;
  name_en: string;
  name_fr: string;
  name_it: string;
  name_es: string;
  name_ro: string;
  description_de: string;
  description_en: string;
  description_fr: string;
  description_it: string;
  description_es: string;
  description_ro: string;
  price: number;
  price_type: 'per_day' | 'one_time';
  icon: string;
  is_active: boolean;
  sort_order: number;
}

const ICON_OPTIONS = [
  { name: 'Package', Comp: Package },
  { name: 'Navigation', Comp: Navigation },
  { name: 'Users', Comp: Users },
  { name: 'Fuel', Comp: Fuel },
  { name: 'Baby', Comp: Baby },
  { name: 'Globe', Comp: Globe },
  { name: 'Wifi', Comp: Wifi },
  { name: 'Shield', Comp: Shield },
  { name: 'Car', Comp: Car },
];

const iconMap: Record<string, any> = Object.fromEntries(ICON_OPTIONS.map(o => [o.name, o.Comp]));

const emptyExtra = (): Omit<BookingExtra, 'id'> => ({
  name_de: '', name_en: '', name_fr: '', name_it: '', name_es: '', name_ro: '',
  description_de: '', description_en: '', description_fr: '', description_it: '', description_es: '', description_ro: '',
  price: 0,
  price_type: 'per_day',
  icon: 'Package',
  is_active: true,
  sort_order: 0,
});

export function ExtrasManagement() {
  const { t } = useLanguage();
  const [extras, setExtras] = useState<BookingExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<BookingExtra> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExtras();
  }, []);

  async function fetchExtras() {
    setLoading(true);
    const { data, error } = await supabase
      .from('booking_extras')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      console.error('Error fetching extras:', error);
    } else {
      setExtras((data || []) as BookingExtra[]);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        name_de: editing.name_de || '',
        name_en: editing.name_en || '',
        name_fr: editing.name_fr || '',
        name_it: editing.name_it || '',
        name_es: editing.name_es || '',
        name_ro: editing.name_ro || '',
        description_de: editing.description_de || '',
        description_en: editing.description_en || '',
        description_fr: editing.description_fr || '',
        description_it: editing.description_it || '',
        description_es: editing.description_es || '',
        description_ro: editing.description_ro || '',
        price: Number(editing.price || 0),
        price_type: editing.price_type || 'per_day',
        icon: editing.icon || 'Package',
        is_active: editing.is_active ?? true,
        sort_order: Number(editing.sort_order || 0),
      };

      if (editing.id) {
        const { error } = await supabase.from('booking_extras').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('booking_extras').insert(payload);
        if (error) throw error;
      }
      setEditing(null);
      await fetchExtras();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('admin.extras.deleteConfirm'))) return;
    const { error } = await supabase.from('booking_extras').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchExtras();
  }

  async function toggleActive(extra: BookingExtra) {
    await supabase.from('booking_extras').update({ is_active: !extra.is_active }).eq('id', extra.id);
    fetchExtras();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{t('admin.extras.title')}</h2>
        <button
          onClick={() => setEditing(emptyExtra())}
          className="btn-primary px-5 py-2.5 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('admin.extras.add')}
        </button>
      </div>

      {loading ? (
        <div className="text-center text-[#9AA0A6] py-12">{t('common.loading') || 'Loading...'}</div>
      ) : extras.length === 0 ? (
        <div className="card-luxury p-12 text-center text-[#9AA0A6]">
          {t('admin.extras.empty')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {extras.map((extra) => {
            const IconComp = iconMap[extra.icon] || Package;
            return (
              <div key={extra.id} className="card-luxury p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                    <IconComp className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(extra)}
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        extra.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {extra.is_active ? t('admin.extras.active') : 'Inactive'}
                    </button>
                    <button onClick={() => setEditing(extra)} className="p-1.5 hover:bg-[#D4AF37]/10 rounded">
                      <Edit2 className="w-4 h-4 text-[#D4AF37]" />
                    </button>
                    <button onClick={() => handleDelete(extra.id)} className="p-1.5 hover:bg-red-500/10 rounded">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <p className="text-white font-semibold mb-1">{extra.name_en || extra.name_de || '(no name)'}</p>
                <p className="text-xs text-[#9AA0A6] line-clamp-2 mb-2">{extra.description_en}</p>
                <p className="text-sm text-[#D4AF37] font-semibold">
                  EUR{Number(extra.price).toFixed(2)} {extra.price_type === 'per_day' ? t('admin.extras.perDay') : t('admin.extras.oneTime')}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-[#111316] border border-[#D4AF37]/30 rounded-xl max-w-3xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editing.id ? t('admin.extras.edit') : t('admin.extras.add')}
              </h3>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-[#D4AF37]/10 rounded">
                <X className="w-5 h-5 text-[#9AA0A6]" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#9AA0A6] text-sm font-medium mb-2">{t('admin.extras.price')}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={editing.price ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(',', '.');
                      if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
                        setEditing({ ...editing, price: raw === '' ? 0 : Number(raw) });
                      }
                    }}
                    className="w-full bg-[#0B0C0F] text-white px-4 py-2.5 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#9AA0A6] text-sm font-medium mb-2">{t('admin.extras.priceType')}</label>
                  <select
                    value={editing.price_type || 'per_day'}
                    onChange={(e) => setEditing({ ...editing, price_type: e.target.value as any })}
                    className="w-full bg-[#0B0C0F] text-white px-4 py-2.5 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="per_day">{t('admin.extras.perDay')}</option>
                    <option value="one_time">{t('admin.extras.oneTime')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#9AA0A6] text-sm font-medium mb-2">{t('admin.extras.icon')}</label>
                  <select
                    value={editing.icon || 'Package'}
                    onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                    className="w-full bg-[#0B0C0F] text-white px-4 py-2.5 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none"
                  >
                    {ICON_OPTIONS.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[#9AA0A6] text-sm font-medium mb-2">Sort order</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={editing.sort_order ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '' || /^\d+$/.test(raw)) {
                        setEditing({ ...editing, sort_order: raw === '' ? 0 : Number(raw) });
                      }
                    }}
                    className="w-full bg-[#0B0C0F] text-white px-4 py-2.5 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.is_active ?? true}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-[#D4AF37]/40 bg-[#0B0C0F] checked:bg-[#D4AF37]"
                />
                <span className="text-white text-sm">{t('admin.extras.active')}</span>
              </label>

              <div>
                <h4 className="text-white font-semibold mb-3">{t('admin.extras.name')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['de','en','fr','it','es','ro'] as const).map(lang => (
                    <div key={`name-${lang}`}>
                      <label className="block text-xs text-[#9AA0A6] mb-1 uppercase">{lang}</label>
                      <input
                        type="text"
                        value={(editing as any)[`name_${lang}`] || ''}
                        onChange={(e) => setEditing({ ...editing, [`name_${lang}`]: e.target.value })}
                        className="w-full bg-[#0B0C0F] text-white px-3 py-2 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">{t('admin.extras.description')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['de','en','fr','it','es','ro'] as const).map(lang => (
                    <div key={`desc-${lang}`}>
                      <label className="block text-xs text-[#9AA0A6] mb-1 uppercase">{lang}</label>
                      <textarea
                        rows={3}
                        value={(editing as any)[`description_${lang}`] || ''}
                        onChange={(e) => setEditing({ ...editing, [`description_${lang}`]: e.target.value })}
                        className="w-full bg-[#0B0C0F] text-white px-3 py-2 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none text-sm resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-[#D4AF37]/20">
              <button
                onClick={() => setEditing(null)}
                className="px-5 py-2.5 rounded-lg border border-[#D4AF37]/20 text-[#9AA0A6] hover:text-white hover:border-[#D4AF37]"
                disabled={saving}
              >
                {t('admin.extras.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-5 py-2.5 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('admin.extras.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
