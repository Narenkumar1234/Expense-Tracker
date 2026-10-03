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
  const [selectedMonth, setSelectedMonth] = useState('October 2024');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [exportedToast, setExportedToast] = useState(false);

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
    <div className="w-full max-w-md mx-auto px-4 pb-28 pt-2 space-y-4">
      {/* Search Bar & Filters Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-[#bbcabf] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by merchant, note..."
            className="w-full h-11 bg-[#171b26] border border-white/[0.06] rounded-xl pl-10 pr-8 text-xs text-[#dfe2f1] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#4edea3]/50 focus:ring-1 focus:ring-[#4edea3]/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-3 text-[#bbcabf] hover:text-white"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFiltersModal(!showFiltersModal)}
          className="h-11 px-3.5 rounded-xl bg-[#171b26] hover:bg-[#262a35] border border-white/[0.06] flex items-center gap-1.5 text-xs font-semibold text-[#dfe2f1] transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[17px] text-[#4edea3]">
            tune
          </span>
          <span>Filters</span>
          <span className="w-4 h-4 rounded-full bg-[#10b981]/20 text-[#4edea3] text-[10px] flex items-center justify-center font-bold">
            2
          </span>
        </button>
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

      {/* Month Navigator & Export */}
      <div className="flex items-center justify-between px-1">
        <button className="flex items-center gap-1.5 text-sm font-bold text-[#dfe2f1] hover:text-[#4edea3] transition-colors">
          <span className="material-symbols-outlined text-[18px] text-[#4edea3]">calendar_month</span>
          <span>{selectedMonth}</span>
          <span className="material-symbols-outlined text-[16px] text-[#bbcabf]">expand_more</span>
        </button>

        <button
          onClick={handleExport}
          className="px-3 py-1.5 rounded-lg bg-[#1c1f2a] hover:bg-[#262a35] border border-white/[0.06] text-xs font-semibold text-[#dfe2f1] flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px] text-[#4edea3]">download</span>
          <span>Export</span>
        </button>
      </div>

      {exportedToast && (
        <div className="p-2.5 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 text-xs text-[#4edea3] font-semibold flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Ledger export generated and downloaded successfully!</span>
        </div>
      )}

      {/* Ledger Telemetry Card */}
      <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#bbcabf]">
            LEDGER TELEMETRY
          </span>
          <span className="text-xs font-bold text-[#4edea3]">
            {filteredTransactions.length} Transactions
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[11px] text-[#bbcabf] block">Total Inflow</span>
            <div className="text-base font-bold font-mono text-[#4edea3] mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              <span>+₹64,200.00</span>
            </div>
          </div>
          <div>
            <span className="text-[11px] text-[#bbcabf] block">Total Outflow</span>
            <div className="text-base font-bold font-mono text-[#ff7886] mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              <span>-₹31,800.50</span>
            </div>
          </div>
        </div>

        {/* Dual Progress Bar */}
        <div className="w-full h-2 rounded-full bg-[#0f131d] overflow-hidden flex gap-0.5">
          <div className="h-full bg-[#4edea3] rounded-l-full" style={{ width: '67%' }} />
          <div className="h-full bg-[#ff7886] rounded-r-full" style={{ width: '33%' }} />
        </div>
      </div>

      {/* Date Grouped Transactions */}
      <div className="space-y-4">
        {/* Today */}
        {grouped.TODAY.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#dfe2f1]">
                  TODAY, OCT 24
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
                YESTERDAY, OCT 23
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

        {/* October 21 */}
        {grouped['OCTOBER 21'].length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#bbcabf]">
                OCTOBER 21
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
                EARLIER THIS MONTH
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

      {/* Ledger Fully Synchronized Verification Footer */}
      <div className="py-6 flex flex-col items-center justify-center text-center space-y-1 text-[#bbcabf]">
        <div className="w-8 h-8 rounded-full bg-[#10b981]/15 text-[#4edea3] flex items-center justify-center mb-1">
          <span className="material-symbols-outlined text-[18px]">verified</span>
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#dfe2f1]">
          LEDGER FULLY SYNCHRONIZED
        </div>
        <div className="text-[11px] text-[#bbcabf]">
          Real-time webhooks active via Plaid protocol
        </div>
      </div>
    </div>
  );
};

interface TransactionRowProps {
  tx: Transaction;
  onClick: () => void;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ tx, onClick }) => {
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
          <div className="text-sm font-semibold text-[#dfe2f1] group-hover:text-white transition-colors">
            {tx.merchant}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#bbcabf] mt-0.5">
            <span className="px-1.5 py-0.2 rounded bg-white/5 text-[9px] font-bold tracking-wider text-slate-300 uppercase">
              {tx.category}
            </span>
            {tx.isRecurring && (
              <span className="px-1.5 py-0.2 rounded bg-[#3131c0]/25 text-[#c0c1ff] text-[9px] font-bold tracking-wider uppercase flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[10px]">sync</span>
                {tx.recurringDurationMonths ? `${tx.recurringDurationMonths}-Mo Plan` : 'Recurring'}
              </span>
            )}
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
