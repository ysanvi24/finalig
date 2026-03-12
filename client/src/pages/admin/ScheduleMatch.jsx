import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Clock, Plus, AlertCircle, Trophy } from 'lucide-react';
import { getMatchSportsForSelect, MATCH_SPORT_GROUPS } from '../../config/sportsRegistry';

const SPORTS = getMatchSportsForSelect();

const CATEGORIES = [
 { label: 'Regular', value: 'REGULAR' },
 { label: 'Group Stage', value: 'GROUP_STAGE' },
 { label: 'Quarter Final', value: 'QUARTER_FINAL' },
 { label: 'Semi Final', value: 'SEMIFINAL' },
 { label: 'Final', value: 'FINAL' }
];

const ScheduleMatch = () => {
 const [departments, setDepartments] = useState([]);
 const [formData, setFormData] = useState({
  sport: 'CRICKET', teamA: '', teamB: '', scheduledAt: '',
  venue: '', matchCategory: 'REGULAR'
 });
 const [loading, setLoading] = useState(false);

 useEffect(() => {
  const fetchDepartments = async () => {
   try {
    const response = await api.get('/departments');
    setDepartments(response.data.data || []);
   } catch (err) { toast.error('Failed to load departments'); }
  };
  fetchDepartments();
 }, []);

 const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.teamA || !formData.teamB) { toast.error('Please select both teams'); return; }
  if (formData.teamA === formData.teamB) { toast.error('Teams cannot be the same'); return; }
  if (!formData.scheduledAt) { toast.error('Please select date and time'); return; }

  setLoading(true);
  try {
   await api.post('/matches', {
    sport: formData.sport,
    teamA: formData.teamA,
    teamB: formData.teamB,
    scheduledAt: formData.scheduledAt,
    venue: formData.venue || 'Main Ground',
    matchCategory: formData.matchCategory
   });
   toast.success('Match scheduled successfully!');
   setFormData({ sport: 'CRICKET', teamA: '', teamB: '', scheduledAt: '', venue: '', matchCategory: 'REGULAR' });
  } catch (err) { toast.error(err.response?.data?.message || 'Failed to schedule match'); }
  finally { setLoading(false); }
 };

 const teamADept = departments.find(d => d._id === formData.teamA);
 const teamBDept = departments.find(d => d._id === formData.teamB);

 return (
  <div className="min-h-screen bg-[var(--bg-primary)] p-3 sm:p-6">
   <div className="max-w-2xl mx-auto">
    <div className="mb-6">
     <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
      <Plus className="w-6 h-6 text-[var(--color-accent)]" />
      Schedule Match
     </h1>
     <p className="text-sm text-[var(--text-secondary)] mt-1">Create a new match fixture</p>
    </div>

    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 sm:p-6">
     <form onSubmit={handleSubmit} className="space-y-5">
      {/* Sport Selection */}
      <div>
       <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Sport</label>
       <select name="sport" value={formData.sport} onChange={handleChange}
        className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent outline-none text-sm">
        {SPORTS.map(sport => (
         <option key={sport.value} value={sport.value}>{sport.label}</option>
        ))}
       </select>
      </div>

      {/* VS Display */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 py-4">
       <div className="w-full sm:flex-1 text-center p-3 rounded-lg bg-[var(--color-accent-subtle)] border border-[var(--border-color)]">
        <div className="text-xl sm:text-2xl font-bold text-[var(--color-accent)]">{teamADept?.shortCode || '?'}</div>
        <div className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">{teamADept?.name || 'Team A'}</div>
       </div>
       <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-[var(--text-secondary)] font-bold text-sm">VS</span>
       </div>
       <div className="w-full sm:flex-1 text-center p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
        <div className="text-xl sm:text-2xl font-bold text-[var(--text-secondary)]">{teamBDept?.shortCode || '?'}</div>
        <div className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">{teamBDept?.name || 'Team B'}</div>
       </div>
      </div>

      {/* Teams Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Team A</label>
        <select name="teamA" value={formData.teamA} onChange={handleChange}
         className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm">
         <option value="">Select</option>
         {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.shortCode} - {dept.name}</option>)}
        </select>
       </div>
       <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Team B</label>
        <select name="teamB" value={formData.teamB} onChange={handleChange}
         className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm">
         <option value="">Select</option>
         {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.shortCode} - {dept.name}</option>)}
        </select>
       </div>
      </div>

      {/* Category, Venue & Date */}
      <div>
       <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
        <Trophy className="w-3 h-3" /> Match Category
       </label>
       <select name="matchCategory" value={formData.matchCategory} onChange={handleChange}
        className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm">
        {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
       </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <div>
        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> Venue</label>
        <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="Main Ground"
         className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm" />
       </div>
       <div>
        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Date & Time</label>
        <input type="datetime-local" name="scheduledAt" value={formData.scheduledAt} onChange={handleChange}
         className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm" />
       </div>
      </div>

      {formData.teamA === formData.teamB && formData.teamA && (
       <div className="p-3 bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.2)] rounded-lg flex gap-2 items-center">
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <p className="text-xs text-[#f87171]">Teams cannot be the same</p>
       </div>
      )}

      <button type="submit"
       disabled={loading || !formData.teamA || !formData.teamB || formData.teamA === formData.teamB}
       className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
        loading || !formData.teamA || !formData.teamB || formData.teamA === formData.teamB
         ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
         : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-[var(--bg-primary)]'
       }`}>
       {loading ? (
        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Scheduling...</>
       ) : (
        <><Calendar className="w-4 h-4" /> Schedule Match</>
       )}
      </button>
     </form>
    </div>
   </div>
  </div>
 );
};

export default ScheduleMatch;
