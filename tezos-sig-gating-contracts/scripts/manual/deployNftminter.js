"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const signer_1 = require("@taquito/signer");
const taquito_1 = require("@taquito/taquito");
const utils_1 = require("@taquito/utils");
const helper_1 = require("../utils/helper");
const gatednftminter_simple_json_1 = __importDefault(require("../../compiled/gatednftminter_simple.json"));
const RPC_ENDPOINT = "https://ghostnet.ecadinfra.com"; // "https://oxfordnet.ecadinfra.com"; "https://localhost:20000/"
async function main() {
    const Tezos = new taquito_1.TezosToolkit(RPC_ENDPOINT);
    //set alice key
    Tezos.setProvider({
        signer: await signer_1.InMemorySigner.fromSecretKey("edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU"),
    });
    // related address
    // const signerAddress = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";
    const ledger = new taquito_1.MichelsonMap();
    ledger.set(0, "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2");
    const tokenMetadata = new taquito_1.MichelsonMap();
    for (let i = 0; i < 20; i++) {
        const tokenInfo = new taquito_1.MichelsonMap();
        tokenInfo.set("name", (0, utils_1.char2Bytes)("Token " + i.toString()));
        tokenInfo.set("description", (0, utils_1.char2Bytes)("asset #" + i.toString()));
        tokenMetadata.set(i, { token_id: i, token_info: tokenInfo });
    }
    const metadata = new taquito_1.MichelsonMap();
    metadata.set("", (0, utils_1.char2Bytes)("tezos-storage:data"));
    metadata.set("data", (0, utils_1.char2Bytes)(`{
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
  
  }`));
    const operators = new taquito_1.MichelsonMap();
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
        signerAddress: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", // alice
        nonces: new taquito_1.MichelsonMap(),
        siggated_extension: initialFA2Storage,
    };
    try {
        const originated = await Tezos.contract.originate({
            code: gatednftminter_simple_json_1.default,
            storage: initialStorage,
        });
        console.log(`Waiting for nftMinterContract ${originated.contractAddress} to be confirmed...`);
        await originated.confirmation(2);
        console.log("confirmed contract: ", originated.contractAddress);
        await (0, helper_1.saveContractAddressGhostnet)("nftminter", originated?.contractAddress ?? "error");
    }
    catch (error) {
        console.log(error);
    }
}
main();
