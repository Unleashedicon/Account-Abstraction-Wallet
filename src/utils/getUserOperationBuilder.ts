import { AbiCoder } from "ethers";
import { UserOperationBuilder } from "userop";
import { provider } from "./getContracts";
export async function getUserOperationBuilder(
  walletContract: string,
  nonce: any,
  initCode: Uint8Array,
  encodedCallData: string,
  signatures: string[]
) {
  try {
    const abiCoder = AbiCoder.defaultAbiCoder();

    // Encode our signatures into a bytes array
    const encodedSignatures = abiCoder.encode(["bytes[]"], [signatures]);
    const bigintValue = BigInt("18446744073709551616");

    // Convert BigInt to hexadecimal string
    const hexString = "0x" + bigintValue.toString(16);
    console.log(hexString);
    // Use the UserOperationBuilder class to create a new builder
    // Supply the builder with all the necessary details to create a userOp
    const builder = new UserOperationBuilder()
      .useDefaults({
        preVerificationGas: 100_000,
        callGasLimit: 100_000,
        verificationGasLimit: 2_000_000,
      })
      .setSender(walletContract)
      .setNonce(hexString)
      .setCallData(encodedCallData)
      .setSignature(encodedSignatures)
      .setInitCode(initCode);
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      if (gasPrice) {
        builder.setMaxFeePerGas(gasPrice *  BigInt(2)); // Adjust multiplier as needed
        builder.setMaxPriorityFeePerGas(gasPrice);
      } else {
        throw new Error("Failed to retrieve gas price from provider");
      }
      console.log('is it here 444');
      console.log( gasPrice,
        builder.setMaxFeePerGas(gasPrice *  BigInt(2))// Adjust multiplier as needed
        ,
        builder.setMaxPriorityFeePerGas(gasPrice)
        ,);

    return builder;
  } catch (e) {
    console.error(e);
    throw e;
  }
}