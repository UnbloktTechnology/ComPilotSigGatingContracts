import { expect } from "chai";
import { deployNFTMinterExt } from "../fixtures/fixtureExtendedGatedNftMinter";
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

const RPC_ENDPOINT = "http://localhost:20000/";

const Tezos = new TezosToolkit(RPC_ENDPOINT);
import { RpcClient } from "@taquito/rpc";
const client = new RpcClient(RPC_ENDPOINT); //, 'NetXnofnLBXBoxo');

const nexeraSigner = new InMemorySigner(
  "edsk3RFfvaFaxbHx8BMtEW1rKQcPtDML3LXjNqMNLCzC3wLC1bWbAt"
); // signer private key

const createKeccakHash = require("keccak");

function keccak256(data: string) {
  return createKeccakHash("keccak256").update(data, "hex").digest("hex");
}

function computePayloadHash(payload: TezosTxAuthData) {
  const nonce_string = payload.nonce.toString();
  const expiration_string = payload.blockExpiration.toString();

  const chain_id_bytes = convert_chain_id(payload.chainID);
  const user_bytes = convert_address(payload.userAddress);
  const functioncall_contract_bytes = convert_address(payload.contractAddress);
  const functioncall_name_bytes = convert_string(payload.functionCallName);
  const functionCallArgsBytes = payload.functionCallArgs;
  const nonce_bytes = convert_nat(nonce_string);
  const expiration_bytes = convert_nat(expiration_string);
  const key_bytes = convert_key(payload.signerPublicKey);
  const payload_bytes =
    key_bytes +
    chain_id_bytes +
    user_bytes +
    nonce_bytes +
    expiration_bytes +
    functioncall_contract_bytes +
    functioncall_name_bytes +
    functionCallArgsBytes;
  const payload_hash = keccak256(payload_bytes);
  return payload_hash;
}

function buildTxInputFromTxAuthData(
  payload: TezosTxAuthData,
  signature: EdSignature
) {
  const ttai: TezosTxCalldata = {
    userAddress: payload.userAddress,
    expirationBlock: payload.blockExpiration,
    contractAddress: payload.contractAddress,
    functionName: payload.functionCallName,
    functionArgs: payload.functionCallArgs,
    signerPublicKey: payload.signerPublicKey,
    signature: signature,
  };
  return ttai;
}

describe(`ExtendedGatedNftMinter`, function () {
  let exampleGatedNFTMinter: string | undefined;
  let deployerAddress: string;
  let currentBlock: number;
  let currentChainId: string;
  let nexeraSignerPublicKey: string;

  before(async () => {
    // SET SIGNER
    deployerAddress = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
    Tezos.setProvider({
      signer: await InMemorySigner.fromSecretKey(
        "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq"
      ),
    });
    // Retrieve Signer public key
    nexeraSignerPublicKey = await nexeraSigner.publicKey();
    // Retrieve the chainID
    currentChainId = await client.getChainId();
    // DEPLOY NFTMINTER
    exampleGatedNFTMinter = await deployNFTMinterExt(Tezos);
  });

  beforeEach(async () => {
    const block = await client.getBlockHeader();
    currentBlock = block.level;
  });

  it(`Check initial storage (the deployer is the admin of NftMinter and owns the asset #0)`, async () => {
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );
    const storage: any = await cntr.storage();
    // Verify
    const admin = await storage.admin;
    const asset0_owner = await storage.siggated_extension.ledger.get(0);
    const asset1_owner = await storage.siggated_extension.ledger.get(1);
    const asset2_owner = await storage.siggated_extension.ledger.get(2);
    const asset3_owner = await storage.siggated_extension.ledger.get(3);
    expect(deployerAddress === admin).to.be.true;
    expect(asset0_owner === deployerAddress).to.be.true;
    expect(asset1_owner).to.be.undefined;
    expect(asset2_owner).to.be.undefined;
    expect(asset3_owner).to.be.undefined;
  });

  it(`Should mint the asset #1`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      token_id: "1",
    };
    // Prepare Hash of payload
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      nonce: 0,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContract,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);
    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxInputFromTxAuthData(
      payloadToSign,
      signature.prefixSig
    );
    // CALL contract
    const op = await cntr.methodsObject.exec_gated_calldata(args).send();
    console.log(
      `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
    );
    await op.confirmation(2);
    console.log("tx confirmed: ", op.hash);

    // VERIFY
    const storage: any = await cntr.storage();
    const admin = await storage.admin;
    const asset0_owner = await storage.siggated_extension.ledger.get(0);
    const asset1_owner = await storage.siggated_extension.ledger.get(1);
    // const asset2_owner = await storage.ledger.get(2);
    // const asset3_owner = await storage.ledger.get(3);
    expect(deployerAddress === admin).to.be.true;
    expect(asset0_owner === deployerAddress).to.be.true;
    expect(asset1_owner === functionCallArgs.owner).to.be.true;
    const user_nonce = await storage.nonces.get(functionCallArgs.owner);
    expect(user_nonce.toNumber() === 1).to.be.true;
  });

  it(`Attempt to replay mint #1 should fail`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      token_id: "1",
    };

    // Prepare Hash of payload
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      nonce: 0,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContract,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);
    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxInputFromTxAuthData(
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
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
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
      userAddress: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      nonce: 0,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContract,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);

    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxInputFromTxAuthData(
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
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
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
      userAddress: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      nonce: 1,
      blockExpiration: 1,
      contractAddress: functionCallContract,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);
    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxInputFromTxAuthData(
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
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
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
      userAddress: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      nonce: 1,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContract,
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
    const args: TezosTxCalldata = buildTxInputFromTxAuthData(
      payloadToSign,
      signature_raw
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
        expect(err.message).to.be.equal("InvalidSignature");
      } else {
        expect(false).to.be.true;
      }
    }
  });

  it(`Should fail when providing an incorrect calldata (entrypoint)`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";

    const functionCallArgs = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
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
      userAddress: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      nonce: 1,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContract,
      functionCallName: "%foobar",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);
    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxInputFromTxAuthData(
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
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );

    // MINT OFFCHAIN
    const functionCallContract = "KT1HUduHHW7mLAdkefzRuMhEFjdomuDNDskk"; // wrong address
    const functionCallArgs = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
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
      userAddress: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      nonce: 1,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContract,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);
    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxInputFromTxAuthData(
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
        if (err instanceof TezosOperationError) {
          expect(err.message).to.be.equal("MissingDispatchEntrypoint");
        } else {
          expect(false).to.be.true;
        }
      }
    }
  });

  it(`Should mint the asset #2`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      token_id: "2",
    };
    // Prepare Hash of payload
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      nonce: 1,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContract,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);
    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxInputFromTxAuthData(
      payloadToSign,
      signature.prefixSig
    );
    // CALL contract
    const op = await cntr.methodsObject
      .exec_gated_calldata_no_dispatch2(args)
      .send();
    console.log(
      `Waiting for exec_gated_calldata_no_dispatch2 on ${exampleGatedNFTMinter} to be confirmed...`
    );
    await op.confirmation(2);
    console.log("tx confirmed: ", op.hash);

    // VERIFY
    const storage: any = await cntr.storage();
    const admin = await storage.admin;
    const asset0_owner = await storage.siggated_extension.ledger.get(0);
    const asset1_owner = await storage.siggated_extension.ledger.get(1);
    const asset2_owner = await storage.siggated_extension.ledger.get(2);
    // const asset3_owner = await storage.ledger.get(3);
    expect(deployerAddress === admin).to.be.true;
    expect(asset0_owner === deployerAddress).to.be.true;
    expect(asset1_owner === functionCallArgs.owner).to.be.true;
    expect(asset2_owner === functionCallArgs.owner).to.be.true;

    const user_nonce = await storage.nonces.get(functionCallArgs.owner);
    // console.log("user_nonce=", user_nonce);
    expect(user_nonce.toNumber() === 2).to.be.true;
  });

  it(`Estimate mint the asset #3`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      token_id: "3",
    };
    // Prepare Hash of payload
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      nonce: 2,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContract,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);
    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxInputFromTxAuthData(
      payloadToSign,
      signature.prefixSig
    );
    let pre_op_1 = await cntr.methodsObject.exec_gated_calldata(args);
    let est_1 = await Tezos.estimate.contractCall(pre_op_1);
    console.log("extimation exec_gated_calldata=", est_1.totalCost);

    let pre_op_2 = await cntr.methodsObject.exec_gated_calldata_no_dispatch(
      args
    );
    let est_2 = await Tezos.estimate.contractCall(pre_op_2);
    console.log("extimation exec_gated_calldata_no_dispatch=", est_2.totalCost);

    let pre_op_3 = await cntr.methodsObject.exec_gated_calldata_no_dispatch2(
      args
    );
    let est_3 = await Tezos.estimate.contractCall(pre_op_3);
    console.log(
      "extimation exec_gated_calldata_no_dispatch2=",
      est_3.totalCost
    );
  });

  it(`Should mint the asset #3`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      token_id: "3",
    };
    // Prepare Hash of payload
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      nonce: 2,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContract,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);
    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxInputFromTxAuthData(
      payloadToSign,
      signature.prefixSig
    );
    // CALL contract
    const op = await cntr.methodsObject
      .exec_gated_calldata_no_dispatch2(args)
      .send();
    console.log(
      `Waiting for exec_gated_calldata_no_dispatch2 on ${exampleGatedNFTMinter} to be confirmed...`
    );
    await op.confirmation(2);
    console.log("tx confirmed: ", op.hash);

    // VERIFY
    const storage: any = await cntr.storage();
    const admin = await storage.admin;
    const asset0_owner = await storage.siggated_extension.ledger.get(0);
    const asset1_owner = await storage.siggated_extension.ledger.get(1);
    const asset2_owner = await storage.siggated_extension.ledger.get(2);
    const asset3_owner = await storage.siggated_extension.ledger.get(3);
    expect(deployerAddress === admin).to.be.true;
    expect(asset0_owner === deployerAddress).to.be.true;
    expect(asset1_owner === functionCallArgs.owner).to.be.true;
    expect(asset2_owner === functionCallArgs.owner).to.be.true;
    expect(asset3_owner === functionCallArgs.owner).to.be.true;

    const user_nonce = await storage.nonces.get(functionCallArgs.owner);
    expect(user_nonce.toNumber() === 3).to.be.true;
  });
});
