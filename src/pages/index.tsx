import Image from "next/image";
import localFont from "next/font/local";
import {ModeToggle} from "@/components/ui/Toggletheme";
import {useSession} from "next-auth/react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/router";
import Navbar from "@/components/Navbar";

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
  return (
    <div
      className={`h-screen w-full bg-white text-black dark:bg-black dark:text-white ${geistSans.className}`}
    >
      <Navbar />
      <div className="w-full h-[92%]">hello</div>
    </div>
  );
}
