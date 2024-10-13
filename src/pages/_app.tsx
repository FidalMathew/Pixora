import Provider from "@/components/Provider";
import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {useEffect, useState} from "react";
import {PrivyProvider} from "@privy-io/react-auth";

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
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          logo: "https://your-logo-url",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <Provider
        attribute="class"
        enableColorScheme
        enableSystem
        defaultTheme="light"
        disableTransitionOnChange
      >
        <Component {...pageProps} />
      </Provider>
    </PrivyProvider>
  );
}
