import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, PaymentCard, BudgetItem, Transaction } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  toolExecutions?: {
    tool: string;
    summary: string;
    icon: string;
    success: boolean;
  }[];
}

interface AuraChatbotProps {
  user: UserProfile;
  transactions: Transaction[];
  cards: PaymentCard[];
  budgets: BudgetItem[];
  currentScreen: string;
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
    text: "Hello. I'm Aura Assistant. What would you like to record, calculate, or update?",
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
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MESSAGES;
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save conversation
  useEffect(() => {
    try {
      sessionStorage.setItem('aura_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

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
        throw new Error(`Server error ${response.status}`);
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
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        text: 'Sorry, I encountered an issue. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[calc(100vh-9.5rem)] px-4 pb-2 text-[#dfe2f1] font-sans relative">
      {/* Clean, professional header: Just Aura Assistant */}
      <div className="flex items-center justify-between py-2.5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#171b26] border border-emerald-500/30 text-[#4edea3] flex items-center justify-center">
            <span className="material-symbols-outlined text-[17px]">smart_toy</span>
          </div>
          <span className="font-bold text-sm text-white">Aura Assistant</span>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs'
                  : 'bg-[#171b26] border border-white/[0.06] text-[#dfe2f1] rounded-tl-xs'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>

              {/* Tool Executions Badge */}
              {m.toolExecutions && m.toolExecutions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5">
                  {m.toolExecutions.map((exec, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-xl text-[11px] font-semibold ${
                        exec.success
                          ? 'bg-[#10b981]/15 border border-[#10b981]/30 text-[#4edea3]'
                          : 'bg-red-500/15 border border-red-500/30 text-red-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{exec.icon}</span>
                      <span className="flex-1 truncate">{exec.summary}</span>
                      <span className="material-symbols-outlined text-[13px]">
                        {exec.success ? 'check' : 'close'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[9px] text-[#bbcabf]/50 font-mono mt-0.5 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="rounded-2xl rounded-tl-xs bg-[#171b26] border border-white/[0.06] px-3.5 py-2.5 text-xs text-[#bbcabf] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
              <span>Working...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-full bg-[#171b26] hover:bg-[#202534] border border-white/[0.06] text-[10px] font-semibold text-[#bbcabf] hover:text-[#4edea3] whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="pt-2 shrink-0">
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
            className="flex-1 h-11 bg-[#171b26] border border-white/10 rounded-xl px-3.5 text-xs text-[#dfe2f1] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#4edea3] transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-[#002113] font-bold flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-40"
            aria-label="Send message"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
