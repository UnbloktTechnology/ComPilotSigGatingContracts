import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { saveContractAddress } from "../utils/helper";
import nftMinterContract from "../../compiled/nftminter.json";

export async function deployNFTMinter(provider: TezosToolkit) {
  const senderAddress = await provider.signer.publicKeyHash();

  const ledger = new MichelsonMap();
  ledger.set(0, senderAddress);  // the deployer of the contract get the token 0 ! 

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
  const token_info_3 = new MichelsonMap();
  token_info_3.set("name", char2Bytes("Token 3"));
  token_info_3.set("description", char2Bytes("asset #3"));
  const token_info_4 = new MichelsonMap();
  token_info_4.set("name", char2Bytes("Token 4"));
  token_info_4.set("description", char2Bytes("asset #4"));
  const token_info_5 = new MichelsonMap();
  token_info_5.set("name", char2Bytes("Token 5"));
  token_info_5.set("description", char2Bytes("asset #5"));
  const token_info_6 = new MichelsonMap();
  token_info_6.set("name", char2Bytes("Token 6"));
  token_info_6.set("description", char2Bytes("asset #6"));
  const token_info_7 = new MichelsonMap();
  token_info_7.set("name", char2Bytes("Token 7"));
  token_info_7.set("description", char2Bytes("asset #7"));

  token_metadata.set(0, { token_id: 0, token_info: token_info_0 });
  token_metadata.set(1, { token_id: 1, token_info: token_info_1 });
  token_metadata.set(2, { token_id: 2, token_info: token_info_2 });
  token_metadata.set(3, { token_id: 3, token_info: token_info_3 });
  token_metadata.set(4, { token_id: 4, token_info: token_info_4 });
  token_metadata.set(5, { token_id: 5, token_info: token_info_5 });
  token_metadata.set(6, { token_id: 6, token_info: token_info_6 });
  token_metadata.set(7, { token_id: 7, token_info: token_info_7 });

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

  const extension = {
    admin: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", // alice
    signerAddress: "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6", // bob
    nonces: new MichelsonMap(),
  };

  const initialStorage = {
    extension,
    ledger,
    metadata,
    token_metadata,
    operators,
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
    // await saveContractAddress("nftminter", originated?.contractAddress ?? "error");
    return originated.contractAddress;
  } catch (error: any) {
    console.log(error);
  }
}
