import { Web3, DEFAULT_RETURN_FORMAT, ContractAbi } from "web3";
import { SwisstronikPlugin } from "@swisstronik/web3-plugin-swisstronik";
import {
  Address,
  EvmPrivateKey,
  TxAuthData,
  TxAuthInput,
  WalletClientExtended,
} from "./schemas";
import { getSignatureValidityBlockDuration } from "./getSignatureValidityDuration";
import { Abi, encodeFunctionData, encodePacked, keccak256 } from "viem";

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

export async function signTxAuthDataWeb3(
  txAuthData: TxAuthData,
  web3: Web3,
  walletAddress: string
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
  const signature = await web3.eth.personal.sign(
    web3.utils.utf8ToHex(messageHash),
    walletAddress,
    ""
  );
  return signature;
}
export const getNonce = async (
  contractAddress: Address,
  userAddress: Address,
  abi: ContractAbi,
  web3: Web3
) => {
  // instantiate contract to get nonce
  const contract = new web3.eth.Contract(abi, contractAddress);

  return Number(await contract.methods.getNonce(userAddress).call());
};
export const signTxAuthDataSwisstronik = async (
  privateKey: EvmPrivateKey,
  txAuthInput: TxAuthInput
) => {
  // Connect to swisstronik testnet
  const web3 = new Web3("https://json-rpc.testnet.swisstronik.com/"); // Any RPC node you wanted to connect with
  web3.registerPlugin(new SwisstronikPlugin());
  let wallet = web3.eth.accounts.wallet.add(privateKey); // Private Key

  // Build Signature

  // Get chainId
  const chainID = Number(await web3.eth.getChainId());

  // Get Block Expiration
  const blockExpiration =
    txAuthInput.blockExpiration ??
    Number(await web3.eth.getBlockNumber()) +
      getSignatureValidityBlockDuration(chainID);

  // Get Nonce (better provide the nonce for local testing)
  const nonce =
    txAuthInput.nonce ??
    (await getNonce(
      txAuthInput.contractAddress,
      txAuthInput.userAddress,
      txAuthInput.contractAbi as unknown as ContractAbi,
      web3
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
    signature: await signTxAuthDataWeb3(txAuthData, web3, wallet[0].address),
    blockExpiration,
  };
};
