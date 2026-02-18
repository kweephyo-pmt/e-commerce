import { useState, useEffect } from 'react';
import {
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { logActivity } from '../utils/logActivity';
import {
    Tag, Plus, Edit2, Trash2, Save, X, Search, Hash, Package, AlertTriangle
} from 'lucide-react';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', color: '#00ffff' });
    const [saving, setSaving] = useState(false);

    // Preset neon colors for quick pick
    const neonColors = [
        '#00ffff', '#ff00ff', '#00ff00', '#ff6600',
        '#9333ea', '#facc15', '#f43f5e', '#3b82f6'
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const snapshot = await getDocs(collection(db, 'categories'));
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            showToast('Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', color: '#00ffff' });
        setEditingCategory(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToast('Category name is required', 'error');
            return;
        }
        try {
            setSaving(true);
            if (editingCategory) {
                await updateDoc(doc(db, 'categories', editingCategory.id), {
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    color: formData.color,
                    updatedAt: serverTimestamp()
                });
                await logActivity({
                    type: 'category', icon: 'Tag',
                    title: 'Category Updated',
                    description: `"${formData.name.trim()}" category updated`,
                    color: 'orange'
                });
                showToast('Category updated successfully!', 'success');
            } else {
                await addDoc(collection(db, 'categories'), {
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    color: formData.color,
                    createdAt: serverTimestamp()
                });
                await logActivity({
                    type: 'category', icon: 'Tag',
                    title: 'Category Created',
                    description: `"${formData.name.trim()}" category added`,
                    color: 'orange'
                });
                showToast('Category created successfully!', 'success');
            }
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            showToast('Failed to save category', 'error');
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (cat) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, description: cat.description || '', color: cat.color || '#00ffff' });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (catId) => {
        if (!window.confirm('Delete this category? Products using it will not be affected.')) return;
        try {
            setDeletingId(catId);
            const catName = categories.find(c => c.id === catId)?.name || 'Category';
            await deleteDoc(doc(db, 'categories', catId));
            await logActivity({
                type: 'category', icon: 'Tag',
                title: 'Category Deleted',
                description: `"${catName}" category removed`,
                color: 'red'
            });
            showToast('Category deleted!', 'success');
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            showToast('Failed to delete category', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = categories.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #0f172a 50%, #1a1f3a 100%)' }}>
                <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-orange-500/30 corner-clip animate-spin"
                        style={{ borderTopColor: 'rgba(249,115,22,0.9)', boxShadow: '0 0 30px rgba(249,115,22,0.6)' }}></div>
                    <div className="absolute inset-2 border-2 border-cyan-500/20 corner-clip animate-ping"></div>
                </div>
                <p className="text-orange-400 uppercase tracking-widest font-black text-lg"
                    style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 15px rgba(249,115,22,0.8)' }}>
                    Loading Categories...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50">
                    <div className={`flex items-center gap-3 px-6 py-4 corner-clip-sm shadow-2xl border-2 relative overflow-hidden ${toast.type === 'success'
                        ? 'bg-green-500/10 border-green-500/50 text-green-400'
                        : 'bg-red-500/10 border-red-500/50 text-red-400'}`}
                        style={{ boxShadow: toast.type === 'success' ? '0 0 30px rgba(0,255,0,0.4)' : '0 0 30px rgba(255,0,0,0.4)' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-800/90"></div>
                        <p className="font-bold relative z-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{toast.message}</p>
                        <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70 relative z-10">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Header — hidden on mobile */}
            <div className="hidden md:block bg-gray-900 corner-clip p-8 border-2 border-orange-500/50 relative overflow-hidden"
                style={{ boxShadow: '0 0 40px rgba(249,115,22,0.4)' }}>
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(249,115,22,0.1) 2px, rgba(249,115,22,0.1) 4px)' }}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent"></div>
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 corner-clip flex items-center justify-center"
                            style={{ boxShadow: '0 0 30px rgba(249,115,22,0.7)' }}>
                            <Tag className="w-8 h-8 text-white" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))' }} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-orange-400 uppercase tracking-wider mb-1"
                                style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(249,115,22,1)' }}>
                                Categories
                            </h1>
                            <p className="text-orange-300/70 text-lg font-bold uppercase tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                {categories.length} Categories Configured
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black uppercase tracking-wide corner-clip-sm border-2 border-orange-400 transition-all"
                        style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 20px rgba(249,115,22,0.6)' }}
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Category</span>
                    </button>
                </div>
            </div>

            {/* ── Add / Edit Form ─────────────────────────────────────────────── */}
            {showForm && (
                <div className="bg-gray-900 corner-clip border-2 border-orange-500/40 relative overflow-hidden"
                    style={{ boxShadow: '0 0 30px rgba(249,115,22,0.25)' }}>
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(249,115,22,0.15) 2px, rgba(249,115,22,0.15) 4px)' }}></div>

                    {/* Form Header */}
                    <div className="flex items-center justify-between px-8 py-5 border-b-2 border-orange-500/30 relative z-10">
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-red-500 corner-clip-sm"
                                style={{ boxShadow: '0 0 10px rgba(249,115,22,0.8)' }}></div>
                            <h2 className="text-xl font-black text-orange-400 uppercase tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(249,115,22,0.6)' }}>
                                {editingCategory ? '⚡ Edit Category' : '⚡ New Category'}
                            </h2>
                        </div>
                        <button onClick={resetForm}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 corner-clip-sm border-2 border-transparent hover:border-red-500/40 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6 relative z-10">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-black text-orange-300 mb-2 uppercase tracking-wide"
                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-800 border-2 border-orange-500/40 corner-clip-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 transition-all font-bold"
                                    style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 10px rgba(249,115,22,0.1)' }}
                                    placeholder="e.g. Electronics, Clothing..."
                                    required
                                />
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-sm font-black text-orange-300 mb-2 uppercase tracking-wide"
                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    Neon Accent Color
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))}
                                        className="h-12 w-14 corner-clip-sm cursor-pointer border-2 border-orange-500/40 bg-gray-800"
                                        style={{ boxShadow: `0 0 12px ${formData.color}60` }}
                                    />
                                    <div className="flex space-x-2 flex-wrap gap-y-2">
                                        {neonColors.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, color: c }))}
                                                className="w-7 h-7 corner-clip-sm border-2 transition-all hover:scale-110"
                                                style={{
                                                    backgroundColor: c,
                                                    borderColor: formData.color === c ? 'white' : `${c}60`,
                                                    boxShadow: formData.color === c ? `0 0 10px ${c}` : 'none'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-black text-orange-300 mb-2 uppercase tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-800 border-2 border-orange-500/40 corner-clip-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 transition-all font-bold resize-none"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                placeholder="Brief description of this category..."
                            />
                        </div>

                        {/* Preview */}
                        <div className="bg-gray-800/60 corner-clip-sm border-2 p-4 flex items-center space-x-4"
                            style={{ borderColor: `${formData.color}40`, boxShadow: `0 0 15px ${formData.color}20` }}>
                            <div className="w-12 h-12 corner-clip flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, ${formData.color}40, ${formData.color}20)`, border: `2px solid ${formData.color}60`, boxShadow: `0 0 15px ${formData.color}40` }}>
                                <Tag className="w-6 h-6" style={{ color: formData.color, filter: `drop-shadow(0 0 5px ${formData.color})` }} />
                            </div>
                            <div>
                                <p className="font-black text-white uppercase text-lg"
                                    style={{ fontFamily: 'Rajdhani, sans-serif', color: formData.color, textShadow: `0 0 10px ${formData.color}` }}>
                                    {formData.name || 'Category Name'}
                                </p>
                                <p className="text-sm text-gray-300" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    {formData.description || 'No description'}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-4 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black uppercase tracking-wide corner-clip-sm border-2 border-orange-400 transition-all disabled:opacity-50"
                                style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 20px rgba(249,115,22,0.5)' }}
                            >
                                <Save className="w-5 h-5" />
                                <span>{saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-black uppercase tracking-wide corner-clip-sm border-2 border-gray-600 hover:border-gray-500 transition-all"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                            >
                                <X className="w-5 h-5" />
                                <span>Cancel</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Search Bar ─────────────────────────────────────────────────── */}
            <div className="bg-gray-900/80 corner-clip-sm p-5 border-2 border-orange-500/20 relative overflow-hidden"
                style={{ boxShadow: '0 0 20px rgba(249,115,22,0.1)' }}>
                <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(249,115,22,0.1) 2px, rgba(249,115,22,0.1) 4px)' }}></div>
                <div className="relative flex items-center space-x-4 z-10">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400"
                            style={{ filter: 'drop-shadow(0 0 5px rgba(249,115,22,0.6))' }} />
                        <input
                            type="text"
                            placeholder="SEARCH CATEGORIES..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-800 border-2 border-orange-500/40 corner-clip-sm text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-all font-bold"
                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                        />
                    </div>
                    <div className="text-sm text-gray-300 font-black uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        <span className="text-orange-400" style={{ textShadow: '0 0 8px rgba(249,115,22,0.6)' }}>{filtered.length}</span>
                        {' '}/ {categories.length} categories
                    </div>
                </div>
            </div>

            {/* ── Categories Grid ─────────────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="bg-gray-900/80 corner-clip-sm border-2 border-orange-500/20 p-16 text-center">
                    <Tag className="w-16 h-16 text-orange-500/30 mx-auto mb-4" />
                    <p className="text-gray-300 font-black uppercase text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        {searchQuery ? 'No categories match your search' : 'No categories yet'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        {searchQuery ? 'Try a different search term' : 'Click "New Category" to create your first one'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((cat, index) => {
                        const color = cat.color || '#00ffff';
                        return (
                            <div
                                key={cat.id}
                                className="bg-gray-900 corner-clip border-2 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
                                style={{
                                    borderColor: `${color}40`,
                                    boxShadow: `0 0 20px ${color}15`,
                                    animationDelay: `${index * 50}ms`
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 30px ${color}35`}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 20px ${color}15`}
                            >
                                {/* Scan-line overlay */}
                                <div className="absolute inset-0 opacity-5 pointer-events-none"
                                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }}></div>
                                {/* Color accent bar */}
                                <div className="absolute top-0 left-0 right-0 h-1"
                                    style={{ background: `linear-gradient(90deg, ${color}, transparent)`, boxShadow: `0 0 10px ${color}` }}></div>
                                {/* Glow corner */}
                                <div className="absolute top-0 left-0 w-16 h-16 opacity-10 pointer-events-none"
                                    style={{ background: `radial-gradient(circle at top left, ${color}, transparent)` }}></div>

                                <div className="p-6 relative z-10">
                                    {/* Icon + Name row */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 corner-clip flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                                                    border: `2px solid ${color}50`,
                                                    boxShadow: `0 0 15px ${color}30`
                                                }}>
                                                <Tag className="w-6 h-6" style={{ color, filter: `drop-shadow(0 0 5px ${color})` }} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-white text-lg uppercase leading-tight"
                                                    style={{ fontFamily: 'Rajdhani, sans-serif', color, textShadow: `0 0 8px ${color}80` }}>
                                                    {cat.name}
                                                </h3>
                                                <div className="flex items-center space-x-1 mt-0.5">
                                                    <Hash className="w-3 h-3 text-gray-500" />
                                                    <span className="text-xs text-gray-500 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                        {cat.id.slice(0, 8)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Color swatch */}
                                        <div className="w-6 h-6 corner-clip-sm flex-shrink-0"
                                            style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-300 text-sm mb-5 min-h-[2.5rem] leading-relaxed"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        {cat.description || <span className="text-gray-600 italic">No description provided</span>}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t"
                                        style={{ borderColor: `${color}20` }}>
                                        <div className="flex items-center space-x-1 text-xs text-gray-500"
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            <Package className="w-3 h-3" />
                                            <span className="uppercase font-bold">Category</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {/* Edit */}
                                            <button
                                                onClick={() => startEdit(cat)}
                                                className="inline-flex items-center space-x-1 px-3 py-1.5 corner-clip-sm text-xs font-black uppercase border-2 border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all"
                                                style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 8px rgba(0,255,255,0.2)' }}
                                            >
                                                <Edit2 className="w-3 h-3" />
                                                <span>Edit</span>
                                            </button>
                                            {/* Delete */}
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                disabled={deletingId === cat.id}
                                                className="inline-flex items-center space-x-1 px-3 py-1.5 corner-clip-sm text-xs font-black uppercase border-2 border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-400 transition-all disabled:opacity-50"
                                                style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 8px rgba(239,68,68,0.2)' }}
                                            >
                                                {deletingId === cat.id ? (
                                                    <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Trash2 className="w-3 h-3" />
                                                )}
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Summary Footer ─────────────────────────────────────────────── */}
            <div className="bg-gray-900/80 corner-clip-sm p-5 border-2 border-orange-500/20 relative overflow-hidden"
                style={{ boxShadow: '0 0 15px rgba(249,115,22,0.1)' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent"></div>
                <div className="flex items-center justify-between relative z-10">
                    <p className="text-sm text-gray-300 font-black uppercase relative z-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        Total:{' '}
                        <span className="font-black text-orange-400 text-lg" style={{ textShadow: '0 0 8px rgba(249,115,22,0.6)' }}>
                            {categories.length}
                        </span>{' '}
                        categories configured
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 font-bold uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        <AlertTriangle className="w-4 h-4 text-yellow-500/60" />
                        <span>Deleting a category does not affect existing products</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCategories;
