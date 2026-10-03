import React, { useState } from 'react';
import { BudgetItem, SavingsGoal } from '../../types';

interface BudgetsScreenProps {
  budgets: BudgetItem[];
  savingsGoals: SavingsGoal[];
  onOpenCreateBudget: () => void;
  onOpenSavingsGoalModal?: (goal: SavingsGoal) => void;
}

export const BudgetsScreen: React.FC<BudgetsScreenProps> = ({
  budgets,
  savingsGoals,
  onOpenCreateBudget,
  onOpenSavingsGoalModal,
}) => {
  const [activeTab, setActiveTab] = useState<'Monthly' | 'Goals'>('Monthly');

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-28 pt-2 space-y-4">
      {/* Cycle Period Header with Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#bbcabf] block">
            CYCLE PERIOD
          </span>
          <div className="flex items-center gap-1.5 text-base font-bold text-[#dfe2f1]">
            <span>October 2024</span>
            <span className="material-symbols-outlined text-[16px] text-[#4edea3]">calendar_month</span>
          </div>
        </div>

        {/* Monthly vs Goals toggle */}
        <div className="bg-[#171b26] p-1 rounded-full flex items-center border border-white/[0.04]">
          <button
            onClick={() => setActiveTab('Monthly')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'Monthly'
                ? 'bg-[#10b981] text-[#002113] shadow-md'
                : 'text-[#bbcabf] hover:text-[#dfe2f1]'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setActiveTab('Goals')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'Goals'
                ? 'bg-[#10b981] text-[#002113] shadow-md'
                : 'text-[#bbcabf] hover:text-[#dfe2f1]'
            }`}
          >
            Goals
          </button>
        </div>
      </div>

      {/* Total Monthly Budget Card */}
      <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#bbcabf]">
            Total Monthly Budget
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#4edea3] text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span>ON TRACK</span>
          </span>
        </div>

        <div className="font-mono text-3xl font-bold tracking-tight text-[#dfe2f1]">
          ₹45,000
        </div>

        {/* Donut progress ring & Safe daily spend */}
        <div className="grid grid-cols-2 gap-4 items-center pt-1 pb-1">
          {/* Circular Gauge */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#0f131d]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#4edea3]"
                strokeDasharray="70, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base font-bold font-mono text-[#dfe2f1]">70%</span>
              <span className="text-[10px] text-[#bbcabf]">Spent</span>
            </div>
          </div>

          {/* Spent So far and Safe daily spend */}
          <div className="space-y-3">
            <div>
              <div className="text-[11px] text-[#bbcabf]">Spent So Far</div>
              <div className="text-sm font-bold font-mono text-[#dfe2f1]">
                ₹31,800.50
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0f131d]/60 border border-white/[0.04]">
              <div className="flex items-center gap-1.5 text-[11px] text-[#bbcabf]">
                <span className="material-symbols-outlined text-[15px] text-[#4edea3]">
                  speed
                </span>
                <span>Safe Daily Spend</span>
              </div>
              <div className="text-base font-bold font-mono text-[#4edea3] mt-0.5">
                ₹824.00
              </div>
            </div>
          </div>
        </div>

        {/* Footer indicators */}
        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#bbcabf]">
            <span className="material-symbols-outlined text-[15px] text-[#4edea3]">
              check_circle
            </span>
            <span>16 days remaining in cycle</span>
          </div>
          <span className="text-[#ff7886] font-semibold text-[11px]">
            1 Alert Active
          </span>
        </div>
      </div>

      {/* Active Budgets Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#dfe2f1]">Active Budgets</span>
            <span className="px-2 py-0.2 rounded-full bg-[#171b26] text-[#bbcabf] text-[11px] font-bold">
              {budgets.length}
            </span>
          </div>
          <button className="text-xs font-semibold text-[#4edea3] hover:underline flex items-center gap-0.5">
            <span>Manage</span>
            <span className="material-symbols-outlined text-[15px]">chevron_right</span>
          </button>
        </div>

        {/* Budget list */}
        <div className="space-y-2.5">
          {budgets.map((b) => {
            const percent = Math.round((b.spent / b.allocated) * 100);
            const isExceeded = percent > 100;
            const isWarning = percent >= 80 && percent <= 100;

            return (
              <div
                key={b.id}
                className={`p-3.5 rounded-xl transition-all shadow-sm ${
                  isExceeded
                    ? 'bg-[#1c1f2a] border border-[#f43f5e] shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                    : 'bg-[#1c1f2a] border border-white/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isExceeded
                          ? 'bg-[#f43f5e]/15 text-[#f43f5e]'
                          : isWarning
                          ? 'bg-[#ff7886]/15 text-[#ff7886]'
                          : 'bg-[#10b981]/15 text-[#4edea3]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {b.icon}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-[#dfe2f1]">
                        {b.name}
                      </div>
                      <div className="text-[11px] text-[#bbcabf]">
                        {percent}% {isExceeded ? 'Exceeded' : 'utilized'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="text-[#dfe2f1] font-bold">₹{b.spent.toLocaleString('en-IN')}</span>
                    <span className="text-[#bbcabf] font-normal"> / ₹{b.allocated.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-[#0f131d] mt-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isExceeded
                        ? 'bg-[#f43f5e]'
                        : isWarning
                        ? 'bg-[#ff7886]'
                        : 'bg-[#4edea3]'
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                {/* Sub status row */}
                <div className="flex items-center gap-1.5 text-[11px] mt-2">
                  {isExceeded ? (
                    <span className="text-[#f43f5e] flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[13px]">warning</span>
                      <span>Over budget by ₹{(b.spent - b.allocated).toLocaleString('en-IN')}</span>
                    </span>
                  ) : isWarning ? (
                    <span className="text-[#ff7886] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">warning</span>
                      <span>{b.statusText}</span>
                    </span>
                  ) : (
                    <span className="text-[#4edea3] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      <span>{b.statusText}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create New Budget Button */}
        <button
          onClick={onOpenCreateBudget}
          className="w-full py-3 rounded-xl bg-[#171b26] hover:bg-[#262a35] border border-white/[0.08] text-sm font-semibold text-[#4edea3] flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Create New Budget</span>
        </button>
      </div>

      {/* Savings Goals Section */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#dfe2f1]">Savings Goals</span>
            <span className="px-2 py-0.2 rounded-full bg-[#3131c0]/20 text-[#c0c1ff] text-[11px] font-bold">
              {savingsGoals.length} Active
            </span>
          </div>
          <button className="text-xs font-semibold text-[#4edea3] hover:underline flex items-center gap-0.5">
            <span>View All</span>
            <span className="material-symbols-outlined text-[15px]">chevron_right</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Goal 1: Emergency Fund */}
          <div className="p-4 rounded-xl bg-[#1c1f2a] border border-white/[0.04] space-y-2.5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/15 text-[#4edea3] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">shield</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#dfe2f1]">Emergency Fund</span>
                    <span className="px-1.5 py-0.2 rounded bg-white/5 text-[#4edea3] text-[9px] font-bold">
                      Tier 1
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-[#10b981]/20 text-[#4edea3] text-[9px] font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[11px]">flag</span>
                      Milestone
                    </span>
                  </div>
                  <div className="text-[11px] text-[#bbcabf] mt-0.5">
                    Target: Dec 2024
                  </div>
                </div>
              </div>

              <span className="text-sm font-mono font-bold text-[#4edea3]">
                84%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-[#0f131d] overflow-hidden">
              <div
                className="h-full bg-[#4edea3] rounded-full"
                style={{ width: '84%' }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#bbcabf]">
              <span className="font-mono">Remaining: ₹16,000</span>
              <span className="text-[#4edea3] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                On Track (+2mo ahead)
              </span>
            </div>
          </div>

          {/* Goal 2: Japan Vacation */}
          <div className="p-4 rounded-xl bg-[#1c1f2a] border border-white/[0.04] space-y-2.5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3131c0]/20 text-[#c0c1ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">flight</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#dfe2f1]">Japan Vacation</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#3131c0]/30 text-[#c0c1ff] text-[9px] font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[11px]">sync</span>
                      Auto-save
                    </span>
                  </div>
                  <div className="text-[11px] text-[#bbcabf] mt-0.5">
                    Kyoto & Tokyo Trip
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="font-mono text-base font-bold text-[#dfe2f1]">₹21,500</span>
                <span className="font-mono text-xs text-[#bbcabf]"> of ₹35,000</span>
              </div>
              <span className="font-mono font-bold text-[#c0c1ff]">61%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-[#0f131d] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6366f1] to-[#c0c1ff] rounded-full"
                style={{ width: '61%' }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#bbcabf]">
              <span>Automatic deposit: <strong className="text-[#dfe2f1] font-mono">₹3,000/mo</strong></span>
              <span>5 months left</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
