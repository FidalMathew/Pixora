import Image from "next/image";
import localFont from "next/font/local";
import {ModeToggle} from "@/components/ui/Toggletheme";
import {useSession} from "next-auth/react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/router";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {EIP1193Provider, usePrivy, useWallets} from "@privy-io/react-auth";
import {useEffect, useState} from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  PublicClient,
  WalletClient,
} from "viem";

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

export default function Home() {
  const router = useRouter();
  const {ready, authenticated, login} = usePrivy();
  const {wallets} = useWallets();
  useEffect(() => {
    if (authenticated) {
      router.push("/feed");
    }
  }, [authenticated, ready]);

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="hidden bg-muted text-white relative thumbnail justify-center items-center lg:flex">
        {/* <img
          src={
            "https://cdn.prod.website-files.com/66b1e1cb750c24d738b2c64b/66b35f38ea5346a4abeb65d6_Livepeer%20Hub%20(3)%20(1).png"
          }
          alt="Image"
          // width="1920"
          // height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale absolute top-0 left-0 z-0"
        /> */}

        <div className="text-4xl font-semibold z-[100] flex flex-col gap-3">
          <p className="text-5xl">Co-create with AI, vote </p>
          <p>turn designs into exclusive NFTs.</p>
          <div className="flex gap-1 items-center text-4xl">
            <p className="font-bold">using Livepeer AI</p>
            <img src="/livepeer.png" alt="livepeer" className="h-16 w-16" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 bg-white text-black h-screen">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Connect Wallet</h1>
            <p className="text-balance text-muted-foreground">
              Connect your wallet to start
            </p>
          </div>
          <div className="grid gap-4">
            <Button variant="outline" className="w-full" onClick={login}>
              Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
