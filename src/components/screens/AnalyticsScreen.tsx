import React, { useState } from 'react';

interface AnalyticsScreenProps {
  onOpenQuickAdd: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ onOpenQuickAdd }) => {
  const [period, setPeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');
  const [selectedMonth, setSelectedMonth] = useState('October 2024');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const categories = [
    {
      name: 'Food & Dining',
      percent: 32,
      amount: 10176,
      color: '#4edea3',
      icon: 'restaurant',
      badgeClass: 'bg-[#4edea3]/20 text-[#4edea3]',
    },
    {
      name: 'Housing & Utilities',
      percent: 26,
      amount: 8268,
      color: '#6366f1',
      icon: 'home',
      badgeClass: 'bg-[#6366f1]/20 text-[#c0c1ff]',
    },
    {
      name: 'Shopping & Lifestyle',
      percent: 17,
      amount: 5406,
      color: '#dfe2f1',
      icon: 'shopping_bag',
      badgeClass: 'bg-white/10 text-white',
    },
    {
      name: 'Transportation',
      percent: 13,
      amount: 4134,
      color: '#f59e0b',
      icon: 'directions_car',
      badgeClass: 'bg-amber-500/20 text-amber-400',
    },
    {
      name: 'Entertainment',
      percent: 12,
      amount: 3900,
      color: '#ff7886',
      icon: 'sports_esports',
      badgeClass: 'bg-[#ff7886]/20 text-[#ff7886]',
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-28 pt-2 space-y-4">
      {/* Period Segmented Switcher (Day, Week, Month, Year) */}
      <div className="bg-[#171b26] p-1 rounded-full flex items-center justify-between border border-white/[0.04]">
        {(['Day', 'Week', 'Month', 'Year'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setPeriod(tab)}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold text-center transition-all ${
              period === tab
                ? 'bg-[#10b981] text-[#002113] shadow-md'
                : 'text-[#bbcabf] hover:text-[#dfe2f1]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={() => setSelectedMonth('September 2024')}
          className="w-8 h-8 rounded-full bg-[#1c1f2a] hover:bg-[#262a35] text-[#dfe2f1] flex items-center justify-center transition-colors"
          aria-label="Previous month"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        <div className="flex items-center gap-1.5 text-sm font-semibold text-[#dfe2f1]">
          <span className="material-symbols-outlined text-[16px] text-[#4edea3]">calendar_month</span>
          <span>{selectedMonth}</span>
        </div>

        <button
          onClick={() => setSelectedMonth('November 2024')}
          className="w-8 h-8 rounded-full bg-[#1c1f2a] hover:bg-[#262a35] text-[#dfe2f1] flex items-center justify-center transition-colors"
          aria-label="Next month"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>

      {/* Total Spent Hero Card */}
      <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
            TOTAL SPENT
          </span>
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#10b981]/15 text-[#4edea3] text-xs font-semibold">
            <span className="material-symbols-outlined text-[14px]">trending_down</span>
            <span>12% less than last month</span>
          </span>
        </div>

        <div className="font-mono text-3xl font-bold tracking-tight text-[#dfe2f1]">
          ₹31,800
        </div>

        <div className="flex items-center justify-between text-xs text-[#bbcabf] pt-1">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
            <span>Daily average: ₹1,060</span>
          </div>
          <div className="flex items-center gap-1 text-[#4edea3]">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span>On track for budget</span>
          </div>
        </div>
      </div>

      {/* Spending Allocation Donut & Breakdown */}
      <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#10b981]/15 text-[#4edea3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">donut_large</span>
            </div>
            <span className="text-sm font-semibold text-[#dfe2f1]">Spending Allocation</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#bbcabf]">
            5 CATEGORIES
          </span>
        </div>

        {/* Multi-segment Donut Chart */}
        <div className="relative flex items-center justify-center py-2">
          <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#171b26"
              strokeWidth="10"
            />
            {/* Segment 1: Food 32% (stroke-dasharray circumference = 2 * PI * 38 ≈ 238.76) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#4edea3"
              strokeWidth="10"
              strokeDasharray="76.4 238.8"
              strokeDashoffset="0"
              className="cursor-pointer transition-all hover:stroke-width-12"
              onMouseEnter={() => setHoveredCategory('Food & Dining')}
            />
            {/* Segment 2: Housing 26% */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#6366f1"
              strokeWidth="10"
              strokeDasharray="62.1 238.8"
              strokeDashoffset="-76.4"
              className="cursor-pointer transition-all hover:stroke-width-12"
              onMouseEnter={() => setHoveredCategory('Housing & Utilities')}
            />
            {/* Segment 3: Shopping 17% */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#dfe2f1"
              strokeWidth="10"
              strokeDasharray="40.6 238.8"
              strokeDashoffset="-138.5"
              className="cursor-pointer transition-all hover:stroke-width-12"
              onMouseEnter={() => setHoveredCategory('Shopping & Lifestyle')}
            />
            {/* Segment 4: Transportation 13% */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="10"
              strokeDasharray="31.0 238.8"
              strokeDashoffset="-179.1"
              className="cursor-pointer transition-all hover:stroke-width-12"
              onMouseEnter={() => setHoveredCategory('Transportation')}
            />
            {/* Segment 5: Entertainment 12% */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#ff7886"
              strokeWidth="10"
              strokeDasharray="28.6 238.8"
              strokeDashoffset="-210.1"
              className="cursor-pointer transition-all hover:stroke-width-12"
              onMouseEnter={() => setHoveredCategory('Entertainment')}
            />
          </svg>

          {/* Center Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#bbcabf]">
              TOP CATEGORY
            </span>
            <span className="text-sm font-bold text-[#dfe2f1] max-w-[100px] leading-tight mt-0.5">
              {hoveredCategory || 'Food & Dining'}
            </span>
            <span className="text-xs font-mono font-bold text-[#4edea3] mt-0.5">
              32%
            </span>
          </div>
        </div>

        {/* Categories List Breakdown */}
        <div className="space-y-3 pt-2">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="space-y-1.5 cursor-pointer group"
              onMouseEnter={() => setHoveredCategory(cat.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {cat.icon}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#dfe2f1] group-hover:text-white transition-colors">
                      {cat.name}
                    </div>
                    <div className="text-[10px] text-[#bbcabf]">
                      {cat.percent}% of monthly total
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-xs font-semibold text-[#dfe2f1]">
                  ₹{cat.amount.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-[#0f131d] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.percent}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spending Velocity Area Curve */}
      <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-lg space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold text-[#dfe2f1]">
              Spending Velocity
            </div>
            <div className="text-[11px] text-[#bbcabf]">
              Cumulative October vs. September
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1 text-[#4edea3]">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span>Oct</span>
            </div>
            <div className="flex items-center gap-1 text-[#bbcabf]">
              <span className="w-3 border-b border-dashed border-[#bbcabf]" />
              <span>Sep</span>
            </div>
          </div>
        </div>

        {/* Dynamic Velocity SVG Chart */}
        <div className="h-32 w-full pt-3 relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 320 90" preserveAspectRatio="none">
            <defs>
              <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="20" x2="320" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1="0" y1="55" x2="320" y2="55" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1="0" y1="85" x2="320" y2="85" stroke="rgba(255,255,255,0.08)" />

            {/* September (Dashed Baseline) */}
            <path
              d="M0 80 Q 80 70 160 55 T 320 25"
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* October Area Fill */}
            <path
              d="M0 80 Q 90 75 160 62 T 250 30 L 250 85 L 0 85 Z"
              fill="url(#emeraldGrad)"
            />

            {/* October Main Line */}
            <path
              d="M0 80 Q 90 75 160 62 T 250 30"
              fill="none"
              stroke="#4edea3"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Today Glowing Node */}
            <circle cx="250" cy="30" r="5" fill="#10b981" className="filter drop-shadow-[0_0_8px_rgba(78,222,163,0.8)]" />
            <circle cx="250" cy="30" r="2" fill="#ffffff" />
          </svg>

          {/* X Axis Labels */}
          <div className="flex items-center justify-between text-[10px] text-[#bbcabf] font-mono pt-1">
            <span>Oct 1</span>
            <span>Oct 8</span>
            <span>Oct 15</span>
            <span>Oct 22</span>
            <span className="text-[#4edea3] font-bold">Today (28)</span>
            <span>Oct 31</span>
          </div>
        </div>
      </div>

      {/* Top Merchants */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">
              storefront
            </span>
            <span className="text-sm font-bold text-[#dfe2f1]">Top Merchants</span>
          </div>
          <button className="text-xs font-semibold text-[#4edea3] hover:underline">
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Merchant 1 */}
          <div className="p-3 rounded-xl bg-[#1c1f2a] border border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#10b981]/20 text-[#4edea3] text-[11px] font-bold flex items-center justify-center">
                1
              </div>
              <div>
                <div className="text-xs font-semibold text-[#dfe2f1] truncate max-w-[85px]">
                  Whole Foods
                </div>
                <div className="text-[10px] text-[#bbcabf]">6 transactions</div>
              </div>
            </div>
            <div className="font-mono text-xs font-bold text-[#4edea3]">
              ₹4,800
            </div>
          </div>

          {/* Merchant 2 */}
          <div className="p-3 rounded-xl bg-[#1c1f2a] border border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#6366f1]/20 text-[#c0c1ff] text-[11px] font-bold flex items-center justify-center">
                2
              </div>
              <div>
                <div className="text-xs font-semibold text-[#dfe2f1] truncate max-w-[85px]">
                  Amazon
                </div>
                <div className="text-[10px] text-[#bbcabf]">4 orders</div>
              </div>
            </div>
            <div className="font-mono text-xs font-bold text-[#dfe2f1]">
              ₹3,100
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
