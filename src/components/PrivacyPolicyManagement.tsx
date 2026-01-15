import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, GripVertical, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLanguage } from '../contexts/LanguageContext';
import type { PrivacyPolicy } from '../types/database';
import type { Language } from '../types/database';

interface SortablePrivacyItemProps {
  section: PrivacyPolicy;
  onEdit: (section: PrivacyPolicy) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, isActive: boolean) => void;
}

function SortablePrivacyItem({ section, onEdit, onDelete, onToggleVisibility }: SortablePrivacyItemProps) {
  const { t } = useLanguage();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

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
            <h3 className="text-lg font-bold text-white">{section.heading_en}</h3>
            {!section.is_active && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500">
                {t('admin.hidden')}
              </span>
            )}
          </div>
          <p className="text-[#9AA0A6] text-sm">
            {section.content_en.length} {section.content_en.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleVisibility(section.id, !section.is_active)}
            className="p-2 hover:bg-[#D4AF37]/10 rounded transition-colors"
            title={section.is_active ? t('admin.hide') : t('admin.show')}
          >
            {section.is_active ? (
              <Eye className="w-5 h-5 text-[#9AA0A6]" />
            ) : (
              <EyeOff className="w-5 h-5 text-[#9AA0A6]" />
            )}
          </button>
          <button
            onClick={() => onEdit(section)}
            className="p-2 hover:bg-[#D4AF37]/10 rounded transition-colors"
          >
            <Edit2 className="w-5 h-5 text-[#D4AF37]" />
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="p-2 hover:bg-red-500/10 rounded transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicyManagement() {
  const { t } = useLanguage();
  const [sections, setSections] = useState<PrivacyPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<PrivacyPolicy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLanguageTab, setActiveLanguageTab] = useState<Language>('de');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSections();
  }, []);

  async function fetchSections() {
    try {
      const { data, error } = await supabase
        .from('privacy_policy')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching privacy sections:', error);
      alert(t('admin.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        newOrder.forEach(async (item, index) => {
          await supabase
            .from('privacy_policy')
            .update({ display_order: index + 1 })
            .eq('id', item.id);
        });

        return newOrder;
      });
    }
  }

  async function handleToggleVisibility(id: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from('privacy_policy')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      fetchSections();
    } catch (error) {
      console.error('Error updating visibility:', error);
      alert(t('admin.errorSaving'));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('admin.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('privacy_policy')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert(t('admin.errorDeleting'));
    }
  }

  function handleAddNew() {
    setEditingSection({
      id: '',
      section_key: '',
      heading_de: '',
      heading_en: '',
      heading_fr: '',
      heading_it: '',
      heading_es: '',
      heading_ro: '',
      content_de: [''],
      content_en: [''],
      content_fr: [''],
      content_it: [''],
      content_es: [''],
      content_ro: [''],
      display_order: sections.length + 1,
      is_active: true,
      created_at: '',
      updated_at: '',
    });
    setIsModalOpen(true);
  }

  function handleEdit(section: PrivacyPolicy) {
    setEditingSection(section);
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!editingSection) return;

    if (!editingSection.section_key ||
        !editingSection.heading_de || !editingSection.heading_en ||
        !editingSection.heading_fr || !editingSection.heading_it ||
        !editingSection.heading_es || !editingSection.heading_ro) {
      alert(t('admin.fillAllFields'));
      return;
    }

    try {
      const dataToSave = {
        section_key: editingSection.section_key,
        heading_de: editingSection.heading_de,
        heading_en: editingSection.heading_en,
        heading_fr: editingSection.heading_fr,
        heading_it: editingSection.heading_it,
        heading_es: editingSection.heading_es,
        heading_ro: editingSection.heading_ro,
        content_de: editingSection.content_de.filter(item => item.trim()),
        content_en: editingSection.content_en.filter(item => item.trim()),
        content_fr: editingSection.content_fr.filter(item => item.trim()),
        content_it: editingSection.content_it.filter(item => item.trim()),
        content_es: editingSection.content_es.filter(item => item.trim()),
        content_ro: editingSection.content_ro.filter(item => item.trim()),
        display_order: editingSection.display_order,
        is_active: editingSection.is_active,
      };

      if (editingSection.id) {
        const { error } = await supabase
          .from('privacy_policy')
          .update(dataToSave)
          .eq('id', editingSection.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('privacy_policy')
          .insert([dataToSave]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingSection(null);
      fetchSections();
    } catch (error) {
      console.error('Error saving section:', error);
      alert(t('admin.errorSaving'));
    }
  }

  function updateContentItem(lang: Language, index: number, value: string) {
    if (!editingSection) return;

    const contentKey = `content_${lang}` as keyof PrivacyPolicy;
    const currentContent = [...(editingSection[contentKey] as string[])];
    currentContent[index] = value;

    setEditingSection({
      ...editingSection,
      [contentKey]: currentContent,
    });
  }

  function addContentItem(lang: Language) {
    if (!editingSection) return;

    const contentKey = `content_${lang}` as keyof PrivacyPolicy;
    const currentContent = [...(editingSection[contentKey] as string[])];
    currentContent.push('');

    setEditingSection({
      ...editingSection,
      [contentKey]: currentContent,
    });
  }

  function removeContentItem(lang: Language, index: number) {
    if (!editingSection) return;

    const contentKey = `content_${lang}` as keyof PrivacyPolicy;
    const currentContent = [...(editingSection[contentKey] as string[])];
    currentContent.splice(index, 1);

    setEditingSection({
      ...editingSection,
      [contentKey]: currentContent,
    });
  }

  const languageTabs = [
    { code: 'de' as Language, label: 'Deutsch' },
    { code: 'en' as Language, label: 'English' },
    { code: 'fr' as Language, label: 'Français' },
    { code: 'it' as Language, label: 'Italiano' },
    { code: 'es' as Language, label: 'Español' },
    { code: 'ro' as Language, label: 'Română' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#9AA0A6]">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('admin.privacyPolicyManagement')}</h2>
          <p className="text-[#9AA0A6]">{t('admin.managePrivacySections')}</p>
        </div>
        <button
          onClick={handleAddNew}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('admin.addSection')}
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <SortablePrivacyItem
              key={section.id}
              section={section}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <div className="card-luxury p-12 text-center">
          <p className="text-[#9AA0A6] mb-4">{t('admin.noSections')}</p>
          <button onClick={handleAddNew} className="btn-primary">
            {t('admin.addFirstSection')}
          </button>
        </div>
      )}

      {isModalOpen && editingSection && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#111316] border border-[#D4AF37]/20 rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                {editingSection.id ? t('admin.editSection') : t('admin.addSection')}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSection(null);
                }}
                className="p-2 hover:bg-[#D4AF37]/10 rounded transition-colors"
              >
                <X className="w-6 h-6 text-[#9AA0A6]" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#9AA0A6] mb-2">
                  {t('admin.sectionKey')}
                </label>
                <input
                  type="text"
                  value={editingSection.section_key}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, section_key: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-[#0B0C0F] border border-[#D4AF37]/20 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder="e.g., data_collection"
                  disabled={!!editingSection.id}
                />
              </div>

              <div className="flex gap-2 border-b border-[#D4AF37]/20">
                {languageTabs.map((tab) => (
                  <button
                    key={tab.code}
                    onClick={() => setActiveLanguageTab(tab.code)}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeLanguageTab === tab.code
                        ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                        : 'text-[#9AA0A6] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9AA0A6] mb-2">
                  {t('admin.heading')} ({languageTabs.find(t => t.code === activeLanguageTab)?.label})
                </label>
                <input
                  type="text"
                  value={editingSection[`heading_${activeLanguageTab}` as keyof PrivacyPolicy] as string}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      [`heading_${activeLanguageTab}`]: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-[#0B0C0F] border border-[#D4AF37]/20 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder={t('admin.enterHeading')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9AA0A6] mb-2">
                  {t('admin.content')} ({languageTabs.find(t => t.code === activeLanguageTab)?.label})
                </label>
                <div className="space-y-2">
                  {(editingSection[`content_${activeLanguageTab}` as keyof PrivacyPolicy] as string[]).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <textarea
                        value={item}
                        onChange={(e) => updateContentItem(activeLanguageTab, index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-[#0B0C0F] border border-[#D4AF37]/20 rounded-lg text-white focus:outline-none focus:border-[#D4AF37] min-h-[60px]"
                        placeholder={t('admin.enterContentItem')}
                      />
                      <button
                        onClick={() => removeContentItem(activeLanguageTab, index)}
                        className="p-2 hover:bg-red-500/10 rounded transition-colors self-start"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addContentItem(activeLanguageTab)}
                    className="w-full px-4 py-2 border-2 border-dashed border-[#D4AF37]/20 rounded-lg text-[#9AA0A6] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                  >
                    + {t('admin.addContentItem')}
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {t('common.save')}
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingSection(null);
                  }}
                  className="flex-1 px-6 py-3 bg-[#0B0C0F] border border-[#D4AF37]/20 rounded-lg text-white hover:border-[#D4AF37] transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
