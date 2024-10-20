import Navbar from "@/components/Navbar";
import {listenNowAlbums} from "@/lib/data";
import {useWallets} from "@privy-io/react-auth";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import localFont from "next/font/local";
// import FileUpload from "@/components/custom/FileUpload";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import { useGlobalContext } from "@/context/GlobalContext";
import { useEffect, useState } from "react";

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
  const {wallets  } = useWallets();

  const {getUserPosts, walletClient, publicClient,provider} = useGlobalContext();
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
    }
    fetch();
  }, [ walletClient, publicClient, provider]);
  

  const wallet = wallets[0];

  return (
    <div
      className={`h-screen min-h-screen w-full bg-white text-black dark:bg-black dark:text-white`}
    >
      <Navbar />
      <div
        className="w-full flex flex-col lg:flex-row p-5 gap-7 bg-white text-black dark:bg-black dark:text-white"
        style={{
          height: "calc(100vh - 70px)",
        }}
      >
        <div className="h-full lg:w-1/3 w-full">
          <div className="border-2 rounded-lg border-slate-800 h-full w-full overflow-hidden flex flex-col justify-start">
            <img
              src="/taylor.png"
              alt="taylor"
              className="w-full h-2/3 object-cover"
            />
            <div className="h-1/3 w-full flex flex-col justify-start mt-4 px-5">
              <p className="font-normal text-gray-800 text-3xl font-poppins">
                Taylor Swift
              </p>
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

        <Tabs defaultValue="remixbyusers" className="w-2/3 h-full">
          <TabsList>
            <TabsTrigger value="remixbyusers">Remix by User</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>
          <TabsContent
            value="remixbyusers"
            className="h-[95%] grid grid-cols-2 gap-3 p-5 bg-pink-100"
          >
            {listenNowAlbums.map((album, index) => (
              <div
                className="overflow-hidden rounded-md flex flex-col gap-2"
                key={index}
              >
                <div className="overflow-hidden rounded-md h-full lg:h-[90%] w-full">
                  <img
                    src={album.cover}
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
          <TabsContent value="posts" > 
          {/* {posts && posts.length>0 && posts.map((item, index) => (
              <div
                className="overflow-hidden rounded-md flex flex-col gap-2"
                key={index}
              >
                <div className="overflow-hidden rounded-md h-full lg:h-[90%] w-full">
                  <img
                    src={item.imageUrl}
                    alt={item.description}
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
                        src={item.imageUrl}
                        className="h-5 w-5 rounded-full"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="">{item.owner.slice(0, 10) + "..." + item.owner.slice(-4)}</p>
                </div>
              </div>
            ))} */}
          </TabsContent>
        </Tabs>
        {/* <div className="h-full lg:w-2/3 w-full">
          <div
            className="bg-pink-50 h-full w-full grid grid-cols-2 gap-3 p-5 rounded-2xl"
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(300px, 1fr)`,
            }}
          >
            {listenNowAlbums.map((album, index) => (
              <div
                className="overflow-hidden rounded-md flex flex-col gap-2"
                key={index}
              >
                <div className="overflow-hidden rounded-md h-full lg:h-[90%] w-full">
                  <img
                    src={album.cover}
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
        </div> */}
      </div>
    </div>
  );
}
