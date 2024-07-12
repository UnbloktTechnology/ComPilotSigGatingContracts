import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { saveContractAddress } from "../utils/helper";
import nftMinterContract from "../../compiled/nftminter.json";
import nftMinterAddress from "../../deployments/nftminter";
import {
  convert_timestamp,
  convert_key,
  convert_nat,
  convert_string,
  convert_address,
  convert_mint,
} from "../utils/convert";

const createKeccakHash = require("keccak");
const RPC_ENDPOINT = "http://localhost:8732/"; // "https://oxfordnet.ecadinfra.com"; //

function keccak256(data: string) {
  return createKeccakHash("keccak256").update(data, "hex").digest("hex");
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

  try {
    // Get contract storage
    console.log("display storage of ", nftMinterAddress);
    const cntr = await Tezos.contract.at(nftMinterAddress);
    const storage: any = await cntr.storage();
    const nonce = await storage.nonces.get(
      "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF"
    );
    console.log("nonce (for tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF)=", nonce);
    // const ownerAsset1 = await storage["ledger"].get(1);
    const ownerAsset0 = await storage.siggated_extension.ledger.get(0);
    const ownerAsset1 = await storage.siggated_extension.ledger.get(1);
    const ownerAsset2 = await storage.siggated_extension.ledger.get(2);
    const ownerAsset3 = await storage.siggated_extension.ledger.get(3);
    console.log("ownerAsset0=", ownerAsset0);
    console.log("ownerAsset1=", ownerAsset1);
    console.log("ownerAsset2=", ownerAsset2);

    // const expected = "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";
    // if (ownerAsset1 != expected) {
    //   throw `Unexpected owner1 in storage, expected ${expected}, got ${ownerAsset1.toString()}`;
    //   // throw `Unexpected owner1 in storage, expected ${storage.simple.toNumber()}, got ${ownerAsset1.toNumber()}`;
    // }
  } catch (error: any) {
    console.log(error);
  }
}

main();
