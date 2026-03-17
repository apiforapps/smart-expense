import React from 'react';
import { useUser } from '@clerk/react';

import { Guest } from 'components/guest';
import { Greeting } from 'components/greeting';
import { AddTransaction } from 'components/transaction';

export const Home = () => {
  const { user } = useUser();

  if (!user) {
    return <Guest />;
  }

  return (
    <article className={'article column'}>
      <section className={'section'}>
        <Greeting />
      </section>
      <section className={'section'}>
        <AddTransaction />
      </section>
    </article>
  );
};
