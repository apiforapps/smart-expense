interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddresses: { emailAddress: string }[];
}

export const checkUser = async (user: ClerkUser | null | undefined) => {
  if (!user) {
    return null;
  }

  const res = await fetch('/api/check-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clerkUserId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
    }),
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
};
