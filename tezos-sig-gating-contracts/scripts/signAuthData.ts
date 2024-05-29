import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { verifySignature, stringToBytes } from "@taquito/utils";
import { Parser, packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';

import { convert_timestamp, convert_key, convert_nat, convert_string, convert_address, convert_mint } from './convert';

const createKeccakHash = require('keccak')
// import verifierContract from "../compiled/TxAuthDataVerifier.json";

const RPC_ENDPOINT = "https://ghostnet.tezos.marigold.dev";

// function convert_key() {
//   const data = `"edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat"`;
//   const type = `key`;
//   // We first use the `Parser` class and its `parseMichelineExpression` method to transform the Michelson data and type into their JSON representation
//   const p = new Parser();
//   const dataJSON = p.parseMichelineExpression(data);
//   const typeJSON = p.parseMichelineExpression(type);

//   const dd = MichelsonData();
//   const packed = packDataBytes(
//   dataJSON, // as MichelsonData
//   typeJSON // as MichelsonType
//   );
//     return packed.bytes;
// }
function keccak256(data : string) {
  return createKeccakHash('keccak256').update(data, 'hex').digest('hex')
}


// function convert_timestamp(tt : string) {
//   const data: MichelsonData = {
//       string: tt
//   };
//   const typ: MichelsonType = {
//       prim: "timestamp"
//   };
//   const packed = packDataBytes(data, typ);
//   return packed.bytes;
// }

// function convert_key(key_str : string) {
//   const data: MichelsonData = {
//       string: key_str
//   };
//   const typ: MichelsonType = {
//       prim: "key"
//   };
//   const packed = packDataBytes(data, typ);
//   return packed.bytes;
// }

// function convert_nat(nat_str : string) {
//   const data: MichelsonData = {
//       int: nat_str
//   };
//   const typ: MichelsonType = {
//       prim: "nat"
//   };
//   const packed = packDataBytes(data, typ);
//   return packed.bytes;
// }

// function convert_string(str : string) {
//   const data: MichelsonData = {
//       string: str
//   };
//   const typ: MichelsonType = {
//       prim: "string"
//   };
//   const packed = packDataBytes(data, typ);
//   return packed.bytes;
// }

// function convert_address(addr_str : string) {
//   const data: MichelsonData = {
//       string: addr_str
//   };
//   const typ: MichelsonType = {
//       prim: "address"
//   };
//   const packed = packDataBytes(data, typ);
//   return packed.bytes;
// }


async function main() {
    const Tezos = new TezosToolkit(RPC_ENDPOINT);
    const signer = new InMemorySigner("edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU");
    const signerAddress = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";

    // INPUTS
    const functioncall_contract = "KT1AoU1mrLRSM2zouUVkvLz2UHo1on4UAFBF"; //"KT1PNgGEt3cnT9zvPnUWimX3KiAkFrX9wioE";
    const functioncall_name = "%mint_offchain";
    // const functioncall_params_bytes = "0507070a000000160000dd3a6a5b3d553afe28e786454bc813b3ba38a0dc0307"; // "0507070a0000001600004c8408407ebb2be65120a765cd2cbf341b9860a70006";
    const functioncall_params = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      token_id: "2"
    };
    const dataKey = "edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat";
    const exp_date = "2025-01-01T00:00:00.00Z";
    const nonce = "0";
    

    // display public key
    const signerPublicKey = await signer.publicKey();
    console.log("signerPublicKey=", signerPublicKey);

    // display payload
    const functioncall_contract_bytes = convert_address(functioncall_contract);
    const functioncall_name_bytes = convert_string(functioncall_name);
    const functioncall_params_bytes = convert_mint(functioncall_params.owner, functioncall_params.token_id);
    console.log("functioncall_name_bytes=", functioncall_name_bytes);
    const nonce_bytes = convert_nat(nonce);
    console.log("nonce_bytes=", nonce_bytes);
    const exp_date_bytes = convert_timestamp(exp_date);
    console.log("exp_date_bytes=", exp_date_bytes);
    const key_bytes = convert_key(dataKey);
    const payload = key_bytes + nonce_bytes + exp_date_bytes + functioncall_contract_bytes + functioncall_name_bytes + functioncall_params_bytes;
    console.log("payload=", payload);
    const payload_hash = keccak256(payload);
    console.log("payload_hash=", payload_hash);
    

    // SIGN
    let signature = await signer.sign(payload_hash);
    console.log("sig=", signature);
    const isVerified = verifySignature(
      payload_hash,
        signerPublicKey,
        // (await wallet.client.getActiveAccount()).publicKey,
        signature.sig
      );
    console.log("isVerified", isVerified);
}

main();
