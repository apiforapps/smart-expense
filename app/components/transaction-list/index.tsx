import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useUser } from '@clerk/react';
import { Trash2 } from 'lucide-react';

import { Transaction, TransactionGroup } from './types';
import { fetchTransactions, deleteTransaction } from './api';
import './TransactionList.scss';

const EVENT_TRANSACTION_CREATED = 'transaction-created';

const formatAmount = (amount: number): string => {
  const abs = Math.abs(amount);
  return amount < 0
    ? `-$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `+$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const getDateLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const groupByDate = (transactions: Transaction[]): TransactionGroup[] => {
  const groups: Map<string, Transaction[]> = new Map();

  for (const tx of transactions) {
    const date = new Date(tx.createdAt).toDateString();
    const existing = groups.get(date) ?? [];
    existing.push(tx);
    groups.set(date, existing);
  }

  return Array.from(groups.entries()).map(([dateStr, txs]) => ({
    label: getDateLabel(dateStr),
    transactions: txs,
  }));
};

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

const TransactionItem = ({
  transaction,
  onDelete,
  isDeleting,
}: TransactionItemProps) => {
  const isIncome = transaction.amount > 0;

  return (
      <li className={'transaction-item'}>
        <div className={'transaction-info'}>
          <span className={'transaction-description'}>
            {transaction.description || (isIncome ? 'Income' : 'Expense')}
          </span>
          <span className={'transaction-time'}>{formatTime(transaction.createdAt)}</span>
        </div>
        <div className={'transaction-right'}>
          <span className={`transaction-amount ${isIncome ? 'income' : 'expense'}`}>
            {formatAmount(transaction.amount)}
          </span>
          <button
            className={'transaction-delete-btn'}
          onClick={() => onDelete(transaction.id)}
          disabled={isDeleting}
          aria-label={'Delete transaction'}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
};

export const TransactionList = () => {
  const { user } = useUser();
  const [groups, setGroups] = useState<TransactionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const txs = await fetchTransactions(user.id);
      setGroups(groupByDate(txs));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handleCreated = () => load();
    window.addEventListener(EVENT_TRANSACTION_CREATED, handleCreated);
    return () => window.removeEventListener(EVENT_TRANSACTION_CREATED, handleCreated);
  }, [load]);

  const handleDelete = async (id: number) => {
    if (!user?.id) return;

    setDeletingId(id);

    try {
      await deleteTransaction(id, user.id);
      setGroups((prev) =>
        prev
          .map((g) => ({
            ...g,
            transactions: g.transactions.filter((t) => t.id !== id),
          }))
          .filter((g) => g.transactions.length > 0),
      );
      window.dispatchEvent(new CustomEvent('transaction-deleted'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={'transaction-list-card'}>
        <h3 className={'transaction-list-title'}>Transactions</h3>
        <ul className={'transaction-list'}>
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className={'transaction-skeleton-item'}>
              <div className={'skeleton-left'}>
                <div className={'skeleton-bar short'} />
                <div className={'skeleton-bar tiny'} />
              </div>
              <div className={'skeleton-bar medium'} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error) {
    return (
      <div className={'transaction-list-card'}>
        <h3 className={'transaction-list-title'}>Transactions</h3>
        <p className={'transaction-error'}>{error}</p>
        <button className={'transaction-retry-btn'} onClick={load}>
          Try again
        </button>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className={'transaction-list-card'}>
        <h3 className={'transaction-list-title'}>Transactions</h3>
        <div className={'transaction-empty'}>
          <p className={'transaction-empty-text'}>No transactions yet</p>
          <p className={'transaction-empty-sub'}>
            Tap the + button to add your first one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={'transaction-list-card'}>
      <h3 className={'transaction-list-title'}>Transactions</h3>
      <ul className={'transaction-list'}>
        {groups.map((group) => (
          <Fragment key={group.label}>
            <li className={'transaction-date-header'}>{group.label}</li>
            {group.transactions.map((tx, index) => (
              <Fragment key={tx.id}>
                <TransactionItem
                  transaction={tx}
                  onDelete={handleDelete}
                  isDeleting={deletingId === tx.id}
                />
                {index < group.transactions.length - 1 && (
                  <li className={'transaction-divider'} />
                )}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </ul>
    </div>
  );
};
