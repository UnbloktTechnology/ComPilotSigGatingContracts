import { ethers } from "hardhat";
import { Abi, encodeFunctionData } from "viem";
import { Address } from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";

// Generating functionCallData with viem
export async function generateFunctionCallDataViem(
  contractAbi: Abi,
  functionName: string,
  args: any[]
) {
  const functionCallData = encodeFunctionData({
    abi: contractAbi,
    functionName,
    args,
  });
  return functionCallData;
}

// Generating functionCallData with ethers
export async function generateFunctionCallData(
  contractAbi: any,
  functionName: string,
  args: any[]
) {
  const contractInterface = new ethers.utils.Interface(contractAbi);
  const functionCallData = contractInterface.encodeFunctionData(
    functionName,
    args
  );
  return functionCallData as `0x${string}`;
}

// generate function data as a concat of functionName and args (for the mint function)
export async function generateMintFunctionData(recipient: Address) {
  const functionDataBytes32 = ethers.utils.formatBytes32String("mintNFTBasic");

  return ethers.utils.solidityPack(
    ["bytes32", "address"],
    [functionDataBytes32, recipient]
  ) as `0x{string}`;
}
