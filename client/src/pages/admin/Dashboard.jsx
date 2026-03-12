import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Activity, Trophy, Calendar, Users, Zap, ArrowRight, LayoutDashboard, CalendarPlus, Medal, Sparkles, Award } from 'lucide-react';

const Dashboard = () => {
 const [stats, setStats] = useState({
  total: 0,
  completed: 0,
  upcoming: 0,
  departments: 0
 });
 const [recentMatches, setRecentMatches] = useState([]);
 const [loading, setLoading] = useState(true);
 const navigate = useNavigate();

 useEffect(() => {
  const fetchData = async () => {
   try {
    const [matchRes, deptRes] = await Promise.all([
     api.get('/matches'),
     api.get('/departments')
    ]);
    const matches = matchRes.data.data || [];
    const departments = deptRes.data.data || [];

    setStats({
     total: matches.length,
     completed: matches.filter(m => m.status === 'COMPLETED').length,
     upcoming: matches.filter(m => m.status === 'SCHEDULED').length,
     departments: departments.length
    });
    
    const recentMatches = matches
     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
     .slice(0, 5);
    setRecentMatches(recentMatches);
   } catch (err) {
    console.error('Failed to fetch stats', err);
   } finally {
    setLoading(false);
   }
  };
  fetchData();

  const handleUpdate = () => fetchData();
  const handleCreated = () => fetchData();
  const handleDeleted = () => fetchData();
  socket.on('matchUpdate', handleUpdate);
  socket.on('matchCreated', handleCreated);
  socket.on('matchDeleted', handleDeleted);

  return () => {
   socket.off('matchUpdate', handleUpdate);
   socket.off('matchCreated', handleCreated);
   socket.off('matchDeleted', handleDeleted);
  };
 }, []);

 const getStatusBadge = (status) => {
  switch (status) {
   case 'COMPLETED':
    return <span className="px-2 py-0.5 bg-[rgba(74,222,128,0.15)] text-[#4ade80] text-xs font-medium rounded-full">Completed</span>;
   case 'SCHEDULED':
    return <span className="px-2 py-0.5 bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-xs font-medium rounded-full">Upcoming</span>;
   case 'CANCELLED':
    return <span className="px-2 py-0.5 bg-[rgba(248,113,113,0.15)] text-[#f87171] text-xs font-medium rounded-full">Cancelled</span>;
   default:
    return <span className="px-2 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs font-medium rounded-full">{status}</span>;
  }
 };

 const basePath = window.location.pathname.split('/').slice(0, 2).join('/');
 const cards = [
  { title: 'Total', value: stats.total, icon: <Trophy className="w-5 h-5" />, action: `${basePath}/live` },
  { title: 'Completed', value: stats.completed, icon: <TrendingUp className="w-5 h-5" />, action: `${basePath}/live` },
  { title: 'Upcoming', value: stats.upcoming, icon: <Calendar className="w-5 h-5" />, action: `${basePath}/schedule` },
  { title: 'Departments', value: stats.departments, icon: <Users className="w-5 h-5" />, action: `${basePath}/departments` }
 ];

 const quickActions = [
  { icon: <CalendarPlus className="w-6 h-6 text-[var(--color-accent)]" />, title: 'Schedule Match', path: `${basePath}/schedule` },
  { icon: <Medal className="w-6 h-6 text-[var(--color-accent)]" />, title: 'Match Manager', path: `${basePath}/live` },
  { icon: <Sparkles className="w-6 h-6 text-[var(--color-accent)]" />, title: 'Highlights', path: `${basePath}/highlights` },
  { icon: <Award className="w-6 h-6 text-[var(--color-accent)]" />, title: 'Award Points', path: `${basePath}/points` },
 ];

 if (loading) {
  return (
   <div className="flex justify-center items-center h-64 bg-[var(--bg-primary)]">
    <div className="text-center">
     <div className="w-10 h-10 rounded-full border-2 border-[var(--border-color)] border-t-[var(--color-accent)] mx-auto mb-4 animate-spin"></div>
     <p className="text-[var(--text-secondary)] text-sm">Loading...</p>
    </div>
   </div>
  );
 }

 return (
  <div className="min-h-screen bg-[var(--bg-primary)]">
   <div className="p-6 max-w-6xl mx-auto">
    {/* Header */}
    <div className="mb-8">
     <div className="flex items-center gap-2 mb-1">
      <LayoutDashboard className="w-6 h-6 text-[var(--color-accent)]" />
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
     </div>
     <p className="text-sm text-[var(--text-secondary)] ml-8">Manage matches and events</p>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
     {cards.map((card, idx) => (
      <button
       key={idx}
       onClick={() => navigate(card.action)}
       className="relative bg-[var(--bg-secondary)] rounded-xl p-4 text-left border border-[var(--border-color)] hover:border-[var(--border-color-strong)] transition-colors"
      >
       <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
         {card.icon}
        </div>
       </div>
       <div className="text-2xl font-bold text-[var(--text-primary)]">{card.value}</div>
       <div className="text-xs text-[var(--text-secondary)] font-medium">{card.title}</div>
      </button>
     ))}
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
     {quickActions.map((action, idx) => (
      <button
       key={idx}
       onClick={() => navigate(action.path)}
       className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] hover:border-[var(--border-color-strong)] transition-colors text-left"
      >
       <div className="mb-2">{action.icon}</div>
       <div className="text-sm font-medium text-[var(--text-primary)]">{action.title}</div>
      </button>
     ))}
    </div>

    {/* Recent Matches */}
    <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
     <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
      <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
       <Zap className="w-4 h-4 text-[var(--color-accent)]" />
       Recent Matches
      </h2>
      <button 
       onClick={() => navigate(`${basePath}/live`)}
       className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent)] font-medium flex items-center gap-1"
      >
       View all <ArrowRight className="w-3 h-3" />
      </button>
     </div>

     {recentMatches.length === 0 ? (
      <div className="p-8 text-center">
       <div className="w-12 h-12 bg-[var(--color-accent-subtle)] rounded-xl flex items-center justify-center mx-auto mb-3">
        <Trophy className="w-6 h-6 text-[var(--text-muted)]" />
       </div>
       <p className="text-sm text-[var(--text-secondary)] mb-3">No matches yet</p>
       <button
        onClick={() => navigate(`${basePath}/schedule`)}
        className="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-[var(--bg-primary)] text-sm font-medium rounded-lg transition-colors"
       >
        Create Match
       </button>
      </div>
     ) : (
      <div className="divide-y divide-[var(--border-color)]">
       {recentMatches.map((match, idx) => (
        <div
         key={match._id || idx}
         onClick={() => navigate(`${basePath}/live`)}
         className="p-4 cursor-pointer hover:bg-[var(--bg-primary)] transition-colors"
        >
         <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">
             {match.sport?.replace('_', ' ')}
            </span>
            {getStatusBadge(match.status)}
           </div>
           <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            <span className="font-medium">{match.teamA?.shortCode || 'TBD'}</span>
            <span className="text-[var(--text-muted)]">vs</span>
            <span className="font-medium">{match.teamB?.shortCode || 'TBD'}</span>
           </div>
          </div>
          <div className="text-right">
           <div className="text-xl font-bold text-[var(--text-primary)]">
            {match.scoreA || '-'} vs {match.scoreB || '-'}
           </div>
           <div className="text-xs text-[var(--text-secondary)]">
            {match.venue || 'TBD'}
           </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
         </div>
        </div>
       ))}
      </div>
     )}
    </div>
   </div>
  </div>
 );
};

export default Dashboard;
