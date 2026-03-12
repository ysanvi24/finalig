import React from 'react';
import { getEntry, EVENT_CATEGORIES } from '../config/sportsRegistry';
import {
    Timer, Target, Waves, Bike, Brain, Palette, BookOpen, Sparkles,
    Drama, Music, Crown, Dumbbell, Heart, Camera, Film, Zap
} from 'lucide-react';

// Category icon map
const CAT_ICON_MAP = {
    Timer, Target, Waves, Bike, Brain, Drama, Palette, BookOpen, Sparkles,
};

const CAT_COLORS = {
    ATHLETICS_TRACK: { bg: 'bg-red-500/15',    text: 'text-red-400',    ring: 'ring-red-500/30' },
    ATHLETICS_FIELD: { bg: 'bg-orange-500/15',  text: 'text-orange-400', ring: 'ring-orange-500/30' },
    AQUATICS:        { bg: 'bg-cyan-500/15',    text: 'text-cyan-400',   ring: 'ring-cyan-500/30' },
    ENDURANCE:       { bg: 'bg-amber-500/15',   text: 'text-amber-400',  ring: 'ring-amber-500/30' },
    INDOOR:          { bg: 'bg-purple-500/15',  text: 'text-purple-400', ring: 'ring-purple-500/30' },
    CULTURAL:        { bg: 'bg-pink-500/15',    text: 'text-pink-400',   ring: 'ring-pink-500/30' },
    ART:             { bg: 'bg-orange-500/15',  text: 'text-orange-400', ring: 'ring-orange-500/30' },
    LITERARY:        { bg: 'bg-blue-500/15',    text: 'text-blue-400',   ring: 'ring-blue-500/30' },
    OTHER:           { bg: 'bg-emerald-500/15', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
};

const FALLBACK = { bg: 'bg-gray-500/15', text: 'text-gray-400', ring: 'ring-gray-500/30' };

/** Category badge — shows category name with colored icon */
const EventBadge = ({ category, size = 'md', className = '' }) => {
    const catInfo = EVENT_CATEGORIES.find(c => c.id === category);
    const colors = CAT_COLORS[category] || FALLBACK;
    const Icon = CAT_ICON_MAP[catInfo?.icon] || Sparkles;
    
    const sizes = {
        sm: { container: 'w-7 h-7', icon: 'w-3.5 h-3.5', font: 'text-[9px]' },
        md: { container: 'w-9 h-9', icon: 'w-4 h-4', font: 'text-[10px]' },
        lg: { container: 'w-11 h-11', icon: 'w-5 h-5', font: 'text-xs' },
    };
    const s = sizes[size] || sizes.md;

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <div className={`${s.container} ${colors.bg} ${colors.text} ring-1 ${colors.ring} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={s.icon} strokeWidth={2.5} />
            </div>
        </div>
    );
};

/** Category tag — inline pill */
export const EventCategoryTag = ({ category, className = '' }) => {
    const catInfo = EVENT_CATEGORIES.find(c => c.id === category);
    const colors = CAT_COLORS[category] || FALLBACK;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text} ring-1 ${colors.ring} ${className}`}>
            {catInfo?.label || category}
        </span>
    );
};

export default EventBadge;
