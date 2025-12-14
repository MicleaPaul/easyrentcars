import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, GripVertical, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLanguage } from '../contexts/LanguageContext';

interface FAQ {
  id: string;
  question_de: string;
  answer_de: string;
  question_en: string;
  answer_en: string;
  question_fr: string;
  answer_fr: string;
  question_it: string;
  answer_it: string;
  question_es: string;
  answer_es: string;
  question_ro: string;
  answer_ro: string;
  is_popular: boolean;
  display_order: number;
  is_hidden: boolean;
}

interface SortableFAQItemProps {
  faq: FAQ;
  onEdit: (faq: FAQ) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, isHidden: boolean) => void;
  onTogglePopular: (id: string, isPopular: boolean) => void;
}

function SortableFAQItem({ faq, onEdit, onDelete, onToggleVisibility, onTogglePopular }: SortableFAQItemProps) {
  const { t } = useLanguage();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card-luxury p-6 mb-4 hover:border-[#D4AF37]/40 transition-all"
    >
      <div className="flex items-start gap-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-2 p-2 hover:bg-[#D4AF37]/10 rounded cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5 text-[#9AA0A6]" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-white">{faq.question_en}</h3>
            {faq.is_popular && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/10 text-[#D4AF37]">
                {t('faq.popular')}
              </span>
            )}
            {faq.is_hidden && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500">
                {t('admin.hidden')}
              </span>
            )}
          </div>
          <p className="text-[#9AA0A6] text-sm line-clamp-2">{faq.answer_en}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onTogglePopular(faq.id, !faq.is_popular)}
            className={`p-2 rounded-lg transition-colors ${
              faq.is_popular ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'hover:bg-[#D4AF37]/10 text-[#9AA0A6]'
            }`}
            title={faq.is_popular ? 'Remove from popular' : 'Mark as popular'}
          >
            ⭐
          </button>
          <button
            onClick={() => onToggleVisibility(faq.id, !faq.is_hidden)}
            className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
            title={faq.is_hidden ? 'Show FAQ' : 'Hide FAQ'}
          >
            {faq.is_hidden ? (
              <EyeOff className="w-5 h-5 text-[#9AA0A6]" />
            ) : (
              <Eye className="w-5 h-5 text-[#9AA0A6]" />
            )}
          </button>
          <button
            onClick={() => onEdit(faq)}
            className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
          >
            <Edit2 className="w-5 h-5 text-[#D4AF37]" />
          </button>
          <button
            onClick={() => onDelete(faq.id)}
            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function FAQManagement() {
  const { t } = useLanguage();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchFAQs();
  }, []);

  async function fetchFAQs() {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      alert('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = faqs.findIndex((faq) => faq.id === active.id);
      const newIndex = faqs.findIndex((faq) => faq.id === over.id);

      const newFaqs = arrayMove(faqs, oldIndex, newIndex);
      setFaqs(newFaqs);

      try {
        const updates = newFaqs.map((faq, index) =>
          supabase
            .from('faqs')
            .update({ display_order: index })
            .eq('id', faq.id)
        );

        await Promise.all(updates);
      } catch (error) {
        console.error('Error updating FAQ order:', error);
        alert('Failed to update FAQ order');
        fetchFAQs();
      }
    }
  }

  async function handleToggleVisibility(id: string, isHidden: boolean) {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ is_hidden: isHidden })
        .eq('id', id);

      if (error) throw error;
      fetchFAQs();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Failed to update FAQ visibility');
    }
  }

  async function handleTogglePopular(id: string, isPopular: boolean) {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ is_popular: isPopular })
        .eq('id', id);

      if (error) throw error;
      fetchFAQs();
    } catch (error) {
      console.error('Error toggling popular:', error);
      alert('Failed to update FAQ');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('admin.deleteFaqConfirm'))) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Failed to delete FAQ');
    }
  }

  function handleCreate() {
    setIsCreating(true);
    setEditingFAQ({
      id: '',
      question_de: '',
      answer_de: '',
      question_en: '',
      answer_en: '',
      question_fr: '',
      answer_fr: '',
      question_it: '',
      answer_it: '',
      question_es: '',
      answer_es: '',
      question_ro: '',
      answer_ro: '',
      is_popular: false,
      display_order: faqs.length,
      is_hidden: false,
    });
  }

  if (loading) {
    return (
      <div className="text-center text-[#9AA0A6] py-12">
        {t('faq.loadingFaqs')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('admin.faqManagement')}</h2>
          <p className="text-[#9AA0A6] mt-1">{t('admin.faqSubtitle')}</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary px-6 py-3 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('admin.addFaq')}
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={faqs.map(f => f.id)} strategy={verticalListSortingStrategy}>
          {faqs.map((faq) => (
            <SortableFAQItem
              key={faq.id}
              faq={faq}
              onEdit={setEditingFAQ}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
              onTogglePopular={handleTogglePopular}
            />
          ))}
        </SortableContext>
      </DndContext>

      {faqs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#9AA0A6]">{t('fleet.noVehicles')}</p>
        </div>
      )}

      {editingFAQ && (
        <FAQEditModal
          faq={editingFAQ}
          isCreating={isCreating}
          onClose={() => {
            setEditingFAQ(null);
            setIsCreating(false);
          }}
          onSave={() => {
            fetchFAQs();
            setEditingFAQ(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
}

interface FAQEditModalProps {
  faq: FAQ;
  isCreating: boolean;
  onClose: () => void;
  onSave: () => void;
}

function FAQEditModal({ faq, isCreating, onClose, onSave }: FAQEditModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(faq);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'de' | 'en' | 'fr' | 'it' | 'es' | 'ro'>('en');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const missingLanguages = [];
    const languages = ['de', 'en', 'fr', 'it', 'es', 'ro'];

    for (const lang of languages) {
      const question = formData[`question_${lang}` as keyof FAQ];
      const answer = formData[`answer_${lang}` as keyof FAQ];
      if (!question || !answer) {
        missingLanguages.push(lang.toUpperCase());
      }
    }

    if (missingLanguages.length > 0) {
      alert(`Please complete all fields for: ${missingLanguages.join(', ')}`);
      return;
    }

    setSaving(true);

    try {
      if (isCreating) {
        const { id, ...dataWithoutId } = formData;
        const { error } = await supabase
          .from('faqs')
          .insert([dataWithoutId]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('faqs')
          .update(formData)
          .eq('id', faq.id);

        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert(`Failed to save FAQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  }

  const languages = [
    { code: 'en' as const, name: t('admin.english') },
    { code: 'de' as const, name: t('admin.german') },
    { code: 'fr' as const, name: t('admin.french') },
    { code: 'it' as const, name: t('admin.italian') },
    { code: 'es' as const, name: t('admin.spanish') },
    { code: 'ro' as const, name: t('admin.romanian') },
  ];

  const isLanguageComplete = (langCode: string) => {
    const question = formData[`question_${langCode}` as keyof FAQ];
    const answer = formData[`answer_${langCode}` as keyof FAQ];
    return !!(question && answer);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="card-luxury max-w-4xl w-full flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 pb-4 border-b border-[#D4AF37]/20">
          <h3 className="text-2xl font-bold text-white">
            {isCreating ? t('admin.createFaq') : t('admin.editFaq')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors">
            <X className="w-6 h-6 text-[#9AA0A6]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 pt-6 pb-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {languages.map((lang) => {
                const isComplete = isLanguageComplete(lang.code);
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLanguage(lang.code)}
                    className={`relative px-4 py-3 font-semibold rounded-lg transition-all ${
                      activeLanguage === lang.code
                        ? 'bg-[#D4AF37] text-black'
                        : 'bg-[#0B0C0F] text-[#9AA0A6] hover:text-white hover:bg-[#111316]'
                    }`}
                  >
                    {t(`admin.${lang.code === 'en' ? 'english' : lang.code === 'de' ? 'german' : lang.code === 'fr' ? 'french' : lang.code === 'it' ? 'italian' : lang.code === 'es' ? 'spanish' : 'romanian'}`)}
                    {!isComplete && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                {t('admin.question')} ({languages.find(l => l.code === activeLanguage)?.name}) *
              </label>
              <input
                type="text"
                required
                value={formData[`question_${activeLanguage}`]}
                onChange={(e) => setFormData({ ...formData, [`question_${activeLanguage}`]: e.target.value })}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                placeholder={t('admin.question')}
              />
              <p className="text-xs text-[#9AA0A6] mt-1">
                {formData[`question_${activeLanguage}`].length} {t('admin.characters')}
              </p>
            </div>

            <div>
              <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                {t('admin.answer')} ({languages.find(l => l.code === activeLanguage)?.name}) *
              </label>
              <textarea
                required
                rows={6}
                value={formData[`answer_${activeLanguage}`]}
                onChange={(e) => setFormData({ ...formData, [`answer_${activeLanguage}`]: e.target.value })}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all resize-none"
                placeholder={t('admin.answer')}
              />
              <p className="text-xs text-[#9AA0A6] mt-1">
                {formData[`answer_${activeLanguage}`].length} {t('admin.characters')}
              </p>
            </div>
          </div>

            <div className="flex items-center gap-6 p-4 bg-[#0B0C0F] rounded-lg mt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_popular}
                  onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  className="w-5 h-5 rounded border-[#D4AF37]/20 bg-[#111316] text-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                />
                <span className="text-white font-medium">{t('admin.markAsPopular')}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_hidden}
                  onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                  className="w-5 h-5 rounded border-[#D4AF37]/20 bg-[#111316] text-red-500 focus:ring-2 focus:ring-red-500/20"
                />
                <span className="text-white font-medium">{t('admin.hideFromPublic')}</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 p-6 pt-4 border-t border-[#D4AF37]/20 bg-[#0B0C0F]/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-[#D4AF37]/20 text-[#9AA0A6] hover:border-[#D4AF37] hover:text-white transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? t('admin.savingChanges') : isCreating ? t('admin.addFaq') : t('admin.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
