import {EIP1193Provider, usePrivy, useWallets} from "@privy-io/react-auth";
import {useRouter} from "next/router";
import {createContext, useEffect, useState} from "react";
import {ReactNode, useContext} from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  PublicClient,
  WalletClient,
} from "viem";

const GlobalContext = createContext({});

export default function GlobalContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [provider, setProvider] = useState<EIP1193Provider>();
  const [walletClient, setWalletClient] = useState<WalletClient>();
  const [publicClient, setPublicClient] = useState<PublicClient>();
  const router = useRouter();
  const {ready, authenticated} = usePrivy();
  const {wallets} = useWallets();

  useEffect(() => {
    (async function () {
      if (!wallets[0]) return;
      const provider = await wallets[0].getEthereumProvider();
      if (provider) {
        setProvider(provider);
        const walletClient = createWalletClient({
          transport: custom(provider),
        });

        const publicClient = createPublicClient({
          transport: custom(provider),
        });

        setWalletClient(walletClient);
        setPublicClient(publicClient);
      } else {
        console.error("Please install MetaMask!");
      }
    })();
  }, [ready, authenticated]);
  return (
    <GlobalContext.Provider
      value={{
        walletClient,
        publicClient,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
