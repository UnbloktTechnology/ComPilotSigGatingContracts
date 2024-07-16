import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { Address } from "@nexeraid/nexera-id-sig-gating-contracts-sdk/lib";
import { ethers } from "hardhat";
import { WalletClient, encodePacked, keccak256, toBytes } from "viem";

export interface TxAuthData {
  chainID: number;
  nonce: number;
  blockExpiration: number;
  contractAddress: Address;
  userAddress: Address;
  functionCallData: `0x${string}`;
}
export async function signTxAuthData(
  txAuthData: TxAuthData,
  signer: SignerWithAddress
) {
  const messageHash = ethers.utils.solidityKeccak256(
    ["uint256", "uint256", "uint256", "address", "address", "bytes"],
    [
      txAuthData.chainID,
      txAuthData.nonce,
      txAuthData.blockExpiration,
      txAuthData.contractAddress,
      txAuthData.userAddress,
      txAuthData.functionCallData,
    ]
  );
  const signature = await signer.signMessage(
    ethers.utils.arrayify(messageHash)
  );
  return signature;
}

export async function signTxAuthDataViem(
  txAuthData: TxAuthData,
  walletClient: WalletClient
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
    account: walletClient.account?.address,
    message: { raw: messageHash },
  });
  return signature;
}
