import { expect } from "chai";
import { deployNFTMinter } from "../fixtures/fixtureExampleNFTMinter";
import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { convert_timestamp, convert_key, convert_nat, convert_string, convert_address, convert_mint } from '../convert';

const RPC_ENDPOINT = "http://localhost:20000/";

const Tezos = new TezosToolkit(RPC_ENDPOINT);
const createKeccakHash = require('keccak')

function keccak256(data : string) {
    return createKeccakHash('keccak256').update(data, 'hex').digest('hex')
  }

function compute_payload_hash_for_mint  (userAddress: string, 
                                functioncall_contract: string,          
                                functioncall_name: string,              // "%mint-offchain"
                                functioncall_params_owner: string,      // mint arg 1
                                functioncall_params_token_id: string,   // mint arg 2
                                nonce: string,
                                exp_date: string,
                                dataKey: string
                            ) {
    const user_bytes = convert_address(userAddress);
    const functioncall_contract_bytes = convert_address(functioncall_contract);
    const functioncall_name_bytes = convert_string(functioncall_name);
    const functioncall_params_bytes = convert_mint(functioncall_params_owner, functioncall_params_token_id);
    const nonce_bytes = convert_nat(nonce);
    const exp_date_bytes = convert_timestamp(exp_date);
    const key_bytes = convert_key(dataKey);
    const payload = key_bytes + user_bytes + nonce_bytes + exp_date_bytes + functioncall_contract_bytes + functioncall_name_bytes + functioncall_params_bytes;
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

describe(`ExampleGatedNFTMinter`, function () {
    let exampleGatedNFTMinter: string | undefined;
    let deployerAddress: string;
  
    before(async () => {
    // beforeEach(async () => {
        // SET SIGNER
        deployerAddress = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
        Tezos.setProvider({
            signer: await InMemorySigner.fromSecretKey(
            "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq"
            ),
        });
        
        // DEPLOY NFTMINTER
        exampleGatedNFTMinter = await deployNFTMinter();
    });
    it(`Check initial storage (the deployer is the admin of NftMinter and owns the asset #0)`, async () => {
        const cntr = await Tezos.contract.at(exampleGatedNFTMinter?exampleGatedNFTMinter:"");
        const storage : any = await cntr.storage();
        // Verify
        const admin = await storage.extension.admin;
        const asset0_owner = await storage.ledger.get(0);
        const asset1_owner = await storage.ledger.get(1);
        const asset2_owner = await storage.ledger.get(2);
        const asset3_owner = await storage.ledger.get(3);
        expect(deployerAddress === admin).to.be.true;    
        expect(asset0_owner === deployerAddress).to.be.true;
        expect(asset1_owner).to.be.undefined;
        expect(asset2_owner).to.be.undefined;
        expect(asset3_owner).to.be.undefined;
    });

    it(`Should mint the asset #1`, async () => {
        // Get contract storage
        const cntr = await Tezos.contract.at(exampleGatedNFTMinter?exampleGatedNFTMinter:"");

        // MINT OFFCHAIN
        const signerBob = new InMemorySigner("edsk3RFfvaFaxbHx8BMtEW1rKQcPtDML3LXjNqMNLCzC3wLC1bWbAt"); // bob private key
        const functioncall_contract = exampleGatedNFTMinter?exampleGatedNFTMinter:""; 
        const functioncall_name = "%mint_offchain";
        const functioncall_params = {
            owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
            token_id: "1"
        };
        const dataKey = "edpkurPsQ8eUApnLUJ9ZPDvu98E8VNj4KtJa1aZr16Cr5ow5VHKnz4"; // bob public key
        const exp_date = "2025-01-01T00:00:00.00Z";
        const nonce = "0";
        const userAddress = "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";

        // Prepare Hash of payload
        const functioncall_params_bytes = convert_mint(functioncall_params.owner, functioncall_params.token_id);
        const payload_hash = compute_payload_hash_for_mint(
            userAddress,
            functioncall_contract,
            functioncall_name,
            functioncall_params.owner,
            functioncall_params.token_id,
            nonce,
            exp_date,
            dataKey);
        // Bob signs Hash of payload
        let signature = await signerBob.sign(payload_hash);
        // console.log("sig=", signature);
        // Execute mint-offchain entrypoint
        const args = {
        payload: payload_hash, 
        userAddress: userAddress, 
        nonce: nonce, 
        expiration: exp_date, 
        contractAddress: functioncall_contract, 
        name: functioncall_name, 
        args: functioncall_params_bytes, 
        publicKey: dataKey, 
        signature: signature.prefixSig
        };
        // CALL contract
        const op = await cntr.methodsObject.exec_offchain(args).send();
        console.log(`Waiting for Exec_offchain on ${exampleGatedNFTMinter} to be confirmed...`);
        await op.confirmation(2);
        console.log("tx confirmed: ", op.hash);

        // VERIFY
        const storage : any = await cntr.storage();
        const admin = await storage.extension.admin;
        const asset0_owner = await storage.ledger.get(0);
        const asset1_owner = await storage.ledger.get(1);
        // const asset2_owner = await storage.ledger.get(2);
        // const asset3_owner = await storage.ledger.get(3);
        expect(deployerAddress === admin).to.be.true;    
        expect(asset0_owner === deployerAddress).to.be.true;
        expect(asset1_owner === functioncall_params.owner).to.be.true;

        const user_nonce = await storage.extension.nonces.get(functioncall_params.owner);
        // console.log("user_nonce=", user_nonce);
        expect(user_nonce.toNumber() === 1).to.be.true;


    });

    it(`Attempt to replay mint #1 should fail`, async () => {
        // Get contract storage
        const cntr = await Tezos.contract.at(exampleGatedNFTMinter?exampleGatedNFTMinter:"");

        // MINT OFFCHAIN
        const signerBob = new InMemorySigner("edsk3RFfvaFaxbHx8BMtEW1rKQcPtDML3LXjNqMNLCzC3wLC1bWbAt"); // bob private key
        const functioncall_contract = exampleGatedNFTMinter?exampleGatedNFTMinter:""; 
        const functioncall_name = "%mint_offchain";
        const functioncall_params = {
            owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
            token_id: "1"
        };
        const dataKey = "edpkurPsQ8eUApnLUJ9ZPDvu98E8VNj4KtJa1aZr16Cr5ow5VHKnz4"; // bob public key
        const exp_date = "2025-01-01T00:00:00.00Z";
        const nonce = "0";
        const userAddress = "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF";

        // Prepare Hash of payload
        const functioncall_params_bytes = convert_mint(functioncall_params.owner, functioncall_params.token_id);
        const payload_hash = compute_payload_hash_for_mint(
            userAddress,
            functioncall_contract,
            functioncall_name,
            functioncall_params.owner,
            functioncall_params.token_id,
            nonce,
            exp_date,
            dataKey);
        // Bob signs Hash of payload
        let signature = await signerBob.sign(payload_hash);
        // console.log("sig=", signature);
        // Execute mint-offchain entrypoint
        const args = {
        payload: payload_hash, 
        userAddress: userAddress, 
        nonce: nonce, 
        expiration: exp_date, 
        contractAddress: functioncall_contract, 
        name: functioncall_name, 
        args: functioncall_params_bytes, 
        publicKey: dataKey, 
        signature: signature.prefixSig
        };
        try {
            const op = await cntr.methodsObject.exec_offchain(args).send();
            console.log(`Waiting for Exec_offchain on ${exampleGatedNFTMinter} to be confirmed...`);
            await op.confirmation(2);
            console.log("tx confirmed: ", op.hash);
        } catch (err) {
            expect(err === "InvalidNonce")
        }

    });

})