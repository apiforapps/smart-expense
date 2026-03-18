import { BalanceData } from './types';

export const fetchBalance = async (
  clerkUserId: string,
): Promise<BalanceData> => {
  const response = await fetch(
    `/api/transactions/balance?clerkUserId=${encodeURIComponent(clerkUserId)}`,
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? 'Failed to fetch balance');
  }

  return response.json() as Promise<BalanceData>;
};
