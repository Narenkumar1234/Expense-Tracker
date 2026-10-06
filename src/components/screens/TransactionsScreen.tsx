import React, { useState, useMemo } from 'react';
import { Transaction } from '../../types';

interface TransactionsScreenProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onOpenQuickAdd: () => void;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  transactions,
  onSelectTransaction,
  onOpenQuickAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Expenses' | 'Income' | 'This Month' | 'Pending'>('All');
  const [exportedToast, setExportedToast] = useState(false);

  // Generate previous 1 year of months (12 months from current date)
  const previousYearMonths = useMemo(() => {
    const list: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push(d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }));
    }
    return list;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(previousYearMonths[0]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      const matchesSearch =
        tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tx.account.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Filter tabs
      if (activeFilter === 'Expenses') return tx.amount < 0;
      if (activeFilter === 'Income') return tx.amount > 0;
      if (activeFilter === 'Pending') return tx.status === 'pending';

      return true;
    });
  }, [transactions, searchQuery, activeFilter]);

  // Group by date groups
  const grouped = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {
      TODAY: [],
      YESTERDAY: [],
      'OCTOBER 21': [],
      EARLIER: [],
    };

    filteredTransactions.forEach((tx) => {
      if (groups[tx.dateGroup]) {
        groups[tx.dateGroup].push(tx);
      } else {
        groups.EARLIER.push(tx);
      }
    });

    return groups;
  }, [filteredTransactions]);

  const totalInflow = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalOutflow = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [filteredTransactions]);

  const handleExport = () => {
    setExportedToast(true);
    // Trigger synthetic CSV export download
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Merchant,Category,Amount,Date,Account\n' +
      transactions
        .map((t) => `${t.id},"${t.merchant}",${t.category},${t.amount},${t.date},"${t.account}"`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'aura_transactions_oct2024.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setExportedToast(false), 3000);
  };

  return (
    <div
      className="w-full max-w-md mx-auto px-4 pt-2 space-y-4 pb-36"
      style={{
        paddingBottom: 'calc(7.5rem + env(safe-area-inset-bottom, 20px))',
      }}
    >
      {/* Search Bar (Full Width) */}
      <div className="relative w-full">
        <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-[#bbcabf] pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by merchant, note, account..."
          className="w-full h-11 bg-[#171b26] border border-white/[0.06] rounded-xl pl-10 pr-8 text-xs text-[#dfe2f1] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#4edea3]/50 focus:ring-1 focus:ring-[#4edea3]/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-3 text-slate-500 dark:text-[#bbcabf] hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Filter Horizontal Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {(['All', 'Expenses', 'Income', 'This Month', 'Pending'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeFilter === filter
                ? 'bg-[#10b981] text-[#002113] shadow-md'
                : 'bg-[#171b26] text-[#bbcabf] hover:text-[#dfe2f1] border border-white/[0.04]'
            }`}
          >
            <span>{filter}</span>
            {filter === 'This Month' && activeFilter === 'This Month' && (
              <span className="material-symbols-outlined text-[14px]">check</span>
            )}
          </button>
        ))}
      </div>

      {/* Month Dropdown (Previous 1 Year) & Export */}
      <div className="flex items-center justify-between px-1">
        <div className="relative inline-flex items-center">
          <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#171b26] border border-white/[0.06] text-xs font-bold text-[#dfe2f1]">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">calendar_month</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#dfe2f1] appearance-none focus:outline-none pr-5 cursor-pointer"
            >
              {previousYearMonths.map((m) => (
                <option key={m} value={m} className="bg-white text-slate-900 dark:bg-[#171b26] dark:text-[#dfe2f1] py-1">
                  {m}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-[16px] text-[#bbcabf] absolute right-2.5 pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="px-3 py-1.5 rounded-lg bg-[#1c1f2a] hover:bg-[#262a35] border border-white/[0.06] text-xs font-semibold text-[#dfe2f1] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-[#4edea3]">download</span>
          <span>Export</span>
        </button>
      </div>

      {exportedToast && (
        <div className="py-2 px-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-xs text-cyan-300 font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
          <span className="material-symbols-outlined text-[16px]">download_done</span>
          <span>Exported</span>
        </div>
      )}

      {/* Summary Card */}
      <div className="rounded-xl bg-[#1c1f2a] border border-white/[0.04] p-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfe2f1]">
            Summary
          </span>
        </div>

        <div className="flex items-center gap-3.5 text-xs font-mono font-bold">
          <div className="flex items-center gap-1 text-[#4edea3]">
            <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
            <span>+₹{totalInflow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center gap-1 text-[#ff7886]">
            <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
            <span>-₹{totalOutflow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Empty State when no transactions */}
      {filteredTransactions.length === 0 && (
        <div className="p-8 rounded-2xl bg-[#1c1f2a] border border-white/[0.04] text-center space-y-3 my-4">
          <div className="w-12 h-12 rounded-2xl bg-[#171b26] border border-white/5 text-[#bbcabf] mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
          </div>
          <div className="text-sm font-bold text-[#dfe2f1]">No Transactions Recorded</div>
          <p className="text-xs text-[#bbcabf] max-w-[260px] mx-auto">
            {searchQuery
              ? 'No transactions match your search filter.'
              : 'Your financial ledger is clear. Log your first expense or income to start tracking.'}
          </p>
          <button
            onClick={onOpenQuickAdd}
            className="mt-1 px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#34d399] text-[#002113] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Transaction</span>
          </button>
        </div>
      )}

      {/* Date Grouped Transactions */}
      {filteredTransactions.length > 0 && (
        <div className="space-y-4">
          {/* Today */}
          {grouped.TODAY.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#dfe2f1]">
                    TODAY
                  </span>
                </div>
                <span className="text-[11px] text-[#bbcabf] font-mono">
                  {grouped.TODAY.length} entries
                </span>
              </div>

              <div className="space-y-2">
                {grouped.TODAY.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} onClick={() => onSelectTransaction(tx)} />
                ))}
              </div>
            </div>
          )}

          {/* Yesterday */}
          {grouped.YESTERDAY.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#bbcabf]">
                  YESTERDAY
                </span>
                <span className="text-[11px] text-[#bbcabf] font-mono">
                  {grouped.YESTERDAY.length} entries
                </span>
              </div>

              <div className="space-y-2">
                {grouped.YESTERDAY.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} onClick={() => onSelectTransaction(tx)} />
                ))}
              </div>
            </div>
          )}

          {/* October 21 / Recent */}
          {grouped['OCTOBER 21'].length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#bbcabf]">
                  RECENT
                </span>
                <span className="text-[11px] text-[#bbcabf] font-mono">
                  {grouped['OCTOBER 21'].length} entries
                </span>
              </div>

              <div className="space-y-2">
                {grouped['OCTOBER 21'].map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} onClick={() => onSelectTransaction(tx)} />
                ))}
              </div>
            </div>
          )}

          {/* Earlier */}
          {grouped.EARLIER.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#bbcabf]">
                  EARLIER
                </span>
                <span className="text-[11px] text-[#bbcabf] font-mono">
                  {grouped.EARLIER.length} entries
                </span>
              </div>

              <div className="space-y-2">
                {grouped.EARLIER.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} onClick={() => onSelectTransaction(tx)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ledger status footer */}
      <div className="py-6 flex items-center justify-center gap-1.5 text-center text-[#bbcabf]">
        <span className="material-symbols-outlined text-[16px] text-[#4edea3]">check_circle</span>
        <span className="text-xs text-[#bbcabf] font-medium">You're all caught up</span>
      </div>
    </div>
  );
};

interface TransactionRowProps {
  tx: Transaction;
  onClick: () => void;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ tx, onClick }) => {
  const [showRecurringOverlay, setShowRecurringOverlay] = useState(false);

  return (
    <div
      onClick={onClick}
      className="p-3.5 rounded-xl bg-[#1c1f2a] border border-white/[0.04] hover:bg-[#262a35] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#171b26] border border-white/5 flex items-center justify-center text-[#dfe2f1] group-hover:border-emerald-500/30 transition-colors">
          <span className="material-symbols-outlined text-[20px]">
            {tx.icon}
          </span>
        </div>
        <div>
          <div className="flex items-center min-w-0">
            <span className="text-sm font-semibold text-[#dfe2f1] group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
              {tx.merchant}
            </span>
            {tx.isRecurring && (
              <span className="relative inline-flex items-center ml-1.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRecurringOverlay(!showRecurringOverlay);
                  }}
                  className="text-sm leading-none text-[#c0c1ff] hover:text-[#4edea3] transition-colors focus:outline-none"
                  title="Recurring transaction"
                  aria-label="Recurring details"
                >
                  <span className="material-symbols-outlined text-[15px] align-middle select-none">
                    sync
                  </span>
                </button>

                {/* On-click overlay popover */}
                {showRecurringOverlay && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRecurringOverlay(false);
                      }}
                    />
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 bottom-full mb-2 z-50 p-2.5 rounded-xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-white/10 shadow-2xl text-xs whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-[#4edea3] mb-0.5">
                        <span className="material-symbols-outlined text-[14px]">sync</span>
                        <span>{tx.recurringDurationMonths ? `${tx.recurringDurationMonths}-Month ${tx.amount > 0 ? 'Salary / Income' : 'Plan'}` : (tx.amount > 0 ? 'Recurring Auto-credit' : 'Recurring Auto-debit')}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-[#bbcabf] font-mono">
                        {tx.monthlyEquivalent ? `${tx.amount > 0 ? '+' : ''}₹${tx.monthlyEquivalent.toLocaleString('en-IN')}/mo` : (tx.amount > 0 ? `+₹${tx.amount.toLocaleString('en-IN')} auto-credit` : `₹${Math.abs(tx.amount).toLocaleString('en-IN')} auto-debit`)}
                      </div>
                    </div>
                  </>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-[#bbcabf] mt-0.5">
            <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/5 text-[9px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">
              {tx.category}
            </span>
            <span>•</span>
            <span>{tx.time}</span>
          </div>
        </div>
      </div>

      <div className="text-right font-mono">
        <div
          className={`text-sm font-bold ${
            tx.amount > 0 ? 'text-[#4edea3]' : 'text-[#dfe2f1]'
          }`}
        >
          {tx.amount > 0
            ? `+ ₹${tx.amount.toLocaleString('en-IN')}`
            : `- ₹${Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
        </div>
        <div className="text-[11px] text-[#bbcabf] font-sans">
          {tx.account}
        </div>
      </div>
    </div>
  );
};
