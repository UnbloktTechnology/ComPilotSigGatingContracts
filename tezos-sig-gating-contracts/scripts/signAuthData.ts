import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { verifySignature, stringToBytes } from "@taquito/utils";
import { Parser, packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';

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

function convert_timestamp(tt : string) {
  const data: MichelsonData = {
      string: tt
  };

  const typ: MichelsonType = {
      prim: "timestamp"
  };

  const packed = packDataBytes(data, typ);
  return packed.bytes;
}

function convert_key(key_str : string) {
  const data: MichelsonData = {
      string: key_str
  };

  const typ: MichelsonType = {
      prim: "key"
  };

  const packed = packDataBytes(data, typ);
  return packed.bytes;
}


async function main() {
    const Tezos = new TezosToolkit(RPC_ENDPOINT);
    const signer = new InMemorySigner("edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU");
  
    // INPUTS
    const functioncall = "01020304";
    const dataKey = "edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat";
    const exp_date = "1970-01-01T00:10:00.00Z";
    
    // display public key
    const signerPublicKey = await signer.publicKey();
    console.log("signerPublicKey=", signerPublicKey);

    // display payload
    const exp_date_bytes = convert_timestamp(exp_date);
    const key_bytes = convert_key(dataKey);
    const payload = exp_date_bytes + key_bytes + functioncall;
    console.log("payload=", payload);

    // SIGN
    let signature = await signer.sign(payload);
    console.log("sig=", signature);
    const isVerified = verifySignature(
        payload,
        signerPublicKey,
        // (await wallet.client.getActiveAccount()).publicKey,
        signature.sig
      );
    console.log("isVerified", isVerified);
}

main();
