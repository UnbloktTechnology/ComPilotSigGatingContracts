"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const signer_1 = require("@taquito/signer");
const taquito_1 = require("@taquito/taquito");
const nftminter_1 = __importDefault(require("../../deployments/nftminter"));
const createKeccakHash = require("keccak");
const RPC_ENDPOINT = "http://localhost:20000/"; // "https://oxfordnet.ecadinfra.com"; //
function keccak256(data) {
    return createKeccakHash("keccak256").update(data, "hex").digest("hex");
}
async function main() {
    const Tezos = new taquito_1.TezosToolkit(RPC_ENDPOINT);
    //set signer
    Tezos.setProvider({
        signer: await signer_1.InMemorySigner.fromSecretKey("edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq"),
    });
    // const signerAddress = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
    try {
        // Get contract storage
        const cntr = await Tezos.contract.at(nftminter_1.default);
        const storage = await cntr.storage();
        // console.log("storage=", storage);
        // const ownerAsset1 = await storage["ledger"].get(1);
        const ownerAsset0 = await storage.ledger.get(0);
        const ownerAsset1 = await storage.ledger.get(1);
        const ownerAsset2 = await storage.ledger.get(2);
        const ownerAsset3 = await storage.ledger.get(3);
        console.log("ownerAsset0=", ownerAsset0);
        console.log("ownerAsset1=", ownerAsset1);
        console.log("ownerAsset2=", ownerAsset2);
        // const expected = "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";
        // if (ownerAsset1 != expected) {
        //   throw `Unexpected owner1 in storage, expected ${expected}, got ${ownerAsset1.toString()}`;
        //   // throw `Unexpected owner1 in storage, expected ${storage.simple.toNumber()}, got ${ownerAsset1.toNumber()}`;
        // }
    }
    catch (error) {
        console.log(error);
    }
}
main();
