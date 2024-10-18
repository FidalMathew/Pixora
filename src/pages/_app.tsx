import Provider from "@/components/Provider";
import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {useEffect, useState} from "react";
import {PrivyProvider} from "@privy-io/react-auth";
import GlobalContextProvider from "@/context/GlobalContext";
import {iliad} from "@/lib/chains";
import {
  avalancheFuji,
  baseSepolia,
  sepolia,
  zora,
  zoraSepolia,
  zoraTestnet,
} from "viem/chains";
import {Toaster} from "sonner";
// import {} from "@story-protocol/react-sdk";
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
          logo: "https://thegivingblock.com/wp-content/uploads/2021/08/Livepeer-LPT-logo.png",
        },
        supportedChains: [
          iliad,
          baseSepolia,
          sepolia,
          avalancheFuji,
          zoraSepolia,
          zoraTestnet,
          zora,
        ],
        // embeddedWallets: {
        //   createOnLogin: "users-without-wallets",
        // },
      }}
    >
      <GlobalContextProvider>
        <Provider
          attribute="class"
          enableColorScheme
          enableSystem
          defaultTheme="light"
          disableTransitionOnChange
        >
          <Component {...pageProps} />
          <Toaster />
        </Provider>
      </GlobalContextProvider>
    </PrivyProvider>
  );
}
