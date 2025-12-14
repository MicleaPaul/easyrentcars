import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface VehicleBlock {
  id?: string;
  vehicle_id: string;
  blocked_from: string;
  blocked_until: string;
  reason: string;
  contact_info?: string;
}

interface VehicleBlockModalProps {
  vehicleId: string;
  vehicleName: string;
  block?: VehicleBlock;
  onClose: () => void;
  onSave: () => void;
}

export function VehicleBlockModal({ vehicleId, vehicleName, block, onClose, onSave }: VehicleBlockModalProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    blocked_from: block?.blocked_from ? new Date(block.blocked_from).toISOString().slice(0, 16) : '',
    blocked_until: block?.blocked_until ? new Date(block.blocked_until).toISOString().slice(0, 16) : '',
    reason: block?.reason || 'Rezervare telefonică',
    contact_info: block?.contact_info || '',
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const validateDates = () => {
    const from = new Date(formData.blocked_from);
    const until = new Date(formData.blocked_until);
    const now = new Date();

    if (!formData.blocked_from || !formData.blocked_until) {
      setError(t('admin.blockErrorMissingDates') || 'Vă rugăm completați ambele date');
      return false;
    }

    if (from >= until) {
      setError(t('admin.blockErrorInvalidDates') || 'Data de sfârșit trebuie să fie după data de început');
      return false;
    }

    if (!block && from < now) {
      setError(t('admin.blockErrorPastDate') || 'Data de început nu poate fi în trecut');
      return false;
    }

    return true;
  };

  const checkOverlap = async () => {
    try {
      const from = new Date(formData.blocked_from).toISOString();
      const until = new Date(formData.blocked_until).toISOString();

      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .lt('pickup_date', until)
        .gt('return_date', from)
        .in('booking_status', ['confirmed', 'active', 'pending']);

      if (bookings && bookings.length > 0) {
        setError(t('admin.blockErrorOverlapBooking') || 'Există deja o rezervare confirmată în acest interval');
        return false;
      }

      let blocksQuery = supabase
        .from('vehicle_blocks')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .lt('blocked_from', until)
        .gt('blocked_until', from);

      if (block?.id) {
        blocksQuery = blocksQuery.neq('id', block.id);
      }

      const { data: blocks } = await blocksQuery;

      if (blocks && blocks.length > 0) {
        setError(t('admin.blockErrorOverlapBlock') || 'Există deja o blocare în acest interval');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error checking overlap:', err);
      setError(t('admin.blockErrorCheck') || 'Eroare la verificarea disponibilității');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateDates()) return;

    setLoading(true);

    const isAvailable = await checkOverlap();
    if (!isAvailable) {
      setLoading(false);
      return;
    }

    try {
      const blockData = {
        vehicle_id: vehicleId,
        blocked_from: new Date(formData.blocked_from).toISOString(),
        blocked_until: new Date(formData.blocked_until).toISOString(),
        reason: formData.reason,
        contact_info: formData.contact_info || null,
      };

      if (block?.id) {
        const { error: updateError } = await supabase
          .from('vehicle_blocks')
          .update(blockData)
          .eq('id', block.id);

        if (updateError) throw updateError;
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const { error: insertError } = await supabase
          .from('vehicle_blocks')
          .insert({
            ...blockData,
            created_by: userData?.user?.id,
          });

        if (insertError) throw insertError;
      }

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error saving block:', err);
      setError(err.message || (t('admin.blockErrorSave') || 'Eroare la salvarea blocării'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!block?.id) return;

    const confirmMessage = t('admin.deleteBlockConfirm') || 'Sigur doriți să ștergeți această blocare?';
    if (!confirm(confirmMessage)) return;

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('vehicle_blocks')
        .delete()
        .eq('id', block.id);

      if (deleteError) throw deleteError;

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error deleting block:', err);
      setError(err.message || (t('admin.blockDeleteError') || 'Eroare la ștergerea blocării'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0B0C0F] border border-[#D4AF37]/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0B0C0F] border-b border-[#D4AF37]/20 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {block ? (t('admin.editBlock') || 'Editare blocare') : (t('admin.addBlock') || 'Blocare vehicul')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#9AA0A6]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg p-4">
            <p className="text-[#D4AF37] font-semibold">{vehicleName}</p>
            <p className="text-sm text-[#9AA0A6] mt-1">
              {t('admin.blockDescription') || 'Vehiculul va fi indisponibil pentru rezervări în intervalul selectat'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#9AA0A6] mb-2">
                <Calendar className="w-4 h-4" />
                {t('admin.blockFrom') || 'Blocat de la'}
              </label>
              <input
                type="datetime-local"
                value={formData.blocked_from}
                onChange={(e) => setFormData({ ...formData, blocked_from: e.target.value })}
                className="w-full bg-[#1A1B1E] border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#9AA0A6] mb-2">
                <Clock className="w-4 h-4" />
                {t('admin.blockUntil') || 'Blocat până la'}
              </label>
              <input
                type="datetime-local"
                value={formData.blocked_until}
                onChange={(e) => setFormData({ ...formData, blocked_until: e.target.value })}
                className="w-full bg-[#1A1B1E] border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#9AA0A6] mb-2">
              {t('admin.blockReason') || 'Motiv'}
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder={t('admin.blockReasonPlaceholder') || 'Ex: Rezervare telefonică, Mentenanță'}
              className="w-full bg-[#1A1B1E] border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white placeholder-[#9AA0A6]/50 focus:outline-none focus:border-[#D4AF37] transition-colors"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#9AA0A6] mb-2">
              <User className="w-4 h-4" />
              {t('admin.blockContact') || 'Informații contact (opțional)'}
            </label>
            <input
              type="text"
              value={formData.contact_info}
              onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
              placeholder={t('admin.blockContactPlaceholder') || 'Ex: Nume client, telefon'}
              className="w-full bg-[#1A1B1E] border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white placeholder-[#9AA0A6]/50 focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-4">
            {block?.id && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {t('common.delete') || 'Ștergere'}
              </button>
            )}
            <div className="flex-1 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-[#1A1B1E] hover:bg-[#2A2B2E] text-white rounded-lg transition-colors"
              >
                {t('common.cancel') || 'Anulare'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (t('common.saving') || 'Se salvează...') : (t('common.save') || 'Salvare')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}