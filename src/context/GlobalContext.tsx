import {iliad} from "@/lib/chains";
import {EIP1193Provider, usePrivy, useWallets} from "@privy-io/react-auth";
import {useRouter} from "next/router";
import {createContext, useEffect, useState} from "react";
import {ReactNode, useContext} from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  PublicClient,
  WalletClient,
} from "viem";
import {baseSepolia} from "viem/chains";
import PIXORA_ABI from "@/utils/abi.json";
import {createPortal} from "react-dom";

const GlobalContext = createContext({
  createPost: (imageUrl: string, description: string, canvasSize: string) => {},
  createPostLoading: false,
  createRemix: (postId: number, remixImageUrl: string) => {},
  createRemixLoading: false,
  getPostDetails: (postId: number) => {},
  getRemixDetails: (remixId: number) => {},
  loggedInAddress: "" as string | undefined,
  publicClient: undefined as PublicClient | undefined,
  walletClient: undefined as WalletClient | undefined,
});

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

  const CONTRACT_ADDRESS = "0x91cF36c6391071d9Be70a9863BBC67E706217282";
  // const PIXORA_ABI: never[] = []

  useEffect(() => {
    (async function () {
      if (!wallets[0]) return;
      const provider = await wallets[0].getEthereumProvider();
      if (provider) {
        setProvider(provider);
        console.log("executed");
        // await wallets[0].switchChain(iliad.id);
        // console.log("executed");
        const walletClient = createWalletClient({
          transport: custom(provider),
          chain: baseSepolia,
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
  }, [ready, authenticated, wallets]);

  const [loggedInAddress, setLoggedInAddress] = useState<string>();

  useEffect(() => {
    (async function () {
      try {
        console.log(walletClient, publicClient, "walletClient, publicClient");

        if (walletClient && publicClient) {
          const [address] = await walletClient.getAddresses();
          console.log(address, "dsaaddress");
          setLoggedInAddress(address);

          // const balance = await publicClient.getBalance({
          //   address: address,
          // });

          // console.log(balance.toString(), "balance");
          // setBalanceAddress(balance.toString());
        }
      } catch (error) {
        console.error(error, "Error logging in");
      }
    })();
  }, [walletClient, publicClient, provider, ready, wallets, router]);

  const getPostDetails = async (postId: number) => {
    try {
      if (publicClient) {
        const data = await publicClient.readContract({
          address: loggedInAddress as `0x${string}`,
          abi: PIXORA_ABI,
          functionName: "getPost",
          args: [postId],
        });

        // setPostExists(data !== undefined);
        console.log(data, "Post Details");
        return data;
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };

  const getRemixDetails = async (remixId: number) => {
    try {
      if (publicClient) {
        const data = await publicClient.readContract({
          address: loggedInAddress as `0x${string}`,
          abi: PIXORA_ABI,
          functionName: "getRemix",
          args: [remixId],
        });

        console.log(data, "Remix Details");
        return data;
      }
    } catch (error) {
      console.error("Error fetching remix details:", error);
    }
  };

  const [createPostLoading, setCreatePostLoading] = useState(false);

  const createPost = async (
    imageUrl: string,
    description: string,
    canvasSize: string
  ) => {
    setCreatePostLoading(true);
    try {
      if (publicClient && walletClient) {
        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: PIXORA_ABI,
          functionName: "createPost",
          account: loggedInAddress as `0x${string}`, // Ensure loggedInAddress is properly set
          args: [imageUrl, description, canvasSize],
          chain: baseSepolia,
        });

        await publicClient.waitForTransactionReceipt({hash: tx});
        console.log("Post successfully created");
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setCreatePostLoading(false);
    }
  };

  const [createRemixLoading, setCreateRemixLoading] = useState(false);

  const createRemix = async (postId: number, remixImageUrl: string) => {
    setCreateRemixLoading(true);
    try {
      if (publicClient && walletClient) {
        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: PIXORA_ABI,
          functionName: "createRemix",
          account: loggedInAddress as `0x${string}`, // Ensure loggedInAddress is properly set
          args: [postId, remixImageUrl],
          chain: baseSepolia,
        });

        await publicClient.waitForTransactionReceipt({hash: tx});
        console.log("Remix successfully created");
      }
    } catch (error) {
      console.error("Error creating remix:", error);
    } finally {
      setCreateRemixLoading(false);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        walletClient,
        publicClient,
        loggedInAddress,
        getPostDetails,
        getRemixDetails,
        createPost,
        createPostLoading,
        createRemix,
        createRemixLoading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
