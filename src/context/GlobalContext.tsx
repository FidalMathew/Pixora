import {EIP1193Provider, usePrivy, useWallets} from "@privy-io/react-auth";
import {useRouter} from "next/router";
import {createContext, useEffect, useState} from "react";
import {ReactNode, useContext} from "react";
import {
  Address,
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  Hex,
  parseEther,
  PublicClient,
  toHex,
  WalletClient,
} from "viem";
import {baseSepolia} from "viem/chains";
import PIXORA_ABI from "@/utils/abi.json";
import {iliad, StoryClient, StoryConfig} from "@story-protocol/core-sdk";
import {iliadNftAbi} from "@/utils/iliadNftAbi";

// import NFTJson from "@/utils/NFT.json";
// import NFTMarketJson from "@/utils/NFTMarket.json";

const GlobalContext = createContext({
  createPostLoading: false,
  createRemixLoading: false,
  getPostDetails: (postId: number) => Promise.resolve({}),
  getRemixDetails: (remixId: number) => Promise.resolve({}),
  loggedInAddress: "" as string | undefined,
  publicClient: undefined as PublicClient | undefined,
  walletClient: undefined as WalletClient | undefined,
  CONTRACT_ADDRESS: "",
  nftMinttoStory: (to: Address, uri: string) => Promise.resolve(""),
  storyClient: null as StoryClient | null,
  provider: undefined as EIP1193Provider | undefined,
  createPost: (
    imageUrl: string,
    description: string,
    canvasSize: string,
    tokenURI: string
  ) => Promise.resolve(),
  createRemix: (
    postId: number,
    imageUrl: string,
    description: string,
    canvasSize: string,
    tokenURI: string
  ) => Promise.resolve(),
  getAllPosts: async () => {},
  getAllRemixes: async () => {},
  getUserPosts: (userAddress: string) => Promise.resolve<any[]>([]),
  getRemixesByPostId: (postId: number) => Promise.resolve([]),
  allPosts: [] as any[],
  allRemixes: [] as any[],
});

export default function GlobalContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const {ready, authenticated} = usePrivy();
  const {wallets} = useWallets();

  const [provider, setProvider] = useState<EIP1193Provider>();
  const [walletClient, setWalletClient] = useState<WalletClient>();
  const [publicClient, setPublicClient] = useState<PublicClient>();

  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [allRemixes, setAllRemixes] = useState<any[]>([]);

  // const CONTRACT_ADDRESS = "0x7a824c85043391560A18eEd0f5460E5B659752A6";
  const CONTRACT_ADDRESS = "0x519a9057Bfe3e6bab6EDb7128b7Dba44d2adC083";
  // const PIXORA_ABI: never[] = []
  const [storyClient, setStoryClient] = useState<StoryClient | null>(null);

  const setupStoryClient: () => StoryClient | undefined = () => {
    if (!wallets[0] || !provider) return;
    const config: StoryConfig = {
      account: wallets[0].address as Hex,
      transport: custom(provider),
      chainId: "iliad",
    };
    const client = StoryClient.newClient(config);
    return client;
  };

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
          // chain: iliad,
          chain: iliad,
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
    if (!storyClient && wallets[0]) {
      let newClient = setupStoryClient();
      if (newClient) {
        setStoryClient(newClient);
      }
    }
  }, [wallets, provider]);

  const nftMinttoStory = async (to: Address, uri: string): Promise<string> => {
    if (!wallets[0] || !provider) return "";
    console.log("Minting a new NFT...");
    const walletClient = createWalletClient({
      account: wallets[0].address as Address,
      chain: iliad,
      transport: custom(provider),
    });
    const publicClient = createPublicClient({
      transport: custom(provider),
      chain: iliad,
    });

    const {request} = await publicClient.simulateContract({
      address: "0xd2a4a4Cb40357773b658BECc66A6c165FD9Fc485",
      functionName: "mintNFT",
      args: [to, uri],
      abi: iliadNftAbi,
    });

    const hash = await walletClient.writeContract(request);
    console.log(`Minted NFT successful with hash: ${hash}`);

    const receipt = await publicClient.waitForTransactionReceipt({hash});
    const tokenId = Number(receipt.logs[0].topics[3]).toString();
    console.log(`Minted NFT tokenId: ${tokenId}`);

    return tokenId; // Ensure you return a Promise<string>
  };

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

  const [createPostLoading, setCreatePostLoading] = useState(false);
  const [createRemixLoading, setCreateRemixLoading] = useState(false);

  const createPost = async (
    imageUrl: string,
    description: string,
    canvasSize: string,
    tokenURI: string
  ) => {
    try {
      if (publicClient && walletClient) {
        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: PIXORA_ABI,
          functionName: "createPost",
          account: loggedInAddress as `0x${string}`,
          args: [imageUrl, description, canvasSize, tokenURI],
          chain: baseSepolia,
        });

        await publicClient.waitForTransactionReceipt({hash: tx});
        console.log("Post successfully  ");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      return;
    }
  };

  const createRemix = async (
    postId: number,
    imageUrl: string,
    description: string,
    canvasSize: string,
    tokenURI: string
  ) => {
    setCreateRemixLoading(true);
    try {
      if (publicClient && walletClient) {
        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: PIXORA_ABI,
          functionName: "createRemix",
          account: loggedInAddress as `0x${string}`,
          args: [postId, imageUrl, description, canvasSize, tokenURI],
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

  const getPostDetails = async (postId: number) => {
    try {
      if (publicClient) {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: PIXORA_ABI,
          functionName: "getPost",
          args: [postId],
        });

        console.log(data, "Post Details");
        console.log(data, `Remixes for Post ID ${postId}`);

        return data as any;
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };

  const getRemixDetails = async (remixId: number) => {
    try {
      if (publicClient) {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: PIXORA_ABI,
          functionName: "getRemix",
          args: [remixId],
        });

        console.log(data, "Remix Details");
        return data as any;
      }
    } catch (error) {
      console.error("Error fetching remix details:", error);
    }
  };

  const getAllPosts = async (): Promise<void> => {
    try {
      if (publicClient) {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: PIXORA_ABI,
          functionName: "getAllPosts",
        });

        setAllPosts(data as any[]);
        console.log(data, "All Posts");
      }
    } catch (error) {
      console.error("Error fetching all posts:", error);
    }
  };

  const getAllRemixes = async (): Promise<void> => {
    try {
      if (publicClient) {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: PIXORA_ABI,
          functionName: "getAllRemixes",
        });

        setAllRemixes(data as any[]);

        console.log(data, "All Remixes");
      }
    } catch (error) {
      console.error("Error fetching all remixes:", error);
    }
  };

  useEffect(() => {
    if (ready && authenticated && walletClient && publicClient) {
      getAllPosts();
      getAllRemixes();
    }
  }, [walletClient, publicClient, provider, ready, wallets, router]);

  const getUserPosts = async (userAddress: string): Promise<any[]> => {
    try {
      if (publicClient) {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: PIXORA_ABI,
          functionName: "getUserPosts",
          args: [userAddress],
        });

        console.log(data, `Posts by ${userAddress}`);

        return data as any[];
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
    return [];
  };

  const getRemixesByPostId = async (postId: number): Promise<never[]> => {
    try {
      if (publicClient) {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: PIXORA_ABI,
          functionName: "getRemixesByPostId",
          args: [postId],
        });

        console.log(data, `Remixes for Post ID ${postId}`);
        return data as never[];
      }
    } catch (error) {
      console.error("Error fetching remixes by post ID:", error);
    }
    return [];
  };

  return (
    <GlobalContext.Provider
      value={{
        walletClient,
        publicClient,
        loggedInAddress,
        CONTRACT_ADDRESS,
        storyClient,
        nftMinttoStory,
        provider,
        createPost,
        createPostLoading,
        createRemix,
        createRemixLoading,
        getPostDetails,
        getRemixDetails,
        getAllPosts,
        getAllRemixes,
        getUserPosts,
        getRemixesByPostId,
        allPosts,
        allRemixes,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
