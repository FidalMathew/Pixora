import Navbar from "@/components/Navbar";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import {ScrollArea} from "@radix-ui/react-scroll-area";
import {Heart, Share, Shuffle} from "lucide-react";
import {useRouter} from "next/router";
import {useGlobalContext} from "@/context/GlobalContext";
import {useState, useEffect, Key} from "react";
import {Hex} from "viem";
import PIXORA_ABI from "@/utils/abi.json";

export default function EachPicturePage() {
  const router = useRouter();
  console.log(router.query.id);
  const [userDetails, setUserDetails] = useState<any>([]);

  const {
    getPostDetails,
    walletClient,
    publicClient,
    provider,
    loggedInAddress,
    CONTRACT_ADDRESS,
    getRemixesByPostId,
  } = useGlobalContext();

  const [postInfo, setPostInfo] = useState<any>(null);
  const [remixes, setRemixes] = useState<any>([]);

  useEffect(() => {
    (async function () {
      if (provider && walletClient && publicClient) {
        console.log(router.query.id, "router.query.id");

        const postId = parseInt(router.query.id as string);
        const val = await getPostDetails(postId);
        console.log(val, "val");

        if (val) {
          setPostInfo(val);
        }

        const res = await getRemixesByPostId(postId);
        console.log(res, "remixes");

        if (Array.isArray(res)) {
          setRemixes(res);
        }
      }
    })();
  }, [provider, walletClient, publicClient, router.query.id]);

  const getUserDetailsFunction = async (address: string) => {
    try {
      if (publicClient) {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS as Hex,
          abi: PIXORA_ABI,
          functionName: "getUser",
          args: [address],
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

  // useEffect(() => {
  //   if (provider && walletClient && publicClient) {
  //   }
  // }, [walletClient, publicClient, provider, loggedInAddress, CONTRACT_ADDRESS]);

  console.log(userDetails, "userDetails");

  return (
    <div
      className={`min-h-screen w-full bg-white text-black dark:bg-black dark:text-white`}
    >
      <Navbar />
      <div className="w-full h-fit flex justify-center items-center p-6">
        <div className="rounded-3xl bg-white border border-slate-800 h-fit lg:h-[650px] w-[900px] flex overflow-hidden flex-col lg:flex-row">
          <div className="w-full h-[600px] md:h-[400px] lg:w-3/5 lg:h-full flex items-center border-b lg:border-r lg:border-b-0 border-slate-800 overflow-hidden">
            <img src={postInfo?.imageUrl} alt="taylor" className="m-auto" />
          </div>
          <div className="lg:w-2/5 lg:h-full flex flex-col pt-5 gap-4">
            <div className="h-fit flex items-center px-5 gap-2 text-lg font-semibold">
              <Avatar>
                <AvatarImage
                  src={postInfo?.imageUrl}
                  className="h-14 w-14 rounded-full overflow-hidden object-cover"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col justify-start gap-0">
                <p className="text-sm font-normal">Creator</p>
                <p className="text-lg font-semibold">
                  {postInfo?.owner.slice(0, 6)}...{postInfo?.owner.slice(-4)}
                </p>
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
                {remixes.map((item: any, index: Key | null | undefined) => (
                  <div
                    className="h-[70px] w-full border border-black rounded-md flex-shrink-0 flex items-center justify-around"
                    key={index}
                  >
                    <Avatar>
                      <AvatarImage
                        src={item.imageUrl}
                        className="h-10 w-10 rounded-full overflow-hidden object-cover"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <p>
                      {item.owner.slice(0, 6)}...{item?.owner.slice(-4)}
                    </p>
                    <Button
                      className="rounded-full border border-slate-800 focus-visible:ring-0"
                      variant={"outline"}
                      size={"icon"}
                      onClick={() => {
                        if (typeof index === "number") {
                          router.push(`/remix/${Number(item.remixId)}`);
                        }
                      }}
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
