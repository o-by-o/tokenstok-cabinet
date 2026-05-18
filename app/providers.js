"use client";

import { SessionProvider } from "next-auth/react";
import { AppProvider } from "./lib/store";

export function Providers({ children }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={false}>
      <AppProvider>{children}</AppProvider>
    </SessionProvider>
  );
}
