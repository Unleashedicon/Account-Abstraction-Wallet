import { rpcUrl, BUNDLER_RPC_URL, WALLET_FACTORY_ADDRESS } from "./constants";
import {
  getWalletContract,
  provider,
  walletFactoryContract,
  entryPointContract
} from "./getContracts";
import { getUserOperationBuilder } from "./getUserOperationBuilder";
import { Client, Presets } from "userop";

export async function getUserOpForETHTransfer(
  walletAddress: string,
  owners: string[],
  salt: string,
  toAddress: string,
  value: any,
  isDeployed?: boolean
) {
  try {
    console.log("Wallet Address:", walletAddress);

    let initCode = Uint8Array.from([]);
    if (!isDeployed) {
      // Encode the function data for creating a new account
     console.log("Almost there");
      const data = walletFactoryContract.interface.encodeFunctionData(
        "createAccount",
        [owners, salt]
      );
console.log("Wallet factory: ", await walletFactoryContract.getAddress());
console.log("Data: ", data);
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
console.log('Nonce:', nonce);
console.log("Value",  Value);
    // Get the wallet contract instance
    const walletContract = getWalletContract(walletAddress);
    // Encode the call data for the execute method
    console.log("Wallet contract", walletContract)
    const encodedCallData = walletContract.interface.encodeFunctionData(
      "execute",
      [toAddress, value, initCode]
    );
    console.log('Init code: ', initCode);
    console.log(encodedCallData);
    console.log("Wallet contract address:", await walletContract.getAddress());
    // Get the user operation builder with the necessary parameters
    const builder = await getUserOperationBuilder(
      await walletContract.getAddress(),
      Value,
      initCode,
      encodedCallData,
      []
    );

console.log('is it here');
    const client = await Client.init(BUNDLER_RPC_URL);
    console.log('is it here too');
   
    await client.buildUserOperation(builder);
    console.log('is it here 2');

    const userOp = builder.getOp();
    console.log('is it here 3');
    console.log(userOp)
    return userOp;
  } catch (e) {
    console.error(e);
    if (e instanceof Error) 
      window.alert(e.message);
    }{
  }
}