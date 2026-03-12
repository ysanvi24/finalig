import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { BookOpen, Target, Eye, History, Star, Plus, Trash2, Save, Mail, Phone } from 'lucide-react';

const AboutManagement = () => {
 const [about, setAbout] = useState(null);
 const [loading, setLoading] = useState(false);
 const [formData, setFormData] = useState({
  title: '', description: '', missionStatement: '', visionStatement: '', history: '',
  highlights: [], logoUrl: '', bannerUrl: '', contactEmail: '', contactPhone: ''
 });
 const [newHighlight, setNewHighlight] = useState({ title: '', description: '' });

 useEffect(() => { fetchAbout(); }, []);

 const fetchAbout = async () => {
  try {
   setLoading(true);
   const response = await axios.get('/about');
   setAbout(response.data.data);
   setFormData(response.data.data || formData);
  } catch (error) { toast.error('Failed to fetch about page'); }
  finally { setLoading(false); }
 };

 const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

 const handleAddHighlight = () => {
  if (newHighlight.title && newHighlight.description) {
   setFormData(prev => ({ ...prev, highlights: [...(prev.highlights || []), newHighlight] }));
   setNewHighlight({ title: '', description: '' });
  } else { toast.error('Please fill in both highlight fields'); }
 };

 const handleRemoveHighlight = (index) => setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.title || !formData.description) { toast.error('Please fill in title and description'); return; }
  try {
   setLoading(true);
   await axios.put('/about', formData);
   toast.success('About page updated successfully');
   fetchAbout();
  } catch (error) { toast.error(error.response?.data?.message || 'Failed to update about page'); }
  finally { setLoading(false); }
 };

 return (
  <div className="min-h-screen bg-[var(--bg-primary)] p-6 md:p-8">
   <div className="max-w-4xl mx-auto">
    {/* Header */}
    <div className="mb-8">
     <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] flex items-center gap-3">
      <BookOpen className="w-8 h-8 text-[var(--color-accent)]" />
      About Institute Gathering
     </h1>
     <p className="text-[var(--text-secondary)] mt-1">Manage your about page content</p>
    </div>

    {loading && !formData.title ? (
     <div className="text-center py-12"><div className="w-8 h-8 border-2 border-[var(--border-color)] border-t-[var(--color-accent)] rounded-full animate-spin mx-auto"></div></div>
    ) : (
     <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
       {/* Title */}
       <div>
        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Page Title *</label>
        <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="About Institute Gathering"
         className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none" />
       </div>

       {/* Description */}
       <div>
        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Description *</label>
        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter a detailed description..." rows="5"
         className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none resize-none" />
       </div>

       {/* Mission & Vision */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-[var(--color-accent-subtle)] border border-[var(--border-color)] rounded-lg">
         <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2 flex items-center gap-2"><Target className="w-4 h-4" /> Mission Statement</label>
         <textarea name="missionStatement" value={formData.missionStatement} onChange={handleInputChange} rows="4" placeholder="Our mission..."
          className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none resize-none" />
        </div>
        <div className="p-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg">
         <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2"><Eye className="w-4 h-4" /> Vision Statement</label>
         <textarea name="visionStatement" value={formData.visionStatement} onChange={handleInputChange} rows="4" placeholder="Our vision..."
          className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none resize-none" />
        </div>
       </div>

       {/* History */}
       <div className="p-4 bg-[var(--color-accent-subtle)] border border-[var(--border-color)] rounded-lg">
        <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2 flex items-center gap-2"><History className="w-4 h-4" /> History</label>
        <textarea name="history" value={formData.history} onChange={handleInputChange} rows="4" placeholder="History of Institute Gathering..."
         className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-amber-500 outline-none resize-none" />
       </div>

       {/* Highlights */}
       <div className="p-4 bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.2)] rounded-lg">
        <label className="block text-sm font-semibold text-[#4ade80] mb-2 flex items-center gap-2"><Star className="w-4 h-4" /> Event Highlights</label>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
         <input type="text" value={newHighlight.title} onChange={(e) => setNewHighlight(prev => ({ ...prev, title: e.target.value }))} placeholder="Highlight title"
          className="flex-1 px-4 py-2 bg-[var(--bg-secondary)] border border-[rgba(74,222,128,0.2)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none" />
         <input type="text" value={newHighlight.description} onChange={(e) => setNewHighlight(prev => ({ ...prev, description: e.target.value }))} placeholder="Highlight description"
          className="flex-1 px-4 py-2 bg-[var(--bg-secondary)] border border-[rgba(74,222,128,0.2)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none" />
         <button type="button" onClick={handleAddHighlight}
          className="px-4 py-2 bg-[#4ade80] hover:bg-green-600 text-[var(--text-primary)] rounded-lg font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Add
         </button>
        </div>
        {formData.highlights?.map((h, idx) => (
         <div key={idx} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg mb-2">
          <div><span className="font-semibold text-[var(--text-primary)]">{h.title}</span><span className="text-[var(--text-secondary)] ml-2">- {h.description}</span></div>
          <button type="button" onClick={() => handleRemoveHighlight(idx)} className="p-1 text-red-500 hover:text-[#f87171] transition-colors"><Trash2 className="w-4 h-4" /></button>
         </div>
        ))}
       </div>

       {/* Contact Info */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
         <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2"><Mail className="w-4 h-4" /> Contact Email</label>
         <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} placeholder="contact@vnit.ac.in"
          className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none" />
        </div>
        <div>
         <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2"><Phone className="w-4 h-4" /> Contact Phone</label>
         <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} placeholder="+91 XXXXXXXXXX"
          className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none" />
        </div>
       </div>

       {/* Submit */}
       <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-[var(--bg-primary)] rounded-lg font-semibold text-lg disabled:opacity-50 transition-colors">
        {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
        {loading ? 'Saving...' : 'Save Changes'}
       </button>
      </form>
     </div>
    )}
   </div>
  </div>
 );
};

export default AboutManagement;
