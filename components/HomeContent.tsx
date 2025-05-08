"use client";

import AirDropForm from "@/components/AirdropForm";
import { useAccount } from "wagmi";

const HomeContent = () => {
  const { isConnected } = useAccount();
  return (
    <div>
      {isConnected ? (
        <div className="">
          <AirDropForm />
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[50vh] text-lg text-gray-600">
          Please connect a wallet
        </div>
      )}
    </div>
  );
};

export default HomeContent;
