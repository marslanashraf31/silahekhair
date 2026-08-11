import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  PackageCheck, 
  Utensils, 
  HeartPulse, 
  ShieldAlert, 
  GraduationCap,
  Layers,
  Sparkles
} from 'lucide-react';
import { Program } from '../../types';
import { 
  getProgramsList, 
  addProgramRecord, 
  updateProgramRecord, 
  deleteProgramRecord, 
  DATASTORE_CHANGE_EVENT 
} from '../../utils/dataStore';
import { dbGetPrograms } from '../../lib/supabaseService';

export const AdminProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Omit<Program, 'id'>>({
    title: '',
    category: 'Essential Relief',
    shortDescription: '',
    fullDescription: '',
    purpose: '',
    deliveryMethod: '',
    impactExplanation: '',
    iconName: 'PackageCheck',
    featuredImage: '',
    status: 'published'
  });
  const [customCategory, setCustomCategory] = useState('');

  const loadPrograms = async () => {
    try {
      const remotePrograms = await dbGetPrograms();
      setPrograms(remotePrograms);
    } catch (err) {
      console.warn('Error loading programs from Supabase; using cached programs:', err);
      setPrograms(getProgramsList());
    }
  };

  useEffect(() => {
    loadPrograms();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadPrograms);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadPrograms);
  }, []);

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

  const standardProgramCategories = [
    'Essential Relief',
    'Food Security',
    'Crisis Response',
    'Future Empowerment',
    'Medical Relief',
    'Community Support'
  ];

  const handleOpenCreateModal = () => {
    setEditingProgram(null);
    setCustomCategory('');
    setFormData({
      title: '',
      category: 'Essential Relief',
      shortDescription: '',
      fullDescription: '',
      purpose: '',
      deliveryMethod: '',
      impactExplanation: '',
      iconName: 'PackageCheck',
      featuredImage: '',
      status: 'published'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prog: Program) => {
    setEditingProgram(prog);
    const isStandard = standardProgramCategories.includes(prog.category);
    setCustomCategory(isStandard ? '' : prog.category);
    setFormData({
      title: prog.title,
      category: isStandard ? prog.category : 'Other',
      shortDescription: prog.shortDescription,
      fullDescription: prog.fullDescription,
      purpose: prog.purpose,
      deliveryMethod: prog.deliveryMethod,
      impactExplanation: prog.impactExplanation,
      iconName: prog.iconName || 'PackageCheck',
      featuredImage: prog.featuredImage || '',
      status: prog.status || 'published'
    });
    setIsModalOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const finalCategory = (formData.category === 'Other' || formData.category === 'Custom') && customCategory.trim()
      ? customCategory.trim()
      : formData.category;

    const payload = {
      ...formData,
      category: finalCategory
    };

    if (editingProgram) {
      const result = await updateProgramRecord({
        ...editingProgram,
        ...payload
      });
      if (!result.success) {
        alert(result.error || 'Could not update this program in Supabase.');
        return;
      }
    } else {
      const result = await addProgramRecord(payload);
      if (!result.success) {
        alert(result.error || 'Could not save this program in Supabase.');
        return;
      }
    }

    setIsModalOpen(false);
    await loadPrograms();
  };

  const handleDeleteProgram = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove program "${title}"?`)) {
      const result = await deleteProgramRecord(id);
      if (!result.success) {
        alert(result.error || 'Could not delete this program from Supabase.');
        return;
      }
      await loadPrograms();
    }
  };

  const getProgramIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils': return <Utensils className="w-5 h-5 text-[#047857]" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-[#047857]" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-[#047857]" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-[#047857]" />;
      default: return <PackageCheck className="w-5 h-5 text-[#047857]" />;
    }
  };

  const categories = ['all', ...Array.from(new Set(programs.map(p => p.category)))];

  const filteredPrograms = programs.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.fullDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl font-bold text-[#064E3B]">
              Programs & Initiatives CMS
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Live Active
            </span>
          </div>
          <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
            Create, manage, and update foundation programs displayed across the public site.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#047857] hover:bg-[#064E3B] text-white font-sans font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Initiative Program</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:border-[#047857] text-slate-800"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#064E3B] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrograms.map((prog) => (
          <div
            key={prog.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#047857]/40 transition-all overflow-hidden"
          >
            <div className="space-y-3">
              {prog.featuredImage && (
                <div className="h-40 -mx-6 -mt-6 mb-3 bg-slate-100 overflow-hidden">
                  <img src={prog.featuredImage} alt={prog.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    {getProgramIcon(prog.iconName)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#047857] uppercase tracking-wider block">
                      {prog.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                      {prog.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(prog)}
                    title="Edit Program"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-[#047857] transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProgram(prog.id, prog.title)}
                    title="Delete Program"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="font-sans text-xs text-slate-600 leading-relaxed">
                {prog.fullDescription}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-sans">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <span className="font-bold text-[#064E3B] block">Purpose</span>
                  <span className="text-slate-500 line-clamp-2">{prog.purpose}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <span className="font-bold text-[#064E3B] block">Delivery</span>
                  <span className="text-slate-500 line-clamp-2">{prog.deliveryMethod}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-sans">
              <span>ID: {prog.id}</span>
              <span className="capitalize font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {prog.status || 'published'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Program Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#047857]">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                  {editingProgram ? 'Edit Initiative Program' : 'New Initiative Program'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Program Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Program Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Monthly Ration Support"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-[#047857]"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, category: val });
                      if (val !== 'Other' && val !== 'Custom') setCustomCategory('');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-[#047857]"
                  >
                    <option value="Essential Relief">Essential Relief</option>
                    <option value="Food Security">Food Security</option>
                    <option value="Crisis Response">Crisis Response</option>
                    <option value="Future Empowerment">Future Empowerment</option>
                    <option value="Medical Relief">Medical Relief</option>
                    <option value="Community Support">Community Support</option>
                    <option value="Other">Other / Custom Category...</option>
                  </select>
                  {(formData.category === 'Other' || formData.category === 'Custom') && (
                    <input
                      type="text"
                      required
                      placeholder="Enter custom category name..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="mt-2 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-[#047857]"
                    />
                  )}
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Icon
                  </label>
                  <select
                    value={formData.iconName}
                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-[#047857]"
                  >
                    <option value="PackageCheck">PackageCheck (Ration / Goods)</option>
                    <option value="Utensils">Utensils (Meals / Food)</option>
                    <option value="HeartPulse">HeartPulse (Health / Aid)</option>
                    <option value="ShieldAlert">ShieldAlert (Emergency / Disaster)</option>
                    <option value="GraduationCap">GraduationCap (Education)</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Publishing Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-[#047857]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Summary
                </label>
                <input
                  type="text"
                  placeholder="Brief one-line summary"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-[#047857]"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Comprehensive explanation of what the program provides..."
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-[#047857]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Purpose */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Program Purpose
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Core objective and mission of this program..."
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-[#047857]"
                  />
                </div>

                {/* Delivery Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Delivery Method
                  </label>
                  <textarea
                    rows={2}
                    placeholder="How aid is delivered to recipients..."
                    value={formData.deliveryMethod}
                    onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-[#047857]"
                  />
                </div>

              </div>

              {/* Impact Explanation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Impact Explanation
                </label>
                <input
                  type="text"
                  placeholder="Long-term humanitarian outcome..."
                  value={formData.impactExplanation}
                  onChange={(e) => setFormData({ ...formData, impactExplanation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-[#047857]"
                />
              </div>

              {/* Program Custom Image */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Program Image (Optional)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/tiff,image/bmp,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.avif,.tiff,.bmp,.heic,.heif"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const compressed = await compressImage(file);
                          setFormData({ ...formData, featuredImage: compressed });
                        }
                      }}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#064E3B] file:text-white hover:file:bg-[#047857] cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">or URL:</span>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.featuredImage || ''}
                      onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-[#047857]"
                    />
                  </div>
                  {formData.featuredImage && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                      <img src={formData.featuredImage} alt="Program image preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, featuredImage: '' })}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#047857] hover:bg-[#064E3B] text-white font-sans text-xs font-semibold cursor-pointer transition-colors"
                >
                  {editingProgram ? 'Save Changes' : 'Create Program'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

