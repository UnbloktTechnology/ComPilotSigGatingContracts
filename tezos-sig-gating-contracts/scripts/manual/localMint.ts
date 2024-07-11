import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { saveContractAddress } from "../utils/helper";
import nftMinterContract from "../../compiled/nftminter.json";
import nftMinterAddress from "../../deployments/nftminter";
import { NFTClaimerAddressForTezosGhostnet } from "../../src/addresses/NFTClaimerAddressForTezosGhostnet";
import {
  convert_timestamp,
  convert_key,
  convert_nat,
  convert_string,
  convert_address,
  convert_chain_id,
  convert_mint,
} from "../utils/convert";

const createKeccakHash = require("keccak");
// const RPC_ENDPOINT = "https://ghostnet.ecadinfra.com"; // "https://oxfordnet.ecadinfra.com"; //
const RPC_ENDPOINT = "http://localhost:20000/"; // "https://oxfordnet.ecadinfra.com"; //

function keccak256(data: string) {
  return createKeccakHash("keccak256").update(data, "hex").digest("hex");
}

function compute_payload_hash_for_mint(
  chain_id: string,
  userAddress: string,
  functioncallContract: string,
  functioncallName: string, // "%mint-offchain"
  functioncallParamsOwner: string, // mint arg 1
  functioncallParamsTokenId: string, // mint arg 2
  nonce: string,
  expiration: string,
  dataKey: string
) {
  const chainIdBytes = convert_chain_id(chain_id);
  const userBytes = convert_address(userAddress);
  const functioncallContractBytes = convert_address(functioncallContract);
  const functioncallNameBytes = convert_string(functioncallName);
  const functioncallParamsBytes = convert_mint(
    functioncallParamsOwner,
    functioncallParamsTokenId
  );
  const nonceBytes = convert_nat(nonce);
  const expirationBytes = convert_nat(expiration);
  const keyBytes = convert_key(dataKey);
  const payload =
    keyBytes +
    chainIdBytes +
    userBytes +
    nonceBytes +
    expirationBytes +
    functioncallContractBytes +
    functioncallNameBytes +
    functioncallParamsBytes;
  const payloadHash = keccak256(payload);
  return payloadHash;
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

  const signerBob = new InMemorySigner(
    "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq"
  ); // bob private key
  // const signerAddress = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";

  try {
    console.log("Attempt mint #1 in sandbox");
    // INPUTS
    const functioncallContract = nftMinterAddress; //"KT1C3T9RuGHTyj9bPJxHhtzq7ZqtA7J2pKEb"; //"KT1AoU1mrLRSM2zouUVkvLz2UHo1on4UAFBF";
    const functioncallName = "%mint_gated";
    const functioncallParams = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      token_id: "1",
    };
    const dataKey = "edpkvGfYw3LyB1UcCahKQk4rF2tvbMUk8GFiTuMjL75uGXrpvKXhjn";
    const expiration = "6915205";
    const nonce = "0";
    const userAddress = "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";
    const chain_id = "NetXnofnLBXBoxo"; //"NetXnHfVqm9iesp";

    // const signature =
    //   "edsigtePm3YRCAgaiBvYu2xsGNazM3TBCQiMK71XW8J9n38cMCfJbDdzs7QyyDa4pb6YLfnXn4AR5y8HjcerUKSpbJw5V7fht1j";

    // Prepare arguments
    const functioncallParamsBytes = convert_mint(
      functioncallParams.owner,
      functioncallParams.token_id
    );
    const payloadHash = compute_payload_hash_for_mint(
      chain_id,
      userAddress,
      functioncallContract,
      functioncallName,
      functioncallParams.owner,
      functioncallParams.token_id,
      nonce,
      expiration,
      dataKey
    );
    // Bob signs Hash of payload
    let signatureFull = await signerBob.sign(payloadHash);
    let signature = signatureFull.prefixSig;

    // CALL contract
    const args = {
      // payload: payload_hash,
      // chain_id: chain_id,
      userAddress: userAddress,
      // nonce: nonce,
      expirationBlock: expiration,
      contractAddress: functioncallContract,
      // functionName: functioncallName,
      functionArgs: functioncallParamsBytes,
      signerPublicKey: dataKey,
      signature: signature,
    };
    const cntr = await Tezos.contract.at(nftMinterAddress);
    const op = await cntr.methodsObject.mint_gated(args).send();
    console.log(
      `Waiting for Mint_gated on ${nftMinterAddress} to be confirmed...`
    );
    await op.confirmation(2);
    console.log("tx confirmed: ", op.hash);
  } catch (error: any) {
    console.log(error);
  }
}

main();
