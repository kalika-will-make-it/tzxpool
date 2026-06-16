import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase.ts';
import { UserAccount, UserInvestment, WithdrawalRequest, SystemNotification } from './types.ts';

// Get user profile
export async function getUserProfile(uid: string) {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Create user profile
export async function createUserProfile(uid: string, email: string, name: string, phone: string) {
  const path = `users/${uid}`;
  const profile = {
    uid,
    email,
    name,
    phone,
    balanceUSD: 0,
    totalWithdrawn: 0,
    createdAt: Date.now()
  };
  try {
    await setDoc(doc(db, 'users', uid), profile);
    return profile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update user profile
export async function updateUserProfile(uid: string, fields: Partial<UserAccount>) {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), fields);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Subscribe to user profile
export function subscribeUserProfile(uid: string, callback: (user: any) => void) {
  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        callback(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Subscribe to investments for a single user
export function subscribeInvestments(uid: string, callback: (investments: UserInvestment[]) => void) {
  const path = 'investments';
  const q = query(
    collection(db, 'investments'),
    where('userId', '==', uid),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: UserInvestment[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as UserInvestment);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Subscribe to ALL investments (Admin)
export function subscribeAllInvestments(callback: (investments: UserInvestment[]) => void) {
  const path = 'investments';
  const q = query(
    collection(db, 'investments'),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: UserInvestment[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as UserInvestment);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Create investment
export async function createInvestment(investment: UserInvestment) {
  const path = `investments/${investment.id}`;
  try {
    await setDoc(doc(db, 'investments', investment.id), investment);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update investment
export async function updateInvestment(id: string, fields: Partial<UserInvestment>) {
  const path = `investments/${id}`;
  try {
    await updateDoc(doc(db, 'investments', id), fields);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete investment
export async function deleteInvestment(id: string) {
  const path = `investments/${id}`;
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'investments', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to withdrawals for a single user
export function subscribeWithdrawals(uid: string, callback: (withdrawals: WithdrawalRequest[]) => void) {
  const path = 'withdrawals';
  const q = query(
    collection(db, 'withdrawals'),
    where('userId', '==', uid),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: WithdrawalRequest[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as WithdrawalRequest);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Subscribe to ALL withdrawals (Admin)
export function subscribeAllWithdrawals(callback: (withdrawals: WithdrawalRequest[]) => void) {
  const path = 'withdrawals';
  const q = query(
    collection(db, 'withdrawals'),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: WithdrawalRequest[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as WithdrawalRequest);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Create withdrawal
export async function createWithdrawal(withdrawal: WithdrawalRequest & { userId: string }) {
  const path = `withdrawals/${withdrawal.id}`;
  try {
    await setDoc(doc(db, 'withdrawals', withdrawal.id), withdrawal);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update withdrawal
export async function updateWithdrawal(id: string, fields: Partial<WithdrawalRequest>) {
  const path = `withdrawals/${id}`;
  try {
    await updateDoc(doc(db, 'withdrawals', id), fields);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Subscribe to user notifications
export function subscribeNotifications(uid: string, callback: (notifications: SystemNotification[]) => void) {
  const path = 'notifications';
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', uid),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: SystemNotification[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as SystemNotification);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Create notification
export async function createNotification(notification: SystemNotification & { userId: string }) {
  const path = `notifications/${notification.id}`;
  try {
    await setDoc(doc(db, 'notifications', notification.id), notification);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
