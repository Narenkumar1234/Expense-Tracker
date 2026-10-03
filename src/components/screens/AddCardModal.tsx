import React, { useState } from 'react';
import { PaymentCard, UserProfile } from '../../types';

interface AddCardModalProps {
  user: UserProfile;
  onClose: () => void;
  onSaveCard: (card: PaymentCard) => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({
  user,
  onClose,
  onSaveCard,
}) => {
  const [bankName, setBankName] = useState('HDFC Bank');
  const [cardVariant, setCardVariant] = useState('Millennia Credit');
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit');
  const [cardNumber, setCardNumber] = useState('4234 5678 9012 4829');
  const [cardHolder, setCardHolder] = useState('ALEX SHARMA');
  const [expiry, setExpiry] = useState('08/29');
  const [creditLimit, setCreditLimit] = useState('2,50,000');
  const [autoAlert, setAutoAlert] = useState(true);
  const [accType, setAccType] = useState<'savings' | 'current'>('savings');
  const [passbookSync, setPassbookSync] = useState(true);
  const [upiCategorize, setUpiCategorize] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Detect card network
  const getNetwork = () => {
    const raw = cardNumber.replace(/\D/g, '');
    if (raw.startsWith('4')) return 'VISA';
    if (raw.startsWith('5')) return 'MASTERCARD';
    if (raw.startsWith('6') || raw.startsWith('8')) return 'RUPAY';
    return 'VISA';
  };

  const formatCardNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += cleaned[i];
    }
    setCardNumber(formatted.substring(0, 19));
  };

  const formatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 2) {
      setExpiry(cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4));
    } else {
      setExpiry(cleaned);
    }
  };

  const handleBankSelect = (name: string, variant: string) => {
    setBankName(name);
    setCardVariant(variant);
  };

  const handleSave = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);

      const rawNumber = cardNumber.replace(/\s+/g, '');
      const last4 = rawNumber.slice(-4) || '4829';

      const newCard: PaymentCard = {
        id: 'card-' + Date.now(),
        bankName,
        variant: cardVariant,
        cardholderName: cardHolder.toUpperCase() || 'ALEX SHARMA',
        cardNumber: rawNumber || '4234567890124829',
        last4,
        expiry: expiry || '08/29',
        network: getNetwork() as any,
        type: cardType,
        creditLimit: parseInt(creditLimit.replace(/,/g, '')) || 250000,
        unbilledSpend: 0,
        statementDate: '15th of every month',
        dueDate: '5th of following month',
        isDefault: false,
      };

      onSaveCard(newCard);

      setTimeout(() => {
        onClose();
      }, 1200);
    }, 1200);
  };

  const digits = cardNumber.split(' ');
  const d1 = digits[0] || '••••';
  const d2 = digits[1] || '••••';
  const d3 = digits[2] || '••••';
  const d4 = digits[3] || '4829';

  return (
    <div className="fixed inset-0 z-50 bg-[#0f131d] overflow-y-auto no-scrollbar flex flex-col justify-between">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#0f131d]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="h-16 px-4 max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#dfe2f1] hover:text-[#4edea3] transition-colors"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div className="w-7 h-7 rounded-lg bg-[#171b26] border border-emerald-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#4edea3] text-[18px]">
                token
              </span>
            </div>
            <h1 className="text-base font-bold text-[#dfe2f1]">
              Add Card & Accounts
            </h1>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="max-w-md mx-auto w-full px-4 pt-3 pb-8 space-y-4 flex-1">
        {/* Sub-header & Description */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4edea3]">
              Aura Secure Vault
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#dfe2f1]">Add Card & Accounts</h2>
          <p className="text-xs text-[#bbcabf] mt-0.5">
            Link payment methods to unlock auto-spend tracking, statement cycle intelligence & grace period radar.
          </p>
        </div>

        {/* Live Dynamic Card Preview */}
        <div className="card-preview relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden p-5 flex flex-col justify-between shadow-2xl bg-gradient-to-tr from-[#0a0e18] via-[#171b26] to-[#262a35] border border-white/[0.08]">
          {/* Atmospheric Glow */}
          <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-[#10b981]/20 blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-[#3131c0]/25 blur-2xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

          {/* Top Row: Bank Badge & Contactless/Chip */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#313540]/80 flex items-center justify-center text-[#4edea3] backdrop-blur-md">
                <span className="material-symbols-outlined text-[20px]">
                  account_balance
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#dfe2f1] tracking-wider uppercase">
                  {bankName}
                </div>
                <div className="text-[10px] text-[#bbcabf]">
                  {cardVariant}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#bbcabf]">
              <span className="material-symbols-outlined text-[20px]">contactless</span>
              <div className="w-7 h-5 rounded bg-[#313540] flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[15px] text-[#ffb2b7]">
                  memory
                </span>
              </div>
            </div>
          </div>

          {/* Masked Digits */}
          <div className="relative z-10 my-auto">
            <div className="flex items-center justify-between tracking-widest font-mono text-[#dfe2f1] text-[18px] sm:text-[20px] font-bold">
              <span>{d1}</span>
              <span>{d2}</span>
              <span>{d3}</span>
              <span className="text-[#4edea3] font-bold">{d4}</span>
            </div>
            {cardType === 'credit' && (
              <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                <span className="text-[#bbcabf]">Credit Limit:</span>
                <span className="text-[#4edea3] font-mono font-bold">₹{creditLimit}</span>
              </div>
            )}
          </div>

          {/* Bottom Row: Holder Name & Expiry */}
          <div className="relative z-10 flex items-end justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[#bbcabf] block">
                Cardholder
              </span>
              <span className="text-xs font-bold tracking-wider text-[#dfe2f1] uppercase">
                {cardHolder || 'YOUR NAME'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-[#bbcabf] block">
                  Expires
                </span>
                <span className="text-xs font-mono font-semibold text-[#dfe2f1]">
                  {expiry || 'MM/YY'}
                </span>
              </div>

              {/* Network Pill Badge */}
              <div className="bg-[#313540]/90 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="text-[10px] font-bold text-[#dfe2f1] italic tracking-wider">
                  {getNetwork()}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Selector Ribbon */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
              Select Bank
            </span>
            <span className="text-xs text-[#4edea3]">Popular in India</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { name: 'HDFC Bank', variant: 'Millennia Credit', letter: 'H' },
              { name: 'ICICI Bank', variant: 'Sapphiro Privilege', letter: 'I' },
              { name: 'State Bank of India', variant: 'SimplyCLICK', letter: 'S' },
              { name: 'Axis Bank', variant: 'Magnus Luxury', letter: 'A' },
              { name: 'Kotak Mahindra', variant: 'League Platinum', letter: 'K' },
            ].map((bank) => {
              const isSelected = bankName === bank.name;
              return (
                <button
                  key={bank.name}
                  onClick={() => handleBankSelect(bank.name, bank.variant)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-[#10b981]/20 border-[#10b981] text-[#4edea3]'
                      : 'bg-[#171b26] border-white/[0.04] text-[#bbcabf] hover:bg-[#262a35]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected
                        ? 'bg-[#10b981] text-[#002113]'
                        : 'bg-[#313540] text-[#bbcabf]'
                    }`}
                  >
                    {bank.letter}
                  </div>
                  <span>{bank.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Type Switcher */}
        <div className="bg-[#171b26] p-1 rounded-full flex items-center justify-between border border-white/[0.04]">
          <button
            onClick={() => setCardType('credit')}
            className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              cardType === 'credit'
                ? 'bg-[#262a35] text-[#4edea3] shadow-sm font-bold'
                : 'text-[#bbcabf] hover:text-[#dfe2f1]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">credit_card</span>
            <span>Credit Card</span>
          </button>

          <button
            onClick={() => setCardType('debit')}
            className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              cardType === 'debit'
                ? 'bg-[#262a35] text-[#4edea3] shadow-sm font-bold'
                : 'text-[#bbcabf] hover:text-[#dfe2f1]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">savings</span>
            <span>Debit / Bank Account</span>
          </button>
        </div>

        {/* Card Core Credentials */}
        <div className="space-y-3 pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf] px-1 block">
            Card Credentials
          </span>

          {/* Card Number */}
          <div className="space-y-1">
            <label className="text-[11px] text-[#bbcabf]">Card Number (16 Digits)</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#bbcabf] text-[18px]">
                payment
              </span>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => formatCardNumber(e.target.value)}
                maxLength={19}
                className="w-full bg-[#171b26] border border-white/[0.06] rounded-xl pl-10 pr-20 py-2.5 text-xs font-mono font-bold text-[#dfe2f1] focus:outline-none focus:border-[#4edea3]"
              />
              <span className="absolute right-3 text-[11px] font-bold text-[#4edea3] uppercase">
                {getNetwork()}
              </span>
            </div>
          </div>

          {/* Name & Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-[#bbcabf]">Cardholder Name</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#bbcabf] text-[17px]">
                  person
                </span>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  className="w-full bg-[#171b26] border border-white/[0.06] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#dfe2f1] uppercase focus:outline-none focus:border-[#4edea3]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#bbcabf]">Expiry Date</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#bbcabf] text-[17px]">
                  calendar_month
                </span>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => formatExpiry(e.target.value)}
                  maxLength={5}
                  placeholder="MM/YY"
                  className="w-full bg-[#171b26] border border-white/[0.06] rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono font-bold text-[#dfe2f1] focus:outline-none focus:border-[#4edea3]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Section: Credit Card Fields */}
        {cardType === 'credit' ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
                Statement & Cycle Intelligence
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#4edea3] text-[10px] font-bold">
                Smart Bill Sync
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#bbcabf]">Card Variant / Nickname</label>
              <input
                type="text"
                value={cardVariant}
                onChange={(e) => setCardVariant(e.target.value)}
                className="w-full bg-[#171b26] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#dfe2f1] focus:outline-none focus:border-[#4edea3]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#bbcabf]">Approved Credit Limit</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-sm font-bold text-[#4edea3]">₹</span>
                <input
                  type="text"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full bg-[#171b26] border border-white/[0.06] rounded-xl pl-8 pr-3 py-2.5 text-sm font-mono font-bold text-[#dfe2f1] focus:outline-none focus:border-[#4edea3]"
                />
              </div>
            </div>

            {/* Cycle info box */}
            <div className="p-4 rounded-xl bg-[#1c1f2a] border border-white/[0.04] space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#171b26] text-[#4edea3] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px]">event_repeat</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#dfe2f1]">
                    Statement Date (Billing Day)
                  </div>
                  <div className="text-[11px] text-[#bbcabf]">
                    15th of every month
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0f131d]/60 flex items-center gap-2 text-[11px] text-[#bbcabf]">
                <span className="material-symbols-outlined text-[16px] text-[#4edea3]">verified</span>
                <span>Statement generates on <strong>15th</strong>. Expense auto-consolidation & pre-due alerts schedule 3 days prior.</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-[10px] text-[#bbcabf] block">Estimated Payment Due Date</span>
                  <span className="font-semibold text-[#dfe2f1]">5th of following month</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#4edea3] text-[10px] font-bold">
                  20 Days Grace
                </span>
              </div>

              {/* Alert Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                <div>
                  <div className="text-xs font-semibold text-[#dfe2f1]">
                    Minimum Due & Autopay Alert
                  </div>
                  <div className="text-[10px] text-[#bbcabf]">
                    Warn me 48h before due date to protect credit score
                  </div>
                </div>
                <button
                  onClick={() => setAutoAlert(!autoAlert)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    autoAlert ? 'bg-[#10b981]' : 'bg-[#313540]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      autoAlert ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Dynamic Section: Debit Account Fields */
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
                Account Specifications
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#3131c0]/20 text-[#c0c1ff] text-[10px] font-bold">
                Auto Passbook
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAccType('savings')}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  accType === 'savings'
                    ? 'bg-[#10b981]/20 border-[#10b981] text-[#4edea3]'
                    : 'bg-[#171b26] border-white/[0.04] text-[#bbcabf]'
                }`}
              >
                Savings Account
              </button>
              <button
                onClick={() => setAccType('current')}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  accType === 'current'
                    ? 'bg-[#10b981]/20 border-[#10b981] text-[#4edea3]'
                    : 'bg-[#171b26] border-white/[0.04] text-[#bbcabf]'
                }`}
              >
                Current Account
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#1c1f2a] border border-white/[0.04] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#dfe2f1]">Real-Time Passbook Sync</div>
                  <div className="text-[10px] text-[#bbcabf]">Auto-parse SMS & RBI Account Aggregator</div>
                </div>
                <button
                  onClick={() => setPassbookSync(!passbookSync)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    passbookSync ? 'bg-[#10b981]' : 'bg-[#313540]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      passbookSync ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                <div>
                  <div className="text-xs font-bold text-[#dfe2f1]">UPI Auto-Categorization</div>
                  <div className="text-[10px] text-[#bbcabf]">Tag merchant spends instantly via VPA</div>
                </div>
                <button
                  onClick={() => setUpiCategorize(!upiCategorize)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    upiCategorize ? 'bg-[#10b981]' : 'bg-[#313540]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      upiCategorize ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Guarantee Pill Banner */}
        <div className="p-3.5 rounded-xl bg-[#0a0e18] border border-white/[0.04] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#10b981]/15 text-[#4edea3] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">enhanced_encryption</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#dfe2f1]">
              <span>256-Bit Bank Grade Tokenization</span>
              <span className="material-symbols-outlined text-[14px] text-[#4edea3]">gpp_good</span>
            </div>
            <p className="text-[10px] text-[#bbcabf] mt-0.5">
              Compliant with RBI tokenization directives. Actual CVV & secrets never touch cloud servers.
            </p>
          </div>
        </div>

        {/* Bottom CTA Action Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className={`w-full py-4 rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
              success
                ? 'bg-[#4edea3] text-[#002113]'
                : 'bg-[#10b981] text-[#002113] shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:brightness-105'
            }`}
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                <span>Encrypting & Tokenizing...</span>
              </>
            ) : success ? (
              <>
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>Card Secured & Linked!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">shield_lock</span>
                <span>Save Card & Setup Alerts</span>
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-[#bbcabf] mt-2">
            Zero spam • Card can be detached anytime with 1 tap
          </p>
        </div>
      </div>
    </div>
  );
};
