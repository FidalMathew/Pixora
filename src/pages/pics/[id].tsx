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
            <img src={`/taylor.png`} alt="taylor" className="" />
          </div>
          <div className="lg:w-2/5 lg:h-full flex flex-col pt-5 gap-4">
            <div className="h-fit flex items-center px-5 gap-2 text-lg font-semibold">
              <Avatar>
                <AvatarImage
                  src="/taylor2.png"
                  className="h-14 w-14 rounded-full overflow-hidden object-cover"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col justify-start gap-0">
                <p className="text-sm font-normal">Artist</p>
                <p className="text-lg font-semibold">Taylor Swift</p>
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
              <p className="font-semibold">Remixed By</p>
              <div className="flex flex-col h-[430px] w-full mb-5 gap-4 overflow-y-auto scroll-container p-2">
                {Array.from({length: 7}).map((_, index) => (
                  <div
                    className="h-[70px] w-full border border-black rounded-md flex-shrink-0 flex items-center justify-around"
                    key={index}
                  >
                    <Avatar>
                      <AvatarImage
                        src="/boy.png"
                        className="h-10 w-10 rounded-full overflow-hidden object-cover"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <p>Jaydeep Dey</p>
                    <Button
                      className="rounded-full border border-slate-800 focus-visible:ring-0"
                      variant={"outline"}
                      size={"icon"}
                      onClick={() => router.push(`/remix/${index + 1}`)}
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
