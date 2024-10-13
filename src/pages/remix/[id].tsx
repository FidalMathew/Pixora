import Navbar from "@/components/Navbar";

import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import {ScrollArea} from "@radix-ui/react-scroll-area";
import {Heart, Share, Shuffle} from "lucide-react";
import {useRouter} from "next/router";

export default function EachPicturePage() {
  const router = useRouter();
  console.log(router.query.id);
  return (
    <div
      className={`min-h-screen w-full bg-white text-black dark:bg-black dark:text-white`}
    >
      <Navbar />
      <div className="w-full h-fit flex justify-center items-center p-6">
        <div className="rounded-3xl bg-white border border-slate-800 h-fit lg:h-[650px] w-[900px] flex overflow-hidden flex-col lg:flex-row">
          <div className="w-full h-[600px] md:h-[400px] lg:w-3/5 lg:h-full flex items-center border-b lg:border-r lg:border-b-0 border-slate-800 overflow-hidden">
            <img src={`/boy.png`} alt="taylor" className="" />
          </div>
          <div className="lg:w-2/5 lg:h-full flex flex-col pt-5 gap-4">
            <div className="h-fit px-5 flex items-center">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src="/boy.png"
                    className="h-12 w-12 rounded-full overflow-hidden object-cover"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col justify-start gap-0">
                  <p className="text-sm font-normal">Creator</p>
                  <p className="text-lg font-semibold">Jaydeep Dey</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-start h-full w-full px-5 gap-4 mb-3">
              <div className="h-[47px] w-full flex items-center">
                <div className="mr-2 h-10 w-10 p-2 hover:bg-gray-100 rounded-full cursor-pointer ">
                  <Heart />
                </div>
                <div className="mr-2 h-10 w-10 p-2 hover:bg-gray-100 rounded-full cursor-pointer ">
                  <Share className="" />
                </div>
              </div>
              <div className="flex flex-col justify-start gap-2">
                <p className="font-semibold">Description</p>
                <div className="flex flex-col h-fit w-full gap-4 overflow-y-auto scroll-container">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Nihil rerum non ex voluptates saepe cum placeat iusto eligendi
                  perferendis quibusdam dolores sapiente molestias debitis
                  dolores
                </div>
              </div>
              <p className="font-semibold">Remixed from</p>
              <div className="flex flex-col justify-center gap-2 rounded-lg h-[70px] w-full border ">
                <div className="flex items-center justify-between px-5">
                  <div className="h-fit flex items-center gap-2 text-lg font-semibold">
                    <Avatar>
                      <AvatarImage
                        src="/taylor2.png"
                        className="h-10 w-10 rounded-full overflow-hidden object-cover"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col justify-start">
                      <p className="text-xs font-normal">Artist</p>
                      <p className="text-sm font-semibold">Taylor Swift</p>
                    </div>
                  </div>
                  <div className="rounded overflow-hidden h-12 w-12">
                    <img
                      src={`/taylor.png`}
                      alt="taylor"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
