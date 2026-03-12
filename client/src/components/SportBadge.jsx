import React from 'react';
import {
    Swords, CircleDot, Goal, Target, Feather, Disc3,
    Hexagon, Crown, Zap, Shield, Hand, GripHorizontal,
    Crosshair, Gamepad2, Circle,
    Timer, Repeat, Waves, Bike, Footprints, Dumbbell,
    Music, Music2, Mic, Camera, Star, Film, Mail,
    Palette, Flower2, LayoutGrid, Sparkles, Pencil, Smile,
    MessageCircle, PenTool, MessageSquare, BookOpen, HelpCircle, Newspaper,
    BarChart2, Heart, MoveRight, MoveUpRight, Video, Megaphone, Drama
} from 'lucide-react';
import { getEntry, SPORT_ALIASES } from '../config/sportsRegistry';

/**
 * Professional sport badge — replaces emoji icons with styled Lucide icons
 * in colored circles for a clean, modern sports-app look.
 * Now powered by centralized sportsRegistry for all ~80 sports/events.
 */

// ── Icon name → Lucide component mapping ──
const ICON_MAP = {
    Swords, CircleDot, Goal, Target, Feather, Disc3, Hexagon, Crown, Zap, Shield,
    Hand, GripHorizontal, Crosshair, Gamepad2, Circle,
    Timer, Repeat, Waves, Bike, Footprints, Dumbbell,
    Music, Music2, Mic, Camera, Star, Film, Mail,
    Palette, Flower2, LayoutGrid, Sparkles, Pencil, Smile,
    MessageCircle, PenTool, MessageSquare, BookOpen, HelpCircle, Newspaper,
    BarChart2, Heart, MoveRight, MoveUpRight, Video, Megaphone, Drama,
    Disc: Disc3, Spade: Shield,
};

// ── Color → Tailwind class mapping (from accentColor hex) ──
const COLOR_MAP = {
    '#22c55e': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
    '#3b82f6': { bg: 'bg-blue-500/15',    text: 'text-blue-400',    ring: 'ring-blue-500/30' },
    '#f97316': { bg: 'bg-orange-500/15',   text: 'text-orange-400',  ring: 'ring-orange-500/30' },
    '#f59e0b': { bg: 'bg-amber-500/15',    text: 'text-amber-400',   ring: 'ring-amber-500/30' },
    '#06b6d4': { bg: 'bg-cyan-500/15',     text: 'text-cyan-400',    ring: 'ring-cyan-500/30' },
    '#ef4444': { bg: 'bg-red-500/15',      text: 'text-red-400',     ring: 'ring-red-500/30' },
    '#eab308': { bg: 'bg-yellow-500/15',   text: 'text-yellow-400',  ring: 'ring-yellow-500/30' },
    '#94a3b8': { bg: 'bg-zinc-400/15',     text: 'text-zinc-300',    ring: 'ring-zinc-400/30' },
    '#14b8a6': { bg: 'bg-teal-500/15',     text: 'text-teal-400',    ring: 'ring-teal-500/30' },
    '#a855f7': { bg: 'bg-purple-500/15',   text: 'text-purple-400',  ring: 'ring-purple-500/30' },
    '#84cc16': { bg: 'bg-lime-500/15',     text: 'text-lime-400',    ring: 'ring-lime-500/30' },
    '#ec4899': { bg: 'bg-pink-500/15',     text: 'text-pink-400',    ring: 'ring-pink-500/30' },
};

const FALLBACK_COLORS = { bg: 'bg-gray-500/15', text: 'text-gray-400', ring: 'ring-gray-500/30' };

/** Resolve a sport ID to its display config */
function resolveSportConfig(sportId) {
    const entry = getEntry(sportId);
    if (!entry) {
        return { icon: Target, abbr: '??', ...FALLBACK_COLORS, accent: '#6b7280' };
    }
    const icon = ICON_MAP[entry.icon] || Target;
    const colors = COLOR_MAP[entry.accentColor] || FALLBACK_COLORS;
    return {
        icon,
        abbr: entry.shortCode,
        ...colors,
        accent: entry.accentColor,
    };
}

// ── Legacy SPORT_CONFIG for any remaining direct imports ──
const SPORT_CONFIG = new Proxy({}, {
    get(_, prop) {
        return resolveSportConfig(prop);
    }
});

const SIZES = {
    xs: { container: 'w-6 h-6', icon: 'w-3 h-3', font: 'text-[8px]' },
    sm: { container: 'w-8 h-8', icon: 'w-3.5 h-3.5', font: 'text-[9px]' },
    md: { container: 'w-10 h-10', icon: 'w-4 h-4', font: 'text-[10px]' },
    lg: { container: 'w-12 h-12', icon: 'w-5 h-5', font: 'text-xs' },
    xl: { container: 'w-14 h-14', icon: 'w-6 h-6', font: 'text-sm' },
};

const SportBadge = ({ sport, size = 'md', showLabel = false, className = '' }) => {
    const config = resolveSportConfig(sport);
    const sizeConfig = SIZES[size] || SIZES.md;
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <div className={`${sizeConfig.container} ${config.bg} ${config.text} ring-1 ${config.ring} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={sizeConfig.icon} strokeWidth={2.5} />
            </div>
            {showLabel && (
                <span className={`${sizeConfig.font} font-bold ${config.text} uppercase tracking-wider`}>
                    {getEntry(sport)?.label || sport?.replace(/_/g, ' ')}
                </span>
            )}
        </div>
    );
};

/** Inline text badge — for use in headers / tags */
export const SportTag = ({ sport, className = '' }) => {
    const config = resolveSportConfig(sport);
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text} ring-1 ${config.ring} ${className}`}>
            {config.abbr} · {getEntry(sport)?.label || sport?.replace(/_/g, ' ')}
        </span>
    );
};

/** Get accent color for a sport (for dynamic inline styles) */
export const getSportAccent = (sport) => resolveSportConfig(sport).accent;

/** Get full config for a sport */
export const getSportConfig = (sport) => resolveSportConfig(sport);

export default SportBadge;
