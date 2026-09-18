import React from 'react';
import './Greeting.scss';

export const Greeting = () => {
  return (
    <h1 className={'greeting'}>
      Welcome back, <br />
      <span className={'greeting-name'}>Track your expenses</span>
    </h1>
  );
};
