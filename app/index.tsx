import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import { ThemeProvider } from 'hooks/useTheme';

import './globals.scss';
import { App } from './App';

const PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY!;

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>,
);
