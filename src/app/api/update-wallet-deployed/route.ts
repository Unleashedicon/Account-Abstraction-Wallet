// Import necessary libraries
import { prisma } from "../../../utils/db";
import { NextRequest, NextResponse } from "next/server";

// Define an asynchronous POST function
export async function POST(req: NextRequest) {
  try {
    // Destructure walletId, transactionId, and txHash from the request
    const { walletId } = await req.json();

    // Update the wallet's isDeployed status to true
    const res = await prisma.wallet.update({
      where: {
        id: walletId,
      },
      data: {
        isDeployed: true,
      },
    });


    // Return the updated transaction
    return NextResponse.json(res);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error });
  }
}