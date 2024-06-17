import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { saveContractAddress } from "../utils/helper";
import nftMinterContract from "../../compiled/extended_gated_nftminter.json";

const RPC_ENDPOINT = "http://localhost:20000/";

export async function deployNFTMinterExt() {
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
  for (let i = 0; i < 10; i++) {
    const token_info_i = new MichelsonMap();
    token_info_i.set("name", char2Bytes("Token " + i.toString()));
    token_info_i.set("description", char2Bytes("asset #" + i.toString()));
    token_metadata.set(i, { token_id: i, token_info: token_info_i });
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
    "source":{"tools":["Ligo"], "location":"https://github.com/frankhillard/"},
    "interfaces":["TZIP-012"],
    "errors":[],
    "views":[]
  
  }`)
  );

  const operators = new MichelsonMap();

  const fa2Extension = {
    minter: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", // alice
  };

  const initialFA2Storage = {
    extension: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", //fa2Extension,
    ledger,
    metadata,
    token_metadata,
    operators,
  };

  const initialStorage = {
    admin: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", // alice
    signerAddress: "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6", // bob
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
    // await saveContractAddress("nftminter", originated?.contractAddress ?? "error");
    return originated.contractAddress;
  } catch (error: any) {
    console.log(error);
  }
}
