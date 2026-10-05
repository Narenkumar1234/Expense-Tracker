import React from 'react';

interface NotificationsModalProps {
  onClose: () => void;
  onOpenQuickAdd: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  onClose,
  onOpenQuickAdd,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm backdrop-fade-in">
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <div className="w-full max-w-sm h-full bg-white dark:bg-[#1c1f2a] text-slate-800 dark:text-[#dfe2f1] border-l border-slate-200 dark:border-white/10 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto no-scrollbar drawer-slide-right">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-emerald-600 dark:text-[#4edea3]">
                notifications_active
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#dfe2f1]">
                Aura Notifications & Alerts
              </h3>
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
            {/* Notification 1 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#171b26] border border-emerald-500/30 dark:border-emerald-500/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-[#10b981]/20 dark:text-[#4edea3] text-[9px] font-bold uppercase">
                  Scheduled Bill
                </span>
                <span className="text-[10px] text-slate-500 dark:text-[#bbcabf]">In 3 days</span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-[#dfe2f1]">
                Recurring Bill 'NordVPN' (₹499.00)
              </div>
              <p className="text-[11px] text-slate-600 dark:text-[#bbcabf] leading-relaxed">
                Auto-debit will execute on 27th Oct from HDFC Millennia card. Balance buffer verified.
              </p>
            </div>

            {/* Notification 2 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#171b26] border border-rose-400/30 dark:border-[#ff7886]/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-[#ff7886]/15 dark:text-[#ff7886] text-[9px] font-bold uppercase">
                  Budget Alert
                </span>
                <span className="text-[10px] text-slate-500 dark:text-[#bbcabf]">Yesterday</span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-[#dfe2f1]">
                Entertainment Exceeded Limit
              </div>
              <p className="text-[11px] text-slate-600 dark:text-[#bbcabf] leading-relaxed">
                You've utilized 111% (₹3,900 / ₹3,500) due to cinema & gaming subscriptions.
              </p>
            </div>

            {/* Notification 3 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#171b26] border border-emerald-500/30 dark:border-[#10b981]/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-[#10b981]/15 dark:text-[#4edea3] text-[9px] font-bold uppercase">
                  Statement Radar
                </span>
                <span className="text-[10px] text-slate-500 dark:text-[#bbcabf]">Oct 18</span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-[#dfe2f1]">
                HDFC Regalia Statement Generated
              </div>
              <p className="text-[11px] text-slate-600 dark:text-[#bbcabf] leading-relaxed">
                ₹34,200 unbilled spend due on 7th Nov. 20 days grace period remaining.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-[#10b981] dark:hover:brightness-105 active:scale-98 text-white dark:text-[#002113] text-xs font-bold shadow-md dark:shadow-none transition-all cursor-pointer mt-4"
        >
          Dismiss All
        </button>
      </div>
    </div>
  );
};
