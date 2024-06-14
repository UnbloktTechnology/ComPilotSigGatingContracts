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
const createKeccakHash = require("keccak");

function keccak256(data: string) {
  return createKeccakHash("keccak256").update(data, "hex").digest("hex");
}

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
  const user_nonce = await storage.nonces.get(userAddress);
  return String(user_nonce);
};

export const getBlockLevel = async (provider: TezosToolkit) => {
  const block = await provider.rpc.getBlockHeader();
  return Number(block.level);
};

export const computePayloadHashFromTezosTxAuthData = async (
  tezosTxAuthData: TezosTxAuthData
) => {
  const chain_id_bytes = convert_chain_id(tezosTxAuthData.chainID);
  const user_bytes = convert_address(tezosTxAuthData.userAddress);
  const nonce_bytes = convert_nat(tezosTxAuthData.nonce);
  const expiration_bytes = convert_nat(tezosTxAuthData.blockExpiration);
  const functioncall_contract_bytes = convert_address(
    tezosTxAuthData.contractAddress
  );
  const functioncall_name_bytes = convert_string(
    tezosTxAuthData.functionCallName
  );
  const functioncall_params_bytes = tezosTxAuthData.functionCallArgs; //convert_mint(functioncall_params.owner, functioncall_params.token_id);
  const key_bytes = convert_key(tezosTxAuthData.publicKey);
  const payload =
    key_bytes +
    chain_id_bytes +
    user_bytes +
    nonce_bytes +
    expiration_bytes +
    functioncall_contract_bytes +
    functioncall_name_bytes +
    functioncall_params_bytes;
  const payload_hash = keccak256(payload);
  return payload_hash;
};

export const signTezosTxAuthData = async (
  signer: InMemorySigner,
  tezosTxAuthData: TezosTxAuthData
) => {
  // Compute payload hash
  const payload_hash = await computePayloadHashFromTezosTxAuthData(tezosTxAuthData);
  // SIGN
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
  // console.log("signerPublicKey=", signerPublicKey);

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
  const expiration_num = block_level + 50;  //TODO: replace hardcoded value
  const expiration = expiration_num.toString();

  const txAuthData = {
    chainID: chain_id,
    userAddress: tezosTxAuthInput.userAddress,
    nonce: nonce,
    blockExpiration: expiration,
    contractAddress: tezosTxAuthInput.contractAddress,
    functionCallName: tezosTxAuthInput.functionName,
    functionCallArgs: tezosTxAuthInput.args,
    publicKey: signerPublicKey,
  };
  const signature = await signTezosTxAuthData(signer, txAuthData);

  return {
    signature: signature.prefixSig,
    blockExpiration: expiration_num,
  };
};
