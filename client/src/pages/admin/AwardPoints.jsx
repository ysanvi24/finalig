import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import { Award, Trash2, Clock, Send } from 'lucide-react';

const AwardPoints = () => {
 const [departments, setDepartments] = useState([]);
 const [formData, setFormData] = useState({ department: '', category: 'Sports', eventName: '', position: '', points: '', description: '' });
 const [recentLogs, setRecentLogs] = useState([]);
 const [loading, setLoading] = useState(false);
 const [showClearConfirm, setShowClearConfirm] = useState(false);

 useEffect(() => {
  const fetchDepartments = async () => {
   try {
    const res = await api.get('/departments');
    setDepartments(res.data.data || res.data);
   } catch (error) { toast.error('Failed to load departments'); }
  };
  fetchDepartments();
 }, []);

 const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.department || !formData.eventName || !formData.points) { toast.error('Please fill required fields'); return; }
  setLoading(true);
  try {
   const res = await api.post('/leaderboard/award', { ...formData, points: Number(formData.points) });
   toast.success('Points Awarded Successfully!');
   const deptName = departments.find(d => d._id === formData.department)?.name || 'Unknown';
   setRecentLogs([{ ...res.data, departmentName: deptName, id: res.data._id || Date.now(), awardedAt: new Date().toISOString() }, ...recentLogs].slice(0, 10));
   setFormData({ department: '', category: 'Sports', eventName: '', position: '', points: '', description: '' });
  } catch (error) { toast.error('Failed to award points'); }
  finally { setLoading(false); }
 };

 const formatTime = (dateStr) => {
  if (!dateStr) return 'Just now';
  const diff = (new Date() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
 };

 return (
  <div className="min-h-screen bg-[var(--bg-primary)] p-6 md:p-8">
   {/* Header */}
   <div className="mb-8">
    <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] flex items-center gap-3">
     <Award className="w-8 h-8 text-[var(--color-accent)]" />
     Judge's Console
    </h1>
    <p className="text-[var(--text-secondary)] mt-1">Award points to departments for events and achievements</p>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Form */}
    <div className="lg:col-span-2">
     <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
       {/* Department */}
       <div>
        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Department <span className="text-red-500">*</span></label>
        <select name="department" value={formData.department} onChange={handleChange} required
         className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] outline-none">
         <option value="">Select Department</option>
         {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.name} ({dept.shortCode})</option>)}
        </select>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
         <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Event Name <span className="text-red-500">*</span></label>
         <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} placeholder="e.g. Cricket Finals" required
          className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none" />
        </div>
        <div>
         <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Category</label>
         <select name="category" value={formData.category} onChange={handleChange}
          className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none">
          <option value="Sports">Sports</option>
          <option value="Cultural">Cultural</option>
          <option value="Literary">Literary</option>
          <option value="Technical">Technical</option>
          <option value="Arts">Arts</option>
          <option value="Other">Other</option>
         </select>
        </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
         <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Position</label>
         <select name="position" value={formData.position} onChange={handleChange}
          className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none">
          <option value="">Select Position</option>
          <option value="Winner">🥇 Winner (1st)</option>
          <option value="Runner-up">🥈 Runner-up (2nd)</option>
          <option value="2nd Runner-up">🥉 2nd Runner-up (3rd)</option>
          <option value="Participation">📜 Participation</option>
          <option value="Special">⭐ Special Award</option>
         </select>
        </div>
        <div>
         <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Points <span className="text-red-500">*</span></label>
         <input type="number" name="points" value={formData.points} onChange={handleChange} placeholder="e.g. 10, 25, -5" required
          className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none" />
         <p className="text-sm text-[var(--text-secondary)] mt-2">Use negative for deductions</p>
        </div>
       </div>

       <div>
        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Notes (Optional)</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Additional notes..."
         className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none resize-none" />
       </div>

       <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-[var(--bg-primary)] rounded-lg font-semibold text-lg disabled:opacity-50 transition-colors">
        {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
        {loading ? 'Awarding...' : 'Award Points'}
       </button>
      </form>
     </div>
    </div>

    {/* Recent Logs */}
    <div>
     <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
       <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2"><Clock className="w-5 h-5 text-[var(--color-accent)]" /> Recent Awards</h3>
       {recentLogs.length > 0 && (
        <button onClick={() => setShowClearConfirm(true)} className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors">
         <Trash2 className="w-4 h-4" />
        </button>
       )}
      </div>
      {recentLogs.length === 0 ? (
       <div className="text-center py-8 text-[var(--text-muted)]">
        <div className="text-3xl mb-2">📝</div>
        <p className="text-sm">No awards yet this session</p>
       </div>
      ) : (
       <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {recentLogs.map((log) => (
         <div key={log.id || log._id} className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg">
          <div className="flex justify-between items-start">
           <div>
            <div className="font-semibold text-[var(--text-primary)]">{log.departmentName || log.department?.name}</div>
            <div className="text-sm text-[var(--text-secondary)]">{log.eventName}</div>
            {log.position && <div className="text-sm text-[var(--color-accent)] mt-1">📍 {log.position}</div>}
           </div>
           <div className="text-right">
            <div className={`text-xl font-bold ${log.points > 0 ? 'text-green-500' : 'text-red-500'}`}>{log.points > 0 ? '+' : ''}{log.points}</div>
            <div className="text-sm text-[var(--text-muted)]">{formatTime(log.awardedAt)}</div>
           </div>
          </div>
         </div>
        ))}
       </div>
      )}
     </div>
    </div>
   </div>

   <ConfirmModal isOpen={showClearConfirm} title="Clear History" message="Clear all session logs?" confirmText="Clear" onConfirm={() => { setRecentLogs([]); setShowClearConfirm(false); toast.success('Cleared'); }} onCancel={() => setShowClearConfirm(false)} variant="danger" />
  </div>
 );
};

export default AwardPoints;
