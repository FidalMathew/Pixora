import Navbar from "@/components/Navbar";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {useEffect, useRef, useState} from "react";
import Moveable from "react-moveable";
import Selecto from "react-selecto";
import {Formik, Field, Form} from "formik";
import {Slider} from "@/components/ui/slider";
import axios from "axios";
import {ReloadIcon} from "@radix-ui/react-icons";
import {useGlobalContext} from "@/context/GlobalContext";
import {useRouter} from "next/router";
import html2canvas from "html2canvas";
import {pinata} from "@/utils/config";
import {toast} from "sonner";
import PIXORA_ABI from "@/utils/abi.json";
import {Hex} from "viem";
import {iliad} from "@story-protocol/core-sdk";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {CircleCheck, CircleX, ImageMinus, Save, Upload} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function EditingPage() {
  const router = useRouter();

  const {
    getPostDetails,
    walletClient,
    publicClient,
    provider,
    loggedInAddress,
    CONTRACT_ADDRESS,
  } = useGlobalContext();

  const [postInfo, setPostInfo] = useState<any>(null);

  const [target, setTarget] = useState<HTMLElement | null>(null); // Current moveable target
  const [showBorders, setShowBorders] = useState(false); // Control border visibility
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null); // Reference for the movable image
  const [position, setPosition] = useState<{x: number; y: number}>({
    x: 0,
    y: 0,
  }); // Track the position of the image
  const [size, setSize] = useState<{width: number; height: number}>({
    width: 100,
    height: 100,
  });

  // Deselect when clicking outside the target
  const handleDeselect = (e: React.MouseEvent) => {
    if (imgRef.current && !imgRef.current.contains(e.target as Node)) {
      setShowBorders(false); // Hide borders
      setTarget(null); // Deselect the target
    }
  };

  useEffect(() => {
    // Whenever target is set, make sure the borders are visible if there is a valid target
    if (target) {
      setShowBorders(true);
    }
  }, [target]);

  useEffect(() => {
    const savedPosition = localStorage.getItem("moveablePosition");
    const savedSize = localStorage.getItem("moveableSize");
    const savedRemovedBg = localStorage.getItem("removedBg");
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition)); // Parse and set the saved position
    }
    if (savedSize) {
      setSize(JSON.parse(savedSize)); // Parse and set the saved size
    }

    if (savedRemovedBg) {
      setPostInfo((prev: any) => {
        return {
          ...prev,
          imageUrl: savedRemovedBg,
        };
      });
    }
  }, []);

  // Function to save position and size to localStorage
  const saveToLocalStorage = (
    newPosition: {x: number; y: number},
    newSize: {width: number; height: number}
  ) => {
    localStorage.setItem("moveablePosition", JSON.stringify(newPosition));
    localStorage.setItem("moveableSize", JSON.stringify(newSize));
  };

  const [brightness, setBrightness] = useState({
    object: 100,
    background: 100,
  });
  const [contrast, setContrast] = useState({
    object: 100,
    background: 100,
  });
  const [saturation, setSaturation] = useState({
    object: 100,
    background: 100,
  });
  const [blur, setBlur] = useState({
    object: 0,
    background: 0,
  });
  const [opacity, setOpacity] = useState({
    object: 100,
    background: 100,
  });
  const [grayscale, setGrayscale] = useState({
    object: 0,
    background: 0,
  });
  const [sepia, setSepia] = useState({
    object: 0,
    background: 0,
  });

  const filterStyleBackground = `
  brightness(${brightness.background}%) 
  contrast(${contrast.background}%) 
  saturate(${saturation.background}%) 
  blur(${blur.background}px) 
  opacity(${opacity.background}%) 
  grayscale(${grayscale.background}%) 
  sepia(${sepia.background}%)`;

  const filterStyleObject = `
  brightness(${brightness.object}%) 
  contrast(${contrast.object}%) 
  saturate(${saturation.object}%) 
  blur(${blur.object}px) 
  opacity(${opacity.object}%) 
  grayscale(${grayscale.object}%) 
  sepia(${sepia.object}%)`;

  console.log(target, "target");

  const [background, setBackground] = useState<string>("");
  const [removedBg, setRemovedBg] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const generateBackground = async (prompt: string) => {
    setAiLoading(true);
    try {
      console.log(prompt, "prompt");
      const res = await axios.post("/api/generateImage", {
        prompt,
        height: 1024,
        width: 1024,
      });
      // setBackground(res);
      console.log(res.data.images[0].url, "res");

      setBackground(res.data.images[0].url);
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const removeBg = async (imageurl: string) => {
    if (!imageurl) return;
    try {
      const {data} = await axios.post("/api/removebg", {
        imageUrl: imageurl,
      });

      console.log(data, "data after remove bg");
      localStorage.setItem("removedBg", data.image);
      setRemovedBg(data.image);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async function () {
      if (provider && walletClient && publicClient) {
        console.log(router.query.id, "router.query.id");
        const val = await getPostDetails(parseInt(router.query.id as string));
        console.log(val, "val");
        if (val) {
          setPostInfo(val);
        }
      }
    })();
  }, [provider, walletClient, publicClient, router]);

  console.log(postInfo, "postInfo");

  const saveCombinedImage = async (): Promise<File | null> => {
    const element = containerRef.current;
    if (!element) return null;

    const canvas = await html2canvas(element, {useCORS: true});

    // Convert canvas to Blob and then to File
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "combined-image.png", {
            type: "image/png",
          });
          resolve(file);
        } else {
          resolve(null);
        }
      }, "image/png");
    });
  };

  const [ipfsUri, setIpfsUri] = useState<string | null>(null);
  const [ipfsJson, setIpfsJson] = useState<any | null>(null);

  const [executionState, setExecutionState] = useState<{
    uploadingToIPFS: boolean;
    ipfsError: string | null;
    ipfsSuccess: string | null;

    mintRemixLoading: boolean;
    mintRemixError: string | null;
    mintRemixSuccess: string | null;
  }>({
    uploadingToIPFS: false,
    ipfsError: null,
    ipfsSuccess: null,

    mintRemixLoading: false,
    mintRemixError: null,
    mintRemixSuccess: null,
  });

  const uploadFile = async (file: File, description: string) => {
    const keyRequest = await fetch("/api/upload");
    const keyData = await keyRequest.json();
    const upload = await pinata.upload.file(file).key(keyData.JWT);
    const json = {
      name: file.name,
      description: description,
      image: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`,
    };

    // await uploadJson(json);

    return {
      ipfsUri: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`,
      ipfsJson: json,
    };
  };

  const uploadJson = async (jsonData: {image: string; description: string}) => {
    try {
      // Step 1: Fetch JWT or authentication key
      const keyRequest = await fetch("/api/upload"); // Endpoint to get your Pinata JWT
      const keyData = await keyRequest.json();

      // Step 2: Upload the JSON data to IPFS using Pinata
      const jsonUpload = await pinata.upload.json(jsonData).key(keyData.JWT);

      console.log(
        jsonUpload,
        "jsonUpload",
        `https://gateway.pinata.cloud/ipfs/${jsonUpload.IpfsHash}`
      );

      // Step 3: Return the IPFS URI of the uploaded JSON
      // imageUrl: string, description: string, canvasSize: string, tokenURI: string
      // createPost(
      //   jsonData.image,
      //   jsonData.description,
      //   "1080x1080",
      //   `https://gateway.pinata.cloud/ipfs/${jsonUpload.IpfsHash}`
      // );

      return {
        jsonIpfsUri: `https://gateway.pinata.cloud/ipfs/${jsonUpload.IpfsHash}`, // JSON metadata IPFS link
      };
    } catch (error) {
      console.error("Error uploading JSON to IPFS:", error);
      // throw new Error("JSON upload failed");
    }
  };

  const handleCreatingRemixAndMint = async () => {
    if (!provider || !publicClient || !walletClient || !loggedInAddress) return;

    try {
      // Step 1: Upload to IPFS
      setExecutionState((prevState) => ({
        ...prevState,
        uploadingToIPFS: true,
      }));

      console.log("Generating and uploading image to IPFS...");

      const file = await saveCombinedImage();
      if (!file) {
        toast.error("Error generating combined image");
        return;
      }

      console.log(file, "file to uploadddd");
      // Upload image to IPFS
      const {ipfsUri, ipfsJson} = await uploadFile(
        file,
        "Remix description here"
      );
      const tokenURI = await uploadJson(ipfsJson);

      console.log("IPFS upload successful");
      console.log(ipfsJson.image, "ipfs image");
      console.log(ipfsUri, "ipfsUri");

      setIpfsJson(ipfsJson);
      setIpfsUri(ipfsUri);

      setExecutionState((prevState) => ({
        ...prevState,
        uploadingToIPFS: false,
        ipfsSuccess: ipfsUri,
      }));

      //   // Step 2: Mint Remix
      try {
        setExecutionState((prevState) => ({
          ...prevState,
          mintRemixLoading: true,
        }));

        console.log("Minting remix...");

        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS as Hex,
          abi: PIXORA_ABI,
          functionName: "createRemix",
          account: loggedInAddress as Hex,
          args: [
            router.query.id,
            ipfsJson.image, // The image URL from IPFS
            "hello",
            "1080x1080",
            tokenURI?.jsonIpfsUri,
          ],
          chain: iliad,
        });

        await publicClient.waitForTransactionReceipt({hash: tx});
        console.log("Remix successfully created");

        setExecutionState((prevState) => ({
          ...prevState,
          mintRemixLoading: false,
          mintRemixSuccess: tx,
        }));
      } catch (error: any) {
        console.error(error.message);
        toast.error("Error creating remix");
        setExecutionState((prevState) => ({
          ...prevState,
          mintRemixLoading: false,
          mintRemixError: "Error creating remix",
        }));
        return;
      }
    } catch (error: any) {
      console.error(error.message);
      toast.error("Error uploading to IPFS");
      setExecutionState((prevState) => ({
        ...prevState,
        uploadingToIPFS: false,
        ipfsError: "Error uploading to IPFS",
      }));
      return;
    }
  };

  const [openStatus, setOpenStatus] = useState(false);

  return (
    <div className="h-screen w-full bg-white text-black dark:bg-black dark:text-white">
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
                      {executionState.ipfsSuccess && ipfsUri && (
                        <a href={`${ipfsJson.image}`} target="_blank">
                          {" "}
                          {`${ipfsJson.image}`}
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
                      {executionState.mintRemixSuccess && (
                        <a
                          href={`https://sepolia.basescan.org/tx/${executionState.mintRemixSuccess}`}
                          target="_blank"
                        >
                          {" "}
                          {`https://sepolia.basescan.org/tx/${executionState.mintRemixSuccess}`}
                        </a>
                      )}
                      {executionState.mintRemixError && (
                        <p className="text-red-700">
                          {executionState.mintRemixError}
                        </p>
                      )}
                    </p>
                  </div>
                  {executionState.mintRemixLoading ? (
                    <ReloadIcon className="h-5 w-5 animate-spin" />
                  ) : executionState.mintRemixSuccess ? (
                    <CircleCheck className="h-9 w-9 fill-green-700 text-white" />
                  ) : (
                    executionState.mintRemixError !== null && (
                      <CircleX className="h-9 w-9 fill-red-700 text-white" />
                    )
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/* <div className="w-full h-[70px] font-poppins font-semibold text-lg border-b flex items-center justify-between px-6">
        <div onClick={router.push('/')} className="">Pixora</div>
        <div className="flex items-center gap-3">
          <img
            src={"/user.png"}
            alt="user"
            className="h-8 w-8 border rounded-full border-gray-700 cursor-pointer"
          />
          <Button variant="outline">Post the edit</Button>
        </div>
      </div> */}
      <Navbar />
      <div
        className="p-5 flex gap-3"
        style={{
          height: "calc(100vh - 70px)",
        }}
      >
        <div className="h-full w-full flex-1 bg-white rounded-xl flex justify-center items-center">
          <div
            className="h-full w-full flex-1 bg-white rounded-xl flex justify-center items-center"
            onClick={handleDeselect} // Deselect on outside click
          >
            <div
              ref={containerRef}
              className="h-full w-full bg-gray-100 overflow-hidden rounded-lg relative"
            >
              {/* Background image */}
              <img
                src={background || "/background.png"} // Use the correct path to the public folder image
                alt="background"
                className="absolute top-0 left-0 w-full h-full object-cover"
                style={{filter: filterStyleBackground}}
                crossOrigin="anonymous"
              />

              {/* Moveable image on top of background */}
              <img
                src={removedBg || postInfo?.imageUrl || "/boy.png"} // Path to the new image
                alt="movable"
                className="absolute moveable-item"
                ref={imgRef} // Ref for Selecto and Moveable
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`, // Apply the initial position from state
                  width: `${size.width}px`, // Apply the saved width
                  height: `${size.height}px`, // Apply the saved height
                  filter: filterStyleObject,
                }}
                crossOrigin="anonymous"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent deselection when clicking on the image
                  setTarget(imgRef.current); // Set the image as the target
                  setShowBorders(true); // Show borders on click
                }}
              />

              {/* Moveable component */}
              {target && showBorders && (
                <Moveable
                  target={target}
                  draggable={true}
                  resizable={true}
                  throttleDrag={0}
                  throttleResize={0}
                  renderDirections={[
                    "n",
                    "s",
                    "e",
                    "w",
                    "nw",
                    "ne",
                    "sw",
                    "se",
                  ]} // Show all resize directions
                  onDrag={({target, beforeTranslate}) => {
                    const newX = beforeTranslate[0];
                    const newY = beforeTranslate[1];
                    setPosition({x: newX, y: newY}); // Update position in state during drag
                    (
                      target as HTMLElement
                    ).style.transform = `translate(${newX}px, ${newY}px)`;
                  }}
                  onResize={({target, width, height, drag}) => {
                    // Apply the updated size to the target element
                    const newX = drag.beforeTranslate[0];
                    const newY = drag.beforeTranslate[1];
                    setPosition({x: newX, y: newY}); // Update position due to resize drag
                    setSize({width, height}); // Update size in state
                    (target as HTMLElement).style.width = `${width}px`;
                    (target as HTMLElement).style.height = `${height}px`;
                    (
                      target as HTMLElement
                    ).style.transform = `translate(${newX}px, ${newY}px)`;
                  }}
                  onDragEnd={() => {
                    saveToLocalStorage(position, size); // Save position and size to localStorage after dragging ends
                    setShowBorders(true); // Keep borders after dragging
                  }}
                  onResizeEnd={() => {
                    saveToLocalStorage(position, size); // Save position and size to localStorage after resizing ends
                    setShowBorders(true); // Keep borders after resizing
                  }}
                />
              )}

              {/* Selecto component */}
              <Selecto
                container={containerRef.current}
                selectableTargets={[".moveable-item"]}
                hitRate={0}
                selectByClick={true}
                selectFromInside={false} // Prevent selection from starting inside
                onSelect={({selected}) => {
                  if (selected.length > 0) {
                    setTarget(selected[0] as HTMLElement); // Set the first selected item as moveable target
                    setShowBorders(true); // Show borders on selection
                  } else {
                    setShowBorders(false); // Hide borders if nothing is selected
                  }
                }}
                onDragStart={(e) => {
                  // Prevent Selecto from starting if the drag starts inside the image area
                  if (
                    imgRef.current &&
                    imgRef.current.contains(e.inputEvent.target as Node)
                  ) {
                    e.preventDefault(); // Stop Selecto if the drag starts from within the image
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex h-full w-[300px] rounded-xl border flex-col p-4 justify-start gap-4">
          <Formik
            initialValues={{aiprompt: ""}}
            onSubmit={(values, _) => generateBackground(values.aiprompt)}
          >
            {(formik) => (
              <Form>
                <div className="flex flex-col gap-3 justify-start">
                  <Label htmlFor="aiprompt" className="">
                    Generate New Background
                  </Label>
                  <Field
                    as={Textarea}
                    name="aiprompt"
                    id="aiprompt"
                    placeholder="Give your AI Prompt Here"
                    className="w-full h-[70px]"
                  />
                  {aiLoading ? (
                    <Button variant="outline" className="w-full" disabled>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </Button>
                  ) : (
                    <Button type="submit">Generate</Button>
                  )}
                </div>
              </Form>
            )}
          </Formik>

          <div className="grid grid-cols-3 gap-4 mt-4">
            {" "}
            {/* Create a grid with 3 columns */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    onClick={saveCombinedImage}
                    variant={"outline"}
                    className="w-full flex items-center justify-center"
                  >
                    <Save className="h-5 w-5" /> {/* Icon with margin */}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save the combined image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant={"outline"}
                    onClick={() => removeBg(postInfo?.imageUrl)}
                    className="w-full flex items-center justify-center"
                  >
                    <ImageMinus className="h-5 w-5" /> {/* Icon with margin */}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove the background</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setOpenStatus(true);
                      handleCreatingRemixAndMint();
                    }}
                    className="w-full flex items-center justify-center"
                  >
                    <Upload className="h-5 w-5" /> {/* Icon with margin */}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mint and add the post</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {target === null ? (
            <div className="flex flex-col border rounded-xl gap-4">
              <p className="px-4 pt-4">Editing the Background</p>
              <div className="flex flex-col px-4 gap-5 pb-6">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="brightness">Brightness</Label>
                  <Slider
                    defaultValue={[brightness.background]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setBrightness({
                        object: brightness.object,
                        background: value[0],
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="brightness">Contrast</Label>
                  <Slider
                    defaultValue={[contrast.background]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setContrast({
                        object: contrast.object,
                        background: value[0],
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="brightness">Saturation</Label>
                  <Slider
                    defaultValue={[saturation.background]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setSaturation({
                        object: saturation.object,
                        background: value[0],
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="brightness">Blur</Label>
                  <Slider
                    defaultValue={[blur.background]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setBlur({object: blur.object, background: value[0]})
                    }
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="brightness">Opacity</Label>
                  <Slider
                    defaultValue={[opacity.background]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setOpacity({object: opacity.object, background: value[0]})
                    }
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="brightness">Grayscale</Label>
                  <Slider
                    defaultValue={[grayscale.background]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setGrayscale({
                        object: grayscale.object,
                        background: value[0],
                      })
                    }
                  />
                </div>
                {/* <div className="flex flex-col gap-3">
                  <Label htmlFor="brightness">Sepia</Label>
                  <Slider
                    defaultValue={[sepia.background]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setSepia({object: sepia.object, background: value[0]})
                    }
                  />
                </div> */}
              </div>
            </div>
          ) : (
            <div className="flex flex-col border rounded-xl gap-4">
              <p className="px-4 pt-4">Editing the Object</p>
              <div className="flex flex-col px-4 gap-5 pb-6">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="brightness">Brightness</Label>
                  <Slider
                    defaultValue={[brightness.object]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setBrightness({
                        object: value[0],
                        background: brightness.background,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="brightness">Contrast</Label>
                  <Slider
                    defaultValue={[contrast.object]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setContrast({
                        object: value[0],
                        background: contrast.background,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="brightness">Saturation</Label>
                  <Slider
                    defaultValue={[saturation.object]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setSaturation({
                        object: value[0],
                        background: saturation.background,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="brightness">Blur</Label>
                  <Slider
                    defaultValue={[blur.object]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setBlur({object: value[0], background: blur.background})
                    }
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="brightness">Opacity</Label>
                  <Slider
                    defaultValue={[opacity.object]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setOpacity({
                        object: value[0],
                        background: opacity.background,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="brightness">Grayscale</Label>
                  <Slider
                    defaultValue={[grayscale.object]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setGrayscale({
                        object: value[0],
                        background: grayscale.background,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="brightness">Sepia</Label>
                  <Slider
                    defaultValue={[sepia.object]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setSepia({object: value[0], background: sepia.background})
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
