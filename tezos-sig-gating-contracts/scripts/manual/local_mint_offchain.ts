import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { saveContractAddress } from "../utils/helper";
import nftMinterContract from "../../compiled/nftminter.json";
import nftMinterAddress from "../../deployments/nftminter";
import { convert_timestamp, convert_key, convert_nat, convert_string, convert_address, convert_chain_id, convert_mint } from '../utils/convert';

const createKeccakHash = require('keccak')
const RPC_ENDPOINT = "http://localhost:20000/";// "https://oxfordnet.ecadinfra.com"; //

function keccak256(data : string) {
  return createKeccakHash('keccak256').update(data, 'hex').digest('hex')
}


async function main() {
  const Tezos = new TezosToolkit(RPC_ENDPOINT);

  //set signer
  Tezos.setProvider({
    signer: await InMemorySigner.fromSecretKey(
      "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq"
    ),
  });
  // const signerAddress = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
  const signerBob = new InMemorySigner("edsk3RFfvaFaxbHx8BMtEW1rKQcPtDML3LXjNqMNLCzC3wLC1bWbAt"); // bob
  const signerBobAddress = "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6";

  try {
    // INPUTS
    const functioncall_contract = "KT1DYtRp4Q2zfVtXLiVp6WJsnsd3oRTMvqKW"; 
    const functioncall_name = "%mint_offchain";
    const functioncall_params = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      token_id: "2"
    };
    const dataKey = "edpkurPsQ8eUApnLUJ9ZPDvu98E8VNj4KtJa1aZr16Cr5ow5VHKnz4"; // bob
    const exp_date = "2025-01-01T00:00:00.00Z";
    const nonce = "1";
    // const signature = "edsigtoM2D6MbVz47Ue77peQ1knYXn3nzJKNt7vbensY9F1gWSXkbKJXNdc84e6UbHZ8YMBZNe9uRbkroXNngwTtkPZBCuEyDyE";
    const userAddress = "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";
    const chain_id = "NetXnofnLBXBoxo";

    // Prepare arguments
    const chain_id_bytes = convert_chain_id(chain_id);
    const user_bytes = convert_address(userAddress);
    const functioncall_contract_bytes = convert_address(functioncall_contract);
    const functioncall_name_bytes = convert_string(functioncall_name);
    const functioncall_params_bytes = convert_mint(functioncall_params.owner, functioncall_params.token_id);
    const nonce_bytes = convert_nat(nonce);
    const exp_date_bytes = convert_timestamp(exp_date);
    const key_bytes = convert_key(dataKey);
    const payload = key_bytes + chain_id_bytes + user_bytes + nonce_bytes + exp_date_bytes + functioncall_contract_bytes + functioncall_name_bytes + functioncall_params_bytes;
    const payload_hash = keccak256(payload);
    
    let signature_full = await signerBob.sign(payload_hash);
    console.log("sig=", signature_full);
    const signature = signature_full.prefixSig;

    console.log("user_bytes=", user_bytes);
    console.log("functioncall_name_bytes=", functioncall_name_bytes);
    console.log("functioncall_params_bytes=", functioncall_params_bytes);
    console.log("nonce_bytes=", nonce_bytes);
    console.log("exp_date_bytes=", exp_date_bytes);
    console.log("payload=", payload);
    console.log("payload_hash=", payload_hash);
    const args = {
      payload: payload_hash, 
      chain_id: chain_id,
      userAddress: userAddress, 
      nonce: nonce, 
      expiration: exp_date, 
      contractAddress: functioncall_contract, 
      name: functioncall_name, 
      args: functioncall_params_bytes, 
      publicKey: dataKey, 
      signature: signature
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
