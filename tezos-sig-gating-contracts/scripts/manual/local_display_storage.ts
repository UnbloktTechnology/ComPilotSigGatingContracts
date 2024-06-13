import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { saveContractAddress } from "../utils/helper";
import nftMinterContract from "../../compiled/nftminter.json";
import nftMinterAddress from "../../deployments/nftminter";
import { convert_timestamp, convert_key, convert_nat, convert_string, convert_address, convert_mint } from '../utils/convert';

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

  try {
    // Get contract storage
    const cntr = await Tezos.contract.at(nftMinterAddress);
    const storage : any = await cntr.storage();
    // console.log("storage=", storage);

    // const asset1_owner = await storage["ledger"].get(1);
    const asset0_owner = await storage.ledger.get(0);
    const asset1_owner = await storage.ledger.get(1);
    const asset2_owner = await storage.ledger.get(2);
    const asset3_owner = await storage.ledger.get(3);
    console.log("asset0_owner=", asset0_owner);
    console.log("asset1_owner=", asset1_owner);
    console.log("asset2_owner=", asset2_owner);
    
    // const expected = "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";
    // if (asset1_owner != expected) {
    //   throw `Unexpected owner1 in storage, expected ${expected}, got ${asset1_owner.toString()}`;
    //   // throw `Unexpected owner1 in storage, expected ${storage.simple.toNumber()}, got ${asset1_owner.toNumber()}`;
    // }

  } catch (error: any) {
    console.log(error);
  }
}

main();
