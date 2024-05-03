import { encodeFunctionData, encodePacked, getContract, keccak256 } from "viem";
import type { Abi } from "viem";
import {
  Address,
  TxAuthData,
  TxAuthInput,
  WalletClientExtended,
} from "./schemas";
import { getSignatureValidityBlockDuration } from "./getSignatureValidityDuration";

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
    client: { public: client },
  });
  return Number(await contract.read.txAuthDataUserNonce([userAddress]));
};
export const signTxAuthDataLib = async (
  txAuthWalletClient: WalletClientExtended,
  txAuthInput: TxAuthInput
) => {
  // Build Signature

  // Get chainId
  const chainID =
    txAuthInput.chainID ?? (await txAuthWalletClient.getChainId());

  // Get Block Expiration
  const blockExpiration =
    txAuthInput.blockExpiration ??
    Number((await txAuthWalletClient.getBlock({ blockTag: "latest" })).number) +
      getSignatureValidityBlockDuration(chainID);

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
    [...txAuthInput.args]
  );

  const txAuthData = {
    functionCallData: functionCallData as `0x${string}`,
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
