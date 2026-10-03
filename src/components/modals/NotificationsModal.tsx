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

      <div className="w-full max-w-sm h-full bg-[#1c1f2a] border-l border-white/10 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto no-scrollbar drawer-slide-right">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#4edea3]">
                notifications_active
              </span>
              <h3 className="text-sm font-bold text-[#dfe2f1]">
                Aura Notifications & Alerts
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#171b26] text-[#bbcabf] hover:text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="space-y-3">
          {/* Notification 1 */}
          <div className="p-3.5 rounded-xl bg-[#171b26] border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#4edea3] text-[9px] font-bold uppercase">
                Scheduled Bill
              </span>
              <span className="text-[10px] text-[#bbcabf]">In 3 days</span>
            </div>
            <div className="text-xs font-bold text-[#dfe2f1]">
              Recurring Bill 'NordVPN' (₹499.00)
            </div>
            <p className="text-[11px] text-[#bbcabf]">
              Auto-debit will execute on 27th Oct from HDFC Millennia card. Balance buffer verified.
            </p>
          </div>

          {/* Notification 2 */}
          <div className="p-3.5 rounded-xl bg-[#171b26] border border-[#ff7886]/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-[#ff7886]/15 text-[#ff7886] text-[9px] font-bold uppercase">
                Budget Alert
              </span>
              <span className="text-[10px] text-[#bbcabf]">Yesterday</span>
            </div>
            <div className="text-xs font-bold text-[#dfe2f1]">
              Entertainment Exceeded Limit
            </div>
            <p className="text-[11px] text-[#bbcabf]">
              You've utilized 111% (₹3,900 / ₹3,500) due to cinema & gaming subscriptions.
            </p>
          </div>

          {/* Notification 3 */}
          <div className="p-3.5 rounded-xl bg-[#171b26] border border-[#10b981]/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#4edea3] text-[9px] font-bold uppercase">
                Statement Radar
              </span>
              <span className="text-[10px] text-[#bbcabf]">Oct 18</span>
            </div>
            <div className="text-xs font-bold text-[#dfe2f1]">
              HDFC Regalia Statement Generated
            </div>
            <p className="text-[11px] text-[#bbcabf]">
              ₹34,200 unbilled spend due on 7th Nov. 20 days grace period remaining.
            </p>
          </div>
        </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#10b981] text-[#002113] text-xs font-bold transition-all hover:brightness-105"
        >
          Dismiss All
        </button>
      </div>
    </div>
  );
};
