"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const signer_1 = require("@taquito/signer");
const taquito_1 = require("@taquito/taquito");
const utils_1 = require("@taquito/utils");
const helper_1 = require("../utils/helper");
const extended_gated_nftminter_json_1 = __importDefault(require("../../compiled/extended_gated_nftminter.json"));
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
    const token_metadata = new taquito_1.MichelsonMap();
    const token_info_0 = new taquito_1.MichelsonMap();
    token_info_0.set("name", (0, utils_1.char2Bytes)("Token 0"));
    token_info_0.set("description", (0, utils_1.char2Bytes)("asset #0"));
    const token_info_1 = new taquito_1.MichelsonMap();
    token_info_1.set("name", (0, utils_1.char2Bytes)("Token 1"));
    token_info_1.set("description", (0, utils_1.char2Bytes)("asset #1"));
    const token_info_2 = new taquito_1.MichelsonMap();
    token_info_2.set("name", (0, utils_1.char2Bytes)("Token 2"));
    token_info_2.set("description", (0, utils_1.char2Bytes)("asset #2"));
    token_metadata.set(0, { token_id: 0, token_info: token_info_0 });
    token_metadata.set(1, { token_id: 1, token_info: token_info_1 });
    token_metadata.set(2, { token_id: 2, token_info: token_info_2 });
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
        minter: "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2", // alice
    };
    const initialFA2Storage = {
        extension: "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2", //fa2Extension,
        ledger,
        metadata,
        token_metadata,
        operators,
    };
    const initialStorage = {
        admin: "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2", // alice
        signerAddress: "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2", // bob
        nonces: new taquito_1.MichelsonMap(),
        siggated_extension: initialFA2Storage,
    };
    try {
        const originated = await Tezos.contract.originate({
            code: extended_gated_nftminter_json_1.default,
            storage: initialStorage,
        });
        console.log(`Waiting for nftMinterContract ${originated.contractAddress} to be confirmed...`);
        await originated.confirmation(2);
        console.log("confirmed contract: ", originated.contractAddress);
        await (0, helper_1.saveContractAddressGhostnet)("nftminterext", originated?.contractAddress ?? "error");
    }
    catch (error) {
        console.log(error);
    }
}
main();
