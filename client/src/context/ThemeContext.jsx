import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = {
  shashwatam: {
    key: 'shashwatam',
    label: 'शाश्वतम्',
    description: 'Royal Purple & Gold',
    // Backgrounds – richer, warmer purple with depth
    bgPrimary: '#110a28',
    bgSecondary: '#1a1040',
    bgTertiary: '#241558',
    bgCard: 'rgba(36, 21, 88, 0.8)',
    // Accent – vivid, warm gold with high luminosity
    accent: '#f5c518',
    accentHover: '#ffe14d',
    accentLight: '#fff8dc',
    accentSubtle: 'rgba(245, 197, 24, 0.15)',
    accentDark: '#d4a810',
    // Text – high contrast, crisp readability
    textPrimary: '#ffffff',
    textSecondary: '#e0d4f5',
    textMuted: 'rgba(245, 197, 24, 0.7)',
    textBright: '#ffffff',
    // Borders – clearly visible
    borderDefault: 'rgba(245, 197, 24, 0.28)',
    borderStrong: 'rgba(245, 197, 24, 0.5)',
    // Gradient
    goldGradient: 'linear-gradient(135deg, #d4a810, #f5c518, #ffe14d, #f5c518, #d4a810)',
    // Rank colors
    rank1: 'from-amber-400 to-amber-600',
    rank2: 'from-slate-300 to-slate-400',
    rank3: 'from-orange-400 to-orange-600',
    // Glow
    glowColor: 'rgba(245, 197, 24, 0.3)',
    navBg: 'rgba(17, 10, 40, 0.97)',
  },
  dark: {
    key: 'dark',
    label: 'Dark Mode',
    description: 'Neon Glow',
    bgPrimary: '#0a0a0f',
    bgSecondary: '#111118',
    bgTertiary: '#1a1a24',
    bgCard: 'rgba(26, 26, 36, 0.85)',
    accent: '#00e5ff',
    accentHover: '#40efff',
    accentLight: '#b2f5ff',
    accentSubtle: 'rgba(0, 229, 255, 0.12)',
    accentDark: '#00b0c7',
    textPrimary: '#e0e0e8',
    textSecondary: '#9e9eb0',
    textMuted: 'rgba(0, 229, 255, 0.5)',
    textBright: '#ffffff',
    borderDefault: 'rgba(0, 229, 255, 0.18)',
    borderStrong: 'rgba(0, 229, 255, 0.35)',
    goldGradient: 'linear-gradient(135deg, #00b0c7, #00e5ff, #40efff, #00e5ff, #00b0c7)',
    rank1: 'from-yellow-400 to-yellow-600',
    rank2: 'from-slate-300 to-slate-400',
    rank3: 'from-orange-400 to-orange-600',
    glowColor: 'rgba(0, 229, 255, 0.25)',
    navBg: 'rgba(10, 10, 15, 0.95)',
  },
  light: {
    key: 'light',
    label: 'Light Mode',
    description: 'Clean & Crisp',
    bgPrimary: '#f8f7f4',
    bgSecondary: '#ffffff',
    bgTertiary: '#f0ece4',
    bgCard: 'rgba(255, 255, 255, 0.9)',
    accent: '#7c3aed',
    accentHover: '#6d28d9',
    accentLight: '#ede9fe',
    accentSubtle: 'rgba(124, 58, 237, 0.08)',
    accentDark: '#5b21b6',
    textPrimary: '#1e1b2e',
    textSecondary: '#4a4560',
    textMuted: 'rgba(124, 58, 237, 0.55)',
    textBright: '#1e1b2e',
    borderDefault: 'rgba(124, 58, 237, 0.15)',
    borderStrong: 'rgba(124, 58, 237, 0.3)',
    goldGradient: 'linear-gradient(135deg, #5b21b6, #7c3aed, #a78bfa, #7c3aed, #5b21b6)',
    rank1: 'from-amber-400 to-amber-600',
    rank2: 'from-slate-300 to-slate-400',
    rank3: 'from-orange-400 to-orange-600',
    glowColor: 'rgba(124, 58, 237, 0.12)',
    navBg: 'rgba(248, 247, 244, 0.95)',
  }
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider = ({ children }) => {
  const [themeKey, setThemeKey] = useState(() => {
    return localStorage.getItem('ig-theme') || 'shashwatam';
  });

  const theme = THEMES[themeKey] || THEMES.shashwatam;

  useEffect(() => {
    localStorage.setItem('ig-theme', themeKey);
    // Apply CSS custom properties to root
    const root = document.documentElement;
    root.setAttribute('data-theme-mode', themeKey);

    root.style.setProperty('--bg-primary', theme.bgPrimary);
    root.style.setProperty('--bg-secondary', theme.bgSecondary);
    root.style.setProperty('--bg-tertiary', theme.bgTertiary);
    root.style.setProperty('--bg-card', theme.bgCard);

    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-accent-hover', theme.accentHover);
    root.style.setProperty('--color-accent-light', theme.accentLight);
    root.style.setProperty('--color-accent-subtle', theme.accentSubtle);
    root.style.setProperty('--color-accent-dark', theme.accentDark);

    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    root.style.setProperty('--text-muted', theme.textMuted);
    root.style.setProperty('--text-bright', theme.textBright);

    root.style.setProperty('--border-color', theme.borderDefault);
    root.style.setProperty('--border-color-strong', theme.borderStrong);

    root.style.setProperty('--gold-gradient', theme.goldGradient);
    root.style.setProperty('--glow-color', theme.glowColor);
    root.style.setProperty('--nav-bg', theme.navBg);
  }, [themeKey, theme]);

  const setTheme = (key) => {
    if (THEMES[key]) setThemeKey(key);
  };

  const cycleTheme = () => {
    const keys = Object.keys(THEMES);
    const idx = keys.indexOf(themeKey);
    setThemeKey(keys[(idx + 1) % keys.length]);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeKey, setTheme, cycleTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
