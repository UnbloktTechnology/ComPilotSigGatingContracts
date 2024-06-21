"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signTxAuthDataLibTezos = exports.signTezosTxAuthData = exports.getBlockLevel = exports.getNonceFromContract = exports.getChainID = void 0;
const computePayloadHash_1 = require("./computePayloadHash");
const getChainID = async (provider) => {
    const currentChainId = await provider.rpc.getChainId();
    return String(currentChainId);
};
exports.getChainID = getChainID;
const getNonceFromContract = async (contractAddress, userAddress, provider) => {
    const cntr = await provider.contract.at(contractAddress);
    const storage = await cntr.storage();
    const userNonce = await storage.nonces.get(userAddress);
    return userNonce ? Number(userNonce) : Number(0);
};
exports.getNonceFromContract = getNonceFromContract;
const getBlockLevel = async (provider) => {
    const block = await provider.rpc.getBlockHeader();
    return Number(block.level);
};
exports.getBlockLevel = getBlockLevel;
const signTezosTxAuthData = async (signer, tezosTxAuthData) => {
    const payload_hash = await (0, computePayloadHash_1.computePayloadHash)(tezosTxAuthData);
    let signature = await signer.sign(payload_hash);
    return signature;
};
exports.signTezosTxAuthData = signTezosTxAuthData;
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
// const Tezos = new TezosToolkit(RPC_ENDPOINT);
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
// const {signature, blockExpiration} = await signTxAuthDataLibTezos(signer, tezosTxAuthInput, Tezos);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const signTxAuthDataLibTezos = async (signer, tezosTxAuthInput, provider) => {
    // Retrieve signer public key
    const signerPublicKey = await signer.publicKey();
    // Retrieve Nonce from contract storage
    const nonce = await (0, exports.getNonceFromContract)(tezosTxAuthInput.contractAddress, tezosTxAuthInput.userAddress, provider);
    // Retrieve CHAIN_ID from Rpc client
    const chain_id = await (0, exports.getChainID)(provider);
    // Retrieve BLOCK LEVEL from Rpc client
    const block_level = await (0, exports.getBlockLevel)(provider);
    const expiration_num = block_level + 50; //TODO: replace hardcoded value
    const expiration = expiration_num;
    const txAuthData = {
        chainID: chain_id,
        userAddress: tezosTxAuthInput.userAddress,
        nonce: nonce,
        blockExpiration: expiration,
        contractAddress: tezosTxAuthInput.contractAddress,
        functionCallName: tezosTxAuthInput.functionName,
        functionCallArgs: tezosTxAuthInput.args,
        signerPublicKey: signerPublicKey,
    };
    const signature = await (0, exports.signTezosTxAuthData)(signer, txAuthData);
    return {
        signature: signature.prefixSig,
        blockExpiration: expiration_num,
    };
};
exports.signTxAuthDataLibTezos = signTxAuthDataLibTezos;
