import {
  encodeFunctionData,
  encodePacked,
  getContract,
  keccak256,
  numberToHex,
} from "viem";
import type { Abi } from "viem";
import { TxAuthData, TxAuthInput, WalletClientExtended } from "./schemas";

const SIGNATURE_VALIDITY_DURATION = 50;

// Generating functionCallData with viem
export function generateFunctionCallDataViem(
  contractAbi: Abi,
  functionName: string,
  args: unknown[]
) {
  const functionCallData = encodeFunctionData({
    abi: contractAbi,
    functionName,
    args,
  });
  return functionCallData;
}

export async function signTxAuthDataViem(
  txAuthData: TxAuthData,
  walletClient: WalletClientExtended
) {
  const messageHash = keccak256(
    encodePacked(
      ["uint256", "uint256", "uint256", "address", "address", "bytes"],
      [
        BigInt(txAuthData.chainID),
        BigInt(txAuthData.nonce),
        BigInt(txAuthData.blockExpiration),
        txAuthData.contractAddress,
        txAuthData.userAddress,
        txAuthData.functionCallData,
      ]
    )
  );
  if (!walletClient.account?.address) {
    throw new Error("txAuth wallet doesn't have an account");
  }
  const signature = await walletClient.signMessage({
    message: { raw: messageHash },
  });
  return signature;
}

export const signTxAuthDataLib = async (
  txAuthWalletClient: WalletClientExtended,
  txAuthInput: TxAuthInput & { blockExpiration?: number }
) => {
  // Build Signature
  const blockExpiration =
    txAuthInput.blockExpiration ||
    Number((await txAuthWalletClient.getBlock({ blockTag: "latest" })).number) +
      SIGNATURE_VALIDITY_DURATION;
  console.log(
    "expected blockExpiration",
    blockExpiration,
    numberToHex(blockExpiration)
  );
  const chainID = await txAuthWalletClient.getChainId();
  // encode function data with a fake value for the signature
  const functionCallData = generateFunctionCallDataViem(
    txAuthInput.contractAbi as Abi,
    txAuthInput.functionName,
    [...txAuthInput.args, blockExpiration, "0x1234"]
  );
  console.log("functionCallData", functionCallData);
  // remove 64 bytes (32 bytes for the length and 32 bytes for the fake signature itself)
  // = 128 characters
  const argsWithSelector = functionCallData.slice(0, -128) as `0x${string}`;

  // instantiate contract to get nonce
  const contract = getContract({
    address: txAuthInput.contractAddress,
    abi: txAuthInput.contractAbi as Abi,
    publicClient: txAuthWalletClient,
  });

  const txAuthData = {
    functionCallData: argsWithSelector,
    contractAddress: txAuthInput.contractAddress,
    userAddress: txAuthInput.userAddress,
    chainID,
    nonce: Number(await contract.read.getUserNonce([txAuthInput.userAddress])),
    blockExpiration,
  };

  return {
    signature: await signTxAuthDataViem(txAuthData, txAuthWalletClient),
    blockExpiration,
  };
};
