import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { saveContractAddress } from "../utils/helper";
import nftMinterContract from "../../compiled/gatedNftMinterDispatch.json";

export async function deployNFTMinterExt(provider: TezosToolkit) {
  const senderAddress = await provider.signer.publicKeyHash();
  const ledger = new MichelsonMap();
  ledger.set(0, senderAddress); // the deployer of the contract get the token 0 !

  const tokenMetadata = new MichelsonMap();
  for (let i = 0; i < 10; i++) {
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
    token_metadata: tokenMetadata,
    operators,
  };

  const initialStorage = {
    admin: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", // alice
    signerAddress: "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6", // bob
    nonces: new MichelsonMap(),
    siggated_extension: initialFA2Storage,
  };

  try {
    const originated = await provider.contract.originate({
      code: nftMinterContract,
      storage: initialStorage,
    });
    console.log(
      `Waiting for nftMinterContract ${originated.contractAddress} to be confirmed...`
    );
    await originated.confirmation(2);
    console.log("confirmed contract: ", originated.contractAddress);
    return originated.contractAddress;
  } catch (error: any) {
    console.log(error);
  }
}
