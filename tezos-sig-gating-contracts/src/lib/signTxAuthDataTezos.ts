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
// import createKeccakHash from "keccak";
const createKeccakHash = require("keccak");

function keccak256(data: string) {
  return createKeccakHash("keccak256").update(data, "hex").digest("hex");
}

export const getChainID = async (client: RpcClient) => {
  const currentChainId = await client.getChainId();
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

export const getBlockLevel = async (client: RpcClient) => {
  const block = await client.getBlockHeader();
  return Number(block.level);
};

export const signTxAuthDataTezos = async (
  signer: InMemorySigner,
  tezosTxAuthData: TezosTxAuthData
) => {
  // Build a TezosTxAuthData from TezosTxAuthInput and retrieved contextual param (nonce, expiration, chainID, public key of the signer)
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
// const client = new RpcClient(RPC_ENDPOINT);
// const Tezos = new TezosToolkit(RPC_ENDPOINT);
// // const senderAddress = "tz1...";
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
// const {signature, blockExpiration} = await signTxAuthDataLibTezos(signer, tezosTxAuthInput);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const signTxAuthDataLibTezos = async (
  signer: InMemorySigner,
  tezosTxAuthInput: TezosTxAuthInput,
  provider: TezosToolkit,
  client: RpcClient
) => {
  // const signer = new InMemorySigner("edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU");
  // const signerAddress = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";
  // INPUTS
  // const userAddress = "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";
  // const functioncall_contract = "KT1TRPRBqSR6GsCKc9ozxF7uJuX4gtPFwHxe";
  // const functioncall_name = "%mint_gated";
  // const functioncall_params = {
  //   owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
  //   token_id: "1"
  // };
  // const dataKey = "edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat";
  // const expiration = "12345";
  // const nonce = "0";
  // const chain_id = "NetXnHfVqm9iesp";

  // display public key
  const signerPublicKey = await signer.publicKey();
  console.log("signerPublicKey=", signerPublicKey);

  // Retrieve Nonce from contract storage
  const nonce = await getNonceFromContract(
    tezosTxAuthInput.contractAddress,
    tezosTxAuthInput.userAddress,
    provider
  );
  // Retrieve CHAIN_ID from Rpc client
  const chain_id = await getChainID(client);
  // Retrieve from Rpc client
  const block_level = await getBlockLevel(client);
  const expiration_num = block_level + 50;
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
  const signature = await signTxAuthDataTezos(signer, txAuthData);

  return {
    signature: signature.prefixSig,
    blockExpiration: expiration_num,
  };
};
