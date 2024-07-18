import { expect } from "chai";
import { deployNFTMinter } from "../fixtures/fixtureExampleNFTMinter";
import { InMemorySigner } from "@taquito/signer";
import {
  MichelsonMap,
  TezosToolkit,
  TezosOperationError,
} from "@taquito/taquito";
import {
  convert_timestamp,
  convert_key,
  convert_nat,
  convert_string,
  convert_address,
  convert_chain_id,
  convert_mint,
} from "../utils/convert";
import {
  EdSignature,
  TezosTxAuthData,
  TezosTxCalldata,
} from "../utils/schemas";
import { buildTxCallData } from "../utils/buildTxCallData";
import { computePayloadHash } from "../utils/computePayloadHash";

const RPC_ENDPOINT = "http://localhost:8732/";

const Tezos = new TezosToolkit(RPC_ENDPOINT);
import { RpcClient } from "@taquito/rpc";
const client = new RpcClient(RPC_ENDPOINT); //, 'NetXnofnLBXBoxo');

import {
  NEXERAID_SIGNER_SK,
  DEPLOYER_SK,
  DEPLOYER_PKH,
  USER_1_PKH,
} from "./testAddresses";

const nexeraSigner = new InMemorySigner(NEXERAID_SIGNER_SK); // signer private key

describe(`ExampleGatedNFTMinter`, function () {
  let exampleGatedNFTMinter: string | undefined;
  let deployerAddress: string;
  let currentBlock: number;
  let currentChainId: string;
  let nexeraSignerPublicKey: string;

  before(async () => {
    // SET SIGNER
    deployerAddress = DEPLOYER_PKH;
    Tezos.setProvider({
      signer: await InMemorySigner.fromSecretKey(DEPLOYER_SK),
    });
    // Retrieve Signer public key
    nexeraSignerPublicKey = await nexeraSigner.publicKey();
    // Retrieve the chainID
    currentChainId = await client.getChainId();
    // DEPLOY NFTMINTER
    exampleGatedNFTMinter = await deployNFTMinter(Tezos);
    if (!exampleGatedNFTMinter)
      throw new Error("Deployment of NftMnter failed");
  });

  beforeEach(async () => {
    const block = await client.getBlockHeader();
    currentBlock = block.level;
  });

  it(`Check initial storage (the deployer is the admin of NftMinter and owns the asset #0)`, async () => {
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");
    const storage: any = await cntr.storage();
    // Verify
    const admin = await storage.extension.admin;
    const ownerAsset0 = await storage.ledger.get(0);
    const ownerAsset1 = await storage.ledger.get(1);
    const ownerAsset2 = await storage.ledger.get(2);
    const ownerAsset3 = await storage.ledger.get(3);
    expect(deployerAddress === admin).to.be.true;
    expect(ownerAsset0 === deployerAddress).to.be.true;
    expect(ownerAsset1).to.be.undefined;
    expect(ownerAsset2).to.be.undefined;
    expect(ownerAsset3).to.be.undefined;
  });

  it(`Should mint the asset #1`, async () => {
    // Get contract
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    // MINT OFFCHAIN
    const functionCallContractAddress = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: USER_1_PKH,
      token_id: "1",
    };
    // Prepare Hash of payload
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PKH,
      nonce: 0,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContractAddress,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);
    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxCallData(
      payloadToSign,
      signature.prefixSig
    );
    // CALL CONTRACT (exec_gated_calldata entrypoint)
    const op = await cntr.methodsObject.exec_gated_calldata(args).send();
    console.log(
      `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
    );
    await op.confirmation(2);
    console.log("tx confirmed: ", op.hash);

    // VERIFY
    const storage: any = await cntr.storage();
    const admin = await storage.extension.admin;
    const ownerAsset0 = await storage.ledger.get(0);
    const ownerAsset1 = await storage.ledger.get(1);
    expect(deployerAddress === admin).to.be.true;
    expect(ownerAsset0 === deployerAddress).to.be.true;
    expect(ownerAsset1 === functionCallArgs.owner).to.be.true;
    const userNonce = await storage.extension.nonces.get(
      functionCallArgs.owner
    );
    expect(userNonce.toNumber() === 1).to.be.true;
  });

  it(`Attempt to replay mint #1 should fail`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    // MINT OFFCHAIN
    const functionCallContractAddress = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: USER_1_PKH,
      token_id: "1",
    };
    // Prepare Hash of payload
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PKH,
      nonce: 0,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContractAddress,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);
    // Execute exec_gated_calldata entrypoint
    const args: TezosTxCalldata = buildTxCallData(
      payloadToSign,
      signature.prefixSig
    );
    try {
      const op = await cntr.methodsObject.exec_gated_calldata(args).send();
      expect(false).to.be.true;
      console.log(
        `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
      );
      await op.confirmation(2);
      console.log("tx confirmed: ", op.hash);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        expect(err.message).to.be.equal("InvalidSignature");
      } else {
        expect(false).to.be.true;
      }
    }
  });

  it(`Should fail when providing an unmatching calldata (arguments)`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    // MINT OFFCHAIN
    const functionCallContractAddress = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: USER_1_PKH,
      token_id: "1",
    };
    // Provide a different calldata arguments
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const functionCallArgsBytesInvalid = convert_mint(
      functionCallArgs.owner,
      "2"
    );
    // Prepare Hash of payload
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PKH,
      nonce: 0,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContractAddress,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);

    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxCallData(
      payloadToSign,
      signature.prefixSig
    );
    args.functionArgs = functionCallArgsBytesInvalid;
    try {
      const op = await cntr.methodsObject.exec_gated_calldata(args).send();
      expect(false).to.be.true;
      console.log(
        `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
      );
      await op.confirmation(2);
      console.log("tx confirmed: ", op.hash);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        expect(err.message).to.be.equal("InvalidSignature");
      } else {
        expect(false).to.be.true;
      }
    }
  });

  it(`Should fail when providing an incorrect expiration`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    // MINT OFFCHAIN
    const functionCallContractAddress = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: USER_1_PKH,
      token_id: "2",
    };
    // Provide a different calldata arguments
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    // Prepare Hash of payload
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PKH,
      nonce: 0,
      blockExpiration: 1,
      contractAddress: functionCallContractAddress,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);

    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxCallData(
      payloadToSign,
      signature.prefixSig
    );
    try {
      const op = await cntr.methodsObject.exec_gated_calldata(args).send();
      expect(false).to.be.true;
      console.log("op: ", op);
      console.log(
        `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
      );
      await op.confirmation(2);
      console.log("tx confirmed: ", op.hash);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        expect(err.message).to.be.equal("BlockExpired");
      } else {
        expect(false).to.be.true;
      }
    }
  });

  it(`Should fail when providing an incorrect signature`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");
    // MINT OFFCHAIN
    const functionCallContractAddress = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: USER_1_PKH,
      token_id: "2",
    };
    // Provide a different calldata arguments
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    // Prepare Hash of payload
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PKH,
      nonce: 1,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContractAddress,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    // let signature = await nexeraSigner.sign(payloadHash);
    let signature_raw =
      "edsigtcjNvuDj6sfUL9u3Ma4Up3zfiZiPM2gzwDC3Vk1324SJzaGTbVwtdmdJ5q9UbD9qnKm9jdzytFqjSSt54oLY61XuB2mSW5";

    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxCallData(payloadToSign, signature_raw);
    try {
      const op = await cntr.methodsObject.exec_gated_calldata(args).send();
      expect(false).to.be.true;
      console.log("op: ", op);
      console.log(
        `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
      );
      await op.confirmation(2);
      console.log("tx confirmed: ", op.hash);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        expect(err.message).to.be.equal("InvalidSignature");
      } else {
        expect(false).to.be.true;
      }
    }
  });

  it(`Should fail when providing an incorrect calldata (entrypoint)`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    // MINT OFFCHAIN
    const functionCallContractAddress = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: USER_1_PKH,
      token_id: "2",
    };
    // Provide a different calldata arguments
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    // Prepare Hash of payload
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PKH,
      nonce: 1,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContractAddress,
      functionCallName: "%foobar", // DOES NOT EXIST
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);

    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxCallData(
      payloadToSign,
      signature.prefixSig
    );
    try {
      const op = await cntr.methodsObject.exec_gated_calldata(args).send();
      console.log("op: ", op);
      expect(false).to.be.true;
      console.log(
        `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
      );
      await op.confirmation(2);
      console.log("tx confirmed: ", op.hash);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        if (err instanceof TezosOperationError) {
          expect(err.message).to.be.equal("UnknownEntrypoint");
        } else {
          expect(false).to.be.true;
        }
      }
    }
  });

  it(`Should fail when providing an incorrect calldata (target contract)`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    // MINT OFFCHAIN
    const functionCallContractAddressInvalid =
      "KT1HUduHHW7mLAdkefzRuMhEFjdomuDNDskk"; // wrong address
    const functionCallArgs = {
      owner: USER_1_PKH,
      token_id: "2",
    };
    // Provide a different calldata arguments
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    // Prepare Hash of payload
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PKH,
      nonce: 1,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContractAddressInvalid,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);

    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxCallData(
      payloadToSign,
      signature.prefixSig
    );
    try {
      const op = await cntr.methodsObject.exec_gated_calldata(args).send();
      expect(false).to.be.true;
      console.log(
        `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
      );
      await op.confirmation(2);
      console.log("tx confirmed: ", op.hash);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        if (err instanceof TezosOperationError) {
          expect(err.message).to.be.equal("InvalidContract");
        } else {
          expect(false).to.be.true;
        }
      }
    }
  });
});
