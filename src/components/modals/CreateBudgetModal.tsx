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
    const amount = parseInt(allocated.replace(/\D/g, '')) || 5000;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-[#1c1f2a] border border-white/10 shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/15 text-[#4edea3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
            </div>
            <h3 className="text-sm font-bold text-[#dfe2f1]">Create New Budget</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#171b26] text-[#bbcabf] hover:text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] text-[#bbcabf]">Budget Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fitness & Wellness"
              className="w-full bg-[#171b26] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-[#dfe2f1] font-semibold focus:outline-none focus:border-[#4edea3]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-[#bbcabf]">Monthly Limit (₹)</label>
            <input
              type="text"
              value={allocated}
              onChange={(e) => setAllocated(e.target.value)}
              placeholder="e.g. 6,000"
              className="w-full bg-[#171b26] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-[#dfe2f1] focus:outline-none focus:border-[#4edea3]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-[#bbcabf]">Choose Category Icon</label>
            <div className="grid grid-cols-4 gap-2">
              {icons.map((item) => (
                <button
                  key={item.icon}
                  type="button"
                  onClick={() => setSelectedIcon(item.icon)}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                    selectedIcon === item.icon
                      ? 'bg-[#10b981]/20 border-[#10b981] text-[#4edea3]'
                      : 'bg-[#171b26] border-white/[0.04] text-[#bbcabf]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span className="text-[9px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#262a35] text-xs font-semibold text-[#dfe2f1]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-[#10b981] text-[#002113] text-xs font-bold shadow-md hover:brightness-105"
          >
            Add Budget
          </button>
        </div>
      </div>
    </div>
  );
};
