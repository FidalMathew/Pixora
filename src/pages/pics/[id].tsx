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

  const {
    getPostDetails,
    walletClient,
    publicClient,
    provider,
    userDetails,
    CONTRACT_ADDRESS,
    loggedInAddress,
    getRemixesByPostId,
  } = useGlobalContext();

  const [postInfo, setPostInfo] = useState<any>(null);
  const [remixes, setRemixes] = useState<any>([]);

  const getUserDetailsByAddress = async (address: string) => {
    try {
      if (publicClient && walletClient && loggedInAddress) {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS as Hex,
          abi: PIXORA_ABI,
          functionName: "getUser",
          args: [address],
        });

        console.log(data, "user Details");
        return data as any[];
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };

  useEffect(() => {
    (async function () {
      if (provider && walletClient && publicClient && userDetails) {
        console.log(router.query.id, "router.query.id");

        const postId = parseInt(router.query.id as string);
        const val = await getPostDetails(postId);

        if (val) {
          // @ts-ignore
          const postInformation = await getUserDetailsByAddress(val.owner);

          setPostInfo({
            ...val,
            user: postInformation,
          });
        }

        const res = await getRemixesByPostId(postId);

        console.log(userDetails, "userDetails");
        console.log(res, "remixes");

        if (Array.isArray(res)) {
          // setRemixes(res);

          // merge the remixes data with the original data
          const remixesData = await Promise.all(
            res.map(async (item: any) => {
              const user = await getUserDetailsByAddress(item.owner);

              console.log(user, "userrrrrrr");
              console.log(item, "item");
              return {
                user,
                item,
              };
            })
          );

          console.log(remixesData, "remixesData");

          setRemixes(remixesData);
        }
      }
    })();
  }, [provider, walletClient, publicClient, router.query.id, userDetails]);

  console.log(postInfo, "postInfomation");

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
                  src={postInfo?.user.profilePic}
                  className="h-14 w-14 rounded-full overflow-hidden object-cover"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col justify-start gap-0">
                <p className="text-sm font-normal">Creator</p>
                <p className="text-lg font-semibold">
                  {/* {remixInfo?.owner.slice(0, 6)}...
                    {remixInfo?.owner.slice(-4)} */}
                  {postInfo?.user.name}{" "}
                  <span className="text-xs">
                    {`(${
                      postInfo?.owner.slice(0, 6) +
                      "..." +
                      postInfo?.owner.slice(-4)
                    })`}
                  </span>
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
                {remixes &&
                  remixes.map(
                    ({item, user}: any, index: Key | null | undefined) => (
                      <div
                        className="h-[70px] w-full border border-black rounded-md flex-shrink-0 flex items-center justify-around"
                        key={index}
                      >
                        <Avatar>
                          <AvatarImage
                            src={user?.profilePic}
                            className="h-10 w-10 rounded-full overflow-hidden object-cover"
                          />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-bold">
                            {
                              // @ts-ignore
                              user?.name
                            }
                          </p>
                          <p className="text-sm">
                            {item.owner.slice(0, 6)}...{item?.owner.slice(-4)}
                          </p>
                        </div>
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
                    )
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
