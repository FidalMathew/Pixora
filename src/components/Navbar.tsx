import {CircleUserRound} from "lucide-react";

export default function Navbar() {
  return (
    <div className="w-full h-[70px] font-poppins font-semibold text-lg border-b flex items-center justify-between px-6">
      <div>Pixora</div>
      <img
        src={"/user.png"}
        alt="user"
        className="h-8 w-8 border rounded-full border-gray-700 cursor-pointer"
      />
    </div>
  );
}
