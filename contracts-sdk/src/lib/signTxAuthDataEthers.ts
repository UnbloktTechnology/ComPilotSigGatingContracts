import { ethers } from "ethers";
import {
  Address,
  TxAuthData,
  TxAuthInput,
  WalletClientExtended,
} from "./schemas";

const SIGNATURE_VALIDITY_DURATION = 50;

// Generating functionCallData with ethers
export function generateFunctionCallDataEthers(
  contractInterface: ethers.utils.Interface,
  functionName: string,
  args: unknown[]
) {
  const functionCallData = contractInterface.encodeFunctionData(
    functionName,
    args
  );
  return functionCallData;
}

export async function signTxAuthDataEthers(
  txAuthData: TxAuthData,
  signer: ethers.Wallet
) {
  const messageHashBytes = ethers.utils.solidityKeccak256(
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
  const messageHash = ethers.utils.arrayify(messageHashBytes);
  const signature = await signer.signMessage(messageHash);
  return signature;
}

export const getNonceEthers = async (
  contractAddress: string,
  userAddress: string,
  contractABI: any[],
  provider: ethers.providers.Provider
) => {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const nonce = await contract.getUserNonce(userAddress);
  return Number(nonce);
};

export const signTxAuthDataLibEthers = async (
  signer: ethers.Wallet,
  txAuthInput: TxAuthInput
) => {
  const provider = signer.provider;
  const blockNumber = await provider.getBlockNumber();
  const blockExpiration =
    txAuthInput.blockExpiration ?? blockNumber + SIGNATURE_VALIDITY_DURATION;
  const chainID = txAuthInput.chainID ?? (await provider.getNetwork()).chainId;
  const nonce =
    txAuthInput.nonce ??
    (await getNonceEthers(
      txAuthInput.contractAddress,
      txAuthInput.userAddress,
      txAuthInput.contractAbi,
      provider
    ));

  const contractInterface = new ethers.utils.Interface(txAuthInput.contractAbi);
  const functionCallData = generateFunctionCallDataEthers(
    contractInterface,
    txAuthInput.functionName,
    [...txAuthInput.args, blockExpiration, "0x1234"]
  );

  // Remove the placeholder for the signature
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
    signature: await signTxAuthDataEthers(txAuthData, signer),
    blockExpiration,
  };
};