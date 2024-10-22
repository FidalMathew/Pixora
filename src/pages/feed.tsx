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

  const {createPost, allPosts, allRemixes} = useGlobalContext();
  console.log(allPosts, "allPosts");
  console.log(allRemixes, "allRemixes");

  return (
    <div
      className={`h-fit min-h-screen w-full bg-white text-black dark:bg-black dark:text-white`}
    >
      <Navbar />
      <div
        className={`w-full h-full ${geistSans.className} flex justify-center`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-5xl p-7 h-full w-full">
          {allPosts &&
            allPosts.length > 0 &&
            allPosts.map(({item, user}, index) => (
              <div
                className="w-full m-2 rounded-lg h-[400px] border-2 border-slate-700 overflow-hidden"
                key={index}
              >
                <img
                  src={item.imageUrl}
                  alt="taylor"
                  className="w-full object-contain cursor-pointer"
                  onClick={() => router.push(`/pics/${item.postId}`)}
                  style={{height: "calc((100% * 5 / 6) - 50px)"}}
                />
                <div className="h-[50px] flex items-center px-5 gap-2 text-sm font-light">
                  <Avatar>
                    <AvatarImage
                      src={user?.profilePic}
                      className="h-7 w-7 rounded-full"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  {/* <p>By</p> */}

                  <div className="flex flex-col justify-start">
                    <p className="font-bold">{user?.name}</p>
                    <p className="text-xs">
                      {item.owner.slice(0, 10) + "..." + item.owner.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 h-1/6">
                  <Button
                    className="w-fit rounded-full border border-slate-800 focus-visible:ring-0"
                    variant={"outline"}
                    onClick={() =>
                      router.push(`/editing/${parseInt(item.postId)}`)
                    }
                  >
                    <Shuffle className="mr-2 h-4 w-4" />
                    Remix
                  </Button>
                  <div className="flex items-center">
                    {/* <div className="mr-2 h-10 w-10 p-2 hover:bg-gray-100 rounded-full cursor-pointer ">
                      <Heart />
                    </div>
                    <div className="mr-2 h-10 w-10 p-2 hover:bg-gray-100 rounded-full cursor-pointer ">
                      <Share className="" />
                    </div> */}
                  </div>
                </div>
              </div>
            ))}
          {allRemixes &&
            allRemixes.length > 0 &&
            allRemixes.map(({item, user}, index) => (
              <div
                className="w-full m-2 rounded-lg h-[400px] border-2 border-slate-700 overflow-hidden"
                key={index}
              >
                <img
                  src={item.imageUrl}
                  alt="taylor"
                  className="w-full object-contain cursor-pointer"
                  onClick={() => router.push(`/remix/${item.remixId}`)}
                  style={{height: "calc((100% * 5 / 6) - 50px)"}}
                />
                <div className="h-[50px] flex items-center px-5 gap-2 text-sm font-light">
                  <Avatar>
                    <AvatarImage
                      src={user?.profilePic}
                      className="h-7 w-7 rounded-full"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col justify-start">
                    <p className="font-bold">{user?.name}</p>
                    <p className="text-xs">
                      {item.owner.slice(0, 10) + "..." + item.owner.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 h-1/6">
                  <Button
                    className="w-fit rounded-full border border-slate-800 focus-visible:ring-0"
                    variant={"outline"}
                  >
                    Remix of Post: #{Number(item.postId)}
                  </Button>
                  <div className="flex items-center">
                    {/* <div className="mr-2 h-10 w-10 p-2 hover:bg-gray-100 rounded-full cursor-pointer ">
                      <Heart />
                    </div>
                    <div className="mr-2 h-10 w-10 p-2 hover:bg-gray-100 rounded-full cursor-pointer ">
                      <Share className="" />
                    </div> */}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
