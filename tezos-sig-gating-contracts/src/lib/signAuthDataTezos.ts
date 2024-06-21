import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { verifySignature, stringToBytes } from "@taquito/utils";
import {
  Parser,
  packDataBytes,
  MichelsonData,
  MichelsonType,
} from "@taquito/michel-codec";
import {
  convert_timestamp,
  convert_key,
  convert_nat,
  convert_string,
  convert_address,
  convert_mint,
} from "./convert";

const createKeccakHash = require("keccak");
// import verifierContract from "../compiled/TxAuthDataVerifier.json";

const RPC_ENDPOINT = "https://ghostnet.tezos.marigold.dev";

function keccak256(data: string) {
  return createKeccakHash("keccak256").update(data, "hex").digest("hex");
}

async function main() {
  const Tezos = new TezosToolkit(RPC_ENDPOINT);
  const signer = new InMemorySigner(
    "edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU"
  );
  const signerAddress = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";

  // INPUTS
  const userAddress = "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF"; //"tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";
  const functioncall_contract = "KT1TRPRBqSR6GsCKc9ozxF7uJuX4gtPFwHxe"; //"KT1HUduHHW7mLAdkefzRuMhEFjdomuDNDskk"; //"KT1AoU1mrLRSM2zouUVkvLz2UHo1on4UAFBF";
  const functioncall_name = "%mint_gated"; //"%mint"; // "%mint_gated";
  const functioncall_params = {
    owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
    token_id: "1",
  };
  const dataKey = "edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat";
  const expiration = "12345";
  const nonce = "0";

  // display public key
  const signerPublicKey = await signer.publicKey();
  console.log("signerPublicKey=", signerPublicKey);

  // display payload
  const user_bytes = convert_address(userAddress);
  const functioncall_contract_bytes = convert_address(functioncall_contract);
  const functioncall_name_bytes = convert_string(functioncall_name);
  const functioncall_params_bytes = convert_mint(
    functioncall_params.owner,
    functioncall_params.token_id
  );
  const nonce_bytes = convert_nat(nonce);
  const expiration_bytes = convert_nat(expiration);
  const key_bytes = convert_key(dataKey);
  const payload =
    key_bytes +
    user_bytes +
    nonce_bytes +
    expiration_bytes +
    functioncall_contract_bytes +
    functioncall_name_bytes +
    functioncall_params_bytes;
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
