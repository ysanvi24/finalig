import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Shield, Plus, Trash2, UserCheck, UserX, Activity, X, Save, RotateCcw } from 'lucide-react';

const AdminManagement = () => {
 const [admins, setAdmins] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [liveActivity, setLiveActivity] = useState([]);
 const [formData, setFormData] = useState({ studentId: '', username: '', email: '', password: '', role: 'score_manager', isTrusted: false });

 const roles = [
  { value: 'viewer', label: 'Viewer', description: 'Can only view' },
  { value: 'moderator', label: 'Moderator', description: 'Basic moderation' },
  { value: 'score_manager', label: 'Score Manager', description: 'Can update scores' },
  { value: 'admin', label: 'Admin', description: 'Full admin access' },
  { value: 'super_admin', label: 'Super Admin', description: 'Complete control' }
 ];

 const fetchAdmins = async () => {
  try {
   setLoading(true);
   const response = await api.get('/admins');
   setAdmins(response.data.data || []);
  } catch (err) { 
   console.error('❌ Fetch admins error:', err.response?.data || err);
   if (err.response?.status !== 403) toast.error('Failed to load admins'); 
  }
  finally { setLoading(false); }
 };

 const fetchLiveActivity = async () => {
  try {
   const response = await api.get('/admins/activity/live');
   setLiveActivity(response.data.data || []);
  } catch (err) { console.log('Activity not available'); }
 };

 useEffect(() => {
  fetchAdmins();
  fetchLiveActivity();
  const interval = setInterval(fetchLiveActivity, 30000);
  return () => clearInterval(interval);
 }, []);

 const handleCreateAdmin = async (e) => {
  e.preventDefault();
  try {
   await api.post('/admins', formData);
   toast.success('Admin created successfully');
   setShowCreateModal(false);
   setFormData({ studentId: '', username: '', email: '', password: '', role: 'score_manager', isTrusted: false });
   fetchAdmins();
  } catch (err) { 
   console.error('❌ Create admin error:', err.response?.data || err);
   toast.error(err.response?.data?.message || 'Failed to create admin'); 
  }
 };

 const handleVerifyAdmin = async (adminId) => {
  const admin = admins.find(a => a._id === adminId);
  const displayName = admin?.name || admin?.username || 'Admin';
  
  if (!window.confirm(`Verify and trust ${displayName}?\n\nThis will grant them ${admin?.role} access to the system.`)) return;
  
  try {
   await api.put(`/admins/${adminId}/verify`, { isTrusted: true, verified: true });
   toast.success(`${displayName} verified and trusted successfully!`);
   fetchAdmins();
  } catch (err) { 
   console.error('❌ Verify error:', err);
   toast.error(err.response?.data?.message || 'Failed to verify admin'); 
  }
 };

 const handleUpdateRole = async (adminId, newRole) => {
  const admin = admins.find(a => a._id === adminId);
  const displayName = admin?.name || admin?.username || 'Admin';
  const oldRole = admin?.role;
  
  // Optimistic update
  setAdmins(prev => prev.map(a => a._id === adminId ? { ...a, role: newRole } : a));
  
  try {
   const res = await api.put(`/admins/${adminId}`, { role: newRole });
   console.log('✅ Role updated:', res.data);
   toast.success(`${displayName}: ${oldRole} → ${newRole}`);
  } catch (err) { 
   console.error('❌ Role update error:', err.response?.data || err);
   toast.error(err.response?.data?.message || 'Failed to update role');
   // Revert on failure
   setAdmins(prev => prev.map(a => a._id === adminId ? { ...a, role: oldRole } : a));
  }
 };

 const handleSuspendAdmin = async (adminId) => {
  const admin = admins.find(a => a._id === adminId);
  const displayName = admin?.name || admin?.username || 'Admin';
  if (!window.confirm(`Suspend ${displayName}? They will lose access immediately.`)) return;
  try {
   await api.put(`/admins/${adminId}/suspend`);
   toast.success(`${displayName} suspended`);
   setAdmins(prev => prev.map(a => a._id === adminId ? { ...a, isActive: false, isSuspended: true } : a));
  } catch (err) { toast.error(err.response?.data?.message || 'Failed to suspend admin'); }
 };

 const handleReactivateAdmin = async (adminId) => {
  const admin = admins.find(a => a._id === adminId);
  const displayName = admin?.name || admin?.username || 'Admin';
  if (!window.confirm(`Reactivate ${displayName}? They will regain access.`)) return;
  try {
   await api.put(`/admins/${adminId}`, { isActive: true });
   await api.put(`/admins/${adminId}/verify`, { isTrusted: true, verified: true });
   toast.success(`${displayName} reactivated and verified!`);
   fetchAdmins();
  } catch (err) { toast.error(err.response?.data?.message || 'Failed to reactivate admin'); }
 };

 const handleDeleteAdmin = async (adminId) => {
  const admin = admins.find(a => a._id === adminId);
  const displayName = admin?.name || admin?.username || 'Admin';
  if (!window.confirm(`Permanently delete ${displayName}? This cannot be undone.`)) return;
  try {
   await api.delete(`/admins/${adminId}`);
   toast.success(`${displayName} deleted successfully`);
   setAdmins(prev => prev.filter(a => a._id !== adminId));
  } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete admin'); }
 };

 const getAdminStatus = (admin) => {
  if (!admin.isActive || admin.isSuspended) return 'suspended';
  if (admin.isTrusted) return 'verified';
  return 'pending';
 };

 return (
  <div className="min-h-screen bg-[var(--bg-primary)] p-6 md:p-8">
   <div className="max-w-7xl mx-auto">
    {/* Header */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
     <div>
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] flex items-center gap-3">
       <Shield className="w-8 h-8 text-[var(--color-accent)]" />
       Admin Management
      </h1>
      <p className="text-[var(--text-secondary)] mt-1">Manage admin users, verify Google OAuth accounts, and control permissions</p>
     </div>
     <button onClick={() => setShowCreateModal(true)}
      className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-[var(--bg-primary)] rounded-lg font-semibold flex items-center gap-2 transition-colors">
      <Plus className="w-5 h-5" /> Add Admin
     </button>
    </div>

    {/* Live Activity */}
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 mb-8">
     <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
      <span className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse"></span>
      <Activity className="w-5 h-5 text-green-500" /> Live Activity
     </h3>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {liveActivity.length > 0 ? liveActivity.map((activity, idx) => (
       <div key={idx} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
         <div className="w-10 h-10 bg-[var(--color-accent-subtle)] rounded-full flex items-center justify-center"><span className="text-[var(--color-accent)]">👤</span></div>
         <div>
          <div className="text-[var(--text-primary)] font-medium">{activity.adminName}</div>
          <div className="text-[var(--text-muted)] text-xs">{activity.role}</div>
         </div>
        </div>
        <div className="text-[var(--text-secondary)] text-sm">{activity.action}</div>
        <div className="text-[var(--text-secondary)] text-sm mt-1">{activity.match}</div>
       </div>
      )) : (
       <div className="col-span-3 text-center text-[var(--text-muted)] py-4">No active sessions</div>
      )}
     </div>
    </div>

    {/* Admin List */}
    {loading ? (
     <div className="text-center py-12"><div className="w-8 h-8 border-2 border-[var(--border-color)] border-t-[var(--color-accent)] rounded-full animate-spin mx-auto"></div></div>
    ) : (
     <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
       <table className="w-full">
        <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
         <tr>
          <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)] uppercase">Admin</th>
          <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)] uppercase">Role</th>
          <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)] uppercase">Status</th>
          <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)] uppercase">Actions</th>
         </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]">
         {admins.map((admin) => {
          const status = getAdminStatus(admin);
          return (
           <tr key={admin._id} className={`hover:bg-[var(--bg-primary)] ${status === 'suspended' ? 'opacity-60' : ''}`}>
            <td className="px-6 py-4">
             <div className="flex items-center gap-3">
              {admin.profilePicture ? (
               <img src={admin.profilePicture} alt={admin.username} 
                className="w-10 h-10 rounded-full border-2 border-[var(--border-color)]" />
              ) : (
               <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[var(--bg-primary)] font-bold">
                {admin.username?.charAt(0).toUpperCase() || admin.name?.charAt(0).toUpperCase() || '?'}
               </div>
              )}
              <div>
               <div className="text-[var(--text-primary)] font-medium flex items-center gap-2">
                {admin.name || admin.username}
                {admin.provider === 'google' && (
                 <span className="px-2 py-0.5 bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--border-color)] rounded text-xs font-medium">Google</span>
                )}
               </div>
               <div className="text-[var(--text-muted)] text-xs">{admin.email}</div>
               {admin.username && admin.name && admin.username !== admin.name && (
                <div className="text-[var(--text-secondary)] text-xs">@{admin.username}</div>
               )}
              </div>
             </div>
            </td>
            <td className="px-6 py-4">
             <select value={admin.role} onChange={(e) => handleUpdateRole(admin._id, e.target.value)}
              disabled={status === 'suspended'}
              className="px-3 py-1 bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed">
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
             </select>
            </td>
            <td className="px-6 py-4">
             {status === 'verified' ? (
              <span className="px-3 py-1 bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.2)] rounded-full text-sm font-medium">✓ Verified</span>
             ) : status === 'suspended' ? (
              <span className="px-3 py-1 bg-[rgba(248,113,113,0.15)] text-[#f87171] border border-[rgba(248,113,113,0.2)] rounded-full text-sm font-medium">⛔ Suspended</span>
             ) : (
              <span className="px-3 py-1 bg-[rgba(251,191,36,0.15)] text-amber-400 border border-[rgba(251,191,36,0.2)] rounded-full text-sm font-medium">⏳ Pending</span>
             )}
            </td>
            <td className="px-6 py-4">
             <div className="flex gap-2">
              {/* Verify — show for pending (not verified, not suspended) */}
              {status === 'pending' && (
               <button onClick={() => handleVerifyAdmin(admin._id)}
                className="p-2 bg-[rgba(74,222,128,0.1)] hover:bg-[rgba(74,222,128,0.15)] text-[#4ade80] rounded-lg transition-colors" title="Verify & Trust">
                <UserCheck className="w-4 h-4" />
               </button>
              )}

              {/* Reactivate — show for suspended */}
              {status === 'suspended' && (
               <button onClick={() => handleReactivateAdmin(admin._id)}
                className="p-2 bg-[var(--color-accent-subtle)] hover:bg-[var(--color-accent-subtle)] text-[var(--color-accent)] rounded-lg transition-colors" title="Reactivate & Authorize">
                <RotateCcw className="w-4 h-4" />
               </button>
              )}

              {/* Suspend — show for active (verified or pending, not already suspended) */}
              {status !== 'suspended' && (
               <button onClick={() => handleSuspendAdmin(admin._id)}
                className="p-2 bg-[rgba(251,191,36,0.1)] hover:bg-[rgba(251,191,36,0.15)] text-amber-400 rounded-lg transition-colors" title="Suspend">
                <UserX className="w-4 h-4" />
               </button>
              )}

              {/* Delete — always show */}
              <button onClick={() => handleDeleteAdmin(admin._id)}
               className="p-2 bg-[rgba(248,113,113,0.1)] hover:bg-[rgba(248,113,113,0.15)] text-[#f87171] rounded-lg transition-colors" title="Delete permanently">
               <Trash2 className="w-4 h-4" />
              </button>
             </div>
            </td>
           </tr>
          );
         })}
        </tbody>
       </table>
      </div>
      {admins.length === 0 && (
       <div className="text-center py-12 text-[var(--text-muted)]">
        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No admins found</p>
       </div>
      )}
     </div>
    )}

    {/* Create Modal */}
    {showCreateModal && (
     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 w-full max-w-md">
       <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">Add New Admin</h3>
        <button onClick={() => setShowCreateModal(false)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"><X className="w-5 h-5" /></button>
       </div>
       <form onSubmit={handleCreateAdmin} className="space-y-4">
        <div>
         <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Username *</label>
         <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required
          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none" />
        </div>
        <div>
         <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Email *</label>
         <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none" />
        </div>
        <div>
         <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Password *</label>
         <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required
          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none" />
        </div>
        <div>
         <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Role</label>
         <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none">
          {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
         </select>
        </div>
        <button type="submit"
         className="w-full py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-[var(--bg-primary)] rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
         <Save className="w-5 h-5" /> Create Admin
        </button>
       </form>
      </div>
     </div>
    )}
   </div>
  </div>
 );
};

export default AdminManagement;
