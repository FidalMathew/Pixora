import {useState} from "react";
import {Field, Form, Formik} from "formik";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import Dropzone, {FileRejection} from "react-dropzone";
import {ReloadIcon} from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {CircleCheck, CircleX, Cross, Star} from "lucide-react";
import {pinata} from "@/utils/config";
import {toast} from "sonner";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {useGlobalContext} from "@/context/GlobalContext";
import PIXORA_ABI from "@/utils/abi.json";
import {baseSepolia} from "viem/chains";
import {useWallets} from "@privy-io/react-auth";
import {
  Address,
  createPublicClient,
  createWalletClient,
  custom,
  Hex,
  toHex,
} from "viem";
import NFTMintABI from "@/utils/mintnft.json";
import {iliad, LicenseClient} from "@story-protocol/core-sdk";
import CryptoJS from "crypto-js";
import {iliadNftAbi} from "@/utils/iliadNftAbi";

export default function AddPost() {
  const getCanvasDimensions = (canvasSize: string) => {
    const [width, height] = canvasSize.split("x").map(Number);
    console.log(width, height, "width, height");
    return {width, height};
  };

  const [canvasSize, setCanvasSize] = useState<string>("1080x1080");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [uploading, setUploading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const {wallets} = useWallets();

  const {
    publicClient,
    walletClient,
    CONTRACT_ADDRESS,
    storyClient,
    nftMinttoStory,
    provider,
    createPost,
  } = useGlobalContext();

  // there are 3 states, uploading to ipfs, add post to blockchain, and mint nft for that, make useStates to handle loading, errors and successful msg for each state
  const [executionState, setExecutionState] = useState<{
    uploadingToIPFS: boolean;
    ipfsError: string | null;
    ipfsSuccess: string | null;

    addingPostToBlockchain: boolean;
    blockchainError: string | null;
    blockchainSuccess: string | null;

    mintingNFT: boolean;
    nftError: string | null;
    nftSuccess: string | null;
  }>({
    uploadingToIPFS: false,
    ipfsError: null,
    ipfsSuccess: null,

    addingPostToBlockchain: false,
    blockchainError: null,
    blockchainSuccess: null,

    mintingNFT: false,
    nftError: null,
    nftSuccess: null,
  });

  const handleDrop = (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[]
  ) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(file);
        setImageUrl(reader.result as string); // Set the image URL, cast as string
      };
      reader.readAsDataURL(file); // Read the file as a data URL for preview
    }
  };

  const renderImageStyles = (canvasSize: string) => {
    const {width, height} = getCanvasDimensions(canvasSize);

    // For other sizes, use default aspect ratio scaling
    return {
      width: "100%", // Responsive width
      maxWidth: `${width / 2}px`, // Default scaling for all other sizes
      maxHeight: `${height / 2}px`, // Maintain aspect ratio
    };
  };

  const uploadFile = async (file: File, description: string) => {
    const keyRequest = await fetch("/api/upload");
    const keyData = await keyRequest.json();
    const upload = await pinata.upload.file(file).key(keyData.JWT);
    const json = {
      name: file.name,
      description: description,
      image: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`,
    };

    uploadJson(json);



    return {
      ipfsUri: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`,
      ipfsJson: json,
    };
  };

  const uploadJson = async (jsonData: { image: string; description: string }) => {
    try {
      // Step 1: Fetch JWT or authentication key
      const keyRequest = await fetch("/api/upload"); // Endpoint to get your Pinata JWT
      const keyData = await keyRequest.json();
  
      // Step 2: Upload the JSON data to IPFS using Pinata
      const jsonUpload = await pinata.upload.json(jsonData).key(keyData.JWT);
  

      console.log(jsonUpload, "jsonUpload", `https://gateway.pinata.cloud/ipfs/${jsonUpload.IpfsHash}`);

      // Step 3: Return the IPFS URI of the uploaded JSON
      // imageUrl: string, description: string, canvasSize: string, tokenURI: string
      createPost(jsonData.image, jsonData.description, "1080x1080", `https://gateway.pinata.cloud/ipfs/${jsonUpload.IpfsHash}`);

      return {
        jsonIpfsUri: `https://gateway.pinata.cloud/ipfs/${jsonUpload.IpfsHash}`, // JSON metadata IPFS link
      };
    } catch (error) {
      console.error("Error uploading JSON to IPFS:", error);
      throw new Error("JSON upload failed");
    }
  };
  



  const addPostToBlockchain = async (
    imageUrl: string,
    description: string,
    canvasSize: string
  ) => {
    if (!walletClient || !publicClient || !wallets[0]) return;
    try {
      const tx = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as Hex,
        abi: PIXORA_ABI,
        functionName: "createPost",
        account: wallets[0].address as `0x${string}`, // Ensure loggedInAddress is properly set
        args: [imageUrl, description, canvasSize],
        chain: baseSepolia,
      });

      await publicClient.waitForTransactionReceipt({hash: tx});
      console.log("Post successfully created");
    } catch (error) {
      console.error("Error adding post to blockchain:", error);
    }
  };

  const handleMintPost = async (
    imageUrl: string,
    description: string,
    canvasSize: string
  ) => {
    if (!file) {
      // alert("No file selected");
      toast.error("No file selected");
      return;
    }

    if (!walletClient || !publicClient || !wallets[0]) return;

    // Step 1: Upload image to IPFS

    try {
      await wallets[0].switchChain(baseSepolia.id);
      setExecutionState((prevState) => ({
        ...prevState,
        uploadingToIPFS: true,
        ipfsError: null,
        ipfsSuccess: null,
      }));

      const keyRequest = await fetch("/api/upload");
      const keyData = await keyRequest.json();
      const upload = await pinata.upload.file(file).key(keyData.JWT);
      console.log(upload);
      setIpfsUrl(upload.IpfsHash);
      setExecutionState((prevState) => ({
        ...prevState,
        uploadingToIPFS: false,
        ipfsSuccess: "Image uploaded to IPFS successfully!",
      }));
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
      setExecutionState((prevState) => ({
        ...prevState,
        uploadingToIPFS: false,
        ipfsError: "Trouble uploading file",
      }));
      return;
    }

    // Step 2: Mint NFT

    try {
      setExecutionState((prevState) => ({
        ...prevState,
        mintingNFT: true,
        nftError: null,
        nftSuccess: null,
      }));

      const tx = await walletClient.writeContract({
        address: "0x9A86cfBA5Db5f7DD1494F80522B90aEc4121D63a" as Hex,
        abi: NFTMintABI,
        functionName: "mintPost",
        account: wallets[0].address as `0x${string}`,
        args: [ipfsUrl, "nft info"],
        chain: baseSepolia,
      });

      await publicClient.waitForTransactionReceipt({hash: tx});
      console.log("NFT successfully minted");

      setExecutionState((prevState) => ({
        ...prevState,
        mintingNFT: false,
        nftSuccess: tx,
      }));
    } catch (error: any) {
      toast.error(error.message);
      setExecutionState((prevState) => ({
        ...prevState,
        mintingNFT: false,
        nftError: "Error minting NFT",
      }));
      return;
    }

    // Step 3: Add post to blockchain
    try {
      setExecutionState((prevState) => ({
        ...prevState,
        addingPostToBlockchain: true,
        blockchainError: null,
        blockchainSuccess: null,
      }));

      const tx = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as Hex,
        abi: PIXORA_ABI,
        functionName: "createPost",
        account: wallets[0].address as `0x${string}`,
        args: [ipfsUrl, description, canvasSize],
        chain: baseSepolia,
      });

      await publicClient.waitForTransactionReceipt({hash: tx});
      console.log("Post successfully added to blockchain");

      setExecutionState((prevState) => ({
        ...prevState,
        addingPostToBlockchain: false,
        blockchainSuccess: tx,
      }));
    } catch (error: any) {
      toast.error(error.message);
      setExecutionState((prevState) => ({
        ...prevState,
        addingPostToBlockchain: false,
        blockchainError: "Error adding post to blockchain",
      }));
      return;
    }
  };

  // Root IPA created at tx hash 0x39299d4497915a93abf930bdb650dbea155f472f43865229302868407dec20d4, IPA ID: 0x4862B5c1b0DF05F2A3eCc60b5637850Cd96C70D2
  // License minted at tx hash 0xdd9e02643bb0097a4c64c18c439cfa22427efd895a508f92cc68a7e18c62972f, License IDs: 201035

  // story protocol functionalities

  const registerExistingNFT = async (
    tokenId: string,
    nftContract: Address,
    ipfsUri: string | null,
    ipfsJson: any | null
  ) => {
    if (!storyClient) {
      toast.error("Story client not initialized");
      return;
    }

    // Hash the string using SHA-256 and convert the result to hex
    const metadataHash = CryptoJS.SHA256(
      JSON.stringify(ipfsJson || {})
    ).toString(CryptoJS.enc.Hex);
    const response = await storyClient.ipAsset.register({
      nftContract,
      tokenId,
      ipMetadata: {
        ipMetadataURI: ipfsUri || "test-ip-metadata-uri", // uri of IP metadata
        ipMetadataHash: `0x${metadataHash}`, // hash of IP metadata
        nftMetadataURI: ipfsUri || "test-nft-metadata-uri", // uri of NFT metadata
        nftMetadataHash: `0x${metadataHash}`, // hash of NFT metadata
      },
      txOptions: {waitForTransaction: true},
    });
    console.log(
      `Root IPA created at tx hash ${response.txHash}, IPA ID: ${response.ipId}`
    );
  };

  // const mintAndRegisterNFT = async (file: File, description: string) => {
  //   if (!storyClient || !file) return;
  //   try {
  //     await wallets[0].switchChain(iliad.id);
  //     setUploading(true);
  //     const {ipfsUri, ipfsJson} = await uploadFile(file, description);

  //     const tokenId = await nftMinttoStory(
  //       wallets[0].address as Address,
  //       ipfsUri
  //     );
  //     registerExistingNFT(
  //       tokenId,
  //       "0xd2a4a4Cb40357773b658BECc66A6c165FD9Fc485",
  //       ipfsUri,
  //       ipfsJson
  //     );
  //   } catch (err: any) {
  //     console.log(err);
  //     toast.error(err.message);
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  // there are 4 states, upload to ipfs, mint nft to story, register nft as ip, attach term to ip, mint a license token, usestate for item
  const [executionIpState, setExecutionIpState] = useState<{
    uploadingIpToIPFS: boolean;
    ipfsIpError: string | null;
    ipfsIpSuccess: string | null;

    mintNFTokenLoading: boolean;
    mintNFTokenError: string | null;
    mintNFTokenSuccess: string | null;

    registerNftAsIpLoading: boolean;
    registerNftAsIpError: string | null;
    registerNftAsIpSuccess: string | null;

    attachTermToIpLoading: boolean;
    attachTermToIpError: string | null;
    attachTermToIpSuccess: string | null;
  }>({
    uploadingIpToIPFS: false,
    ipfsIpError: null,
    ipfsIpSuccess: null,

    mintNFTokenLoading: false,
    mintNFTokenError: null,
    mintNFTokenSuccess: null,

    registerNftAsIpLoading: false,
    registerNftAsIpError: null,
    registerNftAsIpSuccess: null,

    attachTermToIpLoading: false,
    attachTermToIpError: null,
    attachTermToIpSuccess: null,
  });

  const [ipfsUri, setIpfsUri] = useState<string | null>(null);
  const [ipfsJson, setIpfsJson] = useState<any | null>(null);
  // const [mintedNftStoryTokenId, setMintedNftStoryTokenId] = useState<
  //   string | null
  // >(null);

  // const [ipId, setIpId] = useState<Hex | undefined>();

  const handleStoryProtocolFunctionalities = async (
    file: File,
    description: string
  ) => {
    console.log(storyClient, provider, file, "storyClient, provider, file");

    if (!storyClient || !file || !provider) return;

    console.log("Executing Story Protocol functionalities...");
    // step 1: upload to ipfs

    try {
      await wallets[0].switchChain(iliad.id);
      setExecutionIpState((prevState) => ({
        ...prevState,
        uploadingIpToIPFS: true,
        ipfsIpError: null,
        ipfsIpSuccess: null,
      }));

      console.log("Uploading to IPFS...");

      const {ipfsUri, ipfsJson} = await uploadFile(file, description);

      setIpfsJson(ipfsJson);
      setIpfsUri(ipfsUri);

      setExecutionIpState((prevState) => ({
        ...prevState,
        uploadingIpToIPFS: false,
        ipfsIpSuccess: ipfsUri,
      }));

      try {
        setExecutionIpState((prevState) => ({
          ...prevState,
          mintNFTokenLoading: true,
          mintNFTokenError: null,
          mintNFTokenSuccess: null,
        }));

        console.log("Minting NFT...");

        console.log(ipfsUri, "ipfsUri", ipfsJson, "ipfsJson");

        const iliadWalletClient = createWalletClient({
          account: wallets[0].address as Address,
          chain: iliad,
          transport: custom(provider),
        });
        const iliadPublicClient = createPublicClient({
          transport: custom(provider),
          chain: iliad,
        });

        const {request} = await iliadPublicClient.simulateContract({
          address: "0xd2a4a4Cb40357773b658BECc66A6c165FD9Fc485",
          functionName: "mintNFT",
          args: [wallets[0].address as Address, ipfsUri],
          abi: iliadNftAbi,
        });

        const hash = await iliadWalletClient.writeContract(request);
        console.log(`Minted NFT successful with hash: ${hash}`);

        const receipt = await iliadPublicClient.waitForTransactionReceipt({
          hash,
        });
        console.log(receipt, "nft receipt");
        const tokenId = Number(receipt.logs[0].topics[3]).toString();
        console.log(`Minted NFT tokenId: ${tokenId}`);

        setExecutionIpState((prevState) => ({
          ...prevState,
          mintNFTokenLoading: false,
          mintNFTokenSuccess: hash,
        }));

        // Step 3: Register NFT as IP
        try {
          setExecutionIpState((prevState) => ({
            ...prevState,
            registerNftAsIpLoading: true,
            registerNftAsIpError: null,
            registerNftAsIpSuccess: null,
          }));

          console.log("Registering NFT as IP...");

          console.log(
            ipfsUri,
            ipfsJson,
            tokenId,
            "ipfsJson, mintedNftStoryTokenId"
          );
          // Hash the string using SHA-256 and convert the result to hex

          const metadataHash = CryptoJS.SHA256(
            JSON.stringify(ipfsJson)
          ).toString(CryptoJS.enc.Hex);

          //  tokenId,
          // "0xd2a4a4Cb40357773b658BECc66A6c165FD9Fc485",
          // ipfsUri,
          // ipfsJson
          const response1 = await storyClient.ipAsset.register({
            nftContract:
              "0xd2a4a4Cb40357773b658BECc66A6c165FD9Fc485" as Address,
            tokenId: tokenId as string,
            ipMetadata: {
              ipMetadataURI: ipfsUri || "test-ip-metadata-uri", // uri of IP metadata
              ipMetadataHash: `0x${metadataHash}`, // hash of IP metadata
              nftMetadataURI: ipfsUri || "test-nft-metadata-uri", // uri of NFT metadata
              nftMetadataHash: `0x${metadataHash}`, // hash of NFT metadata
            },
            txOptions: {waitForTransaction: true},
          });

          setExecutionIpState((prevState) => ({
            ...prevState,
            registerNftAsIpLoading: false,
            registerNftAsIpSuccess: response1.ipId!,
          }));

          try {
            setExecutionIpState((prevState) => ({
              ...prevState,
              attachTermToIpLoading: true,
              attachTermToIpError: null,
              attachTermToIpSuccess: null,
            }));

            console.log("Attaching term to IP...");

            const response = await storyClient.license.attachLicenseTerms({
              licenseTermsId: 2,
              ipId: response1.ipId as Address,
              txOptions: {waitForTransaction: true},
            });
            setExecutionIpState((prevState) => ({
              ...prevState,
              attachTermToIpLoading: false,
              attachTermToIpSuccess: response.txHash!,
            }));
          } catch (error: any) {
            console.log(error);
            toast.error(error.message);
            setExecutionIpState((prevState) => ({
              ...prevState,
              attachTermToIpLoading: false,
              attachTermToIpError: "Error attaching term to IP",
            }));
            return;
          }
        } catch (err: any) {
          console.log(err);
          toast.error(err.message);
          setExecutionIpState((prevState) => ({
            ...prevState,
            registerNftAsIpLoading: false,
            registerNftAsIpError: "Error registering NFT as IP",
          }));
          return;
        }
      } catch (error: any) {
        console.log(error);
        toast.error(error.message);
        setExecutionIpState((prevState) => ({
          ...prevState,
          mintNFTokenLoading: false,
          mintNFTokenError: "Error minting NFT",
        }));
        return;
      }
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
      setExecutionIpState((prevState) => ({
        ...prevState,
        uploadingIpToIPFS: false,
        ipfsIpError: "Trouble uploading file",
      }));
      return;
    }
  };

  const [openStatus, setOpenStatus] = useState(false);
  const [openIpStatusModal, setOpenIpStatusModal] = useState(false);

  const makeDerivate = async () => {
    if (!storyClient) return;
    try {
      const response = await storyClient.ipAsset.registerDerivative({
        childIpId: "0xb5787a965763115c26F90691704Cfc6b2A341d32",
        parentIpIds: ["0x70E9121441C2B6627EA5b6e26A5D58393f54e539"],
        licenseTermsIds: ["2"],
        txOptions: {waitForTransaction: true},
      });
    } catch (error: any) {
      toast.error(error.message);
      console.log(error);
    }
  };

  // https://explorer.story.foundation/ipa/0x70E9121441C2B6627EA5b6e26A5D58393f54e539
  // https://explorer.story.foundation/ipa/0xb5787a965763115c26F90691704Cfc6b2A341d32

  return (
    <div className="min-h-screen w-full bg-white text-black ">
      <Dialog open={openIpStatusModal} onOpenChange={setOpenIpStatusModal}>
        <DialogContent
          className="h-fit lg:w-[500px] bg-white text-black"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Story Protocol</DialogTitle>
            <DialogDescription>
              <div className="w-full h-full flex flex-col mt-5 font-sans text-black text-left">
                <div className="w-full h-[80px] flex items-center px-4">
                  <div className="flex flex-col w-full">
                    <p className="text-xl w-full">Upload to IPFS</p>
                    <p className="text-xs text-blue-800 max-w-sm truncate">
                      {executionIpState.ipfsIpSuccess && ipfsUri && (
                        <a href={`${ipfsUri}`} target="_blank">
                          {" "}
                          {`${ipfsUri}`}
                        </a>
                      )}
                      {executionIpState.ipfsIpError && (
                        <p className="text-red-700">
                          {executionIpState.ipfsIpError}
                        </p>
                      )}
                    </p>
                  </div>
                  {executionIpState.uploadingIpToIPFS ? (
                    <ReloadIcon className="h-5 w-5 animate-spin" />
                  ) : executionIpState.ipfsIpSuccess ? (
                    <CircleCheck className="h-9 w-9 fill-green-700 text-white" />
                  ) : (
                    executionIpState.ipfsIpError !== null && (
                      <CircleX className="h-9 w-9 fill-red-700 text-white" />
                    )
                  )}
                </div>
                <div className="w-full h-[80px] flex items-center px-4">
                  <div className="flex flex-col w-full">
                    <p className="text-xl w-full">Mint NFT on Iliad</p>
                    <p className="text-xs text-blue-800 max-w-sm truncate">
                      {/* https://explorer.story.foundation/ipa/0x5Ec29EA9fFfd4176f3E09B1Eb5c163adc8744c3D */}
                      {executionIpState.mintNFTokenSuccess && (
                        <a
                          href={`https://explorer.story.foundation/ipa/${executionIpState.mintNFTokenSuccess}`}
                          target="_blank"
                        >
                          {" "}
                          {`https://explorer.story.foundation/ipa/${executionIpState.mintNFTokenSuccess}`}
                        </a>
                      )}
                      {executionIpState.mintNFTokenError && (
                        <p className="text-red-700">
                          {executionIpState.mintNFTokenError}
                        </p>
                      )}
                    </p>
                  </div>
                  {executionIpState.mintNFTokenLoading ? (
                    <ReloadIcon className="h-5 w-5 animate-spin" />
                  ) : executionIpState.mintNFTokenSuccess ? (
                    <CircleCheck className="h-9 w-9 fill-green-700 text-white" />
                  ) : (
                    executionIpState.mintNFTokenError !== null && (
                      <CircleX className="h-9 w-9 fill-red-700 text-white" />
                    )
                  )}
                </div>

                <div className="w-full h-[80px] flex items-center px-4">
                  <div className="flex flex-col w-full">
                    <p className="text-xl w-full">Registering NFT as IP</p>
                    <p className="text-xs text-blue-800 max-w-sm truncate">
                      {/* https://explorer.story.foundation/ipa/0x5Ec29EA9fFfd4176f3E09B1Eb5c163adc8744c3D */}
                      {executionIpState.registerNftAsIpSuccess && (
                        <a
                          href={`https://explorer.story.foundation/ipa/${executionIpState.registerNftAsIpSuccess}`}
                          target="_blank"
                        >
                          {" "}
                          {`https://explorer.story.foundation/ipa/${executionIpState.registerNftAsIpSuccess}`}
                        </a>
                      )}
                      {executionIpState.registerNftAsIpError && (
                        <p className="text-red-700">
                          {executionIpState.registerNftAsIpError}
                        </p>
                      )}
                    </p>
                  </div>
                  {executionIpState.registerNftAsIpLoading ? (
                    <ReloadIcon className="h-5 w-5 animate-spin" />
                  ) : executionIpState.registerNftAsIpSuccess ? (
                    <CircleCheck className="h-9 w-9 fill-green-700 text-white" />
                  ) : (
                    executionIpState.registerNftAsIpError !== null && (
                      <CircleX className="h-9 w-9 fill-red-700 text-white" />
                    )
                  )}
                </div>
                <div className="w-full h-[80px] flex items-center px-4">
                  <div className="flex flex-col w-full">
                    <p className="text-xl w-full">Attach License Term to IP</p>
                    <p className="text-xs text-blue-800 max-w-sm truncate">
                      {executionIpState.attachTermToIpSuccess && (
                        <a
                          href={`https://explorer.story.foundation/transactions/${executionIpState.attachTermToIpSuccess}`}
                          target="_blank"
                        >
                          {" "}
                          {`https://explorer.story.foundation/transactions/${executionIpState.attachTermToIpSuccess}`}
                        </a>
                      )}
                      {executionIpState.attachTermToIpError && (
                        <p className="text-red-700">
                          {executionIpState.attachTermToIpError}
                        </p>
                      )}
                    </p>
                  </div>
                  {executionIpState.attachTermToIpLoading ? (
                    <ReloadIcon className="h-5 w-5 animate-spin" />
                  ) : executionIpState.attachTermToIpSuccess ? (
                    <CircleCheck className="h-9 w-9 fill-green-700 text-white" />
                  ) : (
                    executionIpState.attachTermToIpError !== null && (
                      <CircleX className="h-9 w-9 fill-red-700 text-white" />
                    )
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={openStatus} onOpenChange={setOpenStatus}>
        <DialogContent className="h-fit lg:w-[500px] bg-white text-black">
          <DialogHeader>
            <DialogTitle>Mint and Add Post</DialogTitle>
            <DialogDescription>
              <div className="w-full h-full flex flex-col mt-5 font-sans text-black text-left">
                <div className="w-full h-[80px] flex items-center px-4">
                  <div className="flex flex-col w-full">
                    <p className="text-xl w-full">Upload to IPFS</p>
                    <p className="text-xs text-blue-800 max-w-sm truncate">
                      {executionState.ipfsSuccess && ipfsUrl && (
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${ipfsUrl}`}
                          target="_blank"
                        >
                          {" "}
                          {`https://gateway.pinata.cloud/ipfs/${ipfsUrl}`}
                        </a>
                      )}
                      {executionState.ipfsError && (
                        <p className="text-red-700">
                          {executionState.ipfsError}
                        </p>
                      )}
                    </p>
                  </div>
                  {executionState.uploadingToIPFS ? (
                    <ReloadIcon className="h-5 w-5 animate-spin" />
                  ) : executionState.ipfsSuccess ? (
                    <CircleCheck className="h-9 w-9 fill-green-700 text-white" />
                  ) : (
                    executionState.ipfsError !== null && (
                      <CircleX className="h-9 w-9 fill-red-700 text-white" />
                    )
                  )}
                </div>
                <div className="w-full h-[80px] flex items-center px-4">
                  <div className="flex flex-col w-full">
                    <p className="text-xl w-full">Mint NFT</p>
                    <p className="text-xs text-blue-800 max-w-sm truncate">
                      {executionState.nftSuccess && (
                        <a
                          href={`https://sepolia.basescan.org/tx/${executionState.nftSuccess}`}
                          target="_blank"
                        >
                          {" "}
                          {`https://sepolia.basescan.org/tx/${executionState.nftSuccess}`}
                        </a>
                      )}
                      {executionState.nftError && (
                        <p className="text-red-700">
                          {executionState.nftError}
                        </p>
                      )}
                    </p>
                  </div>
                  {executionState.mintingNFT ? (
                    <ReloadIcon className="h-5 w-5 animate-spin" />
                  ) : executionState.nftSuccess ? (
                    <CircleCheck className="h-9 w-9 fill-green-700 text-white" />
                  ) : (
                    executionState.nftError !== null && (
                      <CircleX className="h-9 w-9 fill-red-700 text-white" />
                    )
                  )}
                </div>
                <div className="w-full h-[80px] flex items-center px-4">
                  <div className="flex flex-col w-full">
                    <p className="text-xl w-full">
                      Register Post to Blockchain
                    </p>
                    <p className="text-xs text-blue-800 max-w-sm truncate">
                      {executionState.blockchainSuccess && (
                        <a
                          href={`https://sepolia.basescan.org/tx/${executionState.blockchainSuccess}`}
                          target="_blank"
                        >
                          {" "}
                          {`https://sepolia.basescan.org/tx/${executionState.blockchainSuccess}`}
                        </a>
                      )}
                      {executionState.blockchainError && (
                        <p className="text-red-700">
                          {executionState.blockchainError}
                        </p>
                      )}
                    </p>
                  </div>
                  {executionState.addingPostToBlockchain ? (
                    <ReloadIcon className="h-5 w-5 animate-spin" />
                  ) : executionState.blockchainSuccess ? (
                    <CircleCheck className="h-9 w-9 fill-green-700 text-white" />
                  ) : (
                    executionState.blockchainError !== null && (
                      <CircleX className="h-9 w-9 fill-red-700 text-white" />
                    )
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Navbar />
      <div className="h-full lg:h-[90vh] w-full">
        <Formik
          initialValues={{
            description: "",
            uploadedImageUrl: "",
            canvasSize: "",
          }}
          onSubmit={(values) => {
            console.log(ipfsUrl, values, "Form Values");
          }}
        >
          {(formik) => (
            <Form className="h-full w-full flex flex-col gap-4 p-10 lg:flex-row-reverse justify-center items-center ">
              <div className="flex flex-col gap-6 w-full h-full">
                <p className="text-xl text-center font-semibold">Add Post</p>
                <div className="flex justify-start gap-3 flex-col">
                  <Label htmlFor="description">Image Description</Label>
                  <Field
                    as={Textarea}
                    name="description"
                    placeholder="Description"
                    rows="10"
                    className="w-full"
                  />
                </div>
                <div className="flex justify-start gap-3 flex-col">
                  <Label htmlFor="canvasSize">Canvas</Label>
                  <Select
                    onValueChange={(value) => {
                      setCanvasSize(value);
                      formik.setFieldValue("canvasSize", value);
                    }}
                    defaultValue="1080x1080"
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Canvas Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1080x1080">
                        Instagram Post (Square) 1080px 1080px
                      </SelectItem>
                      <SelectItem value="1080x566">
                        Instagram (Landscape) 1080px 566px
                      </SelectItem>
                      <SelectItem value="1200x630">
                        Facebook Post 1200px 630px
                      </SelectItem>
                      <SelectItem value="820x312">
                        Facebook Cover Photo 820px 312px
                      </SelectItem>
                      <SelectItem value="1024x512">
                        Twitter Post 1024px 512px
                      </SelectItem>
                      <SelectItem value="1500x500">
                        Twitter Header 1500px 500px
                      </SelectItem>
                      <SelectItem value="1200x627">
                        LinkedIn Post 1200px 627px
                      </SelectItem>
                      <SelectItem value="1584x396">
                        LinkedIn Cover Photo 1584px 396px
                      </SelectItem>
                      <SelectItem value="1000x1500">
                        Pinterest Pin 1000px 1500px
                      </SelectItem>
                      <SelectItem value="1280x720">
                        YouTube Thumbnail 1280px 720px
                      </SelectItem>
                      <SelectItem value="2560x1440">
                        YouTube Channel Art 2560px 1440px
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {/* <div>
                    {ipfsUrl && (
                      <a
                        href={"https://gateway.pinata.cloud/ipfs/" + ipfsUrl}
                        className="font-medium text-blue-700 dark:text-blue-600 hover:underline text-sm"
                      >
                        Click Here to View
                      </a>
                    )}
                  </div> */}
                  {/* {uploading && ipfsUrl === "" ? (
                    <Button variant="outline" className="w-full" disabled>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </Button>
                  ) : (
                    <div className="flex justify-between items-center w-full">
                      <Button
                        variant="outline"
                        className="w-full"
                        
                      >
                        Upload to IPFS
                      </Button>
                    </div>
                  )} */}
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 rounded-full border border-slate-800 focus-visible:ring-0"
                  disabled={imageUrl === "" || ipfsUrl !== ""}
                  onClick={()=>uploadFile(file as File, formik.values.description)}
                  // onClick={() => {
                  //   setOpenStatus((prev) => !prev);
                  //   if (imageUrl) {
                  //     handleMintPost(
                  //       imageUrl,
                  //       formik.values.description,
                  //       formik.values.canvasSize
                  //     );
                  //   }
                  // }}
                >
                  Mint and Create Post --test
                </Button>

                <Button
                  className="rounded-full"
                  disabled={imageUrl === ""}
                  onClick={() => {
                    setOpenIpStatusModal((prev) => !prev);
                    handleStoryProtocolFunctionalities(
                      file as File,
                      formik.values.description
                    );
                  }}
                >
                  Mint NFT to Story
                </Button>
                <Button
                  className="rounded-full"
                  onClick={() => {
                    makeDerivate();
                  }}
                >
                  Derivate
                </Button>
                {/* 
                <Button
                  className="w-full rounded-full"
                  onClick={() =>
                    mintAndRegisterNFT(file as File, formik.values.description)
                  }
                >
                  Mint NFT
                </Button> */}
                {/* {uploading && ipfsUrl === "" ? (
                  <Button variant="outline" className="w-full" disabled>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </Button>
                ) : (
                  <div className="flex justify-between items-center w-full">
                    <Button
                      className="w-full"
                      type="submit"
                      onClick={() =>
                        mintAndRegisterNFT(
                          file as File,
                          formik.values.description
                        )
                      }
                    >
                      Mint NFT to Story
                    </Button>
                  </div>
                )} */}
              </div>

              <div className="h-full w-full">
                {/* Image Upload with Preview */}
                <div className="flex justify-start gap-3 flex-col"></div>
                <div className="w-full h-[400px] lg:h-full border-2 rounded-xl flex justify-center items-center">
                  {imageUrl ? (
                    <div
                      className="rounded h-1/2 w-1/2 relative border-2 justify-center items-center flex bg-slate-200 duration-1000 animate-in ease-in-out"
                      style={renderImageStyles(canvasSize)}
                    >
                      <div
                        className="absolute -top-3 -right-3 cursor-pointer"
                        onClick={() => setImageUrl(null)}
                      >
                        <CircleX className="w-8 h-8 fill-black text-white cursor-pointer" />
                      </div>
                      {/* Get the selected canvas dimensions */}
                      <img
                        src={imageUrl}
                        alt="preview"
                        className={`absolute top-0 left-0 h-full w-full object-contain transition-opacity duration-300 ease-in-out ${
                          imgLoaded ? "opacity-100" : "opacity-0"
                        }`}
                        onLoad={() => setImgLoaded(true)}
                      />
                    </div>
                  ) : (
                    <Dropzone onDrop={handleDrop}>
                      {({getRootProps, getInputProps}) => (
                        <div className="w-full h-full rounded-xl">
                          <div
                            {...getRootProps()}
                            className="h-full w-full flex justify-center items-center"
                          >
                            <input {...getInputProps()} />
                            <p>
                              Drag 'n' drop some files here, or click to select
                              files
                            </p>
                          </div>
                        </div>
                      )}
                    </Dropzone>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
