"use client";

import { AppProvider } from "./lib/store";

export function Providers({ children }) {
  return <AppProvider>{children}</AppProvider>;
}
