import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { saveContractAddress } from "./helper";
import nftMinterContract from "../compiled/nftminter.json";
import nftMinterAddress from "../deployments/nftminter";
import { convert_timestamp, convert_key, convert_nat, convert_string, convert_address, convert_mint } from './convert';

const createKeccakHash = require('keccak')
const RPC_ENDPOINT = "https://ghostnet.ecadinfra.com";// "https://oxfordnet.ecadinfra.com"; //

function keccak256(data : string) {
  return createKeccakHash('keccak256').update(data, 'hex').digest('hex')
}


async function main() {
  const Tezos = new TezosToolkit(RPC_ENDPOINT);

  //set signer
  Tezos.setProvider({
    signer: await InMemorySigner.fromSecretKey(
      "edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU"
    ),
  });
  // const signerAddress = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";

  try {
    // INPUTS
    const functioncall_contract = "KT1AoU1mrLRSM2zouUVkvLz2UHo1on4UAFBF";
    const functioncall_name = "%mint_offchain";
    const functioncall_params = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      token_id: "2"
    };
    const dataKey = "edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat";
    const exp_date = "2025-01-01T00:00:00.00Z";
    const nonce = "0";
    const signature = "edsigu4biyQyoJUmgCg49Y8d13tY1887xbiXWEWuygizbfZmQncUtAFWRqns5R1eijsXERx7CDcW5zdvCnvE6yMr36PwiGVKCSu";
    const userAddress = "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";

    // Prepare arguments
    const functioncall_contract_bytes = convert_address(functioncall_contract);
    const functioncall_name_bytes = convert_string(functioncall_name);
    const functioncall_params_bytes = convert_mint(functioncall_params.owner, functioncall_params.token_id);
    const nonce_bytes = convert_nat(nonce);
    const exp_date_bytes = convert_timestamp(exp_date);
    const key_bytes = convert_key(dataKey);
    const payload = key_bytes + nonce_bytes + exp_date_bytes + functioncall_contract_bytes + functioncall_name_bytes + functioncall_params_bytes;
    const payload_hash = keccak256(payload);

    const args = {
      msgData: { 
        0: payload_hash, 
        1: nonce, 
        2: exp_date, 
        3: functioncall_contract, 
        4: functioncall_name, 
        5: functioncall_params_bytes, 
        6: dataKey, 
        7: signature
      },
      userAddress: userAddress
    };
    // CALL contract
    const cntr = await Tezos.contract.at(nftMinterAddress);
    const op = await cntr.methodsObject.exec_offchain(args).send();
    // const tx = await cntr.methodsObject.exec_offchain(args).toTransferParams(); //({gasLimit:5000});
    // const est = await Tezos.estimate.transfer(tx);
    console.log(
      `Waiting for Exec_offchain on ${nftMinterAddress} to be confirmed...`
    );
    await op.confirmation(2);
    console.log("tx confirmed: ", op.hash);
  } catch (error: any) {
    console.log(error);
  }
}

main();