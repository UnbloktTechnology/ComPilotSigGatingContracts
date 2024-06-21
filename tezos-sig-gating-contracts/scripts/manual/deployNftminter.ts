import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { saveContractAddress, saveContractAddressGhostnet } from "../utils/helper";
import nftMinterContract from "../../compiled/nftminter.json";

const RPC_ENDPOINT = "https://ghostnet.ecadinfra.com"; // "https://oxfordnet.ecadinfra.com"; "https://localhost:20000/"

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
  const ledger = new MichelsonMap();
  ledger.set(0, "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2");

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

  const extension = {
    admin: "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2",
    signerAddress: "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2",
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
    const originated = await Tezos.contract.originate({
      code: nftMinterContract,
      storage: initialStorage,
    });
    console.log(
      `Waiting for nftMinterContract ${originated.contractAddress} to be confirmed...`
    );
    await originated.confirmation(2);
    console.log("confirmed contract: ", originated.contractAddress);
    await saveContractAddressGhostnet("nftminter", originated?.contractAddress ?? "error");
  } catch (error: any) {
    console.log(error);
  }
}

main();
