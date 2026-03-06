'use client';

import { useMemo } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/store/store';

export default function StoreProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const store: AppStore = useMemo(() => makeStore(), []);
  return <Provider store={store}>{children}</Provider>;
}
