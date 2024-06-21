import { InMemorySigner } from "@taquito/signer";
import { RpcClient } from "@taquito/rpc";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import {
  convert_timestamp,
  convert_key,
  convert_nat,
  convert_string,
  convert_address,
  convert_chain_id,
  convert_mint,
} from "./convert";
import {
  TezosAddress,
  TezosContractAddress,
  TezosTxAuthData,
  TezosTxAuthInput,
} from "./schemas";
import { computePayloadHash } from "./computePayloadHash";

export const getChainID = async (provider: TezosToolkit) => {
  const currentChainId = await provider.rpc.getChainId();
  return String(currentChainId);
};

export const getNonceFromContract = async (
  contractAddress: TezosContractAddress,
  userAddress: TezosAddress,
  provider: TezosToolkit
) => {
  const cntr = await provider.contract.at(contractAddress);
  const storage: any = await cntr.storage();
  const userNonce = await storage.nonces.get(userAddress);
  return userNonce ? Number(userNonce) : Number(0);
};

export const getBlockLevel = async (provider: TezosToolkit) => {
  const block = await provider.rpc.getBlockHeader();
  return Number(block.level);
};

export const signTezosTxAuthData = async (
  signer: InMemorySigner,
  tezosTxAuthData: TezosTxAuthData
) => {
  const payload_hash = await computePayloadHash(tezosTxAuthData);
  let signature = await signer.sign(payload_hash);
  return signature;
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                  signTxAuthDataLibTezos                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// The signTxAuthDataLibTezos function takes a signer and a txAuthInput as parameters.
// It retrieves chainID, nonce from the provider and retrieves public key of the signer from given signer.
// It computes an expiration (current block level + 50).
// It construct a TxAuthData from the TxAuthInput and retrieved previous contextual parameters.
// The TxAuthData is hashed and then signed by the given signer
// The signTxAuthDataLibTezos function return the signature and the expiration
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// USAGE (FOR TESTING GHOSNET)
// const RPC_ENDPOINT = "https://ghostnet.tezos.marigold.dev";
// const Tezos = new TezosToolkit(RPC_ENDPOINT);
// Tezos.setProvider({
//   signer: await InMemorySigner.fromSecretKey(
//   "edsk...."
//   ),
// });
// const signer =  await InMemorySigner.fromSecretKey("edsk....");
// const tezosTxAuthInput = {
//   contractAddress: "KT1...", //ExtendedGatedNFTMinterAddress_tezos_ghostnet_dev,
//   functionName: "%mint_gated",
//   args: convert_mint("tz1...", "1"),
//   userAddress: "tz1...",
// }:
// const {signature, blockExpiration} = await signTxAuthDataLibTezos(signer, tezosTxAuthInput, Tezos);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const signTxAuthDataLibTezos = async (
  signer: InMemorySigner,
  tezosTxAuthInput: TezosTxAuthInput,
  provider: TezosToolkit
) => {
  // Retrieve signer public key
  const signerPublicKey = await signer.publicKey();

  // Retrieve Nonce from contract storage
  const nonce = await getNonceFromContract(
    tezosTxAuthInput.contractAddress,
    tezosTxAuthInput.userAddress,
    provider
  );
  // Retrieve CHAIN_ID from Rpc client
  const chain_id = await getChainID(provider);
  // Retrieve BLOCK LEVEL from Rpc client
  const block_level = await getBlockLevel(provider);
  const expiration_num = block_level + 50; //TODO: replace hardcoded value
  const expiration = expiration_num;

  const txAuthData: TezosTxAuthData = {
    chainID: chain_id,
    userAddress: tezosTxAuthInput.userAddress,
    nonce: nonce,
    blockExpiration: expiration,
    contractAddress: tezosTxAuthInput.contractAddress,
    functionCallName: tezosTxAuthInput.functionName,
    functionCallArgs: tezosTxAuthInput.args,
    signerPublicKey: signerPublicKey,
  };
  const signature = await signTezosTxAuthData(signer, txAuthData);

  return {
    signature: signature.prefixSig,
    blockExpiration: expiration_num,
  };
};
