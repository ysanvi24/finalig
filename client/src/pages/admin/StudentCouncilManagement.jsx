import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { Users, Plus, Edit, Trash2, X, Save, User, Upload, ImageIcon } from 'lucide-react';

/** Safe avatar — falls back to icon via state, no DOM mutation */
const SafeAvatar = ({ src, name }) => {
 const [failed, setFailed] = React.useState(false);
 if (failed || !src) return <User className="w-7 h-7" />;
 return (
  <img src={src} alt={name} className="w-full h-full rounded-full object-cover"
   onError={() => setFailed(true)} />
 );
};

const StudentCouncilManagement = () => {
 const [members, setMembers] = useState([]);
 const [loading, setLoading] = useState(false);
 const [showForm, setShowForm] = useState(false);
 const [editingId, setEditingId] = useState(null);
 const [formData, setFormData] = useState({ name: '', position: 'Member', department: 'CSE', photo: '', pledge: '', email: '', phone: '', order: 0 });
 const [photoFile, setPhotoFile] = useState(null);
 const [photoPreview, setPhotoPreview] = useState(null);
 const fileInputRef = useRef(null);

 const departments = ['CSE', 'CIVIL', 'CHEMINE', 'EEE', 'ECE', 'MECH', 'META', 'Architecture', 'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Electronics & Communication Engineering', 'Computer Science & Engineering', 'MVD', 'Structural Engineering'];

 useEffect(() => { fetchMembers(); }, []);

 const fetchMembers = async () => {
  try {
   setLoading(true);
   const response = await axios.get('/student-council');
   setMembers(response.data.data || []);
  } catch (error) { toast.error('Failed to fetch members'); }
  finally { setLoading(false); }
 };

 const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

 const handlePhotoFileChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
   toast.error('Please select an image file');
   return;
  }
  if (file.size > 5 * 1024 * 1024) {
   toast.error('Image must be under 5MB');
   return;
  }
  setPhotoFile(file);
  setPhotoPreview(URL.createObjectURL(file));
  // Clear URL field when file is selected
  setFormData(prev => ({ ...prev, photo: '' }));
 };

 const clearPhotoFile = () => {
  setPhotoFile(null);
  setPhotoPreview(null);
  if (fileInputRef.current) fileInputRef.current.value = '';
 };

 const getPhotoUrl = (photoPath) => {
  if (!photoPath || photoPath.includes('undefined')) return null;
  if (photoPath.startsWith('http')) return photoPath;
  if (photoPath.startsWith('data:')) return photoPath;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
  return `${baseUrl}${photoPath}`;
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.name || !formData.position || !formData.department) { toast.error('Please fill in all required fields'); return; }
  try {
   setLoading(true);

   // Build FormData for multipart upload
   const fd = new FormData();
   fd.append('name', formData.name);
   fd.append('position', formData.position);
   fd.append('department', formData.department);
   fd.append('pledge', formData.pledge || '');
   fd.append('email', formData.email || '');
   fd.append('phone', formData.phone || '');
   fd.append('order', formData.order || 0);

   if (photoFile) {
    fd.append('photo', photoFile);
   } else if (formData.photo) {
    fd.append('photo', formData.photo);
   }

   if (editingId) {
    await axios.put(`/student-council/${editingId}`, fd, {
     headers: { 'Content-Type': 'multipart/form-data' }
    });
    toast.success('Member updated successfully');
   } else {
    await axios.post('/student-council', fd, {
     headers: { 'Content-Type': 'multipart/form-data' }
    });
    toast.success('Member added successfully');
   }
   resetForm();
   fetchMembers();
  } catch (error) { toast.error(error.response?.data?.message || 'Failed to save member'); }
  finally { setLoading(false); }
 };

 const handleEdit = (member) => {
  setFormData({
   name: member.name || '',
   position: member.position || 'Member',
   department: member.department || 'CSE',
   photo: member.photo || '',
   pledge: member.pledge || '',
   email: member.email || '',
   phone: member.phone || '',
   order: member.order || 0,
  });
  setEditingId(member._id);
  setPhotoFile(null);
  // Show current photo as preview
  const url = getPhotoUrl(member.photo);
  setPhotoPreview(url);
  setShowForm(true);
 };

 const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this member?')) {
   try {
    setLoading(true);
    await axios.delete(`/student-council/${id}`);
    toast.success('Member deleted successfully');
    fetchMembers();
   } catch (error) { toast.error('Failed to delete member'); }
   finally { setLoading(false); }
  }
 };

 const resetForm = () => {
  setFormData({ name: '', position: 'Member', department: 'CSE', photo: '', pledge: '', email: '', phone: '', order: 0 });
  setEditingId(null);
  setShowForm(false);
  clearPhotoFile();
 };

 return (
  <div className="min-h-screen bg-[var(--bg-primary)] p-6 md:p-8">
   <div className="max-w-6xl mx-auto">
    {/* Header */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
     <div>
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] flex items-center gap-3">
       <Users className="w-8 h-8 text-[var(--color-accent)]" />
       Student Council
      </h1>
      <p className="text-[var(--text-secondary)] mt-1">Manage council members and positions</p>
     </div>
     <button onClick={() => setShowForm(!showForm)}
      className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${showForm ? 'bg-[#f87171] hover:bg-red-600' : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]'} text-[var(--bg-primary)]`}>
      {showForm ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> Add Member</>}
     </button>
    </div>

    {/* Form */}
    {showForm && (
     <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 md:p-8 mb-8">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">{editingId ? 'Edit' : 'Add New'} Member</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <div>
        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Full Name *</label>
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter name"
         className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none" />
       </div>
       <div>
        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Position *</label>
        <input type="text" name="position" value={formData.position} onChange={handleInputChange} placeholder="e.g. General Secretary, Sports Secretary"
         className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none" />
       </div>
       <div>
        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Department *</label>
        <select name="department" value={formData.department} onChange={handleInputChange}
         className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none">
         {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
        </select>
       </div>
       <div>
        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="email@example.com"
         className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none" />
       </div>
       <div>
        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Phone</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 XXXXXXXXXX"
         className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none" />
       </div>
       <div>
        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Display Order</label>
        <input type="number" name="order" value={formData.order} onChange={handleInputChange} placeholder="0"
         className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none" />
       </div>

       {/* Photo Upload — file or URL */}
       <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Member Photo</label>
        <div className="flex flex-col sm:flex-row gap-4">
         {/* File Upload */}
         <div className="flex-1">
          <div
           onClick={() => fileInputRef.current?.click()}
           className="relative border-2 border-dashed border-[var(--border-color-strong)] rounded-xl p-4 text-center cursor-pointer hover:border-[var(--color-accent)] transition-colors bg-[var(--bg-primary)]/50">
           {photoPreview ? (
            <div className="relative inline-block">
             <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover mx-auto" />
             <button type="button" onClick={(e) => { e.stopPropagation(); clearPhotoFile(); }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
              <X className="w-3 h-3" />
             </button>
            </div>
           ) : (
            <>
             <Upload className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
             <p className="text-xs text-[var(--text-secondary)]">Click to upload photo</p>
             <p className="text-[10px] text-[var(--text-muted)] mt-1">JPG, PNG or WebP • Max 5MB</p>
            </>
           )}
           <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoFileChange} className="hidden" />
          </div>
         </div>
         {/* URL Fallback */}
         <div className="flex-1">
          <p className="text-xs text-[var(--text-muted)] mb-2">Or paste a URL:</p>
          <input type="url" name="photo" value={formData.photo} onChange={(e) => { handleInputChange(e); clearPhotoFile(); }} placeholder="https://example.com/photo.jpg"
           className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm" />
         </div>
        </div>
       </div>

       <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Pledge / Motto</label>
        <textarea name="pledge" value={formData.pledge} onChange={handleInputChange} placeholder="Enter your pledge or motto..." rows="2"
         className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none resize-none" />
       </div>
       <div className="md:col-span-2 flex gap-4">
        <button type="submit" disabled={loading}
         className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-[var(--bg-primary)] rounded-lg font-semibold disabled:opacity-50 transition-colors">
         {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
         {editingId ? 'Update' : 'Add'} Member
        </button>
        <button type="button" onClick={resetForm}
         className="px-6 py-3 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg font-semibold transition-colors">
         Cancel
        </button>
       </div>
      </form>
     </div>
    )}

    {/* Members Grid */}
    {loading && members.length === 0 ? (
     <div className="text-center py-12"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
    ) : members.length === 0 ? (
     <div className="text-center py-16 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
      <Users className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
      <p className="text-[var(--text-secondary)] text-lg">No council members yet</p>
      <p className="text-[var(--text-muted)] text-sm mt-2">Add your first member to get started</p>
     </div>
    ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
       <div key={member._id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 hover:border-[var(--border-color-strong)] transition-all group">
        <div className="flex items-start gap-4">
         <div className="w-14 h-14 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[var(--bg-primary)] flex-shrink-0 overflow-hidden">
          {getPhotoUrl(member.photo) ? (
           <SafeAvatar src={getPhotoUrl(member.photo)} name={member.name} />
          ) : (
           <User className="w-7 h-7" />
          )}
         </div>
         <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">{member.name}</h3>
          <p className="text-sm font-medium text-[var(--color-accent)]">{member.position}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{member.department}</p>
         </div>
        </div>
        {member.pledge && <p className="text-sm text-[var(--text-secondary)] mt-3 italic">"{member.pledge}"</p>}
        <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
         <button onClick={() => handleEdit(member)}
          className="p-2 bg-[var(--color-accent-subtle)] hover:bg-[var(--color-accent-subtle)] text-[var(--color-accent)] rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
         <button onClick={() => handleDelete(member._id)}
          className="p-2 bg-[rgba(248,113,113,0.1)] hover:bg-[rgba(248,113,113,0.15)] text-[#f87171] rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
       </div>
      ))}
     </div>
    )}
   </div>
  </div>
 );
};

export default StudentCouncilManagement;
