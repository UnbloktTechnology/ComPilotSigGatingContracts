import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import {
  saveContractAddress,
  saveContractAddressGhostnet,
} from "../utils/helper";
import nftMinterContract from "../../compiled/gatedNftClaimer.json";
import {
  NEXERAID_SIGNER_PKH,
  DEPLOYER_SK,
  DEPLOYER_PKH,
} from "../tests/testAddresses";

const RPC_ENDPOINT = "https://ghostnet.ecadinfra.com"; // "https://oxfordnet.ecadinfra.com"; "https://localhost:8732/"

async function main() {
  const Tezos = new TezosToolkit(RPC_ENDPOINT);

  //set alice key
  Tezos.setProvider({
    signer: await InMemorySigner.fromSecretKey(DEPLOYER_SK),
  });
  // related address
  // const signerAddress = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";
  const ledger = new MichelsonMap();
  ledger.set(0, DEPLOYER_PKH);

  const tokenMetadata = new MichelsonMap();
  for (let i = 0; i < 200; i++) {
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
    minter: DEPLOYER_PKH, // alice
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
    admin: DEPLOYER_PKH, // alice
    signerAddress: NEXERAID_SIGNER_PKH,
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
    await saveContractAddressGhostnet(
      "nftminter",
      originated?.contractAddress ?? "error"
    );
  } catch (error: any) {
    console.log(error);
  }
}

main();
