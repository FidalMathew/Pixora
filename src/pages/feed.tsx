import Navbar from "@/components/Navbar";
import {Button} from "@/components/ui/button";
import {listenNowAlbums} from "@/lib/data";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import {Heart, Share, Shuffle} from "lucide-react";
import localFont from "next/font/local";
import {useRouter} from "next/router";

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
  return (
    <div
      className={`h-full w-full bg-white text-black dark:bg-black dark:text-white`}
    >
      <Navbar />
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
