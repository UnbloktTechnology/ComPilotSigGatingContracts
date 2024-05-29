import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { saveContractAddress } from "./helper";
import nftMinterContract from "../compiled/nftminter.json";
import nftMinterAddress from "../deployments/nftminter";

const RPC_ENDPOINT = "https://ghostnet.ecadinfra.com";

async function main() {
  const Tezos = new TezosToolkit(RPC_ENDPOINT);

  //set alice key
  Tezos.setProvider({
    signer: await InMemorySigner.fromSecretKey(
      "edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU"
    ),
  });
  // related address
  // const signerAddress = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";

  
  try {
    const args = {};
    const cntr = await Tezos.contract.at(nftMinterAddress);
    const op = await cntr.methodsObject.mint_offchain(args).send();
    console.log(
      `Waiting for Mint_offchain on ${nftMinterAddress} to be confirmed...`
    );
    await op.confirmation(2);
    console.log("confirmed mint: ", op.hash);
  } catch (error: any) {
    console.log(error);
  }
}

main();