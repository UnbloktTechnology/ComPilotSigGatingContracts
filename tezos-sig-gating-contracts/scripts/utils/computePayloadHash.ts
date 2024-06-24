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
  const nonceString = payload.nonce.toString();
  const expirationString = payload.blockExpiration.toString();

  const chainIdBytes = convert_chain_id(payload.chainID);
  const userBytes = convert_address(payload.userAddress);
  const functioncallContractBytes = convert_address(payload.contractAddress);
  const functioncallNameBytes = convert_string(payload.functionCallName);
  const functionCallArgsBytes = payload.functionCallArgs;
  const nonceBytes = convert_nat(nonceString);
  const expirationBytes = convert_nat(expirationString);
  const key_bytes = convert_key(payload.signerPublicKey);
  const payload_bytes =
    key_bytes +
    chainIdBytes +
    userBytes +
    nonceBytes +
    expirationBytes +
    functioncallContractBytes +
    functioncallNameBytes +
    functionCallArgsBytes;
  const payloadHash = keccak256(payload_bytes);
  return payloadHash;
}
