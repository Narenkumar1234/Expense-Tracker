import React, { useState } from 'react';
import { BudgetItem } from '../../types';

interface CreateBudgetModalProps {
  onClose: () => void;
  onSaveBudget: (budget: BudgetItem) => void;
}

export const CreateBudgetModal: React.FC<CreateBudgetModalProps> = ({
  onClose,
  onSaveBudget,
}) => {
  const [name, setName] = useState('');
  const [allocated, setAllocated] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('fitness_center');

  const icons = [
    { icon: 'fitness_center', label: 'Fitness' },
    { icon: 'flight', label: 'Travel' },
    { icon: 'subscriptions', label: 'Media' },
    { icon: 'redeem', label: 'Gifts' },
    { icon: 'local_cafe', label: 'Coffee' },
    { icon: 'school', label: 'Learning' },
    { icon: 'pets', label: 'Pets' },
    { icon: 'healing', label: 'Wellness' },
  ];

  const handleSave = () => {
    const amount = parseInt(allocated.replace(/\D/g, ''), 10) || 5000;
    const newBudget: BudgetItem = {
      id: 'b-' + Date.now(),
      name: name.trim() || 'Custom Budget',
      category: 'CUSTOM',
      allocated: amount,
      spent: 0,
      statusText: 'New budget period',
      statusType: 'normal',
      icon: selectedIcon,
      color: '#4edea3',
    };

    onSaveBudget(newBudget);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1c1f2a] border border-slate-200 dark:border-white/10 shadow-2xl p-5 space-y-4 text-slate-800 dark:text-[#dfe2f1]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-[#10b981]/15 text-emerald-600 dark:text-[#4edea3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#dfe2f1]">Create New Budget</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#171b26] dark:hover:bg-white/10 text-slate-600 hover:text-slate-900 dark:text-[#bbcabf] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-[#bbcabf]">Budget Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fitness & Wellness"
              className="w-full bg-slate-50 dark:bg-[#171b26] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-[#dfe2f1] font-semibold focus:outline-none focus:border-emerald-500 dark:focus:border-[#4edea3] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-[#bbcabf]">Monthly Limit (₹)</label>
            <input
              type="text"
              value={allocated}
              onChange={(e) => setAllocated(e.target.value)}
              placeholder="e.g. 6,000"
              className="w-full bg-slate-50 dark:bg-[#171b26] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-[#dfe2f1] focus:outline-none focus:border-emerald-500 dark:focus:border-[#4edea3] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-[#bbcabf]">Choose Category Icon</label>
            <div className="grid grid-cols-4 gap-2">
              {icons.map((item) => (
                <button
                  key={item.icon}
                  type="button"
                  onClick={() => setSelectedIcon(item.icon)}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    selectedIcon === item.icon
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-[#10b981]/20 dark:border-[#10b981] dark:text-[#4edea3]'
                      : 'bg-slate-50 dark:bg-[#171b26] border-slate-200 dark:border-white/[0.04] text-slate-600 dark:text-[#bbcabf] hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span className="text-[9px] font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#262a35] dark:hover:bg-[#313540] text-xs font-semibold text-slate-700 dark:text-[#dfe2f1] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-[#10b981] dark:hover:brightness-105 text-white dark:text-[#002113] text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Add Budget
          </button>
        </div>
      </div>
    </div>
  );
};
