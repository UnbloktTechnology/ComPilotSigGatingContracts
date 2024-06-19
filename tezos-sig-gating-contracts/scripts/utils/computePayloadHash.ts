import {
  convert_timestamp,
  convert_key,
  convert_nat,
  convert_string,
  convert_address,
  convert_chain_id,
  convert_mint,
} from "./convert";
import { EdSignature, TezosTxAuthData, TezosTxCalldata } from "./schemas";

const createKeccakHash = require("keccak");

function keccak256(data: string) {
  return createKeccakHash("keccak256").update(data, "hex").digest("hex");
}

export function computePayloadHash(payload: TezosTxAuthData) {
  const nonce_string = payload.nonce.toString();
  const expiration_string = payload.blockExpiration.toString();

  const chain_id_bytes = convert_chain_id(payload.chainID);
  const user_bytes = convert_address(payload.userAddress);
  const functioncall_contract_bytes = convert_address(payload.contractAddress);
  const functioncall_name_bytes = convert_string(payload.functionCallName);
  const functionCallArgsBytes = payload.functionCallArgs;
  const nonce_bytes = convert_nat(nonce_string);
  const expiration_bytes = convert_nat(expiration_string);
  const key_bytes = convert_key(payload.signerPublicKey);
  const payload_bytes =
    key_bytes +
    chain_id_bytes +
    user_bytes +
    nonce_bytes +
    expiration_bytes +
    functioncall_contract_bytes +
    functioncall_name_bytes +
    functionCallArgsBytes;
  const payload_hash = keccak256(payload_bytes);
  return payload_hash;
}
