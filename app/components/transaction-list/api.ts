import { Transaction } from './types';

export const fetchTransactions = async (
  clerkUserId: string,
): Promise<Transaction[]> => {
  const response = await fetch(
    `/api/transactions?clerkUserId=${encodeURIComponent(clerkUserId)}`,
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? 'Failed to fetch transactions');
  }

  return response.json() as Promise<Transaction[]>;
};

export const deleteTransaction = async (
  id: number,
  clerkUserId: string,
): Promise<void> => {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clerkUserId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? 'Failed to delete transaction');
  }
};
