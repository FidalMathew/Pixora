import {usePrivy, useWallets} from "@privy-io/react-auth";
import {CircleUserRound, Plus} from "lucide-react";
import {Button} from "./ui/button";
import {useEffect} from "react";
import {useRouter} from "next/router";
import {useGlobalContext} from "@/context/GlobalContext";

export default function Navbar() {
  const {logout, authenticated, user, ready} = usePrivy();
  console.log(user, "user");
  const router = useRouter();
  const {wallets} = useWallets();
  const wallet = wallets[0];

  const {userDetails} = useGlobalContext();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [authenticated, ready]);
  return (
    <div className="w-full h-[70px] font-poppins font-semibold text-lg border-b flex items-center justify-between px-6">
      <div onClick={() => router.push("/feed")} className="cursor-pointer">
        Pixora
      </div>
      <div className="flex items-center gap-3">
        <img
          src={userDetails?.profilePic}
          onClick={() => router.push("/profile")}
          alt="user"
          className="h-8 w-8 border rounded-full border-gray-700 cursor-pointer"
        />
        {/* {router.pathname === "/feed" && (
          <Button onClick={() => router.push("/artistprofile")}>Create</Button>
        )} */}

        {authenticated && (
          <Button
            onClick={logout}
            variant={"outline"}
            className="border-2 border-slate-700"
          >
            Logout
          </Button>
        )}
        {authenticated && (
          <Button
            onClick={() => router.push("/addPost")}
            variant={"outline"}
            className="border-2 border-slate-700"
          >
            Create Post
          </Button>
        )}
      </div>
    </div>
  );
}
