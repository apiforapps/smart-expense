interface SyncableUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddresses: { emailAddress: string }[];
}

export const syncUser = async (user: SyncableUser | null | undefined): Promise<void> => {
  if (!user) return;

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return;

  try {
    const res = await fetch('/api/check-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerkUserId: user.id,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        imageUrl: user.imageUrl,
        email,
      }),
    });

    if (!res.ok) {
      console.error('syncUser: failed to sync user', await res.text());
    }
  } catch (err) {
    console.error('syncUser: network error', err);
  }
};
