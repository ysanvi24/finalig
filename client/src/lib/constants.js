// Shared constants used across the app — single source of truth
import { MATCH_SPORTS, getMatchSportIds, getSportShortCode, getSportAccentColor } from '../config/sportsRegistry';

// Professional sport abbreviations (derived from registry, backward compat)
export const SPORT_ICONS = Object.fromEntries(
    MATCH_SPORTS.map(s => [s.id, s.shortCode])
);

export const SPORTS = getMatchSportIds();

export const STATUS_CONFIG = {
    SCHEDULED: { label: 'Upcoming', color: 'bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border-[rgba(251,191,36,0.3)]', dot: 'bg-[#fbbf24]' },
    COMPLETED: { label: 'Completed', color: 'bg-[rgba(74,222,128,0.15)] text-[#4ade80] border-[rgba(74,222,128,0.3)]', dot: 'bg-[#4ade80]' },
    CANCELLED: { label: 'Cancelled', color: 'bg-[rgba(248,113,113,0.15)] text-[#f87171] border-[rgba(248,113,113,0.3)]', dot: 'bg-[#f87171]' }
};

// Sport colors - now derived from registry accent colors
export const SPORT_COLORS = Object.fromEntries(
    MATCH_SPORTS.map(s => [s.id, {
        accent: s.accentColor,
        bg: `bg-[${s.accentColor}]/15`,
        text: `text-[${s.accentColor}]`
    }])
);

export const MATCH_CATEGORIES = [
    { label: 'Regular', value: 'REGULAR' },
    { label: 'Group Stage', value: 'GROUP_STAGE' },
    { label: 'Quarter Final', value: 'QUARTER_FINAL' },
    { label: 'Semi Final', value: 'SEMIFINAL' },
    { label: 'Final', value: 'FINAL' }
];

export const getTeamName = (team) => team?.shortCode || team?.name || 'TBD';
export const getTeamFullName = (team) => team?.name || team?.shortCode || 'TBD';

export const isWinnerTeam = (match, team) => {
    if (!match?.winner || !team) return false;
    const winnerId = match.winner._id || match.winner;
    return winnerId === team._id;
};

export const formatMatchDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const today = now.toDateString();
    const tomorrow = new Date(now.getTime() + 86400000).toDateString();
    const yesterday = new Date(now.getTime() - 86400000).toDateString();
    if (d.toDateString() === today) return 'Today';
    if (d.toDateString() === tomorrow) return 'Tomorrow';
    if (d.toDateString() === yesterday) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const formatMatchTime = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL?.replace('/api', '') || '';
};

// Category colors for point history
export const CATEGORY_COLORS = {
    Sports: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    Cultural: { bg: 'bg-violet-500/15', text: 'text-violet-400', dot: 'bg-violet-400' },
    Literary: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
    Technical: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', dot: 'bg-cyan-400' },
    Arts: { bg: 'bg-pink-500/15', text: 'text-pink-400', dot: 'bg-pink-400' },
    Other: { bg: 'bg-gray-500/15', text: 'text-gray-400', dot: 'bg-gray-400' },
};
