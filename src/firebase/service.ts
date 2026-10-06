import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from './config';
import { Transaction, PaymentCard, BudgetItem, UserProfile, ChatMessage } from '../types';

// Auth services
let activeLoginPromise: Promise<FirebaseUser | null> | null = null;

export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  // If a login popup is already in progress, reuse the existing promise to prevent overlapping popups
  if (activeLoginPromise) {
    return activeLoginPromise;
  }

  activeLoginPromise = (async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user document already exists
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Aura User',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (docErr) {
        console.warn('User document sync notice:', docErr);
      }

      return user;
    } catch (error: any) {
      const errorCode = error?.code || '';
      const errorMessage = String(error?.message || '');

      // User closed the popup window - normal user action, not a system failure
      if (
        errorCode === 'auth/popup-closed-by-user' ||
        errorCode === 'auth/cancelled-popup-request'
      ) {
        console.info('Google Sign-in was dismissed by user.');
        return null;
      }

      // Popup blocked by browser policy
      if (errorCode === 'auth/popup-blocked') {
        console.warn('Sign-in popup blocked by browser settings.');
        throw new Error('Sign-in popup was blocked. Please enable popups or continue as Guest.');
      }

      // Unauthorized domain (e.g. Vercel deployment not added to Firebase Authorized Domains)
      if (
        errorCode === 'auth/unauthorized-domain' ||
        errorMessage.toLowerCase().includes('unauthorized domain') ||
        errorMessage.toLowerCase().includes('requested action is invalid')
      ) {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your deployment domain';
        console.error(`Firebase Auth Error: Domain "${domain}" is not authorized.`);
        throw new Error(
          `Domain "${domain}" is not whitelisted. Add it to Authorized Domains in Firebase Console > Authentication > Settings.`
        );
      }

      // Firebase internal assertion race condition when a previous popup is closed
      if (errorMessage.includes('Pending promise was never set')) {
        console.info('Sign-in promise cleared after popup dismissal.');
        return null;
      }

      console.warn('Google Sign-In notice:', errorMessage);
      throw error;
    } finally {
      activeLoginPromise = null;
    }
  })();

  return activeLoginPromise;
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-Out Error:', error);
    throw error;
  }
}

export function subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// User Profile Firestore Synchronization
export async function saveUserProfile(
  userId: string,
  profile: Partial<UserProfile> & { hasCompletedOnboarding?: boolean }
): Promise<void> {
  const docPath = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const cleanedProfile: Record<string, any> = {
      uid: userId,
      updatedAt: new Date().toISOString(),
    };

    if (profile.name !== undefined) cleanedProfile.displayName = profile.name;
    if (profile.email !== undefined) cleanedProfile.email = profile.email;
    if (profile.avatarUrl !== undefined) cleanedProfile.photoURL = profile.avatarUrl;
    if (profile.monthlyBaseIncome !== undefined) cleanedProfile.monthlyBaseIncome = profile.monthlyBaseIncome;
    if (profile.salarySchedule !== undefined) cleanedProfile.salarySchedule = profile.salarySchedule;
    if (profile.sideStreams !== undefined) cleanedProfile.sideStreams = profile.sideStreams;
    if (profile.sideStreamLabel !== undefined) cleanedProfile.sideStreamLabel = profile.sideStreamLabel;
    if (profile.budgetRatio !== undefined) cleanedProfile.budgetRatio = profile.budgetRatio;
    if (profile.tier !== undefined) cleanedProfile.tier = profile.tier;
    if (profile.billRemindersActive !== undefined) cleanedProfile.billRemindersActive = profile.billRemindersActive;
    if (profile.highValueThreshold !== undefined) cleanedProfile.highValueThreshold = profile.highValueThreshold;
    if (profile.defaultCardId !== undefined) cleanedProfile.defaultCardId = profile.defaultCardId;
    if (profile.hasCompletedOnboarding !== undefined) cleanedProfile.hasCompletedOnboarding = profile.hasCompletedOnboarding;

    await setDoc(userDocRef, cleanedProfile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function fetchUserProfile(
  userId: string
): Promise<(Partial<UserProfile> & { hasCompletedOnboarding?: boolean }) | null> {
  const docPath = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        name: data.displayName || data.name || 'Aura User',
        email: data.email || '',
        avatarUrl: data.photoURL || data.avatarUrl || '',
        monthlyBaseIncome: Number(data.monthlyBaseIncome) || 0,
        salarySchedule: data.salarySchedule || '1st of every month',
        sideStreams: Number(data.sideStreams) || 0,
        sideStreamLabel: data.sideStreamLabel || 'None',
        budgetRatio: data.budgetRatio || {
          needsPercent: 50,
          needsAmount: 0,
          wantsPercent: 30,
          wantsAmount: 0,
          savingsPercent: 20,
          savingsAmount: 0,
          totalTarget: 0,
        },
        tier: data.tier || 'Personal',
        billRemindersActive: data.billRemindersActive ?? true,
        highValueThreshold: Number(data.highValueThreshold) || 10000,
        defaultCardId: data.defaultCardId || '',
        hasCompletedOnboarding: Boolean(data.hasCompletedOnboarding),
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

// Transactions Firestore Synchronization
export function subscribeToTransactions(
  userId: string,
  callback: (transactions: Transaction[]) => void
): () => void {
  const collectionPath = `users/${userId}/transactions`;
  const txRef = collection(db, 'users', userId, 'transactions');

  return onSnapshot(
    txRef,
    (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: data.id || d.id,
          merchant: data.merchant || 'Merchant',
          category: data.category || 'General',
          categoryType: data.categoryType || 'OTHER',
          amount: Number(data.amount) || 0,
          date: data.date || 'Today',
          dateGroup: data.dateGroup || 'TODAY',
          time: data.time || '12:00 PM',
          account: data.account || 'Account',
          status: data.status || 'completed',
          icon: data.icon || 'receipt',
          notes: data.notes || '',
          isRecurring: Boolean(data.isRecurring),
          recurringDurationMonths: data.recurringDurationMonths,
          recurringFrequency: data.recurringFrequency,
          monthlyEquivalent: data.monthlyEquivalent,
          totalCommitment: data.totalCommitment,
          remainingCycles: data.remainingCycles,
          cycleEndDate: data.cycleEndDate,
        });
      });
      // Sort newest date/id first
      list.sort((a, b) => b.id.localeCompare(a.id));
      callback(list);
    },
    (error) => {
      console.warn(`Firestore read notice on ${collectionPath}:`, error?.message || error);
    }
  );
}

export async function addTransaction(userId: string, tx: Transaction): Promise<void> {
  const docPath = `users/${userId}/transactions/${tx.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', tx.id);
    const rootRef = doc(db, 'transactions', tx.id);
    const payload: Record<string, any> = {
      id: tx.id,
      userId,
      merchant: tx.merchant,
      category: tx.category,
      categoryType: tx.categoryType || 'OTHER',
      amount: Number(tx.amount),
      date: tx.date,
      time: tx.time || '12:00 PM',
      dateGroup: tx.dateGroup || 'TODAY',
      account: tx.account || 'Account',
      status: tx.status || 'completed',
      icon: tx.icon || 'receipt',
      isRecurring: Boolean(tx.isRecurring),
      notes: tx.notes || '',
      createdAt: new Date().toISOString(),
    };
    if (tx.recurringDurationMonths) {
      payload.recurringDurationMonths = tx.recurringDurationMonths;
    }
    if (tx.monthlyEquivalent) {
      payload.monthlyEquivalent = tx.monthlyEquivalent;
    }
    if (tx.recurringFrequency) {
      payload.recurringFrequency = tx.recurringFrequency;
    }
    // Write to user subcollection
    await setDoc(docRef, payload);

    // Also write to root-level transactions collection for immediate visibility in Firebase Console
    try {
      await setDoc(rootRef, payload);
    } catch (rootErr) {
      console.warn('Root-level transaction mirror notice:', rootErr);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function deleteTransaction(userId: string, txId: string): Promise<void> {
  const docPath = `users/${userId}/transactions/${txId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', txId);
    const rootRef = doc(db, 'transactions', txId);
    await deleteDoc(docRef);
    try {
      await deleteDoc(rootRef);
    } catch {}
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Payment Cards Firestore Synchronization
export function subscribeToCards(
  userId: string,
  callback: (cards: PaymentCard[]) => void
): () => void {
  const collectionPath = `users/${userId}/cards`;
  const cardsRef = collection(db, 'users', userId, 'cards');

  return onSnapshot(
    cardsRef,
    (snapshot) => {
      const list: PaymentCard[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: data.id || d.id,
          bankName: data.bankName || 'Bank',
          variant: data.variant || 'Card',
          cardholderName: data.cardholderName || 'Cardholder',
          cardNumber: data.cardNumber || '•••• •••• •••• ' + (data.last4 || '1234'),
          last4: data.last4 || '1234',
          expiry: data.expiry || '12/28',
          network: data.network || 'VISA',
          type: data.type || 'credit',
          availableBalance: Number(data.availableBalance ?? data.balance ?? 0),
          isDefault: Boolean(data.isDefault),
        });
      });
      callback(list);
    },
    (error) => {
      console.warn(`Firestore read notice on ${collectionPath}:`, error?.message || error);
    }
  );
}

export async function addCard(userId: string, card: PaymentCard): Promise<void> {
  const docPath = `users/${userId}/cards/${card.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'cards', card.id);
    const rootRef = doc(db, 'cards', card.id);
    const payload = {
      id: card.id,
      userId,
      bankName: card.bankName,
      variant: card.variant || 'Card',
      cardholderName: card.cardholderName || 'Cardholder',
      cardNumber: card.cardNumber || `•••• •••• •••• ${card.last4}`,
      last4: card.last4,
      type: card.type,
      network: card.network || 'VISA',
      expiry: card.expiry || '12/29',
      balance: card.availableBalance || 0,
      availableBalance: card.availableBalance || 0,
      creditLimit: card.creditLimit || 250000,
      unbilledSpend: card.unbilledSpend || 0,
      statementDate: card.statementDate || '',
      dueDate: card.dueDate || '',
      colorTheme: card.colorTheme || '',
      isDefault: Boolean(card.isDefault),
      createdAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload);
    try {
      await setDoc(rootRef, payload);
    } catch {}
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function deleteCard(userId: string, cardId: string): Promise<void> {
  const docPath = `users/${userId}/cards/${cardId}`;
  try {
    const docRef = doc(db, 'users', userId, 'cards', cardId);
    const rootRef = doc(db, 'cards', cardId);
    await deleteDoc(docRef);
    try {
      await deleteDoc(rootRef);
    } catch {}
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Budgets Firestore Synchronization
export function subscribeToBudgets(
  userId: string,
  callback: (budgets: BudgetItem[]) => void
): () => void {
  const collectionPath = `users/${userId}/budgets`;
  const budgetsRef = collection(db, 'users', userId, 'budgets');

  return onSnapshot(
    budgetsRef,
    (snapshot) => {
      const list: BudgetItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: data.id || d.id,
          name: data.name || data.category || 'Category',
          category: data.category || 'GENERAL',
          allocated: Number(data.allocatedAmount ?? data.allocated ?? 0),
          spent: Number(data.spentAmount ?? data.spent ?? 0),
          statusText: data.statusText || 'Active',
          statusType: data.statusType || 'normal',
          icon: data.icon || 'category',
          color: data.color || '#4edea3',
        });
      });
      callback(list);
    },
    (error) => {
      console.warn(`Firestore read notice on ${collectionPath}:`, error?.message || error);
    }
  );
}

export async function addBudget(userId: string, budget: BudgetItem): Promise<void> {
  const docPath = `users/${userId}/budgets/${budget.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'budgets', budget.id);
    const rootRef = doc(db, 'budgets', budget.id);
    const payload = {
      id: budget.id,
      userId,
      name: budget.name,
      category: budget.category,
      allocated: budget.allocated || 0,
      allocatedAmount: budget.allocated || 0,
      spent: budget.spent || 0,
      spentAmount: budget.spent || 0,
      icon: budget.icon || 'category',
      color: budget.color || '#4edea3',
      statusText: budget.statusText || 'Fresh budget',
      statusType: budget.statusType || 'normal',
      createdAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload);
    try {
      await setDoc(rootRef, payload);
    } catch {}
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function deleteBudget(userId: string, budgetId: string): Promise<void> {
  const docPath = `users/${userId}/budgets/${budgetId}`;
  try {
    const docRef = doc(db, 'users', userId, 'budgets', budgetId);
    const rootRef = doc(db, 'budgets', budgetId);
    await deleteDoc(docRef);
    try {
      await deleteDoc(rootRef);
    } catch {}
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Migration helper: Uploads guest localStorage items to newly authenticated user's Firestore
export async function migrateGuestDataToFirestore(
  userId: string,
  localData: {
    user?: UserProfile;
    transactions?: Transaction[];
    cards?: PaymentCard[];
    budgets?: BudgetItem[];
  }
): Promise<void> {
  try {
    if (localData.user) {
      await saveUserProfile(userId, {
        ...localData.user,
        hasCompletedOnboarding: true,
      });
    }
    if (localData.transactions && localData.transactions.length > 0) {
      for (const tx of localData.transactions) {
        await addTransaction(userId, tx);
      }
    }
    if (localData.cards && localData.cards.length > 0) {
      for (const card of localData.cards) {
        await addCard(userId, card);
      }
    }
    if (localData.budgets && localData.budgets.length > 0) {
      for (const b of localData.budgets) {
        await addBudget(userId, b);
      }
    }
  } catch (err) {
    console.error('Migration error:', err);
  }
}

// Chat Messages Firestore Synchronization for Signed-In Members
// Uses single session document pattern to load the entire capped conversation in 1 single Firestore read operation
export const CHAT_HISTORY_CAP = 30;

export function subscribeToChatMessages(
  userId: string,
  callback: (messages: ChatMessage[]) => void,
  messageLimit = CHAT_HISTORY_CAP
): () => void {
  const sessionDocRef = doc(db, 'users', userId, 'chat', 'active');
  let hasCheckedLegacy = false;

  return onSnapshot(
    sessionDocRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const list: ChatMessage[] = Array.isArray(data?.messages) ? data.messages : [];
        const capped = list.length > messageLimit ? list.slice(list.length - messageLimit) : list;
        callback(capped);
      } else if (!hasCheckedLegacy) {
        hasCheckedLegacy = true;
        // Migration fallback: check legacy individual messages subcollection if present
        try {
          const messagesRef = collection(db, 'users', userId, 'messages');
          const legacySnap = await getDocs(messagesRef);
          if (!legacySnap.empty) {
            const list: ChatMessage[] = [];
            legacySnap.forEach((d) => {
              const data = d.data();
              list.push({
                id: data.id || d.id,
                role: data.role,
                text: data.text || '',
                timestamp: data.timestamp || 'Just now',
                createdAt: data.createdAt,
                toolExecutions: data.toolExecutions || [],
              });
            });
            list.sort((a, b) => {
              const timeA = a.createdAt || a.id;
              const timeB = b.createdAt || b.id;
              return timeA.localeCompare(timeB);
            });
            const capped = list.length > messageLimit ? list.slice(list.length - messageLimit) : list;
            if (capped.length > 0) {
              callback(capped);
              // Migrate to the 1-read session document for all future sessions
              await setDoc(sessionDocRef, {
                userId,
                updatedAt: new Date().toISOString(),
                messages: capped,
              });
            }
          }
        } catch (migErr) {
          console.warn('Chat legacy sync notice:', migErr);
        }
      }
    },
    (error) => {
      console.warn(`Firestore chat session notice on users/${userId}/chat/active:`, error?.message || error);
    }
  );
}

export async function saveChatMessage(
  userId: string,
  message: ChatMessage,
  currentMessagesList?: ChatMessage[]
): Promise<void> {
  const sessionDocRef = doc(db, 'users', userId, 'chat', 'active');
  try {
    let list: ChatMessage[] = [];
    if (currentMessagesList && currentMessagesList.length > 0) {
      list = [...currentMessagesList];
    } else {
      const snap = await getDoc(sessionDocRef);
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.messages)) {
          list = data.messages;
        }
      }
    }

    const withoutDup = list.filter((m) => m.id !== message.id);
    withoutDup.push(message);
    const capped = withoutDup.length > CHAT_HISTORY_CAP
      ? withoutDup.slice(withoutDup.length - CHAT_HISTORY_CAP)
      : withoutDup;

    // Single-document atomic thread update (1 write, 1 future read for entire conversation)
    await setDoc(
      sessionDocRef,
      {
        userId,
        updatedAt: new Date().toISOString(),
        messages: capped,
      },
      { merge: true }
    );

    // Also persist individual message document for backup / granular querying
    const individualDocRef = doc(db, 'users', userId, 'messages', message.id);
    await setDoc(individualDocRef, {
      id: message.id,
      userId,
      role: message.role,
      text: message.text,
      timestamp: message.timestamp,
      createdAt: message.createdAt || new Date().toISOString(),
      toolExecutions: message.toolExecutions || [],
    });
  } catch (error) {
    console.error(`Error persisting chat message for user ${userId}:`, error);
  }
}
