// components/Header.tsx

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 shadow-md bg-red-300">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">tsender</h1>
        <Link
          href="#" // Replace with your GitHub link
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-black"
        >
          <FaGithub size={24} />
        </Link>
      </div>

      <div>
        <ConnectButton />
      </div>
    </header>
  );
}
