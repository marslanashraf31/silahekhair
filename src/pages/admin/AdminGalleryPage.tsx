import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Edit, Trash2, MapPin, Calendar, Tag, Check, X, Eye } from 'lucide-react';
import { GalleryItem } from '../../types';
import {
  getGalleryItems,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  DATASTORE_CHANGE_EVENT
} from '../../utils/dataStore';
import { dbGetGalleryItems } from '../../lib/supabaseService';

const PRESET_IMAGE_URLS = [
  { label: 'Ration Packets', url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Meal Cooking & Serving', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Blanket & Warmth', url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Community Support', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Education Books', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop' },
];

export const AdminGalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: string; title: string } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Ration Support');
  const [customCategory, setCustomCategory] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGE_URLS[0].url);
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('Monthly Drive');
  const [location, setLocation] = useState('Karachi, Pakistan');

  const categories = ['All', 'Ration Support', 'Food Distribution', 'Emergency Relief', 'Education Support', 'Community'];

  const loadData = async () => {
    const local = getGalleryItems();
    setItems(local);
    try {
      const remote = await dbGetGalleryItems();
      setItems(remote);
    } catch (err) {
      console.warn('Error loading gallery items:', err);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve((e.target?.result as string) || '');
          }
        };
        img.onerror = () => resolve((e.target?.result as string) || '');
        img.src = (e.target?.result as string) || '';
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadData);
  }, []);

  const standardGalleryCategories = ['Ration Support', 'Food Distribution', 'Emergency Relief', 'Education Support', 'Community'];

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('Ration Support');
    setCustomCategory('');
    setImageUrl(PRESET_IMAGE_URLS[0].url);
    setCaption('');
    setDate('Monthly Activity');
    setLocation('Karachi, Pakistan');
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    if (standardGalleryCategories.includes(item.category)) {
      setCategory(item.category);
      setCustomCategory('');
    } else {
      setCategory('Other');
      setCustomCategory(item.category);
    }
    setImageUrl(item.imageUrl);
    setCaption(item.caption);
    setDate(item.date);
    setLocation(item.location || 'Karachi, Pakistan');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = category === 'Other' ? (customCategory.trim() || 'Other') : category;

    let result;
    if (editingItem) {
      result = await updateGalleryItem({
        id: editingItem.id,
        title,
        category: finalCategory,
        imageUrl,
        caption,
        date,
        location
      });
    } else {
      result = await addGalleryItem({
        title,
        category: finalCategory,
        imageUrl,
        caption,
        date,
        location
      });
    }

    if (!result.success) {
      alert(result.error || 'Could not save this gallery item in Supabase.');
      return;
    }
    setIsModalOpen(false);
    await loadData();
  };

  const handleDelete = (id: string, itemTitle: string) => {
    setDeletingItem({ id, title: itemTitle });
  };

  const confirmDelete = async () => {
    if (deletingItem) {
      const result = await deleteGalleryItem(deletingItem.id);
      if (!result.success) {
        alert(result.error || 'Could not delete this gallery item from Supabase.');
        return;
      }
      setDeletingItem(null);
      loadData();
    }
  };

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter(i => i.category === selectedCategory);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#064E3B]">
            Public Gallery Media Manager
          </h2>
          <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
            Add, update, or remove distribution photos displayed live on the public website gallery.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-sans font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Gallery Photo</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-sans text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#064E3B] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#064E3B]/90 text-white text-[10px] font-bold rounded-lg backdrop-blur-xs">
                  {item.category}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span>{item.date}</span>
                  {item.location && <span>{item.location}</span>}
                </div>
                <h3 className="font-serif font-bold text-slate-800 text-sm leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.caption}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <a
                href="/gallery"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-[#047857] hover:underline inline-flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Live</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 text-slate-600 hover:text-[#047857] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Photo"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          No gallery photos found for this category. Click "Add New Gallery Photo" to publish one.
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                {editingItem ? 'Edit Gallery Photo' : 'Add New Gallery Photo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Photo Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Ration Drive Distribution"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (e.target.value !== 'Other') setCustomCategory('');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  >
                    <option value="Ration Support">Ration Support</option>
                    <option value="Food Distribution">Food Distribution</option>
                    <option value="Emergency Relief">Emergency Relief</option>
                    <option value="Education Support">Education Support</option>
                    <option value="Community">Community</option>
                    <option value="Other">Other / Custom...</option>
                  </select>
                  {category === 'Other' && (
                    <input
                      type="text"
                      required
                      placeholder="Enter custom category..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Date Tag
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. Monthly Activity"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Upload Photo or Enter Image URL
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const compressed = await compressImage(file);
                          setImageUrl(compressed);
                        }
                      }}
                      className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#064E3B] file:text-white hover:file:bg-[#047857] cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">or URL:</span>
                    <input
                      type="url"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 block w-full font-bold">Quick Presets:</span>
                    {PRESET_IMAGE_URLS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                          imageUrl === preset.url
                            ? 'bg-emerald-100 border-[#047857] text-[#064E3B] font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Karachi, Pakistan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Caption / Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Enter a brief description of this activity photo..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Publish to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Delete Gallery Photo?
              </h3>
              <p className="font-sans text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-slate-800">"{deletingItem.title}"</span> from the public gallery?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-full px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
