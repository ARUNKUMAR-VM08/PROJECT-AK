import React, { useState } from 'react';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Trash2, ArrowLeft, Sparkles, FolderPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { db } from '../services/firebase';
import { useCategories } from '../context/CategoryContext';
import SEO from '../components/SEO';

const GRADIENTS = [
  { value: 'from-pink-100 to-rose-100', label: 'Romantic Pink' },
  { value: 'from-red-100 to-pink-100', label: 'Blushing Red' },
  { value: 'from-yellow-100 to-orange-100', label: 'Warm Friendship' },
  { value: 'from-blue-100 to-indigo-100', label: 'Cool Corporate' },
  { value: 'from-amber-100 to-yellow-100', label: 'Golden Festive' },
  { value: 'from-purple-100 to-pink-100', label: 'Sparkling Lilac' },
  { value: 'from-green-100 to-emerald-100', label: 'Fresh Garden' },
  { value: 'from-teal-100 to-cyan-100', label: 'Ocean Breeze' },
];

const ManageCategories = () => {
  const { categories, loading, refreshCategories } = useCategories();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    label: '',
    slug: '',
    emoji: '🎁',
    color: 'from-pink-100 to-rose-100'
  });

  const handleLabelChange = (e) => {
    const labelVal = e.target.value;
    const slugVal = labelVal
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove special characters
      .replace(/[\s_-]+/g, '-') // replace spaces and underscores with single hyphen
      .replace(/^-+|-+$/g, ''); // remove leading/trailing hyphens

    setForm(prev => ({
      ...prev,
      label: labelVal,
      slug: slugVal
    }));
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) {
      toast.error("Please enter a category label.");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Category slug cannot be empty.");
      return;
    }

    // Check if slug already exists
    const slugExists = categories.some(cat => cat.slug === form.slug);
    if (slugExists) {
      toast.error(`Category with slug "${form.slug}" already exists!`);
      return;
    }

    setSaving(true);
    try {
      // Use the slug as the document ID for clean URLs and uniqueness
      const docRef = doc(db, 'categories', form.slug);
      await setDoc(docRef, {
        label: form.label.trim(),
        slug: form.slug,
        emoji: form.emoji.trim(),
        color: form.color,
        createdAt: new Date().toISOString()
      });

      toast.success("Category added successfully!");
      setForm({
        label: '',
        slug: '',
        emoji: '🎁',
        color: 'from-pink-100 to-rose-100'
      });
      await refreshCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add category. Check database rules.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (slug) => {
    if (!window.confirm(`Are you sure you want to delete the category "${slug}"? Products assigned to this category won't be deleted but might not filter properly.`)) {
      return;
    }

    try {
      const docRef = doc(db, 'categories', slug);
      await deleteDoc(docRef);
      toast.success("Category deleted successfully.");
      await refreshCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category. Enable database rules.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 page-transition">
      <SEO title="Manage Categories" description="Add, view, and delete product categories." />

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 hover:bg-pastel-pink/20 rounded-full transition-colors text-pastel-navy">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-pastel-navy flex items-center gap-2">
              Category Registry <Sparkles className="text-brand-500" size={20} />
            </h1>
            <p className="text-xs text-gray-500">Configure occasions and shop category tags</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="bg-white border border-brand-100 rounded-3xl p-6 shadow-soft h-fit">
          <h2 className="font-bold text-pastel-navy text-base flex items-center gap-2 mb-4">
            <FolderPlus size={18} className="text-brand-500" />
            Add New Category
          </h2>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Category Name</label>
              <input
                type="text"
                name="label"
                value={form.label}
                onChange={handleLabelChange}
                placeholder="e.g. Wedding Gifts"
                className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300 font-medium text-pastel-navy"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">URL Slug (Auto-generated)</label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="e.g. wedding-gifts"
                className="w-full bg-gray-50 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none font-mono text-gray-500"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Emoji Icon</label>
                <input
                  type="text"
                  name="emoji"
                  value={form.emoji}
                  onChange={handleChange}
                  placeholder="e.g. 💍"
                  maxLength={4}
                  className="w-full bg-pastel-pink/30 text-center text-lg border border-brand-100 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
                  required
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pastel Theme Color</label>
                <select
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300 font-semibold text-pastel-navy"
                >
                  {GRADIENTS.map(grad => (
                    <option key={grad.value} value={grad.value}>
                      {grad.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Preview */}
            <div className="pt-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Card Preview</label>
              <div className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-gradient-to-br ${form.color} border border-brand-50 shadow-sm max-w-[150px] mx-auto`}>
                <span className="text-2xl">{form.emoji || '🎁'}</span>
                <span className="text-[10px] font-bold text-pastel-navy text-center leading-tight">
                  {form.label || 'Category Preview'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-premium text-xs disabled:opacity-50 focus:outline-none transition-all mt-2"
            >
              {saving ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 bg-white border border-brand-100 rounded-3xl p-6 shadow-soft h-fit">
          <h2 className="font-bold text-pastel-navy text-base border-b border-brand-50 pb-3 mb-4">
            Active Categories List
          </h2>

          {loading ? (
            <div className="text-center py-12 text-gray-400 text-xs font-semibold">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-semibold">No categories registered.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {categories.map(cat => (
                <div
                  key={cat.slug}
                  className={`flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-br ${cat.color} border border-brand-50 shadow-sm`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.emoji}</span>
                    <div>
                      <h4 className="font-bold text-xs text-pastel-navy">{cat.label}</h4>
                      <p className="text-[9px] font-mono text-gray-500 mt-0.5">{cat.slug}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCategory(cat.slug)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white/60 rounded-xl transition-all shadow-sm focus:outline-none"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;
