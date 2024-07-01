"use client";
import Button from "../../components/button";
import TransactionsList from "../../components/transactionList";
import { getUserOpForETHTransfer } from "../../utils/getUserOpForETHTransfer";
import getUserOpHash from "../../utils/getUserOpHash";
import { parseEther } from "ethers";
import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import {
  IHybridPaymaster,
  SponsorUserOperationDto,
  PaymasterMode,
  IPaymaster,
  BiconomyPaymaster
} from "@biconomy/paymaster";
import { createSmartAccountClient, LightSigner } from "@biconomy/account";
import { ethers } from "ethers";
import { ChainId } from "@biconomy/core-types";
import {
  getWalletContract,
  walletFactoryContract,
  entryPointContract
} from "../../utils/getContracts";
import { WALLET_FACTORY_ADDRESS, ENTRYPOINT_ADDRESS } from "../../utils/constants";
import {useWallets} from '@privy-io/react-auth';

export default function WalletPage({
  params: { walletAddress },
}: {
  params: { walletAddress: string };
}) {
  const { address: userAddress } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [signerr, setSigner] = useState<any | null>(
    null,
  );
  const {wallets} = useWallets();
  const [prov, setprov] = useState<any | null>(
    null,
  );
  const [deposit, setDeposit] = useState<string>("0");

  useEffect(() => {
    console.log("Wallet Address:", walletAddress); // Log wallet address

    // Fetch deposit using getDeposit function
    const fetchDeposit = async () => {
      try {
        const walletContract = await getWalletContract(walletAddress);
        const deposit = await walletContract.getDeposit();
        setDeposit(deposit.toString());
        console.log(deposit);
      } catch (error) {
        console.error("Failed to fetch deposit:", error);
      }
    };

    if (walletAddress) {
      fetchDeposit();
    }
  }, [walletAddress]);



  const fetchUserOp = async () => {
    try {
      console.log(walletAddress);
      const response = await fetch(
        `/api/fetch-wallet?walletAddress=${walletAddress}`
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const amountBigInt = parseEther(amount.toString());
      const userOp = await getUserOpForETHTransfer(
        walletAddress,
        data.signers,
        data.salt,
        toAddress,
        amountBigInt,
        data.isDeployed
      );

      if (!userOp) throw new Error("Could not get user operation");

      return userOp;
    } catch (e: any) {
      window.alert(e.message);
      throw new Error(e.message);
    }
  };
  const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl: "https://paymaster.biconomy.io/api/v1/11155111/jfRRUNzlO.c1adbfad-25db-4c73-9f59-0c7906a345b0"
  })
  async function connection () {
    const wallet = wallets[0]; // Replace this with your desired wallet
    await wallet.switchChain(11155111);
    console.log(wallet);
   
    const network = "sepolia"
    const provider = await wallet.getEthersProvider();
    const signer = new ethers.JsonRpcSigner(provider as any, userAddress as string)  

    setSigner(signer)
    console.log("Signerd: ", signer);
    console.log(userAddress as string);
    setprov(provider);
  }
  const create = async () => {
    try{
      setLoading(true);
      await connection();

      const response = await fetch(
        `/api/fetch-wallet?walletAddress=${walletAddress}`
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const amountBigInt = parseEther(amount.toString());
      let initCode = Uint8Array.from([]);
      if (!data.isDeployed) {
        // Encode the function data for creating a new account
       console.log("Almost there");
       console.log("Signers:", data.signers);
        console.log("Salt:", data.salt);
        const sign = signerr.address

        console.log("Signer address: ", sign);
        const datac = walletFactoryContract.interface.encodeFunctionData(
          "createAccount",
          [sign, data.salt]
        );
  console.log("Wallet factory: ", await walletFactoryContract.getAddress());
  console.log("Data: ", datac);
        // Initialize the initCode which will be used to deploy a new wallet
        const concatenatedString = WALLET_FACTORY_ADDRESS + data;
        initCode = new TextEncoder().encode(concatenatedString);
        }
  
      // Get the nonce for the wallet address with a key of 0
      const nonce: any = await entryPointContract.getNonce(
        walletAddress,
        1
      );
      const Value: any = BigInt(nonce);
      const walletContract = await getWalletContract(walletAddress);
      console.log("Wallet contract", walletContract)
      console.log("Wallet contract address:", await walletContract.getAddress());

      const encodedCallData = walletContract.interface.encodeFunctionData(
        "execute",
        [toAddress, amountBigInt, initCode]
      );
    console.log(encodedCallData);
    const tx1 = {
      to: walletAddress,
      data: encodedCallData,
    };

    // Establish connection

    // Ensure signerr is defined
    if (!signerr) {
      throw new Error("Failed to get signer. Please try again.");
    }

    // Create Smart Account
    const smartAccount = await createSmartAccountClient({
      signer: signerr as LightSigner,
      chainId: ChainId.SEPOLIA,
      bundlerUrl: "https://bundler.biconomy.io/api/v2/11155111/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
      paymaster: paymaster,
    });

    // Ensure SmartAccount is defined
    if (!smartAccount) {
      throw new Error("Failed to create Smart Account. Please try again.");
    }

    let userOp = await smartAccount.buildUserOp([tx1]);
    console.log({ userOp });
    const userOpResponse = await smartAccount.sendTransaction(tx1, {
      paymasterServiceData: {mode: PaymasterMode.SPONSORED},
    });
    
    const {transactionHash} = await userOpResponse.waitForTxHash();
    console.log('Transaction Hash', transactionHash);
    const timeoutDuration = 120000;
    const useropReceipt = prov.getTransactionReceipt(transactionHash);
      console.log('UserOp receipt', useropReceipt);
    if (!walletClient) throw new Error("Could not get wallet client");

    const signature = await walletClient.signMessage({
      message: { raw: transactionHash as `0x${string}` },
    });
    const responsed = await fetch("/api/create-transaction", {
      method: "POST",
      body: JSON.stringify({
        walletAddress,
        txHash: transactionHash,
        userOp,
        signature,
        signerAddress: userAddress,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const datad = await responsed.json();
    if (datad.error) throw new Error(datad.error);

    window.alert(
      "Transaction created and signed! Please ask other owners to sign to finally execute the transaction"
    );
    window.location.reload();
    }catch (err) {
      if (err instanceof Error) window.alert(err.message);
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col py-6 items-center gap-5">
      <h1 className="text-5xl font-bold">Manage Wallet</h1>
      <h3 className="text-xl font-medium border-b border-gray-700">
        {walletAddress}
      </h3>
      <p className="text-lg font-bold">Balance: {deposit} Eth </p>

      <p className="text-lg font-bold">Send ETH</p>

      <input
        className="rounded-lg p-2 text-slate-700"
        placeholder="0x0"
        onChange={(e) => setToAddress(e.target.value)}
      />
      <input
        className="rounded-lg p-2 text-slate-700"
        type="number"
        placeholder="1"
        onChange={(e) => {
          if (e.target.value === "") {
            setAmount(0);
            return;
          }
          setAmount(parseFloat(e.target.value));
        }}
      />

      <Button isLoading={loading} onClick={create}>
        Create Txn
      </Button>

      {userAddress && (
        <TransactionsList address={userAddress} walletAddress={walletAddress} />
      )}
    </div>
  );
}