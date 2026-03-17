import { Transaction, TransactionFormData } from './types';

export const createTransaction = async (
  clerkUserId: string,
  data: TransactionFormData,
): Promise<Transaction> => {
  const amount =
    data.type === 'expense'
      ? -Math.abs(parseFloat(data.amount))
      : Math.abs(parseFloat(data.amount));

  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clerkUserId,
      amount,
      description: data.description || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? 'Failed to create transaction');
  }

  return response.json() as Promise<Transaction>;
};
