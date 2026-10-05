import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, PaymentCard, BudgetItem, Transaction, ChatMessage } from '../types';
import { MarkdownContent } from './MarkdownContent';
import { AURA_ASSISTANT_AVATAR } from '../data/mockData';
import { User as FirebaseUser } from 'firebase/auth';
import { saveChatMessage, subscribeToChatMessages } from '../firebase/service';

export type { ChatMessage };

interface AuraChatbotProps {
  user: UserProfile;
  firebaseUser?: FirebaseUser | null;
  transactions: Transaction[];
  cards: PaymentCard[];
  budgets: BudgetItem[];
  currentScreen: string;
  onSaveTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onSaveTransactions?: (transactions: Omit<Transaction, 'id'>[]) => void;
  onDeleteTransaction: (id: string) => void;
  onSaveCard: (card: PaymentCard) => void;
  onSaveBudget: (budget: BudgetItem) => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onNavigate: (screen: 'dashboard' | 'analytics' | 'assistant' | 'transactions' | 'profile' | 'addCard') => void;
  onSelectTransaction?: (tx: Transaction) => void;
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

const AURA_LOADING_PHRASES = [
  'Thinking...',
  'Processing natural language request...',
  'Deciphering transaction parameters...',
  'Parsing merchant & currency entities...',
  'Evaluating monthly budget cadence...',
  'Allocating ledger categories...',
  'Resolving personal vault surplus...',
  'Cross-referencing historical records...',
  'Synthesizing execution payload...',
  'Validating ledger integrity...',
  'Formulating response...',
];

interface ParsedDoneTask {
  actionLabel: string;
  title: string;
  amount?: string;
  isPositive?: boolean;
  icon: string;
  iconColor: string;
  success: boolean;
}

function parseDoneTask(exec: { tool: string; summary: string; icon: string; success: boolean }): ParsedDoneTask {
  const summary = exec.summary || '';

  // 1. Inflow pattern: "Recorded Inflow: Room Rent Income (+₹6,000)"
  const inflowMatch = summary.match(/Recorded Inflow:\s*(.+?)\s*\((\+?[^)]+)\)/i);
  if (inflowMatch) {
    return {
      actionLabel: 'Inflow',
      title: inflowMatch[1].trim(),
      amount: inflowMatch[2].trim(),
      isPositive: true,
      icon: 'south_west',
      iconColor: 'text-emerald-500 dark:text-[#4edea3]',
      success: exec.success,
    };
  }

  // 2. Expense pattern: "Logged Expense: House Loan (-₹18,000)"
  const expenseMatch = summary.match(/Logged Expense:\s*(.+?)\s*\((\-?[^)]+)\)/i);
  if (expenseMatch) {
    return {
      actionLabel: 'Expense',
      title: expenseMatch[1].trim(),
      amount: expenseMatch[2].trim(),
      isPositive: false,
      icon: 'north_east',
      iconColor: 'text-slate-500 dark:text-[#bbcabf]',
      success: exec.success,
    };
  }

  // 3. Scheduled Bill pattern: "Scheduled Bill: Internet (₹1,500)"
  const billMatch = summary.match(/Scheduled Bill:\s*(.+?)\s*\(([^)]+)\)/i);
  if (billMatch) {
    return {
      actionLabel: 'Bill',
      title: billMatch[1].trim(),
      amount: billMatch[2].trim(),
      isPositive: false,
      icon: 'event_repeat',
      iconColor: 'text-amber-500 dark:text-amber-400',
      success: exec.success,
    };
  }

  // 4. Deleted transaction pattern: "Deleted transaction: Netflix (₹650)"
  const deleteMatch = summary.match(/Deleted transaction:\s*(.+?)\s*\(([^)]+)\)/i);
  if (deleteMatch) {
    return {
      actionLabel: 'Removed',
      title: deleteMatch[1].trim(),
      amount: deleteMatch[2].trim(),
      isPositive: false,
      icon: 'delete_outline',
      iconColor: 'text-rose-400',
      success: exec.success,
    };
  }

  // 5. Card linked: "Linked Card: HDFC Bank Millennia (•• 4321)"
  const cardMatch = summary.match(/Linked Card:\s*(.+?)\s*\(([^)]+)\)/i);
  if (cardMatch) {
    return {
      actionLabel: 'Card',
      title: cardMatch[1].trim(),
      amount: cardMatch[2].trim(),
      icon: 'credit_card',
      iconColor: 'text-sky-500 dark:text-sky-400',
      success: exec.success,
    };
  }

  // 6. Budget configured: "Budget Configured: Groceries (₹10,000)"
  const budgetMatch = summary.match(/Budget Configured:\s*(.+?)\s*\(([^)]+)\)/i);
  if (budgetMatch) {
    return {
      actionLabel: 'Budget',
      title: budgetMatch[1].trim(),
      amount: budgetMatch[2].trim(),
      icon: 'track_changes',
      iconColor: 'text-purple-500 dark:text-purple-400',
      success: exec.success,
    };
  }

  // 7. Profile update: "Updated Profile: monthlyBaseIncome"
  const profileMatch = summary.match(/Updated Profile:\s*(.+)/i);
  if (profileMatch) {
    return {
      actionLabel: 'Profile',
      title: 'Profile Updated',
      amount: profileMatch[1].trim(),
      icon: 'manage_accounts',
      iconColor: 'text-indigo-500 dark:text-indigo-400',
      success: exec.success,
    };
  }

  // 8. Navigation: "Navigated to TRANSACTIONS"
  const navMatch = summary.match(/Navigated to\s*(.+)/i);
  if (navMatch) {
    return {
      actionLabel: 'Navigate',
      title: `Switched to ${navMatch[1].trim()}`,
      icon: 'near_me',
      iconColor: 'text-teal-500 dark:text-teal-400',
      success: exec.success,
    };
  }

  return {
    actionLabel: exec.tool || 'Task',
    title: summary,
    icon: exec.icon || 'arrow_right_alt',
    iconColor: exec.success ? 'text-emerald-500 dark:text-[#4edea3]' : 'text-rose-500 dark:text-rose-400',
    success: exec.success,
  };
}

export const AuraChatbot: React.FC<AuraChatbotProps> = ({
  user,
  firebaseUser,
  transactions,
  cards,
  budgets,
  currentScreen,
  onSaveTransaction,
  onSaveTransactions,
  onDeleteTransaction,
  onSaveCard,
  onSaveBudget,
  onUpdateUser,
  onNavigate,
  onSelectTransaction,
}) => {
  const storageKey = firebaseUser ? `aura_chat_history_${firebaseUser.uid}` : 'aura_chat_history';

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey) || sessionStorage.getItem('aura_chat_history');
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved);
        return parsed.map((m) => (m.id === 'msg-intro' ? INITIAL_MESSAGES[0] : m));
      }
    } catch {}
    return INITIAL_MESSAGES;
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle through Claude Code-style rich vocabulary messages while loading
  useEffect(() => {
    if (!isLoading) {
      setLoadingPhraseIndex(0);
      setElapsedSeconds(0);
      return;
    }

    const phraseTimer = setInterval(() => {
      setLoadingPhraseIndex((prev) => (prev + 1) % AURA_LOADING_PHRASES.length);
    }, 1800);

    const elapsedTimer = setInterval(() => {
      setElapsedSeconds((prev) => +(prev + 0.1).toFixed(1));
    }, 100);

    return () => {
      clearInterval(phraseTimer);
      clearInterval(elapsedTimer);
    };
  }, [isLoading]);

  // Auto-scroll on new message and loading state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Subscribe to real-time chat messages from Firestore for signed-in users
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = subscribeToChatMessages(firebaseUser.uid, (remoteMessages) => {
      if (remoteMessages && remoteMessages.length > 0) {
        setMessages(remoteMessages);
        try {
          localStorage.setItem(`aura_chat_history_${firebaseUser.uid}`, JSON.stringify(remoteMessages));
        } catch {}
      }
    });

    return () => {
      unsubscribe();
    };
  }, [firebaseUser]);

  // Persist conversation locally for offline & instant reload
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
      sessionStorage.setItem('aura_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages, storageKey]);

  const executeToolCalls = (functionCalls: any[]): { tool: string; summary: string; icon: string; success: boolean; transactionId?: string }[] => {
    const executed: { tool: string; summary: string; icon: string; success: boolean; transactionId?: string }[] = [];
    const transactionsToAdd: Transaction[] = [];

    for (const call of functionCalls) {
      const { name, args } = call;
      try {
        if (name === 'addTransaction') {
          const rawAmount = Number(args.amount) || 0;
          const isRecurring = Boolean(args.isRecurring);
          const merchant = args.merchant || (isRecurring ? 'Recurring Bill' : 'Expense');
          const category = args.category || (isRecurring ? 'Utilities' : 'General');
          const categoryType = args.categoryType || (isRecurring ? 'BILLS' : 'OTHER');

          const txId = `tx-${Date.now()}-${transactionsToAdd.length}-${Math.random().toString(36).substring(2, 7)}`;
          const txData: Transaction = {
            id: txId,
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
          };

          transactionsToAdd.push(txData);

          executed.push({
            tool: 'addTransaction',
            transactionId: txId,
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

    // Atomically persist all added transactions
    if (transactionsToAdd.length > 0) {
      if (onSaveTransactions) {
        onSaveTransactions(transactionsToAdd);
      } else {
        transactionsToAdd.forEach((tx) => onSaveTransaction(tx));
      }
    }

    return executed;
  };

  const handleTaskClick = (exec: { tool: string; summary: string; icon: string; success: boolean; transactionId?: string }) => {
    if (!onSelectTransaction) return;

    const task = parseDoneTask(exec);
    const isTx = ['inflow', 'expense', 'bill'].includes(task.actionLabel.toLowerCase()) || exec.tool === 'addTransaction';
    if (!isTx) return;

    // 1. Look up in active transactions state
    let matched: Transaction | undefined;
    if (exec.transactionId) {
      matched = transactions.find((t) => t.id === exec.transactionId);
    }
    if (!matched) {
      matched = transactions.find((t) => t.merchant.toLowerCase() === task.title.toLowerCase());
    }

    if (matched) {
      onSelectTransaction(matched);
      return;
    }

    // 2. Build complete fallback Transaction object so popup opens reliably
    const rawNum = Number((task.amount || '').replace(/[^0-9.-]+/g, '')) || 0;
    const finalAmount = task.isPositive ? Math.abs(rawNum) : -Math.abs(rawNum);

    const fallbackTx: Transaction = {
      id: exec.transactionId || `tx-${Date.now()}`,
      merchant: task.title,
      amount: finalAmount,
      category: task.actionLabel === 'Bill' ? 'Utilities' : 'General',
      categoryType: task.actionLabel === 'Bill' ? 'BILLS' : 'OTHER',
      date: 'Today',
      dateGroup: 'TODAY',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      account: cards[0] ? `${cards[0].bankName} •• ${cards[0].last4}` : 'Primary Ledger',
      status: 'completed',
      icon: task.actionLabel === 'Bill' ? 'bolt' : task.isPositive ? 'arrow_downward' : 'shopping_bag',
      isRecurring: task.actionLabel === 'Bill',
      notes: 'Logged via Aura Assistant',
    };

    onSelectTransaction(fallbackTx);
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
    if (firebaseUser) {
      saveChatMessage(firebaseUser.uid, userMsg);
    }
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
        saveChatMessage(firebaseUser.uid, assistantMsg);
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
        saveChatMessage(firebaseUser.uid, errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-full min-h-0 overflow-hidden px-4 pb-1 text-slate-800 dark:text-[#dfe2f1] font-sans relative">
      {/* Scrollable Message Thread - Plain Text & Left Avatar Layout with Full Light & Dark Support */}
      <div className="flex-1 min-h-0 overflow-y-auto py-2 space-y-4 no-scrollbar">
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

              {/* Flat-Themed Execution Ledger (No individual boxes, no trailing ticks) */}
              {m.toolExecutions && m.toolExecutions.length > 0 && (
                <div className="mt-2.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.03] divide-y divide-slate-200/50 dark:divide-white/[0.04] overflow-hidden text-xs select-none">
                  {m.toolExecutions.map((exec, idx) => {
                    const task = parseDoneTask(exec);
                    const isClickable = Boolean(onSelectTransaction) && (
                      ['inflow', 'expense', 'bill'].includes(task.actionLabel.toLowerCase()) || exec.tool === 'addTransaction'
                    );

                    return (
                      <div
                        key={idx}
                        onClick={() => isClickable && handleTaskClick(exec)}
                        role={isClickable ? 'button' : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        title={isClickable ? `View details for ${task.title}` : undefined}
                        className={`flex items-center justify-between py-2 px-3 gap-3 transition-colors ${
                          isClickable
                            ? 'cursor-pointer hover:bg-slate-200/60 dark:hover:bg-white/[0.06] active:bg-slate-200/90 dark:active:bg-white/[0.09]'
                            : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                        }`}
                      >
                        {/* Left: Minimal Flat Icon & Clean Title */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className={`material-symbols-outlined text-[15px] shrink-0 ${task.iconColor}`}>
                            {task.icon}
                          </span>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-slate-800 dark:text-[#dfe2f1] truncate">
                              {task.title}
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-[#bbcabf]/50 shrink-0">
                              • {task.actionLabel}
                            </span>
                          </div>
                        </div>

                        {/* Right: Crisp Monetary Value + Subtle chevron hint for clickable expense */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {task.amount && (
                            <span
                              className={`font-mono text-xs font-semibold shrink-0 tracking-tight ${
                                task.isPositive === true
                                  ? 'text-emerald-600 dark:text-[#4edea3]'
                                  : task.isPositive === false
                                  ? 'text-slate-700 dark:text-[#dfe2f1]'
                                  : 'text-slate-600 dark:text-[#bbcabf]'
                              }`}
                            >
                              {task.amount}
                            </span>
                          )}
                          {isClickable && (
                            <span className="material-symbols-outlined text-[14px] text-slate-400/70 dark:text-[#bbcabf]/50">
                              chevron_right
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 py-1.5 animate-in fade-in duration-200">
            {/* Left: Avatar with pulsing Aura multi-color gradient border */}
            <div className="relative w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#ff3b30] via-[#ff9500] via-[#ffcc00] via-[#34c759] via-[#007aff] to-[#af52de] shrink-0 animate-pulse mt-0.5">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#171b26]">
                <img
                  src={AURA_ASSISTANT_AVATAR}
                  alt="Aura"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Right: Multi-color Loading Card with Claude-Code Vocabulary Messages */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold bg-gradient-to-r from-[#ff3b30] via-[#34c759] to-[#007aff] bg-clip-text text-transparent">
                  Aura
                </span>
                <span className="text-[10px] text-slate-400 dark:text-[#bbcabf]/50 font-mono">
                  {elapsedSeconds.toFixed(1)}s
                </span>
              </div>

              <div className="inline-flex flex-col gap-1.5 py-2 px-3 rounded-xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 max-w-full">
                <div className="flex items-center gap-2.5">
                  {/* Multi-color Aura spinner ring */}
                  <div className="relative w-4 h-4 shrink-0">
                    <div className="w-4 h-4 rounded-full p-[1.5px] bg-gradient-to-tr from-[#ff3b30] via-[#ff9500] via-[#ffcc00] via-[#34c759] via-[#007aff] to-[#af52de] animate-spin">
                      <div className="w-full h-full rounded-full bg-slate-100 dark:bg-[#171b26]" />
                    </div>
                  </div>

                  {/* Dynamic Claude Code-Style Rich Vocabulary Message */}
                  <span
                    key={loadingPhraseIndex}
                    className="text-xs font-mono text-slate-700 dark:text-[#dfe2f1] tracking-tight animate-in fade-in slide-in-from-bottom-1 duration-200 truncate"
                  >
                    {AURA_LOADING_PHRASES[loadingPhraseIndex]}
                  </span>

                  {/* Multi-color Wave Dots (Aura palette: Red, Amber, Green, Blue, Purple) */}
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] animate-bounce [animation-delay:-0.32s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff9500] animate-bounce [animation-delay:-0.16s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007aff] animate-bounce [animation-delay:0.16s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#af52de] animate-bounce [animation-delay:0.32s]" />
                  </div>
                </div>

                {/* Multi-color Aura Gradient Shimmer Progress Line */}
                <div className="w-full h-[2px] rounded-full overflow-hidden bg-slate-200/60 dark:bg-white/5 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff3b30] via-[#ff9500] via-[#ffcc00] via-[#34c759] via-[#007aff] to-[#af52de] animate-pulse opacity-90" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-t border-slate-200/80 dark:border-white/[0.04]">
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
      <div className="pt-2 pb-2 shrink-0 relative z-10">
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
