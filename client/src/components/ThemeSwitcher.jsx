import React from 'react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { Sun, Moon, Sparkles } from 'lucide-react';

const THEME_ICONS = {
  shashwatam: Sparkles,
  dark: Moon,
  light: Sun,
};

const ThemeSwitcher = ({ compact = false }) => {
  const { themeKey, setTheme, cycleTheme } = useTheme();

  if (compact) {
    const Icon = THEME_ICONS[themeKey] || Sparkles;
    return (
      <button
        onClick={cycleTheme}
        className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          color: 'var(--color-accent)',
        }}
        title={`Current: ${THEMES[themeKey].label} — Click to switch`}
        aria-label="Toggle theme"
      >
        <Icon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div
      className="flex rounded-xl overflow-hidden"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
      }}
    >
      {Object.entries(THEMES).map(([key, t]) => {
        const Icon = THEME_ICONS[key] || Sparkles;
        const isActive = themeKey === key;
        return (
          <button
            key={key}
            onClick={() => setTheme(key)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-200"
            style={{
              background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
              color: isActive ? 'var(--color-accent)' : 'var(--text-muted)',
            }}
            title={t.description}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSwitcher;
