import { InMemorySigner } from "@taquito/signer";
import { TezosToolkit } from "@taquito/taquito";
import { NFTClaimerAddressForTezosGhostnet } from "../../src/addresses/NFTClaimerAddressForTezosGhostnet";
import {
  convert_key,
  convert_nat,
  convert_string,
  convert_address,
  convert_chain_id,
  convert_mint,
} from "../utils/convert";
import {
  NEXERAID_SIGNER_PK,
  NEXERAID_SIGNER_SK,
  DEPLOYER_SK,
  USER_1_PKH,
} from "../tests/testAddresses";

const createKeccakHash = require("keccak");
const RPC_ENDPOINT = "https://rpc.ghostnet.teztnets.com/"; // "https://oxfordnet.ecadinfra.com"; //

function keccak256(data: string) {
  return createKeccakHash("keccak256").update(data, "hex").digest("hex");
}

function compute_payload_hash_for_mint(
  chain_id: string,
  userAddress: string,
  functioncall_contract: string,
  functioncall_name: string, // "%mint-offchain"
  functioncall_params_owner: string, // mint arg 1
  functioncall_params_token_id: string, // mint arg 2
  nonce: string,
  expiration: string,
  dataKey: string
) {
  const chain_id_bytes = convert_chain_id(chain_id);
  const user_bytes = convert_address(userAddress);
  const functioncall_contract_bytes = convert_address(functioncall_contract);
  const functioncall_name_bytes = convert_string(functioncall_name);
  const functioncall_params_bytes = convert_mint(
    functioncall_params_owner,
    functioncall_params_token_id
  );
  const nonce_bytes = convert_nat(nonce);
  const expiration_bytes = convert_nat(expiration);
  const key_bytes = convert_key(dataKey);
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
    signer: await InMemorySigner.fromSecretKey(DEPLOYER_SK),
  });
  // const senderAddress = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";

  const signerNexera = new InMemorySigner(NEXERAID_SIGNER_SK); // bob private key

  try {
    console.log("Attempt mint #4 in ghostnet");
    // INPUTS
    const functioncall_contract = NFTClaimerAddressForTezosGhostnet; //"KT1AoU1mrLRSM2zouUVkvLz2UHo1on4UAFBF";
    const functioncall_name = "%mint_gated";
    const functioncall_params = {
      owner: USER_1_PKH,
      token_id: "10",
    };
    const dataKey = NEXERAID_SIGNER_PK;
    const expiration = "7100000";
    const nonce = "1";
    const userAddress = USER_1_PKH;
    const chain_id = "NetXnHfVqm9iesp";

    // Prepare arguments
    const functioncall_params_bytes = convert_mint(
      functioncall_params.owner,
      functioncall_params.token_id
    );
    const payload_hash = compute_payload_hash_for_mint(
      chain_id,
      userAddress,
      functioncall_contract,
      functioncall_name,
      functioncall_params.owner,
      functioncall_params.token_id,
      nonce,
      expiration,
      dataKey
    );
    // Bob signs Hash of payload
    let signature_full = await signerNexera.sign(payload_hash);
    let signature = signature_full.prefixSig;

    // CALL contract
    const args = {
      // payload: payload_hash,
      // chain_id: chain_id,
      userAddress: userAddress,
      // nonce: nonce,
      expirationBlock: expiration,
      contractAddress: functioncall_contract,
      // functionName: functioncall_name,
      functionArgs: functioncall_params_bytes,
      signerPublicKey: dataKey,
      signature: signature,
    };
    const cntr = await Tezos.contract.at(NFTClaimerAddressForTezosGhostnet);
    const op = await cntr.methodsObject.mint_gated(args).send();
    console.log(
      `Waiting for Exec_gated_calldata on ${NFTClaimerAddressForTezosGhostnet} to be confirmed...`
    );
    await op.confirmation(2);
    console.log("tx confirmed: ", op.hash);
  } catch (error: any) {
    console.log(error);
  }
}

main();
