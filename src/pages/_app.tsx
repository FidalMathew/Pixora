import Provider from "@/components/Provider";
import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {useEffect, useState} from "react";

export default function App({
  Component,
  pageProps: {session, ...pageProps},
}: AppProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <Provider
      attribute="class"
      enableColorScheme
      enableSystem
      defaultTheme="light"
      disableTransitionOnChange
    >
      <Component {...pageProps} />
    </Provider>
  );
}
