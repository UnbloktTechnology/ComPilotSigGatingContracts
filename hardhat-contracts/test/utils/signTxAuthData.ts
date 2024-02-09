import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { Address } from "../../lib/schemas";
import { ethers } from "hardhat";

export interface TxAuthData {
  chainID: number;
  nonce: number;
  blockExpiration: number;
  contractAddress: Address;
  userAddress: Address;
  functionCallData: string;
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
