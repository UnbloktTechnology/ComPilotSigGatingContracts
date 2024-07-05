"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signer_1 = require("@taquito/signer");
const taquito_1 = require("@taquito/taquito");
// import nftMinterAddress from "../../deployments/nftminter";
const ExtendedGatedNFTMinter_tezos_ghostnet_dev_1 = require("../../src/addresses/ExtendedGatedNFTMinter_tezos_ghostnet_dev");
const convert_1 = require("../utils/convert");
const createKeccakHash = require("keccak");
const RPC_ENDPOINT = "https://ghostnet.ecadinfra.com"; // "https://oxfordnet.ecadinfra.com"; //
function keccak256(data) {
    return createKeccakHash("keccak256").update(data, "hex").digest("hex");
}
function compute_payload_hash_for_mint(chain_id, userAddress, functioncall_contract, functioncall_name, // "%mint-offchain"
functioncall_params_owner, // mint arg 1
functioncall_params_token_id, // mint arg 2
nonce, expiration, dataKey) {
    const chain_id_bytes = (0, convert_1.convert_chain_id)(chain_id);
    const user_bytes = (0, convert_1.convert_address)(userAddress);
    const functioncall_contract_bytes = (0, convert_1.convert_address)(functioncall_contract);
    const functioncall_name_bytes = (0, convert_1.convert_string)(functioncall_name);
    const functioncall_params_bytes = (0, convert_1.convert_mint)(functioncall_params_owner, functioncall_params_token_id);
    const nonce_bytes = (0, convert_1.convert_nat)(nonce);
    const expiration_bytes = (0, convert_1.convert_nat)(expiration);
    const key_bytes = (0, convert_1.convert_key)(dataKey);
    const payload = key_bytes +
        chain_id_bytes +
        user_bytes +
        nonce_bytes +
        expiration_bytes +
        functioncall_contract_bytes +
        functioncall_name_bytes +
        functioncall_params_bytes;
    const payload_hash = keccak256(payload);
    // console.log("user_bytes=", user_bytes);
    // console.log("functioncall_name_bytes=", functioncall_name_bytes);
    // console.log("functioncall_params_bytes=", functioncall_params_bytes);
    // console.log("nonce_bytes=", nonce_bytes);
    // console.log("exp_date_bytes=", exp_date_bytes);
    // console.log("payload=", payload);
    // console.log("payload_hash=", payload_hash);
    return payload_hash;
}
async function main() {
    const Tezos = new taquito_1.TezosToolkit(RPC_ENDPOINT);
    //set signer
    Tezos.setProvider({
        signer: await signer_1.InMemorySigner.fromSecretKey("edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU"),
    });
    // const senderAddress = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";
    const signerBob = new signer_1.InMemorySigner("edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU"); // bob private key
    // const signerAddress = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";
    try {
        console.log("Attempt mint #4 in ghostnet");
        // INPUTS
        const functioncall_contract = "KT1C3T9RuGHTyj9bPJxHhtzq7ZqtA7J2pKEb"; //"KT1AoU1mrLRSM2zouUVkvLz2UHo1on4UAFBF";
        const functioncall_name = "%mint_gated";
        const functioncall_params = {
            owner: "tz2SrmyZjTj8Z1SxU4X2rp2PgadreRLtLHMC",
            token_id: "4",
        };
        const dataKey = "edpkvGfYw3LyB1UcCahKQk4rF2tvbMUk8GFiTuMjL75uGXrpvKXhjn"; //"edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat";
        const expiration = "6915205";
        const nonce = "0";
        const userAddress = "tz2SrmyZjTj8Z1SxU4X2rp2PgadreRLtLHMC"; //"tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";
        const chain_id = "NetXnHfVqm9iesp";
        const signature = "edsigtePm3YRCAgaiBvYu2xsGNazM3TBCQiMK71XW8J9n38cMCfJbDdzs7QyyDa4pb6YLfnXn4AR5y8HjcerUKSpbJw5V7fht1j";
        // Prepare arguments
        const functioncall_params_bytes = (0, convert_1.convert_mint)(functioncall_params.owner, functioncall_params.token_id);
        const payload_hash = compute_payload_hash_for_mint(chain_id, userAddress, functioncall_contract, functioncall_name, functioncall_params.owner, functioncall_params.token_id, nonce, expiration, dataKey);
        // Bob signs Hash of payload
        // let signature_full = await signerBob.sign(payload_hash);
        // let signature = signature_full.prefixSig;
        // CALL contract
        const args = {
            // payload: payload_hash,
            // chain_id: chain_id,
            userAddress: userAddress,
            // nonce: nonce,
            expirationBlock: expiration,
            contractAddress: functioncall_contract,
            // functionName: functioncall_name,
            functionArgs: functioncall_params_bytes,
            signerPublicKey: dataKey,
            signature: signature,
        };
        const cntr = await Tezos.contract.at(ExtendedGatedNFTMinter_tezos_ghostnet_dev_1.ExtendedGatedNFTMinterAddress_tezos_ghostnet_dev);
        const op = await cntr.methodsObject.mint_gated(args).send();
        console.log(`Waiting for Exec_gated_calldata on ${ExtendedGatedNFTMinter_tezos_ghostnet_dev_1.ExtendedGatedNFTMinterAddress_tezos_ghostnet_dev} to be confirmed...`);
        await op.confirmation(2);
        console.log("tx confirmed: ", op.hash);
    }
    catch (error) {
        console.log(error);
    }
}
main();
