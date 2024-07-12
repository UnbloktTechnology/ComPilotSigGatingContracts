import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import {
  saveContractAddress,
  saveContractAddressGhostnet,
} from "../utils/helper";
import nftMinterContract from "../../compiled/gatedNftClaimer.json";

const RPC_ENDPOINT = "http://localhost:8732/"; //"http://localhost:20000/"; // "https://ghostnet.ecadinfra.com";

async function main() {
  const Tezos = new TezosToolkit(RPC_ENDPOINT);

  //set alice key
  Tezos.setProvider({
    signer: await InMemorySigner.fromSecretKey(
      "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq"
    ),
  });
  // related address
  // const signerAddress = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
  const ledger = new MichelsonMap();
  ledger.set(0, "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb");

  const tokenMetadata = new MichelsonMap();
  for (let i = 0; i < 20; i++) {
    const tokenInfo = new MichelsonMap();
    tokenInfo.set("name", char2Bytes("Token " + i.toString()));
    tokenInfo.set("description", char2Bytes("asset #" + i.toString()));
    tokenMetadata.set(i, { token_id: i, token_info: tokenInfo });
  }

  const metadata = new MichelsonMap();
  metadata.set("", char2Bytes("tezos-storage:data"));
  metadata.set(
    "data",
    char2Bytes(`{
    "name":"NFTMINTER",
    "description":"Example FA2 NFT extended Token implementation with Mint via off-chain signed message",
    "version":"0.1.0",
    "license":{"name":"MIT"},
    "authors":["Frank Hillard<frank.hillard@gmail.com>"],
    "homepage":"",
    "source":{"tools":["Ligo"], "location":"https://github.com/frankhillard/XXX"},
    "interfaces":["TZIP-012"],
    "errors":[],
    "views":[]
  
  }`)
  );

  const operators = new MichelsonMap();

  const fa2Extension = {
    minter: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", // alice
    lastMinted: 0,
  };

  const initialFA2Storage = {
    extension: fa2Extension,
    ledger,
    metadata,
    token_metadata: tokenMetadata,
    operators,
  };

  const initialStorage = {
    admin: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", // alice
    signerAddress: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", // alice
    nonces: new MichelsonMap(),
    siggated_extension: initialFA2Storage,
  };

  try {
    const originated = await Tezos.contract.originate({
      code: nftMinterContract,
      storage: initialStorage,
    });
    console.log(
      `Waiting for nftMinterContract ${originated.contractAddress} to be confirmed...`
    );
    await originated.confirmation(2);
    console.log("confirmed contract: ", originated.contractAddress);
    await saveContractAddress(
      "nftminter",
      originated?.contractAddress ?? "error"
    );
  } catch (error: any) {
    console.log(error);
  }
}

main();
