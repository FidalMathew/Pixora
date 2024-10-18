import Navbar from "@/components/Navbar";
import {Button} from "@/components/ui/button";
import {useGlobalContext} from "@/context/GlobalContext";
import {listenNowAlbums} from "@/lib/data";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import {CircleCheck, Heart, Plus, Share, Shuffle, Star} from "lucide-react";
import localFont from "next/font/local";
import {useRouter} from "next/router";
import {useWallets} from "@privy-io/react-auth";
import {Chain, createPublicClient, createWalletClient, custom, Hex} from "viem";
import {zoraSepolia} from "viem/chains";
import {
  createCollectorClient,
  createCreatorClient,
} from "@zoralabs/protocol-sdk";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Feed() {
  const router = useRouter();
  const {wallets} = useWallets();

  const {createPost} = useGlobalContext();

  // const mintNFT = async () => {
  //   try {
  //     await wallets[0].switchChain(zoraSepolia.id);
  //     console.log(wallets[0].address, "wallets[0].address");
  //     const provider = await wallets[0].getEthereumProvider();
  //     const zoraPublicClient = createPublicClient({
  //       chain: zoraSepolia as Chain,
  //       transport: custom(provider),
  //     });

  //     const zoraWalletClient = createWalletClient({
  //       chain: zoraSepolia as Chain,
  //       transport: custom(provider),
  //       // account: wallets[0].address as Hex,
  //     });

  //     const creatorClient = createCreatorClient({
  //       chainId: zoraSepolia.id,
  //       publicClient: zoraPublicClient,
  //     });

  //     const {parameters, contractAddress} = await creatorClient.create1155({
  //       // the contract will be created at a deterministic address
  //       contract: {
  //         // contract name
  //         name: "testContract",
  //         // contract metadata uri
  //         uri: "ipfs://DUMMY/contract.json",
  //       },
  //       token: {
  //         tokenMetadataURI: "ipfs://DUMMY/token.json",
  //       },
  //       // account to execute the transaction (the creator)
  //       account: wallets[0].address as Hex,
  //     });

  //     console.log(parameters, contractAddress, "parameters, contractAddress");

  //     const {result} = await zoraPublicClient.simulateContract({
  //       ...parameters,
  //       account: wallets[0].address as Hex,
  //     });

  //     // const tx = await zoraWalletClient.writeContract({
  //     //   ...parameters,
  //     //   account: wallets[0].address as Hex,
  //     //   chain: zoraSepolia as Chain,
  //     // });

  //     console.log(result, "result");

  //     // const tx = await zoraWalletClient.writeContract(request);

  //     // await zoraPublicClient.waitForTransactionReceipt({hash: tx});

  //     // console.log(contractAddress, "contractAddress");
  //   } catch (error) {
  //     console.log(error, "error");
  //   } finally {
  //   }
  // };

  // const {createNFTCollection} = useNftClient();
  // const {mintAndRegisterIpAssetWithPilTerms} = useIpAsset();

  // const mintNFTtoStory = async () => {
  //   try {
  //     await wallets[0].switchChain(iliad.id);
  //     const newCollection = await createNFTCollection({
  //       name: "Test NFT",
  //       symbol: "TEST",
  //       txOptions: {waitForTransaction: true},
  //     });

  //     const response = await mintAndRegisterIpAssetWithPilTerms({
  //       // an NFT contract address created by the SPG
  //       nftContract: "0x" as Address,
  //       pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
  //       // https://docs.story.foundation/docs/ipa-metadata-standard
  //       ipMetadata: {
  //         ipMetadataURI: "test-uri",
  //         ipMetadataHash: toHex("test-metadata-hash", {size: 32}),
  //         nftMetadataHash: toHex("test-nft-metadata-hash", {size: 32}),
  //         nftMetadataURI: "test-nft-uri",
  //       },
  //       txOptions: {waitForTransaction: true},
  //     });

  //     console.log(`
  //         Completed at transaction hash ${response.txHash},
  //         NFT Token ID: ${response.tokenId},
  //         IPA ID: ${response.ipId},
  //         License Terms ID: ${response.licenseTermsId}
  //       `);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return (
    <div
      className={`h-full w-full bg-white text-black dark:bg-black dark:text-white`}
    >
      <Navbar />
      {/* <div className="w-full h-20">
        <div className="w-full h-full flex items-center justify-center">
          <Button
            onClick={() => {
              //           imageUrl: string,
              // description: string,
              // canvasSize: string
              const imageUrl =
                "bafybeicdhuxbqsn4dp3wgxptoi54kqe2pb6u7epbdxs2rzdu4pxktjlwuy";
              const description = "This is a test description";
              const canvasSize = "400x400";

              createPost(imageUrl, description, canvasSize);
            }}
            className="w-40 h-10 rounded-full border border-slate-800 focus-visible:ring-0"
          >
            Create Post
          </Button>
          <Button
            onClick={}
            className="w-40 h-10 rounded-full border border-slate-800 focus-visible:ring-0"
          >
            Mint NFT
          </Button>
        </div>
      </div> */}
      <div
        className={`w-full h-full ${geistSans.className} flex justify-center`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-5xl p-7 h-full w-full">
          {listenNowAlbums.map((item, index) => (
            <div
              className="w-full m-2 rounded-lg h-[400px] border-2 border-slate-700 overflow-hidden"
              key={index}
            >
              <img
                src={item.cover}
                alt="taylor"
                className="w-full object-cover cursor-pointer"
                onClick={() => router.push(`/pics/${index}`)}
                style={{height: "calc((100% * 5 / 6) - 50px)"}}
              />
              <div className="h-[50px] flex items-center px-5 gap-2 text-sm font-light">
                <Avatar>
                  <AvatarImage
                    src="/boy.png"
                    className="h-7 w-7 rounded-full"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <p className="">Jaydeep Dey</p>
              </div>
              <div className="flex items-center justify-between px-4 h-1/6">
                <Button
                  className="w-fit rounded-full border border-slate-800 focus-visible:ring-0"
                  variant={"outline"}
                >
                  <Shuffle className="mr-2 h-4 w-4" />
                  Remix
                </Button>
                <div className="flex items-center">
                  <div className="mr-2 h-10 w-10 p-2 hover:bg-gray-100 rounded-full cursor-pointer ">
                    <Heart />
                  </div>
                  <div className="mr-2 h-10 w-10 p-2 hover:bg-gray-100 rounded-full cursor-pointer ">
                    <Share className="" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
