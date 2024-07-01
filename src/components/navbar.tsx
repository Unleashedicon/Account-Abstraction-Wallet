"use client";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Link from "next/link";

export default function Navbar() {
  const { connectWallet } = usePrivy();
  const { wallets } = useWallets();

  return (
    <div>
      <div className="w-full px-6 border-b border-b-gray-700 py-2 flex justify-between items-center">
        <div className="gap-4 flex">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/create-wallet" className="hover:underline">
            Create New Wallet
          </Link>
        </div>

        <div className="flex gap-4">
          <button
            disabled={!wallets[0]}
            onClick={() => wallets[0]?.loginOrLink()}
            className="text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
          >
            Login with wallet
          </button>

          <button
            onClick={connectWallet}
            className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none"
          >
            Connect wallet
          </button>
        </div>
      </div>
    </div>
  );
}
