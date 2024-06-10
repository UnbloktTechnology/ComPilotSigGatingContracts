"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signTxAuthDataLibTezos = exports.signTxAuthDataTezos = exports.getBlockLevel = exports.getNonceFromContract = exports.getChainID = void 0;
const convert_1 = require("./convert");
// import createKeccakHash from "keccak";
const createKeccakHash = require("keccak");
function keccak256(data) {
    return createKeccakHash("keccak256").update(data, "hex").digest("hex");
}
const getChainID = async (client) => {
    const currentChainId = await client.getChainId();
    return String(currentChainId);
};
exports.getChainID = getChainID;
const getNonceFromContract = async (contractAddress, userAddress, provider) => {
    const cntr = await provider.contract.at(contractAddress);
    const storage = await cntr.storage();
    const user_nonce = await storage.nonces.get(userAddress);
    return String(user_nonce);
};
exports.getNonceFromContract = getNonceFromContract;
const getBlockLevel = async (client) => {
    const block = await client.getBlockHeader();
    return Number(block.level);
};
exports.getBlockLevel = getBlockLevel;
const signTxAuthDataTezos = async (signer, tezosTxAuthData) => {
    // Build a TezosTxAuthData from TezosTxAuthInput and retrieved contextual param (nonce, expiration, chainID, public key of the signer)
    const chain_id_bytes = (0, convert_1.convert_chain_id)(tezosTxAuthData.chainID);
    const user_bytes = (0, convert_1.convert_address)(tezosTxAuthData.userAddress);
    const nonce_bytes = (0, convert_1.convert_nat)(tezosTxAuthData.nonce);
    const expiration_bytes = (0, convert_1.convert_nat)(tezosTxAuthData.blockExpiration);
    const functioncall_contract_bytes = (0, convert_1.convert_address)(tezosTxAuthData.contractAddress);
    const functioncall_name_bytes = (0, convert_1.convert_string)(tezosTxAuthData.functionCallName);
    const functioncall_params_bytes = tezosTxAuthData.functionCallArgs; //convert_mint(functioncall_params.owner, functioncall_params.token_id);
    const key_bytes = (0, convert_1.convert_key)(tezosTxAuthData.publicKey);
    const payload = key_bytes +
        chain_id_bytes +
        user_bytes +
        nonce_bytes +
        expiration_bytes +
        functioncall_contract_bytes +
        functioncall_name_bytes +
        functioncall_params_bytes;
    const payload_hash = keccak256(payload);
    // SIGN
    let signature = await signer.sign(payload_hash);
    return signature;
};
exports.signTxAuthDataTezos = signTxAuthDataTezos;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                  signTxAuthDataLibTezos                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// The signTxAuthDataLibTezos function takes a signer and a txAuthInput as parameters.
// It retrieves chainID, nonce from the provider and retrieves public key of the signer from given signer.
// It computes an expiration (current block level + 50).
// It construct a TxAuthData from the TxAuthInput and retrieved previous contextual parameters.
// The TxAuthData is hashed and then signed by the given signer
// The signTxAuthDataLibTezos function return the signature and the expiration
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// USAGE (FOR TESTING GHOSNET)
// const RPC_ENDPOINT = "https://ghostnet.tezos.marigold.dev";
// const client = new RpcClient(RPC_ENDPOINT);
// const Tezos = new TezosToolkit(RPC_ENDPOINT);
// // const senderAddress = "tz1...";
// Tezos.setProvider({
//   signer: await InMemorySigner.fromSecretKey(
//   "edsk...."
//   ),
// });
// const signer =  await InMemorySigner.fromSecretKey("edsk....");
// const tezosTxAuthInput = {
//   contractAddress: "KT1...", //ExtendedGatedNFTMinterAddress_tezos_ghostnet_dev,
//   functionName: "%mint_gated",
//   args: convert_mint("tz1...", "1"),
//   userAddress: "tz1...",
// }:
// const {signature, blockExpiration} = await signTxAuthDataLibTezos(signer, tezosTxAuthInput);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const signTxAuthDataLibTezos = async (signer, tezosTxAuthInput, provider, client) => {
    // const signer = new InMemorySigner("edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU");
    // const signerAddress = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";
    // INPUTS
    // const userAddress = "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";
    // const functioncall_contract = "KT1TRPRBqSR6GsCKc9ozxF7uJuX4gtPFwHxe";
    // const functioncall_name = "%mint_gated";
    // const functioncall_params = {
    //   owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
    //   token_id: "1"
    // };
    // const dataKey = "edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat";
    // const expiration = "12345";
    // const nonce = "0";
    // const chain_id = "NetXnHfVqm9iesp";
    // display public key
    const signerPublicKey = await signer.publicKey();
    console.log("signerPublicKey=", signerPublicKey);
    // Retrieve Nonce from contract storage
    const nonce = await (0, exports.getNonceFromContract)(tezosTxAuthInput.contractAddress, tezosTxAuthInput.userAddress, provider);
    // Retrieve CHAIN_ID from Rpc client
    const chain_id = await (0, exports.getChainID)(client);
    // Retrieve from Rpc client
    const block_level = await (0, exports.getBlockLevel)(client);
    const expiration_num = block_level + 50;
    const expiration = expiration_num.toString();
    const txAuthData = {
        chainID: chain_id,
        userAddress: tezosTxAuthInput.userAddress,
        nonce: nonce,
        blockExpiration: expiration,
        contractAddress: tezosTxAuthInput.contractAddress,
        functionCallName: tezosTxAuthInput.functionName,
        functionCallArgs: tezosTxAuthInput.args,
        publicKey: signerPublicKey,
    };
    const signature = await (0, exports.signTxAuthDataTezos)(signer, txAuthData);
    return {
        signature: signature.prefixSig,
        blockExpiration: expiration_num,
    };
};
exports.signTxAuthDataLibTezos = signTxAuthDataLibTezos;
