import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ImageManager } from './ImageManager';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  status: string;
  category: string;
  transmission: string;
  fuel_type: string;
  seats: number;
  doors: number;
  minimum_age: number;
  images?: string[];
  is_featured?: boolean;
  is_new?: boolean;
  is_popular?: boolean;
  badge_type?: string;
  badge_text?: string;
  badge_color?: string;
  badge_expires_at?: string;
  priority_order?: number;
}

interface VehicleEditModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function VehicleEditModal({ vehicle, isOpen, onClose, onSave }: VehicleEditModalProps) {
  const isCreateMode = !vehicle.id;
  const [formData, setFormData] = useState(vehicle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'badges'>('details');
  const [vehicleImages, setVehicleImages] = useState<string[]>(vehicle.images || []);

  useEffect(() => {
    setFormData(vehicle);
    setVehicleImages(vehicle.images || []);
    setError('');
    setSuccess(false);
    setActiveTab('details');
  }, [vehicle, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.brand || !formData.model) {
        throw new Error('Brand and Model are required');
      }

      if (formData.price_per_day <= 0) {
        throw new Error('Price must be greater than 0');
      }

      const vehicleData = {
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        price_per_day: formData.price_per_day,
        status: formData.status,
        category: formData.category,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        seats: formData.seats,
        doors: formData.doors,
        minimum_age: formData.minimum_age,
        images: vehicleImages,
        is_featured: formData.is_featured || false,
        is_new: formData.is_new || false,
        is_popular: formData.is_popular || false,
        badge_type: formData.badge_type || null,
        badge_text: formData.badge_text || null,
        badge_color: formData.badge_color || null,
        badge_expires_at: formData.badge_expires_at || null,
        priority_order: formData.priority_order || 0,
      };

      if (isCreateMode) {
        const { error: insertError } = await supabase
          .from('vehicles')
          .insert([vehicleData]);

        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', vehicle.id);

        if (updateError) throw updateError;
      }

      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || `Failed to ${isCreateMode ? 'create' : 'update'} vehicle`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#111316] border border-[#D4AF37]/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-[#111316] border-b border-[#D4AF37]/20 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{isCreateMode ? 'Add New Vehicle' : 'Edit Vehicle'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#9AA0A6]" />
          </button>
        </div>

        <div className="flex gap-4 px-6 pt-4 border-b border-[#D4AF37]/20">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 font-semibold text-sm uppercase tracking-wide transition-all relative ${
              activeTab === 'details'
                ? 'text-[#D4AF37]'
                : 'text-[#9AA0A6] hover:text-white'
            }`}
          >
            Vehicle Details
            {activeTab === 'details' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 font-semibold text-sm uppercase tracking-wide transition-all relative flex items-center gap-2 ${
              activeTab === 'photos'
                ? 'text-[#D4AF37]'
                : 'text-[#9AA0A6] hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Photos ({vehicleImages.length})
            {activeTab === 'photos' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 font-semibold text-sm uppercase tracking-wide transition-all relative ${
              activeTab === 'badges'
                ? 'text-[#D4AF37]'
                : 'text-[#9AA0A6] hover:text-white'
            }`}
          >
            Marketing Badges
            {activeTab === 'badges' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F]" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-green-500 text-sm">
                {isCreateMode ? 'Vehicle created successfully!' : 'Vehicle updated successfully!'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                Brand
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                Model
              </label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                Year
              </label>
              <input
                type="number"
                required
                min="2000"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                Price per Day (€)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price_per_day}
                onChange={(e) => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) })}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                Category
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              >
                <option value="Economy">Economy</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                Status
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              >
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                Transmission
              </label>
              <select
                required
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              >
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>

            <div>
              <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                Fuel Type
              </label>
              <select
                required
                value={formData.fuel_type}
                onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                Seats
              </label>
              <input
                type="number"
                required
                min="2"
                max="9"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                Doors
              </label>
              <input
                type="number"
                required
                min="2"
                max="5"
                value={formData.doors}
                onChange={(e) => setFormData({ ...formData, doors: parseInt(e.target.value) })}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                Minimum Age
              </label>
              <input
                type="number"
                required
                min="18"
                max="30"
                value={formData.minimum_age}
                onChange={(e) => setFormData({ ...formData, minimum_age: parseInt(e.target.value) })}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              />
            </div>
          </div>

          {vehicle.price_per_day !== formData.price_per_day && (
            <div className="p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
              <p className="text-[#D4AF37] text-sm font-medium">
                Price Change: €{vehicle.price_per_day} → €{formData.price_per_day}
              </p>
            </div>
          )}

        </form>
          ) : activeTab === 'photos' ? (
            <div className="p-6">
              {isCreateMode ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-[#9AA0A6] mx-auto mb-4" />
                  <p className="text-[#9AA0A6] text-lg mb-2">Save vehicle first to add photos</p>
                  <p className="text-[#9AA0A6] text-sm">You can upload images after creating the vehicle</p>
                </div>
              ) : (
                <ImageManager
                  vehicleId={vehicle.id}
                  images={vehicleImages}
                  onImagesChange={setVehicleImages}
                />
              )}
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Vehicle Marketing Badges</h3>
                <p className="text-[#9AA0A6] text-sm mb-6">
                  Configure special badges to highlight this vehicle on your website
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card-luxury p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured || false}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-5 h-5 rounded border-[#D4AF37]/20 bg-[#111316] text-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                      />
                      <div>
                        <p className="text-white font-semibold">Featured Vehicle</p>
                        <p className="text-[#9AA0A6] text-xs">Show in featured section</p>
                      </div>
                    </label>
                  </div>

                  <div className="card-luxury p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_new || false}
                        onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                        className="w-5 h-5 rounded border-[#D4AF37]/20 bg-[#111316] text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <div>
                        <p className="text-white font-semibold">New to Fleet</p>
                        <p className="text-[#9AA0A6] text-xs">Mark as newly added</p>
                      </div>
                    </label>
                  </div>

                  <div className="card-luxury p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_popular || false}
                        onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                        className="w-5 h-5 rounded border-[#D4AF37]/20 bg-[#111316] text-green-500 focus:ring-2 focus:ring-green-500/20"
                      />
                      <div>
                        <p className="text-white font-semibold">Popular Choice</p>
                        <p className="text-[#9AA0A6] text-xs">Frequently rented</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="card-luxury p-6 space-y-4">
                  <h4 className="text-white font-semibold">Custom Badge</h4>

                  <div>
                    <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                      Badge Type
                    </label>
                    <select
                      value={formData.badge_type || ''}
                      onChange={(e) => setFormData({ ...formData, badge_type: e.target.value || undefined })}
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                    >
                      <option value="">None</option>
                      <option value="hot_deal">Hot Deal</option>
                      <option value="limited_offer">Limited Offer</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  {formData.badge_type && (
                    <>
                      <div>
                        <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                          Badge Text
                        </label>
                        <input
                          type="text"
                          value={formData.badge_text || ''}
                          onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                          placeholder="e.g., Special Offer, 20% Off"
                          className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                          Badge Expires (Optional)
                        </label>
                        <input
                          type="date"
                          value={formData.badge_expires_at?.split('T')[0] || ''}
                          onChange={(e) => setFormData({ ...formData, badge_expires_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                          Display Priority (Lower = Higher Priority)
                        </label>
                        <input
                          type="number"
                          value={formData.priority_order || 0}
                          onChange={(e) => setFormData({ ...formData, priority_order: parseInt(e.target.value) })}
                          min="0"
                          className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {(activeTab === 'details' || activeTab === 'badges') && (
          <div className="sticky bottom-0 bg-[#111316] border-t border-[#D4AF37]/20 p-6">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-lg border border-[#D4AF37]/20 text-[#9AA0A6] hover:border-[#D4AF37] hover:text-white transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const form = document.querySelector('form');
                  if (form) {
                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(submitEvent);
                  }
                }}
                disabled={loading || success}
                className="flex-1 btn-primary px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  isCreateMode ? 'Creating...' : 'Saving...'
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isCreateMode ? 'Create Vehicle' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
