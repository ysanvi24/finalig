import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Film, Camera, FileText, Plus, Trash2, X, Save, Calendar, ExternalLink, Award } from 'lucide-react';

const HighlightManagement = () => {
 const [highlights, setHighlights] = useState([]);
 const [departments, setDepartments] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [saving, setSaving] = useState(false);
 const [formData, setFormData] = useState({
  type: 'reel',
  instagramUrl: '',
  caption: '',
  content: '',
  department: '',
  date: new Date().toISOString().split('T')[0]
 });

 const fetchHighlights = async () => {
  try {
   setLoading(true);
   const res = await api.get('/highlights');
   setHighlights(res.data.data || res.data || []);
  } catch (err) { toast.error('Failed to load highlights'); }
  finally { setLoading(false); }
 };

 const fetchDepartments = async () => {
  try {
   const res = await api.get('/departments');
   setDepartments(res.data.data || []);
  } catch (err) { console.error('Failed to load departments'); }
 };

 useEffect(() => { fetchHighlights(); fetchDepartments(); }, []);

 const resetForm = () => {
  setFormData({
   type: 'reel',
   instagramUrl: '',
   caption: '',
   content: '',
   department: '',
   date: new Date().toISOString().split('T')[0]
  });
  setShowForm(false);
 };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.type === 'article') {
   if (!formData.content.trim()) { toast.error('Article content is required'); return; }
  } else {
   if (!formData.instagramUrl) { toast.error('Instagram URL is required'); return; }
  }

  setSaving(true);
  try {
   const payload = {
    type: formData.type,
    caption: formData.caption,
    date: formData.date,
   };
   if (formData.type === 'article') {
    payload.content = formData.content;
   } else {
    payload.instagramUrl = formData.instagramUrl;
   }
   if (formData.department) {
    payload.department = formData.department;
   }

   await api.post('/highlights', payload);
   toast.success('Highlight created!');
   resetForm();
   fetchHighlights();
  } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  finally { setSaving(false); }
 };

 const deleteHighlight = async (id) => {
  if (!window.confirm('Delete this highlight?')) return;
  try {
   await api.delete(`/highlights/${id}`);
   setHighlights(prev => prev.filter(h => h._id !== id));
   toast.success('Deleted');
  } catch (err) { toast.error('Failed to delete'); }
 };

 return (
  <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-6">
   <div className="max-w-3xl mx-auto">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
     <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
       <Sparkles className="w-6 h-6 text-amber-500" />
       Highlights
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mt-1">Manage Reel, Pic & Article of the Day</p>
     </div>
     <button onClick={() => { resetForm(); setShowForm(true); }}
      className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-[var(--bg-primary)] rounded-lg text-sm font-medium transition-colors">
      <Plus className="w-4 h-4" /> Add Highlight
     </button>
    </div>

    {/* Create Form */}
    <AnimatePresence>
     {showForm && (
      <motion.div
       initial={{ opacity: 0, height: 0 }}
       animate={{ opacity: 1, height: 'auto' }}
       exit={{ opacity: 0, height: 0 }}
       className="overflow-hidden mb-6">
       <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
         <h2 className="font-semibold text-[var(--text-primary)]">New Highlight</h2>
         <button onClick={resetForm} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
          <X className="w-4 h-4" />
         </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
         {/* Type Selection */}
         <div className="grid grid-cols-3 gap-3">
          <button type="button"
           onClick={() => setFormData(prev => ({ ...prev, type: 'reel' }))}
           className={`p-3 rounded-lg border text-center transition-colors ${
            formData.type === 'reel' ? 'bg-[rgba(168,85,247,0.15)] border-purple-500 text-purple-400' : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-slate-300'
           }`}>
           <Film className="w-5 h-5 mx-auto mb-1" />
           <div className="text-xs font-medium">Reel of the Day</div>
          </button>
          <button type="button"
           onClick={() => setFormData(prev => ({ ...prev, type: 'pic' }))}
           className={`p-3 rounded-lg border text-center transition-colors ${
            formData.type === 'pic' ? 'bg-[rgba(245,158,11,0.15)] border-amber-500 text-amber-400' : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-slate-300'
           }`}>
           <Camera className="w-5 h-5 mx-auto mb-1" />
           <div className="text-xs font-medium">Pic of the Day</div>
          </button>
          <button type="button"
           onClick={() => setFormData(prev => ({ ...prev, type: 'article' }))}
           className={`p-3 rounded-lg border text-center transition-colors ${
            formData.type === 'article' ? 'bg-[rgba(52,211,153,0.15)] border-emerald-500 text-emerald-400' : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-slate-300'
           }`}>
           <FileText className="w-5 h-5 mx-auto mb-1" />
           <div className="text-xs font-medium">Article of the Day</div>
          </button>
         </div>

         {/* Conditional: Instagram URL for reel/pic, Textarea for article */}
         {formData.type === 'article' ? (
          <div>
           <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Article Content *</label>
           <textarea value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={8} placeholder="Write or paste the article text here..."
            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-y" />
           <p className="text-xs text-[var(--text-muted)] mt-1">{formData.content.length} / 10,000 characters</p>
          </div>
         ) : (
          <div>
           <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Instagram URL *</label>
           <input type="url" value={formData.instagramUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, instagramUrl: e.target.value }))}
            placeholder="https://www.instagram.com/reel/... or https://www.instagram.com/p/..."
            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
          </div>
         )}

         <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Caption (optional)</label>
          <textarea value={formData.caption}
           onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
           rows={2} placeholder="Brief caption..."
           className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none" />
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
           <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Date</label>
           <input type="date" value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
          </div>
          <div>
           <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            <Award className="w-3 h-3 inline mr-1" />Department (optional)
           </label>
           <select value={formData.department}
            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]">
            <option value="">— None —</option>
            {departments.map(d => (
             <option key={d._id} value={d._id}>{d.shortCode} — {d.name}</option>
            ))}
           </select>
          </div>
         </div>

         <div className="flex gap-2 pt-1">
          <button type="submit" disabled={saving}
           className="flex-1 py-2 bg-[#4ade80] hover:bg-green-600 text-[var(--text-primary)] rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
           <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Create'}
          </button>
          <button type="button" onClick={resetForm}
           className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg text-sm font-medium">
           Cancel
          </button>
         </div>
        </form>
       </div>
      </motion.div>
     )}
    </AnimatePresence>

    {/* Highlights List */}
    {loading ? (
     <div className="text-center py-12 text-[var(--text-muted)]">Loading highlights...</div>
    ) : highlights.length === 0 ? (
     <div className="text-center py-12 text-[var(--text-muted)]">
      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p>No highlights yet. Add your first one!</p>
     </div>
    ) : (
     <div className="space-y-3">
      {highlights.map((h) => {
       const deptName = h.department ? (typeof h.department === 'object' ? (h.department.shortCode || h.department.name) : null) : null;
       return (
       <motion.div key={h._id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-[var(--bg-secondary)] border rounded-xl p-4 ${
         h.type === 'reel' ? 'border-[rgba(168,85,247,0.3)]' : h.type === 'article' ? 'border-[rgba(52,211,153,0.3)]' : 'border-[rgba(245,158,11,0.3)]'
        }`}>
        <div className="flex items-start justify-between">
         <div className="flex items-center gap-2 mb-2">
          {h.type === 'reel' ? (
           <Film className="w-4 h-4 text-purple-500" />
          ) : h.type === 'article' ? (
           <FileText className="w-4 h-4 text-emerald-500" />
          ) : (
           <Camera className="w-4 h-4 text-amber-500" />
          )}
          <span className={`text-xs font-semibold ${h.type === 'reel' ? 'text-purple-400' : h.type === 'article' ? 'text-[#4ade80]' : 'text-amber-400'}`}>
           {h.type === 'reel' ? 'Reel' : h.type === 'article' ? 'Article' : 'Pic'} of the Day
          </span>
          {deptName && (
           <span className="text-[10px] font-medium bg-[var(--color-accent-subtle)] text-[var(--color-accent)] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Award className="w-2.5 h-2.5" /> {deptName}
           </span>
          )}
         </div>
         <button onClick={() => deleteHighlight(h._id)} className="p-1 text-[var(--text-muted)] hover:text-red-500">
          <Trash2 className="w-3.5 h-3.5" />
         </button>
        </div>

        {h.caption && <p className="text-sm text-[var(--text-secondary)] mb-2">{h.caption}</p>}

        {h.type === 'article' && h.content && (
         <p className="text-sm text-[var(--text-secondary)] mb-2 line-clamp-3 whitespace-pre-line">{h.content}</p>
        )}

        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
         {h.date && (
          <span className="flex items-center gap-0.5">
           <Calendar className="w-3 h-3" />
           {h.date}
          </span>
         )}
         {h.instagramUrl && (
          <a href={h.instagramUrl} target="_blank" rel="noopener noreferrer"
           className="flex items-center gap-0.5 text-[var(--color-accent)] hover:underline">
           <ExternalLink className="w-3 h-3" /> View on Instagram
          </a>
         )}
        </div>
       </motion.div>
       );
      })}
     </div>
    )}
   </div>
  </div>
 );
};

export default HighlightManagement;
