import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { verifySignature, stringToBytes } from "@taquito/utils";
import { Parser, packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';
import { convert_timestamp, convert_key, convert_nat, convert_string, convert_address, convert_chain_id, convert_mint } from '../utils/convert';

const createKeccakHash = require('keccak')
// import verifierContract from "../compiled/TxAuthDataVerifier.json";

const RPC_ENDPOINT = "https://ghostnet.tezos.marigold.dev";

function keccak256(data : string) {
  return createKeccakHash('keccak256').update(data, 'hex').digest('hex')
}

async function main() {
    const Tezos = new TezosToolkit(RPC_ENDPOINT);
    const signer = new InMemorySigner("edsk3RFfvaFaxbHx8BMtEW1rKQcPtDML3LXjNqMNLCzC3wLC1bWbAt"); // bob
    const signerAddress = "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6";

    // INPUTS
    const userAddress = "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF"; //"tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";
    const functioncall_contract = "KT1UgwgtRhh2FYwoc38sPKDsqPkjDRpEoFio"; 
    const functioncall_name = "%mint_offchain"; //"%mint"; // "%mint_offchain";
    const functioncall_params = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      token_id: "1"
    };
    const dataKey = "edpkurPsQ8eUApnLUJ9ZPDvu98E8VNj4KtJa1aZr16Cr5ow5VHKnz4"; // bob public key
    const expiration = "12345";
    const nonce = "0";
    const chain_id = "NetXnofnLBXBoxo";
    
    // display public key
    const signerPublicKey = await signer.publicKey();
    console.log("signerPublicKey=", signerPublicKey);

    // display payload
    const chain_id_bytes = convert_chain_id(chain_id);
    const user_bytes = convert_address(userAddress);
    const functioncall_contract_bytes = convert_address(functioncall_contract);
    const functioncall_name_bytes = convert_string(functioncall_name);
    const functioncall_params_bytes = convert_mint(functioncall_params.owner, functioncall_params.token_id);
    const nonce_bytes = convert_nat(nonce);
    const expiration_bytes = convert_nat(expiration);
    const key_bytes = convert_key(dataKey);
    const payload = key_bytes + chain_id_bytes + user_bytes + nonce_bytes + expiration_bytes + functioncall_contract_bytes + functioncall_name_bytes + functioncall_params_bytes;
    const payload_hash = keccak256(payload);
    console.log("user_bytes=", user_bytes);
    console.log("functioncall_name_bytes=", functioncall_name_bytes);
    console.log("functioncall_params_bytes=", functioncall_params_bytes);
    console.log("nonce_bytes=", nonce_bytes);
    console.log("expiration_bytes=", expiration_bytes);
    console.log("payload=", payload);
    console.log("payload_hash=", payload_hash);
    
    // SIGN
    let signature = await signer.sign(payload_hash);
    console.log("sig=", signature);
    const isVerified = verifySignature(
        payload_hash,
        signerPublicKey,
        signature.sig
      );
    console.log("isVerified", isVerified);
}

main();
