export interface UserRecord {
  userId: string;
  email?: string;
  name?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRecord {
  id: number;
  userId: string;
  amount: number;
  description: string | null;
  createdAt: string;
}

export interface BalanceData {
  balance: number;
  income: number;
  expenses: number;
}

const DB_NAME = 'smart_expense_db';
const DB_VERSION = 1;
const STORE_USERS = 'users';
const STORE_TRANSACTIONS = 'transactions';

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

export const getDB = (): Promise<IDBDatabase> => {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, {
          keyPath: 'userId',
        });
      }

      if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
        const txStore = db.createObjectStore(STORE_TRANSACTIONS, {
          keyPath: 'id',
          autoIncrement: true,
        });
        txStore.createIndex('userId', 'userId', { unique: false });
        txStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = (event: Event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;

      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
        dbPromise = null;
      };

      dbInstance.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };

      resolve(dbInstance);
    };

    request.onerror = (event: Event) => {
      dbPromise = null;
      reject((event.target as IDBOpenDBRequest).error ?? new Error('Failed to open IndexedDB'));
    };

    request.onblocked = () => {
      console.warn('IndexedDB database open blocked by older version connection');
    };
  });

  return dbPromise;
};

export const syncUserRecord = async (user: {
  userId: string;
  name?: string | null;
  imageUrl?: string | null;
  email?: string;
}): Promise<UserRecord> => {
  const db = await getDB();

  return new Promise<UserRecord>((resolve, reject) => {
    const tx = db.transaction(STORE_USERS, 'readwrite');
    const store = tx.objectStore(STORE_USERS);
    const getRequest = store.get(user.userId);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as UserRecord | undefined;
      const now = new Date().toISOString();

      const userRecord: UserRecord = existing
        ? {
            ...existing,
            name: user.name ?? existing.name,
            imageUrl: user.imageUrl ?? existing.imageUrl,
            email: user.email ?? existing.email,
            updatedAt: now,
          }
        : {
            userId: user.userId,
            name: user.name ?? null,
            imageUrl: user.imageUrl ?? null,
            email: user.email,
            createdAt: now,
            updatedAt: now,
          };

      const putRequest = store.put(userRecord);

      putRequest.onsuccess = () => resolve(userRecord);
      putRequest.onerror = () =>
        reject(putRequest.error ?? new Error('Failed to save user record'));
    };

    getRequest.onerror = () =>
      reject(getRequest.error ?? new Error('Failed to check user in IndexedDB'));
  });
};

export const DEFAULT_USER_ID = 'local-user';

export const getTransactionsByUserId = async (
  userId: string = DEFAULT_USER_ID,
): Promise<TransactionRecord[]> => {
  const db = await getDB();

  return new Promise<TransactionRecord[]>((resolve, reject) => {
    const tx = db.transaction(STORE_TRANSACTIONS, 'readonly');
    const store = tx.objectStore(STORE_TRANSACTIONS);
    const request = store.getAll();

    request.onsuccess = () => {
      let results = (request.result as TransactionRecord[]) ?? [];
      if (userId) {
        results = results.filter((t) => !t.userId || t.userId === userId);
      }
      // Sort descending by createdAt (newest first)
      results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      resolve(results);
    };

    request.onerror = () =>
      reject(request.error ?? new Error('Failed to fetch transactions from IndexedDB'));
  });
};

export const addTransactionRecord = async (
  amount: number,
  description: string | null,
  userId: string = DEFAULT_USER_ID,
): Promise<TransactionRecord> => {
  const db = await getDB();

  return new Promise<TransactionRecord>((resolve, reject) => {
    const tx = db.transaction(STORE_TRANSACTIONS, 'readwrite');
    const store = tx.objectStore(STORE_TRANSACTIONS);

    const now = new Date().toISOString();
    const newRecord: Omit<TransactionRecord, 'id'> = {
      userId,
      amount,
      description,
      createdAt: now,
    };

    const addRequest = store.add(newRecord);

    addRequest.onsuccess = () => {
      const generatedId = addRequest.result as number;
      resolve({
        ...newRecord,
        id: generatedId,
      });
    };

    addRequest.onerror = () =>
      reject(addRequest.error ?? new Error('Failed to create transaction in IndexedDB'));
  });
};

export const deleteTransactionRecord = async (
  id: number,
  userId: string = DEFAULT_USER_ID,
): Promise<void> => {
  const db = await getDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_TRANSACTIONS, 'readwrite');
    const store = tx.objectStore(STORE_TRANSACTIONS);

    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const record = getRequest.result as TransactionRecord | undefined;
      if (!record) {
        reject(new Error('Transaction not found'));
        return;
      }

      if (userId && record.userId && record.userId !== userId) {
        reject(new Error('Forbidden'));
        return;
      }

      const deleteRequest = store.delete(id);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () =>
        reject(deleteRequest.error ?? new Error('Failed to delete transaction from IndexedDB'));
    };

    getRequest.onerror = () =>
      reject(getRequest.error ?? new Error('Failed to find transaction'));
  });
};

export const getBalanceByUserId = async (
  userId: string = DEFAULT_USER_ID,
): Promise<BalanceData> => {
  const transactions = await getTransactionsByUserId(userId);

  let income = 0;
  let expenses = 0;

  for (const { amount } of transactions) {
    if (amount > 0) {
      income += amount;
    } else {
      expenses += amount;
    }
  }

  const balance = income + expenses;

  return {
    balance: Math.round(balance * 100) / 100,
    income: Math.round(income * 100) / 100,
    expenses: Math.round(Math.abs(expenses) * 100) / 100,
  };
};
