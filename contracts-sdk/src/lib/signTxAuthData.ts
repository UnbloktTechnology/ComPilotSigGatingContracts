import { encodeFunctionData, encodePacked, getContract, keccak256 } from "viem";
import type { Abi } from "viem";
import {
  Address,
  TxAuthData,
  TxAuthInput,
  WalletClientExtended,
} from "./schemas";

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
export const getNonce = async (
  contractAddress: Address,
  userAddress: Address,
  abi: Abi,
  client: WalletClientExtended
) => {
  // instantiate contract to get nonce
  const contract = getContract({
    address: contractAddress,
    abi: abi,
    publicClient: client,
  });
  return Number(await contract.read.getUserNonce([userAddress]));
};
export const signTxAuthDataLib = async (
  txAuthWalletClient: WalletClientExtended,
  txAuthInput: TxAuthInput
) => {
  // Build Signature

  // Get Block Expiration
  const blockExpiration =
    txAuthInput.blockExpiration ??
    Number((await txAuthWalletClient.getBlock({ blockTag: "latest" })).number) +
      SIGNATURE_VALIDITY_DURATION;

  // Get chainId
  const chainID =
    txAuthInput.chainID ?? (await txAuthWalletClient.getChainId());

  // Get Nonce (better provide the nonce for local testing)
  const nonce =
    txAuthInput.nonce ??
    (await getNonce(
      txAuthInput.contractAddress,
      txAuthInput.userAddress,
      txAuthInput.contractAbi as unknown as Abi,
      txAuthWalletClient
    ));

  // encode function data with a fake value for the signature
  const functionCallData = generateFunctionCallDataViem(
    txAuthInput.contractAbi as unknown as Abi,
    txAuthInput.functionName,
    [...txAuthInput.args, blockExpiration, "0x1234"]
  );

  // remove 64 bytes (32 bytes for the length and 32 bytes for the fake signature itself)
  // = 128 characters
  const argsWithSelector = functionCallData.slice(0, -128) as `0x${string}`;

  const txAuthData = {
    functionCallData: argsWithSelector,
    contractAddress: txAuthInput.contractAddress,
    userAddress: txAuthInput.userAddress,
    chainID,
    nonce,
    blockExpiration,
  };

  return {
    signature: await signTxAuthDataViem(txAuthData, txAuthWalletClient),
    blockExpiration,
  };
};
