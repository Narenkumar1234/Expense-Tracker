import React, { useState, useRef } from 'react';
import { PaymentCard, UserProfile } from '../../types';

interface AddCardModalProps {
  user: UserProfile;
  onClose: () => void;
  onSaveCard: (card: PaymentCard) => void;
}

interface BankOption {
  id: string;
  name: string;
  tag: string;
  gradient: string;
  borderColor: string;
  accentColor: string;
  defaultVariants: string[];
}

const AVAILABLE_BANKS: BankOption[] = [
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    tag: "India's #1 Issuer",
    gradient: 'from-[#001e3d] via-[#083b77] to-[#0a192f]',
    borderColor: 'border-blue-500/40',
    accentColor: '#38bdf8',
    defaultVariants: ['Millennia Credit', 'Regalia Gold', 'Infinia Metal'],
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    tag: 'Amazon Pay & Coral',
    gradient: 'from-[#3b0808] via-[#6f1212] to-[#250303]',
    borderColor: 'border-orange-500/40',
    accentColor: '#fb923c',
    defaultVariants: ['Coral Credit', 'Sapphiro Reserve', 'Amazon Pay ICICI'],
  },
  {
    id: 'sbi',
    name: 'SBI Bank',
    tag: 'SimplyCLICK & Prime',
    gradient: 'from-[#07203b] via-[#103b6b] to-[#041224]',
    borderColor: 'border-cyan-500/40',
    accentColor: '#38bdf8',
    defaultVariants: ['SimplyCLICK', 'SBI Card Prime', 'Octane BPCL'],
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    tag: 'Magnus & Flipkart',
    gradient: 'from-[#33071e] via-[#520c32] to-[#1a020f]',
    borderColor: 'border-pink-500/40',
    accentColor: '#f472b6',
    defaultVariants: ['Flipkart Axis', 'Axis Magnus', 'Neo Credit'],
  },
  {
    id: 'kotak',
    name: 'Kotak Bank',
    tag: 'League & White',
    gradient: 'from-[#3b0303] via-[#5c0606] to-[#1c0101]',
    borderColor: 'border-red-500/40',
    accentColor: '#f87171',
    defaultVariants: ['League Platinum', 'White Card', 'Zen Signature'],
  },
  {
    id: 'amex',
    name: 'American Express',
    tag: 'Membership Rewards',
    gradient: 'from-[#1e293b] via-[#334155] to-[#0f172a]',
    borderColor: 'border-slate-400/40',
    accentColor: '#4edea3',
    defaultVariants: ['Platinum Reserve', 'SmartEarn', 'Gold Rewards'],
  },
];

export const AddCardModal: React.FC<AddCardModalProps> = ({
  user,
  onClose,
  onSaveCard,
}) => {
  // Step state: 'bank' -> 'details'
  const [step, setStep] = useState<'bank' | 'details'>('bank');

  // Form states
  const [selectedBank, setSelectedBank] = useState<BankOption>(AVAILABLE_BANKS[0]);
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit');

  // Card state - only last 4 digits needed
  const [last4, setLast4] = useState('4829');
  const [cardHolder, setCardHolder] = useState(user.name.toUpperCase());
  const [expiry, setExpiry] = useState('08/29');
  const [creditLimit, setCreditLimit] = useState('2,50,000');
  const [statementDay, setStatementDay] = useState('15');

  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const getNetwork = () => {
    if (selectedBank.id === 'amex') return 'AMEX';
    if (last4.startsWith('4')) return 'VISA';
    if (last4.startsWith('5')) return 'MASTERCARD';
    return 'RUPAY';
  };

  const handleBankSelect = (bank: BankOption) => {
    setSelectedBank(bank);
  };

  const handleExpiryChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length > 2) {
      setExpiry(cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4));
    } else {
      setExpiry(cleaned);
    }
  };

  const handleSave = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);

      const formattedLast4 = last4.trim() || '4829';

      const newCard: PaymentCard = {
        id: 'card-' + Date.now(),
        bankName: selectedBank.name,
        variant: cardType === 'credit' ? 'Credit Card' : 'Debit Card',
        cardholderName: cardHolder.toUpperCase() || user.name.toUpperCase(),
        cardNumber: `•••• •••• •••• ${formattedLast4}`,
        last4: formattedLast4,
        expiry: expiry || '08/29',
        network: getNetwork() as any,
        type: cardType,
        creditLimit: parseInt(creditLimit.replace(/,/g, '')) || 250000,
        unbilledSpend: 0,
        statementDate: `${statementDay}th of every month`,
        dueDate: '5th of following month',
        isDefault: false,
      };

      onSaveCard(newCard);

      setTimeout(() => {
        onClose();
      }, 1000);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f131d] overflow-y-auto no-scrollbar flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0f131d]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="h-16 px-4 max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={step === 'details' ? () => setStep('bank') : onClose}
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#dfe2f1] hover:text-[#4edea3] transition-colors"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div className="w-7 h-7 rounded-lg bg-[#171b26] border border-emerald-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#4edea3] text-[18px]">
                credit_card
              </span>
            </div>
            <h1 className="text-base font-bold text-[#dfe2f1]">
              {step === 'bank' ? 'Select Bank & Card' : 'Type Card Details'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#bbcabf]">
              {step === 'bank' ? 'Step 1 of 2' : 'Step 2 of 2'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto w-full px-4 pt-3 pb-8 space-y-4 flex-1">
        {step === 'bank' ? (
          /* STEP 1: Select Bank & Debit/Credit */
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h2 className="text-xl font-bold text-[#dfe2f1]">Choose Institution</h2>
              <p className="text-xs text-[#bbcabf] mt-0.5">
                Select your bank and account type to configure your card design.
              </p>
            </div>

            {/* Debit vs Credit Segmented Toggle */}
            <div className="p-1 rounded-xl bg-[#171b26] border border-white/[0.06] grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setCardType('credit')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  cardType === 'credit'
                    ? 'bg-[#10b981] text-[#002113] shadow-md font-bold'
                    : 'text-[#bbcabf] hover:text-[#dfe2f1]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">credit_score</span>
                <span>Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setCardType('debit')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  cardType === 'debit'
                    ? 'bg-[#10b981] text-[#002113] shadow-md font-bold'
                    : 'text-[#bbcabf] hover:text-[#dfe2f1]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">account_balance_wallet</span>
                <span>Debit Card</span>
              </button>
            </div>

            {/* Available Bank Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#bbcabf] block">
                Available Banks
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {AVAILABLE_BANKS.map((b) => {
                  const isSelected = selectedBank.id === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleBankSelect(b)}
                      className={`bank-tile p-3.5 rounded-xl text-left transition-all border relative overflow-hidden flex flex-col justify-between h-24 bg-gradient-to-tr ${b.gradient} ${b.borderColor} ${
                        isSelected
                          ? 'ring-2 ring-[#4edea3] shadow-[0_0_16px_rgba(16,185,129,0.35)] scale-[1.03] z-10'
                          : 'opacity-90 hover:opacity-100 hover:scale-[1.01] shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="material-symbols-outlined text-[22px] text-white">
                          account_balance
                        </span>
                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-[#10b981] text-[#002113] flex items-center justify-center text-[12px] font-bold shadow-sm">
                            ✓
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-white/30" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white tracking-wide">
                          {b.name}
                        </div>
                        <div className="text-[10px] text-white/80 font-medium truncate">
                          {b.tag}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Continue to Step 2 Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="w-full py-3 rounded-xl bg-[#10b981] hover:brightness-105 active:scale-95 text-[#002113] text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
              >
                <span>Continue to Card Details</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: Interactive Card - Type Directly on the Card! */
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#dfe2f1]">
                  Type Details on Card
                </h2>
                <p className="text-xs text-[#bbcabf] mt-0.5">
                  Click on the card fields below to enter your card digits and name.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('bank')}
                className="text-xs font-semibold text-[#4edea3] hover:underline"
              >
                Change Bank
              </button>
            </div>

            {/* Interactive Live Card with Inputs directly inside */}
            <div
              className={`card-preview relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden p-5 flex flex-col justify-between shadow-2xl bg-gradient-to-tr ${selectedBank.gradient} border ${selectedBank.borderColor} text-white`}
            >
              {/* Atmospheric Glow */}
              <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

              {/* Top Row: Bank Name & Chip/Contactless */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[20px]">
                      account_balance
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white tracking-wider uppercase">
                      {selectedBank.name}
                    </div>
                    <div className="text-[10px] text-white/70">
                      {cardType === 'credit' ? 'Credit Card' : 'Debit Card'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/70">
                  <span className="material-symbols-outlined text-[20px]">contactless</span>
                  <div className="w-7 h-5 rounded bg-white/20 flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-[15px] text-amber-200">
                      memory
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Row: Last 4 Digits typed directly onto card */}
              <div className="relative z-10 my-auto">
                <div className="text-[9px] uppercase tracking-wider text-white/60 mb-1.5 flex items-center justify-between">
                  <span>Card Number (Last 4 Digits)</span>
                  <span className="text-[9px] text-[#4edea3] font-medium">Auto-Masked & Safe</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 font-mono text-[17px] sm:text-[19px] font-bold tracking-widest text-white">
                  <span className="text-white/40 tracking-widest select-none">••••</span>
                  <span className="text-white/40 tracking-widest select-none">••••</span>
                  <span className="text-white/40 tracking-widest select-none">••••</span>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={last4}
                      onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="4829"
                      autoFocus
                      className="w-20 bg-black/25 hover:bg-black/35 focus:bg-black/50 border border-white/25 focus:border-[#4edea3] rounded-lg text-center text-[#4edea3] py-1 px-1 font-mono font-bold tracking-widest focus:outline-none transition-all placeholder:text-white/40 shadow-inner"
                    />
                  </div>
                </div>

                {cardType === 'credit' && (
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <span className="text-[10px] text-white/70">Credit Limit: ₹</span>
                    <input
                      type="text"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      placeholder="2,50,000"
                      className="w-24 bg-transparent border-b border-white/30 focus:border-[#4edea3] text-xs font-mono font-bold text-[#4edea3] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Row: Holder Name & Expiry on card */}
              <div className="relative z-10 flex items-end justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] uppercase tracking-wider text-white/60 block">
                    Cardholder Name
                  </span>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    placeholder="ALEX SHARMA"
                    className="w-full bg-transparent border-b border-white/30 focus:border-[#4edea3] text-xs font-bold uppercase tracking-wider text-white focus:outline-none"
                  />
                </div>

                <div className="w-16">
                  <span className="text-[8px] uppercase tracking-wider text-white/60 block text-right">
                    Expires
                  </span>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    placeholder="08/29"
                    maxLength={5}
                    className="w-full bg-transparent border-b border-white/30 focus:border-[#4edea3] text-xs font-mono font-semibold text-white focus:outline-none text-right"
                  />
                </div>

                <div className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider text-white shrink-0">
                  {getNetwork()}
                </div>
              </div>
            </div>

            {/* Statement cycle day selector */}
            <div className="p-3 rounded-xl bg-[#1c1f2a] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#dfe2f1] block">
                  Statement Generation Day
                </span>
                <span className="text-[10px] text-[#bbcabf]">
                  Auto-syncs statement cycle and grace period radar
                </span>
              </div>
              <select
                value={statementDay}
                onChange={(e) => setStatementDay(e.target.value)}
                className="bg-[#171b26] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-[#dfe2f1] focus:outline-none"
              >
                {[1, 5, 10, 15, 20, 25, 28].map((day) => (
                  <option key={day} value={day}>
                    {day}th
                  </option>
                ))}
              </select>
            </div>

            {/* Save Card Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isProcessing || success}
                className="w-full py-3.5 rounded-xl bg-[#10b981] hover:brightness-105 active:scale-95 text-[#002113] text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                    <span>Saving...</span>
                  </>
                ) : success ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    <span>Save {selectedBank.name} to Vault</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
