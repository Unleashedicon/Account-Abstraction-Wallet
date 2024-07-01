// Import necessary modules from ethers and userop
import { AbiCoder, keccak256 } from "ethers";
import { Constants, IUserOperation } from "userop";
import { sepolia } from "wagmi/chains";

// Define an asynchronous function to get the user operation hash
export default async function getUserOpHash(userOp: IUserOperation) {
  // Encode all the userOp parameters except for the signatures
  const abiCoder = AbiCoder.defaultAbiCoder();
  console.log('Is it here');
  const encodedUserOp = abiCoder.encode(
    [
      "address",
      "bytes32",
      "bytes32",
    ],
    [
      userOp.sender,
      keccak256(abiCoder.encode(["bytes"], [userOp.callData])),
      keccak256(abiCoder.encode(["bytes"], [userOp.paymasterAndData])),    ]
  );
  console.log("Almost done")
  // Encode the keccak256 hash with the address of the entry point contract and chainID
  const encodedUserOpWithChainIdAndEntryPoint = abiCoder.encode(
    ["bytes32", "address", "uint256"],
    [keccak256(encodedUserOp), Constants.ERC4337.EntryPoint, sepolia.id]
  );

  // Return the keccak256 hash of the whole thing encoded
  return keccak256(encodedUserOpWithChainIdAndEntryPoint);
}