import Navbar from "@/components/Navbar";
import {listenNowAlbums} from "@/lib/data";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import localFont from "next/font/local";

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
export default function Profile() {
  return (
    <div
      className={`lg:h-screen min-h-screen w-full bg-white text-black dark:bg-black dark:text-white`}
    >
      <Navbar />
      <div
        className="w-full flex flex-col lg:flex-row p-5 gap-7 bg-white text-black dark:bg-black dark:text-white"
        style={{
          height: "calc(100vh - 70px)",
        }}
      >
        <div className="h-full lg:w-1/3 w-full">
          <div className="border-2 rounded-lg border-slate-800 h-full w-full overflow-hidden flex flex-col justify-start">
            <img
              src="/taylor.png"
              alt="taylor"
              className="w-full h-2/3 object-cover"
            />
            <div className="h-1/3 w-full flex flex-col justify-start mt-4 px-5">
              <p className="font-normal text-gray-800 text-3xl font-poppins">
                Taylor Swift
              </p>
              <p className="font-normal text-gray-800 font-poppins">
                321 followers
              </p>
            </div>
          </div>
        </div>
        <div className="h-full lg:w-2/3 w-full">
          <div className="h-[5%]">
            <p className="font-semibold">Remixes by Users</p>
          </div>
          <div
            className="bg-pink-50 h-[95%] w-full grid grid-cols-2 gap-3 p-5 rounded-2xl"
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(300px, 1fr)`,
            }}
          >
            {listenNowAlbums.map((album, index) => (
              <div className="overflow-hidden rounded-md flex flex-col gap-2">
                <div className="overflow-hidden rounded-md h-full lg:h-[90%] w-full">
                  <img
                    src={album.cover}
                    alt={album.name}
                    className={
                      "object-cover transition-all hover:scale-105 aspect-[3/4] object-center"
                    }
                  />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <div className="flex items-center text-sm">
                    <p>By &nbsp;</p>
                    <Avatar>
                      <AvatarImage
                        src="/boy.png"
                        className="h-5 w-5 rounded-full"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="">Jaydeep Dey</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
