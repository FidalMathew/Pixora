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
import {Hex} from "viem";
import NFTMintABI from "@/utils/mintnft.json";

export default function AddPost() {
  const getCanvasDimensions = (canvasSize: string) => {
    const [width, height] = canvasSize.split("x").map(Number);
    console.log(width, height, "width, height");
    return {width, height};
  };

  const [canvasSize, setCanvasSize] = useState<string>("1080x1080");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [uploading, setUploading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const {wallets} = useWallets();

  const {publicClient, walletClient, CONTRACT_ADDRESS} = useGlobalContext();

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

  const uploadFile = async () => {
    if (!file) {
      // alert("No file selected");
      toast.error("No file selected");
      return;
    }

    try {
      setUploading(true);
      const keyRequest = await fetch("/api/upload");
      const keyData = await keyRequest.json();
      const upload = await pinata.upload.file(file).key(keyData.JWT);
      console.log(upload);
      setIpfsUrl(upload.IpfsHash);
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    } finally {
      setUploading(false);
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

  //

  const mintNFT = async () => {
    if (!publicClient || !walletClient || !wallets[0]) return;
    try {
      const tx = await walletClient.writeContract({
        address: "0x314b192Ea659D9e34608666b5Fab9A7ec8F7878b" as Hex,
        abi: NFTMintABI,
        functionName: "mintPost",
        account: wallets[0].address as `0x${string}`, // Ensure loggedInAddress is properly set
        args: [],
        chain: baseSepolia,
      });

      await publicClient.waitForTransactionReceipt({hash: tx});

      console.log("NFT successfully minted");
    } catch (error) {
      console.error("Error minting NFT:", error);
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

  const [openStatus, setOpenStatus] = useState(false);

  return (
    <div className="  h-fit lg:h-screen w-full bg-white text-black ">
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
      <div
        className="flex justify-center items-center h-full"
        style={{
          height: "calc(100vh - 70px)",
        }}
      >
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
            <Form className="h-full w-full flex flex-col gap-4 p-10 lg:flex-row-reverse">
              <div className="flex flex-col gap-6 w-full">
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
                  // onClick={uploadFile}
                  onClick={() => {
                    setOpenStatus((prev) => !prev);
                    handleMintPost(
                      imageUrl,
                      formik.values.description,
                      formik.values.canvasSize
                    );
                  }}
                >
                  Mint and Create Post
                </Button>
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
                        onClick={() => setImageUrl("")}
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
