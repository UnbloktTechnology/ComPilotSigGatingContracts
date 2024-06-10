"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const signer_1 = require("@taquito/signer");
const taquito_1 = require("@taquito/taquito");
const nftminter_1 = __importDefault(require("../../deployments/nftminter"));
const convert_1 = require("../utils/convert");
const createKeccakHash = require('keccak');
const RPC_ENDPOINT = "http://localhost:20000/"; // "https://oxfordnet.ecadinfra.com"; //
function keccak256(data) {
    return createKeccakHash('keccak256').update(data, 'hex').digest('hex');
}
async function main() {
    const Tezos = new taquito_1.TezosToolkit(RPC_ENDPOINT);
    //set signer
    Tezos.setProvider({
        signer: await signer_1.InMemorySigner.fromSecretKey("edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq"),
    });
    // const signerAddress = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
    const signerBob = new signer_1.InMemorySigner("edsk3RFfvaFaxbHx8BMtEW1rKQcPtDML3LXjNqMNLCzC3wLC1bWbAt"); // bob
    const signerBobAddress = "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6";
    try {
        // INPUTS
        const functioncall_contract = "KT1DYtRp4Q2zfVtXLiVp6WJsnsd3oRTMvqKW";
        const functioncall_name = "%mint_gated";
        const functioncall_params = {
            owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
            token_id: "2"
        };
        const dataKey = "edpkurPsQ8eUApnLUJ9ZPDvu98E8VNj4KtJa1aZr16Cr5ow5VHKnz4"; // bob
        const expiration = "12345";
        const nonce = "1";
        // const signature = "edsigtoM2D6MbVz47Ue77peQ1knYXn3nzJKNt7vbensY9F1gWSXkbKJXNdc84e6UbHZ8YMBZNe9uRbkroXNngwTtkPZBCuEyDyE";
        const userAddress = "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";
        const chain_id = "NetXnofnLBXBoxo";
        // Prepare arguments
        const chain_id_bytes = (0, convert_1.convert_chain_id)(chain_id);
        const user_bytes = (0, convert_1.convert_address)(userAddress);
        const functioncall_contract_bytes = (0, convert_1.convert_address)(functioncall_contract);
        const functioncall_name_bytes = (0, convert_1.convert_string)(functioncall_name);
        const functioncall_params_bytes = (0, convert_1.convert_mint)(functioncall_params.owner, functioncall_params.token_id);
        const nonce_bytes = (0, convert_1.convert_nat)(nonce);
        const expiration_bytes = (0, convert_1.convert_nat)(expiration);
        const key_bytes = (0, convert_1.convert_key)(dataKey);
        const payload = key_bytes + chain_id_bytes + user_bytes + nonce_bytes + expiration_bytes + functioncall_contract_bytes + functioncall_name_bytes + functioncall_params_bytes;
        const payload_hash = keccak256(payload);
        let signature_full = await signerBob.sign(payload_hash);
        console.log("sig=", signature_full);
        const signature = signature_full.prefixSig;
        console.log("user_bytes=", user_bytes);
        console.log("functioncall_name_bytes=", functioncall_name_bytes);
        console.log("functioncall_params_bytes=", functioncall_params_bytes);
        console.log("nonce_bytes=", nonce_bytes);
        console.log("expiration_bytes=", expiration_bytes);
        console.log("payload=", payload);
        console.log("payload_hash=", payload_hash);
        const args = {
            payload: payload_hash,
            chain_id: chain_id,
            userAddress: userAddress,
            nonce: nonce,
            expiration: expiration,
            contractAddress: functioncall_contract,
            name: functioncall_name,
            args: functioncall_params_bytes,
            publicKey: dataKey,
            signature: signature
        };
        // CALL contract
        const cntr = await Tezos.contract.at(nftminter_1.default);
        const op = await cntr.methodsObject.exec_gated_calldata(args).send();
        // const tx = await cntr.methodsObject.exec_gated_calldata(args).toTransferParams(); //({gasLimit:5000});
        // const est = await Tezos.estimate.transfer(tx);
        console.log(`Waiting for Exec_gated_calldata on ${nftminter_1.default} to be confirmed...`);
        await op.confirmation(2);
        console.log("tx confirmed: ", op.hash);
    }
    catch (error) {
        console.log(error);
    }
}
main();
