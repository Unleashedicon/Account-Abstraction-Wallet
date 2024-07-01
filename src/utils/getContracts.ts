const { ethers } = require('ethers');
const { Contract } = require('ethers');
import {
  ENTRY_POINT_ABI,
  WALLET_ABI,
  WALLET_FACTORY_ABI,
  WALLET_FACTORY_ADDRESS,
  ENTRYPOINT_ADDRESS
} from "./constants";

const network = "sepolia"
const etherscanApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
if (!etherscanApiKey) {
  throw new Error('NEXT_PUBLIC_ETHERSCAN_API_KEY is not set in the environment variables');
}

export const provider = new ethers.AlchemyProvider(network, etherscanApiKey);

console.log(provider);


export const walletFactoryContract = new Contract(
  WALLET_FACTORY_ADDRESS,
  WALLET_FACTORY_ABI,
  provider
);
export const entryPointContract = new Contract(
  ENTRYPOINT_ADDRESS,
  ENTRY_POINT_ABI,
  provider
);
export const getWalletContract = (walletAddress: string) => {
  console.log("This is the wallet: ", walletAddress);
  return new Contract(walletAddress, WALLET_ABI, provider);
};