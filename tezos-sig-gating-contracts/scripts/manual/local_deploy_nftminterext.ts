import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { saveContractAddress } from "../utils/helper";
// import nftMinterContract from "../../compiled/nftminter.json";

import nftMinterContract from "../../compiled/extended_gated_nftminter.json";

const RPC_ENDPOINT = "http://localhost:20000/"; 

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

  const token_metadata = new MichelsonMap();
  const token_info_0 = new MichelsonMap();
  token_info_0.set("name", char2Bytes("Token 0"));
  token_info_0.set("description", char2Bytes("asset #0"));
  const token_info_1 = new MichelsonMap();
  token_info_1.set("name", char2Bytes("Token 1"));
  token_info_1.set("description", char2Bytes("asset #1"));
  const token_info_2 = new MichelsonMap();
  token_info_2.set("name", char2Bytes("Token 2"));
  token_info_2.set("description", char2Bytes("asset #2"));

  token_metadata.set(0, { token_id: 0, token_info: token_info_0 });
  token_metadata.set(1, { token_id: 1, token_info: token_info_1 });
  token_metadata.set(2, { token_id: 2, token_info: token_info_2 });
  
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

  // const extension = {
  //   admin : "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", // alice
  //   signerAddress : "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6", // bob
  //   nonces : new MichelsonMap(),
  // }

  // const initialStorage = {
  //   extension,
  //   ledger,
  //   metadata,
  //   token_metadata,
  //   operators,
  // };



  const fa2Extension = {
    minter : "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", // alice
  }

  const initialFA2Storage = {
    extension: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", //fa2Extension,
    ledger,
    metadata,
    token_metadata,
    operators,
  };

  const initialStorage = {
    admin : "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", // alice
    signerAddress : "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6", // bob
    nonces : new MichelsonMap(),
    siggated_extension: initialFA2Storage,
  };

  try {
    console.log("Attempt to deploy in localhost");
    const chainID = await Tezos.rpc.getChainId();
    console.log("chainID=", chainID);

    console.log("Tezos.signer.publicKey=", await Tezos.signer.publicKey());
    
    const constants = await Tezos.rpc.getConstants();
    console.log("constants=", constants);

    const originated = await Tezos.contract.originate({
      code: nftMinterContract,
      storage: initialStorage,
    });
    console.log(
      `Waiting for nftMinterContract ${originated.contractAddress} to be confirmed...`
    );
    await originated.confirmation(2);
    console.log("confirmed contract: ", originated.contractAddress);
    await saveContractAddress("nftminter", originated?.contractAddress ?? "error");
  } catch (error: any) {
    console.log(error);
  }
}

main();