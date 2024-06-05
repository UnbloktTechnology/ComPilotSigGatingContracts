import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { saveContractAddress } from "../utils/helper";
import nftMinterContract from "../../compiled/nftminter.json";
import nftMinterAddress from "../../deployments/nftminter";
import { convert_timestamp, convert_key, convert_nat, convert_string, convert_address, convert_chain_id, convert_mint } from '../utils/convert';

const createKeccakHash = require('keccak')
const RPC_ENDPOINT = "https://ghostnet.ecadinfra.com";// "https://oxfordnet.ecadinfra.com"; //

function keccak256(data : string) {
  return createKeccakHash('keccak256').update(data, 'hex').digest('hex')
}

function compute_payload_hash_for_mint  (
  chain_id: string,
  userAddress: string, 
  functioncall_contract: string,          
  functioncall_name: string,              // "%mint-offchain"
  functioncall_params_owner: string,      // mint arg 1
  functioncall_params_token_id: string,   // mint arg 2
  nonce: string,
  expiration: string,
  dataKey: string
) {
  const chain_id_bytes = convert_chain_id(chain_id);
  const user_bytes = convert_address(userAddress);
  const functioncall_contract_bytes = convert_address(functioncall_contract);
  const functioncall_name_bytes = convert_string(functioncall_name);
  const functioncall_params_bytes = convert_mint(functioncall_params_owner, functioncall_params_token_id);
  const nonce_bytes = convert_nat(nonce);
  const expiration_bytes = convert_nat(expiration);
  const key_bytes = convert_key(dataKey);
  const payload = key_bytes + chain_id_bytes + user_bytes + nonce_bytes + expiration_bytes + functioncall_contract_bytes + functioncall_name_bytes + functioncall_params_bytes;
  const payload_hash = keccak256(payload);
  // console.log("user_bytes=", user_bytes);
  // console.log("functioncall_name_bytes=", functioncall_name_bytes);
  // console.log("functioncall_params_bytes=", functioncall_params_bytes);
  // console.log("nonce_bytes=", nonce_bytes);
  // console.log("exp_date_bytes=", exp_date_bytes);
  // console.log("payload=", payload);
  // console.log("payload_hash=", payload_hash);
  return payload_hash;
}


async function main() {
  const Tezos = new TezosToolkit(RPC_ENDPOINT);

  //set signer
  Tezos.setProvider({
    signer: await InMemorySigner.fromSecretKey(
      "edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU"
    ),
  });
  // const senderAddress = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";

  const signerBob = new InMemorySigner("edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU"); // bob private key
  // const signerAddress = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";

  try {
    // INPUTS
    const functioncall_contract = "KT1Ko4fwVmzNfZe3pSYFjhPYQj6GUTU3dAPa"; //"KT1AoU1mrLRSM2zouUVkvLz2UHo1on4UAFBF";
    const functioncall_name = "%mint_offchain";
    const functioncall_params = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      token_id: "1"
    };
    const dataKey = "edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat";
    const expiration = "12345";
    const nonce = "0";
    const userAddress = "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";
    const chain_id = "NetXnHfVqm9iesp";

    // const signature = "edsigtwJeK1MQFudmBWiqLHFdD844gMr6nN1aX3ute1oVZf7wLGeYQq6JeubDkAy4UEXv4kef1EQwwnnsbV77oArqVh9pNY794b";
    // Prepare arguments
    const functioncall_params_bytes = convert_mint(functioncall_params.owner, functioncall_params.token_id);
    const payload_hash = compute_payload_hash_for_mint(
        chain_id,
        userAddress,
        functioncall_contract,
        functioncall_name,
        functioncall_params.owner,
        functioncall_params.token_id,
        nonce,
        expiration,
        dataKey);
    // Bob signs Hash of payload
    let signature_full = await signerBob.sign(payload_hash);
    let signature = signature_full.prefixSig; 


    // CALL contract
    const args = {
      payload: payload_hash, 
      chain_id: chain_id,
      userAddress: userAddress, 
      nonce: nonce, 
      expiration: expiration, 
      contractAddress: functioncall_contract, 
      name: functioncall_name, 
      args: functioncall_params_bytes, 
      publicKey: dataKey, 
      signature: signature
    };
    const cntr = await Tezos.contract.at(nftMinterAddress);
    const op = await cntr.methodsObject.exec_offchain_calldata(args).send();
    console.log(
      `Waiting for Exec_offchain_calldata on ${nftMinterAddress} to be confirmed...`
    );
    await op.confirmation(2);
    console.log("tx confirmed: ", op.hash);
  } catch (error: any) {
    console.log(error);
  }
}

main();
