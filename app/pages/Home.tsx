import React from 'react';
import { useUser } from '@clerk/react';

import { Guest } from 'components/guest';
import { Greeting } from 'components/greeting';
import { AddTransaction } from 'components/transaction';
import { Balance } from 'components/balance';

export const Home = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return null;
  }

  if (!user) {
    return <Guest />;
  }

  return (
    <article className={'article column'}>
      <section className={'section'}>
        <Greeting />
      </section>
      <section className={'section'}>
        <Balance />
      </section>
      <AddTransaction />
    </article>
  );
};
