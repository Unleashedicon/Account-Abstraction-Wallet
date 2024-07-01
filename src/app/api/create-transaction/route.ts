import { prisma } from "../../../utils/db";
import { isAddress } from "ethers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, userOp, signerAddress, signature, txHash } =
      await req.json();
console.log(walletAddress);
    // Validate if the provided walletAddress is a valid Ethereum address
    if (!isAddress(walletAddress)) throw new Error("Invalid walletAddress");

    const wallet = await prisma.wallet.findUnique({
      where: {
        address: walletAddress,
      },
    });

    if (!wallet) {
      throw new Error(`Wallet with address ${walletAddress} does not exist`);
    }
    // Use prisma to create a new transaction with the provided parameters
    await prisma.transaction.create({
      data: {
        wallet: {
          connect: {
            address: walletAddress,
          },
        },
        txHash,
        userOp,
        signatures: {
          create: {
            signature,
            signerAddress: signerAddress.toLowerCase(),
          },
        },
      },
    });
    await prisma.wallet.update({
      where: {
        address: walletAddress,
      },
      data: {
        isDeployed: true,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error });
  }
}