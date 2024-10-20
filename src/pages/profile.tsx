import Navbar from "@/components/Navbar";
import {listenNowAlbums} from "@/lib/data";
import {useWallets} from "@privy-io/react-auth";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import localFont from "next/font/local";
// import FileUpload from "@/components/custom/FileUpload";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useGlobalContext} from "@/context/GlobalContext";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Pencil, User} from "lucide-react";
import {Field, Form, Formik} from "formik";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import Dropzone from "react-dropzone";
import {pinata} from "@/utils/config";
import PIXORA_ABI from "@/utils/abi.json";
import {iliad} from "@story-protocol/core-sdk";
import {Hex} from "viem";
import {ReloadIcon} from "@radix-ui/react-icons";

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
export default function Profile() {
  const {wallets} = useWallets();
  const router = useRouter();

  const {
    getUserPosts,
    walletClient,
    publicClient,
    provider,
    loggedInAddress,
    CONTRACT_ADDRESS,
  } = useGlobalContext();

  const [posts, setPosts] = useState<any[]>([]);
  const [remixes, setRemixes] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      if (wallet) {
        console.log(wallet, "wallet");

        const res = await getUserPosts(wallet.address);
        console.log(res, "user posts");
        setPosts(res);
      }
    };
    fetch();
  }, [walletClient, publicClient, provider]);

  const wallet = wallets[0];

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const createUser = async (name: string, picUrl: string) => {
    try {
      if (publicClient && walletClient) {
        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS as Hex,
          abi: PIXORA_ABI,
          functionName: "registerUser",
          account: loggedInAddress as `0x${string}`,
          args: [name, picUrl, loggedInAddress, true],
          chain: iliad,
        });

        await publicClient.waitForTransactionReceipt({hash: tx});
        console.log("User added successfully  ");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      return;
    }
  };

  const [userDetails, setUserDetails] = useState<any>(null);

  const getUserDetailsFunction = async () => {
    try {
      if (publicClient && loggedInAddress) {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS as Hex,
          abi: PIXORA_ABI,
          functionName: "getUser",
          args: [loggedInAddress],
        });

        console.log(data, "user Details");

        if (data) {
          setUserDetails(data);
        }
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };

  useEffect(() => {
    if (provider && walletClient && publicClient) {
      getUserDetailsFunction();
    }
  }, [walletClient, publicClient, provider, loggedInAddress, CONTRACT_ADDRESS]);

  console.log(userDetails, "userDetails");

  return (
    <div
      className={`h-screen min-h-screen w-full bg-white text-black dark:bg-black dark:text-white`}
    >
      <Navbar />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="text-black bg-white">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              <Formik
                initialValues={{
                  name: "",
                  photo: null,
                }}
                onSubmit={(values) => {
                  (async function () {
                    setLoading(true);
                    try {
                      const keyRequest = await fetch("/api/upload");
                      const keyData = await keyRequest.json();
                      const upload = await pinata.upload
                        .file(values.photo as unknown as File)
                        .key(keyData.JWT);

                      console.log(upload, "upload");

                      await createUser(
                        values.name,
                        `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`
                      );
                    } catch (error: any) {
                      console.log(error);
                    } finally {
                      setLoading(false);
                    }
                  })();
                }}
              >
                {(formik) => (
                  <Form className="flex flex-col gap-6">
                    <Dropzone
                      onDrop={(acceptedFiles) => {
                        // Set the first accepted file as the value of the 'photo' field
                        if (acceptedFiles.length > 0) {
                          formik.setFieldValue("photo", acceptedFiles[0]);
                          console.log(acceptedFiles[0], "file"); // Log the file for confirmation
                        }
                      }}
                    >
                      {({getRootProps, getInputProps, isDragActive}) => (
                        <div
                          {...getRootProps()}
                          className="this-container w-full justify-center items-center flex mt-6"
                        >
                          <input {...getInputProps()} />
                          <div
                            className={`w-28 h-28 rounded-full border-2 flex justify-center items-center cursor-pointer bg-gray-100 ${
                              isDragActive ? "bg-pink-700" : ""
                            }`}
                          >
                            {formik.values.photo ? (
                              <img
                                src={URL.createObjectURL(formik.values.photo)}
                                alt="profile"
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <User className="h-12 w-12" />
                            )}
                          </div>
                        </div>
                      )}
                    </Dropzone>
                    <div className="flex justify-start flex-col gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Field
                        as={Input}
                        name="name"
                        placeholder="Name"
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-start flex-col gap-2">
                      <Label htmlFor="name">Address</Label>
                      <Field
                        as={Input}
                        name="address"
                        placeholder="Address"
                        className="w-full"
                        value={wallet.address}
                        disabled
                      />
                    </div>

                    {loading ? (
                      <Button disabled className="w-full">
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </Button>
                    ) : (
                      <Button type="submit">Confirm</Button>
                    )}
                  </Form>
                )}
              </Formik>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="w-full flex flex-col lg:flex-row p-5 gap-7 bg-white text-black dark:bg-black dark:text-white lg:h-full">
        <div className="h-[800px] lg:h-full lg:w-1/3 w-full">
          <div className="border-2 rounded-lg border-slate-800 h-full w-full overflow-hidden flex flex-col justify-start">
            <img
              src={(userDetails && userDetails.profilePic) || "/taylor.jpg"}
              alt="taylor"
              className="w-full h-2/3 object-cover"
            />
            <div className="h-1/3 w-full flex flex-col justify-start mt-4 px-5">
              <div className="flex w-full justify-between items-center">
                <p className="font-normal text-gray-800 text-3xl font-poppins">
                  {(userDetails && userDetails.name) || "Create your profile"}
                </p>
                {!userDetails && (
                  <Button
                    size="icon"
                    onClick={() => setOpen(true)}
                    variant={"outline"}
                    className="rounded-full border-2 border-slate-800"
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <p className="font-normal text-gray-800 font-poppins text-sm">
                {wallet &&
                  wallet.address.slice(0, 10) +
                    "..." +
                    wallet.address.slice(-4)}
              </p>
            </div>
            {/* <FileUpload /> */}
          </div>
        </div>
        {/* <Tabs defaultValue="remixbyusers" className="w-2/3 lg:h-full h-[200px]">
          <TabsList>
            <TabsTrigger value="remixbyusers">Remix by User</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>
          <TabsContent
            value="remixbyusers"
            className="h-[95%] grid grid-cols-2 gap-3 p-5 bg-pink-100"
          >
            {posts &&
              posts.slice(0, 4).map((album, index) => (
                <div
                  className="overflow-hidden rounded-md flex flex-col gap-2"
                  key={index}
                >
                  <div className="overflow-hidden rounded-md h-full lg:h-[90%] w-full">
                    <img
                      src={album.imageUrl}
                      alt={album.name}
                      className={
                        "object-cover transition-all hover:scale-105 aspect-[3/4] object-center"
                      }
                    />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <div className="flex items-center text-sm">
                      <p>By &nbsp;</p>
                      <Avatar>
                        <AvatarImage
                          src="/boy.png"
                          className="h-5 w-5 rounded-full"
                        />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="">Jaydeep Dey</p>
                  </div>
                </div>
              ))}
          </TabsContent>
          <TabsContent value="posts">hello</TabsContent>
        </Tabs> */}
        <div className="w-full lg:w-2/3 h-[900px] lg:h-full">
          <Tabs defaultValue="posts" className="">
            <TabsList>
              <TabsTrigger value="remixbyusers">Remixes By User</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="w-full h-full">
              <div
                className="grid grid-cols-2 gap-4 h-[95%] w-full p-6"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                }}
              >
                {posts && posts.length === 0 && (
                  <div className="h-full w-full flex justify-center items-center">
                    <p className="text-2xl font-semibold">No Posts Yet</p>
                  </div>
                )}
                {posts &&
                  posts.slice(0, 4).map((album, index) => (
                    <div
                      className="overflow-hidden rounded-md flex flex-col gap-2 h-[95%] aspect-square"
                      key={index}
                      onClick={() => router.push(`/pics/${album.postId}`)}
                    >
                      <div className="overflow-hidden rounded-md h-full lg:h-[90%] w-full">
                        <img
                          src={album.imageUrl}
                          alt={album.name}
                          className={
                            "object-cover transition-all hover:scale-105 aspect-[3/4] object-center"
                          }
                        />
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex items-center text-sm">
                          <p>By &nbsp;</p>
                          <Avatar>
                            <AvatarImage
                              src="/boy.png"
                              className="h-5 w-5 rounded-full"
                            />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                        </div>
                        <p className="">Jaydeep Dey</p>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="remixbyusers" className="w-full h-full">
              <div
                className="grid grid-cols-2 gap-4 h-[95%] w-full p-6"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                }}
              >
                {remixes && remixes.length === 0 && (
                  <div className="h-full w-full flex justify-center items-center">
                    <p className="text-2xl font-semibold">No Posts Yet</p>
                  </div>
                )}
                {remixes &&
                  remixes.slice(0, 4).map((album, index) => (
                    <div
                      className="overflow-hidden rounded-md flex flex-col gap-2 h-[95%] aspect-square"
                      key={index}
                      onClick={() => router.push(`/pics/${album.postId}`)}
                    >
                      <div className="overflow-hidden rounded-md h-full lg:h-[90%] w-full">
                        <img
                          src={album.imageUrl}
                          alt={album.name}
                          className={
                            "object-cover transition-all hover:scale-105 aspect-[3/4] object-center"
                          }
                        />
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex items-center text-sm">
                          <p>By &nbsp;</p>
                          <Avatar>
                            <AvatarImage
                              src="/boy.png"
                              className="h-5 w-5 rounded-full"
                            />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                        </div>
                        <p className="">Jaydeep Dey</p>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
