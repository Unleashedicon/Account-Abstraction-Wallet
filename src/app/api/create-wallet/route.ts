import { prisma } from "../../../utils/db";
import { walletFactoryContract, provider } from "../../../utils/getContracts";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

interface PostRequestBody {
  signers: string[];
  walletAddress: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body to get the list of signers
    const { signers, walletAddress }: PostRequestBody = await req.json();
    console.log("signers :", signers);
    const array = ["0xb74512701B8143fCBbBbd5474a14B789773b8c93"];
    // Convert the array to string with square brackets and each element enclosed in double quotes
    const formattedArray: any = `[${array.map((item) => `"${item}"`).join(', ')}]`;
    const code = await provider.getCode("0x94cd9a00a52b2b9a86f745c3a0111df96de65897");
    console.log("COde", );
    console.log(formattedArray);
    console.log("Signers: ", signers);

    // Generate a random salt, convert it to hexadecimal, and prepend "0x"
    const salt = "0x" + randomBytes(32).toString("hex");
    console.log("salt :", salt);

    // Call the getAddress function from the wallet factory contract with the signers and salt
    // This computes the counterfactual address for the wallet without deploying it



    // Use Prisma client to create a new wallet in the database with the signers, salt, address, and isDeployed set to false
    const response = await prisma.wallet.create({
      data: {
        salt: salt,
        signers: signers.map((s) => s.toLowerCase()), // Convert all signer addresses to lowercase for consistency
        isDeployed: false,
        address: walletAddress,
      },
    });

    // Return the created wallet as a JSON response
    return NextResponse.json(response);
  } catch (error: any) {
    // Log any errors and return them as a JSON response
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: error.message || "Error processing request" });
  }
}
