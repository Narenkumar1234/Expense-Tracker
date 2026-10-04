import React, { useState } from 'react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface ThemeSwitcherProps {
  variant?: 'compact' | 'segmented';
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ variant = 'compact' }) => {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (variant === 'segmented') {
    return (
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#171b26] rounded-xl border border-white/[0.04]">
        <button
          type="button"
          onClick={() => setThemeMode('dark')}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            themeMode === 'dark'
              ? 'bg-[#10b981] text-[#002113] shadow-md font-bold'
              : 'text-[#bbcabf] hover:text-[#dfe2f1]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">dark_mode</span>
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setThemeMode('light')}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            themeMode === 'light'
              ? 'bg-[#10b981] text-[#002113] shadow-md font-bold'
              : 'text-[#bbcabf] hover:text-[#dfe2f1]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">light_mode</span>
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setThemeMode('system')}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            themeMode === 'system'
              ? 'bg-[#10b981] text-[#002113] shadow-md font-bold'
              : 'text-[#bbcabf] hover:text-[#dfe2f1]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">devices</span>
          <span>System</span>
        </button>
      </div>
    );
  }

  // Compact variant for Header
  const getIcon = () => {
    if (themeMode === 'system') return 'devices';
    return themeMode === 'light' ? 'light_mode' : 'dark_mode';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-full text-[#bbcabf] hover:text-[#dfe2f1] hover:bg-white/5 transition-colors focus:outline-none"
        aria-label="Switch theme mode"
        title={`Theme: ${themeMode} (${resolvedTheme} active)`}
      >
        <span className="material-symbols-outlined text-[20px] transition-transform hover:scale-110">
          {getIcon()}
        </span>
      </button>

      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#171b26] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#bbcabf]">
              Appearance
            </div>
            {[
              { id: 'dark' as ThemeMode, label: 'Dark', icon: 'dark_mode' },
              { id: 'light' as ThemeMode, label: 'Light', icon: 'light_mode' },
              { id: 'system' as ThemeMode, label: 'Default OS', icon: 'devices' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setThemeMode(item.id);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                  themeMode === item.id
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-[#4edea3] font-bold'
                    : 'text-slate-800 dark:text-[#dfe2f1] hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {themeMode === item.id && (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
