"use client";
import { isAddress } from "ethers";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import Icon from "./icon";
import Button from "./button";
import { createSmartAccountClient } from "@biconomy/account";
import { ethers } from "ethers";
import { ChainId } from "@biconomy/core-types";
import { IPaymaster, BiconomyPaymaster } from "@biconomy/paymaster";
import { provider } from "../utils/getContracts";
import { ENTRYPOINT_ADDRESS } from "../utils/constants";
require("dotenv").config();

export default function CreateSCW() {
  const { address } = useAccount();
  const router = useRouter();

  const [signers, setSigners] = useState<string[]>([]);
  const lastInput = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [Walletaddress, setWalletaddress] = useState<string>("");
  const [smartAccount, setSmartAccount] = useState<any | null>(
    null,
  );
  const [signerr, setSigner] = useState<any | null>(
    null,
  );
  useEffect(() => {
    setSigners([address as string]);
  }, [address]);

  useEffect(() => {
    if (lastInput.current) {
      lastInput.current.focus();
    }
  }, [signers]);

  function addNewSigner() {
    setSigners((signers) => [...signers, ""]);
  }

  function removeSigner(index: number) {
    if (signers[index] === undefined) return;
    if (signers[index].length > 0) return;
    if (signers.length <= 1) return;

    const newSigners = [...signers];
    newSigners.splice(index, 1);
    setSigners(newSigners);
  }

  const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl: "https://paymaster.biconomy.io/api/v1/11155111/jfRRUNzlO.c1adbfad-25db-4c73-9f59-0c7906a345b0"
  })
  async function connection () {
    const etherscanApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    if (!etherscanApiKey) {
      throw new Error('NEXT_PUBLIC_ETHERSCAN_API_KEY is not set in the environment variables');
    }
    const network = "sepolia"
    const provider = new ethers.AlchemyProvider(network, etherscanApiKey);
    const signer = new ethers.JsonRpcSigner(provider, address as string)  

    setSigner(signer)
    console.log(etherscanApiKey)
    console.log("Signerd: ", signer);
    console.log(address as string);

  }

  const onCreateSCW = async () => {
    try {
      setLoading(true);
  
      // Validate signers
      signers.forEach((signer) => {
        if (!isAddress(signer)) {
          throw new Error(`Invalid address: ${signer}`);
        }
      });
  
      // Establish connection
      await connection();
  
      // Ensure signerr is defined
      if (!signerr) {
        throw new Error("Failed to get signer. Please try again.");
      }
  
      // Create Smart Account
      const SmartAccount = await createSmartAccountClient({
        signer: signerr,
        chainId: ChainId.SEPOLIA,
        bundlerUrl: "https://bundler.biconomy.io/api/v2/11155111/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
        paymaster: paymaster,
        rpcUrl: process.env.SEPOLIA_RPC_URL,
        entryPointAddress: ENTRYPOINT_ADDRESS,
      });
  
      // Ensure SmartAccount is defined
      if (!SmartAccount) {
        throw new Error("Failed to create Smart Account. Please try again.");
      }
  
      const smartAccountAddress = await SmartAccount.getAccountAddress();
      setWalletaddress(smartAccountAddress);
      setSmartAccount(SmartAccount);
  
      // Create wallet on the server
      const response = await fetch("/api/create-wallet", {
        method: "POST",
        body: JSON.stringify({ signers, walletAddress: smartAccountAddress }),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
  
      window.alert(`Wallet created: ${data.address}`);
      router.push(`/`);
  
      // Refresh the page after wallet creation
      window.location.reload();
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        window.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };
    return (
    <main className="flex flex-col gap-6 max-w-sm w-full">
      {signers.map((signer, index) => (
        <div key={signer} className="flex items-center gap-4">
          <input
            type="text"
            className="rounded-lg p-2 w-full text-slate-700"
            placeholder="0x000"
            value={signer}
            ref={index === signers.length - 1 ? lastInput : null}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                addNewSigner();
              } else if (event.key === "Backspace") {
                removeSigner(index);
              }
            }}
            onChange={(event) => {
              const newSigners = [...signers];
              newSigners[index] = event.target.value;
              setSigners(newSigners);
            }}
          />

          {index > 0 && (
            <div
              className="hover:scale-105 cursor-pointer"
              onClick={() => removeSigner(index)}
            >
              <Icon type="xmark" />
            </div>
          )}
        </div>
      ))}
      {loading ? (
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-l-white items-center justify-center mx-auto" />
      ) : (
        <div className="flex items-center justify-between">
          <Button onClick={addNewSigner}>Add New Signer</Button>
          <Button onClick={onCreateSCW}>Create New Wallet</Button>
        </div>
      )}
    </main>
  );
}