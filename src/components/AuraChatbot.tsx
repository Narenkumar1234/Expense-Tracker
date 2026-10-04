import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, PaymentCard, BudgetItem, Transaction, ChatMessage } from '../types';
import { MarkdownContent } from './MarkdownContent';
import { AURA_ASSISTANT_AVATAR } from '../data/mockData';
import { User as FirebaseUser } from 'firebase/auth';
import {
  subscribeToChatMessages,
  addChatMessage,
  clearChatMessages,
} from '../firebase/service';

interface AuraChatbotProps {
  user: UserProfile;
  transactions: Transaction[];
  cards: PaymentCard[];
  budgets: BudgetItem[];
  currentScreen: string;
  firebaseUser?: FirebaseUser | null;
  onSaveTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onSaveCard: (card: PaymentCard) => void;
  onSaveBudget: (budget: BudgetItem) => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onNavigate: (screen: 'dashboard' | 'analytics' | 'assistant' | 'transactions' | 'profile' | 'addCard') => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-intro',
    role: 'assistant',
    text: "Hello. I'm Aura. What would you like to record, calculate, or update?",
    timestamp: 'Just now',
  },
];

const QUICK_PROMPTS = [
  'Add ₹450 Coffee expense',
  'Add ₹1,200 Electricity bill',
  'Add ICICI credit card •• 3042',
  'Set ₹15,000 Dining budget',
  'What is my safe spending limit?',
];

export const AuraChatbot: React.FC<AuraChatbotProps> = ({
  user,
  transactions,
  cards,
  budgets,
  currentScreen,
  firebaseUser,
  onSaveTransaction,
  onDeleteTransaction,
  onSaveCard,
  onSaveBudget,
  onUpdateUser,
  onNavigate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('aura_chat_history');
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved);
        return parsed.map((m) => (m.id === 'msg-intro' ? INITIAL_MESSAGES[0] : m));
      }
    } catch {}
    return INITIAL_MESSAGES;
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to Firestore Chat Messages when signed in
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = subscribeToChatMessages(firebaseUser.uid, (synced) => {
      if (synced && synced.length > 0) {
        setMessages(synced);
      } else {
        setMessages(INITIAL_MESSAGES);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [firebaseUser]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save guest conversation to session storage
  useEffect(() => {
    if (!firebaseUser) {
      try {
        sessionStorage.setItem('aura_chat_history', JSON.stringify(messages));
      } catch {}
    }
  }, [messages, firebaseUser]);

  const handleClearChat = async () => {
    if (firebaseUser) {
      try {
        await clearChatMessages(firebaseUser.uid);
      } catch (err) {
        console.error('Failed to clear Firestore chat:', err);
      }
    }
    try {
      sessionStorage.removeItem('aura_chat_history');
    } catch {}
    setMessages(INITIAL_MESSAGES);
  };

  const executeToolCalls = (functionCalls: any[]): { tool: string; summary: string; icon: string; success: boolean }[] => {
    const executed: { tool: string; summary: string; icon: string; success: boolean }[] = [];

    for (const call of functionCalls) {
      const { name, args } = call;
      try {
        if (name === 'addTransaction') {
          const rawAmount = Number(args.amount) || 0;
          const isRecurring = Boolean(args.isRecurring);
          const merchant = args.merchant || (isRecurring ? 'Recurring Bill' : 'Expense');
          const category = args.category || (isRecurring ? 'Utilities' : 'General');
          const categoryType = args.categoryType || (isRecurring ? 'BILLS' : 'OTHER');

          onSaveTransaction({
            merchant,
            amount: rawAmount,
            category,
            categoryType,
            date: 'Today',
            dateGroup: 'TODAY',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            account: cards[0] ? `${cards[0].bankName} •• ${cards[0].last4}` : 'Primary Ledger',
            status: 'completed',
            icon: isRecurring ? 'bolt' : rawAmount > 0 ? 'arrow_downward' : 'shopping_bag',
            isRecurring,
            recurringFrequency: args.recurringFrequency || (isRecurring ? 'Monthly' : undefined),
            notes: args.notes || (isRecurring ? 'Recurring bill added by Copilot' : 'Logged via Copilot'),
          });

          executed.push({
            tool: 'addTransaction',
            summary: isRecurring
              ? `Scheduled Bill: ${merchant} (₹${Math.abs(rawAmount).toLocaleString('en-IN')})`
              : rawAmount > 0
              ? `Recorded Inflow: ${merchant} (+₹${rawAmount.toLocaleString('en-IN')})`
              : `Logged Expense: ${merchant} (-₹${Math.abs(rawAmount).toLocaleString('en-IN')})`,
            icon: isRecurring ? 'bolt' : rawAmount > 0 ? 'payments' : 'receipt_long',
            success: true,
          });
        } else if (name === 'deleteTransaction') {
          const targetMerchant = (args.merchant || '').toLowerCase();
          const target = transactions.find(
            (t) => t.id === args.transactionId || t.merchant.toLowerCase().includes(targetMerchant)
          );

          if (target) {
            onDeleteTransaction(target.id);
            executed.push({
              tool: 'deleteTransaction',
              summary: `Deleted transaction: ${target.merchant} (₹${Math.abs(target.amount).toLocaleString('en-IN')})`,
              icon: 'delete',
              success: true,
            });
          } else {
            executed.push({
              tool: 'deleteTransaction',
              summary: `Could not find transaction matching "${args.merchant}"`,
              icon: 'error_outline',
              success: false,
            });
          }
        } else if (name === 'addPaymentCard') {
          const newCard: PaymentCard = {
            id: 'card-' + Date.now(),
            bankName: args.bankName || 'HDFC Bank',
            variant: args.variant || 'Card',
            cardholderName: user.name.toUpperCase(),
            cardNumber: `•••• •••• •••• ${args.last4 || '1234'}`,
            last4: args.last4 || '1234',
            type: args.type === 'debit' ? 'debit' : 'credit',
            network: 'VISA',
            expiry: '12/29',
            availableBalance: Number(args.availableBalance) || 50000,
            isDefault: cards.length === 0,
          };

          onSaveCard(newCard);
          executed.push({
            tool: 'addPaymentCard',
            summary: `Linked Card: ${newCard.bankName} ${newCard.variant} (•• ${newCard.last4})`,
            icon: 'credit_card',
            success: true,
          });
        } else if (name === 'addOrUpdateBudget') {
          const allocated = Number(args.allocatedAmount) || 10000;
          const newBudget: BudgetItem = {
            id: 'b-' + Date.now(),
            name: args.name || 'Custom Budget',
            category: args.category || 'OTHER',
            allocated,
            spent: 0,
            statusText: 'Configured by Assistant',
            statusType: 'normal',
            icon: 'account_balance_wallet',
            color: '#10b981',
          };

          onSaveBudget(newBudget);
          executed.push({
            tool: 'addOrUpdateBudget',
            summary: `Budget Configured: ${newBudget.name} (₹${allocated.toLocaleString('en-IN')})`,
            icon: 'track_changes',
            success: true,
          });
        } else if (name === 'updateUserProfile') {
          const updates: Partial<UserProfile> = {};
          if (args.name) updates.name = args.name;
          if (args.monthlyBaseIncome) updates.monthlyBaseIncome = Number(args.monthlyBaseIncome);
          if (args.salarySchedule) updates.salarySchedule = args.salarySchedule;
          if (args.billRemindersActive !== undefined) updates.billRemindersActive = Boolean(args.billRemindersActive);

          onUpdateUser(updates);
          executed.push({
            tool: 'updateUserProfile',
            summary: `Updated Profile: ${Object.keys(updates).join(', ')}`,
            icon: 'manage_accounts',
            success: true,
          });
        } else if (name === 'navigateScreen') {
          const screen = args.screen;
          if (['dashboard', 'analytics', 'assistant', 'transactions', 'profile', 'addCard'].includes(screen)) {
            onNavigate(screen as any);
            executed.push({
              tool: 'navigateScreen',
              summary: `Navigated to ${screen.toUpperCase()}`,
              icon: 'navigation',
              success: true,
            });
          }
        }
      } catch (err: any) {
        console.error('Tool execution error:', err);
        executed.push({
          tool: name,
          summary: `Failed to execute ${name}`,
          icon: 'warning',
          success: false,
        });
      }
    }

    return executed;
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    setInput('');

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    if (firebaseUser) {
      addChatMessage(firebaseUser.uid, userMsg).catch((e) =>
        console.error('Failed to sync user message to Firestore:', e)
      );
    }

    try {
      // Cost-optimized single model
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          context: {
            user,
            cards,
            budgets,
            transactions: transactions.slice(0, 10),
            currentScreen,
          },
        }),
      });

      if (!response.ok) {
        let errorDetail = '';
        try {
          const errData = await response.json();
          errorDetail = errData?.error || '';
        } catch {
          if (response.status === 404) {
            errorDetail = 'API endpoint /api/chat not found (404). Ensure vercel.json and api/chat.ts are included in your Vercel deployment.';
          }
        }
        throw new Error(errorDetail || `Server error ${response.status}`);
      }

      const data = await response.json();
      const functionCalls = data.functionCalls || [];
      const toolExecutions = functionCalls.length > 0 ? executeToolCalls(functionCalls) : undefined;

      const assistantMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        text: data.text || (toolExecutions && toolExecutions.length > 0 ? 'Done.' : 'Understood.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolExecutions,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (firebaseUser) {
        addChatMessage(firebaseUser.uid, assistantMsg).catch((e) =>
          console.error('Failed to sync assistant message to Firestore:', e)
        );
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const msgText = String(err?.message || '');
      const isMissingKey = msgText.includes('GEMINI_API_KEY');
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        text: isMissingKey
          ? 'GEMINI_API_KEY is not configured in Vercel. Go to Vercel Project Settings > Environment Variables, add GEMINI_API_KEY, and redeploy.'
          : err?.message || 'Sorry, I encountered an issue. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);

      if (firebaseUser) {
        addChatMessage(firebaseUser.uid, errorMsg).catch((e) =>
          console.error('Failed to sync error message to Firestore:', e)
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md mx-auto flex flex-col px-4 text-slate-800 dark:text-[#dfe2f1] font-sans relative overflow-hidden"
      style={{
        height: 'calc(100dvh - 7.5rem - env(safe-area-inset-top, 0px) - max(calc(env(safe-area-inset-bottom, 0px) - 14px), 0px))',
        maxHeight: 'calc(100dvh - 7.5rem - env(safe-area-inset-top, 0px) - max(calc(env(safe-area-inset-bottom, 0px) - 14px), 0px))',
        paddingBottom: '0.75rem',
      }}
    >
      {/* Top Bar with Cloud Sync Status & Clear Chat Button */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200/80 dark:border-white/[0.06] shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="font-semibold text-slate-800 dark:text-[#dfe2f1]">Aura</span>
          {firebaseUser && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#4edea3] font-mono border border-emerald-500/20">
              Cloud Synced
            </span>
          )}
        </div>
        <button
          onClick={handleClearChat}
          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:text-[#bbcabf] dark:hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05]"
          title="Clear Conversation"
        >
          <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
          <span>Clear</span>
        </button>
      </div>

      {/* Scrollable Message Thread - Plain Text & Left Avatar Layout with Full Light & Dark Support */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 no-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className="flex items-start gap-3 py-1 animate-in fade-in duration-150">
            {/* Left: Avatar indication */}
            {m.role === 'user' ? (
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-300 dark:ring-white/10 shadow-xs mt-0.5 bg-slate-100 dark:bg-[#171b26]">
                <img
                  src={user.avatarUrl}
                  alt={user.name || 'You'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-300 dark:ring-white/10 shadow-xs mt-0.5 bg-slate-100 dark:bg-[#171b26]">
                <img
                  src={AURA_ASSISTANT_AVATAR}
                  alt="Aura"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Right: Plain Text Message Body without card background */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-semibold ${
                    m.role === 'user'
                      ? 'text-slate-900 dark:text-white'
                      : 'text-emerald-700 dark:text-[#4edea3]'
                  }`}
                >
                  {m.role === 'user' ? 'You' : 'Aura'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-[#bbcabf]/50 font-mono">
                  {m.timestamp}
                </span>
              </div>

              {/* Markdown parsed text content */}
              <MarkdownContent content={m.text} isUser={m.role === 'user'} />

              {/* Inline Action Result (sleek & professional in both themes) */}
              {m.toolExecutions && m.toolExecutions.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {m.toolExecutions.map((exec, idx) => (
                    <div
                      key={idx}
                      className={`inline-flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-xs font-medium ${
                        exec.success
                          ? 'bg-emerald-50 dark:bg-[#10b981]/10 border border-emerald-200 dark:border-[#10b981]/25 text-emerald-700 dark:text-[#4edea3]'
                          : 'bg-rose-50 dark:bg-red-500/10 border border-rose-200 dark:border-red-500/25 text-rose-700 dark:text-red-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{exec.icon}</span>
                      <span className="text-slate-800 dark:text-[#dfe2f1] font-mono text-[11px]">
                        {exec.summary}
                      </span>
                      <span className="material-symbols-outlined text-[13px]">
                        {exec.success ? 'check' : 'close'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 py-1 animate-in fade-in">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-300 dark:ring-white/10 shadow-xs mt-0.5 bg-slate-100 dark:bg-[#171b26]">
              <img
                src={AURA_ASSISTANT_AVATAR}
                alt="Aura"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-emerald-700 dark:text-[#4edea3]">
                  Aura
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#bbcabf] py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#10b981] animate-ping" />
                <span className="text-[12px] text-slate-500 dark:text-[#bbcabf]/70 font-mono">
                  Working...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-t border-slate-200/80 dark:border-white/[0.04]">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-[#171b26] hover:bg-slate-50 dark:hover:bg-[#202534] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 text-[11px] font-medium text-slate-700 dark:text-[#bbcabf] hover:text-emerald-700 dark:hover:text-[#4edea3] shadow-xs dark:shadow-none whitespace-nowrap transition-all cursor-pointer active:scale-95 shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="pt-2 pb-1 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a request (e.g. 'Add ₹1,200 Electricity bill')..."
            disabled={isLoading}
            onFocus={() => {
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 200);
            }}
            className="flex-1 h-11 bg-white dark:bg-[#171b26] border border-slate-300 dark:border-white/10 focus:border-emerald-500 dark:focus:border-[#4edea3]/50 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-[#4edea3]/30 rounded-xl px-3.5 text-xs text-slate-900 dark:text-[#dfe2f1] placeholder:text-slate-400 dark:placeholder:text-[#bbcabf]/40 focus:outline-none transition-all shadow-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-400 dark:hover:opacity-95 text-white dark:text-[#002113] font-bold flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-40"
            aria-label="Send message"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
