import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import api from '../api/axios';
import socket from '../socket';

const Leaderboard = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await api.get('/leaderboard');
            const items = data.data || data || [];
            // Sort by total points descending
            const sorted = (Array.isArray(items) ? items : []).sort((a, b) => (b.totalPoints || b.points || 0) - (a.totalPoints || a.points || 0));
            setTeams(sorted);
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    useEffect(() => {
        const handler = () => fetchLeaderboard();
        socket.on('pointsAwarded', handler);
        socket.on('leaderboardReset', handler);
        socket.on('leaderboardUpdate', handler);
        return () => {
            socket.off('pointsAwarded', handler);
            socket.off('leaderboardReset', handler);
            socket.off('leaderboardUpdate', handler);
        };
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
        if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-slate-500">{index + 1}</span>;
    };

    const getRankBg = (index) => {
        if (index === 0) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 border-yellow-200 dark:border-yellow-800';
        if (index === 1) return 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/30 border-slate-200 dark:border-slate-700';
        if (index === 2) return 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-200 dark:border-amber-800';
        return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Leaderboard</h1>
                <p className="text-slate-500 dark:text-slate-400">Institute Gathering — Current Standings</p>
            </div>

            <div className="space-y-3">
                {teams.map((team, index) => (
                    <motion.div
                        key={team._id || team.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-4 rounded-xl border ${getRankBg(index)}`}
                    >
                        <div className="flex items-center gap-4">
                            {getRankIcon(index)}
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">{team.name}</h3>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {team.totalPoints ?? team.points ?? 0}
                            </p>
                            <p className="text-xs text-slate-500">points</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {teams.length === 0 && (
                <p className="text-center text-slate-500 py-12">No teams on the leaderboard yet.</p>
            )}
        </div>
    );
};

export default Leaderboard;
