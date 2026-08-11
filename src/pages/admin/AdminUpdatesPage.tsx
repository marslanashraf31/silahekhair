import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, Edit, Trash2, Calendar, Tag, Eye, Check, X, Loader2 } from 'lucide-react';
import { UpdateArticle } from '../../types';
import {
  getUpdateArticles,
  addUpdateArticle,
  updateUpdateArticle,
  deleteUpdateArticle,
  DATASTORE_CHANGE_EVENT
} from '../../utils/dataStore';
import { dbGetUpdateArticles } from '../../lib/supabaseService';

export const AdminUpdatesPage: React.FC = () => {
  const [articles, setArticles] = useState<UpdateArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingArticle, setEditingArticle] = useState<UpdateArticle | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<{ id: string; title: string } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Distribution Report');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState('Recent Update');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');

  const categories = ['All', 'Distribution Report', 'Announcement', 'Foundation Update'];
  const standardUpdateCategories = ['Distribution Report', 'Announcement', 'Foundation Update'];

  const loadData = async () => {
    const local = getUpdateArticles();
    setArticles(local);
    try {
      const remote = await dbGetUpdateArticles();
      setArticles(remote);
    } catch (err) {
      console.warn('Error loading update articles:', err);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadData);
  }, []);

  const openAddModal = () => {
    setEditingArticle(null);
    setTitle('');
    setCategory('Distribution Report');
    setCustomCategory('');
    setDate('Recent Field Update');
    setSummary('');
    setContent('');
    setIsModalOpen(true);
  };

  const openEditModal = (article: UpdateArticle) => {
    setEditingArticle(article);
    setTitle(article.title);
    if (standardUpdateCategories.includes(article.category)) {
      setCategory(article.category);
      setCustomCategory('');
    } else {
      setCategory('Other');
      setCustomCategory(article.category);
    }
    setDate(article.date);
    setSummary(article.summary);
    setContent(article.content);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || isSubmitting) return;

    const finalCategory = category === 'Other' ? (customCategory.trim() || 'Other') : category;

    setIsSubmitting(true);
    try {
      let result;
      if (editingArticle) {
        result = await updateUpdateArticle({
          id: editingArticle.id,
          title,
          category: finalCategory,
          date,
          summary,
          content: content || summary
        });
      } else {
        result = await addUpdateArticle({
          title,
          category: finalCategory,
          date,
          summary,
          content: content || summary
        });
      }

      if (!result.success) {
        alert(result.error || 'Could not save this update in Supabase.');
        return;
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving article:', err);
      alert('An error occurred while saving the article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, articleTitle: string) => {
    setDeletingArticle({ id, title: articleTitle });
  };

  const confirmDelete = async () => {
    if (deletingArticle) {
      try {
        const result = await deleteUpdateArticle(deletingArticle.id);
        if (!result.success) {
          alert(result.error || 'Could not delete this update from Supabase.');
          return;
        }
        setDeletingArticle(null);
        await loadData();
      } catch (err) {
        console.error('Error deleting article:', err);
        alert('An error occurred while deleting the article. Please try again.');
      }
    }
  };

  const filteredArticles = selectedCategory === 'All'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#064E3B]">
            Announcements & Updates Publisher
          </h2>
          <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
            Publish distribution reports, milestones, and announcements visible live on the public site.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-sans font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Update</span>
        </button>
      </div>

      {/* Category Filters */}
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

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-3 text-xs font-semibold text-[#047857]">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100">
                  {article.category}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{article.date}</span>
              </div>

              <h3 className="font-serif font-bold text-slate-800 text-base">
                {article.title}
              </h3>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {article.summary}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <a
                href="/updates"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#064E3B] hover:bg-emerald-100 text-xs font-bold inline-flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </a>

              <button
                onClick={() => openEditModal(article)}
                className="p-2 text-slate-600 hover:text-[#047857] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                title="Edit Report"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDelete(article.id, article.title)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete Report"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          No updates found in this category. Click "Publish New Update" to create one.
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                {editingArticle ? 'Edit Article' : 'Publish New Update'}
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
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Ration Distribution Completed for 60+ Families"
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
                    <option value="Distribution Report">Distribution Report</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Foundation Update">Foundation Update</option>
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
                    placeholder="e.g. August 2026 / Field Update"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Summary (Short Preview)
                </label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Enter a 1-2 sentence overview for home/list previews..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Article Content
                </label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the complete detailed report body text..."
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
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#064E3B] hover:bg-[#047857] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Saving...' : (editingArticle ? 'Save Article' : 'Publish Article')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Delete Update Article?
              </h3>
              <p className="font-sans text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-slate-800">"{deletingArticle.title}"</span> from public announcements?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingArticle(null)}
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
