import { useState, useEffect } from 'react';
import { Lock, Edit2, Trash2, Calendar, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { VehicleBlockModal } from './VehicleBlockModal';

interface VehicleBlock {
  id: string;
  vehicle_id: string;
  blocked_from: string;
  blocked_until: string;
  reason: string;
  contact_info?: string;
  created_at: string;
  vehicles?: {
    brand: string;
    model: string;
  };
}

export function VehicleBlocksManagement() {
  const { t } = useLanguage();
  const [blocks, setBlocks] = useState<VehicleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlock, setEditingBlock] = useState<VehicleBlock | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'past'>('active');

  useEffect(() => {
    fetchBlocks();
  }, []);

  async function fetchBlocks() {
    try {
      const { data, error } = await supabase
        .from('vehicle_blocks')
        .select(`
          *,
          vehicles (
            brand,
            model
          )
        `)
        .order('blocked_from', { ascending: false });

      if (error) throw error;
      setBlocks(data || []);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(blockId: string, vehicleName: string) {
    if (!confirm(t('admin.deleteBlockConfirm') || `Sigur doriți să ștergeți blocarea pentru ${vehicleName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vehicle_blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;

      alert(t('admin.blockDeletedSuccess') || 'Blocare ștearsă cu succes!');
      fetchBlocks();
    } catch (error) {
      console.error('Error deleting block:', error);
      alert(t('admin.blockDeleteError') || 'Eroare la ștergerea blocării');
    }
  }

  const now = new Date();
  const filteredBlocks = blocks.filter(block => {
    const from = new Date(block.blocked_from);
    const until = new Date(block.blocked_until);

    switch (filter) {
      case 'active':
        return from <= now && until >= now;
      case 'upcoming':
        return from > now;
      case 'past':
        return until < now;
      default:
        return true;
    }
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBlockStatus = (from: string, until: string) => {
    const fromDate = new Date(from);
    const untilDate = new Date(until);

    if (fromDate <= now && untilDate >= now) {
      return { label: t('admin.statusActive') || 'Activ', color: 'bg-orange-500/10 text-orange-500' };
    } else if (fromDate > now) {
      return { label: t('admin.statusUpcoming') || 'Viitor', color: 'bg-blue-500/10 text-blue-500' };
    } else {
      return { label: t('admin.statusPast') || 'Trecut', color: 'bg-gray-500/10 text-gray-500' };
    }
  };

  if (loading) {
    return (
      <div className="text-center text-[#9AA0A6] py-12">{t('common.loading')}</div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{t('admin.vehicleBlocks') || 'Blocări vehicule'}</h2>
            <p className="text-[#9AA0A6] text-sm mt-1">
              {t('admin.vehicleBlocksDescription') || 'Gestionează blocările temporare ale vehiculelor'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-[#1A1B1E] text-[#9AA0A6] hover:bg-[#2A2B2E]'
              }`}
            >
              {t('admin.filterAll') || 'Toate'} ({blocks.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-[#1A1B1E] text-[#9AA0A6] hover:bg-[#2A2B2E]'
              }`}
            >
              {t('admin.filterActive') || 'Active'} ({blocks.filter(b => new Date(b.blocked_from) <= now && new Date(b.blocked_until) >= now).length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-[#1A1B1E] text-[#9AA0A6] hover:bg-[#2A2B2E]'
              }`}
            >
              {t('admin.filterUpcoming') || 'Viitoare'} ({blocks.filter(b => new Date(b.blocked_from) > now).length})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-[#1A1B1E] text-[#9AA0A6] hover:bg-[#2A2B2E]'
              }`}
            >
              {t('admin.filterPast') || 'Trecute'} ({blocks.filter(b => new Date(b.blocked_until) < now).length})
            </button>
          </div>
        </div>

        {filteredBlocks.length === 0 ? (
          <div className="card-luxury p-12 text-center">
            <Lock className="w-12 h-12 text-[#9AA0A6] mx-auto mb-4" />
            <p className="text-[#9AA0A6]">
              {filter === 'all'
                ? (t('admin.noBlocks') || 'Nu există blocări')
                : (t('admin.noBlocksFiltered') || 'Nu există blocări pentru acest filtru')}
            </p>
          </div>
        ) : (
          <div className="card-luxury overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0B0C0F]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                      {t('admin.vehicle') || 'Vehicul'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                      {t('admin.blockPeriod') || 'Perioada'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                      {t('admin.blockReason') || 'Motiv'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                      {t('admin.status') || 'Status'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                      {t('admin.actions') || 'Acțiuni'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/10">
                  {filteredBlocks.map((block) => {
                    const status = getBlockStatus(block.blocked_from, block.blocked_until);
                    const vehicleName = block.vehicles
                      ? `${block.vehicles.brand} ${block.vehicles.model}`
                      : t('admin.unknownVehicle') || 'Vehicul necunoscut';

                    return (
                      <tr key={block.id} className="hover:bg-[#D4AF37]/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-white font-semibold">{vehicleName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-white flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {formatDateTime(block.blocked_from)}
                            </p>
                            <p className="text-[#9AA0A6] flex items-center gap-2 mt-1">
                              <span className="ml-5">→</span>
                              {formatDateTime(block.blocked_until)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white text-sm">{block.reason}</p>
                            {block.contact_info && (
                              <p className="text-[#9AA0A6] text-xs mt-1 flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                {block.contact_info}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingBlock(block)}
                              className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                              title={t('admin.editBlock') || 'Editare'}
                            >
                              <Edit2 className="w-4 h-4 text-[#D4AF37]" />
                            </button>
                            <button
                              onClick={() => handleDelete(block.id, vehicleName)}
                              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                              title={t('admin.deleteBlock') || 'Ștergere'}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editingBlock && (
        <VehicleBlockModal
          vehicleId={editingBlock.vehicle_id}
          vehicleName={editingBlock.vehicles ? `${editingBlock.vehicles.brand} ${editingBlock.vehicles.model}` : ''}
          block={editingBlock}
          onClose={() => setEditingBlock(null)}
          onSave={() => {
            fetchBlocks();
            setEditingBlock(null);
          }}
        />
      )}
    </>
  );
}