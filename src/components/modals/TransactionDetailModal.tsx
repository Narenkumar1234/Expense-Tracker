import React, { useState } from 'react';
import { Transaction } from '../../types';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onDelete,
}) => {
  const [splitCount, setSplitCount] = useState(2);
  const [showSplit, setShowSplit] = useState(false);

  if (!transaction) return null;

  const isIncome = transaction.amount > 0;
  const absAmount = Math.abs(transaction.amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-[#1c1f2a] border border-white/10 shadow-2xl overflow-hidden p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#171b26] border border-white/5 flex items-center justify-center text-[#dfe2f1]">
              <span className="material-symbols-outlined text-[20px]">
                {transaction.icon}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#dfe2f1]">
                {transaction.merchant}
              </h3>
              <span className="text-[10px] text-[#bbcabf] font-mono">
                {transaction.time}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#171b26] text-[#bbcabf] hover:text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Big Amount */}
        <div className="text-center py-2 border-y border-white/[0.04]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#bbcabf] block">
            {isIncome ? 'TOTAL INFLOW' : 'SETTLED TRANSACTION'}
          </span>
          <div
            className={`text-3xl font-mono font-bold mt-1 ${
              isIncome ? 'text-[#4edea3]' : 'text-[#dfe2f1]'
            }`}
          >
            {isIncome ? '+' : '-'} ₹{absAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            {transaction.category}
          </span>
        </div>

        {/* Detail Rows */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#bbcabf]">
            <span>Account</span>
            <span className="font-semibold text-[#dfe2f1]">{transaction.account}</span>
          </div>

          <div className="flex items-center justify-between text-[#bbcabf]">
            <span>Status</span>
            <span className="text-[#4edea3] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              <span>Synchronized</span>
            </span>
          </div>

          {transaction.notes && (
            <div className="flex items-center justify-between text-[#bbcabf]">
              <span>Note</span>
              <span className="text-[#dfe2f1] max-w-[180px] text-right truncate">
                {transaction.notes}
              </span>
            </div>
          )}

          {transaction.isRecurring && (
            <div className="flex items-center justify-between text-[#bbcabf]">
              <span>Recurring</span>
              <span className="text-[#c0c1ff] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">sync</span>
                <span>Active Auto-Schedule</span>
              </span>
            </div>
          )}
        </div>

        {/* Recurring Plan Intelligence Card */}
        {transaction.isRecurring && (
          <div className="p-3.5 rounded-xl bg-gradient-to-tr from-[#0a0e18] to-[#171b26] border border-[#10b981]/25 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#4edea3]">repeat</span>
                <span className="text-xs font-bold text-[#dfe2f1]">
                  {transaction.recurringDurationMonths || 12}-Month Recurring Plan
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#4edea3] text-[9px] font-bold">
                {transaction.recurringFrequency || 'Monthly'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#0f131d]/60 border border-white/[0.04]">
                <span className="text-[10px] text-[#bbcabf] block">Monthly Impact</span>
                <span className="font-mono font-bold text-[#4edea3] text-sm">
                  ₹{(transaction.monthlyEquivalent || Math.abs(transaction.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  <span className="text-[10px] text-[#bbcabf] font-normal">/mo</span>
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#0f131d]/60 border border-white/[0.04]">
                <span className="text-[10px] text-[#bbcabf] block">Total Commitment</span>
                <span className="font-mono font-bold text-[#dfe2f1] text-sm">
                  ₹{(transaction.totalCommitment || (Math.abs(transaction.amount) * (transaction.recurringDurationMonths || 12))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[10px] text-[#bbcabf]">
                <span>Cycle 1 of {transaction.recurringDurationMonths || 12}</span>
                <span>Active through {transaction.cycleEndDate || 'Oct 2025'}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#0f131d] overflow-hidden">
                <div
                  className="h-full bg-[#4edea3] rounded-full"
                  style={{ width: `${Math.round((1 / (transaction.recurringDurationMonths || 12)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Split Bill Accordion */}
        {!isIncome && (
          <div className="p-3 rounded-xl bg-[#171b26] border border-white/[0.04] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#dfe2f1] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#4edea3]">group</span>
                <span>Split Expense</span>
              </span>
              <button
                onClick={() => setShowSplit(!showSplit)}
                className="text-[11px] text-[#4edea3] hover:underline"
              >
                {showSplit ? 'Hide' : 'Calculate'}
              </button>
            </div>

            {showSplit && (
              <div className="space-y-2 pt-1 border-t border-white/[0.04]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#bbcabf]">Split with {splitCount} people:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                      className="w-5 h-5 rounded bg-[#262a35] text-white flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-[#dfe2f1] px-1">{splitCount}</span>
                    <button
                      onClick={() => setSplitCount(splitCount + 1)}
                      className="w-5 h-5 rounded bg-[#262a35] text-white flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-[#4edea3] text-sm">
                  ₹{(absAmount / splitCount).toFixed(2)} / person
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              onDelete(transaction.id);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#ff7886]/10 hover:bg-[#ff7886]/20 border border-[#ff7886]/30 text-xs font-bold text-[#ff7886] transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#10b981] hover:brightness-105 active:scale-95 text-xs font-bold text-[#002113] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
