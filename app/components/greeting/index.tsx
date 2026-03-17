import React from 'react';
import { useUser } from '@clerk/react';
import { UserResource } from '@clerk/react/types';

import './Greeting.scss';

export const Greeting = () => {
  const { user }: { user: UserResource | null | undefined } = useUser();

  return (
    <h1 className={'greeting'}>
      Welcome, <br />
      <span className={'greeting-name'}>{user?.firstName}</span>
    </h1>
  );
};
