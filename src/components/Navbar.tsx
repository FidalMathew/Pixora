import {usePrivy, useWallets} from "@privy-io/react-auth";
import {CircleUserRound} from "lucide-react";
import {Button} from "./ui/button";
import {useEffect} from "react";
import {useRouter} from "next/router";

export default function Navbar() {
  const {logout, authenticated, user, ready} = usePrivy();
  console.log(user, "user");
  const router = useRouter();
  const {wallets} = useWallets();
  const wallet = wallets[0];

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [authenticated, ready]);
  return (
    <div className="w-full h-[70px] font-poppins font-semibold text-lg border-b flex items-center justify-between px-6">
      <div>Pixora</div>
      <div className="flex items-center gap-3">
        <img
          src={"/user.png"}
          onClick={() => router.push("/artistprofile")}
          alt="user"
          className="h-8 w-8 border rounded-full border-gray-700 cursor-pointer"
        />
        {authenticated && (
          <Button onClick={logout} variant={"outline"}>
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}
