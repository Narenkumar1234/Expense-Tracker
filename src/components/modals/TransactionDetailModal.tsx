import React, { useState } from 'react';
import { Transaction } from '../../types';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit?: (tx: Transaction) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onDelete,
  onEdit,
}) => {
  const [splitCount, setSplitCount] = useState(2);
  const [showSplit, setShowSplit] = useState(false);

  if (!transaction) return null;

  const isIncome = transaction.amount > 0;
  const absAmount = Math.abs(transaction.amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1c1f2a] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden p-5 space-y-4 max-h-[92vh] flex flex-col text-slate-800 dark:text-[#dfe2f1]">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#171b26] border border-slate-200/80 dark:border-white/5 flex items-center justify-center text-slate-700 dark:text-[#dfe2f1] shrink-0">
              <span className="material-symbols-outlined text-[20px]">
                {transaction.icon}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#dfe2f1] truncate">
                {transaction.merchant}
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-[#bbcabf] font-mono block">
                {transaction.date} • {transaction.time}
              </span>
            </div>
          </div>

          {/* Action Icons in Header: Single Edit Icon, Delete Icon, Close Icon */}
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(transaction)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#171b26] text-slate-600 dark:text-[#bbcabf] hover:text-emerald-600 dark:hover:text-[#4edea3] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center justify-center transition-colors cursor-pointer"
                title="Edit transaction"
                aria-label="Edit"
              >
                <span className="material-symbols-outlined text-[17px]">edit</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onDelete(transaction.id);
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#171b26] text-slate-600 dark:text-[#bbcabf] hover:text-rose-600 dark:hover:text-[#ff7886] hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
              title="Delete transaction"
              aria-label="Delete"
            >
              <span className="material-symbols-outlined text-[17px]">delete_outline</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#171b26] text-slate-600 dark:text-[#bbcabf] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1 no-scrollbar">
          {/* Big Amount */}
          <div className="text-center py-2 border-y border-slate-200/80 dark:border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-[#bbcabf] block">
              {isIncome ? 'TOTAL INFLOW' : 'SETTLED TRANSACTION'}
            </span>
            <div
              className={`text-3xl font-mono font-bold mt-1 ${
                isIncome ? 'text-emerald-600 dark:text-[#4edea3]' : 'text-slate-900 dark:text-[#dfe2f1]'
              }`}
            >
              {isIncome ? '+' : '-'} ₹{absAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {transaction.category}
            </span>
          </div>

          {/* Detail Rows */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-[#bbcabf]">
              <span>Account</span>
              <span className="font-semibold text-slate-900 dark:text-[#dfe2f1]">{transaction.account}</span>
            </div>

            <div className="flex items-center justify-between text-slate-500 dark:text-[#bbcabf]">
              <span>Status</span>
              <span className="text-emerald-600 dark:text-[#4edea3] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                <span>Synchronized</span>
              </span>
            </div>

            {transaction.notes && (
              <div className="flex items-center justify-between text-slate-500 dark:text-[#bbcabf]">
                <span>Note</span>
                <span className="text-slate-900 dark:text-[#dfe2f1] max-w-[180px] text-right truncate">
                  {transaction.notes}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-500 dark:text-[#bbcabf]">
              <span>Classification</span>
              <span className={`font-semibold flex items-center gap-1 ${transaction.isRecurring ? 'text-indigo-600 dark:text-[#c0c1ff]' : 'text-slate-700 dark:text-slate-300'}`}>
                <span className="material-symbols-outlined text-[13px]">
                  {transaction.isRecurring ? 'sync' : 'payments'}
                </span>
                <span>{transaction.isRecurring ? 'Recurring Schedule' : 'Normal Transaction'}</span>
              </span>
            </div>
          </div>

          {/* Recurring Plan Intelligence Card */}
          {transaction.isRecurring && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131722] border border-slate-200/90 dark:border-emerald-500/25 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-[#4edea3]">repeat</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {transaction.recurringDurationMonths || 12}-Month Recurring Plan
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-[#4edea3] text-[9px] font-bold">
                  {transaction.recurringFrequency || 'Monthly'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#1b202e] border border-slate-200/80 dark:border-white/5">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Monthly Impact</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-[#4edea3] text-sm">
                    ₹{(transaction.monthlyEquivalent || Math.abs(transaction.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">/mo</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#1b202e] border border-slate-200/80 dark:border-white/5">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Total Commitment</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                    ₹{(transaction.totalCommitment || (Math.abs(transaction.amount) * (transaction.recurringDurationMonths || 12))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                  <span>Cycle 1 of {transaction.recurringDurationMonths || 12}</span>
                  <span>Active through {transaction.cycleEndDate || 'Active'}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-[#0a0e18] overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 dark:bg-[#4edea3] rounded-full"
                    style={{ width: `${Math.round((1 / (transaction.recurringDurationMonths || 12)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Split Bill Accordion */}
          {!isIncome && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#171b26] border border-slate-200/80 dark:border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-[#dfe2f1] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600 dark:text-[#4edea3]">group</span>
                  <span>Split Expense</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSplit(!showSplit)}
                  className="text-[11px] text-emerald-600 dark:text-[#4edea3] hover:underline cursor-pointer"
                >
                  {showSplit ? 'Hide' : 'Calculate'}
                </button>
              </div>

              {showSplit && (
                <div className="space-y-2 pt-1 border-t border-slate-200/80 dark:border-white/[0.04]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-[#bbcabf]">Split with {splitCount} people:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                        className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-[#262a35] dark:hover:bg-[#313540] text-slate-800 dark:text-white flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-slate-900 dark:text-[#dfe2f1] px-1">{splitCount}</span>
                      <button
                        type="button"
                        onClick={() => setSplitCount(splitCount + 1)}
                        className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-[#262a35] dark:hover:bg-[#313540] text-slate-800 dark:text-white flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-emerald-600 dark:text-[#4edea3] text-sm">
                    ₹{(absAmount / splitCount).toFixed(2)} / person
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Single Done Action Button at Bottom (No redundant edit/delete duplicates) */}
        <div className="pt-1 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-[#10b981] dark:hover:brightness-105 active:scale-95 text-xs font-bold text-white dark:text-[#002113] shadow-md dark:shadow-none transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
